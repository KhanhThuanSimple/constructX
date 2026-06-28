package com.constructx.backend.admin.service;

import com.constructx.backend.admin.dto.response.AdminPartnerResponse;
import com.constructx.backend.features.notification.entity.Notification;
import com.constructx.backend.features.notification.service.NotificationService;
import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import com.constructx.backend.features.portfolio.dto.ContractorProfileResponse;
import com.constructx.backend.features.portfolio.service.ContractorProfileService;

@Service
@RequiredArgsConstructor
public class AdminPartnerService {

    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ContractorProfileService contractorProfileService;

    public List<AdminPartnerResponse> getPartners(String statusFilter) {
        List<User> contractors = fetchContractors(statusFilter);
        return contractors.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminPartnerResponse approvePartner(Long id) {
        User contractor = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Đối tác không tồn tại"));
        ensureContractor(contractor);
        contractor.setActive(true);
        contractor.setApprovalStatus(User.ApprovalStatus.APPROVED);
        User savedContractor = userRepository.save(contractor);

        notificationService.createNotification(
        savedContractor,
        Notification.NotifType.SYSTEM,
        "Tài khoản nhà thầu của bạn đã được quản trị viên phê duyệt. Bạn có thể đăng nhập và nhận dự án."
        );
        return toResponse(savedContractor);
    }

    @Transactional
    public AdminPartnerResponse rejectPartner(Long id) {
        User contractor = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Đối tác không tồn tại"));
        ensureContractor(contractor);
        contractor.setApprovalStatus(User.ApprovalStatus.REJECTED);
        // Không set active = false — vẫn cho login để xem thông báo
        User savedContractor = userRepository.save(contractor);

        notificationService.createNotification(
        savedContractor,
        Notification.NotifType.SYSTEM,
        "Tài khoản nhà thầu của bạn đã bị từ chối bởi quản trị viên."
        );
        return toResponse(savedContractor);
    }

    private void ensureContractor(User user) {
        if (user.getRole() != User.Role.CONTRACTOR) {
            throw new RuntimeException("Chỉ đối tác nhà thầu mới có thể phê duyệt hoặc từ chối");
        }
    }

    private List<User> fetchContractors(String statusFilter) {
        if (statusFilter == null || statusFilter.isBlank() || statusFilter.equalsIgnoreCase("all")) {
            return userRepository.findByRole(User.Role.CONTRACTOR);
        }

        try {
            User.ApprovalStatus approvalStatus = User.ApprovalStatus.valueOf(statusFilter.toUpperCase());
            return userRepository.findByRoleAndApprovalStatus(User.Role.CONTRACTOR, approvalStatus);
        } catch (IllegalArgumentException e) {
            return userRepository.findByRole(User.Role.CONTRACTOR);
        }
    }

    private AdminPartnerResponse toResponse(User user) {
        ContractorProfileResponse profileResponse = null;
        try {
            profileResponse = contractorProfileService.getProfileByContractorId(user.getId());
        } catch (Exception e) {
            // ignore
        }

        return AdminPartnerResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .role(user.getRole().name())
                .active(user.isActive())
                .approvalStatus(
                        user.getApprovalStatus() != null
                                ? user.getApprovalStatus().name()
                                : null
                )
                .createdAt(user.getCreatedAt())
                .profile(profileResponse)
                .build();
    }
}
