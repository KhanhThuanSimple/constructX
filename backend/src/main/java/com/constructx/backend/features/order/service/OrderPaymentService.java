package com.constructx.backend.features.order.service;

import com.constructx.backend.features.notification.entity.Notification;
import com.constructx.backend.features.notification.service.NotificationService;
import com.constructx.backend.features.order.entity.Order;
import com.constructx.backend.features.order.repository.OrderRepository;
import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.user.repository.UserRepository;
import com.constructx.backend.features.wallet.entity.Transaction;
import com.constructx.backend.features.wallet.entity.Wallet;
import com.constructx.backend.features.wallet.repository.TransactionRepository;
import com.constructx.backend.features.wallet.repository.WalletRepository;
import com.constructx.backend.features.wallet.service.WalletCoreManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

/**
 * OrderPaymentService — Xử lý toàn bộ dòng tiền Mini-Escrow cho đơn hàng lẻ.
 *
 * Luồng tài chính:
 *   1. Khách đặt hàng + chấp nhận điều khoản
 *      → Lock depositAmount (60%) từ ví khách vào Frozen
 *      → Status: PENDING → DEPOSIT_PAID
 *
 *   2. Nhà thầu báo hoàn thành (kèm ảnh)
 *      → contractorMarkedDone = true, contractorDoneAt = now
 *      → Status: SHIPPED (bắt đầu đếm 24h)
 *
 *   3a. Khách xác nhận nhận hàng
 *      → Lock 40% còn lại từ ví khách
 *      → Release 100% (trừ phí sàn 5%) → ví nhà thầu
 *      → Status: DELIVERED, fullyPaid = true
 *
 *   3b. Auto-Release sau 24h không phản hồi
 *      → Tương tự 3a, chạy qua Scheduler
 *
 *   4. Hủy đơn (chỉ được khi chưa PROCESSING)
 *      → Unlock depositAmount về ví khách
 *      → Status: CANCELLED
 *
 *   5. Khiếu nại
 *      → Admin phân xử, gọi WalletArbitrationManager
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderPaymentService {

    // Platform fee rate: 5%
    private static final BigDecimal PLATFORM_FEE_RATE = BigDecimal.valueOf(0.05);
    // Tỷ lệ đặt cọc mặc định: 60%
    private static final BigDecimal DEFAULT_DEPOSIT_RATE = BigDecimal.valueOf(0.60);

    private final OrderRepository orderRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final WalletCoreManager walletCoreManager;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    // ─────────────────────────────────────────────────────────────
    // BƯỚC 1: Lock tiền đặt cọc khi khách đặt hàng
    // ─────────────────────────────────────────────────────────────

    /**
     * Khóa 60% giá trị đơn hàng từ ví khách vào Frozen.
     * Gọi ngay khi khách nhấn "Đặt hàng & Chấp nhận điều khoản".
     *
     * @param order     Đơn hàng vừa tạo (status = PENDING)
     * @param customer  Khách hàng
     */
    @Transactional
    public void lockDepositForOrder(Order order, User customer) {
        if (order.getTotalAmount() == null || order.getTotalAmount().compareTo(BigDecimal.ZERO) <= 0) {
            // Đơn CUSTOM chưa có giá → bỏ qua, sẽ lock sau khi chốt giá với nhà thầu
            return;
        }

        Wallet customerWallet = walletRepository.findByUserIdForUpdate(customer.getId())
                .orElseThrow(() -> new RuntimeException("Ví khách hàng không tồn tại. Vui lòng nạp tiền trước."));

        // Tính số tiền cọc
        BigDecimal depositAmt = order.getTotalAmount()
                .multiply(order.getDepositPercent())
                .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);

        // Kiểm tra số dư khả dụng
        Long available = customerWallet.getAvailableBalance();
        if (available < depositAmt.longValue()) {
            throw new RuntimeException(String.format(
                    "Số dư ví không đủ. Cần %s để đặt cọc (60%%), hiện có %s.",
                    formatVnd(depositAmt.longValue()), formatVnd(available)));
        }

        // Lock tiền vào Frozen
        walletCoreManager.executeLockForOrder(
                customerWallet,
                depositAmt.longValue(),
                Transaction.Type.LOCK,
                "CONSTRUCTX_ESCROW",
                order.getOrderCode() + "-DEPOSIT"
        );

        // Cập nhật order
        order.setDepositAmount(depositAmt);
        order.setDepositLocked(true);
        order.setTermsAccepted(true);
        order.setStatus(Order.Status.DEPOSIT_PAID);
        orderRepository.save(order);

        log.info("[Mini-Escrow] Locked deposit {} for order {}", depositAmt, order.getOrderCode());

        // Notify customer
        notificationService.createNotification(customer, Notification.NotifType.PAYMENT_SUCCESS,
                String.format("✅ Đã khóa tiền đặt cọc %s cho đơn hàng %s. Nhà thầu sẽ bắt đầu sản xuất ngay!",
                        formatVnd(depositAmt.longValue()), order.getOrderCode()));

        // Notify contractor nếu đã được gán
        if (order.getAssignedContractor() != null) {
            notificationService.createNotification(order.getAssignedContractor(), Notification.NotifType.PAYMENT_SUCCESS,
                    String.format("💰 Khách hàng đã đặt cọc cho đơn %s. Bắt đầu sản xuất ngay!",
                            order.getOrderCode()));
        }
    }

    /**
     * Overload: Lock deposit cho đơn hàng CUSTOM sau khi chốt giá với nhà thầu.
     * Gọi khi admin/customer xác nhận giá cuối cùng.
     */
    @Transactional
    public void lockDepositForCustomOrder(Long orderId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User customer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (!order.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Bạn không có quyền thao tác trên đơn hàng này");
        }
        if (order.getDepositLocked()) {
            throw new RuntimeException("Đơn hàng này đã được đặt cọc rồi");
        }
        if (order.getStatus() != Order.Status.BIDDING_CLOSED && order.getStatus() != Order.Status.PENDING) {
            throw new RuntimeException("Không thể đặt cọc ở trạng thái hiện tại");
        }

        lockDepositForOrder(order, customer);
    }

    // ─────────────────────────────────────────────────────────────
    // BƯỚC 2: Nhà thầu báo hoàn thành sản phẩm
    // ─────────────────────────────────────────────────────────────

    /**
     * Nhà thầu đánh dấu sản phẩm đã xong + upload ảnh thực tế.
     * → Chuyển sang SHIPPED, bắt đầu countdown 24h auto-release.
     */
    @Transactional
    public void markContractorDone(Long orderId, String completionImageUrl) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User contractor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        // Kiểm tra quyền: phải là nhà thầu được gán
        if (order.getAssignedContractor() == null ||
                !order.getAssignedContractor().getId().equals(contractor.getId())) {
            throw new RuntimeException("Bạn không phải nhà thầu của đơn hàng này");
        }

        if (order.getStatus() != Order.Status.PROCESSING) {
            throw new RuntimeException("Chỉ có thể báo hoàn thành khi đơn đang ở trạng thái Đang sản xuất");
        }

        order.setContractorMarkedDone(true);
        order.setContractorDoneAt(LocalDateTime.now());
        order.setCompletionImageUrl(completionImageUrl);
        order.setStatus(Order.Status.SHIPPED);
        orderRepository.save(order);

        log.info("[Mini-Escrow] Contractor marked done for order {}", order.getOrderCode());

        // Notify customer — bắt đầu 24h window
        notificationService.createNotification(order.getCustomer(), Notification.NotifType.SYSTEM,
                String.format("📦 Sản phẩm đơn %s đã hoàn thiện và đang được giao đến bạn! " +
                        "Vui lòng xác nhận trong 24h, nếu không hệ thống sẽ tự động xác nhận.",
                        order.getOrderCode()));
    }

    // ─────────────────────────────────────────────────────────────
    // BƯỚC 3A: Khách xác nhận đã nhận hàng → Giải ngân
    // ─────────────────────────────────────────────────────────────

    /**
     * Khách xác nhận nhận hàng, hài lòng với sản phẩm.
     * → Lock 40% còn lại → Release 100% cho nhà thầu (trừ phí sàn 5%)
     */
    @Transactional
    public void confirmDelivery(Long orderId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User customer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (!order.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Bạn không có quyền xác nhận đơn hàng này");
        }
        if (order.getStatus() != Order.Status.SHIPPED) {
            throw new RuntimeException("Chỉ có thể xác nhận khi đơn đang ở trạng thái Đang giao");
        }

        executeFullRelease(order);
    }

    // ─────────────────────────────────────────────────────────────
    // BƯỚC 3B: Auto-Release sau 24h (gọi từ Scheduler)
    // ─────────────────────────────────────────────────────────────

    /**
     * Tự động giải ngân nếu khách không phản hồi sau 24h kể từ khi nhà thầu báo xong.
     * Được gọi bởi {@link OrderAutoReleaseScheduler}.
     */
    @Transactional
    public void autoReleaseIfExpired(Order order) {
        if (order.getStatus() != Order.Status.SHIPPED) return;
        if (order.getContractorDoneAt() == null) return;
        if (LocalDateTime.now().isBefore(order.getContractorDoneAt().plusHours(24))) return;

        log.info("[Mini-Escrow] Auto-releasing payment for order {} (24h expired)", order.getOrderCode());

        notificationService.createNotification(order.getCustomer(), Notification.NotifType.SYSTEM,
                String.format("⏰ Đơn hàng %s đã tự động xác nhận giao thành công do không có phản hồi trong 24h.",
                        order.getOrderCode()));

        executeFullRelease(order);
    }

    // ─────────────────────────────────────────────────────────────
    // BƯỚC 4: Hủy đơn → Hoàn tiền cọc
    // ─────────────────────────────────────────────────────────────

    /**
     * Hoàn trả tiền cọc về ví khách khi đơn bị hủy.
     * Chỉ áp dụng khi đơn chưa vào PROCESSING.
     * Gọi từ {@link OrderService#cancelOrder}.
     */
    @Transactional
    public void refundDepositOnCancel(Order order) {
        if (!Boolean.TRUE.equals(order.getDepositLocked())) return;
        if (order.getDepositAmount() == null || order.getDepositAmount().compareTo(BigDecimal.ZERO) <= 0) return;

        User customer = order.getCustomer();
        Wallet customerWallet = walletRepository.findByUserIdForUpdate(customer.getId())
                .orElseThrow(() -> new RuntimeException("Ví khách hàng không tồn tại"));

        Long refundAmt = order.getDepositAmount().longValue();

        // Tìm giao dịch LOCK gốc để đảo ngược
        String lockKey = "LOCK-" + order.getOrderCode() + "-DEPOSIT";
        Transaction lockTx = transactionRepository.findByGatewayOrderId(lockKey).orElse(null);

        if (lockTx != null) {
            walletCoreManager.executeUnlockAmount(lockTx, "Hủy đơn hàng " + order.getOrderCode());
        } else {
            // Fallback: unlock trực tiếp nếu không tìm được giao dịch gốc
            customerWallet.setLockedAmount(customerWallet.getLockedAmount() - refundAmt);
            walletRepository.save(customerWallet);

            Transaction refundTx = Transaction.builder()
                    .wallet(customerWallet)
                    .amount(refundAmt)
                    .type(Transaction.Type.RELEASE)
                    .status(Transaction.Status.SUCCESS)
                    .paymentGateway("CONSTRUCTX_ESCROW")
                    .gatewayOrderId("REFUND-" + order.getOrderCode())
                    .description("Hoàn tiền cọc do hủy đơn: " + order.getOrderCode())
                    .createdAt(LocalDateTime.now())
                    .build();
            transactionRepository.save(refundTx);
        }

        order.setDepositLocked(false);
        orderRepository.save(order);

        log.info("[Mini-Escrow] Refunded deposit {} for cancelled order {}", refundAmt, order.getOrderCode());

        notificationService.createNotification(customer, Notification.NotifType.PAYMENT_SUCCESS,
                String.format("💸 Đã hoàn trả %s tiền cọc về ví của bạn cho đơn hàng %s đã hủy.",
                        formatVnd(refundAmt), order.getOrderCode()));
    }

    // ─────────────────────────────────────────────────────────────
    // INTERNAL: Giải ngân toàn bộ cho nhà thầu
    // ─────────────────────────────────────────────────────────────

    /**
     * Thực hiện giải ngân đầy đủ:
     *   1. Lock 40% còn lại từ ví khách
     *   2. Tính tổng = 100% order
     *   3. Tính phí sàn 5% trên tổng
     *   4. Unlock 100% từ Frozen của khách (giải phóng lockedAmount)
     *   5. Trừ 100% khỏi balance khách (tiền thực sự chuyển đi)
     *   6. Cộng 95% vào balance nhà thầu (doanh thu)
     */
    @Transactional
    public void executeFullRelease(Order order) {
        if (Boolean.TRUE.equals(order.getFullyPaid())) {
            log.warn("[Mini-Escrow] Order {} already fully paid, skipping.", order.getOrderCode());
            return;
        }

        User customer = order.getCustomer();
        User contractor = order.getAssignedContractor();

        if (contractor == null) {
            throw new RuntimeException("Đơn hàng " + order.getOrderCode() + " chưa có nhà thầu được gán");
        }

        Wallet customerWallet = walletRepository.findByUserIdForUpdate(customer.getId())
                .orElseThrow(() -> new RuntimeException("Ví khách hàng không tồn tại"));
        Wallet contractorWallet = walletRepository.findByUserIdForUpdate(contractor.getId())
                .orElseThrow(() -> new RuntimeException("Ví nhà thầu không tồn tại"));

        BigDecimal totalAmount = order.getTotalAmount();
        BigDecimal depositAmt = order.getDepositAmount() != null
                ? order.getDepositAmount()
                : totalAmount.multiply(DEFAULT_DEPOSIT_RATE).setScale(0, RoundingMode.HALF_UP);

        BigDecimal remainingAmt = totalAmount.subtract(depositAmt); // 40%

        // ── Bước 1: Kiểm tra và lock 40% còn lại ──────────────────
        if (remainingAmt.compareTo(BigDecimal.ZERO) > 0) {
            Long available = customerWallet.getAvailableBalance();
            if (available < remainingAmt.longValue()) {
                throw new RuntimeException(String.format(
                        "Số dư ví không đủ để thanh toán phần còn lại %s. Hiện có %s.",
                        formatVnd(remainingAmt.longValue()), formatVnd(available)));
            }

            // Lock phần còn lại vào Frozen
            walletCoreManager.executeLockForOrder(
                    customerWallet,
                    remainingAmt.longValue(),
                    Transaction.Type.LOCK,
                    "CONSTRUCTX_ESCROW",
                    order.getOrderCode() + "-FINAL"
            );
        }

        // ── Bước 2: Tính phí sàn ──────────────────────────────────
        BigDecimal platformFee = totalAmount.multiply(PLATFORM_FEE_RATE).setScale(0, RoundingMode.HALF_UP);
        BigDecimal contractorRevenue = totalAmount.subtract(platformFee);

        // ── Bước 3: Debit toàn bộ 100% khỏi balance + lockedAmount khách ──
        // Unlock deposit (60%) đã lock từ trước
        customerWallet.setLockedAmount(customerWallet.getLockedAmount() - depositAmt.longValue());
        // Unlock remaining (40%) vừa lock
        if (remainingAmt.compareTo(BigDecimal.ZERO) > 0) {
            customerWallet.setLockedAmount(customerWallet.getLockedAmount() - remainingAmt.longValue());
        }
        // Trừ hẳn 100% khỏi balance
        customerWallet.setBalance(customerWallet.getBalance() - totalAmount.longValue());
        walletRepository.save(customerWallet);

        // Ghi transaction debit phía khách
        transactionRepository.save(Transaction.builder()
                .wallet(customerWallet)
                .amount(totalAmount.longValue())
                .type(Transaction.Type.RELEASE)
                .status(Transaction.Status.SUCCESS)
                .paymentGateway("CONSTRUCTX_ESCROW")
                .gatewayOrderId("PAY-" + order.getOrderCode())
                .description(String.format("Thanh toán hoàn tất đơn hàng %s (phí sàn 5%%: %s)",
                        order.getOrderCode(), formatVnd(platformFee.longValue())))
                .createdAt(LocalDateTime.now())
                .build());

        // ── Bước 4: Credit 95% vào balance nhà thầu ───────────────
        contractorWallet.setBalance(contractorWallet.getBalance() + contractorRevenue.longValue());
        walletRepository.save(contractorWallet);

        // Ghi transaction revenue phía nhà thầu
        transactionRepository.save(Transaction.builder()
                .wallet(contractorWallet)
                .amount(contractorRevenue.longValue())
                .type(Transaction.Type.REVENUE)
                .status(Transaction.Status.SUCCESS)
                .paymentGateway("CONSTRUCTX_ESCROW")
                .gatewayOrderId("REV-" + order.getOrderCode())
                .description(String.format("Nhận doanh thu đơn hàng %s (sau khi trừ phí sàn 5%%: %s)",
                        order.getOrderCode(), formatVnd(platformFee.longValue())))
                .createdAt(LocalDateTime.now())
                .build());

        // ── Bước 5: Cập nhật trạng thái đơn ──────────────────────
        order.setStatus(Order.Status.DELIVERED);
        order.setFullyPaid(true);
        order.setDeliveredAt(LocalDateTime.now());
        orderRepository.save(order);

        log.info("[Mini-Escrow] Full release completed for order {}. Revenue={}, PlatformFee={}",
                order.getOrderCode(), contractorRevenue, platformFee);

        // ── Thông báo ──────────────────────────────────────────────
        notificationService.createNotification(customer, Notification.NotifType.PAYMENT_SUCCESS,
                String.format("✅ Đơn hàng %s hoàn thành! Đã thanh toán %s cho nhà thầu.",
                        order.getOrderCode(), formatVnd(totalAmount.longValue())));

        notificationService.createNotification(contractor, Notification.NotifType.PAYMENT_SUCCESS,
                String.format("💰 Bạn đã nhận %s doanh thu từ đơn hàng %s (sau phí sàn 5%%).",
                        formatVnd(contractorRevenue.longValue()), order.getOrderCode()));
    }

    // ─────────────────────────────────────────────────────────────
    // Helper
    // ─────────────────────────────────────────────────────────────

    private String formatVnd(Long amount) {
        if (amount == null) return "0đ";
        if (amount >= 1_000_000_000) return String.format("%.1f tỷđ", amount / 1_000_000_000.0);
        if (amount >= 1_000_000) return String.format("%.0f triệuđ", amount / 1_000_000.0);
        return String.format("%,dđ", amount);
    }
}
