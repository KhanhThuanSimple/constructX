package com.constructx.backend.features.portfolio.service;

import com.constructx.backend.features.portfolio.dto.PortfolioItemRequest;
import com.constructx.backend.features.portfolio.dto.PortfolioItemResponse;
import com.constructx.backend.features.portfolio.entity.PortfolioItem;
import com.constructx.backend.features.portfolio.repository.PortfolioItemRepository;
import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PortfolioService {

    private final PortfolioItemRepository portfolioItemRepository;
    private final UserRepository userRepository;

    public List<PortfolioItemResponse> getMyPortfolio() {
        User me = getCurrentUser();
        return portfolioItemRepository.findByContractorIdOrderByCreatedAtDesc(me.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<PortfolioItemResponse> getPortfolioByContractorId(Long contractorId) {
        return portfolioItemRepository.findByContractorIdOrderByCreatedAtDesc(contractorId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public PortfolioItemResponse addItem(PortfolioItemRequest request) {
        User me = getCurrentUser();
        if (me.getRole() != User.Role.CONTRACTOR) {
            throw new RuntimeException("Chỉ nhà thầu mới có thể thêm công trình");
        }
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new RuntimeException("Tiêu đề không được để trống");
        }
        PortfolioItem item = PortfolioItem.builder()
                .contractor(me)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .imageUrl(request.getImageUrl())
                .projectValue(request.getProjectValue())
                .completionYear(request.getCompletionYear())
                .clientName(request.getClientName())
                .location(request.getLocation())
                .build();
        return toResponse(portfolioItemRepository.save(item));
    }

    @Transactional
    public PortfolioItemResponse updateItem(Long itemId, PortfolioItemRequest request) {
        User me = getCurrentUser();
        PortfolioItem item = portfolioItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Công trình không tồn tại"));
        if (!item.getContractor().getId().equals(me.getId())) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa công trình này");
        }
        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setCategory(request.getCategory());
        item.setImageUrl(request.getImageUrl());
        item.setProjectValue(request.getProjectValue());
        item.setCompletionYear(request.getCompletionYear());
        item.setClientName(request.getClientName());
        item.setLocation(request.getLocation());
        return toResponse(portfolioItemRepository.save(item));
    }

    @Transactional
    public void deleteItem(Long itemId) {
        User me = getCurrentUser();
        PortfolioItem item = portfolioItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Công trình không tồn tại"));
        if (!item.getContractor().getId().equals(me.getId())) {
            throw new RuntimeException("Bạn không có quyền xóa công trình này");
        }
        portfolioItemRepository.delete(item);
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private PortfolioItemResponse toResponse(PortfolioItem item) {
        return PortfolioItemResponse.builder()
                .id(item.getId())
                .contractorId(item.getContractor().getId())
                .contractorName(item.getContractor().getFullName())
                .title(item.getTitle())
                .description(item.getDescription())
                .category(item.getCategory())
                .imageUrl(item.getImageUrl())
                .projectValue(item.getProjectValue())
                .completionYear(item.getCompletionYear())
                .clientName(item.getClientName())
                .location(item.getLocation())
                .createdAt(item.getCreatedAt())
                .build();
    }
}
