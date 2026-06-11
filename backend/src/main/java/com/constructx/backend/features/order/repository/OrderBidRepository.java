package com.constructx.backend.features.order.repository;

import com.constructx.backend.features.order.entity.OrderBid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderBidRepository extends JpaRepository<OrderBid, Long> {

    /** Lấy tất cả bids của một order (cho owner + admin xem) */
    @Query("SELECT DISTINCT b FROM OrderBid b LEFT JOIN FETCH b.items LEFT JOIN FETCH b.contractor WHERE b.order.id = :orderId ORDER BY b.createdAt DESC")
    List<OrderBid> findByOrderIdWithItems(@Param("orderId") Long orderId);

    /** Nhà thầu xem bids của mình */
    @Query("SELECT DISTINCT b FROM OrderBid b LEFT JOIN FETCH b.items LEFT JOIN FETCH b.order WHERE b.contractor.id = :contractorId ORDER BY b.createdAt DESC")
    List<OrderBid> findByContractorIdWithItems(@Param("contractorId") Long contractorId);

    /** Kiểm tra nhà thầu đã bid chưa */
    boolean existsByOrderIdAndContractorId(Long orderId, Long contractorId);

    /** Reject tất cả bids khác khi chọn 1 bid */
    @Modifying
    @Query("UPDATE OrderBid b SET b.status = 'REJECTED' WHERE b.order.id = :orderId AND b.id != :acceptedBidId")
    void rejectOtherBids(@Param("orderId") Long orderId, @Param("acceptedBidId") Long acceptedBidId);

    Optional<OrderBid> findByIdAndOrderId(Long id, Long orderId);
}
