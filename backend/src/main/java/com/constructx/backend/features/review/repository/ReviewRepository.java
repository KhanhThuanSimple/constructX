package com.constructx.backend.features.review.repository;

import com.constructx.backend.features.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByRevieweeIdOrderByCreatedAtDesc(Long revieweeId);

    List<Review> findByReviewerIdOrderByCreatedAtDesc(Long reviewerId);

    Optional<Review> findByReviewerIdAndReferenceTypeAndReferenceId(
            Long reviewerId, String referenceType, Long referenceId);

    boolean existsByReviewerIdAndReferenceTypeAndReferenceId(
            Long reviewerId, String referenceType, Long referenceId);

    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r WHERE r.reviewee.id = :revieweeId")
    Double findAverageRatingByRevieweeId(@Param("revieweeId") Long revieweeId);

    long countByRevieweeId(Long revieweeId);
}
