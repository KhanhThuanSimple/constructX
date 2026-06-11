package com.constructx.backend.features.constructor.entity;

import com.constructx.backend.features.project.entity.Project;
import com.constructx.backend.features.user.entity.User;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bids")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Bid {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // dự án
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    // nhà thầu
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contractor_id", nullable = false)
    private User contractor;

    // tổng tiền backend tự tính
    private Long totalPrice;

    // tổng số ngày dự kiến
    private Integer estimatedDays;

    @Column(columnDefinition = "TEXT")
    private String message;

    // mẫu thiết kế tổng thể
    private String designImage;

    @Column(name = "warranty_months")
    @Builder.Default
    private Integer warrantyMonths = 0;

    @Column(name = "payment_terms", columnDefinition = "TEXT")
    private String paymentTerms;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.PENDING;

    @OneToMany(
            mappedBy = "bid",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private List<BidDetail> details = new ArrayList<>();

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "submitted_at")
    @Builder.Default
    private LocalDateTime submittedAt = LocalDateTime.now();

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    public enum Status {
        PENDING,
        ACCEPTED,
        REJECTED,
        CANCELLED,
        WITHDRAWN
    }
}