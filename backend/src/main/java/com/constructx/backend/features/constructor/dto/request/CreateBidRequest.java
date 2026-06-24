package com.constructx.backend.features.constructor.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateBidRequest {

    @NotNull
    private Long projectId;

    @NotNull
    @Min(1)
    private Integer estimatedDays;

    private String message;

    // ảnh mẫu thiết kế tổng
    private String designImage;

    @NotEmpty
    private List<CreateBidDetailRequest> details;
}
