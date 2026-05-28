package com.constructx.backend.features.constructor.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "bid_details")
@Data
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class BidDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bid_id", nullable = false)
    private Bid bid;

    // tên hạng mục linh hoạt
    private String itemName;

    // bộ, cái, mét...
    private String unit;

    private Double quantity;

    private Long unitPrice;

    // backend tự tính
    private Long totalPrice;

    @Column(columnDefinition = "TEXT")
    private String description;

    // ảnh mẫu riêng từng hạng mục
    private String sampleImage;
}