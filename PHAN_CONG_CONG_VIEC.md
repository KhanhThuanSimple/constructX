# 📋 BẢNG PHÂN CÔNG CÔNG VIỆC — ConstructX Platform

> **Dự án:** Sàn Thương mại điện tử Thi công & Nội thất  
> **Stack:** Spring Boot 3 · MySQL · React 18 · Tailwind CSS · JWT · VNPay  
> **Ngày lập:** Tháng 6/2026

---

## 👥 Thành viên & Phạm vi phụ trách

| Thành viên | Mảng phụ trách |
|------------|----------------|
| **Nhàn** | Chức năng đặt hàng & mua sắm của User (Customer) |
| **Như** | Chức năng quản lý của Admin |
| **Thái** | Chức năng đấu thầu (Bid & Auction) |
| **Thuận** | Xử lý tiền, Ví, VNPay, Escrow, nền tảng cốt lõi |

---

## 🛒 NHÀN — Chức năng Đặt hàng & Mua sắm (User/Customer)

### Phạm vi tổng quát
Phụ trách toàn bộ hành trình mua sắm của khách hàng: từ duyệt sản phẩm, đặt hàng, theo dõi tiến độ đến xác nhận nhận hàng.

---

### Backend

#### Module: `features/order`
| File | Trạng thái | Nhiệm vụ |
|------|-----------|----------|
| `OrderController.java` | Có sẵn | Kiểm tra & hoàn thiện các endpoint order của customer |
| `OrderService.java` | Có sẵn | Logic tạo đơn, hủy đơn, xác nhận nhận hàng |
| `OrderPaymentService.java` | Có sẵn | Mini-Escrow: lock 60% khi chọn NHT, release sau confirm |
| `OrderAutoReleaseScheduler.java` | Có sẵn | Scheduler auto-release 24h sau khi NHT báo xong |
| `Order.java` (entity) | Có sẵn | Kiểm tra enum Status đầy đủ |
| `OrderItem.java` (entity) | Có sẵn | Kiểm tra mapping với Product |
| `OrderRepository.java` | Có sẵn | Thêm query lọc theo status nếu thiếu |

#### Module: `features/product` & `features/public_`
| File | Trạng thái | Nhiệm vụ |
|------|-----------|----------|
| `ProductService.java` | Có sẵn | Kiểm tra tìm kiếm, lọc, phân trang |
| `PublicProductController.java` | Có sẵn | API public không cần auth — cần test kỹ |
| `PublicCatalogController.java` | Có sẵn | Danh mục sản phẩm công khai |

#### Module: `features/review`
| File | Trạng thái | Nhiệm vụ |
|------|-----------|----------|
| `ReviewController.java` | Có sẵn | Đánh giá sau khi nhận hàng / hoàn thành HĐ |
| `ReviewService.java` | Có sẵn | Kiểm tra logic: chỉ review khi DELIVERED/COMPLETED |


### Frontend

| File | Trạng thái | Nhiệm vụ |
|------|-----------|----------|
| `shop/ShopPage.jsx` | Có sẵn | Trang chủ shop — lọc danh mục, tìm kiếm sản phẩm |
| `shop/ShopProductDetailPage.jsx` | Có sẵn | Chi tiết sản phẩm, thêm vào giỏ |
| `shop/OrderCheckoutPage.jsx` | Có sẵn | Giỏ hàng, điền địa chỉ, xác nhận đặt hàng |
| `shop/FurnitureDesignerPage.jsx` | Có sẵn | Công cụ thiết kế 2D kéo thả nội thất |
| `OrdersPage.jsx` | Có sẵn | Danh sách đơn hàng, lọc theo trạng thái |
| `ContractProgressPage.jsx` | Có sẵn | Theo dõi tiến độ thi công (góc nhìn khách hàng) |
| `ContractDisbursementsPage.jsx` | Có sẵn | Duyệt giải ngân theo giai đoạn thi công |
| `ContractDisputePage.jsx` | Có sẵn | Tạo & xem tranh chấp hợp đồng |
| `ContractReviewPage.jsx` | Có sẵn | Đánh giá sau khi hoàn thành hợp đồng |
| `ReviewsManagementPage.jsx` | Có sẵn | Quản lý đánh giá đã gửi |

