package com.constructx.backend.features.product.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ProductResponse {
    private Long id;
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
    private Double rating;
    private Integer reviewCount;
    private Boolean featured;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
