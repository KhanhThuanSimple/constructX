package com.constructx.backend.entity;

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

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum BidType { OPEN, DIRECT }

    public enum Status { OPEN, IN_PROGRESS, COMPLETED, CANCELLED }
}
