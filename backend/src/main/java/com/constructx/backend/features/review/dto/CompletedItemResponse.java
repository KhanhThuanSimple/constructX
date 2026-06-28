package com.constructx.backend.features.review.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CompletedItemResponse {
    private String referenceType; // PROJECT | ORDER
    private Long referenceId;
    private String name;
    private Long price;
    private LocalDateTime completedAt;
    private Long partnerId;
    private String partnerName;
    private Boolean hasReviewed;
    private ReviewResponse review;
}
