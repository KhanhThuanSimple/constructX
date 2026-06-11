package com.constructx.backend.features.order.service;

import com.constructx.backend.features.notification.entity.Notification;
import com.constructx.backend.features.notification.service.NotificationService;
import com.constructx.backend.features.order.dto.OrderRequest;
import com.constructx.backend.features.order.dto.OrderResponse;
import com.constructx.backend.features.order.entity.Order;
import com.constructx.backend.features.order.entity.OrderItem;
import com.constructx.backend.features.order.repository.OrderRepository;
import com.constructx.backend.features.product.entity.Product;
import com.constructx.backend.features.product.repository.ProductRepository;
import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final OrderPaymentService orderPaymentService;

    private static final Map<Order.Status, String> STATUS_LABELS = Map.of(
        Order.Status.PENDING,        "Chờ Admin xét duyệt",
        Order.Status.CONFIRMED,      "Đã xác nhận – Đang xử lý",
        Order.Status.DEPOSIT_PAID,   "Đã cọc – Đang sản xuất",
        Order.Status.OPEN_BIDDING,   "Đang mở đấu giá",
        Order.Status.BIDDING_CLOSED, "Đã chọn nhà thầu",
        Order.Status.PROCESSING,     "Đang sản xuất / thi công",
        Order.Status.SHIPPED,        "Đang giao hàng",
        Order.Status.DELIVERED,      "Đã giao hàng / Hoàn thành",
        Order.Status.CANCELLED,      "Đã hủy"
    );

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ── Customer: tạo đơn hàng ──────────────────────────────────────

    @Transactional
    public OrderResponse createOrder(OrderRequest req) {
        User customer = getCurrentUser();

        if (req.getItems() == null || req.getItems().isEmpty())
            throw new RuntimeException("Đơn hàng phải có ít nhất 1 sản phẩm");
        if (req.getDeliveryAddress() == null || req.getDeliveryAddress().isBlank())
            throw new RuntimeException("Vui lòng cung cấp địa chỉ giao hàng");
        if (req.getContactPhone() == null || req.getContactPhone().isBlank())
            throw new RuntimeException("Vui lòng cung cấp số điện thoại liên hệ");

        Order.OrderType orderType = "CUSTOM".equalsIgnoreCase(req.getType())
                ? Order.OrderType.CUSTOM : Order.OrderType.CATALOG;

        Order order = Order.builder()
                .customer(customer).type(orderType)
                .deliveryAddress(req.getDeliveryAddress())
                .contactPhone(req.getContactPhone())
                .customerNote(req.getCustomerNote())
                .customRequirements(req.getCustomRequirements())
                .referenceImageUrl(req.getReferenceImageUrl())
                .status(Order.Status.PENDING)
                .build();

        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderRequest.OrderItemRequest itemReq : req.getItems()) {
            OrderItem item;
            if (itemReq.getProductId() != null) {
                Product product = productRepository.findById(itemReq.getProductId())
                        .orElseThrow(() -> new RuntimeException("Sản phẩm #" + itemReq.getProductId() + " không tồn tại"));
                if (!product.getActive())
                    throw new RuntimeException("Sản phẩm \"" + product.getName() + "\" hiện không khả dụng");
                if (product.getStock() < itemReq.getQuantity())
                    throw new RuntimeException("Sản phẩm \"" + product.getName() + "\" chỉ còn " + product.getStock() + " cái");

                BigDecimal unitPrice = product.getPrice();
                BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
                item = OrderItem.builder()
                        .order(order).product(product)
                        .itemName(product.getName()).imageUrl(product.getImageUrl())
                        .quantity(itemReq.getQuantity()).unitPrice(unitPrice).subtotal(subtotal)
                        .customNote(itemReq.getCustomNote()).build();
                product.setStock(product.getStock() - itemReq.getQuantity());
                productRepository.save(product);
            } else {
                if (itemReq.getCustomItemName() == null || itemReq.getCustomItemName().isBlank())
                    throw new RuntimeException("Tên sản phẩm tùy chỉnh không được để trống");
                BigDecimal unitPrice = itemReq.getUnitPrice() != null
                        ? BigDecimal.valueOf(itemReq.getUnitPrice()) : BigDecimal.ZERO;
                BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
                item = OrderItem.builder()
                        .order(order).product(null)
                        .itemName(itemReq.getCustomItemName()).imageUrl(itemReq.getCustomImageUrl())
                        .quantity(itemReq.getQuantity()).unitPrice(unitPrice).subtotal(subtotal)
                        .customNote(itemReq.getCustomNote()).build();
            }
            items.add(item);
            total = total.add(item.getSubtotal());
        }

        order.setItems(items);
        order.setTotalAmount(total);
        Order saved = orderRepository.save(order);
        saved.setOrderCode("ORD-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + saved.getId());
        orderRepository.save(saved);

        // ── Mini-Escrow: Lock 60% tiền cọc ngay khi đặt hàng CATALOG ──
        if (orderType == Order.OrderType.CATALOG && total.compareTo(java.math.BigDecimal.ZERO) > 0) {
            orderPaymentService.lockDepositForOrder(saved, customer);
        }

        // Notify admin
        String adminMsg = orderType == Order.OrderType.CUSTOM
            ? String.format("📦 Đơn tùy chỉnh mới từ %s — %s. Cần phê duyệt để mở đấu giá.", customer.getFullName(), saved.getOrderCode())
            : String.format("🛒 Đơn catalog mới từ %s — %s. Cần xác nhận.", customer.getFullName(), saved.getOrderCode());
        notificationService.createNotificationForAdmins(Notification.NotifType.SYSTEM, adminMsg);

        // Notify customer
        notificationService.createNotification(customer, Notification.NotifType.SYSTEM,
            String.format("✅ Đơn hàng %s đã được tạo. Đang chờ Admin phê duyệt.", saved.getOrderCode()));

        return toResponse(saved);
    }

    // ── Customer: xem đơn ──────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders() {
        User user = getCurrentUser();
        return orderRepository.findByCustomerIdWithItems(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getMyOrderById(Long id) {
        User user = getCurrentUser();
        Order order = orderRepository.findByIdWithItems(id)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));
        if (!order.getCustomer().getId().equals(user.getId()))
            throw new RuntimeException("Bạn không có quyền xem đơn hàng này");
        return toResponse(order);
    }

    // ── Customer: hủy đơn ──────────────────────────────────────────

    @Transactional
    public OrderResponse cancelOrder(Long id) {
        User user = getCurrentUser();
        Order order = orderRepository.findByIdWithItems(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (!order.getCustomer().getId().equals(user.getId()))
            throw new RuntimeException("Bạn không có quyền hủy đơn này");
        if (order.getStatus() != Order.Status.PENDING
                && order.getStatus() != Order.Status.CONFIRMED
                && order.getStatus() != Order.Status.DEPOSIT_PAID) {
            throw new RuntimeException("Chỉ có thể hủy đơn đang ở trạng thái Chờ xét duyệt, Đã xác nhận hoặc Đã cọc");
        }

        // ── Mini-Escrow: Hoàn tiền cọc nếu đã lock ──────────────
        orderPaymentService.refundDepositOnCancel(order);

        for (OrderItem item : order.getItems()) {
            if (item.getProduct() != null) {
                item.getProduct().setStock(item.getProduct().getStock() + item.getQuantity());
                productRepository.save(item.getProduct());
            }
        }
        order.setStatus(Order.Status.CANCELLED);
        orderRepository.save(order);
        return toResponse(order);
    }

    // ── Admin: lấy tất cả đơn ──────────────────────────────────────

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders(String status) {
        List<Order> orders;
        if (status != null && !status.equals("all")) {
            try {
                orders = orderRepository.findByStatusWithItems(Order.Status.valueOf(status.toUpperCase()));
            } catch (IllegalArgumentException e) {
                orders = orderRepository.findAllWithItems();
            }
        } else {
            orders = orderRepository.findAllWithItems();
        }
        return orders.stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── Admin: cập nhật trạng thái đơn (CATALOG flow) ──────────────

    @Transactional
    public OrderResponse updateOrderStatus(Long id, String status, String note) {
        Order order = orderRepository.findByIdWithItems(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        Order.Status newStatus;
        try {
            newStatus = Order.Status.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Trạng thái không hợp lệ: " + status);
        }

        order.setStatus(newStatus);
        if (note != null && !note.isBlank()) order.setProcessingNote(note);
        if (newStatus == Order.Status.CONFIRMED) order.setConfirmedAt(LocalDateTime.now());
        if (newStatus == Order.Status.PROCESSING) order.setConfirmedAt(LocalDateTime.now());
        if (newStatus == Order.Status.DELIVERED) order.setDeliveredAt(LocalDateTime.now());

        if (newStatus == Order.Status.CANCELLED) {
            // ── Mini-Escrow: Hoàn tiền cọc khi admin hủy ────────
            orderPaymentService.refundDepositOnCancel(order);
            for (OrderItem item : order.getItems()) {
                if (item.getProduct() != null) {
                    item.getProduct().setStock(item.getProduct().getStock() + item.getQuantity());
                    productRepository.save(item.getProduct());
                }
            }
        }
        orderRepository.save(order);

        // Notification cho customer
        String msg = switch (newStatus) {
            case CONFIRMED -> String.format("✅ Đơn %s đã được Admin xác nhận.%s",
                    order.getOrderCode(), note != null && !note.isBlank() ? " Ghi chú: " + note : "");
            case PROCESSING -> String.format("🔨 Đơn %s đang được sản xuất/thi công.%s",
                    order.getOrderCode(), note != null && !note.isBlank() ? " Ghi chú: " + note : "");
            case SHIPPED -> String.format("🚚 Đơn %s đang được giao đến bạn!%s",
                    order.getOrderCode(), note != null && !note.isBlank() ? " " + note : "");
            case DELIVERED -> String.format("✅ Đơn %s đã giao thành công. Cảm ơn bạn!",
                    order.getOrderCode());
            case CANCELLED -> String.format("❌ Đơn %s đã bị hủy.%s",
                    order.getOrderCode(), note != null && !note.isBlank() ? " Lý do: " + note : "");
            default -> null;
        };
        if (msg != null)
            notificationService.createNotification(order.getCustomer(), Notification.NotifType.SYSTEM, msg);

        return toResponse(order);
    }

    // ── Admin: gán nhà thầu cho đơn CATALOG ───────────────────────

    @Transactional
    public OrderResponse assignContractor(Long orderId, Long contractorId) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        User contractor = userRepository.findById(contractorId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà thầu"));

        if (contractor.getRole() != User.Role.CONTRACTOR) {
            throw new RuntimeException("Người dùng này không phải nhà thầu");
        }

        order.setAssignedContractor(contractor);
        orderRepository.save(order);

        notificationService.createNotification(contractor, Notification.NotifType.SYSTEM,
                String.format("📦 Bạn đã được gán nhà thầu cho đơn hàng %s.", order.getOrderCode()));

        return toResponse(order);
    }

    // ── Mapping ────────────────────────────────────────────────────

    OrderResponse toResponse(Order o) {
        List<OrderResponse.OrderItemResponse> itemResponses = o.getItems().stream()
                .map(i -> OrderResponse.OrderItemResponse.builder()
                        .id(i.getId())
                        .productId(i.getProduct() != null ? i.getProduct().getId() : null)
                        .itemName(i.getItemName())
                        .imageUrl(i.getImageUrl())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .subtotal(i.getSubtotal())
                        .customNote(i.getCustomNote())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(o.getId())
                .orderCode(o.getOrderCode())
                .type(o.getType().name())
                .status(o.getStatus().name())
                .statusLabel(STATUS_LABELS.getOrDefault(o.getStatus(), o.getStatus().name()))
                .totalAmount(o.getTotalAmount())
                .deliveryAddress(o.getDeliveryAddress())
                .contactPhone(o.getContactPhone())
                .customerNote(o.getCustomerNote())
                .customRequirements(o.getCustomRequirements())
                .referenceImageUrl(o.getReferenceImageUrl())
                .processingNote(o.getProcessingNote())
                .customerId(o.getCustomer().getId())
                .customerName(o.getCustomer().getFullName())
                .customerPhone(o.getCustomer().getPhoneNumber())
                // Mini-Escrow fields
                .depositPercent(o.getDepositPercent())
                .depositAmount(o.getDepositAmount())
                .depositLocked(o.getDepositLocked())
                .completionImageUrl(o.getCompletionImageUrl())
                .contractorMarkedDone(o.getContractorMarkedDone())
                .contractorDoneAt(o.getContractorDoneAt())
                .termsAccepted(o.getTermsAccepted())
                .fullyPaid(o.getFullyPaid())
                .assignedContractorId(o.getAssignedContractor() != null ? o.getAssignedContractor().getId() : null)
                .assignedContractorName(o.getAssignedContractor() != null ? o.getAssignedContractor().getFullName() : null)
                .createdAt(o.getCreatedAt())
                .confirmedAt(o.getConfirmedAt())
                .deliveredAt(o.getDeliveredAt())
                .items(itemResponses)
                .build();
    }
}
