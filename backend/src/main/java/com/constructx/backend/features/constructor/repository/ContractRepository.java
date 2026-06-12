package com.constructx.backend.features.constructor.repository;

import com.constructx.backend.features.constructor.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ContractRepository extends JpaRepository<Contract, Long> {

    // Tìm theo project (Luồng A — hợp đồng từ Project)
    @Query("""
        SELECT c FROM Contract c
        LEFT JOIN FETCH c.project
        LEFT JOIN FETCH c.bid
        LEFT JOIN FETCH c.sourceOrder
        JOIN FETCH c.client
        JOIN FETCH c.contractor
        LEFT JOIN FETCH c.stages
        WHERE c.project.id = :projectId
        """)
    Optional<Contract> findByProjectId(@Param("projectId") Long projectId);

    // Tìm theo client — bao gồm cả hợp đồng từ Project lẫn từ Order
    @Query("""
        SELECT DISTINCT c FROM Contract c
        LEFT JOIN FETCH c.project
        LEFT JOIN FETCH c.bid
        LEFT JOIN FETCH c.sourceOrder
        JOIN FETCH c.client
        JOIN FETCH c.contractor
        LEFT JOIN FETCH c.stages
        WHERE c.client.id = :clientId
        ORDER BY c.createdAt DESC
        """)
    List<Contract> findByClientIdOrderByCreatedAtDesc(@Param("clientId") Long clientId);

    // Tìm theo contractor — bao gồm cả hợp đồng từ Project lẫn từ Order
    @Query("""
        SELECT DISTINCT c FROM Contract c
        LEFT JOIN FETCH c.project
        LEFT JOIN FETCH c.bid
        LEFT JOIN FETCH c.sourceOrder
        JOIN FETCH c.client
        JOIN FETCH c.contractor
        LEFT JOIN FETCH c.stages
        WHERE c.contractor.id = :contractorId
        ORDER BY c.createdAt DESC
        """)
    List<Contract> findByContractorIdOrderByCreatedAtDesc(@Param("contractorId") Long contractorId);

    // Admin: tất cả hợp đồng — bao gồm cả từ Project lẫn từ Order
    @Query("""
        SELECT DISTINCT c FROM Contract c
        LEFT JOIN FETCH c.project
        LEFT JOIN FETCH c.bid
        LEFT JOIN FETCH c.sourceOrder
        JOIN FETCH c.client
        JOIN FETCH c.contractor
        LEFT JOIN FETCH c.stages
        ORDER BY c.createdAt DESC
        """)
    List<Contract> findAllByOrderByCreatedAtDesc();

    // Admin: lọc theo status — bao gồm cả từ Project lẫn từ Order
    @Query("""
        SELECT DISTINCT c FROM Contract c
        LEFT JOIN FETCH c.project
        LEFT JOIN FETCH c.bid
        LEFT JOIN FETCH c.sourceOrder
        JOIN FETCH c.client
        JOIN FETCH c.contractor
        LEFT JOIN FETCH c.stages
        WHERE c.status = :status
        ORDER BY c.createdAt DESC
        """)
    List<Contract> findByStatusOrderByCreatedAtDesc(@Param("status") Contract.Status status);

    long countByStatus(Contract.Status status);

    @Query("SELECT COUNT(c) FROM Contract c WHERE c.createdAt >= :from AND c.createdAt < :to")
    long countBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
