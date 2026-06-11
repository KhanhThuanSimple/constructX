package com.constructx.backend.features.portfolio.controller;

import com.constructx.backend.features.portfolio.dto.PortfolioItemRequest;
import com.constructx.backend.features.portfolio.dto.PortfolioItemResponse;
import com.constructx.backend.features.portfolio.service.PortfolioService;
import com.constructx.backend.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;

    /** GET /api/portfolio/my — portfolio của tôi (contractor) */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<PortfolioItemResponse>>> getMyPortfolio() {
        return ResponseEntity.ok(ApiResponse.ok(portfolioService.getMyPortfolio()));
    }

    /** GET /api/portfolio/contractor/{id} — portfolio của nhà thầu (public) */
    @GetMapping("/contractor/{id}")
    public ResponseEntity<ApiResponse<List<PortfolioItemResponse>>> getContractorPortfolio(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(portfolioService.getPortfolioByContractorId(id)));
    }

    /** POST /api/portfolio — thêm công trình mới */
    @PostMapping
    public ResponseEntity<ApiResponse<PortfolioItemResponse>> addItem(
            @RequestBody PortfolioItemRequest request) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Đã thêm công trình!", portfolioService.addItem(request)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /** PUT /api/portfolio/{id} — cập nhật công trình */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PortfolioItemResponse>> updateItem(
            @PathVariable Long id,
            @RequestBody PortfolioItemRequest request) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Đã cập nhật!", portfolioService.updateItem(id, request)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /** DELETE /api/portfolio/{id} — xóa công trình */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteItem(@PathVariable Long id) {
        try {
            portfolioService.deleteItem(id);
            return ResponseEntity.ok(ApiResponse.ok("Đã xóa công trình!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
