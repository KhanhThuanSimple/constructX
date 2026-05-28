package com.constructx.backend.features.notification.entity;

import com.constructx.backend.features.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    private NotifType type;

    @Column(nullable = false, length = 500)
    private String content;

    @Builder.Default
    private Boolean isRead = false;

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum NotifType {
        BID_RECEIVED, PAYMENT_SUCCESS, PAYMENT_FAILED,
        DESIGN_UPDATED, MILESTONE_REQUEST, DISPUTE, SYSTEM
    }
}
