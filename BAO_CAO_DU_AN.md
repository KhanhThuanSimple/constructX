# BÁO CÁO DỰ ÁN — ConstructX
## Sàn Thương mại Điện tử Thi công & Nội thất

> **Phiên bản:** 2.0  
> **Ngày báo cáo:** Tháng 6/2026  
> **Nhóm thực hiện:** 4 thành viên

---

## MỤC LỤC

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Công nghệ sử dụng](#2-công-nghệ-sử-dụng)
3. [Kiến trúc hệ thống](#3-kiến-trúc-hệ-thống)
4. [Ba vai trò người dùng](#4-ba-vai-trò-người-dùng)
5. [Các luồng nghiệp vụ chính](#5-các-luồng-nghiệp-vụ-chính)
6. [Hệ thống Ví & Escrow](#6-hệ-thống-ví--escrow)
7. [Tích hợp VNPay](#7-tích-hợp-vnpay)
8. [Hệ thống Đấu thầu Blind Bidding](#8-hệ-thống-đấu-thầu-blind-bidding)
9. [Hệ thống Chat & AI Chatbot](#9-hệ-thống-chat--ai-chatbot)
10. [Hệ thống Tranh chấp](#10-hệ-thống-tranh-chấp)
11. [Cơ sở dữ liệu](#11-cơ-sở-dữ-liệu)
12. [Bảo mật](#12-bảo-mật)
13. [Tính năng nổi bật để Demo](#13-tính-năng-nổi-bật-để-demo)
14. [Tài khoản Demo](#14-tài-khoản-demo)
15. [Kết quả đạt được](#15-kết-quả-đạt-được)

---

## 1. TỔNG QUAN DỰ ÁN

### Vấn đề đặt ra

Thị trường nội thất và thi công tại Việt Nam thiếu một nền tảng trung gian **minh bạch, an toàn và tiện lợi** để kết nối khách hàng muốn thi công / mua nội thất với các nhà thầu chuyên nghiệp. Người mua không biết chọn nhà thầu nào đáng tin, nhà thầu thì khó tiếp cận khách hàng chất lượng. Tranh chấp và chậm thanh toán xảy ra thường xuyên vì thiếu cơ chế trung gian.

### Giải pháp

**ConstructX** là nền tảng B2B2C (Business-to-Business-to-Consumer) kết nối ba bên:

```
KHÁCH HÀNG ──┐
              ├──► ConstructX Platform ◄── ADMIN giám sát
NHÀ THẦU ────┘
```

### Hai luồng kinh doanh song song

| Luồng | Mô tả | Cơ chế |
|-------|-------|--------|
| **Dự án thi công** | Khách đăng dự án → Nhà thầu đấu giá → Ký hợp đồng 3 bên | Blind bidding |
| **Shop nội thất** | Khách mua sản phẩm có sẵn hoặc đặt tùy chỉnh | Catalog / Custom |

### Điểm khác biệt cốt lõi

- **Escrow tự động:** 100% tiền hợp đồng được khóa, giải ngân theo tiến độ thi công
- **Blind bidding:** Nhà thầu không biết giá của nhau — cạnh tranh công bằng
- **Hợp đồng 3 bên:** Khách hàng + Nhà thầu + Admin ký xác nhận
- **AI Chatbot:** Trợ lý Grok AI hỗ trợ 24/7 ngay trên giao diện
- **Bảo hành số:** 5% tiền hợp đồng giữ lại 6 tháng sau hoàn công

---

## 2. CÔNG NGHỆ SỬ DỤNG

### Backend

| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| **Java** | 17 (LTS) | Ngôn ngữ lập trình chính |
| **Spring Boot** | 3.2.5 | Framework backend |
| **Spring Security** | 6.x | Xác thực & phân quyền |
| **Spring Data JPA** | 3.2.5 | ORM, tương tác database |
| **Spring WebSocket** | 3.2.5 | Chat real-time (STOMP) |
| **MySQL** | 8.0+ | Cơ sở dữ liệu quan hệ |
| **Redis** | 7.x | Mở rộng WebSocket, caching |
| **JWT (jjwt)** | 0.11.5 | Xác thực không trạng thái |
| **Lombok** | Latest | Giảm boilerplate code |
| **VNPay SDK** | — | Cổng thanh toán |
| **Grok AI (xAI)** | grok-3-mini | AI chatbot hỗ trợ |
| **Cloudinary** | — | Lưu trữ ảnh đám mây |
| **Maven** | 3.x | Build tool |

### Frontend

| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| **React** | 18 | Thư viện UI |
| **Vite** | 5.x | Build tool nhanh |
| **Tailwind CSS** | 3.x | Styling utility-first |
| **React Router** | 6 | Client-side routing |
| **Zustand** | — | State management nhẹ |
| **Axios** | — | HTTP client |
| **Lucide React** | — | Icon library |
| **React Hot Toast** | — | Thông báo UI |


---

## 3. KIẾN TRÚC HỆ THỐNG

### Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React 18 + Vite)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │Customer  │  │Contractor│  │  Admin   │  │  Shop UI   │  │
│  │  Pages   │  │  Pages   │  │  Pages   │  │  Pages     │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬──────┘  │
│       └─────────────┴─────────────┴───────────────┘         │
│                    Axios HTTP Client                         │
│                    WebSocket (STOMP)                         │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP/WS  
                             ▼
┌─────────────────────────────────────────────────────────────┐
│               BACKEND (Spring Boot 3.2.5)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              JWT Security Filter                     │   │
│  └──────────────────────────┬───────────────────────────┘   │
│                             │                                │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐  │
│  │  Auth  │ │Project │ │ Order  │ │Contract│ │  Wallet  │  │
│  │  API   │ │  API   │ │  API   │ │  API   │ │   API    │  │
│  └────────┘ └────────┘ └────────┘ └────────┘ └──────────┘  │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐  │
│  │  Bid   │ │  Chat  │ │Dispute │ │  User  │ │  Admin   │  │
│  │  API   │ │  WS    │ │  API   │ │  API   │ │  APIs    │  │
│  └────────┘ └────────┘ └────────┘ └────────┘ └──────────┘  │
│                             │                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Service Layer (Business Logic)               │   │
│  │  WalletCoreManager  │  VNPayService  │  GrokAI      │   │
│  │  ContractService    │  DisbursementService           │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │
           ┌─────────────────┼──────────────┐
           ▼                 ▼              ▼
     ┌──────────┐    ┌──────────────┐  ┌──────────┐
     │  MySQL   │    │    Redis     │  │Cloudinary│
     │   8.0    │    │  (WebSocket) │  │(Images)  │
     └──────────┘    └──────────────┘  └──────────┘
```

### Cấu trúc Package Backend

```
com.constructx.backend/
├── admin/                  ← Module quản trị hệ thống
│   ├── controller/         (8 controllers)
│   ├── service/            (8 services)
│   ├── entity/             (Dispute, SystemSetting, ...)
│   └── repository/
├── config/
│   ├── SecurityConfig.java ← JWT + CORS + role authorization
│   ├── DataSeeder.java     ← Seed dữ liệu mẫu tự động
│   └── SchemaMigration.java← Auto ALTER TABLE khi startup
├── features/
│   ├── auth/               ← JWT đăng nhập / đăng ký
│   ├── chat/               ← WebSocket + AI Chatbot
│   ├── constructor/        ← Bid, Contract, ConstructionLog, Disbursement
│   ├── dispute/            ← Tranh chấp hợp đồng
│   ├── notification/       ← Thông báo real-time
│   ├── order/              ← Đơn hàng + Mini-Escrow
│   ├── portfolio/          ← Hồ sơ năng lực nhà thầu
│   ├── product/            ← Sản phẩm shop
│   ├── project/            ← Dự án thi công
│   ├── review/             ← Đánh giá sau hoàn thành
│   ├── user/               ← Quản lý người dùng
│   └── wallet/             ← Ví điện tử + VNPay
└── security/               ← JwtFilter, JwtUtil
```

### Phân quyền (Role-Based Access Control)

| Route | CUSTOMER | CONTRACTOR | ADMIN |
|-------|----------|------------|-------|
| `/shop` | ✅ | ✅ | ✅ |
| `/projects/new` | ✅ | ❌ | ❌ |
| `/projects/browse` | ❌ | ✅ | ❌ |
| `/order-bidding` | ❌ | ✅ | ❌ |
| `/admin/*` | ❌ | ❌ | ✅ |
| `/wallet` | ✅ | ✅ | ✅ |
| `/contracts` | ✅ | ✅ | ❌ |

> Contractor PENDING chỉ xem được, **không thể gửi báo giá** cho đến khi Admin duyệt.

---

## 4. BA VAI TRÒ NGƯỜI DÙNG

### 4.1 CUSTOMER — Khách hàng

Người có nhu cầu thi công nội thất hoặc mua sắm đồ nội thất.

**Chức năng chính:**
- Đăng dự án thi công với mô tả, ngân sách, phong cách
- Duyệt marketplace và xem báo giá từ các nhà thầu
- Mua sản phẩm catalog hoặc đặt hàng tùy chỉnh
- Thiết kế không gian 2D bằng công cụ kéo thả
- Ký hợp đồng điện tử và theo dõi tiến độ
- Duyệt giải ngân từng milestone thi công
- Nạp tiền, rút tiền qua VNPay
- Chat real-time với nhà thầu và Admin

**Giao diện:**

| Nhóm menu | Chức năng |
|-----------|-----------|
| Khám phá & Lên ý tưởng | Trang chủ, Cửa hàng nội thất, Thiết kế 2D |
| Quản lý Thi công | Đơn hàng & Dự án, Hợp đồng & Thi công, Nghiệm thu |
| Tương tác & Cá nhân | Tin nhắn, Thông báo, Ví, Cài đặt tài khoản |

---

### 4.2 CONTRACTOR — Nhà thầu

Đơn vị hoặc cá nhân thi công nội thất chuyên nghiệp.

**Điều kiện hoạt động:** Phải được Admin **phê duyệt** (`approvalStatus = APPROVED`).

**Chức năng chính:**
- Duyệt marketplace dự án và đặt báo giá
- Đấu thầu đơn hàng CUSTOM từ khách hàng
- Ký hợp đồng (cần ký quỹ 5% giá trị HĐ)
- Cập nhật nhật ký thi công (% tiến độ + ảnh minh chứng)
- Gửi yêu cầu giải ngân theo milestone
- Quản lý hồ sơ năng lực và portfolio ảnh công trình
- Quản lý ví và theo dõi thu nhập

**Giao diện:**

| Nhóm menu | Chức năng |
|-----------|-----------|
| Tổng quan | Dashboard thu nhập, công việc |
| Công việc & Dự án | Đấu thầu & Tìm việc, Báo cáo tiến độ, Hợp đồng |
| Quản lý | Hồ sơ năng lực, Ví & Thu nhập |

---

### 4.3 ADMIN — Quản trị viên

Đại diện nền tảng ConstructX, giám sát và điều phối toàn bộ hệ thống.

**Chức năng chính:**
- Tổng quan hệ thống: KPI, doanh thu, biểu đồ
- Duyệt/từ chối dự án của khách hàng
- Duyệt/từ chối/chỉnh sửa hợp đồng (sửa giá ±10%)
- Quản lý đơn hàng: catalog và custom
- Phê duyệt/từ chối tài khoản nhà thầu
- Xử lý tranh chấp: phán quyết và phân chia tiền
- Duyệt yêu cầu rút tiền
- Cấu hình hệ thống: feature flags, tỉ lệ phí
- Giám sát chat, thông báo hệ thống

**Giao diện:**

| Nhóm menu | Chức năng |
|-----------|-----------|
| Tổng quan & Báo cáo | Dashboard hệ thống |
| Quản lý Kinh doanh | Duyệt dự án, Hợp đồng, Đơn hàng, Sản phẩm |
| Quản lý Người dùng | Người dùng & Đối tác |
| Hỗ trợ & Kiểm soát | Tranh chấp, Duyệt tiền, Ví nền tảng, Giám sát chat |
| Cài đặt | Cấu hình hệ thống |


---

## 5. CÁC LUỒNG NGHIỆP VỤ CHÍNH

### Luồng A — Đấu thầu Thi công Dự án (Luồng gốc)

Đây là luồng nghiệp vụ trung tâm, tất cả luồng khác đều hội tụ về đây ở giai đoạn hợp đồng.

```
KHÁCH HÀNG              ADMIN               NHÀ THẦU
    │                     │                     │
    ├─ Tạo dự án ─────────►│                     │
    │                     ├─ Duyệt dự án ───────►│ (hiện trên marketplace)
    │                     │                     │
    │◄──────────────────────────────────────────── Gửi báo giá (blind)
    │                     │                     │
    ├─ Xem báo giá ────────►│                     │
    ├─ Chọn báo giá        │                     │
    │  → Lock 100% Escrow  │                     │
    │  → HĐ tự động ACTIVE ►│                     │
    │                     │                     │
    │     [Hợp đồng ACTIVE — bắt đầu thi công]   │
    │                     │                     │
    │◄──────────────────────────────────────────── Cập nhật tiến độ + ảnh
    │◄──────────────────────────────────────────── Yêu cầu giải ngân milestone
    ├─ Duyệt giải ngân ───►│                     │
    │                     │◄──────────────────── Nhận tiền (immediate + locked)
    │                     │                     │
    │                     ├─ Xác nhận hoàn công ►│ (giải ngân 100%)
    │                     │  [HĐ → COMPLETED]   │
```

**Trạng thái hợp đồng:**
```
ACTIVE ──► [thi công] ──► COMPLETED / CANCELLED
```
> Lưu ý: Hợp đồng **bỏ qua bước Admin duyệt và ký riêng lẻ** — tự động ACTIVE ngay khi Customer chọn báo giá, vừa lock Escrow 100% đồng thời.

---

### Luồng B — Mua sản phẩm Catalog (Shop)

```
KHÁCH HÀNG              ADMIN
    │                     │
    ├─ Duyệt shop ─────────│
    ├─ Thêm vào giỏ        │
    ├─ Đặt hàng ───────────►│
    │                     ├─ Xác nhận → PROCESSING
    │                     ├─ Cập nhật → SHIPPED
    │◄── Xác nhận nhận hàng (hoặc 24h auto)
    │                     │ → DELIVERED
```

**Trạng thái đơn CATALOG:**
```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED / CANCELLED
```

---

### Luồng C — Đơn hàng Tùy chỉnh (Custom)

```
KHÁCH HÀNG              ADMIN               NHÀ THẦU
    │                     │                     │
    ├─ Đặt đơn CUSTOM ─────►│                     │
    │                     ├─ Duyệt & Mở đấu giá ►│
    │◄──────────────────────────────────────────── Gửi báo giá (blind)
    ├─ Chọn nhà thầu ──────►│                     │
    │  → AUTO tạo HĐ ACTIVE │                     │
    │   ▼ Tiếp tục như Luồng A ▼
```

**Trạng thái đơn CUSTOM:**
```
PENDING → OPEN_BIDDING → PROCESSING → SHIPPED → DELIVERED
```

Khi chọn nhà thầu: hệ thống tự động tạo hợp đồng số `CTR-ORD-{timestamp}-{orderId}`.

---

### Luồng D — Giải ngân theo Milestone

```
Hợp đồng ACTIVE
      │
      ├─ NHT cập nhật tiến độ (%, mô tả, tối đa 6 ảnh/lần)
      │
      ├─ Đạt ngưỡng 20% → NHT gửi yêu cầu "Khởi công"
      │   Customer duyệt → Giải ngân tối đa 20% HĐ
      │   Phân chia: 30% immediate + 70% locked
      │
      ├─ Đạt ngưỡng 50% → "Thi công thô"
      │   → Giải ngân tối đa 50% HĐ (cộng dồn)
      │   → Auto unlock locked từ đợt trước
      │
      ├─ Đạt ngưỡng 80% → "Hoàn thiện"
      │   → Giải ngân tối đa 80% HĐ
      │
      └─ Đạt 100% → "Bàn giao"
          Admin xác nhận hoàn công:
          • Giải ngân 90% ngay (sau khi trừ 5% phí + 5% bảo hành)
          • Lock 5% bảo hành thêm 6 tháng trong ví NHT
          • HĐ → COMPLETED
```

| Giai đoạn | Ngưỡng tiến độ | Tối đa giải ngân |
|-----------|---------------|-----------------|
| Khởi công | ≥ 20% | 20% giá trị HĐ |
| Thi công thô | ≥ 50% | 50% giá trị HĐ |
| Hoàn thiện | ≥ 80% | 80% giá trị HĐ |
| Bàn giao | = 100% | 100% giá trị HĐ |


---

## 6. HỆ THỐNG VÍ & ESCROW

Đây là **cơ chế cốt lõi** tạo sự tin tưởng giữa các bên. Tất cả giao dịch đều có audit trail đầy đủ.

### Cấu trúc Wallet

```java
Wallet {
    balance          // Tổng số dư thực tế (VND)
    lockedAmount     // Tiền đang bị đóng băng (Escrow)
    availableBalance // = balance - lockedAmount (tính toán, không lưu DB)
}
```

### WalletCoreManager — Trái tim xử lý tiền

Tất cả nghiệp vụ tiền tệ đều đi qua một lớp duy nhất, đảm bảo nhất quán:

| Method | Mô tả | Ảnh hưởng |
|--------|-------|----------|
| `executeLockForOrder` | Khóa tiền vào Escrow | `lockedAmount ↑` |
| `executeDeposit` | Nạp tiền / ghi nhận doanh thu | `balance ↑` |
| `executeUnlockAmount` | Giải phóng tiền bị lock | `lockedAmount ↓` |
| `confirmDebitLocked` | Trừ tiền đã lock (thanh toán) | `balance ↓`, `lockedAmount ↓` |
| `recordTransaction` | Chỉ ghi audit log | Không thay đổi số dư |
| `executeDisputeRefundDistribution` | Phân chia tiền tranh chấp | Nhiều ví cùng lúc |

### Quy trình Escrow Hợp đồng

```
Bước 1: Customer chọn báo giá
    → Lock 100% giá trị HĐ từ ví Customer
    → lockedAmount(customer) += contractValue

Bước 2: Ký quỹ Nhà thầu (nếu đủ tiền)
    → Lock 5% ký quỹ từ ví NHT
    → lockedAmount(contractor) += contractValue × 5%

Bước 3: Giải ngân từng milestone
    → Trừ tiền khỏi Escrow của Customer
    → Chuyển vào ví NHT (immediate + locked)

Bước 4: Hoàn công (Admin xác nhận)
    → Trừ 5% phí hoa hồng → Platform Wallet
    → Giải ngân 90% ngay cho NHT
    → Lock 5% bảo hành trong ví NHT (6 tháng)
    → Trả lại ký quỹ 5% cho NHT
```

### Xử lý khi hủy hợp đồng

| Bên hủy | Hệ quả tài chính |
|---------|-----------------|
| **Customer hủy** | Mất cọc 10% (vào NHT), phần còn lại hoàn về |
| **Contractor hủy** | Mất ký quỹ 5% (vào Platform), Customer hoàn 100% |
| **Admin từ chối HĐ** | Hoàn 100% cho Customer, dự án về trạng thái OPEN |

### Mini-Escrow cho Đơn hàng CUSTOM

```
Chọn NHT: Lock 60% từ ví Customer
                    │
NHT báo hoàn thành: Bắt đầu đếm 24 giờ
                    │
Customer confirm / Auto 24h:
    Lock thêm 40% còn lại
    Debit 100% khỏi ví Customer
    Credit 95% vào ví NHT
    5% phí → Platform Wallet
```

### Platform Wallet (Ví nền tảng)

Thu phí hoa hồng từ mọi giao dịch hoàn thành:
- **5% phí** từ mỗi hợp đồng hoàn thành
- **5% phí** từ mỗi đơn hàng delivered
- Admin xem tổng doanh thu tại `/admin/platform-wallet`
- Mọi phí đều được ghi `PlatformTransaction` đầy đủ

---

## 7. TÍCH HỢP VNPAY

### Cấu hình

```yaml
vnpay:
  tmn-code: PV7YIINN
  hash-secret-normal: P4UJTF7S9STPZFQ11RSD2Z59CSG2KXAP
  api-url: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
  return-url: http://localhost:5173/wallet
  use-mock: false
```

### Luồng thanh toán VNPay

```
1. User nhập số tiền muốn nạp (tối thiểu 10,000 VND)
         │
2. POST /api/wallet/vnpay/create-payment
   Backend tạo URL thanh toán + chữ ký HMAC-SHA512
         │
3. Frontend redirect sang trang VNPay Sandbox
         │
4. User điền thông tin thẻ + OTP
         │
5. VNPay callback: GET /api/wallet/vnpay/callback
   Backend xác thực chữ ký (idempotent — không nạp 2 lần)
         │
6. Nếu thành công: balance tăng, ghi Transaction
   Redirect về /wallet với thông báo kết quả
```

### Thẻ test VNPay (Sandbox)

```
Số thẻ:  9704198526191432198
Tên:     NGUYEN VAN A
Hạn:     07/15
OTP:     123456
```

### Thiết kế Pattern (PaymentGatewayStrategy)

```java
interface PaymentGatewayStrategy {
    String createPaymentUrl(long amount, String orderId);
    boolean verifyCallback(Map<String, String> params);
}

// Triển khai:
VNPayGatewayStrategy implements PaymentGatewayStrategy
MockVNPayController (dev/test — không cần thẻ thật)

// Factory chọn gateway:
PaymentGatewayFactory.getStrategy("VNPAY") → VNPayGatewayStrategy
```

Thiết kế này cho phép **mở rộng thêm cổng thanh toán** (MoMo, ZaloPay...) mà không thay đổi code nghiệp vụ.

---

## 8. HỆ THỐNG ĐẤU THẦU BLIND BIDDING

### Nguyên tắc

> Các nhà thầu **không thể xem báo giá của nhau**. Chỉ Khách hàng và Admin mới thấy toàn bộ danh sách.

Điều này đảm bảo cạnh tranh công bằng: nhà thầu báo giá dựa trên năng lực thực sự, không đội giá theo đối thủ.

### Đấu thầu Dự án Thi công

```
1. Admin duyệt dự án → hiển thị trên Marketplace
2. Nhà thầu duyệt marketplace (lọc danh mục, ngân sách, địa chỉ)
3. Nhà thầu gửi hồ sơ thầu:
   - Tổng giá thầu
   - Số ngày thi công
   - Chi tiết hạng mục (BidDetail: tên, đơn vị, số lượng, đơn giá)
   - Điều khoản thanh toán
   - Ảnh mẫu công trình đã làm
4. Customer xem danh sách (tên NHT, tổng giá, thời gian)
5. Customer chọn → tự động tạo HĐ ACTIVE + Lock Escrow
6. NHT không được chọn nhận thông báo
```

### Đấu thầu Đơn hàng Custom

```
Ẩn thông tin nhạy cảm với NHT:
   ✗ Địa chỉ đầy đủ → chỉ hiện "Quận X, TP.HCM"
   ✗ Giá tham khảo của sản phẩm

Sau khi được chọn:
   ✅ NHT nhận địa chỉ đầy đủ
   ✅ Hệ thống tạo HĐ tự động (sourceOrder trỏ đến đơn hàng)
```

### Feature Flags kiểm soát luồng

Quản lý tại Admin → Cấu hình hệ thống:

| Flag | Mặc định | Ý nghĩa |
|------|----------|---------|
| `feature.order.approvalRequired` | `true` | Bật: Admin duyệt trước khi mở đấu giá đơn hàng |
| `feature.project.autoApprove` | `false` | Bật: Dự án tự động OPEN, không cần Admin duyệt |
| `feature.disbursement.adminApprovalRequired` | `true` | Bật: Admin xác nhận giải ngân trước Customer |
| `feature.chat.enabled` | `true` | Bật/tắt AI Chatbot |
| `feature.vnpay.enabled` | `true` | Bật/tắt cổng VNPay |


---

## 9. HỆ THỐNG CHAT & AI CHATBOT

### Chat Real-time (WebSocket STOMP)

```
Kiến trúc:
  Client ──► STOMP over WebSocket ──► Spring WebSocketController
                                      ChatService
                                      Redis PubSub (scaling)
                                      ──► Broadcast to room members
```

**Tính năng:**
- Phòng chat 1-1 giữa Customer và Contractor
- Phòng chat tranh chấp (3 bên: Customer + Contractor + Admin)
- Rate limit: 30 tin nhắn / phút
- Tối đa 5,000 ký tự / tin nhắn
- Upload file đính kèm (hình ảnh, PDF tối đa 10MB)
- Xác thực JWT qua WebSocket interceptor

**Admin giám sát chat** tại `/admin/chat`:
- Xem tất cả phòng chat trên hệ thống
- Theo dõi hội thoại theo thời gian thực
- Hỗ trợ điều tra tranh chấp

### AI Chatbot (Grok xAI)

```
User gõ câu hỏi
      │
ChatFloatingButton (luôn hiện, trừ trang Chat)
      │
POST /api/chat/ai
      │
GrokChatbotService
      │
Grok API (model: grok-3-mini)
xAI API Key: gsk_nbt7Ye05...
      │
Trả lời trực tiếp trong chat bubble
```

**Phạm vi hỗ trợ:** Tư vấn nội thất, giải đáp quy trình, hướng dẫn sử dụng platform.

**Tắt/bật:** Feature flag `feature.chat.enabled` trong Admin Settings.

---

## 10. HỆ THỐNG TRANH CHẤP

### Luồng xử lý

```
Customer hoặc Contractor báo cáo tranh chấp
          │
          ▼
   Hợp đồng bị FREEZE (is_disputed = true)
   ┌─────────────────────────────────────┐
   │ • Không thể giải ngân thêm          │
   │ • Không thể ký/hủy hợp đồng        │
   │ • Không thể sửa giá/điều khoản     │
   └─────────────────────────────────────┘
          │
          ▼
   Tạo phòng chat tranh chấp (3 bên)
   ├─ Upload bằng chứng (ảnh, PDF)
   ├─ Xem nhật ký thi công
   └─ Xem lịch sử hợp đồng
          │
          ▼
   Admin xem xét và đưa ra phán quyết
          │
          ├─► Phân chia tiền: X% cho Customer, Y% cho NHT
          │
          ▼
   WalletArbitrationManager.executeDisputeRefundDistribution()
   ├─ Unlock tiền từ Escrow
   ├─ Phân phối theo tỉ lệ phán quyết
   └─ Ghi lịch sử giao dịch chi tiết
          │
          ▼
   Tranh chấp RESOLVED — Hợp đồng COMPLETED/CANCELLED
```

### Bảng Dispute trong Database

```sql
disputes:
  id, contract_id, customer_id, contractor_id
  reason (TEXT), status (OPEN/RESOLVED/CLOSED)
  resolution_note (TEXT)
  customer_refund_percent, contractor_receive_percent
  chat_room_id (phòng chat riêng)
  created_at, resolved_at
```

---

## 11. CƠ SỞ DỮ LIỆU

### Sơ đồ bảng chính

```
users                    wallets
  id                       id
  email (unique)           user_id (FK → users)
  password (bcrypt)        balance
  role (CUSTOMER/          locked_amount
        CONTRACTOR/
        ADMIN)           transactions
  approval_status          id
  full_name                wallet_id (FK)
  phone_number             amount, type
  address                  reference_id
  active                   description

projects               bids                  contracts
  id                     id                    id
  user_id (FK)           project_id (FK)       contract_number (unique)
  name, description      contractor_id (FK)    project_id (FK nullable)
  budget_min/max         total_price           bid_id (FK nullable)
  category, area         estimated_days        order_id (FK nullable)
  status (OPEN/          payment_terms         client_id (FK)
          IN_PROGRESS/   status (PENDING/      contractor_id (FK)
          COMPLETED)     ACCEPTED/REJECTED)    agreed_price
  approval_status                              customer_deposit_amount
                                               contractor_deposit_amount
orders                 order_bids              status (ACTIVE/COMPLETED/
  id                     id                            CANCELLED)
  order_code             order_id (FK)         is_disputed
  customer_id (FK)       contractor_id (FK)    warranty_hold_amount
  type (CATALOG/CUSTOM)  quoted_price          warranty_end_date
  status                 estimated_days
  total_amount           proposal              disbursement_requests
  delivery_address       status                  id, contract_id
                                                 phase_label, amount
construction_logs                                immediate_ratio
  id, contract_id                               status (PENDING/APPROVED/
  progress_percent                                        REJECTED)
  stage_name                                    admin_verified
  description, images
  created_at
```

### Quản lý Schema (SchemaMigration)

Thay vì dùng Flyway/Liquibase, dự án dùng `SchemaMigration.java` — chạy khi khởi động, tự động thêm cột mới / sửa constraint:

```java
@EventListener(ApplicationReadyEvent.class)
@Order(1) // Chạy trước DataSeeder
public void runMigrations() {
    // ALTER TABLE IF NOT EXISTS COLUMN
    // Idempotent: kiểm tra trước khi thay đổi
}
```

**Ưu điểm:** Không phụ thuộc công cụ migration ngoài, dễ đọc, dễ debug.

### DataSeeder — Dữ liệu mẫu

Tự động chạy khi khởi động lần đầu:
- **8 người dùng:** 1 Admin, 3 Customer, 4 Contractor (1 chờ duyệt)
- **7 ví:** Mỗi user có ví với số dư khác nhau (20M – 500M VND)
- **17 sản phẩm nội thất:** Sofa, bàn, ghế, giường, tủ, decor
- **7 dự án:** 6 đang mở, 1 chờ duyệt (để demo flow Admin duyệt)
- **14 danh mục vật liệu:** Gỗ, kính, inox, đá, vải, da...


---

## 12. BẢO MẬT

### JWT Authentication

```
Đăng nhập: POST /api/auth/login
  → Trả về JWT token (24 giờ)
  → Token lưu trong Zustand store (frontend)

Mọi request cần auth:
  Header: Authorization: Bearer <token>
  JwtFilter interceptor kiểm tra và xác thực
  Inject Principal vào SecurityContext
```

**Cấu hình JWT:**
```yaml
jwt:
  secret: "constructx-super-secret-key-2025-at-least-256-bits-long-for-hs256"
  expiration: 86400000  # 24 giờ
```

### Role-Based Access Control

```java
@PreAuthorize("hasRole('ADMIN')")
@PreAuthorize("hasAnyRole('CUSTOMER', 'CONTRACTOR')")

// SecurityConfig whitelist public endpoints:
/api/auth/**          — không cần token
/api/public/**        — sản phẩm, danh mục
/api/wallet/vnpay/callback — VNPay callback
/ws/**                — WebSocket handshake
```

### Bảo vệ nghiệp vụ

| Rủi ro | Biện pháp |
|--------|----------|
| Trùng giao dịch VNPay | `UserToken` idempotency: mỗi txnRef chỉ xử lý 1 lần |
| Race condition rút tiền | `@Transactional` + `findByUserIdForUpdate` (Pessimistic Lock) |
| Contractor không được duyệt vẫn bid | Backend kiểm tra `approvalStatus == APPROVED` |
| Sửa giá hợp đồng quá lớn | Validate: chênh lệch tối đa ±10% giá gốc |
| HĐ đang tranh chấp bị thao túng | `isDisputed == true` → block mọi thao tác tài chính |
| Password | BCrypt hashing, không lưu plaintext |
| SQL Injection | Spring Data JPA parametrized queries |
| CORS | Cấu hình whitelist origin trong SecurityConfig |

---

## 13. TÍNH NĂNG NỔI BẬT ĐỂ DEMO

### Demo Scenario A — Luồng đặt mua sản phẩm (5 phút)

```
1. Đăng nhập: khachhang1@test.com / test123
2. Vào Shop → chọn "Sofa góc L hiện đại 4 chỗ Premium"
3. Thêm vào giỏ → Checkout → Đặt hàng
4. Đăng nhập Admin → /admin/orders → Xác nhận → PROCESSING
5. Customer xem đơn: trạng thái cập nhật theo stepper
```

### Demo Scenario B — Thiết kế 2D & đặt hàng tùy chỉnh (3 phút)

```
1. Customer vào /shop/designer
2. Kéo thả nội thất vào sơ đồ phòng
3. Lưu thiết kế → Tạo đơn CUSTOM
4. Admin mở đấu giá
5. Contractor đăng nhập → /order-bidding → Gửi báo giá
6. Customer chọn NHT → HĐ tự động tạo + Lock Escrow
```

### Demo Scenario C — Đấu thầu dự án thi công (7 phút)

```
1. Customer tạo dự án: "Thiết kế phòng khách 50m²"
2. Admin duyệt dự án → hiện trên marketplace
3. Contractor duyệt marketplace → Gửi báo giá chi tiết
4. Customer xem danh sách báo giá (blind) → Chọn NHT
   → HĐ tự động ACTIVE + Lock 100% Escrow
5. Contractor cập nhật tiến độ: upload ảnh, ghi 30%
6. Contractor gửi yêu cầu giải ngân "Khởi công"
7. Customer duyệt → Nhà thầu nhận tiền
```

### Demo Scenario D — Admin điều hành hệ thống (3 phút)

```
1. Đăng nhập admin@constructx.com / admin123
2. /admin/overview: xem KPI tổng quan, biểu đồ doanh thu
3. /admin/all-users: xem contractor_pending@test.com → Duyệt
4. /admin/contracts: xem HĐ → Xác nhận hoàn thành → Giải ngân
5. /admin/settings: bật/tắt feature flags
```

### Demo Scenario E — Ví điện tử & VNPay (2 phút)

```
1. Customer vào /wallet → Xem số dư hiện tại
2. Nhấn "Nạp qua VNPay" → Nhập 100,000 VND
3. Redirect sang VNPay Sandbox
4. Dùng thẻ test: 9704198526191432198, OTP: 123456
5. Redirect về /wallet → Số dư tăng thêm 100,000 VND
6. Xem lịch sử giao dịch
```

### Demo Scenario F — Chat & Tranh chấp (3 phút)

```
1. Customer chat với Contractor về tiến độ
2. Customer tạo tranh chấp cho hợp đồng
   → HĐ bị freeze tự động
3. Admin vào /admin/disputes
4. Admin đọc chat 3 bên, xem bằng chứng
5. Admin ra phán quyết: 60% Customer, 40% Contractor
6. Hệ thống tự động phân chia tiền Escrow
```

---

## 14. TÀI KHOẢN DEMO

### Khởi động dự án

```bash
# Backend
cd backend
mvn spring-boot:run
# Server: http://localhost:8080

# Frontend
cd frontend
npm install
npm run dev
# App: http://localhost:5173
```

### Tài khoản có sẵn (DataSeeder tự động tạo)

| Role | Email | Mật khẩu | Ghi chú |
|------|-------|----------|---------|
| **Admin** | admin@constructx.com | admin123 | Toàn quyền |
| **Customer 1** | khachhang1@test.com | test123 | Ví: 50,000,000 VND |
| **Customer 2** | khachhang2@test.com | test123 | Ví: 30,000,000 VND |
| **Customer 3** | khachhang3@test.com | test123 | Ví: 20,000,000 VND |
| **Contractor 1** | nhathauchuyennghiep@test.com | test123 | Đã duyệt, Ví: 150M |
| **Contractor 2** | nhaxuong_abc@test.com | test123 | Đã duyệt, Ví: 80M |
| **Contractor 3** | noithat_vietlong@test.com | test123 | Đã duyệt, Ví: 120M |
| **Contractor Mới** | contractor_pending@test.com | test123 | Chưa duyệt — test flow Admin |

### Thẻ Test VNPay

```
Ngân hàng: NCB (Ngân hàng Quốc Dân)
Số thẻ:  9704198526191432198
Tên:     NGUYEN VAN A
Ngày HH: 07/15
OTP:     123456
```

---

## 15. KẾT QUẢ ĐẠT ĐƯỢC

### Tổng số chức năng đã xây dựng

| Module | Backend | Frontend | Trạng thái |
|--------|---------|----------|-----------|
| Auth & User | 3 controllers, 3 services | Login, Register, Profile | ✅ Hoàn thành |
| Project & Bidding | 2 controllers, 3 services | 5 pages | ✅ Hoàn thành |
| Contract & Progress | 2 controllers, 3 services | 5 pages | ✅ Hoàn thành |
| Order & Shop | 3 controllers, 4 services | 6 pages | ✅ Hoàn thành |
| Wallet & VNPay | 3 controllers, 6 services | 3 pages | ✅ Hoàn thành |
| Admin Dashboard | 8 controllers, 8 services | 10 pages | ✅ Hoàn thành |
| Chat & AI | 2 controllers, 3 services | 4 components | ✅ Hoàn thành |
| Dispute | 2 controllers, 2 services | 2 pages | ✅ Hoàn thành |
| Notification | 1 controller, 1 service | 1 page | ✅ Hoàn thành |
| Portfolio & Review | 2 controllers, 2 services | 3 pages | ✅ Hoàn thành |
| **TỔNG CỘNG** | **~30 controllers** | **37 pages** | |

### Số lượng API Endpoints

| Nhóm | Số endpoint |
|------|------------|
| Auth | 2 |
| Projects | 8 |
| Bids | 6 |
| Contracts | 12 |
| Construction Log & Disbursement | 8 |
| Orders | 8 |
| Order Bids | 7 |
| Wallet & VNPay | 8 |
| Admin (all) | 25+ |
| Chat & Notification | 10 |
| Public (no auth) | 5 |
| **Tổng cộng** | **~100 endpoints** |

### Điểm kỹ thuật nổi bật

1. **Escrow tự động hoàn toàn** — không cần can thiệp thủ công vào dòng tiền
2. **Một codebase hợp đồng duy nhất** cho mọi nguồn gốc (dự án + đơn hàng)
3. **Feature Flags** — Admin bật/tắt tính năng không cần deploy lại
4. **SchemaMigration** — DB tự vá không cần công cụ migration ngoài
5. **DataSeeder idempotent** — chạy bao nhiêu lần cũng không tạo dữ liệu trùng
6. **WebSocket + Redis** — chat real-time có khả năng scale ngang
7. **AI Chatbot tích hợp** — Grok xAI trả lời tư vấn ngay trên giao diện
8. **Blind bidding** — thuật toán ẩn giá cạnh tranh công bằng
9. **Bảo hành số** — 5% giữ lại 6 tháng trong ví NHT, tự động unlock
10. **Thiết kế 2D** — công cụ kéo thả nội thất vào sơ đồ phòng

---

## PHỤ LỤC — Cấu hình môi trường

### Backend (`application.yml`)

```yaml
spring.datasource.url:      jdbc:mysql://localhost:3306/constructx_db
spring.datasource.username: root
spring.datasource.password: (trống)
jwt.secret:                 constructx-super-secret-key-2025...
jwt.expiration:             86400000  # 24h
vnpay.tmn-code:             PV7YIINN
vnpay.hash-secret-normal:   P4UJTF7S9STPZFQ11RSD2Z59CSG2KXAP
vnpay.api-url:              https://sandbox.vnpayment.vn/...
vnpay.return-url:           http://localhost:5173/wallet
grok.api.key:               gsk_nbt7Ye05...
grok.model:                 grok-3-mini
server.port:                8080
```

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:8080/api
VITE_CLOUD_NAME=<Cloudinary cloud name>
VITE_UPLOAD_PRESET=<Cloudinary upload preset>
```

---

*Báo cáo được tổng hợp từ toàn bộ mã nguồn dự án ConstructX*  
*Phiên bản: 2.0 — Tháng 6/2026*
