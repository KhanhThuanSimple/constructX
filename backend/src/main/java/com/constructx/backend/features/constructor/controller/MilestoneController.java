package com.constructx.backend.features.constructor.controller;

import com.constructx.backend.features.constructor.dto.request.CreateMilestoneUpdateRequest;
import com.constructx.backend.features.constructor.dto.MilestoneUpdateResponse;
import com.constructx.backend.features.constructor.service.MilestoneService;
import com.constructx.backend.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/milestones")
@RequiredArgsConstructor
public class MilestoneController {

    private final MilestoneService milestoneService;

    @PostMapping("/{milestoneId}/updates")
    public ApiResponse<MilestoneUpdateResponse> createUpdate(
            @PathVariable Long milestoneId,
            @RequestBody CreateMilestoneUpdateRequest request
    ) {

        return ApiResponse.ok(
                "Cập nhật tiến độ thành công",
                milestoneService.createUpdate(
                        milestoneId,
                        request
                )
        );
    }

    @PostMapping("/{milestoneId}/submit")
    public ApiResponse<String> submitMilestone(
            @PathVariable Long milestoneId
    ) {

        milestoneService.submitMilestone(milestoneId);

        return ApiResponse.ok(
                "Đã gửi xác nhận hoàn thành",
                null
        );
    }
    // user xác nhận tiến độ
    @PostMapping("/{milestoneId}/confirm")
    public ApiResponse<String> confirmMilestone(
            @PathVariable Long milestoneId
    ) {

        milestoneService.confirmMilestone(
                milestoneId
        );

        return ApiResponse.ok(
                "Xác nhận milestone thành công",
                null
        );
    }
}