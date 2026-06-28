package com.constructx.backend.admin.service;

import com.constructx.backend.admin.dto.request.AdminSettingsRequest;
import com.constructx.backend.admin.dto.request.MaterialRequest;
import com.constructx.backend.admin.dto.response.AdminSettingsResponse;
import com.constructx.backend.admin.dto.response.MaterialResponse;
import com.constructx.backend.admin.entity.MaterialCategory;
import com.constructx.backend.admin.entity.SystemSetting;
import com.constructx.backend.admin.repository.MaterialCategoryRepository;
import com.constructx.backend.admin.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminSettingsService {

    // ─── Keys: fee ───────────────────────────────────────────────────────
    private static final String CUSTOMER_FEE   = "customerFee";
    private static final String CONTRACTOR_FEE = "contractorFee";
    private static final String PLATFORM_FEE   = "platformFee";
    private static final String MANAGEMENT_FEE = "managementFee";

    // ─── Fallback values từ application.yml ──────────────────────────────
    @Value("${vnpay.tmn-code:}")
    private String defaultTmnCode;

    @Value("${vnpay.hash-secret-normal:}")
    private String defaultHashSecretNormal;

    @Value("${vnpay.hash-secret-token:}")
    private String defaultHashSecretToken;

    @Value("${vnpay.api-url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String defaultApiUrl;

    @Value("${vnpay.return-url:http://localhost:5173/wallet}")
    private String defaultReturnUrl;

    @Value("${vnpay.cancel-url:http://localhost:5173/wallet}")
    private String defaultCancelUrl;

    @Value("${vnpay.use-mock:false}")
    private boolean defaultUseMock;

    @Value("${chat.rate-limit.max-messages:30}")
    private int defaultChatMaxMessages;

    @Value("${chat.rate-limit.window-minutes:1}")
    private int defaultChatWindowMinutes;

    private final SystemSettingRepository systemSettingRepository;
    private final MaterialCategoryRepository materialCategoryRepository;
    private final FeatureFlagService featureFlagService;

    @Transactional
    public AdminSettingsResponse getSettings() {
        seedDefaultMaterialsIfEmpty();

        return AdminSettingsResponse.builder()
                // Fees
                .customerFee(getDouble(CUSTOMER_FEE, 3.5))
                .contractorFee(getDouble(CONTRACTOR_FEE, 5.0))
                .platformFee(getDouble(PLATFORM_FEE, 1.0))
                .managementFee(getDouble(MANAGEMENT_FEE, 0.5))
                .materials(getMaterialResponses())
                // VNPay
                .vnpayTmnCode(getString(FeatureFlagService.KEY_VNPAY_TMN_CODE, defaultTmnCode))
                .vnpayHashSecretNormal(getString(FeatureFlagService.KEY_VNPAY_HASH_SECRET_NORMAL, defaultHashSecretNormal))
                .vnpayHashSecretToken(getString(FeatureFlagService.KEY_VNPAY_HASH_SECRET_TOKEN, defaultHashSecretToken))
                .vnpayApiUrl(getString(FeatureFlagService.KEY_VNPAY_API_URL, defaultApiUrl))
                .vnpayReturnUrl(getString(FeatureFlagService.KEY_VNPAY_RETURN_URL, defaultReturnUrl))
                .vnpayCancelUrl(getString(FeatureFlagService.KEY_VNPAY_CANCEL_URL, defaultCancelUrl))
                .vnpayUseMock(getBoolean(FeatureFlagService.KEY_VNPAY_USE_MOCK, defaultUseMock))
                .vnpayEnabled(getBoolean(FeatureFlagService.KEY_VNPAY_ENABLED, true))
                // Chat
                .chatEnabled(getBoolean(FeatureFlagService.KEY_CHAT_ENABLED, true))
                .chatRateLimitMaxMessages(getInt(FeatureFlagService.KEY_CHAT_RATE_MAX_MESSAGES, defaultChatMaxMessages))
                .chatRateLimitWindowMinutes(getInt(FeatureFlagService.KEY_CHAT_RATE_WINDOW_MINUTES, defaultChatWindowMinutes))
                // Feature flags
                .projectApprovalRequired(featureFlagService.isProjectApprovalRequired())
                .disbursementAdminApprovalRequired(getBoolean(FeatureFlagService.KEY_DISBURSEMENT_ADMIN_APPROVAL, true))
                .orderApprovalRequired(getBoolean(FeatureFlagService.KEY_ORDER_APPROVAL_REQUIRED, true))
                .minCustomerBalanceToOrder(featureFlagService.getMinCustomerBalanceToOrder())
                .minContractorBalanceToBid(featureFlagService.getMinContractorBalanceToBid())
                .minCustomerBalanceToProject(featureFlagService.getMinCustomerBalanceToProject())
                .build();
    }

    @Transactional
    public AdminSettingsResponse updateSettings(AdminSettingsRequest request) {
        if (request == null) {
            request = new AdminSettingsRequest();
        }

        // Fees
        saveSetting(CUSTOMER_FEE, sanitizePercent(request.getCustomerFee()));
        saveSetting(CONTRACTOR_FEE, sanitizePercent(request.getContractorFee()));
        saveSetting(PLATFORM_FEE, sanitizePercent(request.getPlatformFee()));
        saveSetting(MANAGEMENT_FEE, sanitizePercent(request.getManagementFee()));

        replaceMaterials(request.getMaterials());

        // VNPay
        if (request.getVnpayTmnCode() != null)
            saveStringSetting(FeatureFlagService.KEY_VNPAY_TMN_CODE, request.getVnpayTmnCode());
        if (request.getVnpayHashSecretNormal() != null)
            saveStringSetting(FeatureFlagService.KEY_VNPAY_HASH_SECRET_NORMAL, request.getVnpayHashSecretNormal());
        if (request.getVnpayHashSecretToken() != null)
            saveStringSetting(FeatureFlagService.KEY_VNPAY_HASH_SECRET_TOKEN, request.getVnpayHashSecretToken());
        if (request.getVnpayApiUrl() != null)
            saveStringSetting(FeatureFlagService.KEY_VNPAY_API_URL, request.getVnpayApiUrl());
        if (request.getVnpayReturnUrl() != null)
            saveStringSetting(FeatureFlagService.KEY_VNPAY_RETURN_URL, request.getVnpayReturnUrl());
        if (request.getVnpayCancelUrl() != null)
            saveStringSetting(FeatureFlagService.KEY_VNPAY_CANCEL_URL, request.getVnpayCancelUrl());
        if (request.getVnpayUseMock() != null)
            saveStringSetting(FeatureFlagService.KEY_VNPAY_USE_MOCK, String.valueOf(request.getVnpayUseMock()));
        if (request.getVnpayEnabled() != null)
            saveStringSetting(FeatureFlagService.KEY_VNPAY_ENABLED, String.valueOf(request.getVnpayEnabled()));

        // Chat
        if (request.getChatEnabled() != null)
            saveStringSetting(FeatureFlagService.KEY_CHAT_ENABLED, String.valueOf(request.getChatEnabled()));
        if (request.getChatRateLimitMaxMessages() != null)
            saveStringSetting(FeatureFlagService.KEY_CHAT_RATE_MAX_MESSAGES, String.valueOf(request.getChatRateLimitMaxMessages()));
        if (request.getChatRateLimitWindowMinutes() != null)
            saveStringSetting(FeatureFlagService.KEY_CHAT_RATE_WINDOW_MINUTES, String.valueOf(request.getChatRateLimitWindowMinutes()));

        // Feature flags
        if (request.getProjectApprovalRequired() != null)
            saveStringSetting(FeatureFlagService.KEY_PROJECT_APPROVAL_REQUIRED, String.valueOf(request.getProjectApprovalRequired()));
        if (request.getDisbursementAdminApprovalRequired() != null)
            saveStringSetting(FeatureFlagService.KEY_DISBURSEMENT_ADMIN_APPROVAL, String.valueOf(request.getDisbursementAdminApprovalRequired()));
        if (request.getOrderApprovalRequired() != null)
            saveStringSetting(FeatureFlagService.KEY_ORDER_APPROVAL_REQUIRED, String.valueOf(request.getOrderApprovalRequired()));

        // Wallet balance limits
        if (request.getMinCustomerBalanceToOrder() != null)
            saveStringSetting(FeatureFlagService.KEY_MIN_CUSTOMER_BALANCE_TO_ORDER, String.valueOf(request.getMinCustomerBalanceToOrder()));
        if (request.getMinContractorBalanceToBid() != null)
            saveStringSetting(FeatureFlagService.KEY_MIN_CONTRACTOR_BALANCE_TO_BID, String.valueOf(request.getMinContractorBalanceToBid()));
        if (request.getMinCustomerBalanceToProject() != null)
            saveStringSetting(FeatureFlagService.KEY_MIN_CUSTOMER_BALANCE_TO_PROJECT, String.valueOf(request.getMinCustomerBalanceToProject()));

        return getSettings();
    }

    private Double sanitizePercent(Double value) {
        if (value == null || value.isNaN() || value < 0) {
            return 0.0;
        }

        if (value > 100) {
            return 100.0;
        }

        return value;
    }

    private Double getDouble(String key, Double defaultValue) {
        return systemSettingRepository.findByKey(key)
                .map(SystemSetting::getValue)
                .map(value -> {
                    try {
                        return Double.parseDouble(value);
                    } catch (NumberFormatException e) {
                        return defaultValue;
                    }
                })
                .orElse(defaultValue);
    }

    private Boolean getBoolean(String key, boolean defaultValue) {
        return systemSettingRepository.findByKey(key)
                .map(SystemSetting::getValue)
                .map(v -> "true".equalsIgnoreCase(v.trim()))
                .orElse(defaultValue);
    }

    private String getString(String key, String defaultValue) {
        return systemSettingRepository.findByKey(key)
                .map(SystemSetting::getValue)
                .filter(v -> !v.isBlank())
                .orElse(defaultValue);
    }

    private Integer getInt(String key, int defaultValue) {
        return systemSettingRepository.findByKey(key)
                .map(SystemSetting::getValue)
                .map(v -> {
                    try { return Integer.parseInt(v.trim()); }
                    catch (NumberFormatException e) { return defaultValue; }
                })
                .orElse(defaultValue);
    }

    private void saveSetting(String key, Double value) {
        SystemSetting setting = systemSettingRepository.findByKey(key)
                .orElseGet(() -> SystemSetting.builder()
                        .key(key)
                        .value("0")
                        .build());

        setting.setValue(String.valueOf(value));
        systemSettingRepository.save(setting);
    }

    private void saveStringSetting(String key, String value) {
        SystemSetting setting = systemSettingRepository.findByKey(key)
                .orElseGet(() -> SystemSetting.builder()
                        .key(key)
                        .value("")
                        .build());

        setting.setValue(value != null ? value : "");
        systemSettingRepository.save(setting);
    }

    private void seedDefaultMaterialsIfEmpty() {
        if (materialCategoryRepository.count() > 0) {
            return;
        }

        List<String> defaults = List.of(
                "Gỗ tự nhiên",
                "Gỗ công nghiệp",
                "Kính cường lực",
                "Inox 304",
                "Đá nhân tạo"
        );

        defaults.forEach(name -> materialCategoryRepository.save(
                MaterialCategory.builder()
                        .name(name)
                        .active(true)
                        .build()
        ));
    }

    private void replaceMaterials(List<MaterialRequest> materialRequests) {
        List<MaterialCategory> current = materialCategoryRepository.findAll();

        current.forEach(material -> material.setActive(false));
        materialCategoryRepository.saveAll(current);

        Set<String> names = new LinkedHashSet<>();

        if (materialRequests != null) {
            for (MaterialRequest material : materialRequests) {
                if (material != null && material.getName() != null && !material.getName().isBlank()) {
                    names.add(material.getName().trim());
                }
            }
        }

        List<MaterialCategory> toSave = new ArrayList<>();

        for (String name : names) {
            MaterialCategory existing = current.stream()
                    .filter(material -> material.getName().equalsIgnoreCase(name))
                    .findFirst()
                    .orElse(null);

            if (existing != null) {
                existing.setName(name);
                existing.setActive(true);
                toSave.add(existing);
            } else {
                toSave.add(MaterialCategory.builder()
                        .name(name)
                        .active(true)
                        .build());
            }
        }

        materialCategoryRepository.saveAll(toSave);
    }

    private List<MaterialResponse> getMaterialResponses() {
        return materialCategoryRepository.findByActiveTrueOrderByNameAsc()
                .stream()
                .map(material -> MaterialResponse.builder()
                        .id(material.getId())
                        .name(material.getName())
                        .build())
                .collect(Collectors.toList());
    }
}