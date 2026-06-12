package com.constructx.backend.features.constructor.controller;

import com.constructx.backend.features.constructor.dto.ConstructionLogResponse;
import com.constructx.backend.features.constructor.dto.DisbursementResponse;
import com.constructx.backend.features.constructor.dto.request.CreateConstructionLogRequest;
import com.constructx.backend.features.constructor.dto.request.CreateDisbursementRequest;
import com.constructx.backend.features.constructor.service.ConstructionLogService;
import com.constructx.backend.features.constructor.service.DisbursementService;
import com.constructx.backend.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ConstructionLogController {

    private final ConstructionLogService constructionLogService;
    private final DisbursementService disbursementService;

    // ── NHẬT KÝ THI CÔNG ────────────────────────────────────────────────────

    /**
     * Nhà thầu: tạo nhật ký thi công mới
     * POST /api/construction-logs
     */
    @PostMapping("/api/construction-logs")
    public ResponseEntity<ApiResponse<ConstructionLogResponse>> createLog(
            @Valid @RequestBody CreateConstructionLogRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Đã lưu nhật ký thi công",
                constructionLogService.createLog(req)));
    }

    /**
     * Xem danh sách nhật ký của một hợp đồng
     * GET /api/contracts/{contractId}/construction-logs
     */
    @GetMapping("/api/contracts/{contractId}/construction-logs")
    public ResponseEntity<ApiResponse<List<ConstructionLogResponse>>> getLogsByContract(
            @PathVariable Long contractId) {
        return ResponseEntity.ok(ApiResponse.ok(
                constructionLogService.getLogsByContract(contractId)));
    }

    /**
     * Lấy % tiến độ hiện tại của hợp đồng
     * GET /api/contracts/{contractId}/progress
     */
    @GetMapping("/api/contracts/{contractId}/progress")
    public ResponseEntity<ApiResponse<Integer>> getProgress(@PathVariable Long contractId) {
        return ResponseEntity.ok(ApiResponse.ok(
                constructionLogService.getCurrentProgress(contractId)));
    }

    // ── YÊU CẦU GIẢI NGÂN ───────────────────────────────────────────────────

    /**
     * Nhà thầu: gửi yêu cầu giải ngân
     * POST /api/disbursements
     */
    @PostMapping("/api/disbursements")
    public ResponseEntity<ApiResponse<DisbursementResponse>> requestDisbursement(
            @Valid @RequestBody CreateDisbursementRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Đã gửi yêu cầu giải ngân. Chờ khách hàng xác nhận.",
                disbursementService.requestDisbursement(req)));
    }

    /**
     * Xem danh sách yêu cầu giải ngân của hợp đồng
     * GET /api/contracts/{contractId}/disbursements
     */
    @GetMapping("/api/contracts/{contractId}/disbursements")
    public ResponseEntity<ApiResponse<List<DisbursementResponse>>> getDisbursements(
            @PathVariable Long contractId) {
        return ResponseEntity.ok(ApiResponse.ok(
                disbursementService.getByContract(contractId)));
    }

    /**
     * Khách hàng: duyệt yêu cầu giải ngân
     * POST /api/disbursements/{requestId}/approve
     */
    @PostMapping("/api/disbursements/{requestId}/approve")
    public ResponseEntity<ApiResponse<DisbursementResponse>> approveDisbursement(
            @PathVariable Long requestId) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Đã duyệt giải ngân. Tiền đã chuyển sang ví nhà thầu.",
                disbursementService.approveDisbursement(requestId)));
    }

    /**
     * Khách hàng: từ chối yêu cầu giải ngân
     * POST /api/disbursements/{requestId}/reject
     */
    @PostMapping("/api/disbursements/{requestId}/reject")
    public ResponseEntity<ApiResponse<DisbursementResponse>> rejectDisbursement(
            @PathVariable Long requestId,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(ApiResponse.ok(
                "Đã từ chối yêu cầu giải ngân.",
                disbursementService.rejectDisbursement(requestId, reason)));
    }

    /**
     * Nhà thầu: hủy yêu cầu chưa được xử lý
     * POST /api/disbursements/{requestId}/cancel
     */
    @PostMapping("/api/disbursements/{requestId}/cancel")
    public ResponseEntity<ApiResponse<DisbursementResponse>> cancelDisbursement(
            @PathVariable Long requestId) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Đã hủy yêu cầu giải ngân.",
                disbursementService.cancelDisbursement(requestId)));
    }

    /**
     * Admin: xác nhận yêu cầu giải ngân hợp lệ (bước trước khi Customer duyệt)
     * POST /api/disbursements/{requestId}/admin-verify
     */
    @PostMapping("/api/disbursements/{requestId}/admin-verify")
    public ResponseEntity<ApiResponse<DisbursementResponse>> adminVerifyDisbursement(
            @PathVariable Long requestId,
            @RequestBody(required = false) Map<String, String> body) {
        String note = body != null ? body.get("note") : null;
        return ResponseEntity.ok(ApiResponse.ok(
                "✅ Admin đã xác nhận. Thông báo gửi đến khách hàng để duyệt.",
                disbursementService.adminVerifyDisbursement(requestId, note)));
    }

    /**
     * Admin / Khách hàng: mở khóa phần tiền bảo đảm đang locked
     * POST /api/disbursements/{requestId}/unlock
     */
    @PostMapping("/api/disbursements/{requestId}/unlock")
    public ResponseEntity<ApiResponse<DisbursementResponse>> unlockLocked(
            @PathVariable Long requestId) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Đã mở khóa tiền bảo đảm.",
                disbursementService.unlockLockedAmount(requestId)));
    }
}
