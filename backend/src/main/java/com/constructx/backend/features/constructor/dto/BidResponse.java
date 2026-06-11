package com.constructx.backend.features.constructor.dto;

import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
@Getter
@Setter
@Data
@Builder
public class BidResponse {

    private Long id;

    private Long projectId;
    private String projectName;
    private String projectCategory;
    private Long projectBudgetMin;
    private Long projectBudgetMax;

    private Long contractorId;

    private String contractorName;

    private String contractorEmail;

    private String contractorPhone;

    // tổng tiền
    private Long totalPrice;

    private Integer estimatedDays;

    private String message;

    // mẫu thiết kế tổng
    private String designImage;

    private Integer warrantyMonths;

    private String paymentTerms;

    private String status;

    private LocalDateTime createdAt;

    private LocalDateTime submittedAt;

    private LocalDateTime reviewedAt;

    private List<BidDetailResponse> details;
}