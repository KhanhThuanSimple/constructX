package com.constructx.backend.features.product.service;

import com.constructx.backend.features.product.dto.ProductRequest;
import com.constructx.backend.features.product.dto.ProductResponse;
import com.constructx.backend.features.product.entity.Product;
import com.constructx.backend.features.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    // ── Public ──────────────────────────────────────────────────────────

    public List<ProductResponse> getAllActive() {
        return productRepository.findByActiveTrueOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ProductResponse> getFeatured() {
        return productRepository.findByActiveTrueAndFeaturedTrueOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ProductResponse> getByCategory(String category) {
        return productRepository.findByActiveTrueAndCategoryOrderByCreatedAtDesc(category)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ProductResponse> search(String keyword) {
        return productRepository.findByActiveTrueAndNameContainingIgnoreCaseOrderByCreatedAtDesc(keyword)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ProductResponse getById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm #" + id));
        return toResponse(product);
    }

    // ── Admin CRUD ──────────────────────────────────────────────────────

    @Transactional
    public ProductResponse create(ProductRequest req) {
        Product product = Product.builder()
                .name(req.getName())
                .description(req.getDescription())
                .price(req.getPrice())
                .originalPrice(req.getOriginalPrice())
                .imageUrl(req.getImageUrl())
                .category(req.getCategory())
                .brand(req.getBrand())
                .material(req.getMaterial())
                .dimensions(req.getDimensions())
                .color(req.getColor())
                .stock(req.getStock() != null ? req.getStock() : 0)
                .featured(req.getFeatured() != null ? req.getFeatured() : false)
                .active(req.getActive() != null ? req.getActive() : true)
                .build();
        return toResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest req) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm #" + id));

        if (req.getName() != null) product.setName(req.getName());
        if (req.getDescription() != null) product.setDescription(req.getDescription());
        if (req.getPrice() != null) product.setPrice(req.getPrice());
        if (req.getOriginalPrice() != null) product.setOriginalPrice(req.getOriginalPrice());
        if (req.getImageUrl() != null) product.setImageUrl(req.getImageUrl());
        if (req.getCategory() != null) product.setCategory(req.getCategory());
        if (req.getBrand() != null) product.setBrand(req.getBrand());
        if (req.getMaterial() != null) product.setMaterial(req.getMaterial());
        if (req.getDimensions() != null) product.setDimensions(req.getDimensions());
        if (req.getColor() != null) product.setColor(req.getColor());
        if (req.getStock() != null) product.setStock(req.getStock());
        if (req.getFeatured() != null) product.setFeatured(req.getFeatured());
        if (req.getActive() != null) product.setActive(req.getActive());

        return toResponse(productRepository.save(product));
    }

    @Transactional
    public void delete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm #" + id));
        // Soft delete
        product.setActive(false);
        productRepository.save(product);
    }

    public List<ProductResponse> getAll() {
        return productRepository.findAll()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── Mapping ─────────────────────────────────────────────────────────

    private ProductResponse toResponse(Product p) {
        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .originalPrice(p.getOriginalPrice())
                .imageUrl(p.getImageUrl())
                .category(p.getCategory())
                .brand(p.getBrand())
                .material(p.getMaterial())
                .dimensions(p.getDimensions())
                .color(p.getColor())
                .stock(p.getStock())
                .rating(p.getRating())
                .reviewCount(p.getReviewCount())
                .featured(p.getFeatured())
                .active(p.getActive())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
