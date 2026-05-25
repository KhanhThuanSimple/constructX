package com.constructx.backend.admin.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminProjectResponse {
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
    private String approvalStatus;
    private String adminNote;
    private LocalDateTime approvedAt;
    private LocalDateTime createdAt;
    private Long customerId;
    private String customerName;
    private String customerEmail;
}