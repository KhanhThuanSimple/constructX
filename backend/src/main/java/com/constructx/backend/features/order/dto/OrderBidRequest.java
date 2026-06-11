package com.constructx.backend.features.order.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderBidRequest {

    private BigDecimal quotedPrice;
    private Integer estimatedDays;
    private String proposal;
    private String portfolioImageUrl;
    private List<ItemRequest> items;

    @Data
    public static class ItemRequest {
        private String itemName;
        private String unit;
        private Double quantity;
        private BigDecimal unitPrice;
        private String description;
        private String sampleImageUrl;
    }
}
