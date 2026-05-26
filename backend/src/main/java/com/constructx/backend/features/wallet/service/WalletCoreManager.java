package com.constructx.backend.features.wallet.service;

import com.constructx.backend.features.wallet.entity.Transaction;
import com.constructx.backend.features.wallet.entity.Wallet;
import com.constructx.backend.features.wallet.repository.TransactionRepository;
import com.constructx.backend.features.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class WalletCoreManager {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    /**
     * SỬA LỖI: Bổ sung hàm executeDeposit đa năng 6 tham số phục vụ chia doanh thu (REVENUE)
     */
    @Transactional(propagation = Propagation.MANDATORY)
    public void executeDeposit(Wallet wallet, Long amount, Transaction.Type type, String gateway, String orderId, String description) {
        int updatedRows = walletRepository.depositBalance(wallet.getId(), amount);
        if (updatedRows == 0) {
            throw new RuntimeException("Lỗi hệ thống: Không thể cập nhật tăng số dư tài khoản.");
        }

        Transaction transaction = Transaction.builder()
                .wallet(wallet)
                .amount(amount)
                .type(type)
                .status(Transaction.Status.SUCCESS)
                .paymentGateway(gateway)
                .gatewayOrderId(orderId)
                .description(description)
                .createdAt(LocalDateTime.now())
                .completedAt(LocalDateTime.now())
                .build();

        transactionRepository.save(transaction);
        log.info("[CORE] Cộng tiền thành công: {}đ vào Wallet ID: {} | Loại: {}", amount, wallet.getId(), type);
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void executeConfirmDepositSuccess(Transaction pendingTx, String gatewayTransId, String description) {
        int updatedRows = walletRepository.depositBalance(pendingTx.getWallet().getId(), pendingTx.getAmount());
        if (updatedRows == 0) {
            throw new RuntimeException("Lỗi hệ thống: Không thể cập nhật tăng số dư.");
        }

        pendingTx.setStatus(Transaction.Status.SUCCESS);
        pendingTx.setGatewayTransId(gatewayTransId);
        pendingTx.setDescription(description);
        pendingTx.setCompletedAt(LocalDateTime.now());
        transactionRepository.save(pendingTx);

        log.info("[CORE] Nạp tiền THÀNH CÔNG: {}đ vào Wallet ID: {}", pendingTx.getAmount(), pendingTx.getWallet().getId());
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void executeConfirmDepositFailed(Transaction pendingTx, String gatewayTransId, String responseCode) {
        pendingTx.setStatus(Transaction.Status.FAILED);
        pendingTx.setGatewayTransId(gatewayTransId); // Đồng bộ lưu mã cổng khi thất bại để tra soát
        pendingTx.setDescription("Thanh toán thất bại từ cổng. Mã lỗi: " + responseCode);
        pendingTx.setCompletedAt(LocalDateTime.now());
        transactionRepository.save(pendingTx);

        log.warn("[CORE] Giao dịch nạp tiền THẤT BẠI cho Transaction ID: {}", pendingTx.getId());
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public Transaction executeLockAmount(Wallet wallet, Long amount, Transaction.Type type, String gateway, String description) {
        int updatedRows = walletRepository.lockAmount(wallet.getId(), amount);
        if (updatedRows == 0) {
            throw new RuntimeException("Số dư khả dụng không đủ để thực hiện thao tác đóng băng.");
        }

        Transaction transaction = Transaction.builder()
                .wallet(wallet)
                .amount(amount)
                .type(type)
                .status(Transaction.Status.PENDING)
                .paymentGateway(gateway)
                .description(description)
                .createdAt(LocalDateTime.now())
                .build();

        return transactionRepository.save(transaction);
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void confirmDebitLocked(Transaction transaction, String updateDesc) {
        int updatedRows = walletRepository.debitLockedAmount(transaction.getWallet().getId(), transaction.getAmount());
        if (updatedRows == 0) {
            throw new RuntimeException("Lỗi hệ thống: Không thể trừ tiền đóng băng.");
        }

        transaction.setStatus(Transaction.Status.SUCCESS);
        transaction.setDescription(transaction.getDescription() + " | " + updateDesc);
        transaction.setCompletedAt(LocalDateTime.now());
        transactionRepository.save(transaction);
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void executeUnlockAmount(Transaction transaction, String rejectReason) {
        int updatedRows = walletRepository.unlockAmount(transaction.getWallet().getId(), transaction.getAmount());
        if (updatedRows == 0) {
            throw new RuntimeException("Lỗi hệ thống: Không thể giải băng số tiền.");
        }

        transaction.setStatus(Transaction.Status.CANCELLED);
        transaction.setDescription(transaction.getDescription() + " | Lý do hoàn trả: " + rejectReason);
        transaction.setCompletedAt(LocalDateTime.now());
        transactionRepository.save(transaction);
    }
}