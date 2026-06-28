package com.constructx.backend.admin.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AdminSettingsResponse {
    // --- Phí dịch vụ ---
    private Double customerFee;
    private Double contractorFee;
    private Double platformFee;
    private Double managementFee;
    private List<MaterialResponse> materials;

    // --- Cấu hình VNPay ---
    private String vnpayTmnCode;
    private String vnpayHashSecretNormal;
    private String vnpayHashSecretToken;
    private String vnpayApiUrl;
    private String vnpayReturnUrl;
    private String vnpayCancelUrl;
    private Boolean vnpayUseMock;
    private Boolean vnpayEnabled;

    // --- Cấu hình Chatbox ---
    private Boolean chatEnabled;
    private Integer chatRateLimitMaxMessages;
    private Integer chatRateLimitWindowMinutes;

    // --- Feature flags ---
    private Boolean projectApprovalRequired;
    private Boolean disbursementAdminApprovalRequired;
    /** true = đơn hàng chờ admin duyệt; false = tự động OPEN_BIDDING ngay */
    private Boolean orderApprovalRequired;

    // --- Cấu hình Số dư tối thiểu ---
    private Long minCustomerBalanceToOrder;
    private Long minContractorBalanceToBid;
    private Long minCustomerBalanceToProject;
}