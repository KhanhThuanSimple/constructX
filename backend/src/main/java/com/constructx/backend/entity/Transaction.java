package com.constructx.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    @JsonIgnoreProperties("transactions")
    private Wallet wallet;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type;  // DEPOSIT, LOCK, RELEASE, WITHDRAW

    @Column(nullable = false)
    private Long amount;  // VND

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.PENDING;

    private String paymentGateway;   // MOMO, ZALOPAY, BANK

    private String gatewayOrderId;   // MoMo orderId

    private String gatewayTransId;   // MoMo transId (returned after success)

    @Column(length = 500)
    private String description;

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime completedAt;

    public enum Type { DEPOSIT, LOCK, RELEASE, WITHDRAW }

    public enum Status { PENDING, SUCCESS, FAILED, CANCELLED }
}
