package com.constructx.backend.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminProjectSummary {
    private Long id;
    private String name;
    private String status;
    private String approvalStatus;
    private String category;
    private Double area;
    private Long budgetMin;
    private Long budgetMax;
    private String customerName;
    private LocalDateTime createdAt;
}