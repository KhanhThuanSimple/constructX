package com.constructx.backend.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractorJobResponse {

    private Long jobId;

    private Long projectId;

    private String projectName;

    private String category;

    private String address;

    private String description;

    private Long agreedPrice;

    private String customerName;

    private String customerPhone;

    private String customerEmail;

    private String status;

    private LocalDateTime startedAt;

    private LocalDateTime createdAt;
}