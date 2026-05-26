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

    private static final String CUSTOMER_FEE = "customerFee";
    private static final String CONTRACTOR_FEE = "contractorFee";
    private static final String PLATFORM_FEE = "platformFee";
    private static final String MANAGEMENT_FEE = "managementFee";

    private final SystemSettingRepository systemSettingRepository;
    private final MaterialCategoryRepository materialCategoryRepository;

    @Transactional
    public AdminSettingsResponse getSettings() {
        seedDefaultMaterialsIfEmpty();

        return AdminSettingsResponse.builder()
                .customerFee(getDouble(CUSTOMER_FEE, 3.5))
                .contractorFee(getDouble(CONTRACTOR_FEE, 5.0))
                .platformFee(getDouble(PLATFORM_FEE, 1.0))
                .managementFee(getDouble(MANAGEMENT_FEE, 0.5))
                .materials(getMaterialResponses())
                .build();
    }

    @Transactional
    public AdminSettingsResponse updateSettings(AdminSettingsRequest request) {
        if (request == null) {
            request = new AdminSettingsRequest();
        }

        saveSetting(CUSTOMER_FEE, sanitizePercent(request.getCustomerFee()));
        saveSetting(CONTRACTOR_FEE, sanitizePercent(request.getContractorFee()));
        saveSetting(PLATFORM_FEE, sanitizePercent(request.getPlatformFee()));
        saveSetting(MANAGEMENT_FEE, sanitizePercent(request.getManagementFee()));

        replaceMaterials(request.getMaterials());

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

    private void saveSetting(String key, Double value) {
        SystemSetting setting = systemSettingRepository.findByKey(key)
                .orElseGet(() -> SystemSetting.builder()
                        .key(key)
                        .value("0")
                        .build());

        setting.setValue(String.valueOf(value));
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