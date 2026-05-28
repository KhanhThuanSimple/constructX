package com.constructx.backend.features.constructor.service;

import com.constructx.backend.features.constructor.dto.request.CreateBidRequest;
import com.constructx.backend.features.constructor.dto.BidDetailResponse;
import com.constructx.backend.features.constructor.dto.BidResponse;
import com.constructx.backend.features.constructor.entity.Bid;
import com.constructx.backend.features.constructor.entity.BidDetail;
import com.constructx.backend.features.project.entity.Project;
import com.constructx.backend.features.project.repository.ProjectRepository;
import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.user.repository.UserRepository;
import com.constructx.backend.features.constructor.repository.BidRepository;

import org.springframework.transaction.annotation.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BidService {
    BidRepository bidRepository;
    ProjectRepository projectRepository;
    UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public BidResponse createBid(CreateBidRequest request) {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User contractor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (contractor.getRole() != User.Role.CONTRACTOR) {
            throw new RuntimeException("Only contractor can bid");
        }

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (project.getStatus() != Project.Status.OPEN) {
            throw new RuntimeException("Project is not open");
        }

        boolean exists = bidRepository.existsByProjectAndContractor(project, contractor);

        if (exists) {
            throw new RuntimeException("You already bid this project");
        }

        Bid bid = Bid.builder()
                .project(project)
                .contractor(contractor)
                .estimatedDays(request.getEstimatedDays())
                .message(request.getMessage())
                .designImage(request.getDesignImage())
                .build();

        List<BidDetail> details = request.getDetails()
                .stream()
                .map(d -> {

                    long totalPrice =
                            Math.round(d.getQuantity() * d.getUnitPrice());

                    return BidDetail.builder()
                            .bid(bid)
                            .itemName(d.getItemName())
                            .unit(d.getUnit())
                            .quantity(d.getQuantity())
                            .unitPrice(d.getUnitPrice())
                            .totalPrice(totalPrice)
                            .description(d.getDescription())
                            .sampleImage(d.getSampleImage())
                            .build();
                })
                .toList();
        Long totalBidPrice = details.stream()
                .mapToLong(BidDetail::getTotalPrice)
                .sum();

        bid.setTotalPrice(totalBidPrice);
        bid.setDetails(details);

        bidRepository.save(bid);

        return mapBidResponse(bid);
    }
    @Transactional(readOnly = true)
    public List<BidResponse> getMyBids() {

        User contractor = getCurrentUser();

        return bidRepository.findMyBids(contractor.getId())
                .stream()
                .map(this::mapBidResponse)
                .toList();
    }


    private BidResponse mapBidResponse(Bid bid) {

        List<BidDetailResponse> detailResponses = bid.getDetails()
                .stream()
                .map(detail -> BidDetailResponse.builder()
                        .id(detail.getId())
                        .itemName(detail.getItemName())
                        .unit(detail.getUnit())
                        .quantity(detail.getQuantity())
                        .unitPrice(detail.getUnitPrice())
                        .totalPrice(detail.getTotalPrice())
                        .description(detail.getDescription())
                        .sampleImage(detail.getSampleImage())
                        .build())
                .toList();

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
                .details(detailResponses)
                .build();
    }
}
