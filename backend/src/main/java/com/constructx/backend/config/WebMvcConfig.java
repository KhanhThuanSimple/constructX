package com.constructx.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Serve thư mục ./uploads/ ra ngoài qua URL /uploads/**
 * Ví dụ: http://localhost:8080/uploads/abc123.jpg
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String absolutePath = Paths.get(uploadDir).toAbsolutePath().normalize().toString();
        // Đảm bảo path kết thúc bằng /
        if (!absolutePath.endsWith("/") && !absolutePath.endsWith("\\")) {
            absolutePath = absolutePath + "/";
        }
        registry
            .addResourceHandler("/uploads/**")
            .addResourceLocations("file:" + absolutePath);
    }
}
