package com.constructx.backend.features.auth.controller;

import com.constructx.backend.features.auth.dto.request.LoginRequest;
import com.constructx.backend.features.auth.dto.request.RegisterRequest;
import com.constructx.backend.shared.dto.ApiResponse;
import com.constructx.backend.features.auth.dto.response.AuthResponse;
import com.constructx.backend.features.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(ApiResponse.ok("Đăng ký thành công", response));
        } catch (RuntimeException e) {
            log.warn("Register failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(ApiResponse.ok("Đăng nhập thành công", response));
        } catch (BadCredentialsException e) {
            log.warn("Login failed - bad credentials for: {}", request.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Email hoặc mật khẩu không chính xác"));
        } catch (DisabledException e) {
            log.warn("Login failed - account disabled for: {}", request.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Tài khoản đã bị vô hiệu hóa"));
        } catch (AuthenticationException e) {
            log.warn("Login failed - auth exception for {}: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Đăng nhập thất bại: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Login error for {}: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Lỗi hệ thống, vui lòng thử lại"));
        }
    }
}
