package com.constructx.backend.features.chat.dto;

import com.constructx.backend.features.chat.enums.RoomType;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ChatRoomResponse {
    private Long id;
    private RoomType roomType;
    private String title;
    private String referenceType;
    private Long referenceId;
    private List<ChatRoomMemberResponse> members;
    private ChatMessageResponse lastMessage;
    private Long unreadCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}