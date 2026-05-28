package com.constructx.backend.features.project.repository;

import com.constructx.backend.features.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Project> findByStatusOrderByCreatedAtDesc(Project.Status status);
    List<Project> findAllByOrderByCreatedAtDesc();

    // thêm
    long countByApprovalStatus(Project.ApprovalStatus approvalStatus);
}
