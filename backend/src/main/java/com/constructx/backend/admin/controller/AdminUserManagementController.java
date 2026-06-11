package com.constructx.backend.admin.controller;

import com.constructx.backend.admin.dto.response.AdminPartnerResponse;
import com.constructx.backend.admin.service.AdminUserManagementService;
import com.constructx.backend.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Admin: Quản lý toàn bộ user (CUSTOMER + CONTRACTOR + ADMIN)
 * Base: /api/admin/users
 */
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserManagementController {

    private final AdminUserManagementService adminUserManagementService;

    /** GET /api/admin/users?role=CUSTOMER&status=all */
    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminPartnerResponse>>> getUsers(
            @RequestParam(defaultValue = "all") String role,
            @RequestParam(defaultValue = "all") String status
    ) {
        return ResponseEntity.ok(ApiResponse.ok(adminUserManagementService.getUsers(role, status)));
    }

    /** POST /api/admin/users/{id}/ban — khóa tài khoản */
    @PostMapping("/{id}/ban")
    public ResponseEntity<ApiResponse<AdminPartnerResponse>> banUser(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Đã khóa tài khoản", adminUserManagementService.banUser(id)));
    }

    /** POST /api/admin/users/{id}/unban — mở khóa tài khoản */
    @PostMapping("/{id}/unban")
    public ResponseEntity<ApiResponse<AdminPartnerResponse>> unbanUser(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Đã mở khóa tài khoản", adminUserManagementService.unbanUser(id)));
    }

    /** GET /api/admin/users/stats */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUserStats() {
        return ResponseEntity.ok(ApiResponse.ok(adminUserManagementService.getUserStats()));
    }
}