### API Endpoints cần kiểm tra (Nhàn)

```
POST   /api/orders                          — Đặt hàng
GET    /api/orders/my                       — Đơn của tôi
GET    /api/orders/{id}                     — Chi tiết đơn
POST   /api/orders/{id}/cancel              — Hủy đơn (hoàn cọc)
POST   /api/orders/{id}/confirm-delivery    — Xác nhận nhận hàng → giải ngân
POST   /api/order-bids/order/{id}/accept/{bidId} — Chọn nhà thầu đơn CUSTOM
GET    /api/public/products                 — Lấy danh sách sản phẩm (public)
GET    /api/public/products/{id}            — Chi tiết sản phẩm
POST   /api/reviews                         — Gửi đánh giá
GET    /api/disbursements/{id}/approve      — Duyệt giải ngân từ phía Customer
```

### Việc cần làm (Nhàn)

- [ ] Test đầy đủ luồng CATALOG: Đặt hàng → Admin duyệt → OPEN_BIDDING → Chọn NHT → PROCESSING → SHIPPED → DELIVERED
- [ ] Test luồng CUSTOM: Thiết kế → Đặt → Mở đấu giá → Chọn NHT → tự động tạo HĐ
- [ ] Đảm bảo auto-release 24h hoạt động đúng (`OrderAutoReleaseScheduler`)
- [ ] Validate giỏ hàng: kiểm tra tồn kho trước khi đặt
- [ ] Hoàn thiện UI stepper trạng thái đơn hàng trên `OrdersPage.jsx`
- [ ] Xử lý case hủy đơn và hiển thị thông báo hoàn tiền
- [ ] Kết nối FurnitureDesignerPage với luồng tạo đơn CUSTOM

---

## 🔧 NHƯ — Chức năng Quản lý Admin

### Phạm vi tổng quát
Phụ trách toàn bộ giao diện và logic nghiệp vụ của Admin: duyệt dự án, quản lý hợp đồng, đơn hàng, người dùng, sản phẩm và cấu hình hệ thống.

---

### Backend

#### Module: `admin`
| File | Trạng thái | Nhiệm vụ |
|------|-----------|----------|
| `AdminDashboardController.java` | Có sẵn | Thống kê tổng quan: tổng user, đơn hàng, doanh thu |
| `AdminDashboardService.java` | Có sẵn | Query aggregate các số liệu dashboard |
| `AdminAnalyticsController.java` | Có sẵn | Biểu đồ doanh thu, phân tích xu hướng |
| `AdminAnalyticsService.java` | Có sẵn | Logic tính toán thống kê theo tháng/quý |
| `AdminProjectController.java` | Có sẵn | Duyệt/từ chối dự án |
| `AdminProjectService.java` | Có sẵn | Logic duyệt dự án + thông báo NHT |
| `AdminPartnerController.java` | Có sẵn | Phê duyệt/khóa tài khoản nhà thầu |
| `AdminPartnerService.java` | Có sẵn | Kiểm tra logic approvalStatus |
| `AdminUserManagementController.java` | Có sẵn | CRUD người dùng, khóa tài khoản |
| `AdminSettingsController.java` | Có sẵn | Đọc/ghi cấu hình hệ thống (feature flags) |
| `AdminSettingsService.java` | Có sẵn | Lưu SystemSetting vào DB |
| `AdminDisputeController.java` | Có sẵn | Xem & xử lý tranh chấp |
| `AdminDisputeService.java` | Có sẵn | Phán quyết tranh chấp, phân chia tiền |
| `AdminProductController.java` | Có sẵn | CRUD sản phẩm shop |
| `FeatureFlagService.java` | Có sẵn | Quản lý tất cả feature flags |

#### Module: `features/project`
| File | Trạng thái | Nhiệm vụ |
|------|-----------|----------|
| `ProjectController.java` | Có sẵn | Admin xem tất cả dự án |
| `ProjectService.java` | Có sẵn | Kiểm tra flow duyệt dự án |

#### Module: `features/dispute`
| File | Trạng thái | Nhiệm vụ |
|------|-----------|----------|
| `DisputeController.java` | Có sẵn | API tạo tranh chấp từ user |
| `DisputeService.java` | Có sẵn | Freeze hợp đồng khi có tranh chấp |


