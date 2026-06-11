package com.constructx.backend.features.public_.controller;

import com.constructx.backend.features.product.dto.ProductResponse;
import com.constructx.backend.features.product.service.ProductService;
import com.constructx.backend.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public product endpoints — no authentication required.
 * Used by the standalone shop landing page.
 */
@RestController
@RequestMapping("/api/public/products")
@RequiredArgsConstructor
public class PublicProductController {

    private final ProductService productService;

    /** GET /api/public/products — tất cả sản phẩm active */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAll(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search
    ) {
        List<ProductResponse> result;
        if (search != null && !search.isBlank()) {
            result = productService.search(search);
        } else if (category != null && !category.isBlank()) {
            result = productService.getByCategory(category);
        } else {
            result = productService.getAllActive();
        }
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    /** GET /api/public/products/featured — sản phẩm nổi bật */
    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getFeatured() {
        return ResponseEntity.ok(ApiResponse.ok(productService.getFeatured()));
    }

    /** GET /api/public/products/{id} — chi tiết sản phẩm */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(ApiResponse.ok(productService.getById(id)));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
