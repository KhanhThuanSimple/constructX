package com.constructx.backend.features.constructor.repository;

import com.constructx.backend.features.constructor.entity.DisbursementRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DisbursementRequestRepository extends JpaRepository<DisbursementRequest, Long> {

    List<DisbursementRequest> findByContractIdOrderByCreatedAtDesc(Long contractId);

    @Query("SELECT COALESCE(SUM(d.amount), 0) FROM DisbursementRequest d " +
           "WHERE d.contract.id = :contractId AND d.status = 'APPROVED'")
    Long sumApprovedByContractId(@Param("contractId") Long contractId);

    boolean existsByContractIdAndPhaseThresholdAndStatusIn(
        Long contractId, Integer phaseThreshold, List<DisbursementRequest.Status> statuses);
}
