package com.constructx.backend.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.constructx.backend.admin.entity.Dispute;

import java.util.List;

public interface DisputeRepository extends JpaRepository<Dispute, Long> {
    List<Dispute> findByStatusOrderByCreatedAtDesc(Dispute.Status status);

    List<Dispute> findAllByOrderByCreatedAtDesc();

    long countByStatus(Dispute.Status status);


    long countByContractorId(Long contractorId);

    long countByContractorIdAndStatus(Long contractorId, Dispute.Status status);

    java.util.Optional<Dispute> findFirstByContractIdOrderByCreatedAtDesc(Long contractId);

}