# 🧪 KỊCH BẢN KIỂM THỬ TOÀN DIỆN — ConstructX Platform

> **Môi trường:** Backend `http://localhost:8080` · Frontend `http://localhost:5173`  
> **Cách khởi động:**
> ```bash
> # Terminal 1
> cd backend && .\mvnw.cmd spring-boot:run
> # Terminal 2
> cd frontend && npm run dev
> ```
> **Lưu ý:** Xóa DB và restart để DataSeeder tạo lại dữ liệu sạch trước khi test

---

## 📋 MỤC LỤC

| # | Nhóm | Số TC |
|---|------|-------|
| 1 | [Khởi động & Dữ liệu ban đầu](#1-khởi-động--dữ-liệu-ban-đầu) | 4 |
| 2 | [Xác thực — Đăng ký / Đăng nhập](#2-xác-thực--đăng-ký--đăng-nhập) | 8 |
| 3 | [Hồ sơ & Cài đặt tài khoản](#3-hồ-sơ--cài-đặt-tài-khoản) | 6 |
| 4 | [Shop — Duyệt & Mua sản phẩm Catalog](#4-shop--duyệt--mua-sản-phẩm-catalog) | 10 |
| 5 | [Đặt hàng Tùy chỉnh (Custom Order)](#5-đặt-hàng-tùy-chỉnh-custom-order) | 8 |
| 6 | [Thiết kế 2D — Furniture Designer](#6-thiết-kế-2d--furniture-designer) | 4 |
| 7 | [Tạo & Quản lý Dự án (Customer)](#7-tạo--quản-lý-dự-án-customer) | 8 |
| 8 | [Marketplace & Đấu thầu Dự án (Contractor)](#8-marketplace--đấu-thầu-dự-án-contractor) | 9 |
| 9 | [Hợp đồng & Ký kết](#9-hợp-đồng--ký-kết) | 8 |
| 10 | [Nhật ký Thi công & Upload ảnh](#10-nhật-ký-thi-công--upload-ảnh) | 7 |
| 11 | [Giải ngân theo Milestone](#11-giải-ngân-theo-milestone) | 9 |
| 12 | [Ví điện tử & VNPay](#12-ví-điện-tử--vnpay) | 8 |
| 13 | [Admin — Dashboard & Thống kê](#13-admin--dashboard--thống-kê) | 6 |
| 14 | [Admin — Duyệt Dự án & Hợp đồng](#14-admin--duyệt-dự-án--hợp-đồng) | 8 |
| 15 | [Admin — Quản lý Đơn hàng](#15-admin--quản-lý-đơn-hàng) | 7 |
| 16 | [Admin — Quản lý Sản phẩm Shop](#16-admin--quản-lý-sản-phẩm-shop) | 6 |
| 17 | [Admin — Quản lý Người dùng & Nhà thầu](#17-admin--quản-lý-người-dùng--nhà-thầu) | 7 |
| 18 | [Admin — Duyệt Rút tiền & Ví nền tảng](#18-admin--duyệt-rút-tiền--ví-nền-tảng) | 6 |
| 19 | [Tranh chấp Hợp đồng](#19-tranh-chấp-hợp-đồng) | 7 |
| 20 | [Chat real-time & AI Chatbot](#20-chat-real-time--ai-chatbot) | 6 |
| 21 | [Thông báo](#21-thông-báo) | 4 |
| 22 | [Hồ sơ năng lực Nhà thầu](#22-hồ-sơ-năng-lực-nhà-thầu) | 5 |
| 23 | [Đánh giá sau Hợp đồng](#23-đánh-giá-sau-hợp-đồng) | 5 |
| 24 | [Admin — Cấu hình Feature Flags](#24-admin--cấu-hình-feature-flags) | 5 |
| 25 | [Bảo mật & Phân quyền](#25-bảo-mật--phân-quyền) | 8 |
| **Tổng** | | **~173 test cases** |

---

## TÀI KHOẢN TEST

| Role | Email | Mật khẩu | Ví |
|------|-------|----------|-----|
| Admin | admin@constructx.com | admin123 | 500M |
| Customer 1 | khachhang1@test.com | test123 | 320M |
| Customer 2 | khachhang2@test.com | test123 | 85M |
| Customer 3 | khachhang3@test.com | test123 | 150M |
| Contractor 1 (Minh Phú — Đã duyệt) | nhathauchuyennghiep@test.com | test123 | 240M |
| Contractor 2 (Xưởng Mộc ABC — Đã duyệt) | nhaxuong_abc@test.com | test123 | 110M |
| Contractor 3 (Việt Long — Đã duyệt) | noithat_vietlong@test.com | test123 | 175M |
| Contractor Mới (Chưa duyệt) | contractor_pending@test.com | test123 | 12M |

---
