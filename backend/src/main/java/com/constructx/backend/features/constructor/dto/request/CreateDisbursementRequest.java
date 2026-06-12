package com.constructx.backend.features.constructor.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateDisbursementRequest {

    @NotNull(message = "Contract ID khong duoc de trong")
    private Long contractId;

    @NotBlank(message = "Ten giai doan khong duoc de trong")
    private String phaseLabel;

    /** Ngưỡng tiến độ cần đạt để mở yêu cầu này (vd: 20, 50, 80, 100) */
    @NotNull(message = "Nguong tien do khong duoc de trong")
    private Integer phaseThreshold;

    @NotNull(message = "So tien yeu cau khong duoc de trong")
    @Min(value = 1, message = "So tien phai lon hon 0")
    private Long amount;

    /** Tỉ lệ được dùng ngay (0.0-1.0), mặc định 0.4 nếu null */
    private Double immediateRatio;

    private String note;
}
