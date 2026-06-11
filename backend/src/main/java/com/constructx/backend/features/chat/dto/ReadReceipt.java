package com.constructx.backend.features.chat.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ReadReceipt {
    private Long roomId;
    private Long userId;
    private Long lastReadMessageId;
    private LocalDateTime timestamp;
}