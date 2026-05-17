package com.constructx.backend.controller;

import com.constructx.backend.dto.request.DepositRequest;
import com.constructx.backend.entity.User;
import com.constructx.backend.entity.Wallet;
import com.constructx.backend.repository.UserRepository;
import com.constructx.backend.service.WalletService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
@Slf4j
public class WalletController {

    private final WalletService walletService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getWallet(Authentication authentication) {
        try {
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            return ResponseEntity.ok(Map.of("data", walletService.getWalletByUserId(user.getId())));
        } catch (Exception e) {
            log.error("Error getting wallet", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/transactions")
    public ResponseEntity<?> getTransactions(Authentication authentication) {
        try {
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            Wallet wallet = walletService.getWalletByUserId(user.getId());
            return ResponseEntity.ok(Map.of("data", walletService.getTransactionHistory(wallet.getId())));
        } catch (Exception e) {
            log.error("Error getting transactions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/deposit/vnpay")
    public ResponseEntity<?> depositVNPay(@Valid @RequestBody DepositRequest request, 
                                        Authentication authentication,
                                        HttpServletRequest servletRequest) {
        try {
            String email = authentication.getName();
            Long amount = request.getAmount();
            
            String paymentUrl = walletService.createDepositUrl(email, amount, servletRequest);
            
            Map<String, Object> response = new HashMap<>();
            response.put("data", Map.of("paymentUrl", paymentUrl));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating deposit URL", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/deposit/vnpay-callback")
    public ResponseEntity<?> vnpayCallback(@RequestParam Map<String, String> params) {
        try {
            log.info("VNPay callback received with params: {}", params.keySet());
            walletService.processCallback(params);
            return ResponseEntity.ok(Map.of("message", "Thanh toán thành công. Bạn có thể quay lại trang Ví."));
        } catch (Exception e) {
            log.error("Error processing VNPay callback", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
