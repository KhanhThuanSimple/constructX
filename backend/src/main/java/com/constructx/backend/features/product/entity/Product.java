package com.constructx.backend.features.product.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** Giá bán (VND) */
    @Column(nullable = false, precision = 15, scale = 0)
    private BigDecimal price;

    /** Giá gốc để hiện khuyến mãi (nullable) */
    @Column(precision = 15, scale = 0)
    private BigDecimal originalPrice;

    /** URL ảnh chính */
    @Column(length = 500)
    private String imageUrl;

    /** Danh mục: SOFA, TABLE, CHAIR, BED, CABINET, DECOR, … */
    @Column(length = 100)
    private String category;

    /** Thương hiệu / xuất xứ */
    @Column(length = 100)
    private String brand;

    /** Vật liệu chính */
    @Column(length = 200)
    private String material;

    /** Kích thước (VD: "120x60x75 cm") */
    @Column(length = 100)
    private String dimensions;

    /** Màu sắc */
    @Column(length = 100)
    private String color;

    /** Số lượng tồn kho */
    @Builder.Default
    private Integer stock = 0;

    /** Điểm đánh giá trung bình (0-5) */
    @Builder.Default
    private Double rating = 0.0;

    /** Số lượt đánh giá */
    @Builder.Default
    private Integer reviewCount = 0;

    /** Đánh dấu sản phẩm nổi bật trên trang chủ */
    @Builder.Default
    private Boolean featured = false;

    @Builder.Default
    private Boolean active = true;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
