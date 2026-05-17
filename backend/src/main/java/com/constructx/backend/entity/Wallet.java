package com.constructx.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "wallets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnoreProperties("wallet")
    private User user;

    @Column(nullable = false)
    @Builder.Default
    private Long balance = 0L;          // Tổng số dư (VND)

    @Column(nullable = false)
    @Builder.Default
    private Long lockedAmount = 0L;     // Đang khóa trong escrow

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Số dư khả dụng = balance - lockedAmount
    @Transient
    public Long getAvailableBalance() {
        return balance - lockedAmount;
    }
}
