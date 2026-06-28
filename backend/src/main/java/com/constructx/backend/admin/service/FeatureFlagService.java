package com.constructx.backend.admin.service;

import com.constructx.backend.admin.entity.SystemSetting;
import com.constructx.backend.admin.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Service truy vấn feature flags từ system_settings.
 * Các service khác inject bean này để kiểm tra trạng thái tính năng.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FeatureFlagService {

    // --- Các key chuẩn ---
    public static final String KEY_PROJECT_APPROVAL_REQUIRED   = "feature.project.approvalRequired";
    public static final String KEY_PROJECT_AUTO_APPROVE        = "feature.project.autoApprove";
    public static final String KEY_DISBURSEMENT_ADMIN_APPROVAL = "feature.disbursement.adminApprovalRequired";
    public static final String KEY_CHAT_ENABLED                = "feature.chat.enabled";
    public static final String KEY_VNPAY_ENABLED               = "feature.vnpay.enabled";
    public static final String KEY_ORDER_APPROVAL_REQUIRED     = "feature.order.approvalRequired";

    // VNPay dynamic config
    public static final String KEY_VNPAY_TMN_CODE              = "vnpay.tmnCode";
    public static final String KEY_VNPAY_HASH_SECRET_NORMAL    = "vnpay.hashSecretNormal";
    public static final String KEY_VNPAY_HASH_SECRET_TOKEN     = "vnpay.hashSecretToken";
    public static final String KEY_VNPAY_API_URL               = "vnpay.apiUrl";
    public static final String KEY_VNPAY_RETURN_URL            = "vnpay.returnUrl";
    public static final String KEY_VNPAY_CANCEL_URL            = "vnpay.cancelUrl";
    public static final String KEY_VNPAY_USE_MOCK              = "vnpay.useMock";

    // Chat dynamic config
    public static final String KEY_CHAT_RATE_MAX_MESSAGES      = "chat.rateLimit.maxMessages";
    public static final String KEY_CHAT_RATE_WINDOW_MINUTES    = "chat.rateLimit.windowMinutes";

    // Wallet balance dynamic config
    public static final String KEY_MIN_CUSTOMER_BALANCE_TO_ORDER = "wallet.minCustomerBalanceToOrder";
    public static final String KEY_MIN_CONTRACTOR_BALANCE_TO_BID = "wallet.minContractorBalanceToBid";
    public static final String KEY_MIN_CUSTOMER_BALANCE_TO_PROJECT = "wallet.minCustomerBalanceToProject";

    private final SystemSettingRepository systemSettingRepository;

    /** Lấy giá trị boolean, trả về defaultValue nếu chưa cấu hình */
    public boolean getBoolean(String key, boolean defaultValue) {
        return systemSettingRepository.findByKey(key)
                .map(SystemSetting::getValue)
                .map(v -> "true".equalsIgnoreCase(v.trim()))
                .orElse(defaultValue);
    }

    /** Lấy giá trị String, trả về defaultValue nếu chưa cấu hình */
    public String getString(String key, String defaultValue) {
        return systemSettingRepository.findByKey(key)
                .map(SystemSetting::getValue)
                .filter(v -> !v.isBlank())
                .orElse(defaultValue);
    }

    /** Lấy giá trị Integer, trả về defaultValue nếu chưa cấu hình */
    public int getInt(String key, int defaultValue) {
        return systemSettingRepository.findByKey(key)
                .map(SystemSetting::getValue)
                .map(v -> {
                    try { return Integer.parseInt(v.trim()); }
                    catch (NumberFormatException e) { return defaultValue; }
                })
                .orElse(defaultValue);
    }

    // ─── Các shortcut method ──────────────────────────────────────────────

    /**
     * @return true nếu dự án yêu cầu Admin duyệt trước khi hiển thị công khai.
     *         Mặc định: true.
     */
    public boolean isProjectApprovalRequired() {
        if (systemSettingRepository.findByKey(KEY_PROJECT_APPROVAL_REQUIRED).isPresent()) {
            return getBoolean(KEY_PROJECT_APPROVAL_REQUIRED, true);
        }
        // Fallback key cũ
        if (systemSettingRepository.findByKey(KEY_PROJECT_AUTO_APPROVE).isPresent()) {
            return !getBoolean(KEY_PROJECT_AUTO_APPROVE, false);
        }
        return true;
    }

    /**
     * @return true nếu admin phải xác nhận yêu cầu giải ngân trước khi khách hàng duyệt.
     *         Mặc định: true (admin quản lý giải ngân).
     */
    public boolean isDisbursementAdminApprovalRequired() {
        return getBoolean(KEY_DISBURSEMENT_ADMIN_APPROVAL, true);
    }

    /**
     * @return true nếu chatbox AI đang được bật.
     *         Mặc định: true.
     */
    public boolean isChatEnabled() {
        return getBoolean(KEY_CHAT_ENABLED, true);
    }

    /**
     * @return true nếu thanh toán VNPay đang được bật.
     *         Mặc định: true.
     */
    public boolean isVnpayEnabled() {
        return getBoolean(KEY_VNPAY_ENABLED, true);
    }

    /**
     * @return true nếu đơn hàng phải chờ admin duyệt trước khi mở đấu giá.
     *         false = đơn hàng tự động OPEN_BIDDING ngay sau khi tạo.
     *         Mặc định: true (admin kiểm duyệt).
     */
    public boolean isOrderApprovalRequired() {
        return getBoolean(KEY_ORDER_APPROVAL_REQUIRED, true);
    }

    /** Lấy giá trị Long, trả về defaultValue nếu chưa cấu hình */
    public long getLong(String key, long defaultValue) {
        return systemSettingRepository.findByKey(key)
                .map(SystemSetting::getValue)
                .map(v -> {
                    try { return Long.parseLong(v.trim()); }
                    catch (NumberFormatException e) { return defaultValue; }
                })
                .orElse(defaultValue);
    }

    public long getMinCustomerBalanceToOrder() {
        return getLong(KEY_MIN_CUSTOMER_BALANCE_TO_ORDER, 0L);
    }

    public long getMinContractorBalanceToBid() {
        return getLong(KEY_MIN_CONTRACTOR_BALANCE_TO_BID, 0L);
    }

    public long getMinCustomerBalanceToProject() {
        return getLong(KEY_MIN_CUSTOMER_BALANCE_TO_PROJECT, 0L);
    }
}
