package com.constructx.backend.features.constructor.entity;

import com.constructx.backend.features.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Yeu cau giai ngan tung giai doan.
 * Flow: PENDING -> APPROVED (tien chuyen) / REJECTED / CANCELLED
 *
 * Co che locked balance:
 *  - Toan bo so tien giai ngan vao lockedAmount cua nha thau truoc
 *  - Phan "immediate" = amount * immediateRatio duoc unlock ngay
 *  - Phan con lai giu locked, mo dan theo tien do hoac thu cong
 */
@Entity
@Table(name = "disbursement_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisbursementRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contractor_id", nullable = false)
    private User contractor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    /** Nhan giai doan: "Khoi cong (20%)", "Thi cong tho (50%)", ... */
    @Column(name = "phase_label", nullable = false, length = 100)
    private String phaseLabel;

    /** Nguong tien do yeu cau de mo quyen nay (0-100) */
    @Column(name = "phase_threshold")
    private Integer phaseThreshold;

    /** So tien yeu cau giai ngan (VND) */
    @Column(nullable = false)
    private Long amount;

    /** Ti le duoc dung ngay (0.0 - 1.0). Phan con lai van locked */
    @Builder.Default
    @Column(name = "immediate_ratio")
    private Double immediateRatio = 0.30;

    /** So tien duoc unlock ngay (= amount * immediateRatio) */
    @Column(name = "immediate_amount")
    private Long immediateAmount;

    /** So tien van con locked sau giai ngan */
    @Column(name = "locked_amount")
    private Long lockedAmount;

    /** Tien do thi cong tai thoi diem yeu cau */
    @Column(name = "progress_at_request")
    private Integer progressAtRequest;

    /** Ly do / mo ta yeu cau cua nha thau */
    @Column(columnDefinition = "TEXT")
    private String note;

    /** Ly do tu choi cua khach hang */
    @Column(name = "reject_reason", columnDefinition = "TEXT")
    private String rejectReason;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.PENDING;

    /** Da duoc unlock toan bo (khi hoan cong hoac dat threshold tiep) */
    @Builder.Default
    @Column(name = "fully_unlocked")
    private Boolean fullyUnlocked = false;

    /** Admin da xac nhan yeu cau nay hop le (buoc trung gian truoc khi Customer duyet) */
    @Builder.Default
    @Column(name = "admin_verified")
    private Boolean adminVerified = false;

    @Column(name = "admin_verified_at")
    private LocalDateTime adminVerifiedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_verified_by")
    private User adminVerifiedBy;

    @Column(name = "admin_verify_note", columnDefinition = "TEXT")
    private String adminVerifyNote;

    @Builder.Default
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    public enum Status {
        PENDING,    // Cho khach hang duyet
        APPROVED,   // Da duyet, tien da chuyen
        REJECTED,   // Bi tu choi
        CANCELLED   // Huy (nha thau tu huy)
    }
}
