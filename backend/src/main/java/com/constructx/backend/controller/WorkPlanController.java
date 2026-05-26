package com.constructx.backend.controller;

import com.constructx.backend.dto.request.CreateWorkPlanRequest;
import com.constructx.backend.dto.response.ApiResponse;
import com.constructx.backend.dto.response.WorkPlanResponse;
import com.constructx.backend.service.WorkPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class WorkPlanController {

    private final WorkPlanService workPlanService;

    @PostMapping("/{jobId}/plan")
    public ApiResponse<WorkPlanResponse> createPlan(
            @PathVariable Long jobId,
            @Valid @RequestBody CreateWorkPlanRequest request) {
        return ApiResponse.ok(
                "Tạo kế hoạch thành công",
                workPlanService.createPlan(jobId, request)
        );
    }
}