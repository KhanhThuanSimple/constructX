package com.constructx.backend.features.chat.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class UserStatusUpdate {
    private Long userId;
    private Boolean isOnline;
    private LocalDateTime timestamp;
}