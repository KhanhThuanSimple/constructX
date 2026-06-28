package com.constructx.backend.features.review.service;

import com.constructx.backend.features.review.dto.ReviewRequest;
import com.constructx.backend.features.review.dto.ReviewResponse;
import com.constructx.backend.features.review.dto.CompletedItemResponse;
import com.constructx.backend.features.review.entity.Review;
import com.constructx.backend.features.review.repository.ReviewRepository;
import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.user.repository.UserRepository;
import com.constructx.backend.features.constructor.repository.ContractRepository;
import com.constructx.backend.features.project.repository.ProjectRepository;
import com.constructx.backend.features.order.repository.OrderRepository;
import com.constructx.backend.admin.repository.DisputeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ContractRepository contractRepository;
    private final ProjectRepository projectRepository;
    private final OrderRepository orderRepository;
    private final DisputeRepository disputeRepository;

    @Transactional
    public ReviewResponse createReview(ReviewRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User reviewer = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate rating
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new RuntimeException("Điểm đánh giá phải từ 1 đến 5");
        }

        // Kiểm tra đã đánh giá chưa
        if (reviewRepository.existsByReviewerIdAndReferenceTypeAndReferenceId(
                reviewer.getId(), request.getReferenceType(), request.getReferenceId())) {
            throw new RuntimeException("Bạn đã đánh giá đơn hàng/dự án này rồi");
        }

        User reviewee = userRepository.findById(request.getRevieweeId())
                .orElseThrow(() -> new RuntimeException("Người được đánh giá không tồn tại"));

        // Kiểm tra loại tham chiếu để đảm bảo nghiệp vụ đúng và bảo mật
        if ("PROJECT".equalsIgnoreCase(request.getReferenceType())) {
            // Check project
            com.constructx.backend.features.project.entity.Project project = projectRepository.findById(request.getReferenceId())
                    .orElseThrow(() -> new RuntimeException("Dự án không tồn tại"));
            if (!project.getUser().getId().equals(reviewer.getId())) {
                throw new RuntimeException("Bạn không phải chủ sở hữu dự án này");
            }
            // Check contract
            com.constructx.backend.features.constructor.entity.Contract contract = contractRepository.findByProjectId(project.getId())
                    .orElseThrow(() -> new RuntimeException("Dự án chưa có hợp đồng"));
            if (contract.getStatus() != com.constructx.backend.features.constructor.entity.Contract.Status.COMPLETED) {
                throw new RuntimeException("Hợp đồng dự án chưa hoàn thành");
            }
            if (!contract.getContractor().getId().equals(request.getRevieweeId())) {
                throw new RuntimeException("Người được đánh giá không phải nhà thầu của dự án này");
            }
        } else if ("ORDER".equalsIgnoreCase(request.getReferenceType())) {
            // Check order
            com.constructx.backend.features.order.entity.Order order = orderRepository.findById(request.getReferenceId())
                    .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));
            if (!order.getCustomer().getId().equals(reviewer.getId())) {
                throw new RuntimeException("Bạn không phải chủ sở hữu đơn hàng này");
            }
            if (order.getAssignedContractor() == null || !order.getAssignedContractor().getId().equals(request.getRevieweeId())) {
                throw new RuntimeException("Người được đánh giá không phải nhà thầu của đơn hàng này");
            }
        }

        Review review = Review.builder()
                .reviewer(reviewer)
                .reviewee(reviewee)
                .referenceType(request.getReferenceType())
                .referenceId(request.getReferenceId())
                .rating(request.getRating())
                .qualityScore(request.getQualityScore() != null ? request.getQualityScore() : request.getRating())
                .communicationScore(request.getCommunicationScore() != null ? request.getCommunicationScore() : request.getRating())
                .progressScore(request.getProgressScore() != null ? request.getProgressScore() : request.getRating())
                .comment(request.getComment())
                .build();

        return toResponse(reviewRepository.save(review));
    }

    public List<ReviewResponse> getReviewsForUser(Long userId) {
        return reviewRepository.findByRevieweeIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Map<String, Object> getUserRatingSummary(Long userId) {
        List<Review> reviews = reviewRepository.findByRevieweeIdOrderByCreatedAtDesc(userId);
        double avgRating = 0;
        double avgQuality = 0;
        double avgCommunication = 0;
        double avgProgress = 0;
        long totalReviews = reviews.size();

        if (totalReviews > 0) {
            double sumRating = 0;
            double sumQuality = 0;
            double sumCommunication = 0;
            double sumProgress = 0;
            long countQuality = 0;
            long countCommunication = 0;
            long countProgress = 0;

            for (Review r : reviews) {
                sumRating += r.getRating();
                if (r.getQualityScore() != null) {
                    sumQuality += r.getQualityScore();
                    countQuality++;
                }
                if (r.getCommunicationScore() != null) {
                    sumCommunication += r.getCommunicationScore();
                    countCommunication++;
                }
                if (r.getProgressScore() != null) {
                    sumProgress += r.getProgressScore();
                    countProgress++;
                }
            }

            avgRating = sumRating / totalReviews;
            avgQuality = countQuality > 0 ? sumQuality / countQuality : avgRating;
            avgCommunication = countCommunication > 0 ? sumCommunication / countCommunication : avgRating;
            avgProgress = countProgress > 0 ? sumProgress / countProgress : avgRating;
        }

        // Fetch contractor-specific stats
        List<com.constructx.backend.features.constructor.entity.Contract> contracts = 
                contractRepository.findByContractorIdOrderByCreatedAtDesc(userId);
        
        long totalContracts = contracts.size();
        long completedContracts = contracts.stream()
                .filter(c -> c.getStatus() == com.constructx.backend.features.constructor.entity.Contract.Status.COMPLETED)
                .count();
        long cancelledContracts = contracts.stream()
                .filter(c -> c.getStatus() == com.constructx.backend.features.constructor.entity.Contract.Status.CANCELLED)
                .count();
        
        long totalDisputes = disputeRepository.countByContractorId(userId);
        long pendingDisputes = disputeRepository.countByContractorIdAndStatus(userId, com.constructx.backend.admin.entity.Dispute.Status.PENDING);
        long resolvedDisputes = totalDisputes - pendingDisputes;

        double completionRate = totalContracts > 0 ? ((double) completedContracts / totalContracts) * 100.0 : 100.0;
        double disputeRate = totalContracts > 0 ? ((double) totalDisputes / totalContracts) * 100.0 : 0.0;

        long totalProjectValue = contracts.stream()
                .filter(c -> c.getStatus() == com.constructx.backend.features.constructor.entity.Contract.Status.ACTIVE || 
                             c.getStatus() == com.constructx.backend.features.constructor.entity.Contract.Status.COMPLETED)
                .mapToLong(c -> c.getAgreedPrice() != null ? c.getAgreedPrice() : 0L)
                .sum();

        long earnedRevenue = contracts.stream()
                .filter(c -> c.getStatus() == com.constructx.backend.features.constructor.entity.Contract.Status.COMPLETED)
                .mapToLong(c -> c.getAgreedPrice() != null ? c.getAgreedPrice() : 0L)
                .sum();

        // Calculate AI Trust Score
        double trustRating = totalReviews > 0 ? avgRating : 5.0;
        double ratingPart = trustRating * 20.0 * 0.4;
        double completionPart = completionRate * 0.3;
        double disputeDeduction = disputeRate * 20.0 * 0.2;
        double responseFactor = 1.0;
        double responsePart = responseFactor * 10.0;
        double baseScore = 20.0;

        double trustScoreRaw = ratingPart + completionPart - disputeDeduction + responsePart + baseScore;
        int aiTrustScore = (int) Math.max(0.0, Math.min(100.0, Math.round(trustScoreRaw)));
        boolean isVerified = aiTrustScore >= 85;

        return Map.ofEntries(
                Map.entry("averageRating", Math.round(avgRating * 10.0) / 10.0),
                Map.entry("totalReviews", totalReviews),
                Map.entry("qualityScore", Math.round(avgQuality * 10.0) / 10.0),
                Map.entry("communicationScore", Math.round(avgCommunication * 10.0) / 10.0),
                Map.entry("progressScore", Math.round(avgProgress * 10.0) / 10.0),
                Map.entry("totalContracts", totalContracts),
                Map.entry("completedContracts", completedContracts),
                Map.entry("cancelledContracts", cancelledContracts),
                Map.entry("totalDisputes", totalDisputes),
                Map.entry("pendingDisputes", pendingDisputes),
                Map.entry("resolvedDisputes", resolvedDisputes),
                Map.entry("completionRate", Math.round(completionRate * 10.0) / 10.0),
                Map.entry("disputeRate", Math.round(disputeRate * 10.0) / 10.0),
                Map.entry("totalProjectValue", totalProjectValue),
                Map.entry("earnedRevenue", earnedRevenue),
                Map.entry("aiTrustScore", aiTrustScore),
                Map.entry("isVerified", isVerified)
        );
    }

    /** Kiểm tra current user đã review reference này chưa */
    public boolean hasReviewed(String referenceType, Long referenceId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User reviewer = userRepository.findByEmail(auth.getName()).orElse(null);
        if (reviewer == null) return false;
        return reviewRepository.existsByReviewerIdAndReferenceTypeAndReferenceId(
                reviewer.getId(), referenceType, referenceId);
    }

    private ReviewResponse toResponse(Review r) {
        return ReviewResponse.builder()
                .id(r.getId())
                .reviewerId(r.getReviewer().getId())
                .reviewerName(r.getReviewer().getFullName())
                .reviewerAvatar(r.getReviewer().getAvatarUrl())
                .revieweeId(r.getReviewee().getId())
                .revieweeName(r.getReviewee().getFullName())
                .referenceType(r.getReferenceType())
                .referenceId(r.getReferenceId())
                .rating(r.getRating())
                .comment(r.getComment())
                .qualityScore(r.getQualityScore())
                .communicationScore(r.getCommunicationScore())
                .progressScore(r.getProgressScore())
                .createdAt(r.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<CompletedItemResponse> getCompletedItemsForCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<CompletedItemResponse> completedItems = new ArrayList<>();

        if (currentUser.getRole() == User.Role.CUSTOMER) {
            // 1. Projects: Completed contracts where client is current user and project is not null
            List<com.constructx.backend.features.constructor.entity.Contract> completedContracts = 
                    contractRepository.findByClientIdOrderByCreatedAtDesc(currentUser.getId()).stream()
                    .filter(c -> c.getStatus() == com.constructx.backend.features.constructor.entity.Contract.Status.COMPLETED && c.getProject() != null)
                    .toList();

            for (com.constructx.backend.features.constructor.entity.Contract c : completedContracts) {
                completedItems.add(buildCompletedItemFromContract(c, currentUser, true));
            }

            // 2. Orders: Delivered orders where customer is current user
            List<com.constructx.backend.features.order.entity.Order> deliveredOrders = 
                    orderRepository.findByCustomerIdWithItems(currentUser.getId()).stream()
                    .filter(o -> o.getStatus() == com.constructx.backend.features.order.entity.Order.Status.DELIVERED)
                    .toList();

            for (com.constructx.backend.features.order.entity.Order o : deliveredOrders) {
                completedItems.add(buildCompletedItemFromOrder(o, currentUser, true));
            }

        } else if (currentUser.getRole() == User.Role.CONTRACTOR) {
            // 1. Projects: Completed contracts where contractor is current user
            List<com.constructx.backend.features.constructor.entity.Contract> completedContracts = 
                    contractRepository.findByContractorIdOrderByCreatedAtDesc(currentUser.getId()).stream()
                    .filter(c -> c.getStatus() == com.constructx.backend.features.constructor.entity.Contract.Status.COMPLETED && c.getProject() != null)
                    .toList();

            for (com.constructx.backend.features.constructor.entity.Contract c : completedContracts) {
                completedItems.add(buildCompletedItemFromContract(c, currentUser, false));
            }

            // 2. Orders: Delivered orders where contractor is current user
            List<com.constructx.backend.features.order.entity.Order> deliveredOrders = 
                    orderRepository.findByAssignedContractorId(currentUser.getId()).stream()
                    .filter(o -> o.getStatus() == com.constructx.backend.features.order.entity.Order.Status.DELIVERED)
                    .toList();

            for (com.constructx.backend.features.order.entity.Order o : deliveredOrders) {
                completedItems.add(buildCompletedItemFromOrder(o, currentUser, false));
            }
        }

        // Sort items by completedAt desc
        completedItems.sort((a, b) -> {
            if (a.getCompletedAt() == null && b.getCompletedAt() == null) return 0;
            if (a.getCompletedAt() == null) return 1;
            if (b.getCompletedAt() == null) return -1;
            return b.getCompletedAt().compareTo(a.getCompletedAt());
        });

        return completedItems;
    }

    private CompletedItemResponse buildCompletedItemFromContract(
            com.constructx.backend.features.constructor.entity.Contract c, User currentUser, boolean isCustomer) {
        String refType = "PROJECT";
        Long refId = c.getProject().getId();
        
        Long reviewerId = isCustomer ? currentUser.getId() : (c.getClient() != null ? c.getClient().getId() : null);
        Optional<Review> reviewOpt = reviewerId != null 
                ? reviewRepository.findByReviewerIdAndReferenceTypeAndReferenceId(reviewerId, refType, refId)
                : Optional.empty();

        User partner = isCustomer ? c.getContractor() : c.getClient();

        return CompletedItemResponse.builder()
                .referenceType(refType)
                .referenceId(refId)
                .name(c.getProject().getName())
                .price(c.getAgreedPrice())
                .completedAt(c.getCompletedAt())
                .partnerId(partner != null ? partner.getId() : null)
                .partnerName(partner != null ? partner.getFullName() : "Không rõ")
                .hasReviewed(reviewOpt.isPresent())
                .review(reviewOpt.map(this::toResponse).orElse(null))
                .build();
    }

    private CompletedItemResponse buildCompletedItemFromOrder(
            com.constructx.backend.features.order.entity.Order o, User currentUser, boolean isCustomer) {
        String refType = "ORDER";
        Long refId = o.getId();

        Long reviewerId = isCustomer ? currentUser.getId() : (o.getCustomer() != null ? o.getCustomer().getId() : null);
        Optional<Review> reviewOpt = reviewerId != null 
                ? reviewRepository.findByReviewerIdAndReferenceTypeAndReferenceId(reviewerId, refType, refId)
                : Optional.empty();

        User partner = isCustomer ? o.getAssignedContractor() : o.getCustomer();

        return CompletedItemResponse.builder()
                .referenceType(refType)
                .referenceId(refId)
                .name(o.getOrderCode())
                .price(o.getTotalAmount() != null ? o.getTotalAmount().longValue() : 0L)
                .completedAt(o.getDeliveredAt())
                .partnerId(partner != null ? partner.getId() : null)
                .partnerName(partner != null ? partner.getFullName() : "Không rõ")
                .hasReviewed(reviewOpt.isPresent())
                .review(reviewOpt.map(this::toResponse).orElse(null))
                .build();
    }
}
