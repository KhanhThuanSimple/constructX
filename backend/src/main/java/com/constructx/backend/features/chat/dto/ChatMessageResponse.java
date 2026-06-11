package com.constructx.backend.features.chat.dto;

import com.constructx.backend.features.chat.enums.MessageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
    private Long id;
    private Long roomId;
    private Long senderId;
    private String senderName;
    private String senderAvatar;
    private MessageType messageType;
    private String content;
    private String fileUrl;
    private String fileName;
    private Long fileSize;
    private Map<String, Object> metadata;
    private Boolean isPinned;
    private LocalDateTime createdAt;
}