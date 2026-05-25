package com.constructx.backend.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStatsResponse {

    private long totalRevenue;

    private long totalEscrow;

    private long newProjectsCount;

    private long activeContractors;

    private long pendingProjects;

    private long pendingPartners;

    private long openDisputes;

    private List<AdminProjectSummary> myProjects;
}