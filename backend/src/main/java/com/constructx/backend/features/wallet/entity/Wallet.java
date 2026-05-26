package com.constructx.backend.features.wallet.entity;

import com.constructx.backend.features.user.entity.User;
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
    private Long balance = 0L;          // Tổng số dư thực tế

    @Column(nullable = false)
    @Builder.Default
    private Long lockedAmount = 0L;     // Số tiền đang bị đóng băng (Escrow/Rút tiền)

    private LocalDateTime updatedAt;

    @Transient
    public Long getAvailableBalance() {
        return balance - lockedAmount;
    }
}