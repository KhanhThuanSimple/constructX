package com.constructx.backend.features.review.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReviewResponse {
    private Long id;
    private Long reviewerId;
    private String reviewerName;
    private String reviewerAvatar;
    private Long revieweeId;
    private String revieweeName;
    private String referenceType;
    private Long referenceId;
    private Integer rating;
    private String comment;
    private Integer qualityScore;
    private Integer communicationScore;
    private Integer progressScore;
    private LocalDateTime createdAt;
}

