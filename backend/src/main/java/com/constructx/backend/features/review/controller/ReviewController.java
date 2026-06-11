package com.constructx.backend.features.review.controller;

import com.constructx.backend.features.review.dto.ReviewRequest;
import com.constructx.backend.features.review.dto.ReviewResponse;
import com.constructx.backend.features.review.service.ReviewService;
import com.constructx.backend.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    /** POST /api/reviews — tạo đánh giá */
    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(@RequestBody ReviewRequest request) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Đánh giá thành công!", reviewService.createReview(request)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /** GET /api/reviews/user/{userId} — xem đánh giá của một user */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getUserReviews(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(reviewService.getReviewsForUser(userId)));
    }

    /** GET /api/reviews/user/{userId}/summary — tổng hợp rating */
    @GetMapping("/user/{userId}/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRatingSummary(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(reviewService.getUserRatingSummary(userId)));
    }

    /** GET /api/reviews/check?referenceType=ORDER&referenceId=5 — đã review chưa */
    @GetMapping("/check")
    public ResponseEntity<ApiResponse<Boolean>> checkReviewed(
            @RequestParam String referenceType,
            @RequestParam Long referenceId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(reviewService.hasReviewed(referenceType, referenceId)));
    }
}
