package com.constructx.backend.features.order.service;

import com.constructx.backend.features.constructor.entity.Contract;
import com.constructx.backend.features.constructor.entity.ContractStage;
import com.constructx.backend.features.constructor.repository.ContractRepository;
import com.constructx.backend.features.notification.entity.Notification;
import com.constructx.backend.features.notification.service.NotificationService;
import com.constructx.backend.features.order.dto.OrderBidRequest;
import com.constructx.backend.features.order.dto.OrderBidResponse;
import com.constructx.backend.features.order.dto.OrderResponse;
import com.constructx.backend.features.order.entity.Order;
import com.constructx.backend.features.order.entity.OrderBid;
import com.constructx.backend.features.order.entity.OrderBidItem;
import com.constructx.backend.features.order.repository.OrderBidRepository;
import com.constructx.backend.features.order.repository.OrderRepository;
import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.user.repository.UserRepository;
import com.constructx.backend.features.wallet.repository.WalletRepository;
import com.constructx.backend.features.wallet.entity.Wallet;
import com.constructx.backend.admin.service.FeatureFlagService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderBidService {

    private final OrderBidRepository orderBidRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final OrderService orderService;
    private final ContractRepository contractRepository;
    private final WalletRepository walletRepository;
    private final FeatureFlagService featureFlagService;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ── CONTRACTOR: Xem danh sách đơn đang mở đấu giá ──────────────

    @Transactional(readOnly = true)
    public List<OrderResponse> getOpenBiddingOrders() {
        return orderRepository.findByStatusWithItems(Order.Status.OPEN_BIDDING)
                .stream()
                .map(o -> OrderResponse.builder()
                        .id(o.getId())
                        .orderCode(o.getOrderCode())
                        .type(o.getType().name())
                        .status(o.getStatus().name())
                        .statusLabel("Đang mở đấu giá")
                        .customRequirements(o.getCustomRequirements())
                        .referenceImageUrl(o.getReferenceImageUrl())
                        .deliveryAddress(maskAddress(o.getDeliveryAddress()))
                        .createdAt(o.getCreatedAt())
                        .confirmedAt(o.getConfirmedAt())
                        .items(o.getItems().stream()
                                .map(i -> OrderResponse.OrderItemResponse.builder()
                                        .id(i.getId())
                                        .itemName(i.getItemName())
                                        .imageUrl(i.getImageUrl())
                                        .quantity(i.getQuantity())
                                        .customNote(i.getCustomNote())
                                        // Ẩn giá gốc khỏi contractor
                                        .unitPrice(BigDecimal.ZERO)
                                        .subtotal(BigDecimal.ZERO)
                                        .build())
                                .collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());
    }

    // ── CONTRACTOR: Xem đơn hàng đã được giao (đã thắng đấu giá / chỉ định) ──

    @Transactional(readOnly = true)
    public List<OrderResponse> getMyAssignedOrders() {
        User contractor = getCurrentUser();
        return orderRepository.findByAssignedContractorId(contractor.getId())
                .stream()
                .map(orderService::toResponse)
                .collect(Collectors.toList());
    }

    /** Che địa chỉ: chỉ hiện Quận/Huyện và TP */
    private String maskAddress(String address) {
        if (address == null) return "Thông tin ẩn";
        String[] parts = address.split(",");
        if (parts.length >= 2) {
            return parts[parts.length - 2].trim() + ", " + parts[parts.length - 1].trim();
        }
        return "Thông tin ẩn";
    }

    // ── CONTRACTOR: Gửi báo giá ──────────────────────────────────────

    @Transactional
    public OrderBidResponse submitBid(Long orderId, OrderBidRequest req) {
        User contractor = getCurrentUser();
        if (contractor.getRole() != User.Role.CONTRACTOR) {
            throw new RuntimeException("Chỉ nhà thầu mới có thể gửi báo giá");
        }
        if (contractor.getApprovalStatus() != User.ApprovalStatus.APPROVED) {
            throw new RuntimeException("Tài khoản của bạn chưa được phê duyệt");
        }

        // Check minimum wallet balance required to bid
        long minBalance = featureFlagService.getMinContractorBalanceToBid();
        if (minBalance > 0) {
            Wallet wallet = walletRepository.findByUserId(contractor.getId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy ví của nhà thầu"));
            if (wallet.getAvailableBalance() < minBalance) {
                throw new RuntimeException(String.format("Số dư ví khả dụng không đủ. Số dư tối thiểu yêu cầu là %,dđ để gửi báo giá.", minBalance));
            }
        }

        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (order.getStatus() != Order.Status.OPEN_BIDDING) {
            throw new RuntimeException("Đơn hàng này không còn nhận báo giá");
        }
        if (orderBidRepository.existsByOrderIdAndContractorId(orderId, contractor.getId())) {
            throw new RuntimeException("Bạn đã gửi báo giá cho đơn hàng này rồi");
        }

        // Build bid
        OrderBid bid = OrderBid.builder()
                .order(order)
                .contractor(contractor)
                .quotedPrice(req.getQuotedPrice())
                .estimatedDays(req.getEstimatedDays())
                .proposal(req.getProposal())
                .portfolioImageUrl(req.getPortfolioImageUrl())
                .status(OrderBid.Status.PENDING)
                .build();

        // Build items
        List<OrderBidItem> bidItems = new ArrayList<>();
        if (req.getItems() != null) {
            for (OrderBidRequest.ItemRequest itemReq : req.getItems()) {
                BigDecimal unitPrice = itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : BigDecimal.ZERO;
                BigDecimal total = unitPrice.multiply(
                        BigDecimal.valueOf(itemReq.getQuantity() != null ? itemReq.getQuantity() : 1));
                bidItems.add(OrderBidItem.builder()
                        .orderBid(bid)
                        .itemName(itemReq.getItemName())
                        .unit(itemReq.getUnit())
                        .quantity(itemReq.getQuantity())
                        .unitPrice(unitPrice)
                        .totalPrice(total)
                        .description(itemReq.getDescription())
                        .sampleImageUrl(itemReq.getSampleImageUrl())
                        .build());
            }
        }
        bid.setItems(bidItems);
        OrderBid saved = orderBidRepository.save(bid);

        // Notify customer
        notificationService.createNotification(
                order.getCustomer(),
                Notification.NotifType.BID_RECEIVED,
                String.format("Đơn hàng %s vừa nhận được báo giá mới từ %s — %s",
                        order.getOrderCode(), contractor.getFullName(),
                        req.getQuotedPrice() != null ? formatPrice(req.getQuotedPrice()) : "Chưa xác định")
        );

        return toResponse(saved, true);
    }

    // ── CONTRACTOR: Xem bids của mình ───────────────────────────────

    @Transactional(readOnly = true)
    public List<OrderBidResponse> getMyBids() {
        User contractor = getCurrentUser();
        return orderBidRepository.findByContractorIdWithItems(contractor.getId())
                .stream()
                .map(b -> toResponse(b, true))
                .collect(Collectors.toList());
    }

    // ── OWNER/ADMIN: Xem tất cả bids của 1 đơn (blind bidding) ─────

    @Transactional(readOnly = true)
    public List<OrderBidResponse> getOrderBids(Long orderId) {
        User user = getCurrentUser();
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        boolean isOwner = order.getCustomer().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == User.Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new RuntimeException("Bạn không có quyền xem báo giá của đơn hàng này");
        }

        return orderBidRepository.findByOrderIdWithItems(orderId)
                .stream()
                .map(b -> toResponse(b, true))
                .collect(Collectors.toList());
    }

    // ── OWNER: Chọn nhà thầu (accept bid) → tự động tạo hợp đồng ACTIVE ──────────────

    @Transactional
    public OrderBidResponse acceptBid(Long orderId, Long bidId) {
        User user = getCurrentUser();
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (!order.getCustomer().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền chọn nhà thầu cho đơn này");
        }
        if (order.getStatus() != Order.Status.OPEN_BIDDING) {
            throw new RuntimeException("Đơn hàng không còn ở trạng thái đấu giá");
        }

        OrderBid bid = orderBidRepository.findByIdAndOrderId(bidId, orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy báo giá"));

        // Accept bid được chọn
        bid.setStatus(OrderBid.Status.ACCEPTED);
        orderBidRepository.save(bid);

        // Reject tất cả bids còn lại
        orderBidRepository.rejectOtherBids(orderId, bidId);

        // Cập nhật order sang PROCESSING (bỏ qua BIDDING_CLOSED vì HĐ tạo xong luôn)
        order.setStatus(Order.Status.PROCESSING);
        order.setAssignedContractor(bid.getContractor());
        order.setSelectedBidId(bidId);
        order.setConfirmedAt(LocalDateTime.now());
        if (bid.getQuotedPrice() != null) {
            order.setTotalAmount(bid.getQuotedPrice());
        }
        orderRepository.save(order);

        // ── Tự động tạo Hợp đồng ACTIVE ──────────────────────────────
        Contract contract = createContractFromOrderBid(order, bid, user);

        // Notify nhà thầu được chọn
        notificationService.createNotification(
                bid.getContractor(), Notification.NotifType.SYSTEM,
                String.format("🎉 Báo giá của bạn cho đơn %s đã được chấp nhận! Hợp đồng %s đã có hiệu lực — bắt đầu thi công.",
                        order.getOrderCode(), contract.getContractNumber()));

        notificationService.createNotification(
                user, Notification.NotifType.SYSTEM,
                String.format("✅ Hợp đồng %s đã được tạo và có hiệu lực. Nhà thầu %s bắt đầu thi công.",
                        contract.getContractNumber(), bid.getContractor().getFullName()));

        // Notify các nhà thầu không được chọn
        orderBidRepository.findByOrderIdWithItems(orderId).stream()
                .filter(b -> b.getStatus() == OrderBid.Status.REJECTED)
                .forEach(b -> notificationService.createNotification(
                        b.getContractor(), Notification.NotifType.SYSTEM,
                        String.format("Cảm ơn bạn đã tham gia đấu giá đơn %s. Khách hàng đã chọn nhà thầu khác.",
                                order.getOrderCode())));

        return toResponse(bid, true);
    }

    /** Tạo Contract ACTIVE tự động từ OrderBid được chấp nhận */
    private Contract createContractFromOrderBid(Order order, OrderBid bid, User customer) {
        String itemsSummary = order.getItems().stream()
                .map(i -> String.format("- %s × %d", i.getItemName(), i.getQuantity()))
                .collect(Collectors.joining("\n"));

        long agreedPrice = bid.getQuotedPrice() != null ? bid.getQuotedPrice().longValue() : 0L;
        long contractorDeposit = Math.round(agreedPrice * 0.05);
        String fmtPrice = formatPriceLong(agreedPrice);
        LocalDateTime now = LocalDateTime.now();

        String terms = String.format(
                "HOP DONG CUNG UNG SAN PHAM / THI CONG NOI THAT\n\n" +
                "Loai don: %s\n" +
                "Ma don hang: %s\n\n" +
                "Danh sach san pham:\n%s\n\n" +
                "Gia tri hop dong: %s\n" +
                "Thoi gian thuc hien: %s\n" +
                "Dia chi giao hang: %s\n\n" +
                "Yeu cau cu the:\n%s\n\n" +
                "Dieu kien thanh toan: Theo quy dinh san ConstructX.\n" +
                "Bao hanh: %s\n",
                order.getType() == Order.OrderType.CUSTOM ? "San pham tuy chinh" : "San pham co san",
                order.getOrderCode(), itemsSummary, fmtPrice,
                bid.getEstimatedDays() != null ? bid.getEstimatedDays() + " ngay" : "Theo thoa thuan",
                order.getDeliveryAddress(),
                order.getCustomRequirements() != null ? order.getCustomRequirements() : "Theo mo ta don hang",
                bid.getProposal() != null ? bid.getProposal() : "Theo quy dinh nha thau");

        String contractNum = "CTR-ORD-" + now.format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + "-" + order.getId();

        Contract contract = Contract.builder()
                .project(null)
                .bid(null)
                .sourceOrder(order)
                .client(customer)
                .contractor(bid.getContractor())
                .contractNumber(contractNum)
                .agreedPrice(agreedPrice)
                .originalAgreedPrice(agreedPrice)
                .estimatedDays(bid.getEstimatedDays())
                .terms(terms)
                .status(Contract.Status.ACTIVE)          // ← ACTIVE ngay, không cần Admin duyệt
                .customerDepositAmount(0L)
                .customerDepositLocked(false)
                .contractorDepositAmount(contractorDeposit)
                .contractorDepositLocked(false)
                .clientSigned(true)
                .clientSignedAt(now)
                .contractorSigned(true)
                .contractorSignedAt(now)
                .approvedAt(now)
                .build();

        contract.getStages().add(ContractStage.builder()
                .contract(contract)
                .stage(Contract.Status.ACTIVE)
                .note(String.format("Khach hang chon nha thau %s cho don %s — %s. Hop dong tu dong ACTIVE.",
                        bid.getContractor().getFullName(), order.getOrderCode(), fmtPrice))
                .performedBy(customer.getFullName())
                .build());

        return contractRepository.save(contract);
    }

    // ── ADMIN: Duyệt đơn → mở đấu giá ──────────────────────────────

    @Transactional
    public OrderResponse approveOrderForBidding(Long orderId, String note) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (order.getStatus() != Order.Status.PENDING) {
            throw new RuntimeException("Chỉ có thể duyệt đơn đang chờ xác nhận");
        }

        order.setStatus(Order.Status.OPEN_BIDDING);
        order.setProcessingNote(note);
        order.setConfirmedAt(java.time.LocalDateTime.now());
        orderRepository.save(order);

        // Notify customer
        notificationService.createNotification(
                order.getCustomer(),
                Notification.NotifType.SYSTEM,
                String.format("✅ Đơn hàng %s của bạn đã được Admin phê duyệt và đang mở đấu giá. Các nhà thầu sẽ sớm gửi báo giá!",
                        order.getOrderCode())
        );

        // Notify TẤT CẢ nhà thầu đã được duyệt
        List<User> approvedContractors = userRepository.findByRoleAndApprovalStatus(
                User.Role.CONTRACTOR, User.ApprovalStatus.APPROVED);
        for (User contractor : approvedContractors) {
            notificationService.createNotification(
                    contractor,
                    Notification.NotifType.BID_RECEIVED,
                    String.format("📣 Đơn hàng mới đang mở đấu giá: \"%s\" — %s. Xem và gửi báo giá ngay!",
                            truncate(order.getCustomRequirements(), 60),
                            order.getOrderCode())
            );
        }

        return toOrderResponse(order);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private OrderBidResponse toResponse(OrderBid b, boolean includeItems) {
        OrderBidResponse.OrderBidResponseBuilder builder = OrderBidResponse.builder()
                .id(b.getId())
                .orderId(b.getOrder().getId())
                .orderCode(b.getOrder().getOrderCode())
                .contractorId(b.getContractor().getId())
                .contractorName(b.getContractor().getFullName())
                .contractorPhone(b.getContractor().getPhoneNumber())
                .contractorAddress(b.getContractor().getAddress())
                .quotedPrice(b.getQuotedPrice())
                .estimatedDays(b.getEstimatedDays())
                .proposal(b.getProposal())
                .portfolioImageUrl(b.getPortfolioImageUrl())
                .status(b.getStatus().name())
                .createdAt(b.getCreatedAt())
                .orderType(b.getOrder().getType().name())
                .orderStatus(b.getOrder().getStatus().name())
                .customRequirements(b.getOrder().getCustomRequirements());

        if (includeItems && b.getItems() != null) {
            builder.items(b.getItems().stream()
                    .map(i -> OrderBidResponse.ItemResponse.builder()
                            .id(i.getId())
                            .itemName(i.getItemName())
                            .unit(i.getUnit())
                            .quantity(i.getQuantity())
                            .unitPrice(i.getUnitPrice())
                            .totalPrice(i.getTotalPrice())
                            .description(i.getDescription())
                            .sampleImageUrl(i.getSampleImageUrl())
                            .build())
                    .collect(Collectors.toList()));
        }
        return builder.build();
    }

    private OrderResponse toOrderResponse(Order o) {
        return OrderResponse.builder()
                .id(o.getId())
                .orderCode(o.getOrderCode())
                .type(o.getType().name())
                .status(o.getStatus().name())
                .statusLabel("Đang mở đấu giá")
                .customRequirements(o.getCustomRequirements())
                .deliveryAddress(o.getDeliveryAddress())
                .contactPhone(o.getContactPhone())
                .processingNote(o.getProcessingNote())
                .createdAt(o.getCreatedAt())
                .confirmedAt(o.getConfirmedAt())
                .build();
    }

    private String formatPrice(BigDecimal price) {
        if (price == null) return "0đ";
        long val = price.longValue();
        if (val >= 1_000_000_000) return String.format("%.1f tỷ đ", val / 1_000_000_000.0);
        if (val >= 1_000_000) return String.format("%.0f triệu đ", val / 1_000_000.0);
        return String.format("%,dđ", val);
    }

    private String formatPriceLong(long val) {
        if (val >= 1_000_000_000) return String.format("%.1f ty d", val / 1_000_000_000.0);
        if (val >= 1_000_000) return String.format("%.0f trieu d", val / 1_000_000.0);
        return NumberFormat.getNumberInstance(new Locale("vi", "VN")).format(val) + " VND";
    }

    private String truncate(String s, int maxLen) {
        if (s == null) return "Yêu cầu tùy chỉnh";
        return s.length() > maxLen ? s.substring(0, maxLen) + "..." : s;
    }
}
