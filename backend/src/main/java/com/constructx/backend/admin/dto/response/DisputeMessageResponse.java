package com.constructx.backend.admin.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class DisputeMessageResponse {
    private Long id;
    private String author;
    private String content;
    private LocalDateTime createdAt;
}
