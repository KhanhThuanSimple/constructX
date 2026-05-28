package com.constructx.backend.features.user.repository;

import com.constructx.backend.features.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole(User.Role role);

    List<User> findByRoleAndApprovalStatus(
            User.Role role,
            User.ApprovalStatus approvalStatus
    );
    long countByRoleAndActive(
            User.Role role,
            boolean active
    );

    // thêm
    long countByRoleAndApprovalStatus(
            User.Role role,
            User.ApprovalStatus approvalStatus
    );

}