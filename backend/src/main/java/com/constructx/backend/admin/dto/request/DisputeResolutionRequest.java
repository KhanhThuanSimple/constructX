package com.constructx.backend.admin.dto.request;

import lombok.Data;

@Data
public class DisputeResolutionRequest {
    private String resolution;
    private String resolutionType;
    private Long refundAmount;
}
