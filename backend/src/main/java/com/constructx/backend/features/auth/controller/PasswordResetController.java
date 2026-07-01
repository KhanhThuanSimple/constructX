package com.constructx.backend.features.auth.controller;

import com.constructx.backend.features.auth.dto.request.ForgotPasswordRequest;
import com.constructx.backend.features.auth.dto.request.ResetPasswordRequest;
import com.constructx.backend.features.auth.service.PasswordResetService;
import com.constructx.backend.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    /**
     * POST /api/auth/forgot-password
     * Bước 1: Yêu cầu đặt lại mật khẩu — gửi OTP qua email (hoặc trả về devToken khi chưa cấu hình SMTP).
     *
     * Body: { "email": "user@example.com" }
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Map<String, Object>>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        try {
            Map<String, Object> result = passwordResetService.requestPasswordReset(request.getEmail());
            return ResponseEntity.ok(ApiResponse.ok(
                    (String) result.get("message"), result));
        } catch (Exception e) {
            log.error("Forgot password error: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Không thể xử lý yêu cầu. Vui lòng thử lại."));
        }
    }

    /**
     * POST /api/auth/reset-password
     * Bước 2: Xác nhận OTP và đặt mật khẩu mới.
     *
     * Body: { "token": "123456", "newPassword": "newpass123" }
     */
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        try {
            passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok(ApiResponse.ok(
                    "Mật khẩu đã được đặt lại thành công! Vui lòng đăng nhập với mật khẩu mới.", null));
        } catch (RuntimeException e) {
            log.warn("Reset password failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
