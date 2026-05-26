package com.constructx.backend.service;

import com.constructx.backend.dto.request.ProjectRequest;
import com.constructx.backend.dto.response.BidDetailResponse;
import com.constructx.backend.dto.response.BidResponse;
import com.constructx.backend.dto.response.ProjectDetailResponse;
import com.constructx.backend.dto.response.ProjectResponse;
import com.constructx.backend.entity.Bid;
import com.constructx.backend.entity.BidDetail;
import com.constructx.backend.entity.Project;
import com.constructx.backend.entity.User;
import com.constructx.backend.repository.BidRepository;
import com.constructx.backend.repository.ProjectRepository;
import com.constructx.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.constructx.backend.entity.Notification;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final BidRepository bidRepository;
    private final NotificationService notificationService;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<Project> getMyProjects() {
        User user = getCurrentUser();
        return projectRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public List<Project> getAllOpenProjects() {
        return projectRepository.findByStatusAndApprovalStatusOrderByCreatedAtDesc(
                Project.Status.OPEN,
                Project.ApprovalStatus.APPROVED
        );
    }

    public Project getProjectById(Long id) {
        User user = getCurrentUser();

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));

        boolean owner = project.getUser().getId().equals(user.getId());

        boolean admin = user.getRole() == User.Role.ADMIN;

        boolean contractorCanView = user.getRole() == User.Role.CONTRACTOR
                && project.getStatus() == Project.Status.OPEN
                && project.getApprovalStatus() == Project.ApprovalStatus.APPROVED;

        if (!owner && !admin && !contractorCanView) {
            throw new RuntimeException("Bạn không có quyền xem dự án này");
        }

        return project;
    }

    @Transactional
    public Project createProject(ProjectRequest request) {
        User user = getCurrentUser();

        Project.BidType bidType = Project.BidType.OPEN;

        if ("DIRECT".equalsIgnoreCase(request.getBidType())) {
            bidType = Project.BidType.DIRECT;
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
                .status(Project.Status.OPEN)
                .approvalStatus(Project.ApprovalStatus.PENDING)
                .build();


        Project savedProject = projectRepository.save(project);

        notificationService.createNotificationForAdmins(
            Notification.NotifType.SYSTEM,
            "Dự án mới #" + savedProject.getId()
                + " - " + savedProject.getName()
                + " đang chờ quản trị viên duyệt."
        );

    return savedProject;
    }

    @Transactional
    public Project updateProjectStatus(Long id, String status) {
        Project project = getProjectById(id);
        project.setStatus(Project.Status.valueOf(status.toUpperCase()));
        return projectRepository.save(project);
    }

    // hàm lấy chi tiết dự án và báo giá
    public ProjectDetailResponse getProjectDetail(Long projectId) {

        Project project = projectRepository.findDetailById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        List<BidResponse> bids = bidRepository.findProjectBids(projectId)
                .stream()
                .map(this::mapBidResponse)
                .toList();

        ProjectResponse projectResponse = ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .category(project.getCategory())
                .area(project.getArea())
                .style(project.getStyle())
                .address(project.getAddress())
                .description(project.getDescription())
                .budgetMin(project.getBudgetMin())
                .budgetMax(project.getBudgetMax())
                .bidType(project.getBidType().name())
                .status(project.getStatus().name())
                .ownerName(project.getUser().getFullName())
                .ownerPhone(project.getUser().getPhoneNumber())
                .createdAt(project.getCreatedAt())
                .build();

        return ProjectDetailResponse.builder()
                .project(projectResponse)
                .bids(bids)
                .build();
    }

    private BidResponse mapBidResponse(Bid bid) {

        List<BidDetailResponse> detailResponses = bid.getDetails()
                .stream()
                .map(this::mapBidDetailResponse)
                .toList();

        return BidResponse.builder()
                .id(bid.getId())
                .projectId(bid.getProject().getId())
                .contractorId(bid.getContractor().getId())
                .contractorName(bid.getContractor().getFullName())
                .contractorEmail(bid.getContractor().getEmail())
                .contractorPhone(bid.getContractor().getPhoneNumber())
                .totalPrice(bid.getTotalPrice())
                .estimatedDays(bid.getEstimatedDays())
                .message(bid.getMessage())
                .designImage(bid.getDesignImage())
                .status(bid.getStatus().name())
                .createdAt(bid.getCreatedAt())
                .details(detailResponses)
                .build();
    }

    private BidDetailResponse mapBidDetailResponse(BidDetail detail) {

        return BidDetailResponse.builder()
                .id(detail.getId())
                .itemName(detail.getItemName())
                .unit(detail.getUnit())
                .quantity(detail.getQuantity())
                .unitPrice(detail.getUnitPrice())
                .totalPrice(detail.getTotalPrice())
                .description(detail.getDescription())
                .sampleImage(detail.getSampleImage())
                .build();
    }
}
}
