package com.constructx.backend.features.chat.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class TypingIndicator {
    private Long roomId;
    private Long userId;
    private String userName;
    private Boolean isTyping;
    private LocalDateTime timestamp;
}