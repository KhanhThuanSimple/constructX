package com.constructx.backend.features.project.service;

import com.constructx.backend.features.project.dto.ProjectRequest;
import com.constructx.backend.features.project.entity.Project;
import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.project.repository.ProjectRepository;
import com.constructx.backend.features.user.repository.UserRepository;
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

        Project.BidType bidType = Project.BidType.FIXED_PRICE;
        if ("DIRECT".equalsIgnoreCase(request.getBidType())) {
            bidType = Project.BidType.NEGOTIABLE;
        }

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
                .status(Project.Status.DRAFT)
                .approvalStatus(Project.ApprovalStatus.PENDING)
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
