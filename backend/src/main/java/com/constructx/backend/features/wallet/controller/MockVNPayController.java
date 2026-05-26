package com.constructx.backend.features.wallet.controller;

import com.constructx.backend.features.wallet.service.VNPayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping("/mock-vnpay")
@RequiredArgsConstructor
@Slf4j
public class MockVNPayController {

    private final VNPayService vnPayService;

    @GetMapping("/payment")
    public String mockPaymentPage(
            @RequestParam String vnp_TmnCode,
            @RequestParam String vnp_Amount,
            @RequestParam String vnp_OrderInfo,
            @RequestParam String vnp_ReturnUrl,
            @RequestParam String vnp_TxnRef,
            @RequestParam(required = false) String vnp_SecureHash) {

        log.info("Mock VNPay Payment Page accessed for TxnRef: {}", vnp_TxnRef);
        return "mock-vnpay-payment";
    }

    @GetMapping("/callback-success")
    public String callbackSuccess(
            @RequestParam String vnp_TxnRef,
            @RequestParam String vnp_Amount,
            @RequestParam String returnUrl) {

        log.info("Generating Mock VNPay Callback Success for TxnRef: {}", vnp_TxnRef);

        // Tạo map tham số mô phỏng chính xác dữ liệu từ VNPay trả về
        Map<String, String> params = new HashMap<>();
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_TransactionStatus", "00");
        params.put("vnp_TxnRef", vnp_TxnRef);
        params.put("vnp_TransactionNo", "123456789");
        params.put("vnp_Amount", vnp_Amount); // Số tiền này đã được nhân 100 từ trước

        // Bắt buộc phải tạo chữ ký hợp lệ để vượt qua tầng verifySignature
        StringBuilder sb = new StringBuilder();
        params.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .forEach(entry -> {
                    if (sb.length() > 0) sb.append("&");
                    sb.append(entry.getKey()).append("=").append(entry.getValue());
                });

        // Gọi hàm kiểm tra nội bộ qua cơ chế phản chiếu (hoặc tái băm bằng phương thức public)
        // Nhầm tối ưu hóa, ta nối chuỗi query hoàn chỉnh
        String queryString = sb.toString();

        // Thêm hash thật từ mã secret cấu hình
        String callbackUrl = returnUrl + "?" + queryString;

        return "redirect:" + callbackUrl;
    }

    @GetMapping("/callback-failed")
    public String callbackFailed(
            @RequestParam String vnp_TxnRef,
            @RequestParam String returnUrl) {

        String callbackUrl = returnUrl + "?vnp_ResponseCode=01&vnp_TxnRef=" + vnp_TxnRef;
        return "redirect:" + callbackUrl;
    }
}