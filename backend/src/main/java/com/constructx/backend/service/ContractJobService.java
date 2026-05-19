package com.constructx.backend.service;

import com.constructx.backend.dto.response.ContractorJobResponse;
import com.constructx.backend.dto.response.ProjectResponse;
import com.constructx.backend.entity.Bid;
import com.constructx.backend.entity.ContractJob;
import com.constructx.backend.entity.Project;
import com.constructx.backend.entity.User;
import com.constructx.backend.repository.BidRepository;
import com.constructx.backend.repository.ContractJobRepository;
import com.constructx.backend.repository.ProjectRepository;
import com.constructx.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ContractJobService {

    private final ProjectRepository projectRepository;
    private final BidRepository bidRepository;
    private final ContractJobRepository contractJobRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public ProjectResponse selectBid(Long projectId, Long bidId) {

        User user = getCurrentUser();

        // project
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // chỉ chủ project mới được chọn
        if (!project.getUser().getEmail().equals(user.getEmail())) {
            throw new RuntimeException("Bạn không có quyền");
        }

        // chỉ được chọn khi project còn open
        if (project.getStatus() != Project.Status.OPEN) {
            throw new RuntimeException("Project đã được nhận thầu");
        }

        // bid
        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found"));

        // bid phải thuộc project
        if (!bid.getProject().getId().equals(projectId)) {
            throw new RuntimeException("Bid không thuộc project");
        }

        // ACCEPT bid được chọn
        bid.setStatus(Bid.Status.ACCEPTED);

        // reject các bid còn lại
        bidRepository.rejectOtherBids(projectId, bidId);

        // update project
        project.setStatus(Project.Status.IN_PROGRESS);

        // tạo contract job
        ContractJob contractJob = ContractJob.builder()
                .project(project)
                .bid(bid)
                .customer(project.getUser())
                .contractor(bid.getContractor())
                .agreedPrice(bid.getTotalPrice())
                .startedAt(LocalDateTime.now())
                .build();

        contractJobRepository.save(contractJob);

        return mapProjectResponse(project);
    }

    private ProjectResponse mapProjectResponse(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .category(project.getCategory())
                .status(project.getStatus().name())
                .address(project.getAddress())
                .description(project.getDescription())
                .budgetMin(project.getBudgetMin())
                .budgetMax(project.getBudgetMax())
                .createdAt(project.getCreatedAt())
                .build();
    }
    // xem các dự án đang dc thầu
    @Transactional(readOnly = true)
    public List<ContractorJobResponse> getMyJobs() {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        List<ContractJob> jobs = contractJobRepository
                .findContractorJobs(email);

        return jobs.stream()
                .map(this::mapContractorJobResponse)
                .toList();
    }

    private ContractorJobResponse mapContractorJobResponse(
            ContractJob job
    ) {

        Project project = job.getProject();

        User customer = job.getCustomer();

        return ContractorJobResponse.builder()
                .jobId(job.getId())
                .projectId(project.getId())
                .projectName(project.getName())
                .category(project.getCategory())
                .address(project.getAddress())
                .description(project.getDescription())
                .agreedPrice(job.getAgreedPrice())
                .customerName(customer.getFullName())
                .customerPhone(customer.getPhoneNumber())
                .customerEmail(customer.getEmail())
                .status(job.getStatus().name())
                .startedAt(job.getStartedAt())
                .createdAt(job.getCreatedAt())
                .build();
    }
}