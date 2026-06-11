package com.constructx.backend.features.order.entity;

import com.constructx.backend.features.product.entity.Product;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Một dòng sản phẩm trong đơn hàng.
 * - CATALOG: productId có giá trị, customItemName null
 * - CUSTOM:  productId null (hoặc tham chiếu), customItemName có giá trị
 */
@Entity
@Table(name = "order_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    /** Sản phẩm catalog (nullable với CUSTOM item) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    /** Tên sản phẩm (snapshot hoặc custom item name) */
    @Column(nullable = false)
    private String itemName;

    /** Ảnh snapshot tại thời điểm đặt */
    @Column(length = 500)
    private String imageUrl;

    private int quantity;

    /** Đơn giá tại thời điểm đặt */
    @Column(nullable = false, precision = 15, scale = 0)
    private BigDecimal unitPrice;

    /** Thành tiền = quantity × unitPrice */
    @Column(nullable = false, precision = 15, scale = 0)
    private BigDecimal subtotal;

    /** Ghi chú tùy chỉnh riêng cho item này (kích thước, màu, vật liệu) */
    @Column(columnDefinition = "TEXT")
    private String customNote;
}
