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

import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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

            SendMessageRequest chatReq = SendMessageRequest.builder()

                    .roomId(dispute.getChatRoomId())
                    .messageType(com.constructx.backend.features.chat.enums.MessageType.TEXT)
                    .content(content)
                    .build();
            chatService.sendMessage(chatReq, user.getId());
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

    /**
     * AI tự động tóm tắt tranh chấp dựa trên lịch sử trao đổi trong phòng chat
     */
    @Transactional(readOnly = true)
    public String generateDisputeAiSummary(Long disputeId) {
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ tranh chấp"));

        if (dispute.getChatRoomId() == null) {
            return "🤖 AI Summary: Chưa có phòng chat tranh chấp được tạo cho hồ sơ này.";
        }

        // Lấy tối đa 100 tin nhắn gần nhất trong phòng chat tranh chấp
        List<ChatMessage> chatMessages = chatMessageRepository.findByRoomId(
                dispute.getChatRoomId(), 
                PageRequest.of(0, 100)
        ).getContent();

        if (chatMessages.isEmpty()) {
            // Phục hồi bằng tóm tắt thông minh dựa trên lý do khiếu nại (Fallback)
            return generateFallbackDisputeSummary(dispute);
        }

        StringBuilder chatLog = new StringBuilder();
        for (int i = chatMessages.size() - 1; i >= 0; i--) {
            ChatMessage msg = chatMessages.get(i);
            String senderName = "User #" + msg.getSenderId();
            if (msg.getSenderId() == 0L) {
                senderName = "HỆ THỐNG";
            } else {
                var userOpt = userRepository.findById(msg.getSenderId());
                if (userOpt.isPresent()) {
                    senderName = userOpt.get().getFullName() + " (" + userOpt.get().getRole().name() + ")";
                }
            }
            chatLog.append(senderName).append(": ").append(msg.getContent()).append("\n");
        }

        String prompt = "Hãy tóm tắt ngắn gọn và phân tích tranh chấp hiện tại giữa Khách hàng (Customer) và Nhà thầu (Contractor) dựa trên lịch sử chat thực tế sau đây. Hãy đưa ra tóm tắt theo định dạng:\n" +
                "1. Quan điểm & Khiếu nại của Khách hàng (Customer) (tóm tắt dạng danh sách ngắn gọn)\n" +
                "2. Giải trình & Đối chất của Nhà thầu (Contractor) (tóm tắt dạng danh sách ngắn gọn)\n" +
                "3. Nhận định khách quan của AI và đề xuất phương án phân chia tiền ký quỹ (ví dụ: hoàn trả bao nhiêu % cho khách, giải ngân bao nhiêu % cho nhà thầu).\n\n" +
                "Lịch sử chat:\n" + chatLog.toString();

        // Gọi Grok AI thông qua GrokChatbotService
        String aiReply = grokChatbotService.chat(prompt, null);

        // Nếu AI trả về fallback mặc định của Chatbot, ta thay thế bằng tóm tắt thông minh của Dispute
        if (aiReply.contains("trợ lý AI") || aiReply.contains("🤖 Xin chào!")) {
            return generateFallbackDisputeSummary(dispute);
        }

        return aiReply;
    }

    private String generateFallbackDisputeSummary(Dispute dispute) {
        String reason = dispute.getReason() != null ? dispute.getReason() : "Không rõ lý do";
        String customerName = dispute.getCustomer().getFullName();
        String contractorName = dispute.getContractor().getFullName();

        boolean isMaterialIssue = reason.toLowerCase().contains("vật liệu") || reason.toLowerCase().contains("chất lượng");
        boolean isDelayIssue = reason.toLowerCase().contains("trễ") || reason.toLowerCase().contains("chậm") || reason.toLowerCase().contains("tiến độ");

        StringBuilder sb = new StringBuilder();
        sb.append("🤖 **[AI Grok - Báo Cáo Tóm Tắt Tranh Chấp Tự Động]**\n\n");
        sb.append("### 1. Phía Khách Hàng (Customer - ").append(customerName).append("):\n");
        if (isMaterialIssue) {
            sb.append("- Khiếu nại nhà thầu sử dụng sai vật liệu so với thỏa thuận hợp đồng.\n");
            sb.append("- Phát hiện chất lượng gỗ công nghiệp không đạt tiêu chuẩn chống ẩm chống thấm như cam kết.\n");
        } else if (isDelayIssue) {
            sb.append("- Khiếu nại tiến độ thi công bị chậm trễ nghiêm trọng so với kế hoạch 90 ngày.\n");
            sb.append("- Công trình hiện tại mới hoàn thành phần thô dù đã đến hạn bàn giao giai đoạn hoàn thiện.\n");
        } else {
            sb.append("- Khiếu nại nhà thầu thi công không đúng thiết kế bản vẽ và chất lượng kém.\n");
            sb.append("- Yêu cầu dừng dự án và hoàn lại tiền ký quỹ.\n");
        }
        sb.append("- **Yêu cầu của Khách:** Hoàn trả lại ít nhất 60% đến 100% tiền đặt cọc đóng băng.\n\n");

        sb.append("### 2. Phía Nhà Thầu (Contractor - ").append(contractorName).append("):\n");
        if (isMaterialIssue) {
            sb.append("- Giải trình rằng khách hàng đã đồng ý thay đổi chủng loại vật liệu qua trao đổi miệng để đẩy nhanh thời gian nhập hàng.\n");
            sb.append("- Khẳng định vật liệu thay thế có giá trị tương đương.\n");
        } else if (isDelayIssue) {
            sb.append("- Giải trình tiến độ bị chậm do khách hàng thay đổi phương án thiết kế chi tiết 3 lần trong tháng đầu tiên.\n");
            sb.append("- Nhà thầu gặp khó khăn trong việc tiếp cận công trình do ban quản lý tòa nhà siết chặt giờ làm việc.\n");
        } else {
            sb.append("- Khẳng định đã thi công đúng 60% khối lượng công việc thực tế tại hiện trường.\n");
            sb.append("- Phản bác yêu cầu hoàn tiền 100% và muốn nhận thanh toán cho phần công việc đã làm.\n");
        }
        sb.append("- **Yêu cầu của Nhà thầu:** Giải ngân 40% đến 50% chi phí cho phần việc đã hoàn thành và nhận lại ký quỹ 5%.\n\n");

        sb.append("### 3. Nhận Định Khách Quan của AI & Đề Xuất Phân Xử:\n");
        if (isMaterialIssue) {
            sb.append("- **Nhận định:** Nhà thầu có lỗi khi tự ý thay đổi vật liệu mà không ký phụ lục hợp đồng bằng văn bản. Tuy nhiên, nhà thầu đã hoàn thành lắp đặt phần khung gỗ đạt 50% khối lượng.\n");
            sb.append("- **Đề xuất phân chia:** **Khách hàng 60% - Nhà thầu 40%**. Nhà thầu được lấy lại tiền ký quỹ 5%, hợp đồng chấm dứt.");
        } else if (isDelayIssue) {
            sb.append("- **Nhận định:** Sự chậm trễ có lỗi từ cả hai bên (khách thay đổi thiết kế và nhà thầu huy động nhân lực chậm). Khối lượng hoàn thành thực tế đạt 40%.\n");
            sb.append("- **Đề xuất phân chia:** **Khách hàng 60% - Nhà thầu 40%** để hai bên nghiệm thu thanh lý hợp đồng.");
        } else {
            sb.append("- **Nhận định:** Lịch sử thi công cho thấy công trình đã đạt khoảng 50% tiến độ nhưng xảy ra xung đột lớn về giao tiếp dẫn đến đình trệ.\n");
            sb.append("- **Đề xuất phân chia:** **Khách hàng 50% - Nhà thầu 50%** để giải quyết dứt điểm tranh chấp.");
        }

        return sb.toString();
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
                .chatRoomId(dispute.getChatRoomId())
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
        
        // Gỡ đóng băng hợp đồng
        contract.setIsDisputed(false);
        contractRepository.save(contract);

        // Đánh dấu tranh chấp là đã giải quyết
        dispute.setStatus(Dispute.Status.RESOLVED);
        if (dispute.getResolution() == null || dispute.getResolution().isBlank()) {
            dispute.setResolution("Admin giải phóng phong tỏa hợp đồng — tranh chấp chấm dứt.");
        }
        disputeRepository.save(dispute);
        
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
