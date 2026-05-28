package com.constructx.backend.features.wallet.controller;

import com.constructx.backend.features.wallet.entity.Transaction;
import com.constructx.backend.features.wallet.repository.TransactionRepository;
import com.constructx.backend.features.wallet.service.AdminWalletService;
import com.constructx.backend.features.wallet.service.WalletCoreManager;
import com.constructx.backend.features.wallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet") // Luồng URL dùng chung đảm bảo không bị lỗi chặn phân quyền chéo
@RequiredArgsConstructor
@Slf4j
public class AdminWalletController {

    private final AdminWalletService adminWalletService;
    private final WalletService walletService;
    private final TransactionRepository transactionRepository;
    private final WalletCoreManager walletCoreManager;

    /**
     * BỔ SUNG: API lấy toàn bộ yêu cầu rút tiền hệ thống phục vụ giao diện Admin
     * GET /api/wallet/admin/withdraw/all
     */
    @GetMapping("/admin/withdraw/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllWithdrawRequests() {
        log.info("[ADMIN] Đang truy xuất danh sách toàn bộ các yêu cầu rút tiền.");
        // Truy vấn tất cả các giao dịch có loại là WITHDRAW, sắp xếp theo thời gian mới nhất lên đầu
        List<Transaction> withdrawRequests = transactionRepository.findByTypeOrderByCreatedAtDesc(Transaction.Type.WITHDRAW);
        return ResponseEntity.ok(Map.of("data", withdrawRequests));
    }

    /**
     * ĐÃ SỬA: API CHO ADMIN - Phê duyệt yêu cầu rút tiền
     * POST /api/wallet/admin/withdraw/approve/{txId}
     * Logic: Khấu trừ vĩnh viễn số tiền đang kẹt khỏi kho đóng băng (lockedAmount) và trừ balance tổng.
     */
    @PostMapping("/admin/withdraw/approve/{txId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveWithdraw(@PathVariable Long txId) {
        log.info("[ADMIN] Bắt đầu phê duyệt và giải ngân cho giao dịch ID: {}", txId);

        Transaction transaction = transactionRepository.findById(txId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch yêu cầu rút tiền với ID: " + txId));

        // Gọi đồng bộ xuống WalletService để xử lý hạ băng dứt điểm theo cơ chế Core mới
        walletService.handleAdminWithdrawalApproval(transaction.getGatewayOrderId(), true, "Hệ thống phê duyệt - Đã chuyển khoản thành công.");

        return ResponseEntity.ok(Map.of("success", true, "message", "Phê duyệt rút tiền thành công. Tiền đã được khấu trừ vĩnh viễn."));
    }

    /**
     * ĐÃ SỬA: API CHO ADMIN - Từ chối yêu cầu rút tiền và hoàn tiền về ví khả dụng
     * POST /api/wallet/admin/withdraw/reject/{txId}
     * Logic: Nhả lượng tiền đang kẹt khỏi kho đóng băng (lockedAmount) về lại số dư tiêu dùng.
     */
    @PostMapping("/admin/withdraw/reject/{txId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectWithdraw(@PathVariable Long txId, @RequestBody Map<String, String> payload) {
        String reason = payload.getOrDefault("reason", "Thông tin tài khoản không hợp lệ");
        log.info("[ADMIN] Từ chối yêu cầu rút tiền ID: {}. Lý do: {}", txId, reason);

        Transaction transaction = transactionRepository.findById(txId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch yêu cầu rút tiền với ID: " + txId));

        // Gọi đồng bộ xuống WalletService chuyển trạng thái FAILED và trả tự do cho dòng tiền khả dụng
        walletService.handleAdminWithdrawalApproval(transaction.getGatewayOrderId(), false, reason);

        return ResponseEntity.ok(Map.of("success", true, "message", "Đã hủy lệnh rút tiền thành công. Số dư đã được hoàn trả lại ví khả dụng."));
    }

    /**
     * API CHO ADMIN: Phân phối tiền doanh thu dự án khấu trừ hoa hồng sàn
     * POST /api/wallet/admin/distribute-revenue
     */
    @PostMapping("/admin/distribute-revenue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> distributeRevenue(@RequestBody Map<String, Object> payload) {
        Long constructorId = Long.parseLong(payload.get("constructorId").toString());
        Long grossAmount = Long.parseLong(payload.get("grossAmount").toString());
        double commission = Double.parseDouble(payload.get("commissionPercent").toString());
        String projectCode = payload.get("projectCode").toString();

        walletService.distributeProjectRevenue(constructorId, grossAmount, commission, projectCode);
        return ResponseEntity.ok(Map.of("success", true, "message", "Phân phối doanh thu đối tác hoàn thành."));
    }

    /**
     * API TỰ ĐỘNG ĐỐI SOÁT & CỘNG TIỀN TRỰC TIẾP TỪ FRONTEND
     * POST /api/wallet/verify-dispute/{gatewayOrderId}
     */
    @PostMapping("/verify-dispute/{gatewayOrderId}")
    @PreAuthorize("hasAnyRole('USER', 'CONSTRUCTOR', 'ADMIN')")
    public ResponseEntity<?> verifyDisputeTransaction(
            @PathVariable String gatewayOrderId,
            @RequestParam String responseCode) {

        log.info("[LOCAL AUTOMATION] Tiếp nhận yêu cầu đối soát Sandbox cho đơn: {}, Mã phản hồi: {}", gatewayOrderId, responseCode);

        Transaction transaction = transactionRepository.findByGatewayOrderId(gatewayOrderId)
                .orElseThrow(() -> new RuntimeException("Mã giao dịch không tồn tại: " + gatewayOrderId));

        if (transaction.getStatus() != Transaction.Status.PENDING) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Giao dịch đã được đồng bộ trạng thái từ trước."));
        }

        if ("00".equals(responseCode)) {
            String fakeGatewayTransId = "LOCAL-FIX-SUCCESS-" + System.currentTimeMillis();
            log.info("[LOCAL AUTOMATION] Xác nhận mã 00! Kích hoạt Core cộng tiền vào số dư khả dụng cho đơn: {}", gatewayOrderId);

            walletCoreManager.executeConfirmDepositSuccess(
                    transaction,
                    fakeGatewayTransId,
                    "[LOCAL FIX] Đã tự động kích hoạt nạp tiền thành công trực tiếp từ giao diện"
            );

            return ResponseEntity.ok(Map.of("success", true, "message", "Đồng bộ hóa dữ liệu và cộng tiền vào ví tài khoản thành công!"));
        } else {
            log.warn("[LOCAL AUTOMATION] Nhận mã lỗi từ cổng (Mã: {}). Tiến hành đóng đơn kẹt: {}", responseCode, gatewayOrderId);
            walletCoreManager.executeConfirmDepositFailed(transaction, gatewayOrderId, responseCode);

            return ResponseEntity.ok(Map.of("success", false, "error", "Giao dịch thất bại. Hệ thống đã ghi nhận đóng hóa đơn kẹt."));
        }
    }
}