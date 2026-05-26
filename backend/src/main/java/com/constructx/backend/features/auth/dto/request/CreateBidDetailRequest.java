package com.constructx.backend.dto.request;

import lombok.Data;

@Data
public class CreateBidDetailRequest {

    private String itemName;

    private String unit;

    private Double quantity;

    private Long unitPrice;

    private String description;

    private String sampleImage;
}