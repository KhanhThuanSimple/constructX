package com.constructx.backend.features.dispute.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDisputeResponse {
    private Long disputeId;
    private Long chatRoomId;   // ID phòng chat tranh chấp 3 bên vừa tạo
    private String chatRoomTitle;
    private String message;
}
