package com.constructx.backend.features.project.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProjectRequest {
    @NotBlank(message = "Tên dự án không được trống")
    private String name;

    private String category;
    private Double area;
    private String style;
    private String address;
    private String description;
    private Long budgetMin;
    private Long budgetMax;
    private String bidType;  // OPEN or DIRECT
}
