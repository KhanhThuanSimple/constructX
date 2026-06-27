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
 *
 * Dòng tiền Escrow mới:
 *  - Khi Customer chấp nhận báo giá: Lock 100% agreedPrice từ ví Customer vào Escrow
 *  - Contractor ký HĐ: Lock ký quỹ 5-10% từ ví nhà thầu
 *  - Thi công theo milestone 20/50/80%: Admin verify → Customer approve → giải ngân từng đợt
 *  - Hoàn công 100%: Admin xác nhận → giải ngân 95%, giữ 5% warranty hold
 *  - Sau 6 tháng bảo hành: giải ngân 5% còn lại → COMPLETED
 *  - Khi CANCELLED bởi Client (ACTIVE): mất escrow → 70% nhà thầu, 30% nền tảng; nhà thầu lấy lại ký quỹ
 *  - Khi CANCELLED bởi Contractor (ACTIVE): mất ký quỹ → nền tảng; khách lấy lại escrow + trừ điểm uy tín
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
    @JoinColumn(name = "project_id", nullable = true)
    private Project project;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bid_id", nullable = true)
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

    /** Giá trị ban đầu khi tạo HĐ — dùng để validate chỉnh sửa không lệch quá 10% */
    @Column(name = "original_agreed_price")
    private Long originalAgreedPrice;

    /** Giá trị hợp đồng hiện tại (có thể sửa trong giới hạn ±10% so với originalAgreedPrice) */
    @Column(name = "agreed_price")
    private Long agreedPrice;

    /** Số ngày thi công đã chốt */
    private Integer estimatedDays;

    /** Điều khoản chung (admin có thể chỉnh sửa trước khi duyệt) */
    @Column(columnDefinition = "TEXT")
    private String terms;

    /** Ghi chú của admin */
    @Column(columnDefinition = "TEXT")
    private String adminNote;

    // ── Escrow: Cọc khách hàng (100% agreedPrice — toàn bộ vào Escrow) ──────

    /** Tỷ lệ escrow khách hàng — mặc định 100% (toàn bộ giá trị HĐ) */
    @Builder.Default
    @Column(name = "customer_deposit_percent")
    private Double customerDepositPercent = 100.0;

    /** Số tiền escrow thực tế của khách hàng (= agreedPrice) */
    @Column(name = "customer_deposit_amount")
    private Long customerDepositAmount;

    /** Đã lock tiền escrow của khách hàng chưa */
    @Builder.Default
    @Column(name = "customer_deposit_locked")
    private Boolean customerDepositLocked = false;

    // ── Escrow: Ký quỹ nhà thầu (5% agreedPrice) ─────────────────

    /** Tỷ lệ ký quỹ nhà thầu — mặc định 5% */
    @Builder.Default
    @Column(name = "contractor_deposit_percent")
    private Double contractorDepositPercent = 5.0;

    /** Số tiền ký quỹ thực tế của nhà thầu */
    @Column(name = "contractor_deposit_amount")
    private Long contractorDepositAmount;

    /** Đã lock tiền ký quỹ của nhà thầu chưa */
    @Builder.Default
    @Column(name = "contractor_deposit_locked")
    private Boolean contractorDepositLocked = false;

    // ── Trạng thái ký ─────────────────────────────────────────────

    /** Khách hàng đã ký chưa */
    @Builder.Default
    @Column(name = "client_signed")
    private Boolean clientSigned = false;

    @Column(name = "client_signed_at")
    private LocalDateTime clientSignedAt;

    /** Nhà thầu đã ký chưa */
    @Builder.Default
    @Column(name = "contractor_signed")
    private Boolean contractorSigned = false;

    @Column(name = "contractor_signed_at")
    private LocalDateTime contractorSignedAt;

    // ── Thông tin hủy hợp đồng ────────────────────────────────────

    /** Bên hủy: CLIENT hoặc CONTRACTOR */
    @Enumerated(EnumType.STRING)
    @Column(name = "cancelled_by", length = 20)
    private CancelledBy cancelledBy;

    /** Lý do hủy */
    @Column(name = "cancel_reason", columnDefinition = "TEXT")
    private String cancelReason;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    // ── Điểm uy tín (áp dụng cho nhà thầu) ───────────────────────

    /** Điểm uy tín nhà thầu lúc tạo HĐ — dùng để ghi log, không tự động cập nhật ở đây */
    @Builder.Default
    @Column(name = "contractor_reputation_score")
    private Integer contractorReputationScore = 100;

    // ── Warranty Hold (5% giữ lại sau hoàn công) ──────────────────

    /** Số tiền giữ lại bảo hành = 5% agreedPrice */
    @Column(name = "warranty_hold_amount")
    private Long warrantyHoldAmount;

    /** Tiền bảo hành đang locked trong ví nhà thầu */
    @Builder.Default
    @Column(name = "warranty_hold_locked")
    private Boolean warrantyHoldLocked = false;

    /** Ngày kết thúc bảo hành (completedAt + 6 tháng) */
    @Column(name = "warranty_end_date")
    private LocalDateTime warrantyEndDate;

    /** Tiền bảo hành đã được giải ngân chưa */
    @Builder.Default
    @Column(name = "warranty_released")
    private Boolean warrantyReleased = false;

    /** Khách hàng đã xác nhận hoàn công chưa */
    @Builder.Default
    @Column(name = "client_confirmed_completion")
    private Boolean clientConfirmedCompletion = false;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // ──────────────────────────────────────────────────────────────

    /** Hợp đồng từ đơn hàng shop (nullable — chỉ khi tạo từ Order/OrderBid) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private com.constructx.backend.features.order.entity.Order sourceOrder;

    @Builder.Default
    @Column(name = "is_disputed", nullable = false)
    private Boolean isDisputed = false;

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
        /** Cả hai đã ký + cọc đã lock → đang thi công */
        ACTIVE,
        /** Hoàn thành — đã giải ngân */
        COMPLETED,
        /** Bị huỷ — cọc bị xử lý theo quy tắc */
        CANCELLED
    }

    public enum CancelledBy {
        CLIENT, CONTRACTOR
    }
}
