package com.constructx.backend.features.public_.controller;

import com.constructx.backend.admin.dto.response.MaterialResponse;
import com.constructx.backend.admin.repository.MaterialCategoryRepository;
import com.constructx.backend.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Public endpoints (no auth required) for catalog data.
 */
@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicCatalogController {

    private final MaterialCategoryRepository materialCategoryRepository;

    /**
     * GET /api/public/materials
     * Returns all active material categories managed by admin.
     * Used by customer and contractor home pages to display platform's service catalog.
     */
    @GetMapping("/materials")
    public ResponseEntity<ApiResponse<List<MaterialResponse>>> getMaterials() {
        List<MaterialResponse> materials = materialCategoryRepository
                .findByActiveTrueOrderByNameAsc()
                .stream()
                .map(m -> MaterialResponse.builder()
                        .id(m.getId())
                        .name(m.getName())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok(materials));
    }
}
