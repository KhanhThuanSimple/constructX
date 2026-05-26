package com.constructx.backend.features.wallet.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@Slf4j
public class VNPayService {

    @Value("${vnpay.tmn-code}")
    private String tmnCode;

    @Value("${vnpay.hash-secret-normal}")
    private String hashSecretNormal;

    @Value("${vnpay.hash-secret-token}")
    private String hashSecretToken;

    @Value("${vnpay.return-url}")
    private String returnUrl;
    public String getHashSecretNormal() {
        return this.hashSecretNormal;
    }
    public String createNormalPaymentUrl(String orderId, Long amount, String description, HttpServletRequest request) {
        log.info("[VNPAY OUTBOUND] Bắt đầu khởi tạo giao dịch THƯỜNG. OrderId: {}, Amount: {}", orderId, amount);
        try {
            Map<String, String> vnp_Params = new HashMap<>();
            vnp_Params.put("vnp_Version", "2.1.0");
            vnp_Params.put("vnp_Command", "pay");
            vnp_Params.put("vnp_TmnCode", tmnCode);
            vnp_Params.put("vnp_Amount", String.valueOf(amount * 100));
            vnp_Params.put("vnp_CurrCode", "VND");
            vnp_Params.put("vnp_TxnRef", orderId);
            vnp_Params.put("vnp_OrderInfo", description);
            vnp_Params.put("vnp_OrderType", "other");
            vnp_Params.put("vnp_Locale", "vn");
            vnp_Params.put("vnp_ReturnUrl", returnUrl);

            String clientIp = getClientIp(request);
            if ("127.0.0.1".equals(clientIp)) {
                clientIp = "8.8.8.8";
            }
            vnp_Params.put("vnp_IpAddr", clientIp);

            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            vnp_Params.put("vnp_CreateDate", formatter.format(cld.getTime()));

            cld.add(Calendar.MINUTE, 15);
            vnp_Params.put("vnp_ExpireDate", formatter.format(cld.getTime()));

            return buildFinalUrl(vnp_Params, hashSecretNormal);
        } catch (Exception e) {
            log.error("[VNPAY OUTBOUND ERROR] Lỗi nghiêm trọng khi sinh URL thanh toán thường: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi sinh URL cấu hình VNPAY thường", e);
        }
    }

    public String createTokenPaymentUrl(String orderId, Long amount, String command, String tokenStr, Long userId, HttpServletRequest request) {
        log.info("[VNPAY OUTBOUND] Bắt đầu khởi tạo luồng TOKENIZATION. Command: {}, OrderId: {}, UserId: {}", command, orderId, userId);
        try {
            Map<String, String> vnp_Params = new HashMap<>();
            vnp_Params.put("vnp_Version", "2.1.0");
            vnp_Params.put("vnp_Command", command);
            vnp_Params.put("vnp_TmnCode", tmnCode);
            vnp_Params.put("vnp_Amount", String.valueOf(amount != null ? amount * 100 : 0L));
            vnp_Params.put("vnp_CurrCode", "VND");
            vnp_Params.put("vnp_TxnRef", orderId);
            vnp_Params.put("vnp_OrderInfo", "Giao dich Token command: " + command);
            vnp_Params.put("vnp_OrderType", "other");
            vnp_Params.put("vnp_Locale", "vn");
            vnp_Params.put("vnp_ReturnUrl", returnUrl);
            vnp_Params.put("vnp_AppUserId", String.valueOf(userId));

            if (tokenStr != null && !tokenStr.isEmpty()) {
                vnp_Params.put("vnp_Token", tokenStr);
                log.debug("[VNPAY OUTBOUND] Đã đính kèm Token liên kết vào tham số: {}", tokenStr);
            }

            String clientIp = getClientIp(request);
            if ("127.0.0.1".equals(clientIp)) {
                clientIp = "8.8.8.8";
            }
            vnp_Params.put("vnp_IpAddr", clientIp);

            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            vnp_Params.put("vnp_CreateDate", formatter.format(cld.getTime()));

            cld.add(Calendar.MINUTE, 15);
            vnp_Params.put("vnp_ExpireDate", formatter.format(cld.getTime()));

            return buildFinalUrl(vnp_Params, hashSecretToken);
        } catch (Exception e) {
            log.error("[VNPAY OUTBOUND ERROR] Lỗi nghiêm trọng khi sinh URL thanh toán Token: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi sinh URL cấu hình VNPAY Token", e);
        }
    }

