package com.constructx.backend.features.chat.dto;

import com.constructx.backend.features.chat.enums.MemberRole;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ChatRoomMemberResponse {
    private Long userId;
    private String fullName;
    private String avatarUrl;
    private MemberRole roleInRoom;
    private Boolean isOnline;
    private LocalDateTime joinedAt;
}