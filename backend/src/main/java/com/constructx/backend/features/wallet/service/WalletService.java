package com.constructx.backend.features.wallet.service;

import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.user.repository.UserRepository;
import com.constructx.backend.features.wallet.entity.Transaction;
import com.constructx.backend.features.wallet.entity.Wallet;
import com.constructx.backend.features.wallet.entity.UserToken;
import com.constructx.backend.features.wallet.repository.TransactionRepository;
import com.constructx.backend.features.wallet.repository.WalletRepository;
import com.constructx.backend.admin.service.FeatureFlagService;
import com.constructx.backend.features.wallet.repository.UserTokenRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class WalletService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final UserTokenRepository userTokenRepository;
    private final WalletCoreManager walletCoreManager;
    private final PaymentGatewayFactory paymentGatewayFactory;
    private final FeatureFlagService featureFlagService;

    public Wallet getWalletByUserId(Long userId) {
        return walletRepository.findByUserId(userId).orElseThrow(() -> new RuntimeException("Ví không tồn tại"));
    }

    public List<Transaction> getTransactionHistory(Long walletId) {
        return transactionRepository.findByWalletIdOrderByCreatedAtDesc(walletId);
    }

    @Transactional
    public String createPaymentUrl(String email, Long amount, String gatewayName, HttpServletRequest request) {
        // Kiểm tra feature flag VNPay trước khi xử lý
        if ("VNPAY".equalsIgnoreCase(gatewayName) && !featureFlagService.isVnpayEnabled()) {
            throw new RuntimeException("Thanh toán VNPay hiện tạm thời bị tắt bởi Admin. Vui lòng thử lại sau.");
        }
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Wallet wallet = walletRepository.findByUserId(user.getId())
                .orElseGet(() -> walletRepository.save(Wallet.builder().user(user).balance(0L).lockedAmount(0L).build()));

        String orderId = new java.text.SimpleDateFormat("yyyyMMddHHmmss").format(new java.util.Date())
                + String.format("%06d", new java.util.Random().nextInt(1000000));

        Transaction transaction = Transaction.builder()
                .wallet(wallet).amount(amount).type(Transaction.Type.DEPOSIT).status(Transaction.Status.PENDING)
                .paymentGateway(gatewayName.toUpperCase()).gatewayOrderId(orderId)
                .description("Yêu cầu nạp tiền hệ thống ConstructX").createdAt(LocalDateTime.now()).build();
        transactionRepository.save(transaction);

        PaymentGatewayStrategy gateway = paymentGatewayFactory.getGateway(gatewayName);
        return gateway.createPaymentUrl(orderId, amount, "Nap tien ConstructX", request);
    }

    @Transactional
    public Map<String, String> processIPN(String gatewayName, Map<String, String> params) {
        PaymentGatewayStrategy gateway = paymentGatewayFactory.getGateway(gatewayName);
        if (!gateway.verifySignature(params)) {
            return Map.of("RspCode", "97", "Message", "Sai chu ky bao mat");
        }

        String orderId = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        String gatewayTransId = params.get("vnp_TransactionNo");

        Transaction transaction = transactionRepository.findByGatewayOrderId(orderId).orElse(null);
        if (transaction == null) return Map.of("RspCode", "01", "Message", "Giao dich khong ton tai");
        if (transaction.getStatus() != Transaction.Status.PENDING) {
            return Map.of("RspCode", "02", "Message", "Giao dich da duoc xu ly");
        }

        Long vnpAmount = Long.parseLong(params.get("vnp_Amount")) / 100;
        if (!vnpAmount.equals(transaction.getAmount())) {
            return Map.of("RspCode", "04", "Message", "So tien khong hop le");
        }

        if ("00".equals(responseCode)) {
            walletCoreManager.executeConfirmDepositSuccess(transaction, gatewayTransId, "Nạp tiền thành công qua " + gatewayName);
            return Map.of("RspCode", "00", "Message", "Xử lý thành công");
        } else {
            walletCoreManager.executeConfirmDepositFailed(transaction, gatewayTransId, responseCode);
            return Map.of("RspCode", "00", "Message", "Đã ghi nhận giao dịch thất bại");
        }
    }

    @Transactional
    public void lockMoneyForOrder(String email, Long orderBasePrice, Long shippingFee, Long voucherDiscount, String orderCode) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Wallet wallet = walletRepository.findByUserIdForUpdate(user.getId()).orElseThrow(() -> new RuntimeException("Ví không tồn tại"));

        Long finalOrderAmount = orderBasePrice + shippingFee - voucherDiscount;
        if (finalOrderAmount <= 0L) finalOrderAmount = 0L;

        if (wallet.getAvailableBalance() < finalOrderAmount) {
            throw new RuntimeException("Số dư khả dụng trong ví không đủ để thanh toán.");
        }

        walletCoreManager.executeLockForOrder(wallet, finalOrderAmount, Transaction.Type.LOCK, "CONSTRUCTX_SYSTEM", orderCode);
    }

    /**
     * ĐÃ SỬA: Luồng rút tiền bắt giữ lại tối thiểu 50.000đ đóng băng đồng bộ
     */
    @Transactional
    public void createWithdrawRequest(String email, Long amount, Map<String, String> bankAccountDetail) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Wallet wallet = walletRepository.findByUserIdForUpdate(user.getId()).orElseThrow(() -> new RuntimeException("Ví không tồn tại"));

        long minimumKeep = 50000L;
        if (wallet.getAvailableBalance() < (amount + minimumKeep)) {
            throw new RuntimeException("Không thể thực hiện. Tài khoản cần giữ lại tối thiểu 50.000đ để duy trì ví.");
        }

        String bankInfoStr = String.format("Rút về NH: %s | STK: %s | Tên: %s", bankAccountDetail.get("bankName"), bankAccountDetail.get("accountNumber"), bankAccountDetail.get("accountName"));
        String withdrawOrderId = "WD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Transaction transaction = Transaction.builder()
                .wallet(wallet).amount(amount).type(Transaction.Type.WITHDRAW).status(Transaction.Status.PENDING)
                .paymentGateway("MANUAL_BANK_TRANSFER").gatewayOrderId(withdrawOrderId)
                .description(bankInfoStr).createdAt(LocalDateTime.now()).build();

        walletCoreManager.executeLockForWithdraw(wallet, amount, transaction);
    }

    @Transactional
    public void distributeProjectRevenue(Long constructorId, Long grossAmount, double commissionPercent, String projectCode) {
        Wallet wallet = walletRepository.findByUserId(constructorId).orElseThrow(() -> new RuntimeException("Ví đối tác không tồn tại"));

        BigDecimal gross = BigDecimal.valueOf(grossAmount);
        BigDecimal commissionRate = BigDecimal.valueOf(commissionPercent).divide(BigDecimal.valueOf(100.0));
        BigDecimal deduction = gross.multiply(commissionRate);
        Long netRevenue = gross.subtract(deduction).setScale(0, RoundingMode.HALF_UP).longValue();

        String uniqueRevId = "REV-" + projectCode + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        walletCoreManager.executeDeposit(wallet, netRevenue, Transaction.Type.REVENUE, "CONSTRUCTX_SYSTEM", uniqueRevId, "Nhận doanh thu dự án " + projectCode);
    }

    @Transactional
    public void handleAdminWithdrawalApproval(String gatewayOrderId, boolean isApproved, String note) {
        Transaction transaction = transactionRepository.findByGatewayOrderId(gatewayOrderId).orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu"));
        if (transaction.getStatus() != Transaction.Status.PENDING) {
            throw new RuntimeException("Giao dịch này đã được phê duyệt từ trước");
        }

        if (isApproved) {
            walletCoreManager.confirmDebitLocked(transaction, note);
        } else {
            walletCoreManager.executeUnlockAmount(transaction, note);
        }
    }
}