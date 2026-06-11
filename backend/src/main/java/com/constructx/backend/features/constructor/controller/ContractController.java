package com.constructx.backend.features.constructor.controller;

import com.constructx.backend.features.constructor.dto.BidResponse;
import com.constructx.backend.features.constructor.dto.ContractResponse;
import com.constructx.backend.features.constructor.service.ContractService;
import com.constructx.backend.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;

    // ── Project owner: xem bids của dự án mình (blind bidding) ──

    @GetMapping("/api/projects/{projectId}/bids")
    public ResponseEntity<ApiResponse<List<BidResponse>>> getProjectBids(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.ok(contractService.getProjectBids(projectId)));
    }

    // ── Project owner: chấp nhận bid → tạo contract ──

    @PostMapping("/api/projects/{projectId}/accept-bid/{bidId}")
    public ResponseEntity<ApiResponse<ContractResponse>> acceptBid(
            @PathVariable Long projectId,
            @PathVariable Long bidId
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Chấp nhận báo giá thành công. Hợp đồng đã được tạo và gửi Admin kiểm duyệt.",
                contractService.acceptBid(projectId, bidId)));
    }

    // ── User: xem hợp đồng của mình ──

    @GetMapping("/api/contracts/my")
    public ResponseEntity<ApiResponse<List<ContractResponse>>> getMyContracts() {
        return ResponseEntity.ok(ApiResponse.ok(contractService.getMyContracts()));
    }

    // ── User: ký hợp đồng ──

    @PostMapping("/api/contracts/{contractId}/sign")
    public ResponseEntity<ApiResponse<ContractResponse>> signContract(@PathVariable Long contractId) {
        return ResponseEntity.ok(ApiResponse.ok("Ký hợp đồng thành công", contractService.signContract(contractId)));
    }

    // ── Admin: lấy tất cả contracts ──

    @GetMapping("/api/admin/contracts")
    public ResponseEntity<ApiResponse<List<ContractResponse>>> getAllContracts(
            @RequestParam(defaultValue = "all") String status
    ) {
        return ResponseEntity.ok(ApiResponse.ok(contractService.getAllContracts(status)));
    }

    // ── Admin: duyệt contract ──

    @PostMapping("/api/admin/contracts/{contractId}/approve")
    public ResponseEntity<ApiResponse<ContractResponse>> approveContract(
            @PathVariable Long contractId,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String note = body != null ? body.get("note") : null;
        return ResponseEntity.ok(ApiResponse.ok("Phê duyệt hợp đồng thành công",
                contractService.approveContract(contractId, note)));
    }

    // ── Admin: từ chối contract ──

    @PostMapping("/api/admin/contracts/{contractId}/reject")
    public ResponseEntity<ApiResponse<ContractResponse>> rejectContract(
            @PathVariable Long contractId,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String note = body != null ? body.get("note") : null;
        return ResponseEntity.ok(ApiResponse.ok("Đã từ chối hợp đồng",
                contractService.rejectContract(contractId, note)));
    }

    // ── Admin: chỉnh sửa điều khoản ──

    @PutMapping("/api/admin/contracts/{contractId}/terms")
    public ResponseEntity<ApiResponse<ContractResponse>> updateTerms(
            @PathVariable Long contractId,
            @RequestBody Map<String, String> body
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Đã cập nhật điều khoản",
                contractService.updateTerms(contractId, body.get("terms"), body.get("note"))));
    }
}
