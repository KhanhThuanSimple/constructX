# ConstructX — Sàn Thi Công & Mua Bán Nội Thất

> **Stack:** Spring Boot 3 · MySQL · React 18 · Tailwind CSS · JWT · VNPay · Cloudinary

---

## Mục lục

1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Khởi động dự án](#2-khởi-động-dự-án)
3. [Ba vai trò & luồng chức năng](#3-ba-vai-trò--luồng-chức-năng)
   - [CUSTOMER — Khách hàng](#31-customer--khách-hàng)
   - [CONTRACTOR — Nhà thầu](#32-contractor--nhà-thầu)
   - [ADMIN — Quản trị viên](#33-admin--quản-trị-viên)
4. [Luồng chính end-to-end](#4-luồng-chính-end-to-end)
   - [Luồng A: Đấu thầu thi công dự án](#luồng-a-đấu-thầu-thi-công-dự-án)
   - [Luồng B: Mua sản phẩm có sẵn (Catalog)](#luồng-b-mua-sản-phẩm-có-sẵn-catalog)
   - [Luồng C: Đơn hàng tùy chỉnh (Custom)](#luồng-c-đơn-hàng-tùy-chỉnh-custom)
   - [Luồng D: Hợp đồng & Ký kết](#luồng-d-hợp-đồng--ký-kết)
   - [Luồng E: Tiến độ thi công & Giải ngân](#luồng-e-tiến-độ-thi-công--giải-ngân)
5. [Hệ thống Ví & Escrow](#5-hệ-thống-ví--escrow)
6. [Hệ thống Chat & Hỗ trợ](#6-hệ-thống-chat--hỗ-trợ)
7. [Tranh chấp](#7-tranh-chấp)
8. [Cấu trúc thư mục](#8-cấu-trúc-thư-mục)
9. [API Reference nhanh](#9-api-reference-nhanh)
10. [Biến môi trường](#10-biến-môi-trường)

---

## 1. Tổng quan hệ thống

ConstructX là nền tảng thương mại điện tử B2B2C kết nối **Khách hàng** muốn thi công / mua nội thất với **Nhà thầu** thi công chuyên nghiệp, được **Admin** nền tảng giám sát và chứng thực.

```
CUSTOMER ──┐
           ├── ConstructX Platform ── ADMIN giám sát
CONTRACTOR─┘
```

### Hai luồng kinh doanh song song

| Luồng | Mô tả | Đấu thầu? |
|-------|-------|-----------|
| **Dự án thi công** | Customer đăng dự án → Contractor đấu thầu → Hợp đồng 3 bên | ✅ Blind bidding |
| **Shop nội thất** | Customer mua sản phẩm có sẵn hoặc đặt sản phẩm tùy chỉnh | ✅ (Custom) / ❌ (Catalog) |

---

## 2. Khởi động dự án

### Backend (Spring Boot)

```bash
cd backend
# Cấu hình DB trong application.yml (mặc định: localhost:3306/constructx_db, root/no-password)
./mvnw spring-boot:run
# hoặc
run.cmd
```

> Server khởi động tại `http://localhost:8080`
> 
> **Lưu ý:** Khi khởi động lần đầu sau cập nhật, `SchemaMigration` tự động chạy ALTER TABLE để sửa các constraint DB.

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

> App chạy tại `http://localhost:5173`

### Tài khoản mặc định (DataSeeder)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@constructx.com | password |
| Customer | customer@constructx.com | password |
| Contractor | contractor@constructx.com | password |

---

## 3. Ba vai trò & luồng chức năng

### 3.1 CUSTOMER — Khách hàng

#### Menu & Routes

| Nhóm | Chức năng | Route |
|------|-----------|-------|
| **Khám phá** | Trang chủ | `/` |
| | Cửa hàng nội thất | `/shop` |
| | Thiết kế 2D | `/shop/designer` |
| **Quản lý** | Tổng quan | `/dashboard` |
| | Tạo dự án | `/projects/new` |
| | Dự án của tôi | `/projects` |
| | Đơn hàng | `/orders` |
| | Hợp đồng | `/contracts` |
| **Cá nhân** | Tin nhắn | `/chat` |
| | Thông báo | `/notifications` |
| | Ví & Thanh toán | `/wallet` |
| | Cài đặt tài khoản | `/profile` |

#### Chức năng chi tiết

**🏗 Tạo & Quản lý Dự án**
- Tạo dự án thi công với mô tả, ngân sách, địa chỉ, phong cách, diện tích
- Xem danh sách báo giá từ các nhà thầu (blind bidding — nhà thầu không thấy giá nhau)
- Chấp nhận báo giá → tự động tạo hợp đồng + lock cọc 10% từ ví

**🛒 Mua sắm tại Shop**
- Duyệt sản phẩm catalog, xem chi tiết, thêm vào giỏ
- Thiết kế nội thất 2D (kéo thả nội thất vào sơ đồ phòng)
- Đặt đơn hàng có sẵn (CATALOG) hoặc tùy chỉnh (CUSTOM)
- Xem tiến trình đơn hàng theo stepper

**📋 Quản lý Đơn hàng**
- Xem tất cả đơn, lọc theo trạng thái
- Đơn CUSTOM: xem báo giá từ nhà thầu, chọn nhà thầu
- Hủy đơn khi còn PENDING (hoàn tiền cọc)

**📄 Hợp đồng**
- Xem danh sách hợp đồng
- Ký xác nhận hợp đồng sau khi Admin duyệt
- Xem tiến độ thi công & duyệt giải ngân theo giai đoạn
- Xuất / In hợp đồng PDF (đầy đủ thông tin 3 bên)

**💰 Ví & Thanh toán**
- Nạp tiền qua VNPay
- Xem lịch sử giao dịch
- Rút tiền (chờ Admin duyệt)

---

### 3.2 CONTRACTOR — Nhà thầu

#### Điều kiện hoạt động
> Tài khoản phải được Admin **phê duyệt** (`approvalStatus = APPROVED`) mới có thể gửi báo giá.
> Tài khoản `PENDING` vẫn xem được nhưng không gửi được báo giá.

#### Menu & Routes

| Nhóm | Chức năng | Route |
|------|-----------|-------|
| **Tổng quan** | Trang chủ | `/` |
| | Cửa hàng | `/shop` |
| | Bảng điều khiển | `/contractor/dashboard` |
| **Công việc** | Tìm dự án mới | `/projects/browse` |
| | Đấu thầu dự án | `/bids` |
| | Đấu thầu đơn hàng | `/order-bidding` |
| | Hợp đồng | `/contracts` |
| | Nhật ký thi công | `/production-log` |
| **Quản lý** | Hồ sơ năng lực | `/portfolio` |
| | Ví & Thu nhập | `/wallet` |
| **Cá nhân** | Tin nhắn | `/chat` |
| | Cài đặt | `/profile` |

#### Chức năng chi tiết

**🔍 Tìm & Đấu thầu Dự án**
- Marketplace dự án: lọc theo danh mục, ngân sách, địa chỉ
- Xem chi tiết dự án, gửi báo giá (hạng mục, đơn giá, tiến độ, ảnh mẫu)
- Rút báo giá nếu chưa được chọn
- Xem danh sách tất cả báo giá đã gửi

**🎯 Đấu thầu Đơn hàng**
- Xem các đơn hàng CUSTOM đang mở đấu giá (địa chỉ được ẩn bớt)
- Gửi báo giá chi tiết từng hạng mục

**📄 Hợp đồng**
- Xem hợp đồng được tạo khi Customer chọn báo giá
- Ký hợp đồng → hệ thống tự động **lock 5% ký quỹ** từ ví
- Sau khi cả 2 bên ký → hợp đồng `ACTIVE`

**🏗 Nhật ký Thi công** (hợp đồng ACTIVE)
- Cập nhật tiến độ (%, mô tả, ảnh minh chứng tối đa 6 ảnh/lần)
- Chọn giai đoạn: Khởi công / Thi công thô / Hoàn thiện / Bàn giao
- Hệ thống validate: tiến độ chỉ được tăng, không được giảm

**💵 Yêu cầu Giải ngân**
- Gửi yêu cầu giải ngân khi đạt mốc tiến độ (20% / 50% / 80% / 100%)
- Chọn tỉ lệ dùng ngay (20-70%) vs tiền bảo đảm locked
- Tối đa 80% giá trị hợp đồng trước khi hoàn công
- Tiền 20% cuối chỉ giải ngân khi Admin xác nhận hoàn thành

**💼 Hồ sơ năng lực**
- Upload ảnh công trình đã hoàn thiện
- Mô tả kinh nghiệm, chuyên ngành

---

### 3.3 ADMIN — Quản trị viên

#### Menu & Routes

| Nhóm | Chức năng | Route |
|------|-----------|-------|
| **Tổng quan** | Dashboard hệ thống | `/dashboard` |
| **Kinh doanh** | Duyệt dự án | `/admin/projects` |
| | Quản lý hợp đồng | `/admin/contracts` |
| | Quản lý đơn hàng | `/admin/orders` |
| | Sản phẩm Shop | `/admin/products` |
| **Người dùng** | Phê duyệt đối tác | `/admin/users` |
| | Quản lý người dùng | `/admin/all-users` |
| **Hỗ trợ** | Tranh chấp | `/admin/disputes` |
| | Duyệt tiền rút | `/admin/AdminWithdrawalsPage` |
| | Giám sát chat | `/admin/chat` |
| **Hệ thống** | Cấu hình | `/admin/settings` |
| | Thông báo | `/notifications` |
| | Cài đặt | `/profile` |

#### Chức năng chi tiết

**📋 Duyệt Dự án**
- Xem danh sách dự án đang chờ duyệt
- Phê duyệt → dự án hiển thị trên marketplace cho nhà thầu
- Từ chối với lý do

**📄 Quản lý Hợp đồng**
- Xem tất cả hợp đồng (từ dự án lẫn đơn hàng)
- Duyệt hợp đồng `PENDING_REVIEW` → `WAITING_SIGNATURE`
- Từ chối → hoàn cọc 10% cho Customer
- Chỉnh sửa điều khoản và giá (±10% giá gốc)
- Xác nhận hoàn thành → giải ngân toàn bộ cho nhà thầu

**📦 Quản lý Đơn hàng**
- **Đơn CATALOG:** Xác nhận → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
- **Đơn CUSTOM:** Duyệt & Mở đấu giá → nhà thầu vào báo giá → Customer chọn → auto tạo hợp đồng
- Hủy đơn với lý do (hoàn tiền cọc tự động)

**🛍 Quản lý Sản phẩm Shop**
- Thêm / sửa / xóa sản phẩm
- Quản lý tồn kho, danh mục, hình ảnh

**👥 Quản lý Người dùng**
- Phê duyệt / từ chối tài khoản nhà thầu
- Khoá / mở tài khoản
- Xem thông tin chi tiết tất cả users

**⚖️ Xử lý Tranh chấp**
- Xem tranh chấp từ cả 2 bên
- Chat trực tiếp trong room tranh chấp
- Quyết định phân chia tiền (% cho mỗi bên)

**💰 Duyệt Rút tiền**
- Xem danh sách yêu cầu rút tiền
- Duyệt → chuyển tiền thực tế (debit from platform)
- Từ chối → unlock tiền về available balance

**⚙️ Cấu hình Hệ thống**
- Tỉ lệ phí nền tảng, tỉ lệ cọc mặc định
- Các tham số vận hành

---

## 4. Luồng chính end-to-end

> **Lưu ý kiến trúc:** Hệ thống sử dụng **một quy trình hợp đồng duy nhất** cho mọi nguồn gốc.
> Dù hợp đồng được tạo từ dự án thi công (Luồng A) hay đơn hàng tùy chỉnh (nguồn `sourceOrder`),
> tất cả đều đi qua cùng một vòng đời: `PENDING_REVIEW → WAITING_SIGNATURE → ACTIVE → COMPLETED`.

### Luồng A: Đấu thầu Thi công Dự án *(Luồng chính — mọi quy trình hội tụ về đây)*

```
CUSTOMER                    ADMIN                    CONTRACTOR
    │                          │                          │
    ├─ Tạo dự án ─────────────►│                          │
    │                          ├─ Duyệt dự án ───────────►│ (hiện trên marketplace)
    │                          │                          │
    │◄──────────────────────────────────────────────────── Gửi báo giá
    │                          │                          │
    ├─ Xem báo giá (blind) ────►│                          │
    ├─ Chọn báo giá            │                          │
    │  → Lock cọc 10% (ví)     │                          │
    │  → Tạo HĐ PENDING_REVIEW ►│                          │
    │                          ├─ Duyệt HĐ ──────────────►│ (thông báo ký quỹ 5%)
    │◄─ Ký HĐ ─────────────────┤                          │
    │                          │              ◄────────── Ký HĐ + Lock 5% ký quỹ
    │                          │                          │
    │ [Cả 2 đã ký → HĐ ACTIVE] │                          │
    │                          │              ◄────────── Cập nhật nhật ký thi công
    │◄──────────────────────────────────────────────────── Yêu cầu giải ngân
    ├─ Duyệt/từ chối giải ngân ─►│                          │
    │                          │              ◄────────── Nhận tiền (locked + immediate)
    │                          │                          │
    │                          ├─ Xác nhận hoàn thành ───►│ (giải ngân 100%)
    │                          │  [HĐ → COMPLETED]        │
```

**Trạng thái Hợp đồng (dùng chung cho mọi nguồn gốc):**
`PENDING_REVIEW` → `WAITING_SIGNATURE` → `ACTIVE` → `COMPLETED` / `CANCELLED`

---

### Luồng B/C: Đơn hàng Shop — Hội tụ vào Luồng A

Đơn hàng **CATALOG** (sản phẩm có sẵn) và **CUSTOM** (tùy chỉnh) đều dùng bảng `orders`.
Khi Customer chọn nhà thầu cho đơn CUSTOM, hệ thống **tự động tạo Contract** với
`sourceOrder` trỏ đến đơn hàng đó. Từ đó, toàn bộ quy trình ký kết, thi công, giải ngân
**giống hệt Luồng A** — không có code riêng biệt.

```
CUSTOMER                    ADMIN                    CONTRACTOR
    │                          │                          │
    ├─ Đặt đơn (CATALOG/CUSTOM)►│                          │
    │                          │                          │
    │  [CATALOG]                ├─ Xác nhận → PROCESSING  │
    │                          │  → SHIPPED → DELIVERED   │
    │                          │                          │
    │  [CUSTOM]                 ├─ Duyệt & Mở đấu giá ───►│
    │                          │                          │
    │◄──────────────────────────────────────────────────── Gửi báo giá
    ├─ Chọn nhà thầu ──────────►│                          │
    │  → AUTO tạo HĐ            │ (PENDING_REVIEW)         │
    │                          │                          │
    │        ▼ Tiếp tục như Luồng A (ký kết, thi công, giải ngân) ▼
```

**Trạng thái Đơn hàng CATALOG:** `PENDING` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED` / `CANCELLED`

**Trạng thái Đơn hàng CUSTOM:** `PENDING` → `OPEN_BIDDING` → `BIDDING_CLOSED` → *(Contract tạo tự động, tiếp tục Luồng A)*

---

### Luồng D: Hợp đồng & Ký kết

```
Tạo HĐ (từ Project/Bid — Luồng A, hoặc từ Order/OrderBid — Luồng C)
        │
        ▼
  PENDING_REVIEW ──── Admin từ chối ──► CANCELLED (hoàn cọc; project → OPEN lại nếu có)
        │
        │ Admin duyệt
        ▼
 WAITING_SIGNATURE
        │
        ├─ Contractor ký → lock 5% ký quỹ
        ├─ Customer ký
        │
        │ Cả 2 đã ký
        ▼
     ACTIVE ──── Customer hủy (mất cọc 10%) ──► CANCELLED
        │         Contractor hủy (mất ký quỹ 5%, trừ điểm uy tín)
        │
        │ Admin xác nhận hoàn thành
        ▼
    COMPLETED
    (giải ngân toàn bộ cho Contractor)
```

---

### Luồng E: Tiến độ Thi công & Giải ngân

```
HĐ ACTIVE
    │
    ├─ CONTRACTOR cập nhật nhật ký
    │  (% tiến độ, mô tả, ảnh × 6)
    │
    ├─ Đạt ngưỡng (20%/50%/80%/100%)
    │  CONTRACTOR gửi yêu cầu giải ngân
    │
    │  CUSTOMER duyệt ──►  Trừ tiền ví Customer
    │                      Nhà thầu nhận:
    │                        • 40% dùng ngay (immediate)
    │                        • 60% vào locked balance
    │
    │  Đạt ngưỡng mới ──► Auto unlock locked của giai đoạn cũ
    │
    │  Tối đa 80% HĐ giải ngân trước khi hoàn công
    │
    └─ Admin xác nhận 100% hoàn công
       → Unlock tất cả locked còn lại
       → Giải ngân phần còn lại
       → Hoàn cọc cho Customer & Contractor
       → HĐ → COMPLETED
```

**4 Giai đoạn giải ngân mặc định:**

| Giai đoạn | Ngưỡng tiến độ | % Có thể giải ngân |
|-----------|---------------|-------------------|
| Khởi công | ≥ 20% | Tối đa 20% HĐ |
| Thi công thô | ≥ 50% | Tối đa 50% HĐ |
| Hoàn thiện | ≥ 80% | Tối đa 80% HĐ |
| Bàn giao | = 100% | 100% HĐ |

---

## 5. Hệ thống Ví & Escrow

### Cấu trúc Wallet

```
balance          = Tổng số dư thực tế
lockedAmount     = Số tiền đang bị đóng băng
availableBalance = balance - lockedAmount  (tính toán, không lưu DB)
```

### Các nghiệp vụ tiền tệ (WalletCoreManager)

| Method | Mô tả | Thay đổi |
|--------|-------|---------|
| `executeLockForOrder` | Lock tiền cọc/ký quỹ | lockedAmount ↑ |
| `executeDeposit` | Nạp tiền / doanh thu | balance ↑ |
| `executeUnlockAmount` | Giải phóng tiền locked | lockedAmount ↓ |
| `confirmDebitLocked` | Duyệt rút tiền thành công | balance ↓, lockedAmount ↓ |
| `recordTransaction` | Chỉ ghi audit log | Không đổi balance |
| `executeDisputeRefundDistribution` | Phân chia tiền tranh chấp | Nhiều wallet |

### Quy tắc Escrow Hợp đồng

```Customer chấp nhận báo giá
    ↓
Escrow 100% giá trị hợp đồng

Contractor ký HĐ
    ↓
Ký quỹ 5-10%

Thi công
    ↓
Giải ngân theo milestone

20%
50%
80%

Mỗi đợt:
    Admin Verify
    +
    Customer Approve

Hoàn công
    ↓
95% thanh toán

5% Warranty Hold

Sau 6 tháng bảo hành
    ↓
Trả 5% còn lại
    ↓
COMPLETED

---

## 6. Hệ thống Chat & Hỗ trợ

Customer/Contractor
        │
        ▼
   CREATE_DISPUTE
        │
        ▼
   CONTRACT_FREEZE
        │
        ▼
   DISPUTE_ROOM
        │
        ├─ Evidence Upload
        ├─ Chat
        ├─ Progress Logs
        │
        ▼
   ADMIN_REVIEW
        │
        ▼
   PROPOSED_DECISION
        │
        ├─ Accepted
        │      ↓
        │   Execute Refund
        │
        └─ Appeal
               ↓
        SENIOR_ADMIN
               ↓
        FINAL_DECISION
               ↓
           RESOLVEDt

---

  ## 7. Tranh chấp

  ```
Customer hoặc Contractor
        │
        ▼
   CREATE_DISPUTE
        │
        ▼
   CONTRACT_FREEZE
        │
        ├─ Freeze Escrow
        ├─ Freeze Disbursement
        └─ Freeze Deposit Unlock
        │
        ▼
    DISPUTE_ROOM
        │
        ├─ Evidence Upload
        ├─ Chat
        ├─ Progress Logs
        └─ Contract History
        │
        ▼
    ADMIN_REVIEW
        │
        ▼
   PROPOSED_DECISION
        │
        ├─ Refund: X%
        ├─ Contractor: Y%
        └─ Reason
        │
        ▼
   CUSTOMER & CONTRACTOR
        │
        ├─ Accept
        └─ Appeal
        │
        ▼
   SENIOR_ADMIN_REVIEW
        │
        ▼
   FINAL_DECISION
        │
        ▼
executeDisputeRefundDistribution(...)
        │
        ▼
      RESOLVED

---

## 8. Cấu trúc thư mục

```
TMDT_project/
├── backend/                          # Spring Boot API
│   └── src/main/java/com/constructx/
│       ├── admin/                    # Admin-specific DTOs, controllers
│       ├── config/
│       │   ├── DataSeeder.java       # Seed dữ liệu mẫu
│       │   ├── SchemaMigration.java  # Auto ALTER TABLE khi startup
│       │   └── SecurityConfig.java
│       └── features/
│           ├── auth/                 # JWT auth, login, register
│           ├── chat/                 # WebSocket chat rooms
│           ├── constructor/          # Bid, Contract, ConstructionLog, Disbursement
│           │   ├── entity/           # Contract, Bid, BidDetail, ConstructionLog,
│           │   │                     # ContractStage, DisbursementRequest
│           │   ├── service/          # ContractService, BidService,
│           │   │                     # ConstructionLogService, DisbursementService
│           │   └── controller/       # ContractController, BidController,
│           │                         # ConstructionLogController
│           ├── dispute/              # Tranh chấp
│           ├── notification/         # Thông báo real-time
│           ├── order/                # Shop orders (CATALOG + CUSTOM), OrderBid
│           ├── portfolio/            # Hồ sơ nhà thầu
│           ├── product/              # Sản phẩm shop
│           ├── project/              # Dự án thi công
│           ├── review/               # Đánh giá
│           ├── user/                 # User management
│           └── wallet/               # Ví, giao dịch, VNPay
│
└── frontend/                         # React 18 + Vite
    └── src/
        ├── components/
        │   ├── Layout.jsx            # Sidebar + Topbar (phân nhóm menu theo role)
        │   └── chat/
        ├── pages/
        │   ├── shop/                 # ShopPage, OrderCheckoutPage, FurnitureDesigner
        │   ├── AdminOrdersPage.jsx
        │   ├── AdminContractsPage.jsx
        │   ├── ContractsPage.jsx     # Xem HĐ + In PDF
        │   ├── ContractProgressPage.jsx  # Tiến độ + Giải ngân
        │   ├── ProductionLogPage.jsx
        │   └── ...
        └── store/
            └── useAuthStore.js       # Zustand auth state
```

---

## 9. API Reference nhanh

### Auth
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/login` | Đăng nhập → JWT |
| POST | `/api/auth/register` | Đăng ký |

### Projects
| Method | Endpoint | Role | Mô tả |
|--------|----------|------|-------|
| GET | `/api/projects/browse` | CONTRACTOR | Marketplace |
| POST | `/api/projects` | CUSTOMER | Tạo dự án |
| GET | `/api/projects/my` | CUSTOMER | Dự án của tôi |
| GET | `/api/projects/{id}/bids` | CUSTOMER/ADMIN | Xem báo giá |
| POST | `/api/projects/{id}/accept-bid/{bidId}` | CUSTOMER | Chọn báo giá → tạo HĐ |

### Contracts
| Method | Endpoint | Role | Mô tả |
|--------|----------|------|-------|
| GET | `/api/contracts/my` | ALL | HĐ của tôi |
| GET | `/api/contracts/{id}` | ALL | Chi tiết HĐ |
| POST | `/api/contracts/{id}/sign` | CUSTOMER/CONTRACTOR | Ký HĐ |
| POST | `/api/contracts/{id}/cancel-by-customer` | CUSTOMER | Hủy HĐ |
| POST | `/api/contracts/{id}/cancel-by-contractor` | CONTRACTOR | Hủy HĐ |
| GET | `/api/admin/contracts` | ADMIN | Tất cả HĐ |
| POST | `/api/admin/contracts/{id}/approve` | ADMIN | Duyệt HĐ |
| POST | `/api/admin/contracts/{id}/reject` | ADMIN | Từ chối HĐ |
| POST | `/api/admin/contracts/{id}/complete` | ADMIN | Hoàn thành → giải ngân |
| PUT | `/api/admin/contracts/{id}/price` | ADMIN | Sửa giá (±10%) |
| PUT | `/api/admin/contracts/{id}/terms` | ADMIN | Sửa điều khoản |

### Construction Log & Disbursement
| Method | Endpoint | Role | Mô tả |
|--------|----------|------|-------|
| POST | `/api/construction-logs` | CONTRACTOR | Thêm nhật ký |
| GET | `/api/contracts/{id}/construction-logs` | ALL | Xem nhật ký |
| GET | `/api/contracts/{id}/progress` | ALL | % tiến độ hiện tại |
| POST | `/api/disbursements` | CONTRACTOR | Yêu cầu giải ngân |
| GET | `/api/contracts/{id}/disbursements` | ALL | Danh sách giải ngân |
| POST | `/api/disbursements/{id}/approve` | CUSTOMER | Duyệt giải ngân |
| POST | `/api/disbursements/{id}/reject` | CUSTOMER | Từ chối |
| POST | `/api/disbursements/{id}/unlock` | CUSTOMER/ADMIN | Mở khóa locked |

### Orders
| Method | Endpoint | Role | Mô tả |
|--------|----------|------|-------|
| POST | `/api/orders` | CUSTOMER | Đặt hàng |
| GET | `/api/orders/my` | CUSTOMER | Đơn của tôi |
| POST | `/api/orders/{id}/cancel` | CUSTOMER | Hủy đơn |
| GET | `/api/admin/orders` | ADMIN | Tất cả đơn |
| PUT | `/api/admin/orders/{id}/status` | ADMIN | Cập nhật trạng thái |
| POST | `/api/admin/orders/{id}/approve-bidding` | ADMIN | Duyệt → mở đấu giá |
| POST | `/api/order-bids/order/{id}/accept/{bidId}` | CUSTOMER | Chọn NHT → auto tạo HĐ |

### Wallet
| Method | Endpoint | Role | Mô tả |
|--------|----------|------|-------|
| GET | `/api/wallet/my` | ALL | Số dư ví |
| POST | `/api/wallet/withdraw` | ALL | Yêu cầu rút tiền |
| GET | `/api/admin/withdrawals` | ADMIN | Danh sách rút tiền |
| POST | `/api/admin/withdrawals/{id}/approve` | ADMIN | Duyệt rút tiền |

---

## 10. Biến môi trường

### Backend (`application.yml`)

```yaml
spring.datasource.url: jdbc:mysql://localhost:3306/constructx_db
spring.datasource.username: root
spring.datasource.password: (để trống)

jwt.secret: (chuỗi 256-bit)
jwt.expiration: 86400000  # 24h

vnpay.tmn-code: PV7YIINN
vnpay.hash-secret-normal: (secret key)
vnpay.api-url: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
vnpay.return-url: http://localhost:5173/wallet

grok.api.key: (xAI API key)
grok.model: grok-3-mini
```

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:8080/api
VITE_CLOUD_NAME=(Cloudinary cloud name)
VITE_UPLOAD_PRESET=(Cloudinary upload preset)
```

---

## Ghi chú kỹ thuật quan trọng

### BOM UTF-8
Khi tạo file Java mới trên Windows, tránh để BOM (Byte Order Mark) — sẽ gây lỗi compile `illegal character: '\ufeff'`. Dùng `UTF-8 without BOM` khi lưu file.

### Hibernate ddl-auto: update
Hibernate **không tự DROP constraint NOT NULL** đã có sẵn. `SchemaMigration.java` xử lý việc này khi startup bằng cách chạy `ALTER TABLE` trực tiếp qua JDBC.

### Blind Bidding
Nhà thầu **không thể xem** báo giá của nhau. Chỉ Customer và Admin mới thấy toàn bộ danh sách báo giá. Địa chỉ của đơn hàng CUSTOM được ẩn bớt (chỉ hiện Quận/TP) cho đến khi nhà thầu được chọn.

### Auto-create Contract
Khi Customer chọn nhà thầu trong đơn hàng CUSTOM (`POST /api/order-bids/order/{id}/accept/{bidId}`), hệ thống **tự động tạo hợp đồng** với số hợp đồng `CTR-ORD-{timestamp}-{orderId}` và gửi thông báo cho Admin duyệt.

---

*Cập nhật lần cuối: Tháng 6/2026 — ConstructX Platform v2.0*
