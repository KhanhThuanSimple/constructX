package com.constructx.backend.features.order.controller;

import com.constructx.backend.features.order.dto.OrderRequest;
import com.constructx.backend.features.order.dto.OrderResponse;
import com.constructx.backend.features.order.service.OrderBidService;
import com.constructx.backend.features.order.service.OrderPaymentService;
import com.constructx.backend.features.order.service.OrderService;
import com.constructx.backend.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final OrderPaymentService orderPaymentService;
    private final OrderBidService orderBidService;

    // ── Customer endpoints ──────────────────────────────────────────

    /** POST /api/orders — đặt hàng */
    @PostMapping("/api/orders")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(@RequestBody OrderRequest request) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Đặt hàng thành công!", orderService.createOrder(request)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /** GET /api/orders/my — đơn hàng của tôi */
    @GetMapping("/api/orders/my")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders() {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getMyOrders()));
    }

    /** GET /api/orders/{id} — chi tiết đơn hàng */
    @GetMapping("/api/orders/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(ApiResponse.ok(orderService.getMyOrderById(id)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /** POST /api/orders/{id}/cancel — hủy đơn (hoàn tiền cọc tự động) */
    @PostMapping("/api/orders/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Đã hủy đơn hàng và hoàn tiền cọc", orderService.cancelOrder(id)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * POST /api/orders/{id}/pay-deposit
     * Dành cho đơn CUSTOM: khách chốt giá với nhà thầu xong, bấm đặt cọc.
     */
    @PostMapping("/api/orders/{id}/pay-deposit")
    public ResponseEntity<ApiResponse<String>> payDeposit(@PathVariable Long id) {
        try {
            orderPaymentService.lockDepositForCustomOrder(id);
            return ResponseEntity.ok(ApiResponse.ok("Đặt cọc thành công! Nhà thầu sẽ bắt đầu sản xuất."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * POST /api/orders/{id}/confirm-delivery
     * Khách xác nhận đã nhận hàng → giải ngân 100% cho nhà thầu (trừ phí sàn 5%).
     */
    @PostMapping("/api/orders/{id}/confirm-delivery")
    public ResponseEntity<ApiResponse<String>> confirmDelivery(@PathVariable Long id) {
        try {
            orderPaymentService.confirmDelivery(id);
            return ResponseEntity.ok(ApiResponse.ok("Xác nhận thành công! Thanh toán đã được giải ngân cho nhà thầu."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * POST /api/orders/{id}/mark-done
     * Nhà thầu báo sản phẩm đã hoàn thiện và đang giao.
     * Body: { "completionImageUrl": "https://..." }
     */
    @PostMapping("/api/orders/{id}/mark-done")
    public ResponseEntity<ApiResponse<String>> markDone(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        try {
            orderPaymentService.markContractorDone(id, body.get("completionImageUrl"));
            return ResponseEntity.ok(ApiResponse.ok("Đã báo hoàn thành! Khách hàng sẽ xác nhận trong 24h."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // ── Admin endpoints ─────────────────────────────────────────────

    /** GET /api/admin/orders — tất cả đơn hàng */
    @GetMapping("/api/admin/orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAllOrders(
            @RequestParam(defaultValue = "all") String status
    ) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getAllOrders(status)));
    }

    /** PUT /api/admin/orders/{id}/status — cập nhật trạng thái */
    @PutMapping("/api/admin/orders/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Cập nhật thành công",
                    orderService.updateOrderStatus(id, body.get("status"), body.get("note"))));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * POST /api/admin/orders/{id}/assign-contractor
     * Admin gán nhà thầu cho đơn CATALOG (không qua đấu thầu).
     * Body: { "contractorId": 123 }
     */
    @PostMapping("/api/admin/orders/{id}/assign-contractor")
    public ResponseEntity<ApiResponse<OrderResponse>> assignContractor(
            @PathVariable Long id,
            @RequestBody Map<String, Long> body
    ) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Đã gán nhà thầu",
                    orderService.assignContractor(id, body.get("contractorId"))));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
