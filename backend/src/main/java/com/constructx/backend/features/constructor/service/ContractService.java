
package com.constructx.backend.features.constructor.service;

import com.constructx.backend.features.constructor.dto.BidResponse;
import com.constructx.backend.features.constructor.dto.BidDetailResponse;
import com.constructx.backend.features.constructor.dto.ContractResponse;
import com.constructx.backend.features.constructor.entity.*;
import com.constructx.backend.features.constructor.repository.BidRepository;
import com.constructx.backend.features.constructor.repository.ContractRepository;
import com.constructx.backend.features.notification.entity.Notification;
import com.constructx.backend.features.notification.service.NotificationService;
import com.constructx.backend.features.project.entity.Project;
import com.constructx.backend.features.project.repository.ProjectRepository;
import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.user.repository.UserRepository;
import com.constructx.backend.features.wallet.entity.Transaction;
import com.constructx.backend.features.wallet.entity.Wallet;
import com.constructx.backend.features.wallet.repository.WalletRepository;
import com.constructx.backend.features.wallet.service.WalletCoreManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContractService {

    private static final double CUSTOMER_DEPOSIT_RATE   = 1.00;  // 100% escrow toàn bộ giá trị HĐ
    private static final double CONTRACTOR_DEPOSIT_RATE = 0.05;  // 5% ký quỹ nhà thầu
    private static final double CANCEL_CONTRACTOR_SHARE = 0.70;  // 70% escrow → nhà thầu khi client hủy
    private static final double WARRANTY_HOLD_RATE      = 0.05;  // 5% giữ lại bảo hành 6 tháng
    private static final double MAX_PRICE_CHANGE_RATIO  = 0.10;
    private static final int    REPUTATION_PENALTY      = 20;
    private static final int    WARRANTY_MONTHS         = 6;

    private final ContractRepository contractRepository;
    private final BidRepository bidRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final WalletCoreManager walletCoreManager;
    private final NotificationService notificationService;
    private final BidService bidService;

    private User getCurrentUser() {
        return userRepository.findByEmail(
                SecurityContextHolder.getContext().getAuthentication().getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Contract getContract(Long contractId) {
        return contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Hop dong khong ton tai: " + contractId));
    }

    private static String fmtVnd(long amount) {
        return NumberFormat.getNumberInstance(new Locale("vi", "VN")).format(amount) + " VND";
    }

    private ContractStage stage(Contract c, Contract.Status s, String note, String performedBy) {
        return ContractStage.builder()
                .contract(c)
                .stage(s)
                .note(note)
                .performedBy(performedBy)
                .build();
    }

    private String buildDefaultTerms(Project project, Bid bid) {
        return String.format(
                "HOP DONG THI CONG\n" +
                "Du an: %s\n" +
                "Gia tri: %s\n" +
                "Thoi gian thi cong: %d ngay\n" +
                "Pham vi cong viec: %s\n" +
                "Dieu kien thanh toan: %s\n",
                project.getName(),
                fmtVnd(bid.getTotalPrice()),
                bid.getEstimatedDays(),
                project.getDescription() != null ? project.getDescription() : "Theo thoa thuan",
                bid.getPaymentTerms() != null ? bid.getPaymentTerms() : "Theo thoa thuan"
        );
    }

    private void unlockCustomerDeposit(Contract c, String reason) {
        walletRepository.findByUserId(c.getClient().getId()).ifPresent(wallet -> {
            long amt = c.getCustomerDepositAmount() != null ? c.getCustomerDepositAmount() : 0L;
            if (amt > 0) {
                wallet.setLockedAmount(Math.max(0, wallet.getLockedAmount() - amt));
                walletRepository.save(wallet);
                log.info("Unlocked customer deposit {} for contract {}: {}", amt, c.getContractNumber(), reason);
            }
        });
        c.setCustomerDepositLocked(false);
    }

    private void unlockContractorDeposit(Contract c, String reason) {
        walletRepository.findByUserId(c.getContractor().getId()).ifPresent(wallet -> {
            long amt = c.getContractorDepositAmount() != null ? c.getContractorDepositAmount() : 0L;
            if (amt > 0) {
                wallet.setLockedAmount(Math.max(0, wallet.getLockedAmount() - amt));
                walletRepository.save(wallet);
                log.info("Unlocked contractor deposit {} for contract {}: {}", amt, c.getContractNumber(), reason);
            }
        });
        c.setContractorDepositLocked(false);
    }

    @Transactional(readOnly = true)
    public List<BidResponse> getProjectBids(Long projectId) {
        User user = getCurrentUser();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        boolean isOwner = project.getUser().getEmail().equals(user.getEmail());
        boolean isAdmin = user.getRole() == User.Role.ADMIN;
        if (!isOwner && !isAdmin) throw new RuntimeException("Ban khong co quyen xem bao gia");
        return bidRepository.findProjectBids(projectId).stream()
                .map(this::mapBidResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ContractResponse> getMyContracts() {
        User user = getCurrentUser();
        List<Contract> contracts;
        if (user.getRole() == User.Role.CUSTOMER) {
            contracts = contractRepository.findByClientIdOrderByCreatedAtDesc(user.getId());
        } else if (user.getRole() == User.Role.CONTRACTOR) {
            contracts = contractRepository.findByContractorIdOrderByCreatedAtDesc(user.getId());
        } else {
            contracts = contractRepository.findAllByOrderByCreatedAtDesc();
        }
        return contracts.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ContractResponse getContractById(Long contractId) {
        User user = getCurrentUser();
        Contract c = getContract(contractId);
        boolean isAdmin = user.getRole() == User.Role.ADMIN;
        boolean isClient = c.getClient().getId().equals(user.getId());
        boolean isContractor = c.getContractor().getId().equals(user.getId());
        if (!isAdmin && !isClient && !isContractor) {
            throw new RuntimeException("Ban khong co quyen xem hop dong nay");
        }
        return toResponse(c);
    }

    @Transactional(readOnly = true)
    public List<ContractResponse> getAllContracts(String statusFilter) {
        List<Contract> contracts;
        if (statusFilter == null || "all".equalsIgnoreCase(statusFilter)) {
            contracts = contractRepository.findAllByOrderByCreatedAtDesc();
        } else {
            try {
                Contract.Status s = Contract.Status.valueOf(statusFilter.toUpperCase());
                contracts = contractRepository.findByStatusOrderByCreatedAtDesc(s);
            } catch (IllegalArgumentException e) {
                contracts = contractRepository.findAllByOrderByCreatedAtDesc();
            }
        }
        return contracts.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public ContractResponse acceptBid(Long projectId, Long bidId) {
        User customer = getCurrentUser();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getUser().getEmail().equals(customer.getEmail()))
            throw new RuntimeException("Ban khong co quyen");
        if (project.getStatus() != Project.Status.OPEN)
            throw new RuntimeException("Du an khong con nhan thau");
        if (contractRepository.findByProjectId(projectId).isPresent())
            throw new RuntimeException("Du an da co hop dong");

        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found"));
        if (!bid.getProject().getId().equals(projectId))
            throw new RuntimeException("Bid khong thuoc du an nay");
        if (bid.getStatus() != Bid.Status.PENDING)
            throw new RuntimeException("Bid nay khong con kha dung");

        long depositAmt = Math.round(bid.getTotalPrice() * CUSTOMER_DEPOSIT_RATE); // 100% escrow
        Wallet customerWallet = walletRepository.findByUserIdForUpdate(customer.getId())
                .orElseThrow(() -> new RuntimeException("Vi khach hang khong ton tai"));
        if (customerWallet.getAvailableBalance() < depositAmt)
            throw new RuntimeException(String.format(
                    "So du vi khong du escrow 100%% gia tri HD (%s). Hien co %s.",
                    fmtVnd(depositAmt), fmtVnd(customerWallet.getAvailableBalance())));

        walletCoreManager.executeLockForOrder(customerWallet, depositAmt, Transaction.Type.LOCK,
                "CONSTRUCTX_ESCROW", "CTR-ESCROW-" + projectId + "-" + bidId);

        bid.setStatus(Bid.Status.ACCEPTED);
        bidRepository.rejectOtherBids(projectId, bidId);

        project.setStatus(Project.Status.IN_PROGRESS);
        projectRepository.save(project);

        long kyQuyAmt = Math.round(bid.getTotalPrice() * CONTRACTOR_DEPOSIT_RATE);
        String contractNum = "CTR-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) + "-" + bidId;

        Contract contract = Contract.builder()
                .project(project)
                .bid(bid)
                .client(customer)
                .contractor(bid.getContractor())
                .contractNumber(contractNum)
                .agreedPrice(bid.getTotalPrice())
                .originalAgreedPrice(bid.getTotalPrice())
                .estimatedDays(bid.getEstimatedDays())
                .terms(buildDefaultTerms(project, bid))
                .status(Contract.Status.PENDING_REVIEW)
                .customerDepositAmount(depositAmt)
                .customerDepositLocked(true)
                .contractorDepositAmount(kyQuyAmt)
                .contractorDepositLocked(false)
                .build();

        contract.getStages().add(stage(contract, Contract.Status.PENDING_REVIEW,
                "Customer chap nhan bao gia. Da lock ESCROW 100%% (" + fmtVnd(depositAmt) + ") vao he thong. Cho Admin duyet.",
                customer.getFullName()));

        Contract saved = contractRepository.save(contract);

        notificationService.createNotification(customer, Notification.NotifType.SYSTEM,
                "Da lock ESCROW " + fmtVnd(depositAmt) + " (100%% gia tri HD). HD " + contractNum + " cho Admin duyet.");
        notificationService.createNotification(bid.getContractor(), Notification.NotifType.SYSTEM,
                "Bao gia duoc chon (du an: " + project.getName() + ", " + fmtVnd(bid.getTotalPrice()) + ")! Cho Admin duyet HD.");
        notificationService.createNotificationForAdmins(Notification.NotifType.SYSTEM,
                "HD moi can duyet: " + contractNum + " - " + fmtVnd(bid.getTotalPrice()) + ". Customer da lock ESCROW 100%%.");

        return toResponse(saved);
    }

    @Transactional
    public ContractResponse approveContract(Long contractId, String adminNote) {
        User admin = getCurrentUser();
        Contract c = getContract(contractId);
        if (c.getStatus() != Contract.Status.PENDING_REVIEW)
            throw new RuntimeException("Chi duyet duoc hop dong dang o trang thai PENDING_REVIEW");

        c.setStatus(Contract.Status.WAITING_SIGNATURE);
        c.setAdmin(admin);
        c.setAdminNote(adminNote);
        c.setApprovedAt(LocalDateTime.now());
        c.getStages().add(stage(c, Contract.Status.WAITING_SIGNATURE,
                adminNote != null ? adminNote : "Admin phe duyet. Cho hai ben ky.",
                admin.getFullName()));
        contractRepository.save(c);

        notificationService.createNotification(c.getClient(), Notification.NotifType.SYSTEM,
                "HD " + c.getContractNumber() + " duoc duyet! Vao trang Hop dong de ky xac nhan.");
        notificationService.createNotification(c.getContractor(), Notification.NotifType.SYSTEM,
                "HD " + c.getContractNumber() + " duoc duyet! Khi ky HD can ky quy " +
                fmtVnd(c.getContractorDepositAmount() != null ? c.getContractorDepositAmount() : 0L) + " (5%%).");
        return toResponse(c);
    }

    @Transactional
    public ContractResponse rejectContract(Long contractId, String adminNote) {
        User admin = getCurrentUser();
        Contract c = getContract(contractId);
        if (c.getStatus() != Contract.Status.PENDING_REVIEW)
            throw new RuntimeException("Chi tu choi duoc hop dong dang o trang thai PENDING_REVIEW");

        c.setStatus(Contract.Status.CANCELLED);
        c.setAdmin(admin);
        c.setAdminNote(adminNote);
        c.setCancelledAt(LocalDateTime.now());
        c.getStages().add(stage(c, Contract.Status.CANCELLED,
                adminNote != null ? adminNote : "Admin tu choi.",
                admin.getFullName()));

        if (Boolean.TRUE.equals(c.getCustomerDepositLocked()) && c.getCustomerDepositAmount() != null)
            unlockCustomerDeposit(c, "Admin tu choi HD");

        // Chỉ cập nhật project nếu hợp đồng đến từ Luồng A (có project), không crash với Luồng C (order)
        if (c.getProject() != null) {
            c.getProject().setStatus(Project.Status.OPEN);
            projectRepository.save(c.getProject());
        }

        contractRepository.save(c);

        long refundAmt = c.getCustomerDepositAmount() != null ? c.getCustomerDepositAmount() : 0L;
        notificationService.createNotification(c.getClient(), Notification.NotifType.SYSTEM,
                "HD " + c.getContractNumber() + " bi tu choi. Da hoan " + fmtVnd(refundAmt) + " coc ve vi.");
        notificationService.createNotification(c.getContractor(), Notification.NotifType.SYSTEM,
                "HD " + c.getContractNumber() + " bi Admin tu choi.");
        return toResponse(c);
    }

    @Transactional
    public ContractResponse updateTerms(Long contractId, String terms, String adminNote) {
        User admin = getCurrentUser();
        Contract c = getContract(contractId);
        c.setTerms(terms);
        if (adminNote != null) c.setAdminNote(adminNote);
        c.getStages().add(stage(c, c.getStatus(),
                "Admin cap nhat dieu khoan hop dong.",
                admin.getFullName()));
        contractRepository.save(c);
        return toResponse(c);
    }

    @Transactional
    public ContractResponse updatePrice(Long contractId, Long newPrice, String adminNote) {
        User admin = getCurrentUser();
        Contract c = getContract(contractId);
        Long original = c.getOriginalAgreedPrice() != null ? c.getOriginalAgreedPrice() : c.getAgreedPrice();
        double deviation = Math.abs((double)(newPrice - original) / original);
        if (deviation > MAX_PRICE_CHANGE_RATIO)
            throw new RuntimeException(String.format(
                    "Gia moi %s lech %.1f%% so voi gia goc %s (toi da +-10%%).",
                    fmtVnd(newPrice), deviation * 100, fmtVnd(original)));
        Long oldPrice = c.getAgreedPrice();
        c.setAgreedPrice(newPrice);
        if (adminNote != null) c.setAdminNote(adminNote);
        c.getStages().add(stage(c, c.getStatus(),
                "Admin dieu chinh gia: " + fmtVnd(oldPrice) + " -> " + fmtVnd(newPrice),
                admin.getFullName()));
        contractRepository.save(c);
        notificationService.createNotification(c.getClient(), Notification.NotifType.SYSTEM,
                "HD " + c.getContractNumber() + " dieu chinh gia: " + fmtVnd(oldPrice) + " -> " + fmtVnd(newPrice));
        notificationService.createNotification(c.getContractor(), Notification.NotifType.SYSTEM,
                "HD " + c.getContractNumber() + " dieu chinh gia: " + fmtVnd(oldPrice) + " -> " + fmtVnd(newPrice));
        return toResponse(c);
    }

    @Transactional
    public ContractResponse completeContract(Long contractId, String adminNote) {
        User admin = getCurrentUser();
        Contract c = getContract(contractId);
        if (c.getStatus() != Contract.Status.ACTIVE)
            throw new RuntimeException("Chi hoan thanh duoc hop dong dang ACTIVE");

        long agreedPrice       = c.getAgreedPrice() != null ? c.getAgreedPrice() : 0L;
        long customerEscrow    = c.getCustomerDepositAmount() != null ? c.getCustomerDepositAmount() : 0L;
        long contractorDeposit = c.getContractorDepositAmount() != null ? c.getContractorDepositAmount() : 0L;

        // 5% warranty hold — giữ lại trong ví nhà thầu (lockedAmount) 6 tháng
        long warrantyAmt  = Math.round(agreedPrice * WARRANTY_HOLD_RATE);
        // 95% thanh toán ngay
        long immediateAmt = agreedPrice - warrantyAmt;

        // Unlock escrow 100% từ ví Customer (giải phóng lockedAmount)
        if (Boolean.TRUE.equals(c.getCustomerDepositLocked()) && customerEscrow > 0) {
            walletRepository.findByUserId(c.getClient().getId()).ifPresent(cw -> {
                cw.setLockedAmount(Math.max(0, cw.getLockedAmount() - customerEscrow));
                // Trừ toàn bộ balance khách (tiền đã vào escrow)
                cw.setBalance(Math.max(0, cw.getBalance() - customerEscrow));
                walletRepository.save(cw);
            });
            c.setCustomerDepositLocked(false);
            log.info("[Escrow] Released customer escrow {} for contract {}", customerEscrow, c.getContractNumber());
        }

        // Trả ký quỹ cho nhà thầu
        if (Boolean.TRUE.equals(c.getContractorDepositLocked()) && contractorDeposit > 0) {
            unlockContractorDeposit(c, "Hop dong hoan thanh");
        }

        // Giải ngân 95% ngay cho nhà thầu
        Wallet contractorWallet = walletRepository.findByUserId(c.getContractor().getId())
                .orElseThrow(() -> new RuntimeException("Vi nha thau khong ton tai"));

        walletCoreManager.executeDeposit(contractorWallet, immediateAmt, Transaction.Type.REVENUE,
                "CONSTRUCTX_ESCROW", "CTR-COMPLETE-95-" + c.getContractNumber(),
                "Giai ngan 95%% hoan cong HD " + c.getContractNumber());

        // Giữ 5% warranty: cộng vào balance nhà thầu nhưng lock lại
        walletCoreManager.executeLockForOrder(contractorWallet, warrantyAmt, Transaction.Type.LOCK,
                "CONSTRUCTX_WARRANTY", "CTR-WARRANTY-" + c.getContractNumber());

        // Cập nhật contract
        c.setWarrantyHoldAmount(warrantyAmt);
        c.setWarrantyHoldLocked(true);
        c.setWarrantyEndDate(LocalDateTime.now().plusMonths(WARRANTY_MONTHS));
        c.setWarrantyReleased(false);
        c.setCompletedAt(LocalDateTime.now());
        c.setStatus(Contract.Status.COMPLETED);
        if (adminNote != null) c.setAdminNote(adminNote);
        c.getStages().add(stage(c, Contract.Status.COMPLETED,
                String.format("Admin xac nhan hoan cong. Giai ngan 95%% (%s) cho nha thau. Giu lai 5%% bao hanh (%s) trong %d thang den %s.",
                        fmtVnd(immediateAmt), fmtVnd(warrantyAmt), WARRANTY_MONTHS,
                        c.getWarrantyEndDate().toLocalDate().toString()),
                admin.getFullName()));
        contractRepository.save(c);

        notificationService.createNotification(c.getClient(), Notification.NotifType.PAYMENT_SUCCESS,
                "HD " + c.getContractNumber() + " hoan thanh! Nha thau nhan 95%% ngay. 5%% bao hanh giu " + WARRANTY_MONTHS + " thang.");
        notificationService.createNotification(c.getContractor(), Notification.NotifType.PAYMENT_SUCCESS,
                "HD " + c.getContractNumber() + " hoan thanh! Nhan " + fmtVnd(immediateAmt) + " ngay. " +
                fmtVnd(warrantyAmt) + " bao hanh giu den " + c.getWarrantyEndDate().toLocalDate() + ".");
        return toResponse(c);
    }

    /**
     * Admin: giải ngân 5% bảo hành sau khi hết hạn bảo hành (hoặc thủ công sớm hơn).
     */
    @Transactional
    public ContractResponse releaseWarrantyHold(Long contractId, String adminNote) {
        User admin = getCurrentUser();
        Contract c = getContract(contractId);
        if (c.getStatus() != Contract.Status.COMPLETED)
            throw new RuntimeException("Chi giai ngan bao hanh khi hop dong da COMPLETED");
        if (!Boolean.TRUE.equals(c.getWarrantyHoldLocked()))
            throw new RuntimeException("Khong co tien bao hanh dang locked");
        if (Boolean.TRUE.equals(c.getWarrantyReleased()))
            throw new RuntimeException("Tien bao hanh da duoc giai ngan roi");

        long warrantyAmt = c.getWarrantyHoldAmount() != null ? c.getWarrantyHoldAmount() : 0L;
        if (warrantyAmt <= 0) throw new RuntimeException("So tien bao hanh khong hop le");

        // Unlock warranty hold từ lockedAmount ví nhà thầu
        Wallet contractorWallet = walletRepository.findByUserId(c.getContractor().getId())
                .orElseThrow(() -> new RuntimeException("Vi nha thau khong ton tai"));
        contractorWallet.setLockedAmount(Math.max(0, contractorWallet.getLockedAmount() - warrantyAmt));
        walletRepository.save(contractorWallet);
        walletCoreManager.recordTransaction(contractorWallet, warrantyAmt, Transaction.Type.RELEASE,
                "CONSTRUCTX_WARRANTY", "CTR-WARRANTY-RELEASE-" + c.getContractNumber(),
                "Giai ngan tien bao hanh 5%% HD " + c.getContractNumber() + (adminNote != null ? " - " + adminNote : ""));

        c.setWarrantyHoldLocked(false);
        c.setWarrantyReleased(true);
        c.getStages().add(stage(c, Contract.Status.COMPLETED,
                "Giai ngan tien bao hanh " + fmtVnd(warrantyAmt) + " cho nha thau. " +
                (adminNote != null ? adminNote : "Ket thuc bao hanh."),
                admin.getFullName()));
        contractRepository.save(c);

        notificationService.createNotification(c.getContractor(), Notification.NotifType.PAYMENT_SUCCESS,
                "✅ Da giai ngan " + fmtVnd(warrantyAmt) + " tien bao hanh HD " + c.getContractNumber() + ". Bao hanh ket thuc.");
        notificationService.createNotification(c.getClient(), Notification.NotifType.SYSTEM,
                "Tien bao hanh HD " + c.getContractNumber() + " da duoc giai ngan cho nha thau sau " + WARRANTY_MONTHS + " thang bao hanh.");
        return toResponse(c);
    }

    @Transactional
    public ContractResponse signContract(Long contractId) {
        User user = getCurrentUser();
        Contract c = getContract(contractId);

        if (c.getStatus() != Contract.Status.WAITING_SIGNATURE)
            throw new RuntimeException("Hop dong chua san sang de ky (can Admin duyet truoc)");

        boolean isClient     = c.getClient().getId().equals(user.getId());
        boolean isContractor = c.getContractor().getId().equals(user.getId());

        if (!isClient && !isContractor)
            throw new RuntimeException("Ban khong phai la mot trong hai ben cua hop dong nay");

        if (isContractor) {
            if (Boolean.TRUE.equals(c.getContractorSigned()))
                throw new RuntimeException("Ban da ky hop dong nay roi");

            long kyQuyAmt = c.getContractorDepositAmount() != null
                    ? c.getContractorDepositAmount()
                    : Math.round((c.getAgreedPrice() != null ? c.getAgreedPrice() : 0L) * CONTRACTOR_DEPOSIT_RATE);

            Wallet contractorWallet = walletRepository.findByUserIdForUpdate(user.getId())
                    .orElseThrow(() -> new RuntimeException("Vi nha thau khong ton tai"));
            if (contractorWallet.getAvailableBalance() < kyQuyAmt)
                throw new RuntimeException(String.format(
                        "Vi nha thau khong du ky quy 5%% (%s). Hien co %s.",
                        fmtVnd(kyQuyAmt), fmtVnd(contractorWallet.getAvailableBalance())));

            walletCoreManager.executeLockForOrder(contractorWallet, kyQuyAmt, Transaction.Type.LOCK,
                    "CONSTRUCTX_ESCROW", "CTR-KQ-" + c.getContractNumber());

            c.setContractorDepositAmount(kyQuyAmt);
            c.setContractorDepositLocked(true);
            c.setContractorSigned(true);
            c.setContractorSignedAt(LocalDateTime.now());
            c.getStages().add(stage(c, Contract.Status.WAITING_SIGNATURE,
                    "Nha thau ky hop dong. Da lock ky quy " + fmtVnd(kyQuyAmt) + " (5%%).",
                    user.getFullName()));

            notificationService.createNotification(c.getClient(), Notification.NotifType.SYSTEM,
                    "Nha thau da ky HD " + c.getContractNumber() + ". Den luot ban ky de bat dau thi cong.");

        } else {
            if (Boolean.TRUE.equals(c.getClientSigned()))
                throw new RuntimeException("Ban da ky hop dong nay roi");

            c.setClientSigned(true);
            c.setClientSignedAt(LocalDateTime.now());
            c.getStages().add(stage(c, Contract.Status.WAITING_SIGNATURE,
                    "Khach hang ky hop dong.",
                    user.getFullName()));

            notificationService.createNotification(c.getContractor(), Notification.NotifType.SYSTEM,
                    "Khach hang da ky HD " + c.getContractNumber() + ". Vui long ky de bat dau thi cong.");
        }

        if (Boolean.TRUE.equals(c.getClientSigned()) && Boolean.TRUE.equals(c.getContractorSigned())) {
            c.setStatus(Contract.Status.ACTIVE);
            c.getStages().add(stage(c, Contract.Status.ACTIVE,
                    "Ca hai ben da ky. Hop dong chinh thuc co hieu luc.",
                    "SYSTEM"));
            notificationService.createNotification(c.getClient(), Notification.NotifType.SYSTEM,
                    "HD " + c.getContractNumber() + " chinh thuc ACTIVE! Cong trinh bat dau thi cong.");
            notificationService.createNotification(c.getContractor(), Notification.NotifType.SYSTEM,
                    "HD " + c.getContractNumber() + " chinh thuc ACTIVE! Bat dau thi cong du an.");
        }

        contractRepository.save(c);
        return toResponse(c);
    }

    @Transactional
    public ContractResponse cancelByCustomer(Long contractId, String reason) {
        User customer = getCurrentUser();
        Contract c = getContract(contractId);

        if (!c.getClient().getId().equals(customer.getId()))
            throw new RuntimeException("Ban khong phai la Khach hang cua hop dong nay");

        if (c.getStatus() != Contract.Status.ACTIVE && c.getStatus() != Contract.Status.WAITING_SIGNATURE)
            throw new RuntimeException("Hop dong khong the huy o trang thai: " + c.getStatus());

        long customerDeposit   = c.getCustomerDepositAmount() != null ? c.getCustomerDepositAmount() : 0L;
        long contractorDeposit = c.getContractorDepositAmount() != null ? c.getContractorDepositAmount() : 0L;

        if (c.getStatus() == Contract.Status.ACTIVE) {
            long contractorShare = Math.round(customerDeposit * CANCEL_CONTRACTOR_SHARE);
            if (Boolean.TRUE.equals(c.getCustomerDepositLocked()) && customerDeposit > 0) {
                Wallet cw = walletRepository.findByUserId(c.getClient().getId())
                        .orElseThrow(() -> new RuntimeException("Vi khach hang khong ton tai"));
                cw.setLockedAmount(Math.max(0, cw.getLockedAmount() - customerDeposit));
                cw.setBalance(Math.max(0, cw.getBalance() - customerDeposit));
                walletRepository.save(cw);
                c.setCustomerDepositLocked(false);
            }
            if (contractorShare > 0) {
                Wallet contW = walletRepository.findByUserId(c.getContractor().getId())
                        .orElseThrow(() -> new RuntimeException("Vi nha thau khong ton tai"));
                walletCoreManager.executeDeposit(contW, contractorShare, Transaction.Type.REVENUE,
                        "CONSTRUCTX_PENALTY", "CTR-CUST-CANCEL-" + c.getContractNumber(),
                        "Nhan 70%% coc tu khach huy HD " + c.getContractNumber());
            }
            if (Boolean.TRUE.equals(c.getContractorDepositLocked()) && contractorDeposit > 0) {
                unlockContractorDeposit(c, "Khach hang huy hop dong");
            }
        } else {
            if (Boolean.TRUE.equals(c.getCustomerDepositLocked()) && customerDeposit > 0)
                unlockCustomerDeposit(c, "Khach hang huy HD chua active");
            if (Boolean.TRUE.equals(c.getContractorDepositLocked()) && contractorDeposit > 0)
                unlockContractorDeposit(c, "Khach hang huy HD chua active");
        }

        c.setStatus(Contract.Status.CANCELLED);
        c.setCancelledBy(Contract.CancelledBy.CLIENT);
        c.setCancelReason(reason);
        c.setCancelledAt(LocalDateTime.now());
        c.getStages().add(stage(c, Contract.Status.CANCELLED,
                "Khach hang huy hop dong. Ly do: " + (reason != null ? reason : "Khong co ly do"),
                customer.getFullName()));

        // Chỉ cập nhật project nếu hợp đồng đến từ Luồng A (có project), không crash với Luồng C (order)
        if (c.getProject() != null) {
            c.getProject().setStatus(Project.Status.OPEN);
            projectRepository.save(c.getProject());
        }
        contractRepository.save(c);

        notificationService.createNotification(c.getContractor(), Notification.NotifType.SYSTEM,
                "Khach hang da huy HD " + c.getContractNumber() +
                (c.getStatus() == Contract.Status.ACTIVE
                    ? ". Ban nhan " + fmtVnd(Math.round(customerDeposit * CANCEL_CONTRACTOR_SHARE)) + " phat vi pham."
                    : "."));
        notificationService.createNotification(c.getClient(), Notification.NotifType.SYSTEM,
                "Ban da huy HD " + c.getContractNumber() + ".");
        return toResponse(c);
    }

    @Transactional
    public ContractResponse cancelByContractor(Long contractId, String reason) {
        User contractor = getCurrentUser();
        Contract c = getContract(contractId);

        if (!c.getContractor().getId().equals(contractor.getId()))
            throw new RuntimeException("Ban khong phai la Nha thau cua hop dong nay");

        if (c.getStatus() != Contract.Status.ACTIVE && c.getStatus() != Contract.Status.WAITING_SIGNATURE)
            throw new RuntimeException("Hop dong khong the huy o trang thai: " + c.getStatus());

        long customerDeposit   = c.getCustomerDepositAmount() != null ? c.getCustomerDepositAmount() : 0L;
        long contractorDeposit = c.getContractorDepositAmount() != null ? c.getContractorDepositAmount() : 0L;

        if (Boolean.TRUE.equals(c.getContractorDepositLocked()) && contractorDeposit > 0) {
            Wallet contW = walletRepository.findByUserId(c.getContractor().getId())
                    .orElseThrow(() -> new RuntimeException("Vi nha thau khong ton tai"));
            contW.setLockedAmount(Math.max(0, contW.getLockedAmount() - contractorDeposit));
            contW.setBalance(Math.max(0, contW.getBalance() - contractorDeposit));
            walletRepository.save(contW);
            c.setContractorDepositLocked(false);
        }

        if (Boolean.TRUE.equals(c.getCustomerDepositLocked()) && customerDeposit > 0) {
            unlockCustomerDeposit(c, "Nha thau huy hop dong");
        }

        int currentScore = c.getContractorReputationScore() != null ? c.getContractorReputationScore() : 100;
        int newScore = Math.max(0, currentScore - REPUTATION_PENALTY);
        log.info("Contractor {} reputation penalized by {} for cancelling contract {} ({} -> {})",
                contractor.getEmail(), REPUTATION_PENALTY, c.getContractNumber(), currentScore, newScore);

        c.setStatus(Contract.Status.CANCELLED);
        c.setCancelledBy(Contract.CancelledBy.CONTRACTOR);
        c.setCancelReason(reason);
        c.setCancelledAt(LocalDateTime.now());
        c.setContractorReputationScore(newScore);
        c.getStages().add(stage(c, Contract.Status.CANCELLED,
                "Nha thau huy hop dong. Ly do: " + (reason != null ? reason : "Khong co ly do") +
                ". Mat ky quy " + fmtVnd(contractorDeposit) + " + tru " + REPUTATION_PENALTY + " diem uy tin.",
                contractor.getFullName()));

        // Chỉ cập nhật project nếu hợp đồng đến từ Luồng A (có project), không crash với Luồng C (order)
        if (c.getProject() != null) {
            c.getProject().setStatus(Project.Status.OPEN);
            projectRepository.save(c.getProject());
        }
        contractRepository.save(c);

        notificationService.createNotification(c.getClient(), Notification.NotifType.SYSTEM,
                "Nha thau da huy HD " + c.getContractNumber() + ". Da hoan " + fmtVnd(customerDeposit) + " coc ve vi ban.");
        notificationService.createNotification(c.getContractor(), Notification.NotifType.SYSTEM,
                "Ban da huy HD " + c.getContractNumber() + ". Mat ky quy " + fmtVnd(contractorDeposit) + " va tru " + REPUTATION_PENALTY + " diem uy tin.");
        return toResponse(c);
    }

    private BidResponse mapBidResponse(Bid bid) {
        List<BidDetailResponse> details = bid.getDetails().stream()
                .map(d -> BidDetailResponse.builder()
                        .id(d.getId())
                        .itemName(d.getItemName())
                        .unit(d.getUnit())
                        .quantity(d.getQuantity())
                        .unitPrice(d.getUnitPrice())
                        .totalPrice(d.getTotalPrice())
                        .description(d.getDescription())
                        .sampleImage(d.getSampleImage())
                        .build())
                .collect(Collectors.toList());

        return BidResponse.builder()
                .id(bid.getId())
                .projectId(bid.getProject().getId())
                .projectName(bid.getProject().getName())
                .projectCategory(bid.getProject().getCategory())
                .projectBudgetMin(bid.getProject().getBudgetMin())
                .projectBudgetMax(bid.getProject().getBudgetMax())
                .contractorId(bid.getContractor().getId())
                .contractorName(bid.getContractor().getFullName())
                .contractorEmail(bid.getContractor().getEmail())
                .contractorPhone(bid.getContractor().getPhoneNumber())
                .totalPrice(bid.getTotalPrice())
                .estimatedDays(bid.getEstimatedDays())
                .message(bid.getMessage())
                .designImage(bid.getDesignImage())
                .warrantyMonths(bid.getWarrantyMonths())
                .paymentTerms(bid.getPaymentTerms())
                .status(bid.getStatus().name())
                .createdAt(bid.getCreatedAt())
                .submittedAt(bid.getSubmittedAt())
                .reviewedAt(bid.getReviewedAt())
                .details(details)
                .build();
    }

    private ContractResponse toResponse(Contract c) {
        List<ContractResponse.ContractStageResponse> stages = c.getStages() == null ? List.of() :
                c.getStages().stream()
                        .map(s -> ContractResponse.ContractStageResponse.builder()
                                .id(s.getId())
                                .stage(s.getStage().name())
                                .note(s.getNote())
                                .performedBy(s.getPerformedBy())
                                .createdAt(s.getCreatedAt())
                                .build())
                        .collect(Collectors.toList());

        return ContractResponse.builder()
                .id(c.getId())
                .contractNumber(c.getContractNumber())
                .projectId(c.getProject() != null ? c.getProject().getId() : null)
                .projectName(c.getProject() != null ? c.getProject().getName() : null)
                .bidId(c.getBid() != null ? c.getBid().getId() : null)
                .clientId(c.getClient() != null ? c.getClient().getId() : null)
                .clientName(c.getClient() != null ? c.getClient().getFullName() : null)
                .clientPhone(c.getClient() != null ? c.getClient().getPhoneNumber() : null)
                .clientEmail(c.getClient() != null ? c.getClient().getEmail() : null)
                .contractorId(c.getContractor() != null ? c.getContractor().getId() : null)
                .contractorName(c.getContractor() != null ? c.getContractor().getFullName() : null)
                .contractorPhone(c.getContractor() != null ? c.getContractor().getPhoneNumber() : null)
                .contractorEmail(c.getContractor() != null ? c.getContractor().getEmail() : null)
                .contractorAddress(c.getContractor() != null ? c.getContractor().getAddress() : null)
                .adminId(c.getAdmin() != null ? c.getAdmin().getId() : null)
                .adminName(c.getAdmin() != null ? c.getAdmin().getFullName() : null)
                .adminEmail(c.getAdmin() != null ? c.getAdmin().getEmail() : null)
                .orderId(c.getSourceOrder() != null ? c.getSourceOrder().getId() : null)
                .orderCode(c.getSourceOrder() != null ? c.getSourceOrder().getOrderCode() : null)
                .agreedPrice(c.getAgreedPrice())
                .originalAgreedPrice(c.getOriginalAgreedPrice())
                .estimatedDays(c.getEstimatedDays())
                .terms(c.getTerms())
                .adminNote(c.getAdminNote())
                .status(c.getStatus().name())
                .customerDepositAmount(c.getCustomerDepositAmount())
                .customerDepositLocked(c.getCustomerDepositLocked())
                .contractorDepositAmount(c.getContractorDepositAmount())
                .contractorDepositLocked(c.getContractorDepositLocked())
                .clientSigned(c.getClientSigned())
                .contractorSigned(c.getContractorSigned())
                .clientSignedAt(c.getClientSignedAt())
                .contractorSignedAt(c.getContractorSignedAt())
                .createdAt(c.getCreatedAt())
                .approvedAt(c.getApprovedAt())
                .stages(stages)
                .warrantyHoldAmount(c.getWarrantyHoldAmount())
                .warrantyHoldLocked(c.getWarrantyHoldLocked())
                .warrantyReleased(c.getWarrantyReleased())
                .warrantyEndDate(c.getWarrantyEndDate() != null ? c.getWarrantyEndDate().toLocalDate().toString() : null)
                .completedAt(c.getCompletedAt())
                .build();
    }
}
