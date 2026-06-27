package com.constructx.backend.features.dispute.controller;

import com.constructx.backend.features.dispute.dto.CreateDisputeRequest;
import com.constructx.backend.features.dispute.dto.CreateDisputeResponse;
import com.constructx.backend.features.dispute.service.DisputeService;
import com.constructx.backend.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/disputes")
@RequiredArgsConstructor
public class DisputeController {

    private final DisputeService disputeService;

    @PostMapping
    public ResponseEntity<ApiResponse<CreateDisputeResponse>> createDispute(
            @Valid @RequestBody CreateDisputeRequest request,
            Authentication authentication) {
        CreateDisputeResponse response = disputeService.initiateDispute(request, authentication);
        return ResponseEntity.ok(ApiResponse.ok("Khởi tạo tranh chấp thành công", response));
    }
}
