package com.constructx.backend.admin.service;

import com.constructx.backend.admin.dto.request.AdminProjectReviewRequest;
import com.constructx.backend.admin.dto.response.AdminProjectResponse;
import com.constructx.backend.entity.Project;
import com.constructx.backend.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.constructx.backend.entity.Notification;
import com.constructx.backend.service.NotificationService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminProjectService {

    private final ProjectRepository projectRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<AdminProjectResponse> getProjects(String approvalStatus) {
        return projectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(project -> matchesApprovalStatus(project, approvalStatus))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminProjectResponse approveProject(Long id, AdminProjectReviewRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));

        project.setApprovalStatus(Project.ApprovalStatus.APPROVED);
        project.setStatus(Project.Status.OPEN);
        project.setAdminNote(normalizeReason(request));
        project.setApprovedAt(LocalDateTime.now());

        Project savedProject = projectRepository.save(project);

        notificationService.createNotification(
        savedProject.getUser(),
        Notification.NotifType.SYSTEM,
        "Dự án #" + savedProject.getId()
                + " - " + savedProject.getName()
                + " đã được admin duyệt và hiển thị trên sàn."
        );
        return toResponse(savedProject);

        }

    @Transactional
    public AdminProjectResponse rejectProject(Long id, AdminProjectReviewRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));

        project.setApprovalStatus(Project.ApprovalStatus.REJECTED);
        project.setStatus(Project.Status.CANCELLED);
        project.setAdminNote(normalizeReason(request));
        project.setApprovedAt(null);

        return toResponse(projectRepository.save(project));
    }

    private boolean matchesApprovalStatus(Project project, String approvalStatus) {
        if (approvalStatus == null || approvalStatus.isBlank() || approvalStatus.equalsIgnoreCase("all")) {
            return true;
        }

        Project.ApprovalStatus current = project.getApprovalStatus() == null
                ? Project.ApprovalStatus.PENDING
                : project.getApprovalStatus();

        return current.name().equalsIgnoreCase(approvalStatus);
    }

    private String normalizeReason(AdminProjectReviewRequest request) {
        if (request == null || request.getReason() == null || request.getReason().isBlank()) {
            return null;
        }

        return request.getReason().trim();
    }

    private AdminProjectResponse toResponse(Project project) {
        Project.ApprovalStatus approvalStatus = project.getApprovalStatus() == null
                ? Project.ApprovalStatus.PENDING
                : project.getApprovalStatus();

        return AdminProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .category(project.getCategory())
                .area(project.getArea())
                .style(project.getStyle())
                .address(project.getAddress())
                .description(project.getDescription())
                .budgetMin(project.getBudgetMin())
                .budgetMax(project.getBudgetMax())
                .bidType(project.getBidType() == null ? null : project.getBidType().name())
                .status(project.getStatus() == null ? null : project.getStatus().name())
                .approvalStatus(approvalStatus.name())
                .adminNote(project.getAdminNote())
                .approvedAt(project.getApprovedAt())
                .createdAt(project.getCreatedAt())
                .customerId(project.getUser().getId())
                .customerName(project.getUser().getFullName())
                .customerEmail(project.getUser().getEmail())
                .build();
    }
}