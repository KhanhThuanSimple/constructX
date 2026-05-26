package com.constructx.backend.features.wallet.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class VNPayGatewayStrategy implements PaymentGatewayStrategy {

    private final VNPayService vnPayService;

    @Override
    public String createPaymentUrl(String orderId, Long amount, String description, HttpServletRequest request) {
        return vnPayService.createNormalPaymentUrl(orderId, amount, description, request);
    }

    @Override
    public boolean verifySignature(Map<String, String> params) {
        return vnPayService.verifySignature(params);
    }

    @Override
    public String getGatewayName() {
        return "VNPAY";
    }
}