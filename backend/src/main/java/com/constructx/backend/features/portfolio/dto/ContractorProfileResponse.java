package com.constructx.backend.features.portfolio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractorProfileResponse {
    private Long id;
    private String companyName;
    private String logoUrl;
    private String avatarUrl;
    private Integer yearEstablished;
    private String address;
    private String phoneNumber;
    private String email;
    private String shortIntro;

    private boolean designInterior;
    private boolean constructInterior;
    private boolean produceWood;
    private boolean renovateHouse;

    private Integer experienceYears;
    private Integer completedProjectsCount;
    private Double rating;
    private String customerCount;

    private boolean warranty24Months;
    private boolean freeQuote;
    private boolean onTimeProgress;

    private String approvalStatus;
}
