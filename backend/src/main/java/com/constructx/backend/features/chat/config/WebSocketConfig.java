package com.constructx.backend.features.chat.config;

import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.Date;

@Configuration
@EnableWebSocketMessageBroker
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
@RequiredArgsConstructor
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable simple broker cho topic (broadcast) và queue (1-1)
        config.enableSimpleBroker("/topic", "/queue");

        // Prefix cho các endpoint gửi từ client
        config.setApplicationDestinationPrefixes("/app");

        // Prefix cho tin nhắn cá nhân
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Native WebSocket endpoint (dùng cho @stomp/stompjs trực tiếp)
        registry.addEndpoint("/ws-chat")
                .setAllowedOriginPatterns("*");

        // SockJS fallback endpoint (dùng cho trình duyệt cũ nếu cần)
        registry.addEndpoint("/ws-chat")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(
                        message, StompHeaderAccessor.class
                );

                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    if (authHeader == null) {
                        authHeader = accessor.getFirstNativeHeader("authorization");
                    }

                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);
                        try {
                            String email = jwtService.extractUsername(token);
                            Long userId = jwtService.extractUserId(token);

                            log.info("WebSocket CONNECT — email: {}, userId: {}", email, userId);

                            if (email != null) {
                                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                                if (jwtService.validateToken(token, userDetails)) {
                                    UsernamePasswordAuthenticationToken authentication =
                                            new UsernamePasswordAuthenticationToken(
                                                    userDetails, null, userDetails.getAuthorities());
                                    SecurityContextHolder.getContext().setAuthentication(authentication);

                                    // Resolve userId: from token claim, or fall back to User entity id
                                    if (userId == null && userDetails instanceof com.constructx.backend.features.user.entity.User u) {
                                        userId = u.getId();
                                    }
                                    accessor.getSessionAttributes().put("userId", userId);
                                    accessor.getSessionAttributes().put("email", email);
                                    accessor.setUser(authentication);
                                    log.info("WebSocket authenticated: email={}, userId={}", email, userId);
                                }
                            }
                        } catch (Exception e) {
                            log.error("WebSocket auth error: {}", e.getMessage());
                        }
                    }
                }

                if (StompCommand.DISCONNECT.equals(accessor.getCommand())) {
                    if (accessor.getSessionAttributes() != null) {
                        Long userId = (Long) accessor.getSessionAttributes().get("userId");
                        if (userId != null) {
                            log.info("WebSocket DISCONNECT — userId: {}", userId);
                        }
                    }
                }

                return message;
            }
        });
    }
}