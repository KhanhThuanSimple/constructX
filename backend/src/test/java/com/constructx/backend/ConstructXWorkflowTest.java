package com.constructx.backend;

import com.constructx.backend.admin.entity.Dispute;
import com.constructx.backend.admin.repository.DisputeRepository;
import com.constructx.backend.admin.service.AdminAnalyticsService;
import com.constructx.backend.features.constructor.entity.Contract;
import com.constructx.backend.features.constructor.repository.ContractRepository;
import com.constructx.backend.features.constructor.service.ContractService;
import com.constructx.backend.features.order.repository.OrderRepository;
import com.constructx.backend.features.project.entity.Project;
import com.constructx.backend.features.project.repository.ProjectRepository;
import com.constructx.backend.features.review.entity.Review;
import com.constructx.backend.features.review.repository.ReviewRepository;
import com.constructx.backend.features.review.service.ReviewService;
import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.user.repository.UserRepository;
import com.constructx.backend.features.wallet.entity.PlatformWallet;
import com.constructx.backend.features.wallet.entity.Wallet;
import com.constructx.backend.features.wallet.repository.PlatformWalletRepository;
import com.constructx.backend.features.wallet.repository.WalletRepository;
import com.constructx.backend.features.wallet.service.WalletCoreManager;
import com.constructx.backend.features.notification.service.NotificationService;
import com.constructx.backend.admin.dto.request.DisputeResolutionRequest;
import com.constructx.backend.admin.dto.response.DisputeResponse;
import com.constructx.backend.features.chat.service.ChatService;
import com.constructx.backend.admin.repository.DisputeMessageRepository;
import com.constructx.backend.admin.service.AdminDisputeService;
import com.constructx.backend.features.constructor.entity.Bid;
import com.constructx.backend.features.wallet.entity.Transaction;
import com.constructx.backend.features.wallet.repository.TransactionRepository;
import com.constructx.backend.features.wallet.service.WalletArbitrationManager;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ConstructXWorkflowTest {

    @Mock
    private ReviewRepository reviewRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ContractRepository contractRepository;
    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private DisputeRepository disputeRepository;
    @Mock
    private WalletRepository walletRepository;
    @Mock
    private PlatformWalletRepository platformWalletRepository;
    @Mock
    private WalletCoreManager walletCoreManager;
    @Mock
    private NotificationService notificationService;
    @Mock
    private Authentication authentication;
    @Mock
    private SecurityContext securityContext;
    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private WalletArbitrationManager walletArbitrationManager;
    @Mock
    private DisputeMessageRepository disputeMessageRepository;
    @Mock
    private ChatService chatService;

    @InjectMocks
    private ReviewService reviewService;

    @InjectMocks
    private ContractService contractService;

    @InjectMocks
    private AdminAnalyticsService adminAnalyticsService;
    
    @InjectMocks
    private AdminDisputeService adminDisputeService;

    @BeforeEach
    public void setUp() {
        // Setup SecurityContext if needed, otherwise keep standard mock behavior
    }

    @Test
    public void testAITrustScoreAndVerifiedBadge() {
        System.out.println("\n================================================================================");
        System.out.println("  [TEST 1] VERIFYING AI TRUST SCORE & CONTRACTOR REPUTATION SYSTEM");
        System.out.println("================================================================================");

        Long contractorId = 100L;

        // --- SCENARIO A: Perfect reputation contractor ---
        // 5 perfect reviews
        Review review1 = Review.builder().rating(5).qualityScore(5).communicationScore(5).progressScore(5).build();
        Review review2 = Review.builder().rating(5).qualityScore(5).communicationScore(5).progressScore(5).build();
        Review review3 = Review.builder().rating(5).qualityScore(5).communicationScore(5).progressScore(5).build();
        Review review4 = Review.builder().rating(5).qualityScore(5).communicationScore(5).progressScore(5).build();
        Review review5 = Review.builder().rating(5).qualityScore(5).communicationScore(5).progressScore(5).build();
        List<Review> perfectReviews = List.of(review1, review2, review3, review4, review5);

        // 10 contracts: all 10 completed, 0 disputes
        Contract cActive = Contract.builder().agreedPrice(20000000L).status(Contract.Status.COMPLETED).build();
        List<Contract> perfectContracts = Collections.nCopies(10, cActive);

        when(reviewRepository.findByRevieweeIdOrderByCreatedAtDesc(contractorId)).thenReturn(perfectReviews);
        when(contractRepository.findByContractorIdOrderByCreatedAtDesc(contractorId)).thenReturn(perfectContracts);
        when(disputeRepository.countByContractorId(contractorId)).thenReturn(0L);
        when(disputeRepository.countByContractorIdAndStatus(contractorId, Dispute.Status.PENDING)).thenReturn(0L);

        Map<String, Object> perfectSummary = reviewService.getUserRatingSummary(contractorId);

        int perfectTrustScore = (int) perfectSummary.get("aiTrustScore");
        boolean perfectIsVerified = (boolean) perfectSummary.get("isVerified");
        double perfectAvgRating = (double) perfectSummary.get("averageRating");
        double perfectCompletionRate = (double) perfectSummary.get("completionRate");
        double perfectDisputeRate = (double) perfectSummary.get("disputeRate");

        System.out.println("  - Contractor A (Perfect Reputation):");
        System.out.println("    * Average Rating: " + perfectAvgRating + " / 5.0");
        System.out.println("    * Completion Rate: " + perfectCompletionRate + "%");
        System.out.println("    * Dispute Rate: " + perfectDisputeRate + "%");
        System.out.println("    * Calculated AI Trust Score: " + perfectTrustScore);
        System.out.println("    * Verified Badge: " + (perfectIsVerified ? "YES (PASSED)" : "NO (FAILED)"));

        assertEquals(100, perfectTrustScore);
        assertTrue(perfectIsVerified);

        // --- SCENARIO B: Contractor with disputes and poor rating ---
        // 5 poor reviews
        Review badReview1 = Review.builder().rating(3).qualityScore(3).communicationScore(4).progressScore(3).build();
        Review badReview2 = Review.builder().rating(4).qualityScore(3).communicationScore(4).progressScore(4).build();
        Review badReview3 = Review.builder().rating(3).qualityScore(3).communicationScore(3).progressScore(3).build();
        Review badReview4 = Review.builder().rating(4).qualityScore(4).communicationScore(4).progressScore(4).build();
        Review badReview5 = Review.builder().rating(3).qualityScore(3).communicationScore(3).progressScore(3).build();
        List<Review> poorReviews = List.of(badReview1, badReview2, badReview3, badReview4, badReview5); // Avg: 3.4

        // 10 contracts: 8 completed, 2 cancelled. 2 disputes (Dispute Rate: 20%)
        Contract cComp = Contract.builder().agreedPrice(20000000L).status(Contract.Status.COMPLETED).build();
        Contract cCan = Contract.builder().agreedPrice(20000000L).status(Contract.Status.CANCELLED).build();
        List<Contract> poorContracts = List.of(cComp, cComp, cComp, cComp, cComp, cComp, cComp, cComp, cCan, cCan);

        when(reviewRepository.findByRevieweeIdOrderByCreatedAtDesc(contractorId)).thenReturn(poorReviews);
        when(contractRepository.findByContractorIdOrderByCreatedAtDesc(contractorId)).thenReturn(poorContracts);
        when(disputeRepository.countByContractorId(contractorId)).thenReturn(2L);
        when(disputeRepository.countByContractorIdAndStatus(contractorId, Dispute.Status.PENDING)).thenReturn(1L);

        Map<String, Object> poorSummary = reviewService.getUserRatingSummary(contractorId);

        int poorTrustScore = (int) poorSummary.get("aiTrustScore");
        boolean poorIsVerified = (boolean) poorSummary.get("isVerified");
        double poorAvgRating = (double) poorSummary.get("averageRating");
        double poorCompletionRate = (double) poorSummary.get("completionRate");
        double poorDisputeRate = (double) poorSummary.get("disputeRate");

        System.out.println("\n  - Contractor B (High Disputes & Poor Rating):");
        System.out.println("    * Average Rating: " + poorAvgRating + " / 5.0");
        System.out.println("    * Completion Rate: " + poorCompletionRate + "%");
        System.out.println("    * Dispute Rate: " + poorDisputeRate + "%");
        System.out.println("    * Calculated AI Trust Score: " + poorTrustScore);
        System.out.println("    * Verified Badge: " + (poorIsVerified ? "YES (FAILED)" : "NO (PASSED)"));

        // Rating Part: 3.4 * 20 * 0.4 = 27.2
        // Completion Part: 80 * 0.3 = 24.0
        // Dispute Deduction: 20 * 20 * 0.2 = 80
        // Response Part: 10.0
        // Base Score: 20.0
        // trustScoreRaw = 27.2 + 24.0 - 80.0 + 10.0 + 20.0 = 1.2
        // Math.max(0, 1) = 1
        assertEquals(1, poorTrustScore);
        assertFalse(poorIsVerified);

        System.out.println("--------------------------------------------------------------------------------");
        System.out.println("  => [TEST 1] PASSED SUCCESSFULLY");
        System.out.println("================================================================================\n");
    }

    @Test
    public void testContractFreezingWorkflow() {
        System.out.println("\n================================================================================");
        System.out.println("  [TEST 2] VERIFYING CONTRACT FREEZING WORKFLOW");
        System.out.println("================================================================================");

        Long contractId = 500L;
        User adminUser = User.builder().id(1L).fullName("Admin Hệ Thống").email("admin@constructx.com").role(User.Role.ADMIN).build();
        
        // Mock getCurrentUser() logic indirectly by mocking userRepository
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("admin@constructx.com");
        when(userRepository.findByEmail("admin@constructx.com")).thenReturn(Optional.of(adminUser));

        // Create a contract that is currently disputed (isDisputed = true)
        Contract disputedContract = Contract.builder()
                .id(contractId)
                .contractNumber("CTR-001")
                .isDisputed(true)
                .status(Contract.Status.ACTIVE)
                .build();

        when(contractRepository.findById(contractId)).thenReturn(Optional.of(disputedContract));

        System.out.println("  - Attempting to complete a frozen (disputed) contract:");
        RuntimeException exception1 = assertThrows(RuntimeException.class, () -> {
            contractService.completeContract(contractId, "Admin complete test");
        });
        System.out.println("    * Threw Exception: " + exception1.getMessage());
        assertEquals("Hợp đồng đang có tranh chấp và bị đóng băng. Không thể hoàn thành hợp đồng.", exception1.getMessage());

        System.out.println("\n  - Attempting to update terms of a frozen (disputed) contract:");
        RuntimeException exception2 = assertThrows(RuntimeException.class, () -> {
            contractService.updateTerms(contractId, "New terms", "Admin update terms test");
        });
        System.out.println("    * Threw Exception: " + exception2.getMessage());
        assertEquals("Hợp đồng đang có tranh chấp và bị đóng băng. Không thể cập nhật điều khoản.", exception2.getMessage());

        System.out.println("\n  - Attempting to adjust price of a frozen (disputed) contract:");
        RuntimeException exception3 = assertThrows(RuntimeException.class, () -> {
            contractService.updatePrice(contractId, 150000000L, "Admin update price test");
        });
        System.out.println("    * Threw Exception: " + exception3.getMessage());
        assertEquals("Hợp đồng đang có tranh chấp và bị đóng băng. Không thể điều chỉnh giá.", exception3.getMessage());

        System.out.println("--------------------------------------------------------------------------------");
        System.out.println("  => [TEST 2] PASSED SUCCESSFULLY (Contracts are successfully protected)");
        System.out.println("================================================================================\n");
    }

    @Test
    public void testPlatformFeeDeductionAndWalletTransfer() {
        System.out.println("\n================================================================================");
        System.out.println("  [TEST 3] VERIFYING PLATFORM FEES & ESCROW COMPLETION PAYOUTS");
        System.out.println("================================================================================");

        Long contractId = 600L;
        Long clientWalletId = 200L;
        Long contractorWalletId = 300L;
        long agreedPrice = 100000000L; // 100M VND

        User adminUser = User.builder().id(1L).fullName("Admin Hệ Thống").email("admin@constructx.com").role(User.Role.ADMIN).build();
        User client = User.builder().id(11L).fullName("Chủ nhà Nam").build();
        User contractor = User.builder().id(12L).fullName("Nhà thầu Bình").build();
        Project project = Project.builder().id(55L).status(Project.Status.IN_PROGRESS).build();

        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("admin@constructx.com");
        when(userRepository.findByEmail("admin@constructx.com")).thenReturn(Optional.of(adminUser));

        Contract contract = Contract.builder()
                .id(contractId)
                .contractNumber("CTR-100")
                .client(client)
                .contractor(contractor)
                .project(project)
                .agreedPrice(agreedPrice)
                .customerDepositAmount(agreedPrice)
                .customerDepositLocked(true)
                .contractorDepositAmount(10000000L) // 10M VND contractor deposit
                .contractorDepositLocked(true)
                .isDisputed(false)
                .status(Contract.Status.ACTIVE)
                .build();

        Wallet clientWallet = Wallet.builder().id(clientWalletId).user(client).balance(agreedPrice).lockedAmount(agreedPrice).build();
        Wallet contractorWallet = Wallet.builder().id(contractorWalletId).user(contractor).balance(10000000L).lockedAmount(10000000L).build();
        PlatformWallet platformWallet = PlatformWallet.builder().id(1L).balance(0L).build();

        when(contractRepository.findById(contractId)).thenReturn(Optional.of(contract));
        when(walletRepository.findByUserId(client.getId())).thenReturn(Optional.of(clientWallet));
        when(walletRepository.findByUserId(contractor.getId())).thenReturn(Optional.of(contractorWallet));
        when(platformWalletRepository.findById(1L)).thenReturn(Optional.of(platformWallet));

        // When saving, just return the saved objects
        when(contractRepository.save(any(Contract.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(walletRepository.save(any(Wallet.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(platformWalletRepository.save(any(PlatformWallet.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Call completeContract
        contractService.completeContract(contractId, "Xác nhận hoàn thành thi công");

        long expectedPlatformFee = Math.round(agreedPrice * 0.05); // 5M
        long expectedWarrantyHold = Math.round(agreedPrice * 0.05); // 5M
        long expectedImmediateAmt = agreedPrice - expectedPlatformFee - expectedWarrantyHold; // 90M

        System.out.println("  - Completed contract with Agreed Price: " + agreedPrice + " VND");
        System.out.println("    * Platform Fee Deducted (5%): " + expectedPlatformFee + " VND");
        System.out.println("    * Warranty Hold Amount (5%): " + expectedWarrantyHold + " VND");
        System.out.println("    * Immediate Payout to Contractor (90%): " + expectedImmediateAmt + " VND");
        System.out.println("    * Platform Wallet Balance: " + platformWallet.getBalance() + " VND");

        // Asserts
        assertEquals(expectedPlatformFee, platformWallet.getBalance());
        
        // Verify WalletCoreManager executions
        verify(walletCoreManager, times(1)).recordTransaction(
                eq(clientWallet), eq(expectedPlatformFee), any(), eq("CONSTRUCTX_COMMISSION"), anyString(), anyString()
        );
        verify(walletCoreManager, times(1)).executeDeposit(
                eq(contractorWallet), eq(expectedImmediateAmt), any(), eq("CONSTRUCTX_ESCROW"), anyString(), anyString()
        );
        verify(walletCoreManager, times(1)).executeLockForOrder(
                eq(contractorWallet), eq(expectedWarrantyHold), any(), eq("CONSTRUCTX_WARRANTY"), anyString()
        );

        System.out.println("--------------------------------------------------------------------------------");
        System.out.println("  => [TEST 3] PASSED SUCCESSFULLY (Platform fee and payouts verified)");
        System.out.println("================================================================================\n");
    }

    @Test
    public void testAdminAnalyticsConsolidatedKPIs() {
        System.out.println("\n================================================================================");
        System.out.println("  [TEST 4] VERIFYING CONSOLIDATED ADMIN KPI DASHBOARD");
        System.out.println("================================================================================");

        // Setup mock data for Admin Analytics
        Wallet w1 = Wallet.builder().balance(100000000L).lockedAmount(20000000L).build();
        Wallet w2 = Wallet.builder().balance(50000000L).lockedAmount(10000000L).build();
        when(walletRepository.findAll()).thenReturn(List.of(w1, w2));
        when(walletRepository.sumLockedAmount()).thenReturn(30000000L);

        Dispute d1 = Dispute.builder().amount(15000000L).status(Dispute.Status.PENDING).build();
        when(disputeRepository.findByStatusOrderByCreatedAtDesc(Dispute.Status.PENDING)).thenReturn(List.of(d1));

        PlatformWallet platformWallet = PlatformWallet.builder().id(1L).balance(15000000L).build();
        when(platformWalletRepository.findById(1L)).thenReturn(Optional.of(platformWallet));

        Contract c1 = Contract.builder().status(Contract.Status.COMPLETED).completedAt(LocalDateTime.now().minusDays(2)).agreedPrice(100000000L).build();
        when(contractRepository.findAll()).thenReturn(List.of(c1));

        when(userRepository.count()).thenReturn(150L);
        when(projectRepository.count()).thenReturn(45L);
        when(contractRepository.countByStatus(Contract.Status.COMPLETED)).thenReturn(25L);
        when(contractRepository.countByStatus(Contract.Status.ACTIVE)).thenReturn(10L);

        // Run dashboard analytics
        Map<String, Object> dashboard = adminAnalyticsService.getDashboardAnalytics();

        System.out.println("  - Dashboard Consolidated KPI structure check:");
        System.out.println("    * Contains 'escrowLiquidity': " + dashboard.containsKey("escrowLiquidity"));
        System.out.println("    * Contains 'commission': " + dashboard.containsKey("commission"));
        System.out.println("    * Contains 'growth': " + dashboard.containsKey("growth"));
        System.out.println("    * Contains 'contractorPerformance': " + dashboard.containsKey("contractorPerformance"));
        System.out.println("    * Contains 'disputeAnalytics': " + dashboard.containsKey("disputeAnalytics"));

        assertTrue(dashboard.containsKey("escrowLiquidity"));
        assertTrue(dashboard.containsKey("commission"));
        assertTrue(dashboard.containsKey("growth"));
        assertTrue(dashboard.containsKey("contractorPerformance"));
        assertTrue(dashboard.containsKey("disputeAnalytics"));

        Map<String, Object> escrow = (Map<String, Object>) dashboard.get("escrowLiquidity");
        System.out.println("\n  - Escrow Liquidity KPIs:");
        System.out.println("    * Total System Balance: " + escrow.get("totalSystemBalance") + " VND");
        System.out.println("    * Total Locked In Escrow: " + escrow.get("totalLockedInEscrow") + " VND");
        System.out.println("    * Total Available Liquidity: " + escrow.get("totalAvailable") + " VND");
        System.out.println("    * Total Disputed Escrow: " + escrow.get("totalDisputedEscrow") + " VND");

        assertEquals(150000000L, escrow.get("totalSystemBalance"));
        assertEquals(30000000L, escrow.get("totalLockedInEscrow"));
        assertEquals(120000000L, escrow.get("totalAvailable"));

        System.out.println("--------------------------------------------------------------------------------");
        System.out.println("  => [TEST 4] PASSED SUCCESSFULLY");
        System.out.println("================================================================================\n");
    }

    @Test
    public void testResolveDisputeWorkflow() {
        System.out.println("\n================================================================================");
        System.out.println("  [TEST 5] VERIFYING ESCROW DISPUTE RESOLUTION (PROJECT & ORDER BASED)");
        System.out.println("================================================================================");

        // 1. Setup Project-Based Dispute Resolution
        Project project = Project.builder().id(10L).name("Dự án biệt thự").build();
        User customer = User.builder().id(200L).fullName("Nguyễn Văn A").build();
        User contractor = User.builder().id(300L).fullName("Nhà thầu B").build();
        Bid bid = Bid.builder().id(50L).totalPrice(100000000L).build();
        Contract projectContract = Contract.builder()
                .id(1L)
                .contractNumber("CTR-PROJ-100")
                .project(project)
                .bid(bid)
                .client(customer)
                .contractor(contractor)
                .agreedPrice(100000000L)
                .status(Contract.Status.ACTIVE)
                .build();

        Dispute projectDispute = Dispute.builder()
                .id(1L)
                .contract(projectContract)
                .project(project)
                .customer(customer)
                .contractor(contractor)
                .amount(100000000L)
                .status(Dispute.Status.PENDING)
                .build();

        Transaction projectLockTx = Transaction.builder()
                .id(999L)
                .amount(100000000L)
                .gatewayOrderId("LOCK-CTR-ESCROW-10-50")
                .build();

        when(disputeRepository.findById(1L)).thenReturn(Optional.of(projectDispute));
        when(transactionRepository.findByGatewayOrderId("LOCK-CTR-ESCROW-10-50")).thenReturn(Optional.of(projectLockTx));
        when(disputeRepository.save(any(Dispute.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DisputeResolutionRequest request = new DisputeResolutionRequest();
        request.setResolution("Phân chia 60-40 do chậm tiến độ");
        request.setResolutionType("split");
        request.setCustomerPercent(60.0);
        request.setContractorPercent(40.0);

        System.out.println("  - Resolving project-based dispute:");
        DisputeResponse response1 = adminDisputeService.resolveDispute(1L, request);
        
        System.out.println("    * Status is RESOLVED: " + response1.getStatus());
        System.out.println("    * Refund Amount (60%): " + response1.getRefundAmount() + " VND");
        System.out.println("    * Contract Number: " + response1.getContractNumber());
        assertEquals("RESOLVED", response1.getStatus());
        assertEquals(60000000L, response1.getRefundAmount());
        assertEquals("CTR-PROJ-100", response1.getContractNumber());

        verify(walletArbitrationManager, times(1)).resolveProjectDispute(
                eq(999L), eq(300L), eq(60.0), eq(40.0), eq("PRJ-10")
        );

        // 2. Setup Custom Order-Based Dispute Resolution (Project is NULL)
        com.constructx.backend.features.order.entity.Order order = new com.constructx.backend.features.order.entity.Order();
        order.setId(88L);
        order.setOrderCode("ORD-999");
        
        Contract orderContract = Contract.builder()
                .id(2L)
                .contractNumber("CTR-ORD-888")
                .project(null) // Custom order has no project!
                .sourceOrder(order)
                .client(customer)
                .contractor(contractor)
                .agreedPrice(50000000L)
                .status(Contract.Status.ACTIVE)
                .build();

        Dispute orderDispute = Dispute.builder()
                .id(2L)
                .contract(orderContract)
                .project(null) // Custom order has no project!
                .customer(customer)
                .contractor(contractor)
                .amount(50000000L)
                .status(Dispute.Status.PENDING)
                .build();

        Transaction orderLockTx = Transaction.builder()
                .id(888L)
                .amount(30000000L)
                .gatewayOrderId("LOCK-ORD-999-DEPOSIT")
                .build();

        when(disputeRepository.findById(2L)).thenReturn(Optional.of(orderDispute));
        when(transactionRepository.findByGatewayOrderId("LOCK-ORD-999-DEPOSIT")).thenReturn(Optional.of(orderLockTx));

        System.out.println("\n  - Resolving custom order-based dispute (project is null):");
        DisputeResponse response2 = adminDisputeService.resolveDispute(2L, request);

        System.out.println("    * Status is RESOLVED: " + response2.getStatus());
        System.out.println("    * Project Name: " + response2.getProjectName());
        System.out.println("    * Contract Number: " + response2.getContractNumber());
        assertEquals("RESOLVED", response2.getStatus());
        assertEquals("Đơn hàng tùy chỉnh", response2.getProjectName());
        assertEquals("CTR-ORD-888", response2.getContractNumber());

        verify(walletArbitrationManager, times(1)).resolveProjectDispute(
                eq(888L), eq(300L), eq(60.0), eq(40.0), eq("ORD-999")
        );

        System.out.println("--------------------------------------------------------------------------------");
        System.out.println("  => [TEST 5] PASSED SUCCESSFULLY (NullPointerException prevented and wallets arbitrated)");
        System.out.println("================================================================================\n");
    }
}
