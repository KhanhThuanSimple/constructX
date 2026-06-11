package com.constructx.backend.features.constructor.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Mốc trạng thái của hợp đồng (audit trail).
 */
@Entity
@Table(name = "contract_stages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractStage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Contract.Status stage;

    @Column(columnDefinition = "TEXT")
    private String note;

    /** Ai thực hiện hành động này */
    private String performedBy;

    @Builder.Default
    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
