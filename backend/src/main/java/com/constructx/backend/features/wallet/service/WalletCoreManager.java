package com.constructx.backend.features.wallet.service;

import com.constructx.backend.features.wallet.entity.Wallet;
import com.constructx.backend.features.wallet.entity.Transaction;
import com.constructx.backend.features.wallet.repository.WalletRepository;
import com.constructx.backend.features.wallet.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class WalletCoreManager {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    /**
     * KHÓA TIỀN KHI USER TẠO YÊU CẦU RÚT TIỀN (Trạng thái chờ Admin duyệt - PENDING)
     * ĐỂ ĐỒNG BỘ: Tổng tài sản (balance) GIỮ NGUYÊN. Chỉ tăng lượng đóng băng (lockedAmount).
     * Số dư khả dụng (balance - lockedAmount) tự động giảm xuống chính xác.
     */
    @Transactional
    public void executeLockForWithdraw(Wallet wallet, Long amount, Transaction transaction) {
        // KHÔNG trừ balance ở đây để giữ nguyên tổng tài sản khi lệnh chưa thực sự chuyển đi
        wallet.setLockedAmount(wallet.getLockedAmount() + amount);
        walletRepository.save(wallet);

        transaction.setStatus(Transaction.Status.PENDING);
        transactionRepository.save(transaction);
    }

    /**
     * KHÓA TIỀN TỰ ĐỘNG CHO ĐƠN HÀNG (Trạng thái SUCCESS ngay lập tức)
     * Tương tự rút tiền: Giữ nguyên balance tổng, tăng lockedAmount để cô lập số tiền giao dịch.
     */
    @Transactional
    public void executeLockForOrder(Wallet wallet, Long amount, Transaction.Type type, String gateway, String orderCode) {
        wallet.setLockedAmount(wallet.getLockedAmount() + amount);
        walletRepository.save(wallet);

        Transaction transaction = Transaction.builder()
                .wallet(wallet)
                .amount(amount)
                .type(type)
                .status(Transaction.Status.SUCCESS)
                .paymentGateway(gateway)
                .gatewayOrderId("LOCK-" + orderCode)
                .description("Khóa tiền đơn hàng: " + orderCode)
                .createdAt(LocalDateTime.now())
                .build();
        transactionRepository.save(transaction);
    }

    /**
     * CỘNG TIỀN DOANH THU HOẶC NẠP TIỀN
     * Tăng trực tiếp vào tổng tài sản balance. Lượng tiền này khả dụng ngay lập tức.
     */
    @Transactional
    public void executeDeposit(Wallet wallet, Long amount, Transaction.Type type, String gateway, String gatewayOrderId, String description) {
        wallet.setBalance(wallet.getBalance() + amount);
        walletRepository.save(wallet);

        Transaction transaction = Transaction.builder()
                .wallet(wallet)
                .amount(amount)
                .type(type)
                .status(Transaction.Status.SUCCESS)
                .paymentGateway(gateway)
                .gatewayOrderId(gatewayOrderId)
                .description(description)
                .createdAt(LocalDateTime.now())
                .build();
        transactionRepository.save(transaction);
    }

    /**
     * XỬ LÝ DUYỆT RÚT TIỀN THÀNH CÔNG (Trừ hẳn tiền trong kho đóng băng)
     * Lúc này tiền thực sự rời khỏi hệ thống: Trừ cả balance tổng và lockedAmount.
     */
    @Transactional
    public void confirmDebitLocked(Transaction transaction, String note) {
        Wallet wallet = transaction.getWallet();

        wallet.setBalance(wallet.getBalance() - transaction.getAmount());
        wallet.setLockedAmount(wallet.getLockedAmount() - transaction.getAmount());
        walletRepository.save(wallet);

        transaction.setStatus(Transaction.Status.SUCCESS);
        transaction.setDescription(transaction.getDescription() + " | Admin duyệt: " + note);
        transactionRepository.save(transaction);
    }

    /**
     * XỬ LÝ TỪ CHỐI RÚT TIỀN / HỦY ĐƠN HÀNG (Hoàn trả lại tiền về số dư khả dụng)
     * Trả tự do cho dòng tiền: Chỉ cần trừ lockedAmount. balance tổng giữ nguyên không đổi.
     */
    @Transactional
    public void executeUnlockAmount(Transaction transaction, String rejectReason) {
        Wallet wallet = transaction.getWallet();

        // Chỉ xả băng, số dư khả dụng (balance - lockedAmount) sẽ tăng ngược lại đúng bằng số tiền xả
        wallet.setLockedAmount(wallet.getLockedAmount() - transaction.getAmount());
        walletRepository.save(wallet);

        transaction.setStatus(Transaction.Status.FAILED);
        transaction.setDescription(transaction.getDescription() + " | Từ chối do: " + rejectReason);
        transactionRepository.save(transaction);
    }

    /**
     * VNPAY NẠP TIỀN THÀNH CÔNG
     * Tiền nạp trực tiếp vào tài khoản -> Tăng số dư tổng balance.
     */
    @Transactional
    public void executeConfirmDepositSuccess(Transaction transaction, String gatewayTransId, String description) {
        Wallet wallet = transaction.getWallet();
        wallet.setBalance(wallet.getBalance() + transaction.getAmount());
        walletRepository.save(wallet);

        transaction.setStatus(Transaction.Status.SUCCESS);
        transaction.setGatewayOrderId(gatewayTransId);
        transaction.setDescription(description);
        transactionRepository.save(transaction);
    }

    /**
     * VNPAY NẠP TIỀN THẤT BẠI
     * Không phát sinh biến động số dư.
     */
    @Transactional
    public void executeConfirmDepositFailed(Transaction transaction, String gatewayTransId, String responseCode) {
        transaction.setStatus(Transaction.Status.FAILED);
        transaction.setDescription("Giao dịch thất bại. Mã lỗi cổng thanh toán: " + responseCode);
        transactionRepository.save(transaction);
    }

    /**
     * GHI AUDIT LOG TRANSACTION (không thay đổi số dư — chỉ lưu record)
     * Dùng khi balance đã được cập nhật thủ công trước đó.
     */
    @Transactional
    public void recordTransaction(Wallet wallet, Long amount, Transaction.Type type,
                                   String gateway, String orderId, String description) {
        Transaction transaction = Transaction.builder()
                .wallet(wallet)
                .amount(amount)
                .type(type)
                .status(Transaction.Status.SUCCESS)
                .paymentGateway(gateway)
                .gatewayOrderId(orderId)
                .description(description)
                .createdAt(LocalDateTime.now())
                .build();
        transactionRepository.save(transaction);
    }

    /**
     * PHÂN CHIA TIỀN TRANH CHẤP THEO PHẦN TRĂM GIỮA NGƯỜI DÙNG VÀ NHÀ THẦU
     */
    @Transactional
    public void executeDisputeRefundDistribution(
            Wallet userWallet, Wallet constructorWallet,
            Long totalLockedAmount, Long userRefundShare, Long constructorRevenueShare,
            String projectCode) {

        // 1. Giải phóng quỹ đóng băng của User trước
        userWallet.setLockedAmount(userWallet.getLockedAmount() - totalLockedAmount);

        // 2. Tính toán lại tài sản thực tế của User dựa trên số tiền được hoàn trả
        // Vì quỹ đóng băng mất đi totalLockedAmount, nên tổng tài sản (balance) phải trừ đi phần tiền bị mất (phần chia cho constructor)
        Long userLossAmount = totalLockedAmount - userRefundShare;
        userWallet.setBalance(userWallet.getBalance() - userLossAmount);
        walletRepository.save(userWallet);

        // 3. Đối tác (Constructor) nhận phần doanh thu phân chia -> Cộng thẳng vào balance tổng
        constructorWallet.setBalance(constructorWallet.getBalance() + constructorRevenueShare);
        walletRepository.save(constructorWallet);

        Transaction userTrans = Transaction.builder()
                .wallet(userWallet).amount(userRefundShare).type(Transaction.Type.RELEASE).status(Transaction.Status.SUCCESS)
                .paymentGateway("CONSTRUCTX_ARBITRATION").gatewayOrderId("DISP-USER-" + projectCode)
                .description("Nhận tiền hoàn trả từ phân xử tranh chấp dự án: " + projectCode).createdAt(LocalDateTime.now()).build();
        transactionRepository.save(userTrans);

        Transaction constructorTrans = Transaction.builder()
                .wallet(constructorWallet).amount(constructorRevenueShare).type(Transaction.Type.REVENUE).status(Transaction.Status.SUCCESS)
                .paymentGateway("CONSTRUCTX_ARBITRATION").gatewayOrderId("DISP-CONS-" + projectCode)
                .description("Nhận thanh toán một phần từ phân xử tranh chấp dự án: " + projectCode).createdAt(LocalDateTime.now()).build();
        transactionRepository.save(constructorTrans);
    }
}