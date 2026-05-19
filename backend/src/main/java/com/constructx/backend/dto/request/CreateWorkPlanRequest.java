package com.constructx.backend.dto.request;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateWorkPlanRequest {

    private String note;

    private List<MilestoneRequest> milestones;
}