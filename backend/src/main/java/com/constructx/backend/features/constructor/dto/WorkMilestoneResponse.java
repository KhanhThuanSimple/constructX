package com.constructx.backend.features.constructor.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkMilestoneResponse {

    private Long id;

    private String title;

    private String description;

    private Long amount;

    private Integer progressPercent;

    private Integer stepOrder;

    private LocalDate deadline;

    private String status;
}