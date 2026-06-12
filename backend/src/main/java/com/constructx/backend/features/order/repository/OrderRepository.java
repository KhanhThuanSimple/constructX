package com.constructx.backend.features.order.repository;

import com.constructx.backend.features.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("""
        SELECT DISTINCT o FROM Order o
        LEFT JOIN FETCH o.items i
        LEFT JOIN FETCH i.product
        LEFT JOIN FETCH o.customer
        LEFT JOIN FETCH o.assignedContractor
        ORDER BY o.createdAt DESC
        """)
    List<Order> findAllWithItems();

    @Query("""
        SELECT DISTINCT o FROM Order o
        LEFT JOIN FETCH o.items i
        LEFT JOIN FETCH i.product
        LEFT JOIN FETCH o.customer
        LEFT JOIN FETCH o.assignedContractor
        WHERE o.status = :status
        ORDER BY o.createdAt DESC
        """)
    List<Order> findByStatusWithItems(@Param("status") Order.Status status);

    @Query("""
        SELECT DISTINCT o FROM Order o
        LEFT JOIN FETCH o.items i
        LEFT JOIN FETCH i.product
        LEFT JOIN FETCH o.customer
        LEFT JOIN FETCH o.assignedContractor
        WHERE o.customer.id = :customerId
        ORDER BY o.createdAt DESC
        """)
    List<Order> findByCustomerIdWithItems(@Param("customerId") Long customerId);

    @Query("""
        SELECT DISTINCT o FROM Order o
        LEFT JOIN FETCH o.items i
        LEFT JOIN FETCH i.product
        LEFT JOIN FETCH o.customer
        LEFT JOIN FETCH o.assignedContractor
        WHERE o.id = :id
        """)
    Optional<Order> findByIdWithItems(@Param("id") Long id);

    Optional<Order> findByOrderCode(String orderCode);

    /** Nhà thầu xem đơn hàng đã được giao cho mình */
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items i LEFT JOIN FETCH i.product WHERE o.assignedContractor.id = :contractorId ORDER BY o.createdAt DESC")
    List<Order> findByAssignedContractorId(@Param("contractorId") Long contractorId);

    long countByStatus(Order.Status status);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :from AND o.createdAt < :to")
    long countBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    /**
     * Lấy các đơn hàng đang SHIPPED, đã được nhà thầu báo xong,
     * chưa giải ngân, và đã quá thời hạn 24h.
     */
    @Query("""
        SELECT o FROM Order o
        LEFT JOIN FETCH o.items
        WHERE o.status = 'SHIPPED'
          AND o.contractorMarkedDone = true
          AND o.fullyPaid = false
          AND o.contractorDoneAt <= :cutoff
        """)
    List<Order> findShippedOrdersReadyForAutoRelease(@Param("cutoff") LocalDateTime cutoff);
}
