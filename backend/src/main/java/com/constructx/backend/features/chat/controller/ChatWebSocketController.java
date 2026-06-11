package com.constructx.backend.features.chat.controller;


import com.constructx.backend.features.chat.dto.ReadReceipt;
import com.constructx.backend.features.chat.dto.SendMessageRequest;
import com.constructx.backend.features.chat.dto.TypingIndicator;
import com.constructx.backend.features.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketController {

    private final ChatService chatService;

    /**
     * Endpoint nhận tin nhắn từ client
     * Client gửi đến: /app/chat.send
     */
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload SendMessageRequest request, SimpMessageHeaderAccessor headerAccessor) {
        Long senderId = getAuthenticatedUserId(headerAccessor);

        try {
            chatService.sendMessage(request, senderId);
        } catch (Exception e) {
            log.error("Error sending message", e);
            // Gửi error message back to sender
            // Implement error handling
        }
    }

    /**
     * Endpoint đánh dấu đã đọc
     * Client gửi đến: /app/chat.read
     */
    @MessageMapping("/chat.read")
    public void markAsRead(@Payload ReadReceipt receipt, SimpMessageHeaderAccessor headerAccessor) {
        Long userId = getAuthenticatedUserId(headerAccessor);
        chatService.markAsRead(receipt.getRoomId(), userId, receipt.getLastReadMessageId());
    }

    /**
     * Endpoint gửi typing indicator
     * Client gửi đến: /app/chat.typing
     */
    @MessageMapping("/chat.typing")
    public void sendTypingIndicator(@Payload TypingIndicator indicator, SimpMessageHeaderAccessor headerAccessor) {
        Long userId = getAuthenticatedUserId(headerAccessor);
        chatService.sendTypingIndicator(indicator.getRoomId(), userId, indicator.getIsTyping());
    }

    private Long getAuthenticatedUserId(SimpMessageHeaderAccessor headerAccessor) {
        // userId is stored in session attributes during WebSocket CONNECT authentication
        Object userId = headerAccessor.getSessionAttributes() != null
                ? headerAccessor.getSessionAttributes().get("userId")
                : null;
        if (userId instanceof Long) return (Long) userId;
        if (userId instanceof Integer) return ((Integer) userId).longValue();

        // Fallback: extract from principal name via UserDetailsService
        if (headerAccessor.getUser() instanceof org.springframework.security.core.Authentication auth) {
            Object principal = auth.getPrincipal();
            if (principal instanceof com.constructx.backend.features.user.entity.User user) {
                return user.getId();
            }
        }
        throw new IllegalStateException("User not authenticated or userId not found in session");
    }
}