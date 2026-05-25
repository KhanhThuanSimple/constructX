package com.constructx.backend.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.constructx.backend.admin.entity.MaterialCategory;

import java.util.List;

public interface MaterialCategoryRepository extends JpaRepository<MaterialCategory, Long> {
    List<MaterialCategory> findByActiveTrueOrderByNameAsc();

    boolean existsByNameIgnoreCase(String name);
}