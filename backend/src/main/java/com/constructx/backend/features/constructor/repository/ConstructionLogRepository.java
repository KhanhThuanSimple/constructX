package com.constructx.backend.features.constructor.repository;

import com.constructx.backend.features.constructor.entity.ConstructionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConstructionLogRepository extends JpaRepository<ConstructionLog, Long> {

    List<ConstructionLog> findByContractIdOrderByCreatedAtDesc(Long contractId);

    @Query("SELECT MAX(cl.progressPercent) FROM ConstructionLog cl WHERE cl.contract.id = :contractId")
    Optional<Integer> findMaxProgressByContractId(@Param("contractId") Long contractId);
}
