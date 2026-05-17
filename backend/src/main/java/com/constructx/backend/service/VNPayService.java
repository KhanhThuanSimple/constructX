package com.constructx.backend.service;

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

    @Value("${vnpay.hash-secret}")
    private String hashSecret;

    @Value("${vnpay.api-url}")
    private String apiUrl;

    @Value("${vnpay.return-url}")
    private String returnUrl;

    /**
     * Tạo URL thanh toán VNPay
     */
    public String createPaymentUrl(String orderId, Long amount, String orderInfo, HttpServletRequest request) {
        try {
            String vnp_Version = "2.1.0";
            String vnp_Command = "pay";
            String orderType = "other";

            // Dùng orderId trực tiếp làm vnp_TxnRef (WalletService đã generate unique ID)
            String vnp_TxnRef = orderId;

            // Lấy IP
            String vnp_IpAddr;
            try {
                vnp_IpAddr = request.getHeader("X-FORWARDED-FOR");
                if (vnp_IpAddr == null) {
                    vnp_IpAddr = request.getRemoteAddr();
                }
                if ("0:0:0:0:0:0:0:1".equals(vnp_IpAddr) || "::1".equals(vnp_IpAddr)) {
                    vnp_IpAddr = "127.0.0.1";
                }
            } catch (Exception e) {
                vnp_IpAddr = "127.0.0.1";
            }

            // Xây dựng map tham số
            Map<String, String> vnp_Params = new HashMap<>();
            vnp_Params.put("vnp_Version", vnp_Version);
            vnp_Params.put("vnp_Command", vnp_Command);
            vnp_Params.put("vnp_TmnCode", tmnCode);
            vnp_Params.put("vnp_Amount", String.valueOf(amount * 100));
            vnp_Params.put("vnp_CurrCode", "VND");
            vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
            vnp_Params.put("vnp_OrderInfo", orderInfo);
            vnp_Params.put("vnp_OrderType", orderType);
            vnp_Params.put("vnp_Locale", "vn");
            vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
            vnp_Params.put("vnp_ReturnUrl", returnUrl);

            // Thời gian tạo và hết hạn (Etc/GMT+7)
            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            String vnp_CreateDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

            cld.add(Calendar.MINUTE, 15);
            String vnp_ExpireDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

            // Sort và build hash data + query string
            List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
            Collections.sort(fieldNames);

            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();
            Iterator<String> itr = fieldNames.iterator();

            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = vnp_Params.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    if (hashData.length() > 0) {
                        hashData.append('&');
                        query.append('&');
                    }
                    // Khớp 100% code Java chính thức VNPay: dùng US_ASCII (KHÔNG phải UTF_8)
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));

                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                    query.append('=');
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                }
            }

            String queryUrl = query.toString();
            String hashDataStr = hashData.toString();

            // HMAC-SHA512
            String vnp_SecureHash = hmacSHA512(hashSecret, hashDataStr);

            String finalUrl = apiUrl + "?" + queryUrl + "&vnp_SecureHash=" + vnp_SecureHash;

            log.info("=== VNPAY PAYMENT URL DEBUG ===");
            log.info("TmnCode: {}", tmnCode);
            log.info("HashSecret length: {} chars", hashSecret.length());
            log.info("HashData: {}", hashDataStr);
            log.info("SecureHash: {}", vnp_SecureHash);
            log.info("Final URL: {}", finalUrl);
            log.info("===============================");

            return finalUrl;

        } catch (Exception e) {
            log.error("Error creating VNPay payment URL", e);
            throw new RuntimeException("Lỗi tạo link thanh toán VNPay: " + e.getMessage(), e);
        }
    }

    /**
     * Xác thực chữ ký callback từ VNPay.
     * Lưu ý: params từ @RequestParam đã được servlet decode (khoảng trắng = space, không phải +).
     * VNPay tạo signature từ URL đã encode, nên khi verify ta phải encode lại trước khi hash.
     */
    public boolean verifySignature(Map<String, String> params) {
        try {
            String vnp_SecureHash = params.get("vnp_SecureHash");
            if (vnp_SecureHash == null || vnp_SecureHash.isEmpty()) {
                log.warn("Missing vnp_SecureHash in callback params");
                return false;
            }

            // Loại bỏ vnp_SecureHashType và vnp_SecureHash trước khi hash
            Map<String, String> fields = new HashMap<>(params);
            fields.remove("vnp_SecureHashType");
            fields.remove("vnp_SecureHash");

            // Sort + RAW key + URLEncoded value (khớp chính xác với cách tạo URL)
            List<String> fieldNames = new ArrayList<>(fields.keySet());
            Collections.sort(fieldNames);

            StringBuilder sb = new StringBuilder();
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = fields.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    if (sb.length() > 0) {
                        sb.append("&");
                    }
                    sb.append(fieldName);
                    sb.append("=");
                    // Re-encode giá trị (servlet đã decode, ta cần encode lại để khớp hash VNPay)
                    sb.append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()));
                }
            }

            String signValue = hmacSHA512(hashSecret, sb.toString());
            log.debug("Verify - HashData: {}", sb.toString());
            log.debug("Verify - Computed: {}", signValue);
            log.debug("Verify - Received: {}", vnp_SecureHash);

            return signValue.equalsIgnoreCase(vnp_SecureHash);

        } catch (Exception e) {
            log.error("Error verifying VNPay signature", e);
            return false;
        }
    }

    /**
     * HMAC-SHA512
     */
    private String hmacSHA512(String key, String data) {
        try {
            if (key == null || data == null) {
                throw new NullPointerException();
            }
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes(StandardCharsets.UTF_8);
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            log.error("Error computing HMAC-SHA512", ex);
            return "";
        }
    }
}
