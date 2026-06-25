package com.constructx.backend.features.review.entity;

import com.constructx.backend.features.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Đánh giá sau khi đơn hàng/dự án hoàn thành.
 * reviewer = người đánh giá (customer đánh giá contractor hoặc ngược lại)
 * reviewee = người được đánh giá
 * referenceType: ORDER | PROJECT
 */
@Entity
@Table(name = "reviews",
       uniqueConstraints = @UniqueConstraint(columnNames = {"reviewer_id","reference_type","reference_id"}))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewee_id", nullable = false)
    private User reviewee;

    @Column(name = "reference_type", nullable = false, length = 20)
    private String referenceType; // ORDER | PROJECT

    @Column(name = "reference_id", nullable = false)
    private Long referenceId;

    @Column(nullable = false)
    private Integer rating; // 1–5

    @Column(name = "quality_score")
    private Integer qualityScore; // 1-5 sao về chất lượng

    @Column(name = "communication_score")
    private Integer communicationScore; // 1-5 sao về giao tiếp

    @Column(name = "progress_score")
    private Integer progressScore; // 1-5 sao về tiến độ

    @Column(length = 1000)
    private String comment;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
