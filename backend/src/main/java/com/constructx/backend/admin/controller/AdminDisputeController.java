package com.constructx.backend.admin.controller;

import com.constructx.backend.admin.dto.request.DisputeMessageRequest;
import com.constructx.backend.admin.dto.request.DisputeResolutionRequest;
import com.constructx.backend.admin.dto.response.DisputeResponse;
import com.constructx.backend.admin.service.AdminDisputeService;

import com.constructx.backend.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/disputes")
@RequiredArgsConstructor
public class AdminDisputeController {

    private final AdminDisputeService adminDisputeService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DisputeResponse>>> getDisputes() {
        return ResponseEntity.ok(ApiResponse.ok(adminDisputeService.getAllDisputes()));
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<ApiResponse<DisputeResponse>> resolveDispute(
            @PathVariable Long id,
            @RequestBody DisputeResolutionRequest request
    ) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Giải quyết tranh chấp thành công", adminDisputeService.resolveDispute(id, request)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<ApiResponse<DisputeResponse>> addMessage(
            @PathVariable Long id,
            @RequestBody DisputeMessageRequest request
    ) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Gửi tin nhắn thành công", adminDisputeService.addDisputeMessage(id, request.getContent())));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
