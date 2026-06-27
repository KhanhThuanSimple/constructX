package com.constructx.backend.admin.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class DisputeResponse {
    private Long id;
    private Long projectId;
    private String projectName;
    private Long contractId;
    private String contractNumber;
    private String customerName;
    private String contractorName;
    private String reason;
    private Long amount;
    private String status;
    private String resolution;
    private String resolutionType;
    private Long refundAmount;
    private LocalDateTime createdAt;
    private List<DisputeMessageResponse> messages;

    // Phân rã tài chính nhiều giai đoạn phục vụ FE hiển thị trực quan
    private Long customerRemainingEscrow;
    private Long contractorLockedEscrow;
    private Long disputePool;
    private Boolean isDisputed;
}
