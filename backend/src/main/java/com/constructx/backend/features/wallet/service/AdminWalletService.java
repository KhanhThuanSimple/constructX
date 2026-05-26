package com.constructx.backend.features.wallet.service;

import com.constructx.backend.features.wallet.entity.Transaction;
import com.constructx.backend.features.wallet.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminWalletService {

    private final TransactionRepository transactionRepository;
    private final WalletCoreManager walletCoreManager;

    @Transactional
    public void approveWithdrawRequest(Long transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lệnh giao dịch cần phê duyệt"));

        // ĐÃ SỬA: Chốt chặn Idempotency phòng trường hợp Admin bấm duyệt trùng lặp
        if (transaction.getStatus() != Transaction.Status.PENDING) {
            throw new RuntimeException("Giao dịch này đã được xử lý trước đó rồi.");
        }

        if (transaction.getType() != Transaction.Type.WITHDRAW) {
            throw new RuntimeException("Loại giao dịch không hợp lệ để phê duyệt rút tiền");
        }
        walletCoreManager.confirmDebitLocked(transaction, "Phê duyệt rút tiền hoàn tất bởi Admin.");
    }

    @Transactional
    public void rejectWithdrawRequest(Long transactionId, String reason) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lệnh giao dịch"));

        // ĐÃ SỬA: Chốt chặn Idempotency tương tự luồng hủy
        if (transaction.getStatus() != Transaction.Status.PENDING) {
            throw new RuntimeException("Giao dịch này đã được xử lý trước đó rồi.");
        }

        if (transaction.getType() != Transaction.Type.WITHDRAW) {
            throw new RuntimeException("Loại giao dịch không hợp lệ");
        }
        walletCoreManager.executeUnlockAmount(transaction, reason);
    }
}