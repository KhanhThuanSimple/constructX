package com.constructx.backend.repository;

import com.constructx.backend.entity.ContractJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ContractJobRepository extends JpaRepository<ContractJob, Long> {

    // tìm job của nhà thầu
    @Query("""
        SELECT cj
        FROM ContractJob cj
        JOIN FETCH cj.project p
        JOIN FETCH cj.customer c
        JOIN FETCH cj.contractor contractor
        WHERE contractor.email = :email
        ORDER BY cj.createdAt DESC
    """)
    List<ContractJob> findContractorJobs(
            @Param("email") String email
    );
}