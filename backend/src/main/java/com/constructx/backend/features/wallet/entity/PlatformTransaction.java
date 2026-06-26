package com.constructx.backend.features.wallet.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "platform_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlatformTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Type type; // COMMISSION, DISPUTE_PENALTY, WITHDRAW, REFUND

    @Column(name = "reference_id")
    private String referenceId; // e.g. Contract Number, Dispute ID

    @Column(length = 500)
    private String description;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Type { COMMISSION, DISPUTE_PENALTY, WITHDRAW, REFUND }
}
