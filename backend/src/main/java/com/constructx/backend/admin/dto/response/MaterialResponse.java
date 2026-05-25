package com.constructx.backend.admin.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MaterialResponse {
    private Long id;
    private String name;
}