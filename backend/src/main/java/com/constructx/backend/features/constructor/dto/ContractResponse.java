package com.constructx.backend.features.constructor.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ContractResponse {
    private Long id;
    private String contractNumber;
    private Long projectId;
    private String projectName;
    private Long bidId;
    private Long clientId;
    private String clientName;
    private String clientPhone;
    private String clientEmail;
    private Long contractorId;
    private String contractorName;
    private String contractorPhone;
    private String contractorEmail;
    private String contractorAddress;
    // Admin chứng thực
    private Long adminId;
    private String adminName;
    private String adminEmail;
    // Liên kết đơn hàng (nếu hợp đồng tạo từ Order)
    private Long orderId;
    private String orderCode;
    private Long agreedPrice;
    private Long originalAgreedPrice;
    private Integer estimatedDays;
    private String terms;
    private String adminNote;
    private String status;
    // Escrow info
    private Long customerDepositAmount;
    private Boolean customerDepositLocked;
    private Long contractorDepositAmount;
    private Boolean contractorDepositLocked;
    // Signing status
    private Boolean clientSigned;
    private Boolean contractorSigned;
    private LocalDateTime clientSignedAt;
    private LocalDateTime contractorSignedAt;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private List<ContractStageResponse> stages;
    // Warranty hold (5% bảo hành 6 tháng)
    private Long warrantyHoldAmount;
    private Boolean warrantyHoldLocked;
    private Boolean warrantyReleased;
    private String warrantyEndDate;
    private LocalDateTime completedAt;
    private Long disputeAmount;
    private String disputeReason;
    private Boolean isDisputed;

    @Data
    @Builder
    public static class ContractStageResponse {
        private Long id;
        private String stage;
        private String note;
        private String performedBy;
        private LocalDateTime createdAt;
    }
}
