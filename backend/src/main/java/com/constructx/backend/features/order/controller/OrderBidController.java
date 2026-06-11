package com.constructx.backend.features.order.controller;

import com.constructx.backend.features.order.dto.OrderBidRequest;
import com.constructx.backend.features.order.dto.OrderBidResponse;
import com.constructx.backend.features.order.dto.OrderResponse;
import com.constructx.backend.features.order.service.OrderBidService;
import com.constructx.backend.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class OrderBidController {

    private final OrderBidService orderBidService;

    // ── PUBLIC BIDDING: Contractor xem đơn đang mở ─────────────────

    /** GET /api/order-bids/open — danh sách đơn đang mở đấu giá (contractor) */
    @GetMapping("/api/order-bids/open")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOpenBiddingOrders() {
        return ResponseEntity.ok(ApiResponse.ok(orderBidService.getOpenBiddingOrders()));
    }

    /** POST /api/order-bids/{orderId} — contractor gửi báo giá */
    @PostMapping("/api/order-bids/{orderId}")
    public ResponseEntity<ApiResponse<OrderBidResponse>> submitBid(
            @PathVariable Long orderId,
            @RequestBody OrderBidRequest request
    ) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Gửi báo giá thành công!",
                    orderBidService.submitBid(orderId, request)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /** GET /api/order-bids/my — contractor xem bids của mình */
    @GetMapping("/api/order-bids/my")
    public ResponseEntity<ApiResponse<List<OrderBidResponse>>> getMyBids() {
        return ResponseEntity.ok(ApiResponse.ok(orderBidService.getMyBids()));
    }

    /** GET /api/order-bids/assigned — contractor xem đơn hàng được giao */
    @GetMapping("/api/order-bids/assigned")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyAssignedOrders() {
        try {
            return ResponseEntity.ok(ApiResponse.ok(orderBidService.getMyAssignedOrders()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /** GET /api/order-bids/order/{orderId} — owner/admin xem tất cả bids (blind) */
    @GetMapping("/api/order-bids/order/{orderId}")
    public ResponseEntity<ApiResponse<List<OrderBidResponse>>> getOrderBids(
            @PathVariable Long orderId
    ) {
        try {
            return ResponseEntity.ok(ApiResponse.ok(orderBidService.getOrderBids(orderId)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /** POST /api/order-bids/order/{orderId}/accept/{bidId} — owner chọn nhà thầu */
    @PostMapping("/api/order-bids/order/{orderId}/accept/{bidId}")
    public ResponseEntity<ApiResponse<OrderBidResponse>> acceptBid(
            @PathVariable Long orderId,
            @PathVariable Long bidId
    ) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Đã chọn nhà thầu thành công!",
                    orderBidService.acceptBid(orderId, bidId)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // ── ADMIN: Duyệt đơn → mở đấu giá ──────────────────────────────

    /** POST /api/admin/orders/{orderId}/approve-bidding — admin duyệt mở đấu giá */
    @PostMapping("/api/admin/orders/{orderId}/approve-bidding")
    public ResponseEntity<ApiResponse<OrderResponse>> approveOrderForBidding(
            @PathVariable Long orderId,
            @RequestBody(required = false) Map<String, String> body
    ) {
        try {
            String note = body != null ? body.get("note") : null;
            return ResponseEntity.ok(ApiResponse.ok("Đã duyệt và mở đấu giá thành công!",
                    orderBidService.approveOrderForBidding(orderId, note)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
