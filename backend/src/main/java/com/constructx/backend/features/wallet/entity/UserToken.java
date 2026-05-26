package com.constructx.backend.features.wallet.entity;

import com.constructx.backend.features.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "vnp_token", length = 150, nullable = false)
    private String vnpToken;

    @Column(name = "vnp_card_number", length = 30)
    private String vnpCardNumber; // Ví dụ: 970419xxxxxxxxx2198

    @Column(name = "vnp_bank_code", length = 20)
    private String vnpBankCode;

    private LocalDateTime createdAt;
}