    public boolean verifySignature(Map<String, String> params) {
        log.info("[VNPAY INBOUND] Bắt đầu xác thực chữ ký dữ liệu phản hồi từ VNPay...");
        try {
            String vnp_SecureHash = params.get("vnp_SecureHash");
            if (vnp_SecureHash == null || vnp_SecureHash.isEmpty()) {
                log.warn("[VNPAY SIGNATURE WARN] Phản hồi không chứa tham số chữ ký 'vnp_SecureHash'");
                return false;
            }

            Map<String, String> fields = new HashMap<>(params);
            fields.remove("vnp_SecureHashType");
            fields.remove("vnp_SecureHash");

            List<String> fieldNames = new ArrayList<>(fields.keySet());
            Collections.sort(fieldNames);

            StringBuilder sb = new StringBuilder();
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = fields.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    sb.append(fieldName).append("=");
                    sb.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()).replace("+", "%20"));
                    if (itr.hasNext()) sb.append("&");
                }
            }

            String rawData = sb.toString();
            log.debug("[VNPAY INBOUND DEBUG] Chuỗi Hash thô nhận được từ VNPay: {}", rawData);

            // Tính toán mã băm thử nghiệm bằng cả 2 khóa bí mật
            String actualHashNormal = hmacSHA512(hashSecretNormal, rawData);
            String actualHashToken = hmacSHA512(hashSecretToken, rawData);

            log.debug("[VNPAY INBOUND DEBUG] Chữ ký gốc của VNPay gửi sang : {}", vnp_SecureHash);
            log.debug("[VNPAY INBOUND DEBUG] Chữ ký tự tính toán (Khóa THƯỜNG): {}", actualHashNormal);
            log.debug("[VNPAY INBOUND DEBUG] Chữ ký tự tính toán (Khóa TOKEN): {}", actualHashToken);

            boolean isNormalValid = actualHashNormal.equalsIgnoreCase(vnp_SecureHash);
            boolean isTokenValid = actualHashToken.equalsIgnoreCase(vnp_SecureHash);

            if (isNormalValid) {
                log.info("[VNPAY INBOUND] Xác thực chữ ký THÀNH CÔNG (Khớp với Khóa THƯỜNG)");
                return true;
            } else if (isTokenValid) {
                log.info("[VNPAY INBOUND] Xác thực chữ ký THÀNH CÔNG (Khớp với Khóa TOKEN)");
                return true;
            }

            log.error("[VNPAY SIGNATURE ERROR] Xác thực chữ ký THẤT BẠI. Chuỗi dữ liệu thô không khớp với bất kỳ khóa bí mật nào.");
            return false;
        } catch (Exception e) {
            log.error("[VNPAY SIGNATURE ERROR] Xảy ra ngoại lệ khi giải mã / xác thực chữ ký: {}", e.getMessage(), e);
            return false;
        }
    }

    private String buildFinalUrl(Map<String, String> vnp_Params, String secretKey) throws Exception {
        String baseUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();

        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);

            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                String encodedKey = URLEncoder.encode(fieldName, StandardCharsets.UTF_8.toString());
                String encodedValue = URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString());

                hashData.append(fieldName).append('=').append(encodedValue);
                query.append(encodedKey).append('=').append(encodedValue);

                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String queryUrl = query.toString();
        String vnp_SecureHash = hmacSHA512(secretKey, hashData.toString());

        // ĐÃ SỬA: Bỏ đoạn "= baseUrl =" gây lỗi biên dịch
        String finalUrl = baseUrl + "?" + queryUrl + "&vnp_SecureHash=" + vnp_SecureHash;

        log.info("[VNPAY OUTBOUND DEBUG] Chuỗi Hash gốc gửi đi: {}", hashData.toString());
        log.info("[VNPAY OUTBOUND INFO] Sinh URL chuyển hướng thành công: {}", finalUrl);

        return finalUrl;
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-FORWARDED-FOR");
        if (ip == null) ip = request.getRemoteAddr();
        if ("0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) ip = "127.0.0.1";
        return ip;
    }

    public String hmacSHA512(String key, String data) {
        try {
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            hmac512.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] result = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) sb.append(String.format("%02x", b & 0xff));
            return sb.toString();
        } catch (Exception ex) {
            log.error("[VNPAY CRYPTO ERROR] Lỗi thực hiện mã hóa thuật toán HMAC-SHA512: {}", ex.getMessage());
            return "";
        }
    }
}