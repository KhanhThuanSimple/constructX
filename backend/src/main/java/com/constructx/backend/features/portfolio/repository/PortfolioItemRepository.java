package com.constructx.backend.features.portfolio.repository;

import com.constructx.backend.features.portfolio.entity.PortfolioItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PortfolioItemRepository extends JpaRepository<PortfolioItem, Long> {
    List<PortfolioItem> findByContractorIdOrderByCreatedAtDesc(Long contractorId);
}
