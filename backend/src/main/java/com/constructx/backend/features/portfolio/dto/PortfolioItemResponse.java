package com.constructx.backend.features.portfolio.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PortfolioItemResponse {
    private Long id;
    private Long contractorId;
    private String contractorName;
    private String title;
    private String description;
    private String category;
    private String imageUrl;
    private Long projectValue;
    private String completionYear;
    private String clientName;
    private String location;
    private LocalDateTime createdAt;
}
