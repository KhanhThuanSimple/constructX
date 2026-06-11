package com.constructx.backend.features.order.entity;

import com.constructx.backend.features.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Báo giá của nhà thầu cho đơn hàng CUSTOM đang mở đấu thầu.
 * Đây là "blind bid" — nhà thầu không thấy báo giá của đối thủ.
 */
@Entity
@Table(name = "order_bids")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderBid {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contractor_id", nullable = false)
    private User contractor;

    /** Tổng giá báo (có thể 0 nếu chưa xác định) */
    @Column(precision = 15, scale = 0)
    private BigDecimal quotedPrice;

    /** Số ngày dự kiến hoàn thành */
    private Integer estimatedDays;

    /** Mô tả giải pháp / hồ sơ năng lực */
    @Column(columnDefinition = "TEXT")
    private String proposal;

    /** URL ảnh mẫu / portfolio */
    @Column(length = 500)
    private String portfolioImageUrl;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.PENDING;

    @OneToMany(mappedBy = "orderBid", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderBidItem> items = new ArrayList<>();

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Status {
        PENDING,    // Đang chờ user xem xét
        ACCEPTED,   // User đã chọn nhà thầu này
        REJECTED    // Không được chọn
    }
}
