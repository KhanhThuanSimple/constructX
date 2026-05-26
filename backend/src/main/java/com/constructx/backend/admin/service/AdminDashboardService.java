package com.constructx.backend.admin.service;

import com.constructx.backend.admin.dto.response.AdminDashboardStatsResponse;
import com.constructx.backend.admin.dto.response.AdminProjectSummary;
import com.constructx.backend.admin.entity.Dispute;
import com.constructx.backend.admin.repository.DisputeRepository;
import com.constructx.backend.entity.Project;
import com.constructx.backend.entity.Transaction;
import com.constructx.backend.entity.User;
import com.constructx.backend.repository.ProjectRepository;
import com.constructx.backend.repository.TransactionRepository;
import com.constructx.backend.repository.UserRepository;
import com.constructx.backend.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;
    private final DisputeRepository disputeRepository;

    @Transactional(readOnly = true)
    public AdminDashboardStatsResponse getDashboardStats() {
        long totalRevenue = transactionRepository.sumAmountByStatus(Transaction.Status.SUCCESS);
        long totalEscrow = walletRepository.sumLockedAmount();
        long totalProjects = projectRepository.count();

        long activeContractors = userRepository.countByRoleAndActive(User.Role.CONTRACTOR, true);

        long pendingProjects = projectRepository.countByApprovalStatus(Project.ApprovalStatus.PENDING);

        long pendingPartners = userRepository.countByRoleAndApprovalStatus(
                User.Role.CONTRACTOR,
                User.ApprovalStatus.PENDING
        );

        long openDisputes = disputeRepository.countByStatus(Dispute.Status.PENDING);

        List<AdminProjectSummary> recentProjects = projectRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .limit(5)
                .map(this::toSummary)
                .collect(Collectors.toList());

        return AdminDashboardStatsResponse.builder()
                .totalRevenue(totalRevenue)
                .totalEscrow(totalEscrow)
                .newProjectsCount(totalProjects)
                .activeContractors(activeContractors)
                .pendingProjects(pendingProjects)
                .pendingPartners(pendingPartners)
                .openDisputes(openDisputes)
                .myProjects(recentProjects)
                .build();
    }

    private AdminProjectSummary toSummary(Project project) {
        return AdminProjectSummary.builder()
                .id(project.getId())
                .name(project.getName())
                .status(project.getStatus() == null ? null : project.getStatus().name())
                .approvalStatus(project.getApprovalStatus() == null
                        ? Project.ApprovalStatus.PENDING.name()
                        : project.getApprovalStatus().name())
                .category(project.getCategory())
                .area(project.getArea())
                .budgetMin(project.getBudgetMin())
                .budgetMax(project.getBudgetMax())
                .customerName(project.getUser().getFullName())
                .createdAt(project.getCreatedAt())
                .build();
    }
}