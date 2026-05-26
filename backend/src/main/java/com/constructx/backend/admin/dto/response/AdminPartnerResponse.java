package com.constructx.backend.admin.dto.response;

import com.constructx.backend.entity.User;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminPartnerResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String address;
    private String role;
    private boolean active;
    private User.ApprovalStatus approvalStatus;
    private LocalDateTime createdAt;
}
