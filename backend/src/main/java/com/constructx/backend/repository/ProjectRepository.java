package com.constructx.backend.repository;

import com.constructx.backend.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Project> findByStatusOrderByCreatedAtDesc(Project.Status status);

    List<Project> findByStatusAndApprovalStatusOrderByCreatedAtDesc(
            Project.Status status,
            Project.ApprovalStatus approvalStatus
    );

    List<Project> findAllByOrderByCreatedAtDesc();

    long countByUserId(Long userId);

    long countByApprovalStatus(Project.ApprovalStatus approvalStatus);
}