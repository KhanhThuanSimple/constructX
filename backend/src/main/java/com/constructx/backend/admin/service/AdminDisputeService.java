package com.constructx.backend.admin.service;

import com.constructx.backend.admin.dto.request.DisputeResolutionRequest;
import com.constructx.backend.admin.dto.response.DisputeMessageResponse;
import com.constructx.backend.admin.dto.response.DisputeResponse;
import com.constructx.backend.admin.entity.Dispute;
import com.constructx.backend.admin.entity.DisputeMessage;
import com.constructx.backend.admin.repository.DisputeMessageRepository;
import com.constructx.backend.admin.repository.DisputeRepository;
import com.constructx.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDisputeService {

    private final DisputeRepository disputeRepository;
    private final DisputeMessageRepository messageRepository;
    private final UserRepository userRepository;

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

        DisputeMessage message = DisputeMessage.builder()
                .dispute(dispute)
                .author(user.getFullName())
                .content(content)
                .build();
        messageRepository.save(message);

        return toResponse(dispute);
    }

    private DisputeResponse toResponse(Dispute dispute) {
        List<DisputeMessageResponse> messages = messageRepository.findByDisputeIdOrderByCreatedAtAsc(dispute.getId())
                .stream()
                .map(this::toMessageResponse)
                .collect(Collectors.toList());

        return DisputeResponse.builder()
                .id(dispute.getId())
                .projectId(dispute.getProject().getId())
                .projectName(dispute.getProject().getName())
                .customerName(dispute.getCustomer().getFullName())
                .contractorName(dispute.getContractor().getFullName())
                .reason(dispute.getReason())
                .amount(dispute.getAmount())
                .status(dispute.getStatus().name())
                .resolution(dispute.getResolution())
                .resolutionType(dispute.getResolutionType())
                .refundAmount(dispute.getRefundAmount())
                .createdAt(dispute.getCreatedAt())
                .messages(messages)
                .build();
    }

    private DisputeMessageResponse toMessageResponse(DisputeMessage message) {
        return DisputeMessageResponse.builder()
                .id(message.getId())
                .author(message.getAuthor())
                .content(message.getContent())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
