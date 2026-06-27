package com.constructx.backend.admin.service;

import com.constructx.backend.admin.dto.request.DisputeResolutionRequest;
import com.constructx.backend.admin.dto.response.DisputeMessageResponse;
import com.constructx.backend.admin.dto.response.DisputeResponse;
import com.constructx.backend.admin.entity.Dispute;
import com.constructx.backend.admin.entity.DisputeMessage;
import com.constructx.backend.admin.repository.DisputeMessageRepository;
import com.constructx.backend.admin.repository.DisputeRepository;
import com.constructx.backend.features.user.repository.UserRepository;

import com.constructx.backend.features.wallet.service.WalletArbitrationManager;
import com.constructx.backend.features.wallet.entity.Transaction;
import com.constructx.backend.features.wallet.repository.TransactionRepository;
import com.constructx.backend.features.constructor.entity.Contract;
import com.constructx.backend.features.constructor.repository.ContractRepository;
import com.constructx.backend.features.chat.entity.ChatMessage;
import com.constructx.backend.features.chat.service.GrokChatbotService;
import com.constructx.backend.features.chat.repository.ChatMessageRepository;
import com.constructx.backend.features.chat.service.ChatService;
import com.constructx.backend.features.chat.dto.SendMessageRequest;
import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.notification.entity.Notification;
import com.constructx.backend.features.notification.service.NotificationService;
import com.constructx.backend.features.constructor.repository.DisbursementRequestRepository;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminDisputeService {

    private final DisputeRepository disputeRepository;
    private final ContractRepository contractRepository;
    private final DisputeMessageRepository messageRepository;
    private final UserRepository userRepository;

    private final WalletArbitrationManager walletArbitrationManager;
    private final TransactionRepository transactionRepository;
    private final GrokChatbotService grokChatbotService;
    private final ChatMessageRepository chatMessageRepository;
    private final NotificationService notificationService;
    private final ChatService chatService;
    private final DisbursementRequestRepository disbursementRequestRepository;

    @Transactional(readOnly = true)
    public List<DisputeResponse> getAllDisputes() {
        return disputeRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public DisputeResponse resolveDispute(Long id, DisputeResolutionRequest request) {
        Dispute dispute = disputeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tranh chấp"));
        if (dispute.getStatus() == Dispute.Status.RESOLVED) {
            throw new RuntimeException("Tranh chấp đã được giải quyết");
        }


        // --- BƯỚC THỰC THI DÒNG TIỀN ESCROW ---
        try {
            // 1. Xác định tỷ lệ phân chia dựa trên yêu cầu
            double userPercent = 0.0;
            double contractorPercent = 0.0;

            if (request.getCustomerPercent() != null && request.getContractorPercent() != null) {
                userPercent = request.getCustomerPercent();
                contractorPercent = request.getContractorPercent();
            } else if ("refund_customer".equalsIgnoreCase(request.getResolutionType())) {
                userPercent = 100.0;
                contractorPercent = 0.0;
            } else if ("keep_contractor".equalsIgnoreCase(request.getResolutionType())) {
                userPercent = 0.0;
                contractorPercent = 100.0;
            } else if ("split".equalsIgnoreCase(request.getResolutionType())) {
                userPercent = 50.0;
                contractorPercent = 50.0;
            } else {
                throw new IllegalArgumentException("Loại quyết định không hợp lệ. Vui lòng chọn tỷ lệ phân bổ.");
            }

            if (userPercent + contractorPercent != 100.0) {
                throw new IllegalArgumentException("Tổng tỷ lệ phân chia của Khách hàng và Nhà thầu phải bằng 100%");
            }

            // 2. Xác định hợp đồng liên quan đến tranh chấp
            Contract contract = dispute.getContract();
            if (contract == null) {
                if (dispute.getProject() != null) {
                    contract = contractRepository.findByProjectId(dispute.getProject().getId())
                            .orElseThrow(() -> new RuntimeException("Không tìm thấy hợp đồng liên quan đến dự án này"));
                } else {
                    throw new RuntimeException("Không tìm thấy hợp đồng liên quan đến tranh chấp này");
                }
            }

            // 3. Tìm giao dịch đóng băng tiền ký quỹ gốc (Customer lock)
            Transaction lockTx = null;
            String disputeCode = "";

            if (contract.getProject() != null) {
                Long projectId = contract.getProject().getId();
                Long bidId = contract.getBid().getId();
                String key1 = "LOCK-CTR-ESCROW-" + projectId + "-" + bidId;
                String key2 = "CTR-ESCROW-" + projectId + "-" + bidId;
                lockTx = transactionRepository.findByGatewayOrderId(key1)
                        .orElseGet(() -> transactionRepository.findByGatewayOrderId(key2).orElse(null));
                disputeCode = "PRJ-" + projectId;
            } else if (contract.getSourceOrder() != null) {
                String orderCode = contract.getSourceOrder().getOrderCode();
                String key1 = "LOCK-" + orderCode + "-DEPOSIT";
                String key2 = "LOCK-" + orderCode;
                String key3 = orderCode + "-DEPOSIT";
                lockTx = transactionRepository.findByGatewayOrderId(key1)
                        .orElseGet(() -> transactionRepository.findByGatewayOrderId(key2)
                        .orElseGet(() -> transactionRepository.findByGatewayOrderId(key3).orElse(null)));
                disputeCode = orderCode.startsWith("ORD-") ? orderCode : "ORD-" + orderCode;
            }

            if (lockTx == null) {
                throw new RuntimeException("Không tìm thấy giao dịch đóng băng tiền ký quỹ gốc cho hợp đồng này");
            }

            // 3b. Tính toán các thành phần của Quỹ Tranh Chấp Thực Tế (D_pool)
            long totalDisbursed = disbursementRequestRepository.sumApprovedByContractId(contract.getId());
            long customerRemainingEscrow = contract.getAgreedPrice() - totalDisbursed;
            long contractorLockedEscrow = disbursementRequestRepository.sumLockedAndNotUnlockedByContractId(contract.getId());
            long disputePool = customerRemainingEscrow + contractorLockedEscrow;

            // 4. Gọi WalletArbitrationManager để thực hiện giải phóng và phân chia tiền trên ví điện tử thực tế
            walletArbitrationManager.resolveProjectDispute(
                    lockTx.getId(), 
                    dispute.getContractor().getId(), 
                    userPercent, 
                    contractorPercent, 
                    disputeCode,
                    customerRemainingEscrow,
                    contractorLockedEscrow
            );

            // 5. Cập nhật số tiền hoàn trả lưu vào thực thể Dispute để thống kê
            long refundAmount = (long) (disputePool * (userPercent / 100.0));
            dispute.setRefundAmount(refundAmount);

            // 6. Cập nhật trạng thái Hợp đồng tương ứng
            if ("keep_contractor".equalsIgnoreCase(request.getResolutionType()) || contractorPercent == 100.0) {
                // Nếu nhà thầu nhận 100% (giữ tiền cho nhà thầu), dự án tiếp tục hoạt động
                contract.setStatus(Contract.Status.ACTIVE);
            } else {
                // Nếu hoàn tiền hoặc chia đôi, dự án dừng lại
                contract.setStatus(Contract.Status.CANCELLED);
            }
            contract.setIsDisputed(false); // Gỡ cờ đóng băng hợp đồng
            contractRepository.save(contract);

            // 7. Gửi thông báo kết quả cho hai bên
            String resolutionMsg = String.format("⚖️ Kết quả phân xử tranh chấp HĐ %s: Khách hàng nhận lại %s%% (%s), Nhà thầu nhận %s%% (%s). Quyết định: %s.",
                    contract.getContractNumber(), 
                    userPercent, 
                    formatVnd(refundAmount), 
                    contractorPercent, 
                    formatVnd(disputePool - refundAmount),
                    request.getResolution());
            notificationService.createNotification(dispute.getCustomer(), Notification.NotifType.DISPUTE, resolutionMsg);
            notificationService.createNotification(dispute.getContractor(), Notification.NotifType.DISPUTE, resolutionMsg);

        } catch (Exception e) {
            log.error("Lỗi khi phân xử dòng tiền ví tranh chấp", e);
            throw new RuntimeException("Lỗi hệ thống khi phân xử dòng tiền ví: " + e.getMessage(), e);
        }

        dispute.setStatus(Dispute.Status.RESOLVED);
        dispute.setResolution(request.getResolution());
        dispute.setResolutionType(request.getResolutionType());
        dispute.setRefundAmount(request.getRefundAmount());
        Dispute resolved = disputeRepository.save(dispute);
        return toResponse(resolved);
    }

    @Transactional
    public DisputeResponse addDisputeMessage(Long disputeId, String content) {
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tranh chấp"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (dispute.getChatRoomId() != null) {
            com.constructx.backend.features.chat.dto.SendMessageRequest request = com.constructx.backend.features.chat.dto.SendMessageRequest.builder()
                    .roomId(dispute.getChatRoomId())
                    .messageType(com.constructx.backend.features.chat.enums.MessageType.TEXT)
                    .content(content)
                    .build();
            chatService.sendMessage(request, user.getId());
        } else {
            DisputeMessage message = DisputeMessage.builder()
                    .dispute(dispute)
                    .author(user.getFullName())
                    .content(content)
                    .build();
            messageRepository.save(message);
        }

        return toResponse(dispute);
    }

    private DisputeResponse toResponse(Dispute dispute) {
        List<DisputeMessageResponse> messages;
        if (dispute.getChatRoomId() != null) {
            messages = chatMessageRepository.findByRoomIdOrderByCreatedAtAsc(dispute.getChatRoomId())
                    .stream()
                    .map(this::toMessageResponseFromChat)
                    .collect(Collectors.toList());
        } else {
            messages = messageRepository.findByDisputeIdOrderByCreatedAtAsc(dispute.getId())
                    .stream()
                    .map(this::toMessageResponse)
                    .collect(Collectors.toList());
        }

        Long projectId = null;
        String projectName = "Đơn hàng tùy chỉnh";
        try {
            if (dispute.getProject() != null) {
                projectId = dispute.getProject().getId();
                projectName = dispute.getProject().getName();
            }
        } catch (Exception e) {
            log.warn("Failed to load project for dispute {}: {}", dispute.getId(), e.getMessage());
        }

        Long contractId = null;
        String contractNumber = null;
        try {
            if (dispute.getContract() != null) {
                contractId = dispute.getContract().getId();
                contractNumber = dispute.getContract().getContractNumber();
            }
        } catch (Exception e) {
            log.warn("Failed to load contract for dispute {}: {}", dispute.getId(), e.getMessage());
        }

        String customerName = "N/A";
        try {
            if (dispute.getCustomer() != null) {
                customerName = dispute.getCustomer().getFullName();
            }
        } catch (Exception e) {
            log.warn("Failed to load customer for dispute {}: {}", dispute.getId(), e.getMessage());
        }

        String contractorName = "N/A";
        try {
            if (dispute.getContractor() != null) {
                contractorName = dispute.getContractor().getFullName();
            }
        } catch (Exception e) {
            log.warn("Failed to load contractor for dispute {}: {}", dispute.getId(), e.getMessage());
        }

        // Tính toán các thành phần tài chính thực tế cho Response DTO
        long totalDisbursedResponse = 0L;
        long customerRemainingEscrowResponse = 0L;
        long contractorLockedEscrowResponse = 0L;
        long disputePoolResponse = dispute.getAmount() != null ? dispute.getAmount() : 0L;
        
        try {
            if (dispute.getContract() != null) {
                Long cId = dispute.getContract().getId();
                totalDisbursedResponse = disbursementRequestRepository.sumApprovedByContractId(cId);
                customerRemainingEscrowResponse = dispute.getContract().getAgreedPrice() - totalDisbursedResponse;
                contractorLockedEscrowResponse = disbursementRequestRepository.sumLockedAndNotUnlockedByContractId(cId);
                disputePoolResponse = customerRemainingEscrowResponse + contractorLockedEscrowResponse;
            }
        } catch (Exception e) {
            log.warn("Lỗi khi tính toán phân rã tài chính cho Dispute Response: {}", e.getMessage());
        }

        return DisputeResponse.builder()
                .id(dispute.getId())
                .projectId(projectId)
                .projectName(projectName)
                .contractId(contractId)
                .contractNumber(contractNumber)
                .customerName(customerName)
                .contractorName(contractorName)
                .reason(dispute.getReason())
                .amount(dispute.getAmount())
                .status(dispute.getStatus().name())
                .resolution(dispute.getResolution())
                .resolutionType(dispute.getResolutionType())
                .refundAmount(dispute.getRefundAmount())
                .createdAt(dispute.getCreatedAt())
                .messages(messages)
                .customerRemainingEscrow(customerRemainingEscrowResponse)
                .contractorLockedEscrow(contractorLockedEscrowResponse)
                .disputePool(disputePoolResponse)
                .isDisputed(dispute.getContract() != null ? dispute.getContract().getIsDisputed() : false)
                .build();
    }

    private String formatVnd(long amount) {
        return java.text.NumberFormat.getNumberInstance(new java.util.Locale("vi", "VN")).format(amount) + " VND";
    }

    @Transactional
    public DisputeResponse unfreezeContract(Long disputeId) {
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tranh chấp"));
        
        Contract contract = dispute.getContract();
        if (contract == null) {
            throw new RuntimeException("Không tìm thấy hợp đồng liên kết với tranh chấp này");
        }
        
        if (!Boolean.TRUE.equals(contract.getIsDisputed())) {
            throw new RuntimeException("Hợp đồng này hiện không bị phong tỏa");
        }
        
        contract.setIsDisputed(false);
        contractRepository.save(contract);
        
        // Gửi thông báo cho hai bên
        String msg = String.format("🔓 Hợp đồng %s đã được Admin bỏ phong tỏa. Quá trình thi công và các hoạt động khác có thể tiếp tục.", 
                contract.getContractNumber());
        notificationService.createNotification(dispute.getCustomer(), Notification.NotifType.SYSTEM, msg);
        notificationService.createNotification(dispute.getContractor(), Notification.NotifType.SYSTEM, msg);
        
        log.info("Contract {} unfrozen manually by Admin for dispute {}", contract.getId(), disputeId);
        
        return toResponse(dispute);
    }

    private DisputeMessageResponse toMessageResponse(DisputeMessage message) {
        return DisputeMessageResponse.builder()
                .id(message.getId())
                .author(message.getAuthor())
                .content(message.getContent())
                .createdAt(message.getCreatedAt())
                .build();
    }

    private DisputeMessageResponse toMessageResponseFromChat(com.constructx.backend.features.chat.entity.ChatMessage message) {
        String authorName = "Hệ thống";
        if (message.getSenderId() != null) {
            authorName = userRepository.findById(message.getSenderId())
                    .map(u -> {
                        if (u.getRole() == com.constructx.backend.features.user.entity.User.Role.ADMIN) {
                            return "Quản trị viên (" + u.getFullName() + ")";
                        } else if (u.getRole() == com.constructx.backend.features.user.entity.User.Role.CUSTOMER) {
                            return "Khách hàng (Bên A - " + u.getFullName() + ")";
                        } else {
                            return "Nhà thầu (Bên B - " + u.getFullName() + ")";
                        }
                    })
                    .orElse("Thành viên ẩn danh");
        }
        return DisputeMessageResponse.builder()
                .id(message.getId())
                .author(authorName)
                .content(message.getContent())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