### Frontend (Admin Pages)

| File | Trạng thái | Nhiệm vụ |
|------|-----------|----------|
| `AdminOverviewPage.jsx` | Có sẵn | Dashboard: thống kê KPI, biểu đồ doanh thu |
| `AdminProjectsPage.jsx` | Có sẵn | Danh sách dự án + nút Duyệt/Từ chối |
| `AdminContractsPage.jsx` | Có sẵn | Quản lý hợp đồng: Duyệt, Từ chối, Hoàn thành, Sửa giá |
| `AdminOrdersPage.jsx` | Có sẵn | Quản lý đơn hàng: duyệt, mở đấu giá, cập nhật trạng thái |
| `AdminProductsPage.jsx` | Có sẵn | CRUD sản phẩm: thêm/sửa/xóa, quản lý tồn kho |
| `AdminAllUsersPage.jsx` | Có sẵn | Danh sách user, xem thông tin, khóa/mở tài khoản |
| `AdminDisputesPage.jsx` | Có sẵn | Xem tranh chấp, chat trong dispute room, ra phán quyết |
| `AdminSettingsPage.jsx` | Có sẵn | Cài đặt feature flags, tỉ lệ phí, cọc |
| `AdminPlatformWalletPage.jsx` | Có sẵn | Xem doanh thu nền tảng, lịch sử phí |
| `AdminWithdrawalsPage.jsx` | Có sẵn | Duyệt/từ chối yêu cầu rút tiền của user |
| `ChatMonitoring.tsx` | Có sẵn | Giám sát các phòng chat trên hệ thống |

### API Endpoints cần kiểm tra (Như)

```
GET    /api/admin/dashboard/stats              — Số liệu tổng quan
GET    /api/admin/projects                     — Tất cả dự án
POST   /api/admin/projects/{id}/approve        — Duyệt dự án
POST   /api/admin/projects/{id}/reject         — Từ chối dự án
GET    /api/admin/contracts                    — Tất cả hợp đồng
POST   /api/admin/contracts/{id}/approve       — Duyệt hợp đồng
POST   /api/admin/contracts/{id}/reject        — Từ chối hợp đồng
POST   /api/admin/contracts/{id}/complete      — Xác nhận hoàn thành
PUT    /api/admin/contracts/{id}/price         — Sửa giá (±10%)
GET    /api/admin/orders                       — Tất cả đơn hàng
POST   /api/admin/orders/{id}/approve-bidding  — Duyệt → mở đấu giá
PUT    /api/admin/orders/{id}/status           — Cập nhật trạng thái
GET    /api/admin/users                        — Danh sách người dùng
PUT    /api/admin/users/{id}/lock              — Khóa tài khoản
POST   /api/admin/partners/{id}/approve        — Duyệt nhà thầu
GET    /api/admin/settings                     — Đọc cấu hình
POST   /api/admin/settings                     — Lưu cấu hình
GET    /api/admin/disputes                     — Danh sách tranh chấp
POST   /api/admin/disputes/{id}/resolve        — Ra phán quyết
GET    /api/admin/withdrawals                  — Yêu cầu rút tiền
POST   /api/admin/withdrawals/{id}/approve     — Duyệt rút tiền
```

### Việc cần làm (Như)

- [ ] Hoàn thiện biểu đồ trên `AdminOverviewPage.jsx` (dùng BarChart, LineChart đã có)
- [ ] Tích hợp đầy đủ API thống kê vào dashboard (doanh thu theo tháng, tỉ lệ hoàn thành)
- [ ] Test luồng duyệt nhà thầu: PENDING → APPROVED → NHT có thể đấu thầu
- [ ] Test luồng duyệt hợp đồng → thông báo cho cả 2 bên ký
- [ ] Hoàn thiện UI trang tranh chấp: chat 3 bên, upload bằng chứng, nút phán quyết
- [ ] Cài đặt hệ thống: đảm bảo feature flags save/load đúng từ DB
- [ ] Trang quản lý sản phẩm: upload ảnh Cloudinary, quản lý tồn kho
- [ ] Duyệt rút tiền: hiển thị số dư ví trước khi duyệt, confirm popup
- [ ] Giám sát chat: lọc theo phòng, người dùng, thời gian

---

