package com.constructx.backend.features.product.repository;

import com.constructx.backend.features.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByActiveTrueOrderByCreatedAtDesc();

    List<Product> findByActiveTrueAndCategoryOrderByCreatedAtDesc(String category);

    List<Product> findByActiveTrueAndFeaturedTrueOrderByCreatedAtDesc();

    List<Product> findByActiveTrueAndNameContainingIgnoreCaseOrderByCreatedAtDesc(String name);
}
