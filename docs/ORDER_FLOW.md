# Luồng Đặt Hàng — ConstructX Shop

## Tổng quan

Hệ thống đặt hàng ConstructX sử dụng **một luồng thống nhất** cho cả hai loại đơn hàng:

| Loại | Mô tả |
|------|-------|
| 🛍️ **CATALOG** | Mua sản phẩm có sẵn từ shop (sofa, bàn, giường...) |
| 🎨 **CUSTOM** | Đặt sản xuất / thiết kế riêng theo yêu cầu |

Cả hai loại đều đi qua **cùng một chuỗi trạng thái** và cùng cơ chế đấu thầu từ nhà thầu.

---

## Sơ đồ trạng thái

```
Khách tạo đơn
      │
      ▼
 ┌─────────┐     feature flag BẬT (mặc định)     ┌─────────────┐
 │ PENDING │ ──────────────────────────────────► │             │
 └─────────┘                                     │             │
      │          feature flag TẮT (auto)          │             │
      └──────────────────────────────────────────►│OPEN_BIDDING │
                                                  │             │
                                                  └──────┬──────┘
                                                         │ Khách chọn nhà thầu
                                                         ▼
                                                  ┌────────────┐
                                                  │ PROCESSING │
                                                  └──────┬─────┘
                                                         │ Nhà thầu báo hoàn thành
                                                         ▼
                                                  ┌─────────┐
                                                  │ SHIPPED │
                                                  └────┬────┘
                                                       │ Khách xác nhận (hoặc 24h auto)
                                                       ▼
                                                  ┌───────────┐
                                                  │ DELIVERED │
                                                  └───────────┘

Bất kỳ giai đoạn nào (trước PROCESSING) có thể → CANCELLED
```

---

## Chi tiết từng trạng thái

### 1. PENDING — Chờ Admin duyệt
- **Khi nào**: Feature flag `orderApprovalRequired = true` (mặc định)
- **Ai thấy**: Khách hàng thấy trạng thái "Chờ Admin duyệt"
- **Admin làm gì**: Vào **Quản lý đơn hàng** → xem chi tiết → nhấn **Duyệt & Mở đấu giá**
- **API**: `POST /api/admin/orders/{id}/approve-bidding`
- **Kết quả**: Chuyển sang `OPEN_BIDDING`, toàn bộ nhà thầu đã được duyệt nhận thông báo

> **Bỏ qua bước này** khi admin tắt flag `orderApprovalRequired` trong **Cấu hình hệ thống → Tính năng**.  
> Khi tắt: đơn mới tạo tự động vào `OPEN_BIDDING`.

---

### 2. OPEN_BIDDING — Đang mở đấu giá
- **Khi nào**: Sau khi admin duyệt hoặc auto-approve
- **Ai thấy**: Nhà thầu thấy đơn trong trang **Đấu thầu đơn hàng**
- **Cơ chế**: **Blind bidding** — nhà thầu không thấy báo giá của nhau
- **Nhà thầu làm gì**: Gửi báo giá gồm: tổng giá, số ngày, bảng chi tiết hạng mục, mô tả năng lực
- **Khách hàng làm gì**: Xem danh sách báo giá → chọn nhà thầu phù hợp
- **API nhà thầu**: `POST /api/order-bids/{orderId}`
- **API khách chọn**: `POST /api/order-bids/order/{orderId}/accept/{bidId}`

---

### 3. PROCESSING — Đang thi công / sản xuất
- **Khi nào**: Khách hàng chọn nhà thầu → hợp đồng được tạo tự động ở trạng thái `ACTIVE`
- **Hợp đồng**: Được tạo tự động từ `OrderBidService.createContractFromOrderBid()`, có hiệu lực ngay
- **Nhà thầu làm gì**: Thi công / sản xuất sản phẩm theo yêu cầu
- **Khách hàng làm gì**: Theo dõi qua trang **Hợp đồng & Thi công**

---

### 4. SHIPPED — Đang giao hàng
- **Khi nào**: Nhà thầu nhấn **Báo hoàn thành** + upload ảnh sản phẩm thực tế
- **API**: `POST /api/orders/{id}/mark-done` với `completionImageUrl`
- **Bắt đầu**: Đếm ngược **24 giờ** — nếu khách không phản hồi, hệ thống tự động giải ngân
- **Khách hàng làm gì**: Kiểm tra ảnh → nhấn **Xác nhận đã nhận hàng** (hoặc chờ 24h)

---

### 5. DELIVERED — Hoàn thành
- **Khi nào**: Khách xác nhận nhận hàng hoặc auto-release sau 24h
- **Thanh toán**: Mini-Escrow giải ngân 100% trừ phí sàn 5% cho nhà thầu
- **API khách**: `POST /api/orders/{id}/confirm-delivery`
- **Sau đó**: Khách có thể **đánh giá nhà thầu**

---

### CANCELLED — Đã hủy
- **Được phép**: Khi đơn đang ở `PENDING` hoặc `OPEN_BIDDING`
- **Hoàn tiền**: Nếu đã lock cọc → tự động unlock về ví khách
- **API**: `POST /api/orders/{id}/cancel`

---

## Cơ chế Đấu giá (Blind Bidding)

