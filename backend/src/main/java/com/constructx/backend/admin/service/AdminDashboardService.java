package com.constructx.backend.admin.service;

import com.constructx.backend.admin.dto.response.AdminDashboardStatsResponse;
import com.constructx.backend.admin.dto.response.AdminProjectSummary;
import com.constructx.backend.admin.entity.Dispute;
import com.constructx.backend.admin.repository.DisputeRepository;
import com.constructx.backend.features.constructor.entity.Contract;
import com.constructx.backend.features.constructor.repository.ContractRepository;
import com.constructx.backend.features.order.entity.Order;
import com.constructx.backend.features.order.repository.OrderRepository;
import com.constructx.backend.features.project.entity.Project;
import com.constructx.backend.features.project.repository.ProjectRepository;
import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.user.repository.UserRepository;
import com.constructx.backend.features.wallet.entity.Transaction;
import com.constructx.backend.features.wallet.repository.TransactionRepository;
import com.constructx.backend.features.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;
    private final DisputeRepository disputeRepository;
    private final ContractRepository contractRepository;
    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public AdminDashboardStatsResponse getDashboardStats() {

        // ── Core stats ────────────────────────────────────────────────
        long totalRevenue = transactionRepository.sumAmountByStatus(Transaction.Status.SUCCESS);
        long totalEscrow  = walletRepository.sumLockedAmount();
        long totalProjects = projectRepository.count();
        long activeContractors = userRepository.countByRoleAndActive(User.Role.CONTRACTOR, true);
        long pendingProjects = projectRepository.countByApprovalStatus(Project.ApprovalStatus.PENDING);
        long pendingPartners = userRepository.countByRoleAndApprovalStatus(
                User.Role.CONTRACTOR, User.ApprovalStatus.PENDING);
        long openDisputes = disputeRepository.countByStatus(Dispute.Status.PENDING);

        long totalOrders   = orderRepository.count();
        long pendingOrders = orderRepository.countByStatus(Order.Status.PENDING);
        long totalContracts  = contractRepository.count();
        long activeContracts = contractRepository.countByStatus(Contract.Status.ACTIVE);

        List<AdminProjectSummary> recentProjects = projectRepository.findAllByOrderByCreatedAtDesc()
                .stream().limit(5).map(this::toSummary).toList();

        // ── Chart data — 6 tháng gần nhất ────────────────────────────
        LocalDateTime now = LocalDateTime.now();
        List<Long>   monthlyRevenue  = new ArrayList<>();
        List<Long>   monthlyProjects = new ArrayList<>();
        List<Long>   monthlyOrders   = new ArrayList<>();
        List<String> monthLabels     = new ArrayList<>();

        for (int i = 5; i >= 0; i--) {
            LocalDateTime from = now.minusMonths(i).withDayOfMonth(1)
                    .withHour(0).withMinute(0).withSecond(0).withNano(0);
            LocalDateTime to   = from.plusMonths(1);

            monthlyRevenue.add(transactionRepository.sumSuccessAmountBetween(from, to));
            monthlyProjects.add(projectRepository.countBetween(from, to));
            monthlyOrders.add(orderRepository.countBetween(from, to));

            Month m = from.getMonth();
            monthLabels.add(m.getDisplayName(TextStyle.SHORT, new Locale("vi")));
        }

        return AdminDashboardStatsResponse.builder()
                .totalRevenue(totalRevenue)
                .totalEscrow(totalEscrow)
                .newProjectsCount(totalProjects)
                .activeContractors(activeContractors)
                .pendingProjects(pendingProjects)
                .pendingPartners(pendingPartners)
                .openDisputes(openDisputes)
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .totalContracts(totalContracts)
                .activeContracts(activeContracts)
                .myProjects(recentProjects)
                .monthlyRevenue(monthlyRevenue)
                .monthlyProjects(monthlyProjects)
                .monthlyOrders(monthlyOrders)
                .monthLabels(monthLabels)
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
