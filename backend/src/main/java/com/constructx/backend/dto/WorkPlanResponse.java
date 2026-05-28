package com.constructx.backend.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkPlanResponse {

    private Long id;

    private Long jobId;

    private String note;

    private String status;

    private LocalDateTime createdAt;

    private List<WorkMilestoneResponse> milestones;
}