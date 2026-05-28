package com.constructx.backend.features.wallet.controller;

import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.user.repository.UserRepository;
import com.constructx.backend.features.wallet.dto.DepositRequest;
import com.constructx.backend.features.wallet.entity.Transaction;
import com.constructx.backend.features.wallet.entity.Wallet;
import com.constructx.backend.features.wallet.repository.TransactionRepository;
import com.constructx.backend.features.wallet.repository.UserTokenRepository;
import com.constructx.backend.features.wallet.service.WalletCoreManager;
import com.constructx.backend.features.wallet.service.WalletService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
@Slf4j
public class WalletController {

    private final WalletService walletService;
    private final UserRepository userRepository;
    private final UserTokenRepository userTokenRepository;
    private final TransactionRepository transactionRepository;
    private final WalletCoreManager walletCoreManager;

    @GetMapping
    public ResponseEntity<?> getWallet(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(Map.of("data", walletService.getWalletByUserId(user.getId())));
    }

    @GetMapping("/transactions")
    public ResponseEntity<?> getTransactions(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Wallet wallet = walletService.getWalletByUserId(user.getId());
        return ResponseEntity.ok(Map.of("data", walletService.getTransactionHistory(wallet.getId())));
    }

    @GetMapping("/saved-cards")
    public ResponseEntity<?> getSavedCards(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(Map.of("data", userTokenRepository.findByUserId(user.getId())));
    }

    @PostMapping("/deposit")
    public ResponseEntity<?> initDeposit(
            @Valid @RequestBody DepositRequest depositRequest,
            @RequestParam(defaultValue = "VNPAY") String gateway,
            Authentication authentication,
            HttpServletRequest request
    ) {
        String paymentUrl = walletService.createPaymentUrl(
                authentication.getName(),
                depositRequest.getAmount(),
                gateway,
                request
        );
        return ResponseEntity.ok(Map.of("data", Map.of("paymentUrl", paymentUrl)));
    }

    /**
     * ĐÃ SỬA: BỔ SUNG ENDPOINT XỬ LÝ RÚT TIỀN CHO USER & CONSTRUCTOR
     * Endpoint: POST /api/wallet/withdraw
     */
    @PostMapping("/withdraw")
    @PreAuthorize("hasAnyRole('USER','CONSTRUCTOR')")
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> handleWithdrawRequest(
            @RequestBody Map<String, Object> payload,
            Authentication authentication
    ) {
        log.info("[WITHDRAW REQUEST] Tiếp nhận xử lý yêu cầu rút tiền từ: {}", authentication.getName());
        try {
            // Ép kiểu an toàn từ dữ liệu JSON tránh lỗi sập 500 NumberFormatException
            Object amountObj = payload.get("amount");
            Long amount = 0L;
            if (amountObj instanceof Number) {
                amount = ((Number) amountObj).longValue();
            } else if (amountObj instanceof String) {
                amount = Long.parseLong((String) amountObj);
            }

            Map<String, String> bankAccount = (Map<String, String>) payload.get("bankAccount");

            if (bankAccount == null || bankAccount.get("bankName") == null || bankAccount.get("accountNumber") == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Thông tin tài khoản định danh ngân hàng không đầy đủ."));
            }

            walletService.createWithdrawRequest(authentication.getName(), amount, bankAccount);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Tạo yêu cầu rút tiền thành công! Khoản tiền đã được đóng băng chờ hệ thống phê duyệt."
            ));
        } catch (RuntimeException e) {
            log.error("[WITHDRAW ERROR] Lỗi nghiệp vụ rút tiền: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("[WITHDRAW CRASH] Lỗi hệ thống nghiêm trọng: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Lỗi xử lý hệ thống lõi cốt truyện."));
        }
    }

    @GetMapping("/transactions/status/{orderId}")
    public ResponseEntity<?> checkTransactionStatus(
            @PathVariable String orderId,
            Authentication authentication
    ) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Transaction transaction = transactionRepository.findByGatewayOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!transaction.getWallet().getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Unauthorized"));
        }

        return ResponseEntity.ok(Map.of(
                "status", transaction.getStatus(),
                "amount", transaction.getAmount()
        ));
    }

    @PostMapping("/verify-sandbox-dispute/{orderId}")
    @org.springframework.transaction.annotation.Transactional
    @PreAuthorize("hasAnyRole('USER', 'CONSTRUCTOR', 'ADMIN')")
    public ResponseEntity<?> verifySandboxDispute(
            @PathVariable String orderId,
            @RequestParam String responseCode) {
        log.info("[SANDBOX AUTOMATION] Tiếp nhận xử lý phản hồi mã: {} cho hóa đơn: {}", responseCode, orderId);

        Transaction transaction = transactionRepository.findByGatewayOrderId(orderId).orElse(null);
        if (transaction == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Giao dịch không tồn tại trên hệ thống"));
        }

        if (transaction.getStatus() != Transaction.Status.PENDING) {
            return ResponseEntity.ok(Map.of("status", transaction.getStatus().toString(), "message", "Giao dịch này đã được xử lý từ trước"));
        }

        if ("00".equals(responseCode)) {
            String fakeGatewayTransId = "SANDBOX-LOCAL-SUCCESS-" + System.currentTimeMillis();
            walletCoreManager.executeConfirmDepositSuccess(transaction, fakeGatewayTransId, "Nạp tiền thành công qua cổng kết nối VNPAY Sandbox");
            return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Cộng tiền tài khoản thành công!"));
        } else {
            log.warn("[SANDBOX AUTOMATION] Giao dịch nạp tiền lỗi/bị hủy (Mã: {}). Giữ trạng thái PENDING.", responseCode);
            transaction.setDescription("Nạp tiền không thành công (Mã lỗi cổng: " + responseCode + ") - Chờ xử lý lại.");
            transactionRepository.save(transaction);
            return ResponseEntity.ok(Map.of("status", "PENDING", "message", "Giao dịch thất bại. Hệ thống giữ trạng thái chờ xử lý."));
        }
    }
}