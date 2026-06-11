package com.constructx.backend.features.chat.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class ChatbotRequest {
    private String message;
    private List<Map<String, String>> history; // [{"role":"user","content":"..."}, {"role":"assistant","content":"..."}]
}
