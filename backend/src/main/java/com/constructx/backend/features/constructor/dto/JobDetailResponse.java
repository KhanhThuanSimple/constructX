package com.constructx.backend.features.constructor.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobDetailResponse {

    private Long jobId;

    private String projectName;

    private String category;

    private Double area;

    private String style;

    private String address;

    private String description;

    private String customerName;

    private String contractorName;

    private Long agreedPrice;

    private String status;

    private Integer totalProgress;

    private WorkPlanDetailResponse workPlan;
}