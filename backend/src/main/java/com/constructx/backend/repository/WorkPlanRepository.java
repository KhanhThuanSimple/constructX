package com.constructx.backend.repository;

import com.constructx.backend.entity.WorkPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WorkPlanRepository
        extends JpaRepository<WorkPlan, Long> {

    Optional<WorkPlan> findByContractJobId(Long jobId);

    Optional<WorkPlan> findByContractJobIdAndStatus(
            Long jobId,
            WorkPlan.Status status
    );
}