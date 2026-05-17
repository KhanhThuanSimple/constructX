package com.constructx.backend.service;

import com.constructx.backend.entity.Transaction;
import com.constructx.backend.entity.User;
import com.constructx.backend.entity.Wallet;
import com.constructx.backend.repository.TransactionRepository;
import com.constructx.backend.repository.UserRepository;
import com.constructx.backend.repository.WalletRepository;
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
    private final VNPayService vnPayService;

    public Wallet getWalletByUserId(Long userId) {
        return walletRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    Wallet wallet = new Wallet();
                    wallet.setUser(user);
                    wallet.setBalance(0L);
                    wallet.setLockedAmount(0L);
                    return walletRepository.save(wallet);
                });
    }

    public List<Transaction> getTransactionHistory(Long walletId) {
        return transactionRepository.findByWalletIdOrderByCreatedAtDesc(walletId);
    }

    @Transactional
    public String createDepositUrl(String email, Long amount, HttpServletRequest request) {
        if (amount == null || amount < 10000) {
            throw new RuntimeException("Số tiền tối thiểu là 10.000đ");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
        
        Wallet wallet = walletRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Wallet newWallet = new Wallet();
                    newWallet.setUser(user);
                    newWallet.setBalance(0L);
                    newWallet.setLockedAmount(0L);
                    return walletRepository.save(newWallet);
                });

        // Tạo orderId unique: timestamp (yyyyMMddHHmmss) + 6 số ngẫu nhiên
        // Đảm bảo không trùng và VNPay yêu cầu tối đa 100 ký tự
        String timestamp = new java.text.SimpleDateFormat("yyyyMMddHHmmss").format(new java.util.Date());
        String randomPart = String.format("%06d", new java.util.Random().nextInt(1000000));
        String orderId = timestamp + randomPart;
        String orderInfo = "Nap tien vi ConstructX";
        
        try {
            // Tạo link thanh toán VNPay
            String paymentUrl = vnPayService.createPaymentUrl(orderId, amount, orderInfo, request);

            // Lưu giao dịch chờ
            Transaction transaction = new Transaction();
            transaction.setWallet(wallet);
            transaction.setAmount(amount);
            transaction.setType(Transaction.Type.DEPOSIT);
            transaction.setStatus(Transaction.Status.PENDING);
            transaction.setPaymentGateway("VNPAY");
            transaction.setGatewayOrderId(orderId);
            transaction.setDescription(orderInfo);
            transaction.setCreatedAt(LocalDateTime.now());
            transactionRepository.save(transaction);

            log.info("Created deposit transaction: orderId={}, amount={}, userId={}", orderId, amount, user.getId());
            return paymentUrl;
        } catch (Exception e) {
            log.error("Error creating deposit URL", e);
            throw new RuntimeException("Lỗi tạo link thanh toán: " + e.getMessage());
        }
    }

    @Transactional
    public void processCallback(Map<String, String> params) {
        try {
            if (!vnPayService.verifySignature(params)) {
                log.warn("Invalid VNPay signature");
                throw new RuntimeException("Chữ ký VNPay không hợp lệ");
            }

            String orderId = params.get("vnp_TxnRef");
            String responseCode = params.get("vnp_ResponseCode");
            String transId = params.get("vnp_TransactionNo");

            log.info("Processing VNPay callback: orderId={}, responseCode={}, transId={}", orderId, responseCode, transId);

            Transaction transaction = transactionRepository.findByGatewayOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Giao dịch không tồn tại: " + orderId));

            if (!transaction.getStatus().equals(Transaction.Status.PENDING)) {
                log.warn("Transaction already processed: orderId={}, status={}", orderId, transaction.getStatus());
                return; // Đã xử lý
            }

            if ("00".equals(responseCode)) {
                // Kiểm tra số tiền (VNPay trả về vnp_Amount là số tiền * 100)
                Long vnpAmount = Long.parseLong(params.get("vnp_Amount")) / 100;
                if (!vnpAmount.equals(transaction.getAmount())) {
                    log.error("Amount mismatch: vnp_Amount={}, expected={}", vnpAmount, transaction.getAmount());
                    transaction.setStatus(Transaction.Status.FAILED);
                    transactionRepository.save(transaction);
                    throw new RuntimeException("Số tiền thanh toán không khớp với giao dịch");
                }

                transaction.setStatus(Transaction.Status.SUCCESS);
                transaction.setGatewayTransId(transId);
                transaction.setCompletedAt(LocalDateTime.now());

                Wallet wallet = transaction.getWallet();
                wallet.setBalance(wallet.getBalance() + transaction.getAmount());
                wallet.setUpdatedAt(LocalDateTime.now());
                walletRepository.save(wallet);
                
                log.info("Deposit successful: orderId={}, amount={}, newBalance={}", orderId, transaction.getAmount(), wallet.getBalance());
            } else {
                transaction.setStatus(Transaction.Status.FAILED);
                log.warn("Deposit failed: orderId={}, responseCode={}", orderId, responseCode);
            }
            
            transactionRepository.save(transaction);
        } catch (Exception e) {
            log.error("Error processing VNPay callback", e);
            throw new RuntimeException("Lỗi xử lý callback: " + e.getMessage());
        }
    }
}
