package com.constructx.backend.controller;

import com.constructx.backend.dto.request.ProjectRequest;
import com.constructx.backend.dto.response.ApiResponse;
import com.constructx.backend.dto.response.ProjectDetailResponse;
import com.constructx.backend.entity.Project;
import com.constructx.backend.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Project>>> getMyProjects() {
        return ResponseEntity.ok(ApiResponse.ok(projectService.getMyProjects()));
    }

    @GetMapping("/open")
    public ResponseEntity<ApiResponse<List<Project>>> getOpenProjects() {
        return ResponseEntity.ok(ApiResponse.ok(projectService.getAllOpenProjects()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Project>> getProjectById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(ApiResponse.ok(projectService.getProjectById(id)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Project>> createProject(@Valid @RequestBody ProjectRequest request) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Tạo dự án thành công", projectService.createProject(request)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Project>> updateProjectStatus(@PathVariable Long id, @RequestParam String status) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Cập nhật trạng thái thành công", projectService.updateProjectStatus(id, status)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    // api lấy thông tin chi tiết dự án và các báo giá
    @GetMapping("/v2/{projectId}")
    public ApiResponse<ProjectDetailResponse> getProjectDetail(
            @PathVariable Long projectId
    ) {

        return ApiResponse.ok(
                projectService.getProjectDetail(projectId)
        );
    }
}