## ⚔️ THÁI — Chức năng Đấu thầu (Bidding & Auction)

### Phạm vi tổng quát
Phụ trách toàn bộ hệ thống đấu thầu: đấu thầu dự án thi công (Contractor gửi hồ sơ thầu cho Project), đấu thầu đơn hàng CUSTOM (Contractor báo giá cho Order), và quản lý hồ sơ năng lực của nhà thầu.

---

### Backend

#### Module: `features/constructor` — Đấu thầu Dự án
| File | Trạng thái | Nhiệm vụ |
|------|-----------|----------|
| `BidController.java` | Có sẵn | Gửi báo giá, xem báo giá, rút báo giá |
| `BidService.java` | Có sẵn | Logic blind bidding: NHT không thấy giá nhau |
| `Bid.java` (entity) | Có sẵn | Kiểm tra trạng thái: PENDING/ACCEPTED/REJECTED |
| `BidDetail.java` (entity) | Có sẵn | Chi tiết hạng mục trong hồ sơ thầu |
| `BidRepository.java` | Có sẵn | Query theo project, theo contractor |

#### Module: `features/order` — Đấu thầu Đơn hàng
| File | Trạng thái | Nhiệm vụ |
|------|-----------|----------|
| `OrderBidController.java` | Có sẵn | NHT gửi báo giá đơn hàng CUSTOM |
| `OrderBidService.java` | Có sẵn | Đấu thầu đơn, chọn thầu, auto tạo hợp đồng |
| `OrderBid.java` (entity) | Có sẵn | Kiểm tra enum trạng thái bid |
| `OrderBidItem.java` (entity) | Có sẵn | Chi tiết hạng mục báo giá |
| `OrderBidRepository.java` | Có sẵn | Query open bids, bids by contractor |

#### Module: `features/portfolio` — Hồ sơ năng lực
| File | Trạng thái | Nhiệm vụ |
|------|-----------|----------|
| `PortfolioController.java` | Có sẵn | CRUD ảnh công trình đã hoàn thiện |
| `PortfolioService.java` | Có sẵn | Upload/xóa portfolio item |
| `ContractorProfileController.java` | Có sẵn | Hồ sơ năng lực nhà thầu |
| `ContractorProfileService.java` | Có sẵn | Cập nhật thông tin chuyên ngành, kinh nghiệm |
| `PortfolioItem.java` (entity) | Có sẵn | Ảnh + mô tả công trình |
| `ContractorProfile.java` (entity) | Có sẵn | Thông tin chi tiết nhà thầu |

#### Module: `features/project` — Marketplace dự án
| File | Trạng thái | Nhiệm vụ |
|------|-----------|----------|
| `ProjectController.java` | Có sẵn | Browse marketplace, xem chi tiết dự án |
| `ProjectService.java` | Có sẵn | Kiểm tra filter: danh mục, ngân sách, địa chỉ |

#### Module: `features/constructor` — Nhật ký thi công
| File | Trạng thái | Nhiệm vụ |
|------|-----------|----------|
| `ConstructionLogController.java` | Có sẵn | Cập nhật tiến độ, upload ảnh minh chứng |
| `ConstructionLogService.java` | Có sẵn | Validate: tiến độ chỉ tăng, max 6 ảnh/lần |
| `ConstructionLog.java` (entity) | Có sẵn | % tiến độ, mô tả, ảnh, giai đoạn |


### Frontend (Bidding & Contractor)

| File | Trạng thái | Nhiệm vụ |
|------|-----------|----------|
| `ProjectMarketplacePage.jsx` | Có sẵn | Marketplace dự án — lọc, tìm kiếm cho NHT |
| `ProjectDetailPage.jsx` | Có sẵn | Chi tiết dự án + form gửi báo giá |
| `ProjectListPage.jsx` | Có sẵn | Danh sách dự án của Customer |
| `CreateProjectPage.jsx` | Có sẵn | Tạo dự án mới (Customer) |
| `MyBidsPage.jsx` | Có sẵn | Danh sách hồ sơ thầu đã gửi (Contractor) |
| `OrderBiddingPage.jsx` | Có sẵn | Đơn hàng CUSTOM đang mở đấu giá (Contractor) |
| `ContractorProgressPage.jsx` | Có sẵn | Cập nhật nhật ký thi công (Contractor) |
| `ContractorProfilePage.jsx` | Có sẵn | Hồ sơ năng lực public của nhà thầu |
| `PortfolioPage.jsx` | Có sẵn | Quản lý portfolio ảnh công trình |
| `DashboardPage.jsx` | Có sẵn | Bảng điều khiển tổng hợp cho NHT |

