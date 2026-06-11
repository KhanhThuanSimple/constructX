package com.constructx.backend.features.order.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Long id;
    private String orderCode;
    private String type;
    private String status;
    private String statusLabel;
    private BigDecimal totalAmount;
    private String deliveryAddress;
    private String contactPhone;
    private String customerNote;
    private String customRequirements;
    private String referenceImageUrl;
    private String processingNote;
    private String customerName;
    private String customerPhone;
    private Long customerId;

    // Mini-Escrow fields
    private BigDecimal depositPercent;
    private BigDecimal depositAmount;
    private Boolean depositLocked;
    private String completionImageUrl;
    private Boolean contractorMarkedDone;
    private LocalDateTime contractorDoneAt;
    private Boolean termsAccepted;
    private Boolean fullyPaid;
    private Long assignedContractorId;
    private String assignedContractorName;

    private LocalDateTime createdAt;
    private LocalDateTime confirmedAt;
    private LocalDateTime deliveredAt;
    private List<OrderItemResponse> items;

    @Data
    @Builder
    public static class OrderItemResponse {
        private Long id;
        private Long productId;
        private String itemName;
        private String imageUrl;
        private int quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
        private String customNote;
    }
}
