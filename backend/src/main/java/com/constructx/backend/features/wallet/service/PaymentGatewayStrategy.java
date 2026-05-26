package com.constructx.backend.features.wallet.service;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

public interface PaymentGatewayStrategy {
    String createPaymentUrl(String orderId, Long amount, String description, HttpServletRequest request);
    boolean verifySignature(Map<String, String> params);
    String getGatewayName();
}