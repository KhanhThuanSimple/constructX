package com.constructx.backend.admin.controller;

import com.constructx.backend.admin.dto.request.AdminSettingsRequest;
import com.constructx.backend.admin.dto.response.AdminSettingsResponse;
import com.constructx.backend.admin.service.AdminSettingsService;
import com.constructx.backend.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
public class AdminSettingsController {

    private final AdminSettingsService adminSettingsService;

    @GetMapping
    public ResponseEntity<ApiResponse<AdminSettingsResponse>> getSettings() {
        return ResponseEntity.ok(
                ApiResponse.ok(adminSettingsService.getSettings())
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminSettingsResponse>> updateSettings(
            @RequestBody AdminSettingsRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.ok(
                        "Lưu cấu hình hệ thống thành công",
                        adminSettingsService.updateSettings(request)
                )
        );
    }
}