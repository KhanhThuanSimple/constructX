package com.constructx.backend.features.constructor.entity;

import com.constructx.backend.features.project.entity.Project;
import com.constructx.backend.features.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Hợp đồng giữa Bên A (Khách hàng) và Bên B (Nhà thầu),
 * được Admin giám sát và phê duyệt.
 */
@Entity
@Table(name = "contracts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bid_id", nullable = false)
    private Bid bid;

    /** Bên A: Khách hàng */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private User client;

    /** Bên B: Nhà thầu */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contractor_id", nullable = false)
    private User contractor;

    /** Admin giám sát (nullable — gán khi admin review) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private User admin;

    /** Số hợp đồng tự sinh */
    @Column(unique = true, length = 40)
    private String contractNumber;

    /** Giá trị hợp đồng đã chốt */
    private Long agreedPrice;

    /** Số ngày thi công đã chốt */
    private Integer estimatedDays;

    /** Điều khoản chung (admin có thể chỉnh sửa trước khi duyệt) */
    @Column(columnDefinition = "TEXT")
    private String terms;

    /** Ghi chú của admin */
    @Column(columnDefinition = "TEXT")
    private String adminNote;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.PENDING_REVIEW;

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ContractStage> stages = new ArrayList<>();

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;
    private LocalDateTime approvedAt;

    @PreUpdate
    public void preUpdate() { updatedAt = LocalDateTime.now(); }

    public enum Status {
        /** Vừa khởi tạo, chờ Admin kiểm duyệt */
        PENDING_REVIEW,
        /** Admin đã duyệt, chờ hai bên ký */
        WAITING_SIGNATURE,
        /** Hai bên đã ký, đang thi công */
        ACTIVE,
        /** Hoàn thành */
        COMPLETED,
        /** Bị huỷ */
        CANCELLED
    }
}
