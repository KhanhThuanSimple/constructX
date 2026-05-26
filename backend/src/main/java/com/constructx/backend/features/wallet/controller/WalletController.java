package com.constructx.backend.features.wallet.controller;

import com.constructx.backend.features.wallet.dto.DepositRequest;
import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.wallet.entity.Transaction;
import com.constructx.backend.features.wallet.entity.Wallet;
import com.constructx.backend.features.user.repository.UserRepository;
import com.constructx.backend.features.wallet.repository.TransactionRepository;
import com.constructx.backend.features.wallet.repository.UserTokenRepository;
import com.constructx.backend.features.wallet.service.WalletService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;
    private final UserRepository userRepository;
    private final UserTokenRepository userTokenRepository;
    private final TransactionRepository transactionRepository;

    @GetMapping
    public ResponseEntity<?> getWallet(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(Map.of("data", walletService.getWalletByUserId(user.getId())));
    }

    @GetMapping("/transactions")
    public ResponseEntity<?> getTransactions(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow(() -> new RuntimeException("User not found"));
        Wallet wallet = walletService.getWalletByUserId(user.getId());
        return ResponseEntity.ok(Map.of("data", walletService.getTransactionHistory(wallet.getId())));
    }

    @GetMapping("/saved-cards")
    public ResponseEntity<?> getSavedCards(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(Map.of("data", userTokenRepository.findByUserId(user.getId())));
    }

    @PostMapping("/deposit")
    public ResponseEntity<?> initDeposit(
            @Valid @RequestBody DepositRequest depositRequest,
            @RequestParam(defaultValue = "VNPAY") String gateway,
            Authentication authentication,
            HttpServletRequest request) {
        String paymentUrl = walletService.createPaymentUrl(authentication.getName(), depositRequest.getAmount(), gateway, request);
        return ResponseEntity.ok(Map.of("data", Map.of("paymentUrl", paymentUrl)));
    }

    @GetMapping("/deposit/vnpay-ipn")
    public ResponseEntity<?> handleVNPayIPN(@RequestParam Map<String, String> params) {
        return ResponseEntity.ok(walletService.processIPN("VNPAY", params));
    }

    @PostMapping("/lock-order")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> lockOrderMoney(@RequestBody Map<String, Object> payload, Authentication authentication) {
        Long basePrice = Long.parseLong(payload.get("orderBasePrice").toString());
        Long ship = Long.parseLong(payload.get("shippingFee").toString());
        Long discount = Long.parseLong(payload.get("voucherDiscount").toString());
        String code = payload.get("orderCode").toString();

        walletService.lockMoneyForOrder(authentication.getName(), basePrice, ship, discount, code);
        return ResponseEntity.ok(Map.of("success", true, "message", "Đóng băng ví mua hàng thành công"));
    }

    @PostMapping("/withdraw")
    @PreAuthorize("hasAnyRole('USER', 'CONSTRUCTOR')")
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> handleWithdrawRequest(@RequestBody Map<String, Object> payload, Authentication authentication) {
        Long amount = Long.parseLong(payload.get("amount").toString());
        Map<String, String> bankAccount = (Map<String, String>) payload.get("bankAccount");

        walletService.createWithdrawRequest(authentication.getName(), amount, bankAccount);
        return ResponseEntity.ok(Map.of("success", true, "message", "Tạo yêu cầu rút tiền thành công"));
    }

    @GetMapping("/transactions/status/{orderId}")
    public ResponseEntity<?> checkTransactionStatus(@PathVariable String orderId, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow(() -> new RuntimeException("User not found"));
        Transaction transaction = transactionRepository.findByGatewayOrderId(orderId).orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!transaction.getWallet().getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Unauthorized"));
        }
        return ResponseEntity.ok(Map.of("status", transaction.getStatus(), "amount", transaction.getAmount()));
    }
}