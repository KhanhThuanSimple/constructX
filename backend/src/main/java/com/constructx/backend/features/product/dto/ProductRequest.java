package com.constructx.backend.features.product.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductRequest {
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private String imageUrl;
    private String category;
    private String brand;
    private String material;
    private String dimensions;
    private String color;
    private Integer stock;
    private Boolean featured;
    private Boolean active;
}