### API Endpoints cần kiểm tra (Thái)

```
# Đấu thầu Dự án
GET    /api/projects/browse                        — Marketplace (Contractor)
GET    /api/projects/{id}                          — Chi tiết dự án
POST   /api/bids                                   — Gửi hồ sơ thầu
GET    /api/projects/{id}/bids                     — Xem báo giá (Customer/Admin)
DELETE /api/bids/{id}                              — Rút báo giá
POST   /api/projects/{id}/accept-bid/{bidId}       — Customer chọn báo giá → tạo HĐ

# Đấu thầu Đơn hàng CUSTOM
GET    /api/order-bids/open                        — Đơn đang mở (Contractor)
POST   /api/order-bids/{orderId}                   — Gửi báo giá đơn hàng
GET    /api/order-bids/my                          — Báo giá đã gửi
GET    /api/order-bids/order/{orderId}             — Báo giá của một đơn (Customer)
POST   /api/order-bids/order/{id}/accept/{bidId}   — Chọn nhà thầu → auto tạo HĐ

# Nhật ký thi công
POST   /api/construction-logs                      — Cập nhật tiến độ + ảnh
GET    /api/contracts/{id}/construction-logs       — Xem nhật ký
GET    /api/contracts/{id}/progress                — % tiến độ hiện tại
POST   /api/orders/{id}/mark-done                  — Báo hoàn thành đơn hàng + ảnh

# Portfolio & Profile
GET    /api/portfolio/my                           — Portfolio của NHT đăng nhập
POST   /api/portfolio                              — Thêm ảnh công trình
DELETE /api/portfolio/{id}                         — Xóa ảnh
GET    /api/contractor-profile/{userId}            — Hồ sơ public
PUT    /api/contractor-profile                     — Cập nhật hồ sơ
```

### Việc cần làm (Thái)

- [ ] Test blind bidding: đảm bảo NHT không thấy giá của nhau khi xem `GET /api/order-bids/order/{id}`
- [ ] Ẩn địa chỉ đầy đủ trong đơn CUSTOM (chỉ hiện Quận/TP) — kiểm tra `OrderBidController`
- [ ] Trang `ProjectMarketplacePage`: bộ lọc hoạt động (danh mục, ngân sách, địa chỉ)
- [ ] Form báo giá dự án: upload ảnh mẫu, nhập hạng mục chi tiết (BidDetail)
- [ ] Form báo giá đơn hàng: tổng giá, số ngày, bảng hạng mục (OrderBidItem)
- [ ] Nhật ký thi công: upload tối đa 6 ảnh/lần, validate tiến độ chỉ tăng
- [ ] Giai đoạn thi công: 4 bước (Khởi công / Thi công thô / Hoàn thiện / Bàn giao)
- [ ] Portfolio: upload ảnh Cloudinary, xem portfolio của NHT khác
- [ ] Khi Customer chọn thầu đơn CUSTOM → auto tạo HĐ có `sourceOrder` — test end-to-end
- [ ] Thông báo cho NHT không được chọn khi đơn đã có thầu

---

## 💰 THUẬN — Xử lý Tiền, Ví, VNPay & Nền tảng Cốt lõi

### Phạm vi tổng quát
Phụ trách toàn bộ hệ thống tài chính: ví điện tử (Escrow), tích hợp VNPay, giải ngân theo milestone, xử lý tranh chấp tài chính, bảo mật JWT, và các cấu hình nền tảng quan trọng (Security, DataSeeder, SchemaMigration).

---

### Backend — Wallet & Payment

