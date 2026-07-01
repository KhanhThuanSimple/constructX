package com.constructx.backend.features.auth.service;

import com.constructx.backend.features.auth.entity.PasswordResetToken;
import com.constructx.backend.features.auth.repository.PasswordResetTokenRepository;
import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;

@Service
@Slf4j
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * JavaMailSender là optional — inject bằng setter để không crash khi SMTP chưa cấu hình.
     */
    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.password-reset.token-expiry-minutes:15}")
    private int tokenExpiryMinutes;

    @Autowired
    public PasswordResetService(UserRepository userRepository,
                                 PasswordResetTokenRepository tokenRepository,
                                 PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Bước 1: Yêu cầu đặt lại mật khẩu.
     * Trả về Map chứa:
     *  - "message": thông báo gửi email
     *  - "devToken": token rõ (chỉ trả về khi SMTP chưa cấu hình — dùng cho demo/dev)
     */
    @Transactional
    public Map<String, Object> requestPasswordReset(String email) {
        // Luôn trả về success để tránh user enumeration attack
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElse(null);

        if (user == null) {
            log.info("Password reset requested for non-existent email: {}", email);
            return Map.of(
                "message", "Nếu email tồn tại trong hệ thống, mã OTP sẽ được gửi đến bạn.",
                "emailSent", false
            );
        }

        // Xoá token cũ
        tokenRepository.deleteByUserId(user.getId());

        // Tạo OTP 6 chữ số
        String otp = String.format("%06d", new Random().nextInt(1_000_000));

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(otp)
                .user(user)
                .expiresAt(LocalDateTime.now().plusMinutes(tokenExpiryMinutes))
                .used(false)
                .build();

        tokenRepository.save(resetToken);

        boolean emailSent = false;
        boolean mailConfigured = mailSender != null
                && mailUsername != null
                && !mailUsername.isBlank()
                && !mailUsername.equals("your_gmail@gmail.com");

        if (mailConfigured) {
            try {
                sendResetEmail(user.getEmail(), user.getFullName(), otp);
                emailSent = true;
                log.info("Password reset OTP sent to: {}", email);
            } catch (Exception e) {
                log.error("Failed to send password reset email to {}: {}", email, e.getMessage());
            }
        } else {
            log.info("[DEV MODE] Password reset OTP for {}: {}", email, otp);
        }

        if (emailSent) {
            return Map.of(
                "message", "Mã OTP đã được gửi đến " + maskEmail(email) + ". Hiệu lực trong " + tokenExpiryMinutes + " phút.",
                "emailSent", true
            );
        } else {
            // Trả token về response cho môi trường dev (khi chưa cấu hình SMTP)
            return Map.of(
                "message", "Hệ thống chưa cấu hình email. Mã OTP của bạn là: " + otp + " (hiệu lực " + tokenExpiryMinutes + " phút).",
                "emailSent", false,
                "devToken", otp
            );
        }
    }

    /**
     * Bước 2: Đặt lại mật khẩu bằng token OTP.
     */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token.trim())
                .orElseThrow(() -> new RuntimeException("Mã OTP không hợp lệ hoặc đã hết hạn"));

        if (!resetToken.isValid()) {
            if (resetToken.isExpired()) {
                throw new RuntimeException("Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.");
            }
            throw new RuntimeException("Mã OTP đã được sử dụng. Vui lòng yêu cầu mã mới.");
        }

        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("Mật khẩu phải có ít nhất 6 ký tự");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        log.info("Password successfully reset for user: {}", user.getEmail());
    }

    // ── Helpers ───────────────────────────────────────────────────

    private void sendResetEmail(String toEmail, String fullName, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailUsername);
        message.setTo(toEmail);
        message.setSubject("[ConstructX] Mã OTP đặt lại mật khẩu");
        message.setText(
            "Xin chào " + fullName + ",\n\n" +
            "Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.\n\n" +
            "MÃ OTP CỦA BẠN: " + otp + "\n\n" +
            "Mã này có hiệu lực trong " + tokenExpiryMinutes + " phút.\n" +
            "Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.\n\n" +
            "Trân trọng,\n" +
            "ConstructX Team"
        );
        mailSender.send(message);
    }

    private String maskEmail(String email) {
        int atIdx = email.indexOf('@');
        if (atIdx <= 2) return email;
        return email.substring(0, 2) + "***" + email.substring(atIdx);
    }
}
