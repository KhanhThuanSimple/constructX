package com.constructx.backend.features.chat.dto;

import com.constructx.backend.features.chat.enums.MessageType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {
    @NotNull
    private Long roomId;

    @NotNull
    private MessageType messageType;

    private String content;
    private String fileUrl;
    private String fileName;
    private Long fileSize;
    private Map<String, Object> metadata; // Cho 3D model, color palette, action button
}