#### Module: `features/wallet` — Trọng tâm chính
| File | Trạng thái | Nhiệm vụ |
|------|-----------|----------|
| `WalletController.java` | Có sẵn | Xem số dư, nạp tiền, rút tiền |
| `WalletService.java` | Có sẵn | Điều phối nghiệp vụ ví — delegate sang Core/Arbitration |
| `WalletCoreManager.java` | Có sẵn | **Trái tim hệ thống tiền**: lock, unlock, deposit, debit |
| `WalletArbitrationManager.java` | Có sẵn | Phân chia tiền tranh chấp giữa các bên |
| `VNPayService.java` | Có sẵn | Tạo link thanh toán, xác thực chữ ký HMAC |
| `VNPayGatewayStrategy.java` | Có sẵn | Strategy pattern cho VNPay gateway |
| `PaymentGatewayFactory.java` | Có sẵn | Factory chọn gateway (VNPay / Mock) |
| `PaymentGatewayStrategy.java` | Có sẵn | Interface cho payment strategy |
| `MockVNPayController.java` | Có sẵn | Mô phỏng VNPay sandbox cho dev/test |
| `AdminWalletController.java` | Có sẵn | Admin xem ví nền tảng, duyệt rút tiền |
| `AdminWalletService.java` | Có sẵn | Xử lý duyệt/từ chối withdraw |
| `Wallet.java` (entity) | Có sẵn | balance, lockedAmount, availableBalance |
| `Transaction.java` (entity) | Có sẵn | Audit log mọi giao dịch |
| `PlatformWallet.java` (entity) | Có sẵn | Ví nền tảng (thu phí 5%) |
| `PlatformTransaction.java` (entity) | Có sẵn | Lịch sử phí thu từ giao dịch |
| `UserToken.java` (entity) | Có sẵn | Token VNPay callback idempotency |
| `WalletRepository.java` | Có sẵn | Tìm ví theo userId |
| `TransactionRepository.java` | Có sẵn | Lịch sử giao dịch |
| `PlatformWalletRepository.java` | Có sẵn | Ví nền tảng |
| `PlatformTransactionRepository.java` | Có sẵn | Giao dịch nền tảng |
| `UserTokenRepository.java` | Có sẵn | Idempotency token |

#### Module: `features/constructor` — Giải ngân Hợp đồng
| File | Trạng thái | Nhiệm vụ |
|------|-----------|----------|
| `DisbursementService.java` | Có sẵn | Xử lý giải ngân theo milestone (20/50/80/100%) |
| `ContractService.java` | Có sẵn | Lock cọc 10% Customer + ký quỹ 5% NHT, hoàn tiền khi hủy |
| `DisbursementRequest.java` (entity) | Có sẵn | Yêu cầu giải ngân: tỉ lệ immediate/locked |
| `Contract.java` (entity) | Có sẵn | Kiểm tra field tài chính: depositAmount, guaranteeAmount |
| `ContractStage.java` (entity) | Có sẵn | 4 giai đoạn giải ngân |
| `DisbursementRequestRepository.java` | Có sẵn | Query theo contract, theo status |


#### Module: `config` — Nền tảng kỹ thuật
| File | Trạng thái | Nhiệm vụ |
|------|-----------|----------|
| `SecurityConfig.java` | Có sẵn | JWT filter, CORS, whitelist endpoint công khai |
| `DataSeeder.java` | Có sẵn | Seed dữ liệu mẫu (admin/customer/contractor accounts) |
| `SchemaMigration.java` | Có sẵn | ALTER TABLE tự động khi startup — tránh lỗi constraint |

#### Module: `security`
| File | Trạng thái | Nhiệm vụ |
|------|-----------|----------|
| `JwtFilter.java` | Có sẵn | Intercept request, validate Bearer token |
| `JwtUtil.java` | Có sẵn | Generate/verify JWT, extract claims |
| `UserDetailsServiceImpl.java` | Có sẵn | Load user từ DB cho Spring Security |

#### Module: `features/notification`
| File | Trạng thái | Nhiệm vụ |
|------|-----------|----------|
| `NotificationController.java` | Có sẵn | Lấy thông báo, đánh dấu đã đọc |
| `NotificationService.java` | Có sẵn | Tạo & gửi thông báo real-time cho các sự kiện |
| `Notification.java` (entity) | Có sẵn | Loại thông báo, nội dung, isRead |
| `NotificationRepository.java` | Có sẵn | Query theo userId, chưa đọc |

### Frontend (Wallet & Core)

