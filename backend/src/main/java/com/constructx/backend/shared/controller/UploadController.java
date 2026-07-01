package com.constructx.backend.shared.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

/**
 * Generic file upload endpoint — lưu vào local ./uploads/
 * Endpoint: POST /api/upload
 * Response: { "url": "http://localhost:8080/uploads/<filename>" }
 */
@RestController
@RequestMapping("/api/upload")
@Slf4j
public class UploadController {

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @Value("${file.base-url:http://localhost:8080/uploads}")
    private String baseUrl;

    private static final long MAX_SIZE = 10 * 1024 * 1024; // 10MB
    private static final java.util.Set<String> ALLOWED_TYPES = java.util.Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );

    @PostMapping
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File trống"));
        }
        if (file.getSize() > MAX_SIZE) {
            return ResponseEntity.badRequest().body(Map.of("error", "File quá lớn (tối đa 10MB)"));
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Chỉ chấp nhận ảnh JPG, PNG, GIF, WEBP"));
        }

        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            // Tạo tên file duy nhất
            String originalName = file.getOriginalFilename();
            String ext = "";
            if (originalName != null && originalName.contains(".")) {
                ext = originalName.substring(originalName.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString().replace("-", "") + ext;

            Path target = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = baseUrl.endsWith("/")
                    ? baseUrl + filename
                    : baseUrl + "/" + filename;

            log.info("[UPLOAD] Lưu file: {} → {}", filename, fileUrl);
            return ResponseEntity.ok(Map.of(
                    "url", fileUrl,
                    "filename", filename,
                    "size", file.getSize()
            ));
        } catch (IOException e) {
            log.error("[UPLOAD] Lỗi lưu file: ", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Lỗi hệ thống khi lưu file"));
        }
    }
}
