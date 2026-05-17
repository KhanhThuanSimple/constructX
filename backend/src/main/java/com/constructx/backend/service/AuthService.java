package com.constructx.backend.service;

import com.constructx.backend.dto.request.LoginRequest;
import com.constructx.backend.dto.request.RegisterRequest;
import com.constructx.backend.dto.response.AuthResponse;
import com.constructx.backend.entity.User;
import com.constructx.backend.entity.Wallet;
import com.constructx.backend.repository.UserRepository;
import com.constructx.backend.repository.WalletRepository;
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

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại: " + request.getEmail());
        }

        User.Role userRole = User.Role.CUSTOMER;
        if (request.getRole() != null) {
            try {
                User.Role requestedRole = User.Role.valueOf(request.getRole().toUpperCase());
                if (requestedRole == User.Role.ADMIN) {
                    throw new RuntimeException("Không thể đăng ký tài khoản Admin công khai");
                }
                userRole = requestedRole;
            } catch (IllegalArgumentException e) {
                // Keep default CUSTOMER
            }
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhone())
                .role(userRole)
                .build();

        user = userRepository.save(user);

        // Tự động tạo ví cho khách hàng mới
        Wallet wallet = Wallet.builder()
                .user(user)
                .balance(0L)
                .lockedAmount(0L)
                .build();
        walletRepository.save(wallet);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
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
                .userId(user.getId())
                .build();
    }
}