| File | Trạng thái | Nhiệm vụ |
|------|-----------|----------|
| `WalletPage.jsx` | Có sẵn | Xem số dư, lịch sử GD, nạp VNPay, yêu cầu rút |
| `AdminPlatformWalletPage.jsx` | Có sẵn | Doanh thu nền tảng, biểu đồ phí thu |
| `AdminWithdrawalsPage.jsx` | Có sẵn | Duyệt/từ chối rút tiền |
| `NotificationsPage.jsx` | Có sẵn | Hiển thị thông báo, đánh dấu đã đọc |
| `ContractDisbursementsPage.jsx` | Có sẵn | *(Phối hợp với Nhàn)* Giải ngân theo milestone |

### API Endpoints cần kiểm tra (Thuận)

```
# Ví người dùng
GET    /api/wallet/my                          — Số dư & available balance
GET    /api/wallet/transactions                — Lịch sử giao dịch
POST   /api/wallet/withdraw                    — Yêu cầu rút tiền

# VNPay
POST   /api/wallet/vnpay/create-payment        — Tạo link thanh toán VNPay
GET    /api/wallet/vnpay/callback              — Callback từ VNPay (idempotent)
GET    /api/wallet/vnpay/return                — Return URL sau khi thanh toán

# Giải ngân Hợp đồng
POST   /api/disbursements                      — NHT gửi yêu cầu giải ngân
POST   /api/disbursements/{id}/approve         — Customer duyệt giải ngân
POST   /api/disbursements/{id}/reject          — Customer từ chối
POST   /api/disbursements/{id}/unlock          — Unlock locked tiền

# Admin ví
GET    /api/admin/withdrawals                  — Danh sách rút tiền
POST   /api/admin/withdrawals/{id}/approve     — Duyệt rút tiền (debit platform)
POST   /api/admin/withdrawals/{id}/reject      — Từ chối (unlock về available)
GET    /api/admin/platform-wallet              — Số dư ví nền tảng

# Thông báo
GET    /api/notifications                      — Thông báo của tôi
PUT    /api/notifications/{id}/read            — Đánh dấu đã đọc
PUT    /api/notifications/read-all             — Đánh dấu tất cả đã đọc
```

### Việc cần làm (Thuận) — QUAN TRỌNG NHẤT

#### VNPay & Thanh toán
- [ ] Cấu hình đúng `vnpay.tmn-code` và `vnpay.hash-secret-normal` trong `application.yml` / `.env`
- [ ] Test nạp tiền VNPay end-to-end (thẻ test: `9704198526191432198`)
- [ ] Đảm bảo callback VNPay **idempotent** — không nạp 2 lần cùng 1 giao dịch
- [ ] Validate input: số tiền tối thiểu 10,000 VND, tối đa 500,000,000 VND
- [ ] Return URL sau VNPay phải redirect đúng về `WalletPage.jsx` với thông báo kết quả

#### Escrow & Giải ngân Hợp đồng
- [ ] Lock 100% giá trị HĐ khi Customer chấp nhận báo giá
- [ ] Lock thêm 5% ký quỹ từ ví NHT khi ký HĐ
- [ ] 4 giai đoạn giải ngân: 20% / 50% / 80% / 100% — mỗi giai đoạn tối đa đến ngưỡng đó
- [ ] Phân chia mỗi đợt giải ngân: 40% immediate + 60% locked (theo cấu hình)
- [ ] Auto-unlock locked của giai đoạn cũ khi đạt milestone mới
- [ ] Khi Admin xác nhận hoàn công: unlock tất cả locked, hoàn cọc Customer & NHT
- [ ] Khi hủy HĐ: hoàn cọc theo quy tắc (Customer hủy mất cọc 10%, NHT hủy mất ký quỹ 5%)

#### Mini-Escrow Đơn hàng
- [ ] Lock 60% khi Customer chọn NHT đơn CUSTOM
- [ ] Khi NHT báo xong: start timer 24h
- [ ] Khi confirmed/auto: debit 100%, credit 95% cho NHT, 5% vào PlatformWallet

#### Bảo mật & Nền tảng
- [ ] Kiểm tra SecurityConfig: whitelist `/api/public/**`, `/api/auth/**`, `/api/wallet/vnpay/callback`
- [ ] JWT expiration đúng (86400000ms = 24h)
- [ ] SchemaMigration chạy đúng khi startup — không gây lỗi constraint
- [ ] DataSeeder: đảm bảo seed wallet cho mỗi user mới tạo
- [ ] NotificationService: gửi thông báo cho đúng người tại đúng sự kiện

