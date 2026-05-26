package com.constructx.backend.service;

import com.constructx.backend.dto.request.CreateWorkPlanRequest;
import com.constructx.backend.dto.request.MilestoneRequest;
import com.constructx.backend.dto.response.WorkMilestoneResponse;
import com.constructx.backend.dto.response.WorkPlanResponse;
import com.constructx.backend.entity.ContractJob;
import com.constructx.backend.entity.WorkMilestone;
import com.constructx.backend.entity.WorkPlan;
import com.constructx.backend.repository.ContractJobRepository;
import com.constructx.backend.repository.WorkPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkPlanService {

    private final ContractJobRepository contractJobRepository;
    private final WorkPlanRepository workPlanRepository;

    @Transactional
    public WorkPlanResponse createPlan(
            Long jobId,
            CreateWorkPlanRequest request
    ) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        // job
        ContractJob job = contractJobRepository.findById(jobId)
                .orElseThrow(() ->
                        new RuntimeException("Job not found"));

        // chỉ contractor của job mới được tạo
        if (!job.getContractor().getEmail().equals(email)) {
            throw new RuntimeException("Bạn không có quyền");
        }

        // 1 job chỉ có 1 plan
        if (workPlanRepository
                .findByContractJobIdAndStatus(
                        jobId,
                        WorkPlan.Status.APPROVED
                )
                .isPresent()) {

            throw new RuntimeException(
                    "Job đã có kế hoạch được phê duyệt"
            );
        }

        // validate business logic
        validateMilestones(job, request.getMilestones());

        // create plan
        WorkPlan workPlan = WorkPlan.builder()
                .contractJob(job)
                .note(request.getNote())
                // sau sữa lại pending_approve chờ khách hàng xác thực mới thực hiện
                .status(WorkPlan.Status.APPROVED)
                .build();

        List<WorkMilestone> milestones = new ArrayList<>();

        int step = 1;

        for (MilestoneRequest item : request.getMilestones()) {

            WorkMilestone milestone = WorkMilestone.builder()
                    .workPlan(workPlan)
                    .title(item.getTitle())
                    .description(item.getDescription())
                    .amount(item.getAmount())
                    .progressPercent(item.getProgressPercent())
                    .deadline(item.getDeadline())
                    .stepOrder(step++)
                    .status(WorkMilestone.Status.PENDING)
                    .build();

            milestones.add(milestone);
        }

        workPlan.setMilestones(milestones);

        workPlanRepository.save(workPlan);

        return mapWorkPlanResponse(workPlan);
    }

    private void validateMilestones(
            ContractJob job,
            List<MilestoneRequest> milestones
    ) {

        long totalAmount = milestones.stream()
                .mapToLong(MilestoneRequest::getAmount)
                .sum();

        int totalPercent = milestones.stream()
                .mapToInt(MilestoneRequest::getProgressPercent)
                .sum();

        // tổng tiền milestone phải bằng giá đã chốt
        if (totalAmount != job.getAgreedPrice()) {

            throw new RuntimeException(
                    "Tổng milestone phải bằng giá trị hợp đồng" + job.getAgreedPrice()
            );
        }

        // tổng tiến độ phải bằng 100%
        if (totalPercent != 100) {

            throw new RuntimeException(
                    "Tổng phần trăm milestone phải bằng 100%"
            );
        }
    }

    private WorkPlanResponse mapWorkPlanResponse(
            WorkPlan workPlan
    ) {

        return WorkPlanResponse.builder()
                .id(workPlan.getId())
                .jobId(workPlan.getContractJob().getId())
                .note(workPlan.getNote())
                .status(workPlan.getStatus().name())
                .createdAt(workPlan.getCreatedAt())
                .milestones(
                        workPlan.getMilestones()
                                .stream()
                                .map(this::mapMilestoneResponse)
                                .toList()
                )
                .build();
    }

    private WorkMilestoneResponse mapMilestoneResponse(
            WorkMilestone milestone
    ) {

        return WorkMilestoneResponse.builder()
                .id(milestone.getId())
                .title(milestone.getTitle())
                .description(milestone.getDescription())
                .amount(milestone.getAmount())
                .progressPercent(milestone.getProgressPercent())
                .stepOrder(milestone.getStepOrder())
                .deadline(milestone.getDeadline())
                .status(milestone.getStatus().name())
                .build();
    }
}