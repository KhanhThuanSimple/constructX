package com.constructx.backend.features.chat.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Grok AI Chatbot Service — tích hợp xAI Grok API cho hỗ trợ khách hàng 24/7
 */
@Service
@Slf4j
public class GrokChatbotService {

    @Value("${grok.api.key:}")
    private String grokApiKey;

    @Value("${grok.api.url:https://api.x.ai/v1/chat/completions}")
    private String grokApiUrl;

    @Value("${grok.model:grok-3-mini}")
    private String grokModel;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String SYSTEM_PROMPT = """
            Bạn là trợ lý AI của ConstructX — sàn thi công nội thất hàng đầu Việt Nam.
            
            Nhiệm vụ của bạn:
            1. Hỗ trợ khách hàng (Customer) tìm hiểu dịch vụ, đặt câu hỏi về dự án
            2. Hỗ trợ nhà thầu (Contractor) hiểu quy trình đấu thầu, thanh toán
            3. Giải đáp câu hỏi thường gặp về ứng dụng ConstructX
            
            Phạm vi hỗ trợ:
            - Quy trình tạo dự án và đấu thầu
            - Hướng dẫn thanh toán (VNPay, ví điện tử)
            - Giải thích các loại vật liệu nội thất (gỗ MDF, HDF, veneer, laminate...)
            - Tư vấn phong cách thiết kế nội thất (hiện đại, tân cổ điển, scandinavian...)
            - Quy trình xử lý tranh chấp và bảo hành
            - Hướng dẫn sử dụng tính năng chat, upload file, milestone
            
            Nguyên tắc:
            - Luôn trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp
            - Nếu câu hỏi vượt ngoài phạm vi, hướng dẫn liên hệ Admin
            - Không tiết lộ thông tin nội bộ hay API keys
            - Giữ câu trả lời ngắn gọn, không quá 300 từ
            - Dùng emoji phù hợp để tăng thân thiện
            """;

