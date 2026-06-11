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
    private Long contractorId;
    private String contractorName;
    private String contractorPhone;
    private Long agreedPrice;
    private Integer estimatedDays;
    private String terms;
    private String adminNote;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private List<ContractStageResponse> stages;

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
