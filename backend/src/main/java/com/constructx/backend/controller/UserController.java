package com.constructx.backend.controller;

import com.constructx.backend.dto.request.UserUpdateRequest;
import com.constructx.backend.dto.response.ApiResponse;
import com.constructx.backend.entity.User;
import com.constructx.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getCurrentUser() {
        return ResponseEntity.ok(ApiResponse.ok("Lấy thông tin người dùng thành công", userService.getCurrentUser()));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<User>> updateProfile(@RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thông tin thành công", userService.updateProfile(request)));
    }
}
