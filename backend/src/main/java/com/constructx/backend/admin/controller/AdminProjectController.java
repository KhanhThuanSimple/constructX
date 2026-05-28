package com.constructx.backend.admin.controller;


import com.constructx.backend.admin.dto.request.AdminProjectReviewRequest;
import com.constructx.backend.admin.dto.response.AdminProjectResponse;
import com.constructx.backend.admin.service.AdminProjectService;

import com.constructx.backend.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/projects")
@RequiredArgsConstructor
public class AdminProjectController {

    private final AdminProjectService adminProjectService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminProjectResponse>>> getProjects(
            @RequestParam(value = "status", defaultValue = "all") String status
    ) {
        return ResponseEntity.ok(ApiResponse.ok(adminProjectService.getProjects(status)));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<AdminProjectResponse>> approveProject(
            @PathVariable Long id,
            @RequestBody(required = false) AdminProjectReviewRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Duyệt dự án thành công",
                adminProjectService.approveProject(id, request)
        ));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<AdminProjectResponse>> rejectProject(
            @PathVariable Long id,
            @RequestBody(required = false) AdminProjectReviewRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Từ chối dự án thành công",
                adminProjectService.rejectProject(id, request)
        ));
    }
}