package com.constructx.backend.admin.dto.request;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class AdminSettingsRequest {
    // --- Phí dịch vụ ---
    private Double customerFee = 0.0;
    private Double contractorFee = 0.0;
    private Double platformFee = 0.0;
    private Double managementFee = 0.0;
    private List<MaterialRequest> materials = new ArrayList<>();

    // --- Cấu hình VNPay ---
    private String vnpayTmnCode;
    private String vnpayHashSecretNormal;
    private String vnpayHashSecretToken;
    private String vnpayApiUrl;
    private String vnpayReturnUrl;
    private String vnpayCancelUrl;
    private Boolean vnpayUseMock;
    private Boolean vnpayEnabled;

    // --- Cấu hình Chatbox (Grok AI) ---
    private Boolean chatEnabled;
    private Integer chatRateLimitMaxMessages;
    private Integer chatRateLimitWindowMinutes;

    // --- Feature flags ---
    /** true = dự án cần được admin duyệt trước khi đăng */
    private Boolean projectApprovalRequired;

    /** true = admin phải xác nhận yêu cầu giải ngân trước khi khách hàng duyệt */
    private Boolean disbursementAdminApprovalRequired;

    /** true = đơn hàng phải chờ admin duyệt trước khi mở đấu giá.
     *  false = đơn hàng tự động OPEN_BIDDING ngay khi tạo */
    private Boolean orderApprovalRequired;

    // --- Cấu hình Số dư tối thiểu ---
    private Long minCustomerBalanceToOrder;
    private Long minContractorBalanceToBid;
    private Long minCustomerBalanceToProject;
}