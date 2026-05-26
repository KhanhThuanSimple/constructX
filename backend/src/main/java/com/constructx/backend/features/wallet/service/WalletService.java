package com.constructx.backend.features.wallet.service;

import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.user.repository.UserRepository;
import com.constructx.backend.features.wallet.entity.Transaction;
import com.constructx.backend.features.wallet.entity.Wallet;
import com.constructx.backend.features.wallet.entity.UserToken;
import com.constructx.backend.features.wallet.repository.TransactionRepository;
import com.constructx.backend.features.wallet.repository.WalletRepository;
import com.constructx.backend.features.wallet.repository.UserTokenRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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

    public Wallet getWalletByUserId(Long userId) {
        return walletRepository.findByUserId(userId).orElseThrow(() -> new RuntimeException("Ví không tồn tại"));
    }

    public List<Transaction> getTransactionHistory(Long walletId) {
        return transactionRepository.findByWalletIdOrderByCreatedAtDesc(walletId);
    }

    /**
     * BƯỚC 1: KHỞI TẠO NẠP TIỀN - Chỉ tạo log PENDING, tuyệt đối chưa tăng số dư ví
     */
    @Transactional
    public String createPaymentUrl(String email, Long amount, String gatewayName, HttpServletRequest request) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Wallet wallet = walletRepository.findByUserId(user.getId())
                .orElseGet(() -> walletRepository.save(Wallet.builder().user(user).balance(0L).lockedAmount(0L).build()));

        String orderId = new java.text.SimpleDateFormat("yyyyMMddHHmmss").format(new java.util.Date())
                + String.format("%06d", new java.util.Random().nextInt(1000000));

        Transaction transaction = Transaction.builder()
                .wallet(wallet)
                .amount(amount)
                .type(Transaction.Type.DEPOSIT)
                .status(Transaction.Status.PENDING)
                .paymentGateway(gatewayName.toUpperCase())
                .gatewayOrderId(orderId)
                .description("Yêu cầu nạp tiền hệ thống ConstructX")
                .createdAt(LocalDateTime.now())
                .build();
        transactionRepository.save(transaction);

        PaymentGatewayStrategy gateway = paymentGatewayFactory.getGateway(gatewayName);
        return gateway.createPaymentUrl(orderId, amount, "Nap tien ConstructX", request);
    }

    /**
     * BƯỚC 2: NHẬN PHẢN HỒI TỪ VNPAY (IPN) TRƯỚC -> TIẾN HÀNH CẬP NHẬT SỐ DƯ VÍ SAU
     */
    @Transactional
    public Map<String, String> processIPN(String gatewayName, Map<String, String> params) {
        PaymentGatewayStrategy gateway = paymentGatewayFactory.getGateway(gatewayName);
        if (!gateway.verifySignature(params)) {
            log.error("[IPN SECURITY ERROR] Chữ ký phản hồi không hợp lệ!");
            return Map.of("RspCode", "97", "Message", "Sai chu ky bao mat");
        }

        String orderId = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        String gatewayTransId = params.get("vnp_TransactionNo");

        // Đối soát thông tin giao dịch PENDING gốc
        Transaction transaction = transactionRepository.findByGatewayOrderId(orderId).orElse(null);
        if (transaction == null) return Map.of("RspCode", "01", "Message", "Giao dich khong ton tai");

        // Chống xử lý trùng lặp (Idempotency)
        if (transaction.getStatus() != Transaction.Status.PENDING) {
            return Map.of("RspCode", "02", "Message", "Giao dich da duoc xu ly");
        }

        Long vnpAmount = Long.parseLong(params.get("vnp_Amount")) / 100;
        if (!vnpAmount.equals(transaction.getAmount())) {
            return Map.of("RspCode", "04", "Message", "So tien khong hop le");
        }

        // Kiểm tra mã phản hồi thành công từ VNPay
        if ("00".equals(responseCode)) {
            // Chuyển giao cho Core thực thi tăng tiền và chuyển đổi trạng thái sang SUCCESS đồng bộ
            walletCoreManager.executeConfirmDepositSuccess(transaction, gatewayTransId, "Nạp tiền thành công qua " + gatewayName);

            String vnpToken = params.get("vnp_Token");
            if (vnpToken != null && !vnpToken.isEmpty()) {
                saveUserToken(transaction.getWallet().getUser(), vnpToken, params);
            }
            return Map.of("RspCode", "00", "Message", "Xử lý thành công");
        } else {
            // VNPay phản hồi lỗi (Hủy giao dịch / Thất bại)
            walletCoreManager.executeConfirmDepositFailed(transaction, gatewayTransId, responseCode);
            return Map.of("RspCode", "00", "Message", "Đã ghi nhận giao dịch thất bại");
        }
    }

    /**
     * USER: Logic tính toán phức tạp khóa tiền đặt hàng
     */
    @Transactional
    public void lockMoneyForOrder(String email, Long orderBasePrice, Long shippingFee, Long voucherDiscount, String orderCode) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Wallet wallet = getWalletByUserId(user.getId());

        // LOGIC TÍNH TOÁN PHỨC TẠP TẠI TẦNG SERVICE
        Long finalOrderAmount = orderBasePrice + shippingFee - voucherDiscount;
        if (finalOrderAmount <= 0L) finalOrderAmount = 0L;

        if (wallet.getAvailableBalance() < finalOrderAmount) {
            throw new RuntimeException("Số dư khả dụng trong ví không đủ để thanh toán.");
        }

        walletCoreManager.executeLockAmount(wallet, finalOrderAmount, Transaction.Type.LOCK, "CONSTRUCTX_SYSTEM", "Khóa tiền đơn hàng: " + orderCode);
    }

    /**
     * CONSTRUCTOR: Logic nhận doanh thu trừ chiết khấu sàn thương mại
     */
    @Transactional
    public void distributeProjectRevenue(Long constructorId, Long grossAmount, double commissionPercent, String projectCode) {
        Wallet wallet = walletRepository.findByUserId(constructorId)
                .orElseThrow(() -> new RuntimeException("Ví đối tác không tồn tại"));

        // LOGIC TÍNH TOÁN PHẦN TRĂM KHẤU TRỪ
        double deduction = grossAmount * (commissionPercent / 100.0);
        Long netRevenue = grossAmount - Math.round(deduction);

        // ĐÃ SỬA: Đảm bảo truyền đúng thứ tự 6 tham số:
        // 1. wallet (Wallet)
        // 2. netRevenue (Long)
        // 3. Transaction.Type.REVENUE (Enum Type)
        // 4. "CONSTRUCTX_SYSTEM" (String gateway)
        // 5. "REV-" + System.currentTimeMillis() (String gatewayOrderId)
        // 6. Mô tả (String description)
        walletCoreManager.executeDeposit(
                wallet,
                netRevenue,
                Transaction.Type.REVENUE,
                "CONSTRUCTX_SYSTEM",
                "REV-" + System.currentTimeMillis(),
                "Nhận doanh thu dự án " + projectCode + ". Phí sàn khấu trừ: " + commissionPercent + "%"
        );
    }
    /**
     * USER / CONSTRUCTOR: Khởi tạo yêu cầu rút tiền
     */
    @Transactional
    public void createWithdrawRequest(String email, Long amount, Map<String, String> bankAccountDetail) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Wallet wallet = walletRepository.findByUserId(user.getId()).orElseThrow(() -> new RuntimeException("Ví không tồn tại"));

        String bankInfoStr = String.format("Rút về NH: %s | STK: %s | Tên: %s",
                bankAccountDetail.get("bankName"), bankAccountDetail.get("accountNumber"), bankAccountDetail.get("accountName"));

        walletCoreManager.executeLockAmount(wallet, amount, Transaction.Type.WITHDRAW, "MANUAL_BANK_TRANSFER", bankInfoStr);
    }

    private void saveUserToken(User user, String vnpToken, Map<String, String> params) {
        if (userTokenRepository.findByVnpToken(vnpToken).isEmpty()) {
            UserToken token = UserToken.builder()
                    .user(user).vnpToken(vnpToken)
                    .vnpCardNumber(params.get("vnp_CardNumber")).vnpBankCode(params.get("vnp_BankCode"))
                    .createdAt(LocalDateTime.now()).build();
            userTokenRepository.save(token);
        }
    }
}