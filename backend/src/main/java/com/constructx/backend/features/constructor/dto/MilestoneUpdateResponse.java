package com.constructx.backend.features.constructor.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MilestoneUpdateResponse {

    private Long id;

    private Long milestoneId;

    private String title;

    private String content;

    private String imageUrl;

    private LocalDateTime createdAt;
}