package com.constructx.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ProjectResponse {

    private Long id;

    private String name;

    private String category;

    private Double area;

    private String style;

    private String address;

    private String description;

    private Long budgetMin;

    private Long budgetMax;

    private String bidType;

    private String status;

    private String ownerName;

    private String ownerPhone;

    private LocalDateTime createdAt;
}