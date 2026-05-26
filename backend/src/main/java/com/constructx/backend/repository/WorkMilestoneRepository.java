package com.constructx.backend.repository;

import com.constructx.backend.entity.WorkMilestone;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface WorkMilestoneRepository
        extends JpaRepository<WorkMilestone, Long> {

    @Query("""
        SELECT wm
        FROM WorkMilestone wm
        JOIN FETCH wm.workPlan wp
        JOIN FETCH wp.contractJob cj
        JOIN FETCH cj.contractor contractor
        WHERE wm.id = :milestoneId
    """)
    Optional<WorkMilestone> findDetailById(
            @Param("milestoneId") Long milestoneId
    );
}