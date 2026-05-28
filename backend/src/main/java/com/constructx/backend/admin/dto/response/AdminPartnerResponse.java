package com.constructx.backend.admin.dto.response;

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
    private String approvalStatus;
    private LocalDateTime createdAt;
}
