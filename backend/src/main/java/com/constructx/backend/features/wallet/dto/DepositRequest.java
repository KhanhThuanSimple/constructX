package com.constructx.backend.features.wallet.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DepositRequest {
    @NotNull(message = "Số tiền không được trống")
    @Min(value = 10000, message = "Số tiền tối thiểu 10,000đ")
    private Long amount;
}
