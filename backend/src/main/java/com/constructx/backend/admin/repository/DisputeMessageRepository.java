package com.constructx.backend.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.constructx.backend.admin.entity.DisputeMessage;

import java.util.List;

public interface DisputeMessageRepository extends JpaRepository<DisputeMessage, Long> {
    List<DisputeMessage> findByDisputeIdOrderByCreatedAtAsc(Long disputeId);
}
