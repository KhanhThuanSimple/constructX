package com.constructx.backend.features.chat.dto;


import com.constructx.backend.features.chat.enums.MemberRole;
import com.constructx.backend.features.chat.enums.MessageType;
import com.constructx.backend.features.chat.enums.RoomType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

// DTO tạo phòng chat
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CreateChatRoomRequest {
    @NotNull
    private RoomType roomType;

    private String referenceType;
    private Long referenceId;
    private String title;

    @NotNull
    private List<Long> memberIds; // Danh sách user IDs sẽ add vào phòng
}

// DTO gửi tin nhắn


// DTO response tin nhắn

