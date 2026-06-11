package com.constructx.backend.features.chat.controller;

import com.constructx.backend.features.chat.dto.ChatMessageResponse;
import com.constructx.backend.features.chat.dto.ChatRoomResponse;
import com.constructx.backend.features.chat.dto.ChatbotRequest;
import com.constructx.backend.features.chat.dto.ChatbotResponse;
import com.constructx.backend.features.chat.dto.CreateChatRoomRequest;
import com.constructx.backend.features.chat.enums.RoomType;
import com.constructx.backend.features.chat.service.ChatService;
import com.constructx.backend.features.chat.service.FileUploadService;
import com.constructx.backend.features.chat.service.GrokChatbotService;
import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatRestController {

    private final ChatService chatService;
    private final FileUploadService fileUploadService;
    private final GrokChatbotService grokChatbotService;
    private final UserRepository userRepository;
    private final com.constructx.backend.features.constructor.repository.ContractJobRepository contractJobRepository;

    @PostMapping("/rooms")
    public ResponseEntity<ChatRoomResponse> createChatRoom(
            @Valid @RequestBody CreateChatRoomRequest request,
            Authentication authentication
    ) {
        Long userId = extractUserId(authentication);
        ChatRoomResponse response = chatService.createChatRoom(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/rooms")
    public ResponseEntity<Page<ChatRoomResponse>> getUserChatRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        Long userId = extractUserId(authentication);
        Page<ChatRoomResponse> rooms = chatService.getUserChatRooms(userId, page, size);
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<Page<ChatMessageResponse>> getChatMessages(
            @PathVariable Long roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Authentication authentication
    ) {
        Long userId = extractUserId(authentication);
        Page<ChatMessageResponse> messages = chatService.getChatMessages(roomId, userId, page, size);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/messages/{roomId}/upload")
    public ResponseEntity<Map<String, Object>> uploadFile(
            @PathVariable Long roomId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {
        try {
            extractUserId(authentication); // validate auth
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }
            String fileUrl = fileUploadService.uploadFile(file);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "fileUrl", fileUrl,
                    "fileName", file.getOriginalFilename(),
                    "fileSize", file.getSize(),
                    "roomId", roomId
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "File upload failed: " + e.getMessage()));
        }
    }

    @GetMapping("/admin/rooms/{roomId}/search")
    public ResponseEntity<Page<ChatMessageResponse>> searchMessages(
            @PathVariable Long roomId,
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Authentication authentication
    ) {
        Long adminId = extractUserId(authentication);
        Page<ChatMessageResponse> messages = chatService.searchMessages(roomId, keyword, adminId, page, size);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/admin/messages/{messageId}/pin")
    public ResponseEntity<Void> pinMessage(
            @PathVariable Long messageId,
            Authentication authentication
    ) {
        Long adminId = extractUserId(authentication);
        chatService.pinMessage(messageId, adminId);
        return ResponseEntity.ok().build();
    }

    /**
     * Admin: Lấy danh sách tất cả phòng chat (monitoring)
     */
    @GetMapping("/admin/rooms")
    public ResponseEntity<Page<ChatRoomResponse>> getAllActiveRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Authentication authentication
    ) {
        Long adminId = extractUserId(authentication);
        Page<ChatRoomResponse> rooms = chatService.getAllActiveRooms(adminId, page, size);
        return ResponseEntity.ok(rooms);
    }

    /**
     * Lấy thành viên trong phòng chat
     */
    @GetMapping("/rooms/{roomId}/members")
    public ResponseEntity<?> getRoomMembers(
            @PathVariable Long roomId,
            Authentication authentication
    ) {
        Long userId = extractUserId(authentication);
        return ResponseEntity.ok(chatService.getRoomMembers(roomId, userId));
    }

    /**
     * AI Chatbot endpoint — Grok hỗ trợ 24/7
     * POST /api/chat/chatbot
     */
    @PostMapping("/chatbot")
    public ResponseEntity<ChatbotResponse> chatWithBot(
            @RequestBody ChatbotRequest request,
            Authentication authentication
    ) {
        extractUserId(authentication); // validate auth
        String reply = grokChatbotService.chat(request.getMessage(), request.getHistory());

        // Detect if escalation to admin is needed
        boolean escalate = reply.toLowerCase().contains("admin") ||
                reply.toLowerCase().contains("liên hệ") ||
                (request.getMessage() != null && request.getMessage().toLowerCase().contains("tranh chấp"));

        return ResponseEntity.ok(ChatbotResponse.builder()
                .reply(reply)
                .escalateToAdmin(escalate)
                .build());
    }

    /**
     * Tạo phòng chat hỗ trợ với Admin (SUPPORT room)
     * POST /api/chat/support
     */
    @PostMapping("/support")
    public ResponseEntity<ChatRoomResponse> createSupportRoom(
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        Long userId = extractUserId(authentication);

        // Find any active admin
        List<User> admins = userRepository.findByRole(User.Role.ADMIN);
        List<Long> memberIds = new ArrayList<>();
        memberIds.add(userId);
        admins.stream()
                .filter(User::isActive)
                .findFirst()
                .ifPresent(a -> memberIds.add(a.getId()));

        String topic = body.getOrDefault("topic", "Hỗ trợ chung");

        CreateChatRoomRequest request = new CreateChatRoomRequest();
        request.setRoomType(RoomType.SUPPORT);
        request.setTitle("Hỗ trợ: " + topic);
        request.setMemberIds(memberIds);

        ChatRoomResponse response = chatService.createChatRoom(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Tạo phòng chat tranh chấp 3 bên: Customer + Contractor + Admin
     * POST /api/chat/dispute/{contractJobId}
     * Tự động load ContractJob để lấy đủ customerId + contractorId + adminId
     */
    @PostMapping("/dispute/{contractJobId}")
    public ResponseEntity<ChatRoomResponse> createDisputeRoom(
            @PathVariable Long contractJobId,
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        Long userId = extractUserId(authentication);
        String reason = body.getOrDefault("reason", "Tranh chấp hợp đồng");

        List<Long> memberIds = new ArrayList<>();

        // Load ContractJob để lấy đủ 3 bên
        if (contractJobId != null && contractJobId > 0) {
            contractJobRepository.findById(contractJobId).ifPresent(job -> {
                // Thêm cả customer và contractor
                memberIds.add(job.getCustomer().getId());
                memberIds.add(job.getContractor().getId());
            });
        }

        // Đảm bảo người gọi có trong danh sách (nếu chưa có)
        if (!memberIds.contains(userId)) {
            memberIds.add(0, userId);
        }

        // Thêm admin đầu tiên đang active
        List<User> admins = userRepository.findByRole(User.Role.ADMIN);
        admins.stream()
              .filter(User::isActive)
              .findFirst()
              .ifPresent(a -> {
                  if (!memberIds.contains(a.getId())) memberIds.add(a.getId());
              });

        // Fallback nếu không tìm thấy ContractJob
        if (memberIds.isEmpty()) memberIds.add(userId);

        CreateChatRoomRequest request = new CreateChatRoomRequest();
        request.setRoomType(RoomType.DISPUTE);
        request.setTitle("⚖️ Tranh chấp: " + reason);
        request.setReferenceType("CONTRACT_JOB");
        request.setReferenceId(contractJobId > 0 ? contractJobId : null);
        request.setMemberIds(memberIds);

        ChatRoomResponse response = chatService.createChatRoom(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Tạo phòng chat giữa Customer và Contractor từ 1 bid cụ thể
     * POST /api/chat/direct
     */
    @PostMapping("/direct")
    public ResponseEntity<ChatRoomResponse> createDirectRoom(
            @RequestBody Map<String, Object> body,
            Authentication authentication
    ) {
        Long userId = extractUserId(authentication);
        Long contractorId = Long.valueOf(body.get("contractorId").toString());
        String title = (String) body.getOrDefault("title", "Trao đổi dự án");
        String refType = (String) body.getOrDefault("referenceType", null);
        Long refId = body.containsKey("referenceId") ?
                Long.valueOf(body.get("referenceId").toString()) : null;

        CreateChatRoomRequest request = new CreateChatRoomRequest();
        request.setRoomType(RoomType.DIRECT);
        request.setTitle(title);
        request.setReferenceType(refType);
        request.setReferenceId(refId);
        request.setMemberIds(List.of(userId, contractorId));

        ChatRoomResponse response = chatService.createChatRoom(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Helper: extract userId — stored in details by JwtFilter, or fall back to User entity
    private Long extractUserId(Authentication authentication) {
        // JwtFilter stores userId as the authentication details
        Object details = authentication.getDetails();
        if (details instanceof Long) return (Long) details;

        // Fallback: principal is UserDetails (User entity which has getId())
        Object principal = authentication.getPrincipal();
        if (principal instanceof com.constructx.backend.features.user.entity.User u) return u.getId();

        // Last resort: should not normally happen
        throw new IllegalStateException("Cannot extract userId from authentication");
    }
}
