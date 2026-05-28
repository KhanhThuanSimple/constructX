package com.constructx.backend.features.constructor.controller;

import com.constructx.backend.features.constructor.dto.ContractorJobResponse;
import com.constructx.backend.features.constructor.dto.JobDetailResponse;
import com.constructx.backend.features.constructor.dto.ProjectResponse;
import com.constructx.backend.features.constructor.service.ContractJobService;
import com.constructx.backend.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class ContractJobController {

    private final ContractJobService contractJobService;
    // chọn dự án
    @PostMapping("/{projectId}/select-bid/{bidId}")
    public ApiResponse<ProjectResponse> selectBid(@PathVariable Long projectId, @PathVariable Long bidId) {
        return ApiResponse.ok(
                "Chọn nhà thầu thành công",
                contractJobService.selectBid(projectId, bidId)
        );
    }
    // xem job mình dc thầu
    @GetMapping("/jobs")
    public ApiResponse<List<ContractorJobResponse>> getMyJobs() {
        return ApiResponse.ok(
                contractJobService.getMyJobs()
        );
    }
    // xem chi tiết job dc thầu
    @GetMapping("/job/{jobId}")
    public ApiResponse<JobDetailResponse> getJobDetail(
            @PathVariable Long jobId
    ) {

        return ApiResponse.ok(
                contractJobService.getJobDetail(jobId)
        );
    }
}