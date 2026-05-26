package com.constructx.backend.service;

import com.constructx.backend.dto.response.*;
import com.constructx.backend.entity.*;
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

    @Transactional(readOnly = true)
    public JobDetailResponse getJobDetail(Long jobId) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        ContractJob job = contractJobRepository
                .findJobDetail(jobId)
                .orElseThrow(() ->
                        new RuntimeException("Job not found"));

        // chỉ contractor hoặc customer được xem
        boolean allowed =
                job.getCustomer().getEmail().equals(email)
                        || job.getContractor().getEmail().equals(email);

        if (!allowed) {
            throw new RuntimeException("Bạn không có quyền");
        }

        int totalProgress = 0;

        if (job.getWorkPlan() != null) {

            totalProgress = job.getWorkPlan()
                    .getMilestones()
                    .stream()
                    .filter(m ->
                            m.getStatus()
                                    == WorkMilestone.Status.COMPLETED
                    )
                    .mapToInt(WorkMilestone::getProgressPercent)
                    .sum();
        }

        return JobDetailResponse.builder()
                .jobId(job.getId())
                .projectName(job.getProject().getName())
                .category(job.getProject().getCategory())
                .area(job.getProject().getArea())
                .style(job.getProject().getStyle())
                .address(job.getProject().getAddress())
                .description(job.getProject().getDescription())
                .customerName(job.getCustomer().getFullName())
                .contractorName(job.getContractor().getFullName())
                .agreedPrice(job.getAgreedPrice())
                .status(job.getStatus().name())
                .totalProgress(totalProgress)
                .workPlan(mapWorkPlan(job.getWorkPlan()))
                .build();
    }
    private WorkPlanDetailResponse mapWorkPlan(
            WorkPlan workPlan
    ) {

        if (workPlan == null) {
            return null;
        }

        return WorkPlanDetailResponse.builder()
                .id(workPlan.getId())
                .note(workPlan.getNote())
                .status(workPlan.getStatus().name())
                .milestones(
                        workPlan.getMilestones()
                                .stream()
                                .map(this::mapMilestone)
                                .toList()
                )
                .build();
    }
    private MilestoneDetailResponse mapMilestone(
            WorkMilestone milestone
    ) {

        return MilestoneDetailResponse.builder()
                .id(milestone.getId())
                .title(milestone.getTitle())
                .description(milestone.getDescription())
                .amount(milestone.getAmount())
                .progressPercent(milestone.getProgressPercent())
                .stepOrder(milestone.getStepOrder())
                .status(milestone.getStatus().name())
                .deadline(milestone.getDeadline())
                .updates(
                        milestone.getUpdates()
                                .stream()
                                .map(this::mapUpdate)
                                .toList()
                )
                .build();
    }
    private MilestoneUpdateResponse mapUpdate(
            MilestoneUpdate update
    ) {

        return MilestoneUpdateResponse.builder()
                .id(update.getId())
                .milestoneId(update.getMilestone().getId())
                .title(update.getTitle())
                .content(update.getContent())
                .imageUrl(update.getImageUrl())
                .createdAt(update.getCreatedAt())
                .build();
    }
}