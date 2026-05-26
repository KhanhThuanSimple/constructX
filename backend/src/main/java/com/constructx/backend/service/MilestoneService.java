package com.constructx.backend.service;

import com.constructx.backend.dto.request.CreateMilestoneUpdateRequest;
import com.constructx.backend.dto.response.MilestoneUpdateResponse;
import com.constructx.backend.entity.MilestoneUpdate;
import com.constructx.backend.entity.WorkMilestone;
import com.constructx.backend.repository.MilestoneUpdateRepository;
import com.constructx.backend.repository.WorkMilestoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MilestoneService {

    private final WorkMilestoneRepository workMilestoneRepository;

    private final MilestoneUpdateRepository milestoneUpdateRepository;

    @Transactional
    public MilestoneUpdateResponse createUpdate(
            Long milestoneId,
            CreateMilestoneUpdateRequest request
    ) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        WorkMilestone milestone = workMilestoneRepository
                .findDetailById(milestoneId)
                .orElseThrow(() ->
                        new RuntimeException("Milestone not found"));

        // chỉ contractor của job mới được update
        if (!milestone.getWorkPlan()
                .getContractJob()
                .getContractor()
                .getEmail()
                .equals(email)) {

            throw new RuntimeException(
                    "Bạn không có quyền cập nhật milestone này"
            );
        }

        // plan phải approved
        if (milestone.getWorkPlan().getStatus()
                != com.constructx.backend.entity.WorkPlan.Status.APPROVED) {

            throw new RuntimeException(
                    "Kế hoạch chưa được phê duyệt"
            );
        }

        // nếu milestone đang pending thì chuyển sang in_progress
        if (milestone.getStatus()
                == WorkMilestone.Status.PENDING) {

            milestone.setStatus(
                    WorkMilestone.Status.IN_PROGRESS
            );
        }

        MilestoneUpdate update = MilestoneUpdate.builder()
                .milestone(milestone)
                .title(request.getTitle())
                .content(request.getContent())
                .imageUrl(request.getImageUrl())
                .build();

        milestoneUpdateRepository.save(update);

        return mapUpdateResponse(update);
    }

    private MilestoneUpdateResponse mapUpdateResponse(
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

    // chờ xác nhận
    @Transactional
    public void submitMilestone(Long milestoneId) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        WorkMilestone milestone = workMilestoneRepository
                .findDetailById(milestoneId)
                .orElseThrow(() ->
                        new RuntimeException("Milestone not found"));

        if (!milestone.getWorkPlan()
                .getContractJob()
                .getContractor()
                .getEmail()
                .equals(email)) {

            throw new RuntimeException(
                    "Bạn không có quyền"
            );
        }

        if (milestone.getStatus()
                != WorkMilestone.Status.IN_PROGRESS) {

            throw new RuntimeException(
                    "Milestone chưa thi công"
            );
        }

        milestone.setStatus(
                WorkMilestone.Status.WAITING_CONFIRMATION
        );
    }

    @Transactional
    public void confirmMilestone(Long milestoneId) {

        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        WorkMilestone milestone = workMilestoneRepository
                .findDetailById(milestoneId)
                .orElseThrow(() ->
                        new RuntimeException("Milestone not found"));

        String customerEmail = milestone.getWorkPlan()
                .getContractJob()
                .getCustomer()
                .getEmail();

        if (!customerEmail.equals(email)) {

            throw new RuntimeException(
                    "Bạn không có quyền"
            );
        }

        if (milestone.getStatus()
                != WorkMilestone.Status.WAITING_CONFIRMATION) {

            throw new RuntimeException(
                    "Milestone chưa gửi xác nhận"
            );
        }

        milestone.setStatus(
                WorkMilestone.Status.COMPLETED
        );

        // TODO:
        // giải ngân milestone amount
    }
}