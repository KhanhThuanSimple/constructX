package com.constructx.backend.features.wallet.entity;

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
    private Wallet wallet;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Type type;

    @Column(nullable = false)
    private Long amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status;

    private String paymentGateway;
    private String gatewayOrderId; // Mã giao dịch hệ thống sinh ra (vnp_TxnRef)
    private String gatewayTransId; // Mã giao dịch của Cổng trả về (vnp_TransactionNo)

    @Column(length = 500)
    private String description;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    public enum Type { DEPOSIT, LOCK, RELEASE, WITHDRAW, TOKEN_CREATE, TOKEN_PAY,REVENUE }
    public enum Status { PENDING, SUCCESS, FAILED, CANCELLED }
}