package com.constructx.backend.features.review.dto;

import lombok.Data;

@Data
public class ReviewRequest {
    private Integer rating;      // 1–5
    private String comment;
    private String referenceType; // ORDER | PROJECT
    private Long referenceId;
    private Long revieweeId;     // id của người được đánh giá
}
