package com.constructx.backend.features.portfolio.dto;

import lombok.Data;

@Data
public class PortfolioItemRequest {
    private String title;
    private String description;
    private String category;
    private String imageUrl;
    private Long projectValue;
    private String completionYear;
    private String clientName;
    private String location;
}
