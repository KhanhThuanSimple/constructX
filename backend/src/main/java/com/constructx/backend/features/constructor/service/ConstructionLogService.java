package com.constructx.backend.features.constructor.service;

import com.constructx.backend.features.constructor.dto.ConstructionLogResponse;
import com.constructx.backend.features.constructor.dto.request.CreateConstructionLogRequest;
import com.constructx.backend.features.constructor.entity.ConstructionLog;
import com.constructx.backend.features.constructor.entity.Contract;
import com.constructx.backend.features.constructor.repository.ConstructionLogRepository;
import com.constructx.backend.features.constructor.repository.ContractRepository;
import com.constructx.backend.features.notification.entity.Notification;
import com.constructx.backend.features.notification.service.NotificationService;
import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.user.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConstructionLogService {

    private final ConstructionLogRepository constructionLogRepository;
    private final ContractRepository contractRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    private User getCurrentUser() {
        return userRepository.findByEmail(
                SecurityContextHolder.getContext().getAuthentication().getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ─── Nhà thầu: tạo nhật ký thi công ────────────────────────────────────

    @Transactional
    public ConstructionLogResponse createLog(CreateConstructionLogRequest req) {
        User contractor = getCurrentUser();
        Contract contract = contractRepository.findById(req.getContractId())
                .orElseThrow(() -> new RuntimeException("Hop dong khong ton tai"));

        if (!contract.getContractor().getId().equals(contractor.getId()))
            throw new RuntimeException("Ban khong phai nha thau cua hop dong nay");
        if (contract.getStatus() != Contract.Status.ACTIVE)
            throw new RuntimeException("Chi cap nhat nhat ky khi hop dong dang ACTIVE");
        if (Boolean.TRUE.equals(contract.getIsDisputed())) {
            throw new RuntimeException("Hợp đồng đang có tranh chấp và bị đóng băng. Không thể cập nhật tiến độ.");
        }

        // Validate tiến độ mới phải >= tiến độ hiện tại
        int currentProgress = constructionLogRepository
                .findMaxProgressByContractId(contract.getId())
                .orElse(0);
        if (req.getProgressPercent() < currentProgress)
            throw new RuntimeException(String.format(
                    "Tien do moi (%d%%) khong the thap hon tien do hien tai (%d%%)",
                    req.getProgressPercent(), currentProgress));

        String imageUrlsJson = serializeUrls(req.getImageUrls());

        ConstructionLog log = ConstructionLog.builder()
                .contract(contract)
                .contractor(contractor)
                .progressPercent(req.getProgressPercent())
                .description(req.getDescription())
                .imageUrls(imageUrlsJson)
                .phaseLabel(req.getPhaseLabel())
                .build();

        ConstructionLog saved = constructionLogRepository.save(log);

        // Thông báo cho khách hàng
        notificationService.createNotification(
                contract.getClient(),
                Notification.NotifType.MILESTONE_REQUEST,
                String.format("Nha thau da cap nhat tien do: %d%% - HD %s. %s",
                        req.getProgressPercent(), contract.getContractNumber(),
                        req.getPhaseLabel() != null ? "[" + req.getPhaseLabel() + "]" : ""));

        return toResponse(saved);
    }

    // ─── Xem nhật ký theo hợp đồng ──────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ConstructionLogResponse> getLogsByContract(Long contractId) {
        User user = getCurrentUser();
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Hop dong khong ton tai"));

        boolean isAdmin = user.getRole() == User.Role.ADMIN;
        boolean isClient = contract.getClient().getId().equals(user.getId());
        boolean isContractor = contract.getContractor().getId().equals(user.getId());
        if (!isAdmin && !isClient && !isContractor)
            throw new RuntimeException("Ban khong co quyen xem nhat ky nay");

        return constructionLogRepository.findByContractIdOrderByCreatedAtDesc(contractId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ─── Lấy tiến độ hiện tại của hợp đồng ─────────────────────────────────

    @Transactional(readOnly = true)
    public int getCurrentProgress(Long contractId) {
        return constructionLogRepository.findMaxProgressByContractId(contractId).orElse(0);
    }

    // ─── Mapping ────────────────────────────────────────────────────────────

    public ConstructionLogResponse toResponse(ConstructionLog log) {
        return ConstructionLogResponse.builder()
                .id(log.getId())
                .contractId(log.getContract().getId())
                .contractNumber(log.getContract().getContractNumber())
                .contractorId(log.getContractor().getId())
                .contractorName(log.getContractor().getFullName())
                .progressPercent(log.getProgressPercent())
                .description(log.getDescription())
                .imageUrls(deserializeUrls(log.getImageUrls()))
                .phaseLabel(log.getPhaseLabel())
                .createdAt(log.getCreatedAt())
                .build();
    }

    private String serializeUrls(List<String> urls) {
        if (urls == null || urls.isEmpty()) return "[]";
        try {
            return objectMapper.writeValueAsString(urls);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    private List<String> deserializeUrls(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            return new ArrayList<>();
        }
    }
}
