package com.constructx.backend.features.wallet.service;

import com.constructx.backend.features.wallet.entity.Transaction;
import com.constructx.backend.features.wallet.entity.PlatformWallet;
import com.constructx.backend.features.wallet.entity.PlatformTransaction;
import com.constructx.backend.features.wallet.repository.TransactionRepository;
import com.constructx.backend.features.wallet.repository.PlatformWalletRepository;
import com.constructx.backend.features.wallet.repository.PlatformTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminWalletService {

    private final TransactionRepository transactionRepository;
    private final WalletCoreManager walletCoreManager;
    private final PlatformWalletRepository platformWalletRepository;
    private final PlatformTransactionRepository platformTransactionRepository;

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

    @Transactional
    public PlatformWallet getOrCreatePlatformWallet() {
        return platformWalletRepository.findById(1L)
                .orElseGet(() -> platformWalletRepository.save(PlatformWallet.builder().id(1L).balance(0L).build()));
    }

    public List<PlatformTransaction> getPlatformTransactions() {
        return platformTransactionRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public PlatformWallet withdrawPlatformWallet(Long amount, String description) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Số tiền rút phải lớn hơn 0");
        }
        
        PlatformWallet wallet = getOrCreatePlatformWallet();
        if (wallet.getBalance() < amount) {
            throw new RuntimeException("Số dư ví nền tảng không đủ để thực hiện rút tiền (Yêu cầu: " + amount + ", Hiện tại: " + wallet.getBalance() + ")");
        }
        
        // Trừ tiền trong ví nền tảng
        wallet.setBalance(wallet.getBalance() - amount);
        PlatformWallet updatedWallet = platformWalletRepository.save(wallet);
        
        // Ghi nhận giao dịch rút tiền nền tảng
        platformTransactionRepository.save(PlatformTransaction.builder()
                .amount(amount)
                .type(PlatformTransaction.Type.WITHDRAW)
                .referenceId("WITHDRAW-" + System.currentTimeMillis())
                .description(description != null && !description.trim().isEmpty() ? description : "Admin rút tiền lợi tức khỏi hệ thống")
                .build());
                
        return updatedWallet;
    }
}