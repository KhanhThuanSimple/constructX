package com.constructx.backend.features.order.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Chi tiết hạng mục trong báo giá nhà thầu (OrderBid).
 */
@Entity
@Table(name = "order_bid_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderBidItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_bid_id", nullable = false)
    private OrderBid orderBid;

    @Column(nullable = false)
    private String itemName;

    private String unit;

    private Double quantity;

    @Column(precision = 15, scale = 0)
    private BigDecimal unitPrice;

    @Column(precision = 15, scale = 0)
    private BigDecimal totalPrice;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** Ảnh mẫu của từng hạng mục */
    @Column(length = 500)
    private String sampleImageUrl;
}
