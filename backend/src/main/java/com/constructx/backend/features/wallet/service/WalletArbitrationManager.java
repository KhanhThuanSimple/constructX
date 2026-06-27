package com.constructx.backend.features.wallet.service;

import com.constructx.backend.features.wallet.entity.Transaction;
import com.constructx.backend.features.wallet.entity.Wallet;
import com.constructx.backend.features.wallet.repository.TransactionRepository;
import com.constructx.backend.features.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class WalletArbitrationManager {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final WalletCoreManager walletCoreManager;

    /**
     * PHÂN XỬ TRANH CHẤP DỰ ÁN HOÀN TIỀN THEO TỶ LỆ PHẦN TRĂM (HỖ TRỢ NHIỀU GIAI ĐOẠN)
     */
    @Transactional
    public void resolveProjectDispute(
            Long lockTransactionId, 
            Long constructorId, 
            double userPercent, 
            double constructorPercent, 
            String projectCode,
            Long customerRemainingEscrow,
            Long contractorLockedEscrow
    ) {
        if (userPercent + constructorPercent != 100.0) {
            throw new IllegalArgumentException("Tổng tỷ lệ phân chia cho hai bên phải bằng 100%");
        }

        Transaction lockTransaction = transactionRepository.findById(lockTransactionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch đóng băng của dự án"));

        Wallet userWallet = lockTransaction.getWallet();
        Wallet constructorWallet = walletRepository.findByUserId(constructorId)
                .orElseThrow(() -> new RuntimeException("Ví của nhà thầu không tồn tại"));

        // Quỹ Tranh Chấp Thực Tế (D_pool = customerRemainingEscrow + contractorLockedEscrow)
        long disputePool = customerRemainingEscrow + contractorLockedEscrow;

        // Tính toán tài chính bằng BigDecimal
        BigDecimal totalFund = BigDecimal.valueOf(disputePool);
        BigDecimal userRate = BigDecimal.valueOf(userPercent).divide(BigDecimal.valueOf(100.0));

        Long userRefundShare = totalFund.multiply(userRate).setScale(0, RoundingMode.HALF_UP).longValue();
        Long constructorRevenueShare = disputePool - userRefundShare; // Triệt tiêu sai số 1 đồng lẻ

        // Thực thi phân bổ dòng tiền nhiều giai đoạn
        walletCoreManager.executeMultiStageDisputeRefundDistribution(
                userWallet, constructorWallet, customerRemainingEscrow, contractorLockedEscrow, userRefundShare, constructorRevenueShare, projectCode
        );

        // Đóng trạng thái hóa đơn khóa gốc
        lockTransaction.setStatus(Transaction.Status.FAILED);
        lockTransaction.setDescription(lockTransaction.getDescription() +
                String.format(" | [Hội đồng giải quyết tranh chấp nhiều giai đoạn] Quỹ tranh chấp: %d. Hoàn trả User %s%% (%d), Trả Constructor %s%% (%d)", 
                        disputePool, userPercent, userRefundShare, constructorPercent, constructorRevenueShare));
        transactionRepository.save(lockTransaction);
    }
}