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
    private long totalOrders;
    private long pendingOrders;
    private long totalContracts;
    private long activeContracts;
    private List<AdminProjectSummary> myProjects;

    // Chart data — 6 tháng gần nhất
    private List<Long> monthlyRevenue;      // doanh thu theo tháng
    private List<Long> monthlyProjects;     // số dự án theo tháng
    private List<Long> monthlyOrders;       // số đơn hàng theo tháng
    private List<String> monthLabels;       // nhãn tháng
}