package com.constructx.backend.admin.controller;

import com.constructx.backend.admin.dto.response.AdminPartnerResponse;
import com.constructx.backend.admin.service.AdminPartnerService;

import com.constructx.backend.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/partners")
@RequiredArgsConstructor
public class AdminPartnerController {

    private final AdminPartnerService adminPartnerService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminPartnerResponse>>> getPartners(
            @RequestParam(value = "status", defaultValue = "all") String status
    ) {
        return ResponseEntity.ok(ApiResponse.ok(adminPartnerService.getPartners(status)));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<AdminPartnerResponse>> approvePartner(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Duyệt đối tác thành công", adminPartnerService.approvePartner(id)));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<AdminPartnerResponse>> rejectPartner(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Từ chối đối tác thành công", adminPartnerService.rejectPartner(id)));
    }
}