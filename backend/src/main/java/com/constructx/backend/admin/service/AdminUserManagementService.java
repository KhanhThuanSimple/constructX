package com.constructx.backend.admin.service;

import com.constructx.backend.admin.dto.response.AdminPartnerResponse;
import com.constructx.backend.features.notification.entity.Notification;
import com.constructx.backend.features.notification.service.NotificationService;
import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserManagementService {

    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public List<AdminPartnerResponse> getUsers(String roleFilter, String statusFilter) {
        List<User> users;

        // Lọc theo role
        if (roleFilter == null || roleFilter.isBlank() || roleFilter.equalsIgnoreCase("all")) {
            users = userRepository.findAll();
        } else {
            try {
                User.Role role = User.Role.valueOf(roleFilter.toUpperCase());
                users = userRepository.findByRole(role);
            } catch (IllegalArgumentException e) {
                users = userRepository.findAll();
            }
        }

        // Lọc theo approvalStatus nếu là CONTRACTOR
        if (statusFilter != null && !statusFilter.isBlank() && !statusFilter.equalsIgnoreCase("all")) {
            try {
                User.ApprovalStatus approvalStatus = User.ApprovalStatus.valueOf(statusFilter.toUpperCase());
                users = users.stream()
                        .filter(u -> approvalStatus.equals(u.getApprovalStatus()))
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException ignored) {}
        }

        // Ẩn chính admin đang thao tác (giữ lại tất cả ADMIN khác để hiển thị)
        return users.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminPartnerResponse banUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
        if (user.getRole() == User.Role.ADMIN) {
            throw new RuntimeException("Không thể khóa tài khoản Admin");
        }
        user.setActive(false);
        User saved = userRepository.save(user);
        notificationService.createNotification(
                saved,
                Notification.NotifType.SYSTEM,
                "Tài khoản của bạn đã bị Admin tạm khóa. Vui lòng liên hệ hỗ trợ để biết thêm chi tiết."
        );
        return toResponse(saved);
    }

    @Transactional
    public AdminPartnerResponse unbanUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
        user.setActive(true);
        User saved = userRepository.save(user);
        notificationService.createNotification(
                saved,
                Notification.NotifType.SYSTEM,
                "Tài khoản của bạn đã được Admin mở khóa. Chào mừng bạn trở lại!"
        );
        return toResponse(saved);
    }

    public Map<String, Long> getUserStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalCustomers", userRepository.countByRole(User.Role.CUSTOMER));
        stats.put("totalContractors", userRepository.countByRole(User.Role.CONTRACTOR));
        stats.put("pendingContractors", userRepository.countByRoleAndApprovalStatus(
                User.Role.CONTRACTOR, User.ApprovalStatus.PENDING));
        stats.put("bannedUsers", userRepository.countByActiveFalse());
        return stats;
    }

    private AdminPartnerResponse toResponse(User user) {
        return AdminPartnerResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .role(user.getRole().name())
                .active(user.isActive())
                .approvalStatus(user.getApprovalStatus() != null ? user.getApprovalStatus().name() : null)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
