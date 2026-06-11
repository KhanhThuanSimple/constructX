package com.constructx.backend.features.order.service;

import com.constructx.backend.features.order.entity.Order;
import com.constructx.backend.features.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduler tự động giải ngân đơn hàng sau 24h kể từ khi nhà thầu báo hoàn thành.
 *
 * Điều kiện auto-release:
 *   - Order.status == SHIPPED
 *   - contractorMarkedDone == true
 *   - contractorDoneAt + 24h < now
 *   - fullyPaid == false
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OrderAutoReleaseScheduler {

    private final OrderRepository orderRepository;
    private final OrderPaymentService orderPaymentService;

    /**
     * Chạy mỗi 15 phút để kiểm tra và release các đơn hàng đã quá 24h.
     * fixedDelay = 15 phút = 900_000 ms, initialDelay = 60s để chờ app khởi động xong.
     */
    @Scheduled(fixedDelay = 900_000, initialDelay = 60_000)
    public void autoReleaseExpiredOrders() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(24);

        List<Order> candidates = orderRepository.findShippedOrdersReadyForAutoRelease(cutoff);

        if (candidates.isEmpty()) return;

        log.info("[AutoRelease] Found {} order(s) eligible for auto-release", candidates.size());

        for (Order order : candidates) {
            try {
                orderPaymentService.autoReleaseIfExpired(order);
                log.info("[AutoRelease] Released order {}", order.getOrderCode());
            } catch (Exception e) {
                log.error("[AutoRelease] Failed to release order {}: {}", order.getOrderCode(), e.getMessage(), e);
            }
        }
    }
}
