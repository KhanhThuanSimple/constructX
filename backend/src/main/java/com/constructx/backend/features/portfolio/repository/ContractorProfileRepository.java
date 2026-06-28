package com.constructx.backend.features.portfolio.repository;

import com.constructx.backend.features.portfolio.entity.ContractorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ContractorProfileRepository extends JpaRepository<ContractorProfile, Long> {
}
