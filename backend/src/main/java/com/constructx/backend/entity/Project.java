package com.constructx.backend.entity;

import com.constructx.backend.entity.User.ApprovalStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password", "authorities", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "username"})
    private User user;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 100)
    private String category;  // Phòng khách, Phòng ngủ, Bếp...

    private Double area;       // m²

    @Column(length = 100)
    private String style;     // Hiện đại, Scandinavian...

    @Column(length = 300)
    private String address;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Long budgetMin;
    private Long budgetMax;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private BidType bidType = BidType.OPEN;  // OPEN = đấu giá mở, DIRECT = gửi trực tiếp

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.OPEN;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    @Column(length = 500)
    private String adminNote;

    private LocalDateTime approvedAt;

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

     @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (approvalStatus == null) {
            approvalStatus = ApprovalStatus.PENDING;
        }
        if (status == null) {
            status = Status.OPEN;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum BidType { OPEN, DIRECT }

    public enum Status { OPEN, IN_PROGRESS, COMPLETED, CANCELLED }

    public enum ApprovalStatus { PENDING, APPROVED, REJECTED }
}
