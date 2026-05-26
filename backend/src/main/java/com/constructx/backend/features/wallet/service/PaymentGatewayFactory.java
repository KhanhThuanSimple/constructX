package com.constructx.backend.features.wallet.service;

import org.springframework.stereotype.Component;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class PaymentGatewayFactory {

    private final Map<String, PaymentGatewayStrategy> strategies = new HashMap<>();

    public PaymentGatewayFactory(List<PaymentGatewayStrategy> gatewayStrategies) {
        for (PaymentGatewayStrategy strategy : gatewayStrategies) {
            strategies.put(strategy.getGatewayName().toUpperCase(), strategy);
        }
    }

    public PaymentGatewayStrategy getGateway(String gatewayName) {
        PaymentGatewayStrategy strategy = strategies.get(gatewayName.toUpperCase());
        if (strategy == null) {
            throw new IllegalArgumentException("Cổng thanh toán không hỗ trợ: " + gatewayName);
        }
        return strategy;
    }
}