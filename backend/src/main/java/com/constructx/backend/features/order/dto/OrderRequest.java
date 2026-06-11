package com.constructx.backend.features.order.dto;

import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {

    /** CATALOG | CUSTOM */
    private String type;

    private String deliveryAddress;
    private String contactPhone;
    private String customerNote;

    /** Chỉ dùng cho CUSTOM order */
    private String customRequirements;
    private String referenceImageUrl;

    /** Danh sách sản phẩm đặt */
    private List<OrderItemRequest> items;

    @Data
    public static class OrderItemRequest {
        /** ID sản phẩm catalog (null nếu custom item) */
        private Long productId;

        /** Tên item tùy chỉnh (dùng khi productId == null) */
        private String customItemName;

        /** Ảnh tham chiếu cho custom item */
        private String customImageUrl;

        private int quantity;

        /** Đơn giá — bắt buộc với custom item, catalog tự lấy từ DB */
        private Long unitPrice;

        /** Ghi chú: màu, kích thước, vật liệu cụ thể */
        private String customNote;
    }
}
