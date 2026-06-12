package com.constructx.backend.features.constructor.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ConstructionLogResponse {
    private Long id;
    private Long contractId;
    private String contractNumber;
    private Long contractorId;
    private String contractorName;
    private Integer progressPercent;
    private String description;
    private List<String> imageUrls;
    private String phaseLabel;
    private LocalDateTime createdAt;
}
