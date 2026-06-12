package com.constructx.backend.features.constructor.entity;

import com.constructx.backend.features.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Nhật ký thi công: nhà thầu cập nhật tiến độ định kỳ.
 * Mỗi log có % hoàn thành, mô tả và danh sách ảnh minh chứng.
 */
@Entity
@Table(name = "construction_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConstructionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Hợp đồng liên kết */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    /** Nhà thầu ghi log */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contractor_id", nullable = false)
    private User contractor;

    /** % tiến độ tại thời điểm ghi log (0-100) */
    @Column(name = "progress_percent", nullable = false)
    private Integer progressPercent;

    /** Mô tả công việc đã thực hiện */
    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    /**
     * Danh sách URL ảnh minh chứng, lưu dưới dạng JSON array string.
     * Ví dụ: ["url1","url2","url3"]
     * Frontend sẽ parse/stringify khi gửi/nhận.
     */
    @Column(name = "image_urls", columnDefinition = "TEXT")
    private String imageUrls;

    /** Giai đoạn thi công (mô tả ngắn: "Khởi công", "Thi công thô", ...) */
    @Column(name = "phase_label", length = 100)
    private String phaseLabel;

    @Builder.Default
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
