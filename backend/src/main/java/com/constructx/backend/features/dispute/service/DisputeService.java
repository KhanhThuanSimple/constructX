package com.constructx.backend.features.dispute.service;

import com.constructx.backend.admin.entity.Dispute;
import com.constructx.backend.admin.repository.DisputeRepository;
import com.constructx.backend.features.chat.dto.ChatRoomResponse;
import com.constructx.backend.features.chat.dto.CreateChatRoomRequest;
import com.constructx.backend.features.chat.enums.RoomType;
import com.constructx.backend.features.chat.service.ChatService;
import com.constructx.backend.features.constructor.entity.Contract;
import com.constructx.backend.features.constructor.repository.ContractRepository;
import com.constructx.backend.features.dispute.dto.CreateDisputeRequest;
import com.constructx.backend.features.dispute.dto.CreateDisputeResponse;
import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.user.repository.UserRepository;
import com.constructx.backend.features.notification.entity.Notification;
import com.constructx.backend.features.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DisputeService {

    private final DisputeRepository disputeRepository;
    private final ContractRepository contractRepository;
    private final UserRepository userRepository;
    private final ChatService chatService;
    private final NotificationService notificationService;

    @Transactional
    public CreateDisputeResponse initiateDispute(CreateDisputeRequest request, Authentication authentication) {
        String email = authentication.getName();
        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin tài khoản"));

        Contract contract = contractRepository.findById(request.getContractJobId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hợp đồng"));

        if (contract.getStatus() != Contract.Status.ACTIVE) {
            throw new RuntimeException("Chỉ có thể khiếu nại các hợp đồng đang hoạt động (ACTIVE)");
        }

        if (Boolean.TRUE.equals(contract.getIsDisputed())) {
            throw new RuntimeException("Hợp đồng này đã và đang ở trong trạng thái tranh chấp");
        }

        // 1. Đóng băng hợp đồng (isDisputed = true)
        contract.setIsDisputed(true);
        contractRepository.save(contract);

        // 2. Tính toán số tiền tranh chấp (nếu không truyền, mặc định lấy toàn bộ giá trị hợp đồng)
        Long disputeAmount = request.getAmount() != null ? request.getAmount() : contract.getAgreedPrice();

        // 3. Tạo bản ghi Dispute (PENDING)
        Dispute dispute = Dispute.builder()
                .contract(contract)
                .project(contract.getProject())
                .customer(contract.getClient())
                .contractor(contract.getContractor())
                .reason(request.getReason())
                .amount(disputeAmount)
                .status(Dispute.Status.PENDING)
                .build();
        dispute = disputeRepository.save(dispute);

        // 4. Khởi tạo phòng chat tranh chấp 3 bên
        List<Long> memberIds = new ArrayList<>();
        memberIds.add(contract.getClient().getId());
        memberIds.add(contract.getContractor().getId());

        // Thêm Admin đầu tiên đang active vào phòng chat
        List<User> admins = userRepository.findByRole(User.Role.ADMIN);
        admins.stream()
                .filter(User::isActive)
                .findFirst()
                .ifPresent(admin -> memberIds.add(admin.getId()));

        CreateChatRoomRequest chatRoomRequest = new CreateChatRoomRequest();
        chatRoomRequest.setRoomType(RoomType.DISPUTE);
        chatRoomRequest.setTitle("⚖️ Tranh chấp HĐ #" + contract.getContractNumber());
        chatRoomRequest.setReferenceType("CONTRACT");
        chatRoomRequest.setReferenceId(contract.getId());
        chatRoomRequest.setMemberIds(memberIds);

        ChatRoomResponse chatRoom = chatService.createChatRoom(chatRoomRequest, requester.getId());

        // Gán chatRoomId vào Dispute entity
        dispute.setChatRoomId(chatRoom.getId());
        disputeRepository.save(dispute);

        // 5. Gửi thông báo đẩy thời gian thực
        String notifMsg = String.format("⚠️ Khởi tạo tranh chấp: Hợp đồng %s đã bị đóng băng thi công và thanh toán. Lý do: %s.",
                contract.getContractNumber(), request.getReason());
        String disputeUrl = "/contracts/" + contract.getId() + "/dispute";
        notificationService.createNotification(contract.getClient(), Notification.NotifType.DISPUTE, notifMsg, disputeUrl);
        notificationService.createNotification(contract.getContractor(), Notification.NotifType.DISPUTE, notifMsg, disputeUrl);
        notificationService.createNotificationForAdmins(Notification.NotifType.DISPUTE,
                "⚖️ [Hệ Thống] Tranh chấp mới được mở cho hợp đồng " + contract.getContractNumber() +
                ". Nhà thầu: " + contract.getContractor().getFullName(),
                "/admin/disputes");

        log.info("Dispute initiated successfully for contract {}. Dispute ID: {}, Chat Room ID: {}", 
                contract.getId(), dispute.getId(), chatRoom.getId());

        return CreateDisputeResponse.builder()
                .disputeId(dispute.getId())
                .chatRoomId(chatRoom.getId())
                .chatRoomTitle(chatRoom.getTitle())
                .message("Tranh chấp đã được ghi nhận thành công. Hợp đồng đã bị đóng băng và phòng giải quyết tranh chấp 3 bên đã được tạo.")
                .build();
    }
}
