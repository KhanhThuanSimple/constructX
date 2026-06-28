package com.constructx.backend.features.project.service;

import com.constructx.backend.features.project.dto.ProjectRequest;
import com.constructx.backend.features.project.entity.Project;
import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.project.repository.ProjectRepository;
import com.constructx.backend.features.user.repository.UserRepository;
import com.constructx.backend.admin.service.FeatureFlagService;
import com.constructx.backend.features.wallet.repository.WalletRepository;
import com.constructx.backend.features.wallet.entity.Wallet;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final FeatureFlagService featureFlagService;
    private final WalletRepository walletRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<Project> getMyProjects() {
        User user = getCurrentUser();
        return projectRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public List<Project> getAllOpenProjects() {
        return projectRepository.findByStatusOrderByCreatedAtDesc(Project.Status.OPEN);
    }

    public Project getProjectById(Long id) {
        User user = getCurrentUser();
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));
        // Owner, admin, và contractor đều có thể xem
        boolean isOwner = project.getUser().getId().equals(user.getId());
        boolean isAdminOrContractor = user.getRole() == User.Role.ADMIN
                || user.getRole() == User.Role.CONTRACTOR;
        if (!isOwner && !isAdminOrContractor) {
            throw new RuntimeException("Bạn không có quyền xem dự án này");
        }
        return project;
    }

    @Transactional
    public Project createProject(ProjectRequest request) {
        User user = getCurrentUser();

        // Check minimum wallet balance required to create project
        long minBalance = featureFlagService.getMinCustomerBalanceToProject();
        if (minBalance > 0) {
            Wallet wallet = walletRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy ví của người dùng"));
            if (wallet.getAvailableBalance() < minBalance) {
                throw new RuntimeException(String.format("Số dư ví khả dụng không đủ. Số dư tối thiểu yêu cầu là %,dđ để đăng dự án.", minBalance));
            }
        }

        Project.BidType bidType = Project.BidType.FIXED_PRICE;
        if ("DIRECT".equalsIgnoreCase(request.getBidType())) {
            bidType = Project.BidType.NEGOTIABLE;
        }

        // Kiểm tra feature flag: dự án có cần duyệt hay đăng thẳng
        boolean approvalRequired = featureFlagService.isProjectApprovalRequired();
        Project.Status initialStatus = approvalRequired ? Project.Status.DRAFT : Project.Status.OPEN;
        Project.ApprovalStatus approvalStatus = approvalRequired
                ? Project.ApprovalStatus.PENDING
                : Project.ApprovalStatus.APPROVED;

        Project project = Project.builder()
                .user(user)
                .name(request.getName())
                .category(request.getCategory())
                .area(request.getArea())
                .style(request.getStyle())
                .address(request.getAddress())
                .description(request.getDescription())
                .budgetMin(request.getBudgetMin())
                .budgetMax(request.getBudgetMax())
                .bidType(bidType)
                .imageUrls(request.getImageUrls())
                .status(initialStatus)
                .approvalStatus(approvalStatus)
                .build();

        return projectRepository.save(project);
    }

    @Transactional
    public Project updateProjectStatus(Long id, String status) {
        Project project = getProjectById(id);
        project.setStatus(Project.Status.valueOf(status.toUpperCase()));
        return projectRepository.save(project);
    }
}
