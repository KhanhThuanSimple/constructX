package com.constructx.backend.features.constructor.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MilestoneDetailResponse {
    private Long id;
    private String title;
    private String description;
    private Long amount;
    private Integer progressPercent;
    private Integer stepOrder;
    private String status;
    private LocalDate deadline;
    private List<MilestoneUpdateResponse> updates;
}
