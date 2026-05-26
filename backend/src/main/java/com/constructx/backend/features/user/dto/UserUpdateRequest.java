package com.constructx.backend.features.user.dto;

import lombok.Data;

@Data
public class UserUpdateRequest {
    private String fullName;
    private String phoneNumber;
    private String address;
}