#### Cấu hình môi trường
- [ ] `application.yml`: điền đầy đủ VNPay keys, Grok API key, Cloudinary
- [ ] Feature flags mặc định đúng trong DB sau khi DataSeeder chạy
- [ ] Test với cả VNPay sandbox và MockVNPay cho dev

---

---

## 🔗 Điểm phối hợp giữa các thành viên

| Giao điểm | Nhàn | Như | Thái | Thuận |
|-----------|------|-----|------|-------|
| Customer chọn NHT đơn CUSTOM | ✅ UI chọn | | ✅ Backend OrderBidService | ✅ Lock tiền |
| Customer chấp nhận báo giá dự án | ✅ UI chọn | | ✅ BidService | ✅ Lock cọc 10% |
| Admin duyệt hợp đồng | ✅ Nhận thông báo ký | ✅ Duyệt HĐ | ✅ Nhận thông báo ký | ✅ Xử lý ký quỹ |
| Giải ngân milestone | ✅ Customer duyệt | ✅ Admin xác nhận hoàn thành | ✅ NHT gửi yêu cầu | ✅ Logic tiền |
| Tranh chấp | ✅ Customer tạo dispute | ✅ Admin phán quyết | ✅ NHT tạo dispute | ✅ WalletArbitration |
| Thông báo | Nhận | Nhận | Nhận | ✅ NotificationService gửi |
| VNPay nạp tiền | ✅ WalletPage UI | | | ✅ VNPayService |

---

## 📐 Kiến trúc Tài chính (để cả team hiểu)

```
WalletCoreManager — Trái tim xử lý tiền
├── executeLockForOrder(userId, amount)    → lockedAmount ↑
├── executeDeposit(userId, amount)         → balance ↑
├── executeUnlockAmount(userId, amount)    → lockedAmount ↓
├── confirmDebitLocked(userId, amount)     → balance ↓, lockedAmount ↓
└── executeDisputeRefundDistribution(...)  → nhiều ví cùng lúc

Mỗi Wallet:
  balance          = Tổng tiền thực có
  lockedAmount     = Tiền đang bị đóng băng
  availableBalance = balance - lockedAmount  ← tính toán runtime
```

---

## 📊 Tóm tắt số lượng file theo người

| Thành viên | Backend files | Frontend files | Tổng |
|------------|--------------|----------------|------|
| **Nhàn** | ~10 files | ~10 pages | ~20 |
| **Như** | ~15 files | ~10 pages | ~25 |
| **Thái** | ~15 files | ~10 pages | ~25 |
| **Thuận** | ~25 files | ~5 pages | ~30 |

> Thuận có ít page hơn nhưng phần backend (Wallet, VNPay, Security, Contract tài chính) là phức tạp nhất và quan trọng nhất của hệ thống.

---

## ⚡ Thứ tự ưu tiên triển khai (gợi ý)

```
Sprint 1 — Nền tảng
  Thuận: Auth JWT + SecurityConfig + DataSeeder + WalletCoreManager cơ bản
  Như:   AdminUserManagement + Admin duyệt NHT

Sprint 2 — Luồng chính
  Nhàn:  Shop + Đặt hàng CATALOG
  Thái:  Marketplace + Gửi báo giá Dự án
  Thuận: VNPay nạp tiền + Lock cọc khi chọn báo giá

Sprint 3 — Hợp đồng & Thi công
  Như:   Admin duyệt HĐ
  Thái:  Nhật ký thi công + Yêu cầu giải ngân
  Thuận: DisbursementService + Escrow milestone
  Nhàn:  ContractProgressPage + Duyệt giải ngân

Sprint 4 — Hoàn thiện
  Nhàn:  Đơn CUSTOM + Review
  Như:   Tranh chấp + Dashboard analytics
  Thái:  Đấu thầu đơn CUSTOM + Portfolio
  Thuận: Tranh chấp tài chính + Rút tiền + Thông báo
```

---

*Tài liệu này được tạo tự động từ phân tích mã nguồn dự án ConstructX*  
*Cập nhật: Tháng 6/2026*
