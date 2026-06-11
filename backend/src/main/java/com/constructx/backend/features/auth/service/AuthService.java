package com.constructx.backend.features.auth.service;

import com.constructx.backend.features.auth.dto.request.LoginRequest;
import com.constructx.backend.features.auth.dto.request.RegisterRequest;
import com.constructx.backend.features.auth.dto.response.AuthResponse;
import com.constructx.backend.features.notification.entity.Notification;
import com.constructx.backend.features.notification.service.NotificationService;
import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.wallet.entity.Wallet;
import com.constructx.backend.features.user.repository.UserRepository;
import com.constructx.backend.features.wallet.repository.WalletRepository;
import com.constructx.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final NotificationService notificationService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại: " + request.getEmail());
        }

        User.Role userRole = User.Role.CUSTOMER;
        User.ApprovalStatus approvalStatus = User.ApprovalStatus.APPROVED;
        boolean active = true;

        if (request.getRole() != null) {
            try {
                User.Role requestedRole = User.Role.valueOf(request.getRole().toUpperCase());

                if (requestedRole == User.Role.ADMIN) {
                    throw new RuntimeException("Không thể đăng ký tài khoản Admin công khai");
                }

                userRole = requestedRole;

                if (requestedRole == User.Role.CONTRACTOR) {
                    approvalStatus = User.ApprovalStatus.PENDING;
                    active = true; // vẫn cho đăng nhập, block action qua approvalStatus
                }
            } catch (IllegalArgumentException e) {
                userRole = User.Role.CUSTOMER;
            }
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhone())
                .role(userRole)
                .active(active)
                .approvalStatus(approvalStatus)
                .build();

        user = userRepository.save(user);

        Wallet wallet = Wallet.builder()
                .user(user)
                .balance(0L)
                .lockedAmount(0L)
                .build();

        walletRepository.save(wallet);

        if (user.getRole() == User.Role.CONTRACTOR) {
        notificationService.createNotificationForAdmins(
            Notification.NotifType.SYSTEM,
            "Nhà thầu mới " + user.getFullName()
                    + " (" + user.getEmail() + ") đang chờ phê duyệt."
        );
        }

        // Token luôn được cấp (kể cả contractor PENDING)
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .approvalStatus(user.getApprovalStatus() != null ? user.getApprovalStatus().name() : "APPROVED")
                .userId(user.getId())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .approvalStatus(user.getApprovalStatus() != null ? user.getApprovalStatus().name() : "APPROVED")
                .userId(user.getId())
                .build();
    }
}