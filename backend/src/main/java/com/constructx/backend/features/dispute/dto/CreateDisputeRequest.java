package com.constructx.backend.features.dispute.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateDisputeRequest {
    @NotNull(message = "contractJobId không được để trống")
    private Long contractJobId;

    @NotBlank(message = "Lý do tranh chấp không được để trống")
    private String reason;

    private Long amount; // Số tiền tranh chấp (tuỳ chọn)
}
