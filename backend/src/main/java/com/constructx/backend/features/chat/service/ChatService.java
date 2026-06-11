package com.constructx.backend.features.chat.service;

import com.constructx.backend.features.chat.dto.*;
import com.constructx.backend.features.chat.entity.ChatMessage;
import com.constructx.backend.features.chat.entity.ChatRoom;
import com.constructx.backend.features.chat.entity.ChatRoomMember;
import com.constructx.backend.features.chat.enums.MemberRole;
import com.constructx.backend.features.chat.enums.RoomType;
import com.constructx.backend.features.chat.repository.ChatMessageRepository;
import com.constructx.backend.features.chat.repository.ChatRoomMemberRepository;
import com.constructx.backend.features.chat.repository.ChatRoomRepository;
import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.user.service.UserService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;
import jakarta.persistence.EntityNotFoundException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings({"unchecked", "rawtypes"})
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomMemberRepository chatRoomMemberRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;
    private final UserService userService;

    @Value("${chat.rate-limit.max-messages:30}")
    private int maxMessagesPerMinute;

    @Value("${chat.rate-limit.window-minutes:1}")
    private int rateLimitWindowMinutes;

    // In-memory rate limiting (should use Redis in production)
    private final Map<String, AtomicInteger> rateLimitMap = new ConcurrentHashMap<>();
    private final Map<String, Long> rateLimitTimestampMap = new ConcurrentHashMap<>();

    // Online user tracking
    private final Map<Long, String> onlineUsers = new ConcurrentHashMap<>();
    private final Map<String, Long> sessionToUserMap = new ConcurrentHashMap<>();

    /**
     * Create new chat room
     */
    @Transactional
    public ChatRoomResponse createChatRoom(CreateChatRoomRequest request, Long creatorId) {
        // Check if chat room already exists (avoid duplicates)
        if (request.getReferenceType() != null && request.getReferenceId() != null) {
            Optional<ChatRoom> existingRoom = chatRoomRepository.findByReference(
                    request.getReferenceType(),
                    request.getReferenceId(),
                    request.getRoomType()
            );
            if (existingRoom.isPresent()) {
                return getChatRoomResponse(existingRoom.get(), creatorId);
            }
        }

        // Create new chat room
        // Tạo phòng chat mới
        ChatRoom room = ChatRoom.builder()
                .roomType(request.getRoomType())
                .referenceType(request.getReferenceType())
                .referenceId(request.getReferenceId())
                .title(request.getTitle())
                .isArchived(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        room = chatRoomRepository.save(room);

// Add members to room using for loop
        List<ChatRoomMember> members = new ArrayList<>();
        for (Long userId : request.getMemberIds()) {
            MemberRole role = determineMemberRole(userId);
            ChatRoomMember member = ChatRoomMember.builder()
                    .room(room)
                    .userId(userId)
                    .roleInRoom(role)
                    .joinedAt(LocalDateTime.now())
                    .build();
            members.add(member);
        }

        chatRoomMemberRepository.saveAll(members);

        // Send WebSocket notification to members
        ChatRoomResponse response = getChatRoomResponse(room, creatorId);
        request.getMemberIds().forEach(userId ->
                messagingTemplate.convertAndSendToUser(
                        userId.toString(),
                        "/queue/rooms",
                        response
                )
        );

        log.info("Created chat room {} with {} members", room.getId(), members.size());
        return response;
    }

    /**
     * Send message to chat room
     */
    @Transactional
    public ChatMessageResponse sendMessage(SendMessageRequest request, Long senderId) {
        // Check if user is a member of the chat room
        if (!chatRoomMemberRepository.existsByRoomIdAndUserId(request.getRoomId(), senderId)) {
            throw new AccessDeniedException("You are not a member of this chat room");
        }

        ChatRoom room = chatRoomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new EntityNotFoundException("Chat room not found"));

        // Check rate limiting (prevent spam)
        checkRateLimit(senderId, room.getId());

        // Create message
        String metadataJson = null;
        if (request.getMetadata() != null) {
            try {
                metadataJson = objectMapper.writeValueAsString(request.getMetadata());
            } catch (Exception e) {
                log.error("Error serializing metadata", e);
            }
        }

        ChatMessage message = ChatMessage.builder()
                .room(room)
                .senderId(senderId)
                .messageType(request.getMessageType())
                .content(request.getContent())
                .fileUrl(request.getFileUrl())
                .fileName(request.getFileName())
                .fileSize(request.getFileSize())
                .metadata(metadataJson)
                .isPinned(false)
                .createdAt(LocalDateTime.now())
                .build();

        message = chatMessageRepository.save(message);

        // Update room's updatedAt
        room.setUpdatedAt(LocalDateTime.now());
        chatRoomRepository.save(room);

        // Build response
        ChatMessageResponse response = buildMessageResponse(message);

        // Broadcast message to all room members
        messagingTemplate.convertAndSend(
                "/topic/rooms/" + room.getId(),
                response
        );

        // Send push notifications to offline members
        sendPushNotifications(room.getId(), senderId, response);

        log.info("Message sent in room {} by user {}", room.getId(), senderId);
        return response;
    }

    /**
     * Admin: Get all active chat rooms
     */
    @Transactional(readOnly = true)
    public Page<ChatRoomResponse> getAllActiveRooms(Long adminId, int page, int size) {
        User admin = userService.getUserById(adminId);
        if (!isAdmin(admin)) {
            throw new AccessDeniedException("Only admins can view all rooms");
        }
        Pageable pageable = PageRequest.of(page, size);
        Page<ChatRoom> rooms = chatRoomRepository.findAllActiveRooms(pageable);
        return rooms.map(room -> getChatRoomResponse(room, adminId));
    }

    /**
     * Get user's chat rooms
     */
    @Transactional(readOnly = true)
    public Page<ChatRoomResponse> getUserChatRooms(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ChatRoom> rooms = chatRoomRepository.findRoomsByUserId(userId, pageable);

        return rooms.map(room -> getChatRoomResponse(room, userId));
    }

    /**
     * Get chat message history
     */
    @Transactional(readOnly = true)
    public Page<ChatMessageResponse> getChatMessages(Long roomId, Long userId, int page, int size) {
        // Check access rights
        if (!chatRoomMemberRepository.existsByRoomIdAndUserId(roomId, userId)) {
            throw new AccessDeniedException("Access denied");
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<ChatMessage> messages = chatMessageRepository.findByRoomId(roomId, pageable);

        return messages.map(this::buildMessageResponse);
    }

    /**
     * Mark messages as read
     */
    @Transactional
    public void markAsRead(Long roomId, Long userId, Long messageId) {
        ChatRoomMember member = chatRoomMemberRepository.findByRoomIdAndUserId(roomId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Member not found"));

        member.setLastReadMessageId(messageId);
        member.setLastReadAt(LocalDateTime.now());
        chatRoomMemberRepository.save(member);

        // Broadcast read receipt
        ReadReceipt receipt = ReadReceipt.builder()
                .roomId(roomId)
                .userId(userId)
                .lastReadMessageId(messageId)
                .timestamp(LocalDateTime.now())
                .build();

        messagingTemplate.convertAndSend(
                "/topic/rooms/" + roomId + "/read-receipts",
                receipt
        );
    }

    /**
     * Send typing indicator
     */
    public void sendTypingIndicator(Long roomId, Long userId, boolean isTyping) {
        User user = userService.getUserById(userId);

        TypingIndicator indicator = TypingIndicator.builder()
                .roomId(roomId)
                .userId(userId)
                .userName(user.getFullName())
                .isTyping(isTyping)
                .timestamp(LocalDateTime.now())
                .build();

        messagingTemplate.convertAndSend(
                "/topic/rooms/" + roomId + "/typing",
                indicator
        );
    }

    /**
     * Admin: Pin important message
     */
    @Transactional
    public void pinMessage(Long messageId, Long adminId) {
        // Check admin rights
        User admin = userService.getUserById(adminId);
        if (!isAdmin(admin)) {
            throw new AccessDeniedException("Only admins can pin messages");
        }

        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new EntityNotFoundException("Message not found"));

        message.setIsPinned(true);
        message.setPinnedAt(LocalDateTime.now());
        message.setPinnedBy(adminId);
        chatMessageRepository.save(message);

        // Broadcast notification
        Map<String, Object> notification = Map.of(
                "type", "MESSAGE_PINNED",
                "messageId", messageId,
                "pinnedBy", adminId,
                "timestamp", LocalDateTime.now()
        );

        messagingTemplate.convertAndSend(
                "/topic/rooms/" + message.getRoom().getId(),
                notification
        );
    }

    /**
     * Admin: Search messages
     */
    @Transactional(readOnly = true)
    public Page<ChatMessageResponse> searchMessages(Long roomId, String keyword, Long adminId, int page, int size) {
        // Check admin rights
        User admin = userService.getUserById(adminId);
        if (!isAdmin(admin)) {
            throw new AccessDeniedException("Access denied");
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<ChatMessage> messages = chatMessageRepository.searchMessages(roomId, keyword, pageable);

        return messages.map(this::buildMessageResponse);
    }

    /**
     * User online tracking
     */
    public void userConnected(Long userId, String sessionId) {
        onlineUsers.put(userId, sessionId);
        sessionToUserMap.put(sessionId, userId);
        broadcastUserStatus(userId, true);
        log.info("User {} connected, online users: {}", userId, onlineUsers.size());
    }

    public void userDisconnected(String sessionId) {
        Long userId = sessionToUserMap.remove(sessionId);
        if (userId != null) {
            onlineUsers.remove(userId);
            broadcastUserStatus(userId, false);
            log.info("User {} disconnected, online users: {}", userId, onlineUsers.size());
        }
    }

    /**
     * Get room members with online status
     */
    public List<ChatRoomMemberResponse> getRoomMembers(Long roomId, Long userId) {
        if (!chatRoomMemberRepository.existsByRoomIdAndUserId(roomId, userId)) {
            throw new AccessDeniedException("Access denied");
        }

        List<ChatRoomMember> members = chatRoomMemberRepository.findByRoomId(roomId);

        return members.stream()
                .map(member -> {
                    User user = userService.getUserById(member.getUserId());
                    return ChatRoomMemberResponse.builder()
                            .userId(member.getUserId())
                            .fullName(user.getFullName())
                            .avatarUrl(user.getAvatarUrl())
                            .roleInRoom(member.getRoleInRoom())
                            .isOnline(isUserOnline(member.getUserId()))
                            .joinedAt(member.getJoinedAt())
                            .build();
                })
                .toList();
    }

    // ========== PRIVATE HELPER METHODS ==========

    private boolean isAdmin(User user) {
        return user.getRole() != null && "ADMIN".equals(user.getRole().name());
    }

    private MemberRole determineMemberRole(Long userId) {
        User user = userService.getUserById(userId);
        String role = user.getRole().name();

        return switch (role) {
            case "CUSTOMER" -> MemberRole.CUSTOMER;
            case "CONTRACTOR" -> MemberRole.CONTRACTOR;
            case "ADMIN" -> MemberRole.ADMIN;
            default -> MemberRole.CUSTOMER;
        };
    }

    private ChatRoomResponse getChatRoomResponse(ChatRoom room, Long currentUserId) {
        List<ChatRoomMember> members = chatRoomMemberRepository.findByRoomId(room.getId());

        List<ChatRoomMemberResponse> memberResponses = members.stream()
                .map(member -> {
                    User user = userService.getUserById(member.getUserId());
                    return ChatRoomMemberResponse.builder()
                            .userId(member.getUserId())
                            .fullName(user.getFullName())
                            .avatarUrl(user.getAvatarUrl())
                            .roleInRoom(member.getRoleInRoom())
                            .isOnline(isUserOnline(member.getUserId()))
                            .joinedAt(member.getJoinedAt())
                            .build();
                })
                .toList();

        // Get last message
        Page<ChatMessage> lastMessages = chatMessageRepository.findByRoomId(
                room.getId(),
                PageRequest.of(0, 1)
        );
        ChatMessageResponse lastMessage = lastMessages.isEmpty() ? null :
                buildMessageResponse(lastMessages.getContent().get(0));

        // Count unread messages
        ChatRoomMember currentMember = chatRoomMemberRepository
                .findByRoomIdAndUserId(room.getId(), currentUserId).orElse(null);
        Long unreadCount = 0L;
        if (currentMember != null) {
            if (currentMember.getLastReadMessageId() != null) {
                unreadCount = chatMessageRepository.countUnreadMessages(
                        room.getId(),
                        currentMember.getLastReadMessageId()
                );
            } else {
                unreadCount = chatMessageRepository.countByRoomId(room.getId());
            }
        }

        return ChatRoomResponse.builder()
                .id(room.getId())
                .roomType(room.getRoomType())
                .title(room.getTitle())
                .referenceType(room.getReferenceType())
                .referenceId(room.getReferenceId())
                .members(memberResponses)
                .lastMessage(lastMessage)
                .unreadCount(unreadCount)
                .createdAt(room.getCreatedAt())
                .updatedAt(room.getUpdatedAt())
                .build();
    }

    private ChatMessageResponse buildMessageResponse(ChatMessage message) {
        String senderName = null;
        String senderAvatar = null;

        if (message.getSenderId() != null) {
            try {
                User sender = userService.getUserById(message.getSenderId());
                senderName = sender.getFullName();
                senderAvatar = sender.getAvatarUrl();
            } catch (Exception e) {
                log.error("Error fetching sender info for userId: {}", message.getSenderId(), e);
                senderName = "Unknown User";
                senderAvatar = "/default-avatar.png";
            }
        }

        Map<String, Object> metadataMap = null;
        if (message.getMetadata() != null) {
            try {
                metadataMap = objectMapper.readValue(message.getMetadata(), new TypeReference<>() {});
            } catch (Exception e) {
                log.error("Error deserializing metadata", e);
            }
        }

        return ChatMessageResponse.builder()
                .id(message.getId())
                .roomId(message.getRoom().getId())
                .senderId(message.getSenderId())
                .senderName(senderName)
                .senderAvatar(senderAvatar)
                .messageType(message.getMessageType())
                .content(message.getContent())
                .fileUrl(message.getFileUrl())
                .fileName(message.getFileName())
                .fileSize(message.getFileSize())
                .metadata(metadataMap)
                .isPinned(message.getIsPinned())
                .createdAt(message.getCreatedAt())
                .build();
    }

    private void checkRateLimit(Long userId, Long roomId) {
        String key = userId + ":" + roomId;
        long currentTime = System.currentTimeMillis();
        long windowStart = currentTime - (rateLimitWindowMinutes * 60L * 1000L);

        // Clean up old entries periodically
        Long lastReset = rateLimitTimestampMap.get(key);
        if (lastReset != null && lastReset < windowStart) {
            rateLimitMap.remove(key);
            rateLimitTimestampMap.remove(key);
        }

        AtomicInteger count = rateLimitMap.computeIfAbsent(key, k -> new AtomicInteger(0));
        rateLimitTimestampMap.putIfAbsent(key, currentTime);

        int currentCount = count.incrementAndGet();
        if (currentCount > maxMessagesPerMinute) {
            throw new RuntimeException("Rate limit exceeded. Maximum " + maxMessagesPerMinute +
                    " messages per " + rateLimitWindowMinutes + " minute(s)");
        }
    }

    private boolean isUserOnline(Long userId) {
        return onlineUsers.containsKey(userId);
    }

    private void sendPushNotifications(Long roomId, Long senderId, ChatMessageResponse message) {
        // Get offline members
        List<Long> offlineMembers = chatRoomMemberRepository.findByRoomId(roomId)
                .stream()
                .map(ChatRoomMember::getUserId)
                .filter(userId -> !userId.equals(senderId))
                .filter(userId -> !isUserOnline(userId))
                .toList();

        if (offlineMembers.isEmpty()) {
            return;
        }

        // Send async push notifications (implement with Firebase Cloud Messaging)
        offlineMembers.forEach(userId -> log.debug("Would send push notification to user {} for room {}", userId, roomId));
    }

    private void broadcastUserStatus(Long userId, boolean isOnline) {
        UserStatusUpdate statusUpdate = UserStatusUpdate.builder()
                .userId(userId)
                .isOnline(isOnline)
                .timestamp(LocalDateTime.now())
                .build();

        // Broadcast to all rooms the user is in
        List<ChatRoom> userRooms = chatRoomRepository.findRoomsByUserId(userId, Pageable.unpaged()).getContent();
        userRooms.forEach(room -> messagingTemplate.convertAndSend(
                "/topic/rooms/" + room.getId() + "/users/status",
                statusUpdate
        ));
    }
}