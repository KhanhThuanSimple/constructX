package com.constructx.backend.features.review.service;

import com.constructx.backend.features.review.dto.ReviewRequest;
import com.constructx.backend.features.review.dto.ReviewResponse;
import com.constructx.backend.features.review.entity.Review;
import com.constructx.backend.features.review.repository.ReviewRepository;
import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.user.repository.UserRepository;
import com.constructx.backend.features.constructor.repository.ContractRepository;
import com.constructx.backend.features.project.repository.ProjectRepository;
import com.constructx.backend.features.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ContractRepository contractRepository;
    private final ProjectRepository projectRepository;
    private final OrderRepository orderRepository;

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
            if (!order.getAssignedContractor().getId().equals(request.getRevieweeId())) {
                throw new RuntimeException("Người được đánh giá không phải nhà thầu của đơn hàng này");
            }
        }

        Review review = Review.builder()
                .reviewer(reviewer)
                .reviewee(reviewee)
                .referenceType(request.getReferenceType())
                .referenceId(request.getReferenceId())
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        return toResponse(reviewRepository.save(review));
    }

    public List<ReviewResponse> getReviewsForUser(Long userId) {
        return reviewRepository.findByRevieweeIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Map<String, Object> getUserRatingSummary(Long userId) {
        double avg = reviewRepository.findAverageRatingByRevieweeId(userId);
        long count = reviewRepository.countByRevieweeId(userId);
        return Map.of(
                "averageRating", Math.round(avg * 10.0) / 10.0,
                "totalReviews", count
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
                .createdAt(r.getCreatedAt())
                .build();
    }
}
