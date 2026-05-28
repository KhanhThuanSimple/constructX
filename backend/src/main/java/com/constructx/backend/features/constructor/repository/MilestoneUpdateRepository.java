package com.constructx.backend.features.constructor.repository;

import com.constructx.backend.features.constructor.entity.MilestoneUpdate;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MilestoneUpdateRepository extends JpaRepository<MilestoneUpdate, Long> {
}