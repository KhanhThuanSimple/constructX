package com.constructx.backend.dto;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
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