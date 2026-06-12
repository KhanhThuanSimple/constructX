package com.constructx.backend.features.constructor.service;

import com.constructx.backend.features.constructor.dto.DisbursementResponse;
import com.constructx.backend.features.constructor.dto.request.CreateDisbursementRequest;
import com.constructx.backend.features.constructor.entity.Contract;
import com.constructx.backend.features.constructor.entity.ContractStage;
import com.constructx.backend.features.constructor.entity.DisbursementRequest;
import com.constructx.backend.features.constructor.repository.ConstructionLogRepository;
import com.constructx.backend.features.constructor.repository.ContractRepository;
import com.constructx.backend.features.constructor.repository.DisbursementRequestRepository;
import com.constructx.backend.features.notification.entity.Notification;
import com.constructx.backend.features.notification.service.NotificationService;
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
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DisbursementService {

    /** Tỷ lệ tối đa có thể giải ngân so với agreedPrice trước khi hoàn công */
    private static final double MAX_INTERIM_DISBURSEMENT_RATIO = 0.80;
    /** Tỉ lệ unlock ngay mặc định: 30% dùng ngay, 70% locked */
    private static final double DEFAULT_IMMEDIATE_RATIO = 0.30;

    private final DisbursementRequestRepository disbursementRepository;
    private final ConstructionLogRepository constructionLogRepository;
    private final ContractRepository contractRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final WalletCoreManager walletCoreManager;
    private final NotificationService notificationService;

    private User getCurrentUser() {
        return userRepository.findByEmail(
                SecurityContextHolder.getContext().getAuthentication().getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private static String fmtVnd(long amount) {
        return NumberFormat.getNumberInstance(new Locale("vi", "VN")).format(amount) + " VND";
    }

    // ─── Nhà thầu: gửi yêu cầu giải ngân ───────────────────────────────────

    @Transactional
    public DisbursementResponse requestDisbursement(CreateDisbursementRequest req) {
        User contractor = getCurrentUser();
        Contract contract = contractRepository.findById(req.getContractId())
                .orElseThrow(() -> new RuntimeException("Hop dong khong ton tai"));

        if (!contract.getContractor().getId().equals(contractor.getId()))
            throw new RuntimeException("Ban khong phai nha thau cua hop dong nay");
        if (contract.getStatus() != Contract.Status.ACTIVE)
            throw new RuntimeException("Chi yeu cau giai ngan khi hop dong dang ACTIVE");

        // Kiểm tra tiến độ thực tế
        int currentProgress = constructionLogRepository
                .findMaxProgressByContractId(contract.getId()).orElse(0);
        if (currentProgress < req.getPhaseThreshold())
            throw new RuntimeException(String.format(
                    "Tien do hien tai (%d%%) chua dat nguong yeu cau (%d%%) de giai ngan giai doan nay.",
                    currentProgress, req.getPhaseThreshold()));

        // Kiểm tra không được gửi 2 yêu cầu cùng phase
        boolean alreadyExists = disbursementRepository.existsByContractIdAndPhaseThresholdAndStatusIn(
                contract.getId(), req.getPhaseThreshold(),
                List.of(DisbursementRequest.Status.PENDING, DisbursementRequest.Status.APPROVED));
        if (alreadyExists)
            throw new RuntimeException("Da co yeu cau giai ngan cho giai doan nay roi.");

        // Kiểm tra tổng giải ngân không vượt 80% agreedPrice (khoản cuối 20% khi hoàn công)
        long agreedPrice = contract.getAgreedPrice() != null ? contract.getAgreedPrice() : 0L;
        long alreadyDisbursed = disbursementRepository.sumApprovedByContractId(contract.getId());
        long maxAllowed = Math.round(agreedPrice * MAX_INTERIM_DISBURSEMENT_RATIO);
        if (alreadyDisbursed + req.getAmount() > maxAllowed)
            throw new RuntimeException(String.format(
                    "Tong giai ngan vuot gioi han 80%% (%s). Da giai ngan: %s. Con lai toi da: %s.",
                    fmtVnd(maxAllowed), fmtVnd(alreadyDisbursed), fmtVnd(maxAllowed - alreadyDisbursed)));

        double ratio = req.getImmediateRatio() != null
                ? Math.min(1.0, Math.max(0.0, req.getImmediateRatio()))
                : DEFAULT_IMMEDIATE_RATIO;
        long immediateAmt = Math.round(req.getAmount() * ratio);
        long lockedAmt = req.getAmount() - immediateAmt;

        DisbursementRequest disbursement = DisbursementRequest.builder()
                .contract(contract)
                .contractor(contractor)
                .phaseLabel(req.getPhaseLabel())
                .phaseThreshold(req.getPhaseThreshold())
                .amount(req.getAmount())
                .immediateRatio(ratio)
                .immediateAmount(immediateAmt)
                .lockedAmount(lockedAmt)
                .progressAtRequest(currentProgress)
                .note(req.getNote())
                .status(DisbursementRequest.Status.PENDING)
                .build();

        DisbursementRequest saved = disbursementRepository.save(disbursement);

        notificationService.createNotification(
                contract.getClient(), Notification.NotifType.PAYMENT_SUCCESS,
                String.format("Nha thau yeu cau giai ngan %s giai doan '%s' - HD %s. Vui long cho Admin xac nhan truoc.",
                        fmtVnd(req.getAmount()), req.getPhaseLabel(), contract.getContractNumber()));

        // Notify Admin để verify
        notificationService.createNotificationForAdmins(
                Notification.NotifType.SYSTEM,
                String.format("📋 Yeu cau giai ngan moi: HD %s - Nha thau %s - Giai doan '%s' - So tien: %s. Can xac nhan.",
                        contract.getContractNumber(), contractor.getFullName(),
                        req.getPhaseLabel(), fmtVnd(req.getAmount())));

        return toResponse(saved);
    }

    // ─── Admin: xác nhận hợp lệ trước khi Customer duyệt ───────────────────────

    @Transactional
    public DisbursementResponse adminVerifyDisbursement(Long requestId, String note) {
        User admin = getCurrentUser();
        if (admin.getRole() != User.Role.ADMIN)
            throw new RuntimeException("Chi Admin moi co the xac nhan yeu cau giai ngan");

        DisbursementRequest req = getDisbursement(requestId);
        if (req.getStatus() != DisbursementRequest.Status.PENDING)
            throw new RuntimeException("Yeu cau nay da duoc xu ly roi");
        if (Boolean.TRUE.equals(req.getAdminVerified()))
            throw new RuntimeException("Yeu cau nay da duoc Admin xac nhan roi");

        req.setAdminVerified(true);
        req.setAdminVerifiedAt(LocalDateTime.now());
        req.setAdminVerifiedBy(admin);
        req.setAdminVerifyNote(note);
        disbursementRepository.save(req);

        // Thông báo customer để duyệt
        notificationService.createNotification(
                req.getContract().getClient(), Notification.NotifType.PAYMENT_SUCCESS,
                String.format("✅ Admin da xac nhan yeu cau giai ngan %s giai doan '%s' - HD %s. Vui long vao trang Tien do de duyet.",
                        fmtVnd(req.getAmount()), req.getPhaseLabel(), req.getContract().getContractNumber()));

        // Thông báo contractor
        notificationService.createNotification(
                req.getContractor(), Notification.NotifType.SYSTEM,
                String.format("✅ Admin da xac nhan yeu cau giai ngan giai doan '%s'. Dang cho khach hang duyet.",
                        req.getPhaseLabel()));

        return toResponse(req);
    }

    // ─── Khách hàng: duyệt yêu cầu giải ngân (phải qua Admin verify trước) ──

    @Transactional
    public DisbursementResponse approveDisbursement(Long requestId) {
        User client = getCurrentUser();
        DisbursementRequest req = getDisbursement(requestId);
        Contract contract = req.getContract();

        if (!contract.getClient().getId().equals(client.getId()))
            throw new RuntimeException("Ban khong phai khach hang cua hop dong nay");
        if (req.getStatus() != DisbursementRequest.Status.PENDING)
            throw new RuntimeException("Yeu cau nay da duoc xu ly roi");
        if (!Boolean.TRUE.equals(req.getAdminVerified()))
            throw new RuntimeException("Yeu cau giai ngan chua duoc Admin xac nhan. Vui long cho Admin kiem tra truoc khi duyet.");

        // Kiểm tra ví khách đủ tiền
        Wallet clientWallet = walletRepository.findByUserIdForUpdate(client.getId())
                .orElseThrow(() -> new RuntimeException("Vi khach hang khong ton tai"));
        if (clientWallet.getAvailableBalance() < req.getAmount())
            throw new RuntimeException(String.format(
                    "Vi khach hang khong du tien (%s). Can: %s.",
                    fmtVnd(clientWallet.getAvailableBalance()), fmtVnd(req.getAmount())));

        // Trừ tiền khách hàng (trừ hẳn khỏi balance)
        clientWallet.setBalance(clientWallet.getBalance() - req.getAmount());
        walletRepository.save(clientWallet);

        // Ghi transaction trừ tiền khách
        saveTransaction(clientWallet, req.getAmount(), Transaction.Type.LOCK,
                "CONSTRUCTX_DISBURSEMENT",
                "PAY-DISB-" + requestId,
                "Thanh toan giai ngan giai doan '" + req.getPhaseLabel() + "' HD " + contract.getContractNumber());

        // Vào ví nhà thầu: balance tăng toàn bộ, lockedAmount tăng phần bị giữ lại
        Wallet contractorWallet = walletRepository.findByUserId(req.getContractor().getId())
                .orElseThrow(() -> new RuntimeException("Vi nha thau khong ton tai"));

        contractorWallet.setBalance(contractorWallet.getBalance() + req.getAmount());
        contractorWallet.setLockedAmount(contractorWallet.getLockedAmount() + req.getLockedAmount());
        walletRepository.save(contractorWallet);

        // Ghi 2 transaction tách biệt rõ ràng: phần immediate và phần locked
        // Giao dịch 1: nhận phần immediate (dùng ngay)
        saveTransaction(contractorWallet, req.getImmediateAmount(), Transaction.Type.REVENUE,
                "CONSTRUCTX_DISBURSEMENT",
                "RECV-IMM-" + requestId,
                String.format("Nhan ngay %s giai doan '%s' HD %s (30%% immediate)",
                        fmtVnd(req.getImmediateAmount()), req.getPhaseLabel(), contract.getContractNumber()));

        // Giao dịch 2: phần bị đóng băng (locked đến mốc tiếp theo)
        if (req.getLockedAmount() != null && req.getLockedAmount() > 0) {
            saveTransaction(contractorWallet, req.getLockedAmount(), Transaction.Type.LOCK,
                    "CONSTRUCTX_ESCROW",
                    "RECV-LOCK-" + requestId,
                    String.format("Dong bang %s giai doan '%s' HD %s (70%% — mo khi dat moc tiep theo)",
                            fmtVnd(req.getLockedAmount()), req.getPhaseLabel(), contract.getContractNumber()));
        }

        req.setStatus(DisbursementRequest.Status.APPROVED);
        req.setReviewedBy(client);
        req.setReviewedAt(LocalDateTime.now());
        disbursementRepository.save(req);

        // Thêm vào contract audit trail
        contract.getStages().add(ContractStage.builder()
                .contract(contract)
                .stage(Contract.Status.ACTIVE)
                .note(String.format("Khach hang duyet giai ngan %s giai doan '%s'. Immediate: %s, Locked: %s.",
                        fmtVnd(req.getAmount()), req.getPhaseLabel(),
                        fmtVnd(req.getImmediateAmount()), fmtVnd(req.getLockedAmount())))
                .performedBy(client.getFullName())
                .build());
        contractRepository.save(contract);

        notificationService.createNotification(
                req.getContractor(), Notification.NotifType.PAYMENT_SUCCESS,
                String.format("Khach hang da duyet giai ngan %s giai doan '%s'. %s dung ngay, %s con locked.",
                        fmtVnd(req.getAmount()), req.getPhaseLabel(),
                        fmtVnd(req.getImmediateAmount()), fmtVnd(req.getLockedAmount())));

        // Kiểm tra tự động mở locked của các request cũ nếu tiến độ đủ
        autoUnlockPreviousLocked(contract, req.getPhaseThreshold());

        return toResponse(req);
    }

    // ─── Khách hàng: từ chối yêu cầu giải ngân ──────────────────────────────

    @Transactional
    public DisbursementResponse rejectDisbursement(Long requestId, String reason) {
        User client = getCurrentUser();
        DisbursementRequest req = getDisbursement(requestId);
        Contract contract = req.getContract();

        if (!contract.getClient().getId().equals(client.getId()))
            throw new RuntimeException("Ban khong phai khach hang cua hop dong nay");
        if (req.getStatus() != DisbursementRequest.Status.PENDING)
            throw new RuntimeException("Yeu cau nay da duoc xu ly roi");

        req.setStatus(DisbursementRequest.Status.REJECTED);
        req.setReviewedBy(client);
        req.setRejectReason(reason);
        req.setReviewedAt(LocalDateTime.now());
        disbursementRepository.save(req);

        notificationService.createNotification(
                req.getContractor(), Notification.NotifType.PAYMENT_FAILED,
                String.format("Khach hang tu choi giai ngan giai doan '%s'. Ly do: %s.",
                        req.getPhaseLabel(), reason != null ? reason : "Khong co ly do"));

        return toResponse(req);
    }

    // ─── Nhà thầu: hủy yêu cầu chưa được xử lý ─────────────────────────────

    @Transactional
    public DisbursementResponse cancelDisbursement(Long requestId) {
        User contractor = getCurrentUser();
        DisbursementRequest req = getDisbursement(requestId);

        if (!req.getContractor().getId().equals(contractor.getId()))
            throw new RuntimeException("Ban khong phai nha thau cua yeu cau nay");
        if (req.getStatus() != DisbursementRequest.Status.PENDING)
            throw new RuntimeException("Chi huy duoc yeu cau dang cho duyet");

        req.setStatus(DisbursementRequest.Status.CANCELLED);
        disbursementRepository.save(req);
        return toResponse(req);
    }

    // ─── Admin/Khách hàng: mở khóa phần locked khi tiến độ đạt mốc ─────────

    @Transactional
    public DisbursementResponse unlockLockedAmount(Long requestId) {
        User user = getCurrentUser();
        DisbursementRequest req = getDisbursement(requestId);
        Contract contract = req.getContract();

        boolean isAdmin = user.getRole() == User.Role.ADMIN;
        boolean isClient = contract.getClient().getId().equals(user.getId());
        if (!isAdmin && !isClient)
            throw new RuntimeException("Chi Admin hoac Khach hang moi co the mo khoa tien");

        if (req.getStatus() != DisbursementRequest.Status.APPROVED)
            throw new RuntimeException("Chi mo khoa duoc yeu cau da duoc duyet");
        if (Boolean.TRUE.equals(req.getFullyUnlocked()))
            throw new RuntimeException("Khoan nay da duoc mo khoa hoan toan roi");

        long toUnlock = req.getLockedAmount();
        if (toUnlock <= 0) {
            req.setFullyUnlocked(true);
            disbursementRepository.save(req);
            return toResponse(req);
        }

        Wallet contractorWallet = walletRepository.findByUserId(req.getContractor().getId())
                .orElseThrow(() -> new RuntimeException("Vi nha thau khong ton tai"));
        contractorWallet.setLockedAmount(Math.max(0, contractorWallet.getLockedAmount() - toUnlock));
        walletRepository.save(contractorWallet);

        saveTransaction(contractorWallet, toUnlock, Transaction.Type.RELEASE,
                "CONSTRUCTX_UNLOCK",
                "UNLOCK-DISB-" + requestId,
                "Mo khoa tien bao dam giai doan '" + req.getPhaseLabel() + "' HD " + contract.getContractNumber());

        req.setLockedAmount(0L);
        req.setFullyUnlocked(true);
        disbursementRepository.save(req);

        notificationService.createNotification(
                req.getContractor(), Notification.NotifType.PAYMENT_SUCCESS,
                String.format("Da mo khoa %s tien bao dam giai doan '%s' HD %s.",
                        fmtVnd(toUnlock), req.getPhaseLabel(), contract.getContractNumber()));

        return toResponse(req);
    }

    // ─── READ ────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<DisbursementResponse> getByContract(Long contractId) {
        User user = getCurrentUser();
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Hop dong khong ton tai"));

        boolean isAdmin = user.getRole() == User.Role.ADMIN;
        boolean isClient = contract.getClient().getId().equals(user.getId());
        boolean isContractor = contract.getContractor().getId().equals(user.getId());
        if (!isAdmin && !isClient && !isContractor)
            throw new RuntimeException("Ban khong co quyen xem giai ngan");

        return disbursementRepository.findByContractIdOrderByCreatedAtDesc(contractId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    private DisbursementRequest getDisbursement(Long id) {
        return disbursementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Yeu cau giai ngan khong ton tai: " + id));
    }

    /**
     * Tự động unlock phần locked của các request đã duyệt trước đó
     * khi tiến độ đạt threshold mới.
     * Logic: nếu phase mới đã được duyệt, unlock tất cả locked của phase cũ hơn.
     */
    private void autoUnlockPreviousLocked(Contract contract, int newPhaseThreshold) {
        List<DisbursementRequest> previous = disbursementRepository
                .findByContractIdOrderByCreatedAtDesc(contract.getId())
                .stream()
                .filter(r -> r.getStatus() == DisbursementRequest.Status.APPROVED
                        && !Boolean.TRUE.equals(r.getFullyUnlocked())
                        && r.getLockedAmount() != null && r.getLockedAmount() > 0
                        && r.getPhaseThreshold() < newPhaseThreshold)
                .toList();

        for (DisbursementRequest prev : previous) {
            long toUnlock = prev.getLockedAmount();
            Wallet contractorWallet = walletRepository.findByUserId(prev.getContractor().getId())
                    .orElse(null);
            if (contractorWallet == null) continue;

            contractorWallet.setLockedAmount(Math.max(0, contractorWallet.getLockedAmount() - toUnlock));
            walletRepository.save(contractorWallet);

            saveTransaction(contractorWallet, toUnlock, Transaction.Type.RELEASE,
                    "CONSTRUCTX_AUTO_UNLOCK",
                    "AUTO-UNLOCK-DISB-" + prev.getId(),
                    "Tu dong mo khoa tien bao dam giai doan '" + prev.getPhaseLabel() + "' khi dat moc moi " + newPhaseThreshold + "%");

            prev.setLockedAmount(0L);
            prev.setFullyUnlocked(true);
            disbursementRepository.save(prev);

            log.info("Auto-unlocked {} locked from disbursement {} for contract {}",
                    toUnlock, prev.getId(), contract.getContractNumber());
        }
    }

    private void saveTransaction(Wallet wallet, Long amount, Transaction.Type type,
                                  String gateway, String orderId, String description) {
        // Dùng WalletCoreManager.executeDeposit với amount=0 để chỉ ghi log
        // Thực ra cần ghi transaction trực tiếp → inject TransactionRepository
        // Tạm thời dùng executeDeposit với amount để cộng balance
        // NOTE: logic balance đã được xử lý thủ công trước khi gọi hàm này
        // Hàm này chỉ để ghi audit log transaction
        // → Tạo transaction record trực tiếp qua WalletCoreManager helper
        walletCoreManager.recordTransaction(wallet, amount, type, gateway, orderId, description);
    }

    private DisbursementResponse toResponse(DisbursementRequest r) {
        return DisbursementResponse.builder()
                .id(r.getId())
                .contractId(r.getContract().getId())
                .contractNumber(r.getContract().getContractNumber())
                .projectName(r.getContract().getProject() != null
                        ? r.getContract().getProject().getName() : null)
                .contractorId(r.getContractor().getId())
                .contractorName(r.getContractor().getFullName())
                .phaseLabel(r.getPhaseLabel())
                .phaseThreshold(r.getPhaseThreshold())
                .amount(r.getAmount())
                .immediateRatio(r.getImmediateRatio())
                .immediateAmount(r.getImmediateAmount())
                .lockedAmount(r.getLockedAmount())
                .progressAtRequest(r.getProgressAtRequest())
                .note(r.getNote())
                .rejectReason(r.getRejectReason())
                .status(r.getStatus().name())
                .fullyUnlocked(r.getFullyUnlocked())
                .reviewedBy(r.getReviewedBy() != null ? r.getReviewedBy().getFullName() : null)
                .createdAt(r.getCreatedAt())
                .reviewedAt(r.getReviewedAt())
                .adminVerified(r.getAdminVerified())
                .adminVerifiedAt(r.getAdminVerifiedAt())
                .adminVerifiedBy(r.getAdminVerifiedBy() != null ? r.getAdminVerifiedBy().getFullName() : null)
                .adminVerifyNote(r.getAdminVerifyNote())
                .build();
    }
}
