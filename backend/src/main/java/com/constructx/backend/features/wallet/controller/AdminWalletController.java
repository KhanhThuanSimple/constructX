package com.constructx.backend.features.wallet.controller;

import com.constructx.backend.features.wallet.entity.Transaction;
import com.constructx.backend.features.wallet.repository.TransactionRepository;
import com.constructx.backend.features.wallet.service.AdminWalletService;
import com.constructx.backend.features.wallet.service.WalletCoreManager;
import com.constructx.backend.features.wallet.service.WalletService;
import com.constructx.backend.features.wallet.service.VNPayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/wallet")
@RequiredArgsConstructor
@Slf4j
public class AdminWalletController {

    private final AdminWalletService adminWalletService;
    private final WalletService walletService;
    private final TransactionRepository transactionRepository;
    private final VNPayService vnPayService;
    private final WalletCoreManager walletCoreManager;

    @PostMapping("/withdraw/approve/{txId}")
    public ResponseEntity<?> approveWithdraw(@PathVariable Long txId) {
        adminWalletService.approveWithdrawRequest(txId);
        return ResponseEntity.ok(Map.of("success", true, "message", "Phê duyệt rút tiền thành công."));
    }

    @PostMapping("/withdraw/reject/{txId}")
    public ResponseEntity<?> rejectWithdraw(@PathVariable Long txId, @RequestBody Map<String, String> payload) {
        String reason = payload.getOrDefault("reason", "Thông tin tài khoản không hợp lệ");
        adminWalletService.rejectWithdrawRequest(txId, reason);
        return ResponseEntity.ok(Map.of("success", true, "message", "Đã hủy lệnh rút tiền và giải phóng số dư."));
    }

    @PostMapping("/distribute-revenue")
    public ResponseEntity<?> distributeRevenue(@RequestBody Map<String, Object> payload) {
        Long constructorId = Long.parseLong(payload.get("constructorId").toString());
        Long grossAmount = Long.parseLong(payload.get("grossAmount").toString());
        double commission = Double.parseDouble(payload.get("commissionPercent").toString());
        String projectCode = payload.get("projectCode").toString();

        walletService.distributeProjectRevenue(constructorId, grossAmount, commission, projectCode);
        return ResponseEntity.ok(Map.of("success", true, "message", "Phân phối doanh thu đối tác hoàn thành."));
    }

    /**
     * API TỰ ĐỘNG ĐỐI SOÁT HÓA ĐƠN KẸT LOCAL
     * Frontend sẽ tự động kích hoạt API này dưới ngầm ngay khi phát hiện mã vnp_ResponseCode=00
     */
    /**
     * API TỰ ĐỘNG ĐỐI SOÁT & PHÂN LUỒNG GIAO DỊCH LOCAL
     * Được Frontend tự động gọi ngầm để đồng bộ hóa trạng thái tức thì dựa trên phản hồi từ VNPay
     */
    @PostMapping("/verify-dispute/{gatewayOrderId}")
    @PreAuthorize("hasAnyRole('USER', 'CONSTRUCTOR', 'ADMIN')")
    public ResponseEntity<?> verifyDisputeTransaction(
            @PathVariable String gatewayOrderId,
            @RequestParam String responseCode) { // Nhận thêm mã phản hồi từ Frontend truyền xuống

        Transaction transaction = transactionRepository.findByGatewayOrderId(gatewayOrderId)
                .orElseThrow(() -> new RuntimeException("Mã giao dịch không tồn tại: " + gatewayOrderId));

        // Nếu giao dịch đã được xử lý xong từ trước, bỏ qua để tránh trùng lặp
        if (transaction.getStatus() != Transaction.Status.PENDING) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Giao dịch đã được đồng bộ từ trước."));
        }

        // PHÂN LUỒNG NGHIỆP VỤ KHÁCH BIỆT:
        if (!"00".equals(responseCode)) {
            log.warn("[LOCAL AUTOMATION] VNPay báo lỗi (Mã: {}). Chuyển thẳng đơn {} sang FAILED.", responseCode, gatewayOrderId);

            // Gọi Core Manager đóng trạng thái thất bại trực tiếp, không cho phép kẹt lại
            walletCoreManager.executeConfirmDepositFailed(transaction, "VNPAY_ERROR_" + responseCode, responseCode);

            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "error", "Giao dịch thất bại. Hệ thống đã ghi nhận hủy hóa đơn."
            ));
        }

        // Trường hợp THÀNH CÔNG (Mã 00): Tiến hành băm mã bảo mật và cộng tiền ví tự động ngầm
        Map<String, String> mockParams = new HashMap<>();
        mockParams.put("vnp_TxnRef", transaction.getGatewayOrderId());
        mockParams.put("vnp_ResponseCode", "00");
        mockParams.put("vnp_TransactionNo", "AUTO_FIX_SUCCESS_" + System.currentTimeMillis());
        mockParams.put("vnp_Amount", String.valueOf(transaction.getAmount() * 100));

        StringBuilder sb = new StringBuilder();
        sb.append("vnp_Amount=").append(mockParams.get("vnp_Amount")).append("&");
        sb.append("vnp_ResponseCode=").append(mockParams.get("vnp_ResponseCode")).append("&");
        sb.append("vnp_TransactionNo=").append(mockParams.get("vnp_TransactionNo")).append("&");
        sb.append("vnp_TxnRef=").append(mockParams.get("vnp_TxnRef"));

        String secureHash = vnPayService.hmacSHA512(vnPayService.getHashSecretNormal(), sb.toString());
        mockParams.put("vnp_SecureHash", secureHash);

        log.info("[LOCAL AUTOMATION] Đã tự động kích hoạt nạp tiền thành công cho hóa đơn: {}", gatewayOrderId);
        walletService.processIPN("VNPAY", mockParams);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đồng bộ hóa dữ liệu ví nội bộ thành công!"
        ));
    }
}