    /**
     * Gọi Grok API để trả lời câu hỏi
     */
    public String chat(String userMessage, List<Map<String, String>> conversationHistory) {
        if (grokApiKey == null || grokApiKey.isBlank()) {
            return generateFallbackResponse(userMessage);
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(grokApiKey);

            // Build message list: system + history + current
            List<Map<String, Object>> messages = new java.util.ArrayList<>();
            messages.add(Map.of("role", "system", "content", SYSTEM_PROMPT));

            // Add recent conversation history (last 10 messages max)
            if (conversationHistory != null) {
                int start = Math.max(0, conversationHistory.size() - 10);
                for (int i = start; i < conversationHistory.size(); i++) {
                    Map<String, String> h = conversationHistory.get(i);
                    messages.add(Map.of("role", h.get("role"), "content", h.get("content")));
                }
            }

            messages.add(Map.of("role", "user", "content", userMessage));

            Map<String, Object> requestBody = Map.of(
                    "model", grokModel,
                    "messages", messages,
                    "max_tokens", 500,
                    "temperature", 0.7
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(grokApiUrl, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                return root.path("choices").get(0).path("message").path("content").asText();
            }
        } catch (Exception e) {
            log.error("Grok API error: {}", e.getMessage());
        }

        return generateFallbackResponse(userMessage);
    }

    /**
     * Fallback khi không có Grok API key hoặc lỗi — dùng rule-based responses
     */
    private String generateFallbackResponse(String message) {
        String msg = message.toLowerCase().trim();

        if (msg.contains("thanh toán") || msg.contains("payment") || msg.contains("vnpay")) {
            return "💳 **Thanh toán tại ConstructX**\n\nHệ thống hỗ trợ thanh toán qua **VNPay**. Quy trình:\n1. Chọn nhà thầu & chấp nhận bid\n2. Nạp tiền vào ví ConstructX\n3. Tiền được giữ an toàn cho đến khi dự án hoàn thành\n\nCần hỗ trợ thêm? Chat với Admin nhé! 👆";
        }
        if (msg.contains("bảo hành") || msg.contains("guarantee") || msg.contains("warranty")) {
            return "🛡️ **Bảo hành tại ConstructX**\n\nMọi cam kết bảo hành phải được ghi rõ trong phòng chat dự án để có bằng chứng pháp lý. Thông thường:\n- Nội thất gỗ: 12-24 tháng\n- Thi công: 6-12 tháng\n\nHãy yêu cầu nhà thầu xác nhận bằng văn bản trong chat! 📝";
        }
        if (msg.contains("tranh chấp") || msg.contains("dispute") || msg.contains("khiếu nại")) {
            return "⚖️ **Xử lý tranh chấp**\n\nKhi có vấn đề:\n1. Nhấn **\"Báo cáo vấn đề\"** trên trang dự án\n2. Admin sẽ tham gia phòng chat để phân xử\n3. Lịch sử chat là bằng chứng pháp lý\n\nAdmin ConstructX luôn sẵn sàng hỗ trợ bạn! 💼";
        }
        if (msg.contains("tạo dự án") || msg.contains("đăng dự án") || msg.contains("create project")) {
            return "📋 **Tạo dự án mới**\n\n1. Vào **Tạo dự án** trên menu trái\n2. Mô tả chi tiết yêu cầu nội thất\n3. Đặt ngân sách và timeline\n4. Nhà thầu sẽ gửi bid cho bạn\n5. Xem bid, chat hỏi thêm → Chọn nhà thầu phù hợp\n\nDễ dàng và minh bạch! 🏠";
        }
        if (msg.contains("vật liệu") || msg.contains("mdf") || msg.contains("gỗ") || msg.contains("laminate")) {
            return "🪵 **Vật liệu nội thất phổ biến**\n\n- **MDF lõi xanh**: Chống ẩm tốt, dùng phòng tắm/bếp\n- **HDF**: Cứng hơn MDF, chịu lực cao\n- **Veneer**: Lớp gỗ thật mỏng, sang trọng\n- **Laminate**: Bề mặt đẹp, bền, giá hợp lý\n- **Gỗ tự nhiên**: Cao cấp nhất, giá cao\n\nHỏi thêm nhà thầu về vật liệu phù hợp ngân sách nhé! 💬";
        }
        if (msg.contains("đấu thầu") || msg.contains("bid") || msg.contains("nhà thầu")) {
            return "🏗️ **Quy trình đấu thầu**\n\n1. Nhà thầu duyệt dự án → Gửi bid với giá & timeline\n2. Khách hàng xem bid, **chat hỏi thêm** chi tiết\n3. Chọn bid phù hợp → Ký hợp đồng điện tử\n4. Tiến hành thi công với nhật ký cập nhật\n\nTip: Chọn nhà thầu phản hồi nhanh nhất! ⚡";
        }
        if (msg.contains("chào") || msg.contains("hello") || msg.contains("hi") || msg.contains("xin chào")) {
            return "👋 **Chào bạn đến với ConstructX!**\n\nTôi là trợ lý AI 24/7 của ConstructX. Tôi có thể giúp bạn:\n\n🏠 Tư vấn tạo dự án nội thất\n💰 Hướng dẫn thanh toán & ví\n🪵 Tư vấn vật liệu\n⚖️ Xử lý tranh chấp\n📱 Sử dụng các tính năng app\n\nBạn cần hỗ trợ gì? 😊";
        }
        if (msg.contains("upload") || msg.contains("file") || msg.contains("ảnh") || msg.contains("bản vẽ")) {
            return "📎 **Gửi file trong chat**\n\nBạn có thể gửi:\n- 🖼️ Ảnh JPG/PNG (tham khảo thiết kế)\n- 📄 File PDF (bản vẽ, hợp đồng)\n- 📐 File 3D (SketchUp .skp, .glb)\n- 📊 Excel báo giá (.xlsx)\n\nNhấn biểu tượng 📎 trong ô nhập tin nhắn để đính kèm! Tối đa 10MB.";
        }

        // Default
        return "🤖 Xin chào! Tôi là trợ lý AI của ConstructX.\n\nCâu hỏi của bạn đã được ghi nhận. Để được hỗ trợ chính xác hơn, bạn có thể:\n\n1. Hỏi cụ thể hơn về: thanh toán, vật liệu, đấu thầu, tranh chấp...\n2. **Chat trực tiếp với Admin** bằng cách nhấn nút hỗ trợ bên dưới\n\nTôi luôn ở đây 24/7 để giúp bạn! 😊";
    }
}
