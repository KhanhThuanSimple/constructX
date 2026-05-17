package com.constructx.backend.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

@Controller
@RequestMapping("/mock-vnpay")
@Slf4j
public class MockVNPayController {

    /**
     * Mock VNPay payment page
     * Giả lập trang thanh toán VNPay
     */
    @GetMapping("/payment")
    public String mockPaymentPage(
            @RequestParam String vnp_TmnCode,
            @RequestParam String vnp_Amount,
            @RequestParam String vnp_OrderInfo,
            @RequestParam String vnp_ReturnUrl,
            @RequestParam String vnp_TxnRef,
            @RequestParam(required = false) String vnp_SecureHash) {
        
        log.info("Mock VNPay Payment Page");
        log.info("TMN Code: {}", vnp_TmnCode);
        log.info("Amount: {}", vnp_Amount);
        log.info("Order Info: {}", vnp_OrderInfo);
        log.info("Return URL: {}", vnp_ReturnUrl);
        log.info("Transaction Ref: {}", vnp_TxnRef);
        
        return "mock-vnpay-payment";
    }

    /**
     * Mock callback từ VNPay
     * Giả lập callback thành công từ VNPay
     */
    @GetMapping("/callback-success")
    public String callbackSuccess(
            @RequestParam String vnp_TxnRef,
            @RequestParam String vnp_Amount,
            @RequestParam String returnUrl) {
        
        log.info("Mock VNPay Callback Success");
        log.info("Transaction Ref: {}", vnp_TxnRef);
        log.info("Amount: {}", vnp_Amount);
        
        // Tạo callback URL với response code 00 (thành công)
        String callbackUrl = returnUrl + 
                "?vnp_ResponseCode=00" +
                "&vnp_TxnRef=" + vnp_TxnRef +
                "&vnp_TransactionNo=123456789" +
                "&vnp_Amount=" + vnp_Amount;
        
        return "redirect:" + callbackUrl;
    }

    /**
     * Mock callback thất bại từ VNPay
     */
    @GetMapping("/callback-failed")
    public String callbackFailed(
            @RequestParam String vnp_TxnRef,
            @RequestParam String returnUrl) {
        
        log.info("Mock VNPay Callback Failed");
        log.info("Transaction Ref: {}", vnp_TxnRef);
        
        // Tạo callback URL với response code 01 (thất bại)
        String callbackUrl = returnUrl + 
                "?vnp_ResponseCode=01" +
                "&vnp_TxnRef=" + vnp_TxnRef;
        
        return "redirect:" + callbackUrl;
    }
}
