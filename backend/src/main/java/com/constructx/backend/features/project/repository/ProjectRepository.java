package com.constructx.backend.features.project.repository;

import com.constructx.backend.features.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Project> findByStatusOrderByCreatedAtDesc(Project.Status status);
    List<Project> findAllByOrderByCreatedAtDesc();

    @Query("SELECT p FROM Project p JOIN FETCH p.user ORDER BY p.createdAt DESC NULLS LAST")
    List<Project> findAllWithUserOrderByCreatedAtDesc();
    long countByApprovalStatus(Project.ApprovalStatus approvalStatus);

    @Query("SELECT COUNT(p) FROM Project p WHERE p.createdAt >= :from AND p.createdAt < :to")
    long countBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
