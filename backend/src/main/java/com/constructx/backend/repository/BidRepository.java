package com.constructx.backend.repository;

import com.constructx.backend.entity.Bid;
import com.constructx.backend.features.project.entity.Project;
import com.constructx.backend.features.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BidRepository extends JpaRepository<Bid, Long> {

    @Query("""
        SELECT DISTINCT b
        FROM Bid b
        JOIN FETCH b.contractor
        LEFT JOIN FETCH b.details
        WHERE b.project.id = :projectId
        ORDER BY b.createdAt DESC
    """)
    List<Bid> findProjectBids(@Param("projectId") Long projectId);

    @Query("""
        SELECT DISTINCT b
        FROM Bid b
        JOIN FETCH b.project
        LEFT JOIN FETCH b.details
        WHERE b.contractor.id = :contractorId
        ORDER BY b.createdAt DESC
    """)
    List<Bid> findMyBids(@Param("contractorId") Long contractorId);

    boolean existsByProjectAndContractor(Project project, User contractor);


    // từ chối tất cả các báo giá không dc chọn
    @Modifying
    @Query("""
        UPDATE Bid b
        SET b.status = 'REJECTED'
        WHERE b.project.id = :projectId
        AND b.id <> :selectedBidId
    """)
    void rejectOtherBids(
            @Param("projectId") Long projectId,
            @Param("selectedBidId") Long selectedBidId
    );
}