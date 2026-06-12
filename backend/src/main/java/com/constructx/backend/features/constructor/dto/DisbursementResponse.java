package com.constructx.backend.features.constructor.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class DisbursementResponse {
    private Long id;
    private Long contractId;
    private String contractNumber;
    private String projectName;
    private Long contractorId;
    private String contractorName;
    private String phaseLabel;
    private Integer phaseThreshold;
    private Long amount;
    private Double immediateRatio;
    private Long immediateAmount;
    private Long lockedAmount;
    private Integer progressAtRequest;
    private String note;
    private String rejectReason;
    private String status;
    private Boolean fullyUnlocked;
    private String reviewedBy;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
    // Admin verify step
    private Boolean adminVerified;
    private LocalDateTime adminVerifiedAt;
    private String adminVerifiedBy;
    private String adminVerifyNote;
}
