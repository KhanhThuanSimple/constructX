package com.constructx.backend.dto.request;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MilestoneRequest {

    private String title;

    private String description;

    private Long amount;

    private Integer progressPercent;

    private LocalDate deadline;
}