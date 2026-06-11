package com.constructx.backend.features.order.entity;

import com.constructx.backend.features.product.entity.Product;
import com.constructx.backend.features.user.entity.User;import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Đơn đặt hàng sản phẩm từ Shop (có sẵn hoặc tùy chỉnh).
 * Luồng: PENDING → CONFIRMED (admin/contractor xác nhận) → PROCESSING → SHIPPED → DELIVERED → CANCELLED
 */
@Entity
@Table(name = "orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Mã đơn hàng hiển thị */
    @Column(unique = true, length = 30)
    private String orderCode;

    /** Khách hàng đặt hàng */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    /** Loại đơn: CATALOG (sản phẩm có sẵn), CUSTOM (yêu cầu riêng) */
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private OrderType type = OrderType.CATALOG;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.PENDING;

    /** Tổng tiền */
    private BigDecimal totalAmount;

    /** Địa chỉ giao hàng */
    @Column(columnDefinition = "TEXT")
    private String deliveryAddress;

    /** Số điện thoại nhận hàng */
    private String contactPhone;

    /** Ghi chú của khách hàng */
    @Column(columnDefinition = "TEXT")
    private String customerNote;

    /** Yêu cầu tùy chỉnh (cho CUSTOM order) */
    @Column(columnDefinition = "TEXT")
    private String customRequirements;

    /** Ảnh tham khảo thiết kế (cho CUSTOM order) */
    @Column(length = 500)
    private String referenceImageUrl;

    /** Ghi chú xử lý của admin/contractor */
    @Column(columnDefinition = "TEXT")
    private String processingNote;

    /** Nhà thầu được chọn (sau khi user chọn báo giá hoặc admin chỉ định) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_contractor_id")
    private User assignedContractor;

    /** ID bid được chọn */
    private Long selectedBidId;

    // ── Mini-Escrow fields ─────────────────────────────────────────

    /** Tỷ lệ đặt cọc (%) — mặc định 60 */
    @Builder.Default
    private java.math.BigDecimal depositPercent = java.math.BigDecimal.valueOf(60);

    /** Số tiền đặt cọc thực tế (tính từ totalAmount * depositPercent / 100) */
    private java.math.BigDecimal depositAmount;

    /** Đã lock tiền đặt cọc vào ví Frozen chưa */
    @Builder.Default
    private Boolean depositLocked = false;

    /** Ảnh sản phẩm hoàn thiện do nhà thầu upload */
    @Column(length = 500)
    private String completionImageUrl;

    /** Nhà thầu đã báo hoàn thành chưa */
    @Builder.Default
    private Boolean contractorMarkedDone = false;

    /** Thời điểm nhà thầu báo hoàn thành (bắt đầu đếm 24h auto-release) */
    private LocalDateTime contractorDoneAt;

    /** Khách hàng đã chấp nhận điều khoản mua hàng chưa */
    @Builder.Default
    private Boolean termsAccepted = false;

    /** Đơn đã được giải ngân hoàn toàn chưa */
    @Builder.Default
    private Boolean fullyPaid = false;

    // ──────────────────────────────────────────────────────────────

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;
    private LocalDateTime confirmedAt;
    private LocalDateTime deliveredAt;

    @PreUpdate
    public void preUpdate() { updatedAt = LocalDateTime.now(); }

    public enum OrderType {
        CATALOG,   // mua sản phẩm có sẵn từ shop
        CUSTOM     // yêu cầu thi công/sản xuất riêng
    }

    public enum Status {
        PENDING,        // Chờ Admin xem xét
        CONFIRMED,      // Admin đã xác nhận (CATALOG order, alias của PROCESSING)
        DEPOSIT_PAID,   // Khách đã cọc 60%, chờ nhà thầu sản xuất
        OPEN_BIDDING,   // Admin đã duyệt → mở đấu giá công khai cho nhà thầu (CUSTOM)
        BIDDING_CLOSED, // Đã chọn nhà thầu, đang ký hợp đồng
        PROCESSING,     // Đang thi công / sản xuất
        SHIPPED,        // Đang giao hàng
        DELIVERED,      // Đã nhận hàng / Hoàn thành
        CANCELLED       // Đã hủy
    }
}
