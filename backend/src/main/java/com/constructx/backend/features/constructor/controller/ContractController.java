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

    // ── Project owner: xem bids của dự án mình (blind bidding) ──────

    @GetMapping("/api/projects/{projectId}/bids")
    public ResponseEntity<ApiResponse<List<BidResponse>>> getProjectBids(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.ok(contractService.getProjectBids(projectId)));
    }

    // ── Project owner: chấp nhận bid → tạo contract + lock 10% cọc ─

    @PostMapping("/api/projects/{projectId}/accept-bid/{bidId}")
    public ResponseEntity<ApiResponse<ContractResponse>> acceptBid(
            @PathVariable Long projectId,
            @PathVariable Long bidId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Chấp nhận báo giá thành công. Đã lock cọc 10%%. HĐ đã gửi Admin duyệt.",
                contractService.acceptBid(projectId, bidId)));
    }

    // ── User: xem hợp đồng của mình ─────────────────────────────────

    @GetMapping("/api/contracts/my")
    public ResponseEntity<ApiResponse<List<ContractResponse>>> getMyContracts() {
        return ResponseEntity.ok(ApiResponse.ok(contractService.getMyContracts()));
    }

    // ── User: xem chi tiết 1 hợp đồng ───────────────────────────────

    @GetMapping("/api/contracts/{contractId}")
    public ResponseEntity<ApiResponse<ContractResponse>> getContractById(@PathVariable Long contractId) {
        return ResponseEntity.ok(ApiResponse.ok(contractService.getContractById(contractId)));
    }

    // ── User: ký hợp đồng (Customer hoặc Contractor) ────────────────
    //    Contractor ký trước → lock 5% ký quỹ
    //    Sau khi cả 2 ký → ACTIVE

    @PostMapping("/api/contracts/{contractId}/sign")
    public ResponseEntity<ApiResponse<ContractResponse>> signContract(@PathVariable Long contractId) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Ký hợp đồng thành công",
                contractService.signContract(contractId)));
    }

    // ── Customer: hủy hợp đồng (mất cọc 10% nếu đã ACTIVE) ─────────

    @PostMapping("/api/contracts/{contractId}/cancel-by-customer")
    public ResponseEntity<ApiResponse<ContractResponse>> cancelByCustomer(
            @PathVariable Long contractId,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(ApiResponse.ok(
                "Đã hủy hợp đồng",
                contractService.cancelByCustomer(contractId, reason)));
    }

    // ── Contractor: hủy hợp đồng (mất ký quỹ 5% + trừ điểm uy tín) ─

    @PostMapping("/api/contracts/{contractId}/cancel-by-contractor")
    public ResponseEntity<ApiResponse<ContractResponse>> cancelByContractor(
            @PathVariable Long contractId,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(ApiResponse.ok(
                "Đã hủy hợp đồng",
                contractService.cancelByContractor(contractId, reason)));
    }

    // ── Admin: lấy tất cả contracts ─────────────────────────────────

    @GetMapping("/api/admin/contracts")
    public ResponseEntity<ApiResponse<List<ContractResponse>>> getAllContracts(
            @RequestParam(defaultValue = "all") String status
    ) {
        return ResponseEntity.ok(ApiResponse.ok(contractService.getAllContracts(status)));
    }

    // ── Admin: duyệt contract → WAITING_SIGNATURE ────────────────────

    @PostMapping("/api/admin/contracts/{contractId}/approve")
    public ResponseEntity<ApiResponse<ContractResponse>> approveContract(
            @PathVariable Long contractId,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String note = body != null ? body.get("note") : null;
        return ResponseEntity.ok(ApiResponse.ok(
                "Phê duyệt hợp đồng thành công",
                contractService.approveContract(contractId, note)));
    }

    // ── Admin: từ chối contract → hoàn cọc customer ─────────────────

    @PostMapping("/api/admin/contracts/{contractId}/reject")
    public ResponseEntity<ApiResponse<ContractResponse>> rejectContract(
            @PathVariable Long contractId,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String note = body != null ? body.get("note") : null;
        return ResponseEntity.ok(ApiResponse.ok(
                "Đã từ chối hợp đồng",
                contractService.rejectContract(contractId, note)));
    }

    // ── Admin: sửa điều khoản (text) ─────────────────────────────────

    @PutMapping("/api/admin/contracts/{contractId}/terms")
    public ResponseEntity<ApiResponse<ContractResponse>> updateTerms(
            @PathVariable Long contractId,
            @RequestBody Map<String, String> body
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Đã cập nhật điều khoản",
                contractService.updateTerms(contractId, body.get("terms"), body.get("note"))));
    }

    // ── Admin: sửa giá (±10% so với giá gốc) ────────────────────────

    @PutMapping("/api/admin/contracts/{contractId}/price")
    public ResponseEntity<ApiResponse<ContractResponse>> updatePrice(
            @PathVariable Long contractId,
            @RequestBody Map<String, Object> body
    ) {
        Long newPrice = Long.parseLong(body.get("newPrice").toString());
        String note   = body.containsKey("note") ? body.get("note").toString() : null;
        return ResponseEntity.ok(ApiResponse.ok(
                "Đã cập nhật giá hợp đồng",
                contractService.updatePrice(contractId, newPrice, note)));
    }

    // ── Admin: đánh dấu hoàn thành → giải ngân 95% + hold 5% warranty ──────

    @PostMapping("/api/admin/contracts/{contractId}/complete")
    public ResponseEntity<ApiResponse<ContractResponse>> completeContract(
            @PathVariable Long contractId,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String note = body != null ? body.get("note") : null;
        return ResponseEntity.ok(ApiResponse.ok(
                "Hợp đồng hoàn thành. Đã giải ngân 95%, giữ 5% bảo hành 6 tháng.",
                contractService.completeContract(contractId, note)));
    }

    // ── Admin: giải ngân 5% bảo hành sau khi hết hạn ────────────────────────

    @PostMapping("/api/admin/contracts/{contractId}/release-warranty")
    public ResponseEntity<ApiResponse<ContractResponse>> releaseWarranty(
            @PathVariable Long contractId,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String note = body != null ? body.get("note") : null;
        return ResponseEntity.ok(ApiResponse.ok(
                "Đã giải ngân tiền bảo hành 5% cho nhà thầu.",
                contractService.releaseWarrantyHold(contractId, note)));
    }
}
