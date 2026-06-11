package com.constructx.backend.features.chat.entity;

import com.constructx.backend.features.chat.enums.MessageType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private ChatRoom room;

    @Column(nullable = false)
    private Long senderId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageType messageType;

    @Column(columnDefinition = "TEXT")
    private String content;

    private String fileUrl;

    private String fileName;

    private Long fileSize;

    @Column(columnDefinition = "TEXT")
    private String metadata;

    @Builder.Default
    private Boolean isPinned = false;

    private Long pinnedBy;

    private LocalDateTime pinnedAt;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}