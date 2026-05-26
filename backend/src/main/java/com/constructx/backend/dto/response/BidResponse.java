package com.constructx.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class BidResponse {

    private Long id;

    private Long projectId;

    private Long contractorId;

    private String contractorName;

    private String contractorEmail;

    private String contractorPhone;

    // tổng tiền
    private Long totalPrice;

    private Integer estimatedDays;

    private String message;

    // mẫu thiết kế tổng
    private String designImage;

    private String status;

    private LocalDateTime createdAt;

    private List<BidDetailResponse> details;
}