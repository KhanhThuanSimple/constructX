package com.constructx.backend.features.project.entity;

import com.constructx.backend.features.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String category;

    private Double area;

    private String style;

    private String address;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Long budgetMin;

    private Long budgetMax;

    @Enumerated(EnumType.STRING)
    private BidType bidType;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Enumerated(EnumType.STRING)
    private ApprovalStatus approvalStatus;

    // thêm
    @Column(columnDefinition = "TEXT")
    private String adminNote;

    // thêm
    private LocalDateTime approvedAt;

    private LocalDateTime createdAt;

    @ElementCollection(fetch = jakarta.persistence.FetchType.EAGER)
    private List<String> imageUrls;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (approvalStatus == null) approvalStatus = ApprovalStatus.PENDING;
    }

    public enum Status {
        DRAFT,
        OPEN,
        IN_PROGRESS,
        COMPLETED,
        CLOSED,
        CANCELLED
    }

    public enum BidType {
        FIXED_PRICE,
        NEGOTIABLE
    }

    public enum ApprovalStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
}