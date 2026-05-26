package com.constructx.backend.admin.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AdminSettingsResponse {
    private Double customerFee;
    private Double contractorFee;
    private Double platformFee;
    private Double managementFee;
    private List<MaterialResponse> materials;
}