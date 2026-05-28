package com.constructx.backend.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkPlanDetailResponse {

    private Long id;

    private String note;

    private String status;

    private List<MilestoneDetailResponse> milestones;
}