package com.constructx.backend.features.portfolio.controller;

import com.constructx.backend.features.portfolio.dto.ContractorProfileRequest;
import com.constructx.backend.features.portfolio.dto.ContractorProfileResponse;
import com.constructx.backend.features.portfolio.service.ContractorProfileService;
import com.constructx.backend.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class ContractorProfileController {

    private final ContractorProfileService contractorProfileService;

    @GetMapping("/api/contractor-profile/my")
    public ResponseEntity<ApiResponse<ContractorProfileResponse>> getMyProfile() {
        return ResponseEntity.ok(ApiResponse.ok(contractorProfileService.getMyProfile()));
    }

    @PutMapping("/api/contractor-profile/my")
    public ResponseEntity<ApiResponse<ContractorProfileResponse>> updateMyProfile(
            @RequestBody ContractorProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật hồ sơ năng lực thành công", contractorProfileService.updateMyProfile(request)));
    }

    @GetMapping("/api/public/contractor-profile/{id}")
    public ResponseEntity<ApiResponse<ContractorProfileResponse>> getProfileById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(contractorProfileService.getProfileByContractorId(id)));
    }
}
