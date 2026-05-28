package com.constructx.backend.features.notification.controller;

import com.constructx.backend.features.notification.entity.Notification;
import com.constructx.backend.shared.dto.ApiResponse;
import com.constructx.backend.features.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getMyNotifications() {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getMyNotifications()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        return ResponseEntity.ok(ApiResponse.ok(notificationService.getUnreadCount()));
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<ApiResponse<String>> markAllRead() {
        notificationService.markAllRead();
        return ResponseEntity.ok(ApiResponse.ok("Đã đánh dấu tất cả thông báo là đã đọc"));
    }
}