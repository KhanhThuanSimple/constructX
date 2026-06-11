package com.constructx.backend.features.constructor.service;

import com.constructx.backend.features.constructor.dto.BidResponse;
import com.constructx.backend.features.constructor.dto.ContractResponse;
import com.constructx.backend.features.constructor.entity.*;
import com.constructx.backend.features.constructor.repository.BidRepository;
import com.constructx.backend.features.constructor.repository.ContractRepository;
import com.constructx.backend.features.project.entity.Project;
import com.constructx.backend.features.project.repository.ProjectRepository;
import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContractService {

    private final ContractRepository contractRepository;
    private final BidRepository bidRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final BidService bidService;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ── Owner: xem bids của dự án mình (blind bidding — ẩn tên đối thủ) ──

    @Transactional(readOnly = true)
    public List<BidResponse> getProjectBids(Long projectId) {
        User user = getCurrentUser();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Chỉ chủ dự án và admin mới xem được
        boolean isOwner = project.getUser().getEmail().equals(user.getEmail());
        boolean isAdmin = user.getRole() == User.Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new RuntimeException("Bạn không có quyền xem báo giá");
        }

        return bidRepository.findProjectBids(projectId).stream()
                .map(this::mapBidResponse)
                .collect(Collectors.toList());
    }

    // ── Owner: chấp nhận 1 bid → tạo Contract ──

    @Transactional
    public ContractResponse acceptBid(Long projectId, Long bidId) {
        User user = getCurrentUser();

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getUser().getEmail().equals(user.getEmail())) {
            throw new RuntimeException("Bạn không có quyền");
        }
        if (project.getStatus() != Project.Status.OPEN) {
            throw new RuntimeException("Dự án không còn trong trạng thái nhận thầu");
        }

        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found"));

        if (!bid.getProject().getId().equals(projectId)) {
            throw new RuntimeException("Bid không thuộc dự án này");
        }

        // Kiểm tra đã có contract chưa
        if (contractRepository.findByProjectId(projectId).isPresent()) {
            throw new RuntimeException("Dự án đã có hợp đồng");
        }

        // Accept bid được chọn, reject các bid còn lại
        bid.setStatus(Bid.Status.ACCEPTED);
        bidRepository.rejectOtherBids(projectId, bidId);

        // Cập nhật trạng thái project
        project.setStatus(Project.Status.IN_PROGRESS);
        projectRepository.save(project);

        // Tạo contract number: CTR-yyyyMMdd-{id}
        String tempNum = "CTR-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + projectId;

        // Xây dựng terms mặc định
        String defaultTerms = buildDefaultTerms(project, bid);

        Contract contract = Contract.builder()
                .project(project)
                .bid(bid)
                .client(project.getUser())
                .contractor(bid.getContractor())
                .contractNumber(tempNum)
                .agreedPrice(bid.getTotalPrice())
                .estimatedDays(bid.getEstimatedDays())
                .terms(defaultTerms)
                .status(Contract.Status.PENDING_REVIEW)
                .build();

        // Stage: PENDING_REVIEW
        ContractStage stage = ContractStage.builder()
                .contract(contract)
                .stage(Contract.Status.PENDING_REVIEW)
                .note("Khách hàng chấp nhận báo giá. Chờ Admin kiểm duyệt hợp đồng.")
                .performedBy(user.getFullName())
                .build();
        contract.getStages().add(stage);

        contractRepository.save(contract);

        return toResponse(contract);
    }

    // ── Admin: lấy tất cả contracts ──

    @Transactional(readOnly = true)
    public List<ContractResponse> getAllContracts(String status) {
        List<Contract> contracts;
        if (status != null && !status.equals("all")) {
            try {
                contracts = contractRepository.findByStatusOrderByCreatedAtDesc(Contract.Status.valueOf(status.toUpperCase()));
            } catch (IllegalArgumentException e) {
                contracts = contractRepository.findAllByOrderByCreatedAtDesc();
            }
        } else {
            contracts = contractRepository.findAllByOrderByCreatedAtDesc();
        }
        return contracts.stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── Admin: duyệt hợp đồng ──

    @Transactional
    public ContractResponse approveContract(Long contractId, String adminNote) {
        User admin = getCurrentUser();
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        contract.setStatus(Contract.Status.WAITING_SIGNATURE);
        contract.setAdmin(admin);
        contract.setAdminNote(adminNote);
        contract.setApprovedAt(LocalDateTime.now());

        ContractStage stage = ContractStage.builder()
                .contract(contract)
                .stage(Contract.Status.WAITING_SIGNATURE)
                .note(adminNote != null ? adminNote : "Admin đã phê duyệt. Chờ hai bên ký kết.")
                .performedBy(admin.getFullName())
                .build();
        contract.getStages().add(stage);

        contractRepository.save(contract);
        return toResponse(contract);
    }

    // ── Admin: từ chối hợp đồng ──

    @Transactional
    public ContractResponse rejectContract(Long contractId, String adminNote) {
        User admin = getCurrentUser();
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        contract.setStatus(Contract.Status.CANCELLED);
        contract.setAdmin(admin);
        contract.setAdminNote(adminNote);

        ContractStage stage = ContractStage.builder()
                .contract(contract)
                .stage(Contract.Status.CANCELLED)
                .note(adminNote != null ? adminNote : "Admin từ chối hợp đồng.")
                .performedBy(admin.getFullName())
                .build();
        contract.getStages().add(stage);

        contractRepository.save(contract);
        return toResponse(contract);
    }

    // ── Admin: chỉnh sửa điều khoản ──

    @Transactional
    public ContractResponse updateTerms(Long contractId, String terms, String adminNote) {
        User admin = getCurrentUser();
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        contract.setTerms(terms);
        if (adminNote != null) contract.setAdminNote(adminNote);

        ContractStage stage = ContractStage.builder()
                .contract(contract)
                .stage(contract.getStatus())
                .note("Admin cập nhật điều khoản hợp đồng.")
                .performedBy(admin.getFullName())
                .build();
        contract.getStages().add(stage);

        contractRepository.save(contract);
        return toResponse(contract);
    }

    // ── User: xem hợp đồng của mình ──

    @Transactional(readOnly = true)
    public List<ContractResponse> getMyContracts() {
        User user = getCurrentUser();
        List<Contract> contracts;
        if (user.getRole() == User.Role.CUSTOMER) {
            contracts = contractRepository.findByClientIdOrderByCreatedAtDesc(user.getId());
        } else {
            contracts = contractRepository.findByContractorIdOrderByCreatedAtDesc(user.getId());
        }
        return contracts.stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── User: ký hợp đồng ──

    @Transactional
    public ContractResponse signContract(Long contractId) {
        User user = getCurrentUser();
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        if (contract.getStatus() != Contract.Status.WAITING_SIGNATURE) {
            throw new RuntimeException("Hợp đồng không ở trạng thái chờ ký");
        }

        boolean isParty = contract.getClient().getEmail().equals(user.getEmail())
                || contract.getContractor().getEmail().equals(user.getEmail());
        if (!isParty) {
            throw new RuntimeException("Bạn không phải là thành viên hợp đồng này");
        }

        contract.setStatus(Contract.Status.ACTIVE);
        ContractStage stage = ContractStage.builder()
                .contract(contract)
                .stage(Contract.Status.ACTIVE)
                .note("Hợp đồng được ký bởi " + user.getFullName() + ". Tiến hành thi công.")
                .performedBy(user.getFullName())
                .build();
        contract.getStages().add(stage);

        contractRepository.save(contract);
        return toResponse(contract);
    }

    // ── Helpers ────────────────────────────────────────────────────────

    private String buildDefaultTerms(Project project, Bid bid) {
        return String.format(
                "HỢP ĐỒNG THI CÔNG NỘI THẤT\n\n" +
                "Tên công trình: %s\n" +
                "Địa điểm: %s\n" +
                "Giá trị hợp đồng: %,d VNĐ\n" +
                "Thời gian thực hiện: %d ngày\n\n" +
                "ĐIỀU KHOẢN CHUNG:\n" +
                "1. Bên B cam kết thi công đúng tiến độ và chất lượng đã báo giá.\n" +
                "2. Bên A thanh toán theo các mốc milestone đã thống nhất.\n" +
                "3. Mọi thay đổi phát sinh phải được hai bên đồng ý bằng văn bản.\n" +
                "4. Bảo hành công trình tối thiểu 12 tháng kể từ ngày nghiệm thu.\n" +
                "5. Tranh chấp (nếu có) sẽ được giải quyết qua cơ chế hòa giải của ConstructX.",
                project.getName(),
                project.getAddress() != null ? project.getAddress() : "Theo thỏa thuận",
                bid.getTotalPrice(),
                bid.getEstimatedDays() != null ? bid.getEstimatedDays() : 0
        );
    }

    private BidResponse mapBidResponse(Bid bid) {
        return BidResponse.builder()
                .id(bid.getId())
                .projectId(bid.getProject().getId())
                .contractorId(bid.getContractor().getId())
                .contractorName(bid.getContractor().getFullName())
                .contractorEmail(bid.getContractor().getEmail())
                .contractorPhone(bid.getContractor().getPhoneNumber())
                .totalPrice(bid.getTotalPrice())
                .estimatedDays(bid.getEstimatedDays())
                .message(bid.getMessage())
                .designImage(bid.getDesignImage())
                .status(bid.getStatus().name())
                .createdAt(bid.getCreatedAt())
                .build();
    }

    private ContractResponse toResponse(Contract c) {
        List<ContractResponse.ContractStageResponse> stages = c.getStages().stream()
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
                .projectId(c.getProject().getId())
                .projectName(c.getProject().getName())
                .bidId(c.getBid().getId())
                .clientId(c.getClient().getId())
                .clientName(c.getClient().getFullName())
                .contractorId(c.getContractor().getId())
                .contractorName(c.getContractor().getFullName())
                .contractorPhone(c.getContractor().getPhoneNumber())
                .agreedPrice(c.getAgreedPrice())
                .estimatedDays(c.getEstimatedDays())
                .terms(c.getTerms())
                .adminNote(c.getAdminNote())
                .status(c.getStatus().name())
                .createdAt(c.getCreatedAt())
                .approvedAt(c.getApprovedAt())
                .stages(stages)
                .build();
    }
}
