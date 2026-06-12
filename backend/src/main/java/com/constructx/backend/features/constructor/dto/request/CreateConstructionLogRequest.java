package com.constructx.backend.features.constructor.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateConstructionLogRequest {

    @NotNull(message = "Contract ID khong duoc de trong")
    private Long contractId;

    @NotNull(message = "Phan tram tien do khong duoc de trong")
    @Min(value = 1, message = "Tien do phai tu 1%")
    @Max(value = 100, message = "Tien do khong vuot qua 100%")
    private Integer progressPercent;

    @NotBlank(message = "Mo ta khong duoc de trong")
    private String description;

    /** Danh sách URL ảnh (upload trước, gửi URL) */
    private List<String> imageUrls;

    /** Nhãn giai đoạn tuỳ chọn */
    private String phaseLabel;
}