```
Nhà thầu A ──► Gửi báo giá ──┐
Nhà thầu B ──► Gửi báo giá ──┤──► [Hệ thống giữ bí mật] ──► Khách hàng xem & chọn
Nhà thầu C ──► Gửi báo giá ──┘
```

- Địa chỉ giao hàng được ẩn một phần (chỉ hiện Quận/Huyện, TP)
- Giá gốc của sản phẩm bị ẩn với nhà thầu
- Sau khi khách chọn: các nhà thầu còn lại nhận thông báo "không được chọn"

---

## Cơ chế Thanh toán Mini-Escrow

```
Khách đặt hàng
      │
      ▼ (sau khi chọn nhà thầu)
  Lock 60% tiền từ ví khách → Frozen
      │
      ▼ (nhà thầu báo hoàn thành)
  Bắt đầu đếm 24h
      │
      ├── Khách xác nhận ──────────────────┐
      └── Auto sau 24h ────────────────────┤
                                           ▼
                              Lock thêm 40% còn lại
                              Debit 100% khỏi ví khách
                              Credit 95% vào ví nhà thầu
                              Phí sàn 5% → Platform Wallet
```

| Giai đoạn | Hành động tài chính |
|-----------|---------------------|
| Chọn nhà thầu | Lock 60% (depositAmount) vào Frozen |
| Nhà thầu báo xong | Không có giao dịch |
| Khách xác nhận / 24h | Lock thêm 40% → Debit 100% → Credit 95% cho nhà thầu |
| Hủy đơn | Unlock 60% về ví khách |

---

## Feature Flags kiểm soát luồng

Quản lý tại: **Admin → Cấu hình hệ thống → Tính năng**

| Flag | Key DB | Mặc định | Mô tả |
|------|--------|----------|-------|
| Duyệt đơn hàng | `feature.order.approvalRequired` | `true` | BẬT = admin duyệt trước khi mở đấu giá |
| Duyệt dự án | `feature.project.autoApprove` | `false` | BẬT = dự án tự động OPEN không cần admin |
| Admin duyệt giải ngân | `feature.disbursement.adminApprovalRequired` | `true` | BẬT = admin xác nhận giải ngân hợp đồng |
| Chatbox AI | `feature.chat.enabled` | `true` | Bật/tắt trợ lý Grok AI |
| Thanh toán VNPay | `feature.vnpay.enabled` | `true` | Bật/tắt cổng nạp tiền VNPay |

### Kịch bản: Tắt duyệt đơn hàng

```
Trước (flag BẬT):
  Khách tạo đơn → PENDING → Admin duyệt → OPEN_BIDDING → ...

Sau (flag TẮT):
  Khách tạo đơn → OPEN_BIDDING (ngay lập tức) → Nhà thầu nhận thông báo → ...
```

---

## API Endpoints tóm tắt

### Khách hàng

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/api/orders` | Tạo đơn hàng mới |
| `GET` | `/api/orders/my` | Danh sách đơn của tôi |
| `GET` | `/api/orders/{id}` | Chi tiết đơn hàng |
| `POST` | `/api/orders/{id}/cancel` | Hủy đơn (hoàn cọc) |
| `POST` | `/api/orders/{id}/confirm-delivery` | Xác nhận nhận hàng → giải ngân |
| `POST` | `/api/order-bids/order/{orderId}/accept/{bidId}` | Chọn nhà thầu |

### Nhà thầu

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/order-bids/open` | Danh sách đơn đang mở đấu giá |
| `POST` | `/api/order-bids/{orderId}` | Gửi báo giá |
| `GET` | `/api/order-bids/my` | Báo giá đã gửi |
| `GET` | `/api/order-bids/assigned` | Đơn được giao |
| `POST` | `/api/orders/{id}/mark-done` | Báo hoàn thành + ảnh |

### Admin

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/admin/orders` | Tất cả đơn hàng |
| `POST` | `/api/admin/orders/{id}/approve-bidding` | Duyệt → mở đấu giá |
| `PUT` | `/api/admin/orders/{id}/status` | Cập nhật trạng thái thủ công |
| `GET` | `/api/admin/settings` | Lấy cấu hình hệ thống |
| `POST` | `/api/admin/settings` | Lưu cấu hình hệ thống |

---

## Các file liên quan

```
backend/
  features/order/
    entity/Order.java              — Entity đơn hàng, enum Status
    entity/OrderBid.java           — Entity báo giá nhà thầu
    service/OrderService.java      — Tạo đơn, auto-approve logic
    service/OrderBidService.java   — Đấu thầu, chọn thầu, tạo HĐ
    service/OrderPaymentService.java — Mini-Escrow, lock/release tiền
    controller/OrderController.java
    controller/OrderBidController.java
  admin/
    service/FeatureFlagService.java — Quản lý tất cả feature flags
    service/AdminSettingsService.java

frontend/
  pages/OrdersPage.jsx             — Trang đơn hàng của khách hàng
  pages/AdminOrdersPage.jsx        — Trang quản lý đơn hàng admin
  pages/OrderBiddingPage.jsx       — Trang đấu thầu dành cho nhà thầu
  pages/AdminSettingsPage.jsx      — Cấu hình hệ thống (feature flags)
  pages/shop/OrderCheckoutPage.jsx — Trang thanh toán đặt hàng
```
