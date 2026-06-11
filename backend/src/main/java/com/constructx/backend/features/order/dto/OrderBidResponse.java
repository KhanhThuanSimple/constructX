package com.constructx.backend.features.order.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderBidResponse {
    private Long id;
    private Long orderId;
    private String orderCode;
    private Long contractorId;
    private String contractorName;
    private String contractorPhone;
    private String contractorAddress;
    private BigDecimal quotedPrice;
    private Integer estimatedDays;
    private String proposal;
    private String portfolioImageUrl;
    private String status;
    private LocalDateTime createdAt;
    private List<ItemResponse> items;

    // Thông tin order cho contractor view
    private String orderType;
    private String orderStatus;
    private String customRequirements;
    private String deliveryAddress;

    @Data
    @Builder
    public static class ItemResponse {
        private Long id;
        private String itemName;
        private String unit;
        private Double quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
        private String description;
        private String sampleImageUrl;
    }
}
