package com.constructx.backend.admin.controller;

import com.constructx.backend.admin.service.AdminAnalyticsService;
import com.constructx.backend.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
public class AdminAnalyticsController {

    private final AdminAnalyticsService adminAnalyticsService;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardAnalytics() {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Tải dữ liệu phân tích thành công", adminAnalyticsService.getDashboardAnalytics()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
