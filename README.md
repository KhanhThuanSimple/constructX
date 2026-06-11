# ConstructX — Nền tảng Thi công & Nội thất

> Sàn kết nối khách hàng với nhà thầu thi công nội thất, tích hợp đặt hàng sản phẩm, hệ thống đấu giá bảo mật, hợp đồng điện tử và thanh toán escrow.

---

## Mục lục

- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Tài khoản test](#tài-khoản-test)
- [Luồng hoạt động](#luồng-hoạt-động)
- [API Endpoints](#api-endpoints)
- [Hướng dẫn chạy](#hướng-dẫn-chạy)
- [Database Schema](#database-schema)

---

## Kiến trúc hệ thống

```
Frontend (React + Vite)  →  Backend (Spring Boot)  →  MySQL
        :5173                      :8080               :3306
```

**Stack:**
- Frontend: React 19, Vite 8, Tailwind CSS 3, Zustand, Axios, React Router 7
- Backend: Spring Boot 3.2, Spring Security (JWT), Hibernate JPA, WebSocket (STOMP)
- DB: MySQL 8 (`constructx_db`)
- Payment: VNPay sandbox

---

## Tài khoản test

| Role | Email | Password | Trạng thái |
|------|-------|----------|-----------|
| **Admin** | `admin@constructx.com` | `admin123` | Approved |
| **Khách hàng 1** | `khachhang1@test.com` | `test123` | Approved |
| **Khách hàng 2** | `khachhang2@test.com` | `test123` | Approved |
| **Khách hàng 3** | `khachhang3@test.com` | `test123` | Approved |
| **Nhà thầu A** | `nhathauchuyennghiep@test.com` | `test123` | Approved |
| **Nhà thầu B** | `nhaxuong_abc@test.com` | `test123` | Approved |
| **Nhà thầu C** | `noithat_vietlong@test.com` | `test123` | Approved |
| **Nhà thầu (chưa duyệt)** | `contractor_pending@test.com` | `test123` | **Pending** |

---

## Luồng hoạt động

### 1. Luồng Đặt hàng Sản phẩm Catalog (CUSTOMER)

```
[1] Customer vào /shop → Chọn sản phẩm → Nhấn "Đặt hàng ngay"
[2] Redirect → /shop/order (OrderCheckoutPage) → Điền địa chỉ + SĐT
[3] Submit → POST /api/orders → Order tạo với status = PENDING
[4] Admin nhận thông báo: "Đơn catalog mới cần xác nhận"
[5] Admin vào /admin/orders → Xem đơn → Nhấn "Bắt đầu sản xuất"
    → PUT /api/admin/orders/{id}/status {status: "PROCESSING"}
[6] Customer nhận thông báo: "Đơn đang được sản xuất"
[7] Admin → SHIPPED → Customer nhận: "Đang giao hàng"
[8] Admin → DELIVERED → Hoàn tất
```

**Trang liên quan:**
- Customer: `/shop` → `/shop/order` → `/orders`
- Admin: `/admin/orders`

---

### 2. Luồng Đặt hàng Tùy chỉnh + Đấu giá bảo mật (CUSTOM ORDER)

```
[1] Customer vào /shop/order → Thêm SP tùy chỉnh hoặc /shop/designer
[2] Submit → POST /api/orders → Order.type=CUSTOM, status=PENDING
[3] Admin nhận thông báo: "Đơn tùy chỉnh mới cần phê duyệt"

[4] Admin vào /admin/orders → Nhấn "Duyệt & Mở đấu giá"
    → POST /api/admin/orders/{id}/approve-bidding
    → Order.status → OPEN_BIDDING
    → TẤT CẢ nhà thầu được duyệt nhận thông báo: "Đơn mới đang mở đấu giá"
    → Customer nhận thông báo: "Đơn đã được duyệt, đang mở đấu giá"

[5] Nhà thầu vào /order-bidding → Tab "Đang mở" → Xem yêu cầu
    → Nhấn "Gửi báo giá" → Modal điền hạng mục chi tiết
    → POST /api/order-bids/{orderId}
    → Customer nhận thông báo: "Nhận được báo giá mới từ [tên nhà thầu]"

    ⚠️ BLIND BIDDING: Nhà thầu KHÔNG thể xem báo giá của đối thủ
    Endpoint GET /api/order-bids/open trả về dữ liệu ẩn giá của KH

[6] Customer vào /orders → Đơn OPEN_BIDDING → Nhấn "Xem báo giá"
    → GET /api/order-bids/order/{orderId} (chỉ owner/admin được gọi)
    → Xem chi tiết từng báo giá với bảng hạng mục
    → Nhấn "Chọn nhà thầu này"
    → POST /api/order-bids/order/{orderId}/accept/{bidId}
    → Order.status → BIDDING_CLOSED
    → Nhà thầu được chọn nhận thông báo: "Báo giá được chấp nhận"
    → Nhà thầu khác nhận: "Cảm ơn đã tham gia..."
    → Admin nhận: "Đơn {X} đã chọn nhà thầu, cần ký hợp đồng"

[7] Admin → PROCESSING → DELIVERED (quy trình tương tự catalog)
```

**Trang liên quan:**
- Customer: `/shop/order` → `/shop/designer` → `/orders` (xem + chọn nhà thầu)
- Contractor: `/order-bidding` (xem đơn mở + gửi báo giá + xem bids của mình)
- Admin: `/admin/orders` (duyệt + theo dõi + cập nhật trạng thái)

---

### 3. Luồng Thiết kế 2D + Đặt hàng (CUSTOMER)

```
[1] Customer vào /shop/designer (FurnitureDesignerPage)
[2] Kéo thả module vào canvas (sofa, tủ, bàn...) — 16 module sẵn có
[3] Resize module → Giá tự tính real-time
[4] Xem BOM (Bill of Materials) tự động
[5] Nhấn "Đặt hàng" → Modal điền địa chỉ
[6] Submit → POST /api/orders với type=CUSTOM + BOM trong customRequirements
[7] → Tiếp tục luồng Đặt hàng Tùy chỉnh (bước 3 trở đi)
```

---

### 4. Luồng Dự án Thi công + Đấu thầu Dự án (PROJECT BIDDING)

```
[1] Customer vào /projects/new → 4-bước wizard (chọn sản phẩm mẫu từ catalog)
    → POST /api/projects → Project.status=OPEN, approvalStatus=PENDING

[2] Admin vào /admin/projects → Duyệt → approvalStatus=APPROVED

[3] Contractor vào /projects/browse → Xem dự án → /projectsv2/{id}
    → Modal gửi báo giá chi tiết (BidController)
    → POST /api/bids

[4] Customer vào /projects/{id} → Xem báo giá (BLIND BIDDING)
    → GET /api/projects/{id}/bids (chỉ owner/admin)
    → Nhấn "Chấp nhận" → POST /api/projects/{id}/accept-bid/{bidId}
    → Hợp đồng tự động tạo với status=PENDING_REVIEW

[5] Admin vào /admin/contracts → Kiểm duyệt điều khoản → Phê duyệt
    → Contract.status → WAITING_SIGNATURE
    → Hai bên nhận thông báo "Cần ký hợp đồng"

[6] Customer + Contractor vào /contracts → Nhấn "Ký hợp đồng"
    → POST /api/contracts/{id}/sign → ACTIVE → Thi công bắt đầu
```

**Trang liên quan:**
- Customer: `/projects/new` → `/projects` → `/projects/{id}` → `/contracts`
- Contractor: `/projects/browse` → `/projectsv2/{id}` (gửi báo giá)
- Admin: `/admin/projects`, `/admin/contracts`

---

### 5. Luồng Xử lý Tranh chấp (DISPUTE)

```
[1] Dispute phát sinh trong quá trình thi công
[2] Admin vào /admin/disputes → Xem chi tiết → Gửi tin nhắn hòa giải
[3] Giải quyết → Điều chỉnh escrow nếu cần
```

---

### 6. Luồng Thanh toán VNPay (WALLET)

```
[1] Customer/Contractor vào /wallet → Nhấn "Nạp tiền"
[2] → Tạo đơn VNPay sandbox → Redirect sang cổng VNPay
[3] Thanh toán thành công → Callback → Nạp vào ví
[4] Escrow: Tiền khóa khi chọn nhà thầu → Giải ngân khi milestone hoàn thành
```

---

## API Endpoints

### Auth (Public)
| Method | URL | Mô tả |
|--------|-----|-------|
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/login` | Đăng nhập |

### Public Catalog (No auth)
| Method | URL | Mô tả |
|--------|-----|-------|
| GET | `/api/public/products` | Danh sách sản phẩm (`?category=&search=`) |
| GET | `/api/public/products/featured` | Sản phẩm nổi bật |
| GET | `/api/public/products/{id}` | Chi tiết sản phẩm |
| GET | `/api/public/materials` | Danh mục vật liệu |

### Orders (Customer)
| Method | URL | Mô tả |
|--------|-----|-------|
| POST | `/api/orders` | Tạo đơn hàng |
| GET | `/api/orders/my` | Đơn của tôi |
| GET | `/api/orders/{id}` | Chi tiết đơn |
| POST | `/api/orders/{id}/cancel` | Hủy đơn (chỉ PENDING) |

### Order Bidding
| Method | URL | Role | Mô tả |
|--------|-----|------|-------|
| GET | `/api/order-bids/open` | CONTRACTOR | Đơn đang mở đấu giá |
| POST | `/api/order-bids/{orderId}` | CONTRACTOR | Gửi báo giá |
| GET | `/api/order-bids/my` | CONTRACTOR | Bids của tôi |
| GET | `/api/order-bids/order/{orderId}` | CUSTOMER/ADMIN | Tất cả bids (blind) |
| POST | `/api/order-bids/order/{orderId}/accept/{bidId}` | CUSTOMER | Chọn nhà thầu |

### Admin Orders
| Method | URL | Mô tả |
|--------|-----|-------|
| GET | `/api/admin/orders` | Tất cả đơn (`?status=`) |
| POST | `/api/admin/orders/{id}/approve-bidding` | Duyệt → mở đấu giá |
| PUT | `/api/admin/orders/{id}/status` | Cập nhật trạng thái |

### Projects
| Method | URL | Role | Mô tả |
|--------|-----|------|-------|
| GET | `/api/projects/open` | ALL | Dự án đang mở thầu |
| GET | `/api/projects/my` | CUSTOMER | Dự án của tôi |
| POST | `/api/projects` | CUSTOMER | Tạo dự án |
| GET | `/api/projects/{id}/bids` | CUSTOMER/ADMIN | Bids của dự án |
| POST | `/api/projects/{id}/accept-bid/{bidId}` | CUSTOMER | Chọn nhà thầu |

### Contracts
| Method | URL | Role | Mô tả |
|--------|-----|------|-------|
| GET | `/api/contracts/my` | CUSTOMER/CONTRACTOR | Hợp đồng của tôi |
| POST | `/api/contracts/{id}/sign` | CUSTOMER/CONTRACTOR | Ký hợp đồng |
| GET | `/api/admin/contracts` | ADMIN | Tất cả hợp đồng |
| POST | `/api/admin/contracts/{id}/approve` | ADMIN | Phê duyệt HĐ |
| POST | `/api/admin/contracts/{id}/reject` | ADMIN | Từ chối HĐ |
| PUT | `/api/admin/contracts/{id}/terms` | ADMIN | Chỉnh điều khoản |

### Admin Dashboard
| Method | URL | Mô tả |
|--------|-----|-------|
| GET | `/api/admin/dashboard/stats` | Stats + chart data (6 tháng) |
| GET | `/api/admin/orders` | Quản lý đơn hàng |
| GET | `/api/admin/contracts` | Quản lý hợp đồng |
| GET | `/api/admin/products` | Quản lý sản phẩm Shop |
| GET | `/api/admin/projects` | Duyệt dự án |
| GET | `/api/admin/partners` | Duyệt nhà thầu |
| GET | `/api/admin/disputes` | Tranh chấp |
| GET | `/api/admin/settings` | Cấu hình phí |

---

## Hướng dẫn chạy

### Backend
```bash
cd backend
./mvnw spring-boot:run
# Hoặc: mvnw.cmd spring-boot:run (Windows)
# Server: http://localhost:8080
```

**Yêu cầu:**
- Java 21+
- MySQL 8 đang chạy tại `localhost:3306`
- Database `constructx_db` đã tạo
- `application.yml`: điền `username` và `password` MySQL

**Tự động khi khởi động:**
1. Hibernate tạo/cập nhật schema
2. `DataSeeder` tạo bảng còn thiếu (JDBC raw)
3. Seed 8 tài khoản test, 17 sản phẩm, 7 dự án, 8 đơn hàng

### Frontend
```bash
cd frontend
npm install
npm run dev
# Dev server: http://localhost:5173
```

---

## Database Schema

```
users                    — Tài khoản (CUSTOMER | CONTRACTOR | ADMIN)
wallets                  — Ví tiền (1-1 với users)
transactions             — Lịch sử giao dịch ví

products                 — Sản phẩm nội thất (admin quản lý)
orders                   — Đơn đặt hàng (CATALOG / CUSTOM)
order_items              — Chi tiết sản phẩm trong đơn
order_bids               — Báo giá nhà thầu cho đơn CUSTOM
order_bid_items          — Chi tiết hạng mục trong báo giá

project                  — Dự án thi công (khách hàng đăng)
bids                     — Báo giá nhà thầu cho dự án
bid_details              — Chi tiết hạng mục trong bid dự án
contract_jobs            — Hợp đồng công việc (bid được chọn)
work_plans               — Kế hoạch thi công
work_milestones          — Các mốc milestone
milestone_updates        — Cập nhật tiến độ thi công

contracts                — Hợp đồng điện tử (từ accept bid)
contract_stages          — Lịch sử trạng thái hợp đồng

disputes                 — Tranh chấp
dispute_messages         — Tin nhắn tranh chấp

chat_rooms               — Phòng chat
chat_room_members        — Thành viên phòng chat
chat_messages            — Tin nhắn chat

notifications            — Thông báo hệ thống
material_categories      — Danh mục vật liệu (admin quản lý)
system_settings          — Cấu hình hệ thống (phí, ...)
```

---

## Tính năng nổi bật

| Tính năng | Mô tả |
|-----------|-------|
| **Đấu giá bảo mật** | Nhà thầu gửi báo giá mà không thấy giá đối thủ |
| **Thiết kế 2D** | Kéo thả module nội thất, tính giá real-time, xuất BOM |
| **Hợp đồng điện tử** | Tự động tạo từ bid được chọn, admin kiểm duyệt |
| **Escrow** | Tiền khóa khi ký HĐ, giải ngân khi nghiệm thu |
| **Blind bidding** | API phân quyền nghiêm ngặt — contractor không xem bid của nhau |
| **Real-time chat** | WebSocket (STOMP) giữa customer ↔ contractor |
| **Dashboard charts** | Biểu đồ Canvas thuần — doanh thu, dự án, đơn hàng 6 tháng |
| **AI Chatbot** | Grok AI hỗ trợ tư vấn (xAI API) |
| **VNPay** | Nạp tiền ví qua cổng thanh toán sandbox |
