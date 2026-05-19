package com.constructx.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BidDetailResponse {

    private Long id;

    private String itemName;

    private String unit;

    private Double quantity;

    private Long unitPrice;

    private Long totalPrice;

    private String description;

    private String sampleImage;
}