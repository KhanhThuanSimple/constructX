package com.constructx.backend.features.constructor.repository;

import com.constructx.backend.features.constructor.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ContractRepository extends JpaRepository<Contract, Long> {

    Optional<Contract> findByProjectId(Long projectId);

    List<Contract> findByClientIdOrderByCreatedAtDesc(Long clientId);

    List<Contract> findByContractorIdOrderByCreatedAtDesc(Long contractorId);

    List<Contract> findAllByOrderByCreatedAtDesc();

    List<Contract> findByStatusOrderByCreatedAtDesc(Contract.Status status);

    long countByStatus(Contract.Status status);

    @Query("SELECT COUNT(c) FROM Contract c WHERE c.createdAt >= :from AND c.createdAt < :to")
    long countBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
