package com.constructx.backend.admin.dto.request;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class AdminSettingsRequest {
    private Double customerFee = 0.0;
    private Double contractorFee = 0.0;
    private Double platformFee = 0.0;
    private Double managementFee = 0.0;
    private List<MaterialRequest> materials = new ArrayList<>();
}