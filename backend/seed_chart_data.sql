-- ============================================================
-- SEED DATA cho biểu đồ Admin Dashboard
-- Dữ liệu trải đều 6 tháng: 01/2026 -> 06/2026
-- Đồng bộ với DB hiện tại (user max=18, contract max=14, order max=43)
-- Password hash = bcrypt("123456")
-- ============================================================
-- Chạy: mysql -u root constructx_db < seed_chart_data.sql
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. USERS — thêm 20 users mới rải từ T1 đến T6/2026
--    (10 CUSTOMER + 6 CONTRACTOR + 4 CUSTOMER)
-- ============================================================
INSERT INTO `users` (`id`,`email`,`password`,`full_name`,`phone_number`,`address`,`avatar_url`,`role`,`approval_status`,`active`,`created_at`,`updated_at`) VALUES
-- Tháng 1/2026
(19,'kh_t1_01@constructx.vn','$2a$10$B0tBqPjy7j9MP/VlkEW46e6AD5v7eUZZwaLWZz2OJ0o70Sw0SKQxW','Bùi Thị Mai','0901110001','12 Lê Duẩn, Q.1, TP.HCM',NULL,'CUSTOMER','APPROVED',b'1','2026-01-05 09:00:00.000000','2026-01-05 09:00:00.000000'),
(20,'kh_t1_02@constructx.vn','$2a$10$B0tBqPjy7j9MP/VlkEW46e6AD5v7eUZZwaLWZz2OJ0o70Sw0SKQxW','Ngô Minh Tuấn','0901110002','56 Trần Hưng Đạo, Hà Nội',NULL,'CUSTOMER','APPROVED',b'1','2026-01-12 10:30:00.000000','2026-01-12 10:30:00.000000'),
(21,'ct_t1_01@constructx.vn','$2a$10$B0tBqPjy7j9MP/VlkEW46e6AD5v7eUZZwaLWZz2OJ0o70Sw0SKQxW','Nội thất Mạnh Hùng','0912110001','99 Nguyễn Trãi, TP.HCM',NULL,'CONTRACTOR','APPROVED',b'1','2026-01-18 08:00:00.000000','2026-01-18 08:00:00.000000'),
-- Tháng 2/2026
(22,'kh_t2_01@constructx.vn','$2a$10$B0tBqPjy7j9MP/VlkEW46e6AD5v7eUZZwaLWZz2OJ0o70Sw0SKQxW','Lý Thu Hương','0901220001','88 Bạch Đằng, Đà Nẵng',NULL,'CUSTOMER','APPROVED',b'1','2026-02-03 09:00:00.000000','2026-02-03 09:00:00.000000'),
(23,'kh_t2_02@constructx.vn','$2a$10$B0tBqPjy7j9MP/VlkEW46e6AD5v7eUZZwaLWZz2OJ0o70Sw0SKQxW','Đinh Quang Hải','0901220002','14 Lý Tự Trọng, Cần Thơ',NULL,'CUSTOMER','APPROVED',b'1','2026-02-14 11:00:00.000000','2026-02-14 11:00:00.000000'),
(24,'ct_t2_01@constructx.vn','$2a$10$B0tBqPjy7j9MP/VlkEW46e6AD5v7eUZZwaLWZz2OJ0o70Sw0SKQxW','Xưởng gỗ Phú Hưng','0912220001','45 Tô Hiến Thành, Bình Dương',NULL,'CONTRACTOR','APPROVED',b'1','2026-02-20 08:30:00.000000','2026-02-20 08:30:00.000000'),
-- Tháng 3/2026
(25,'kh_t3_01@constructx.vn','$2a$10$B0tBqPjy7j9MP/VlkEW46e6AD5v7eUZZwaLWZz2OJ0o70Sw0SKQxW','Trương Thị Linh','0901330001','3 Hoàng Diệu, Q.4, TP.HCM',NULL,'CUSTOMER','APPROVED',b'1','2026-03-07 10:00:00.000000','2026-03-07 10:00:00.000000'),
(26,'kh_t3_02@constructx.vn','$2a$10$B0tBqPjy7j9MP/VlkEW46e6AD5v7eUZZwaLWZz2OJ0o70Sw0SKQxW','Vũ Đình Phú','0901330002','22 Nguyễn Văn Cừ, Long An',NULL,'CUSTOMER','APPROVED',b'1','2026-03-15 09:30:00.000000','2026-03-15 09:30:00.000000'),
(27,'ct_t3_01@constructx.vn','$2a$10$B0tBqPjy7j9MP/VlkEW46e6AD5v7eUZZwaLWZz2OJ0o70Sw0SKQxW','Nội thất Thành Đạt','0912330001','78 Lê Văn Việt, Q.9, TP.HCM',NULL,'CONTRACTOR','APPROVED',b'1','2026-03-22 08:00:00.000000','2026-03-22 08:00:00.000000'),
-- Tháng 4/2026
(28,'kh_t4_01@constructx.vn','$2a$10$B0tBqPjy7j9MP/VlkEW46e6AD5v7eUZZwaLWZz2OJ0o70Sw0SKQxW','Phan Thị Yến','0901440001','66 Nguyễn Huệ, Q.1, TP.HCM',NULL,'CUSTOMER','APPROVED',b'1','2026-04-04 10:00:00.000000','2026-04-04 10:00:00.000000'),
(29,'kh_t4_02@constructx.vn','$2a$10$B0tBqPjy7j9MP/VlkEW46e6AD5v7eUZZwaLWZz2OJ0o70Sw0SKQxW','Hồ Văn Khoa','0901440002','15 Nguyễn Thị Minh Khai, Hà Nội',NULL,'CUSTOMER','APPROVED',b'1','2026-04-10 11:30:00.000000','2026-04-10 11:30:00.000000'),
(30,'kh_t4_03@constructx.vn','$2a$10$B0tBqPjy7j9MP/VlkEW46e6AD5v7eUZZwaLWZz2OJ0o70Sw0SKQxW','Dương Ngọc Lan','0901440003','27 Trần Phú, Đà Lạt',NULL,'CUSTOMER','APPROVED',b'1','2026-04-18 09:00:00.000000','2026-04-18 09:00:00.000000'),
(31,'ct_t4_01@constructx.vn','$2a$10$B0tBqPjy7j9MP/VlkEW46e6AD5v7eUZZwaLWZz2OJ0o70Sw0SKQxW','Công ty Gỗ Thiên Phú','0912440001','200 Điện Biên Phủ, Bình Thạnh',NULL,'CONTRACTOR','APPROVED',b'1','2026-04-25 08:30:00.000000','2026-04-25 08:30:00.000000'),
-- Tháng 5/2026
(32,'kh_t5_01@constructx.vn','$2a$10$B0tBqPjy7j9MP/VlkEW46e6AD5v7eUZZwaLWZz2OJ0o70Sw0SKQxW','Châu Minh Thư','0901550001','9 Võ Văn Tần, Q.3, TP.HCM',NULL,'CUSTOMER','APPROVED',b'1','2026-05-06 10:00:00.000000','2026-05-06 10:00:00.000000'),
(33,'kh_t5_02@constructx.vn','$2a$10$B0tBqPjy7j9MP/VlkEW46e6AD5v7eUZZwaLWZz2OJ0o70Sw0SKQxW','Lê Hoàng Nam','0901550002','34 CMT8, Tân Bình, TP.HCM',NULL,'CUSTOMER','APPROVED',b'1','2026-05-12 09:30:00.000000','2026-05-12 09:30:00.000000'),
(34,'kh_t5_03@constructx.vn','$2a$10$B0tBqPjy7j9MP/VlkEW46e6AD5v7eUZZwaLWZz2OJ0o70Sw0SKQxW','Nguyễn Bích Thủy','0901550003','11 Trường Sa, Q.Bình Thạnh',NULL,'CUSTOMER','APPROVED',b'1','2026-05-20 11:00:00.000000','2026-05-20 11:00:00.000000'),
-- Tháng 6/2026 (thêm vào)
(35,'kh_t6_new1@constructx.vn','$2a$10$B0tBqPjy7j9MP/VlkEW46e6AD5v7eUZZwaLWZz2OJ0o70Sw0SKQxW','Tô Bảo Châu','0901660001','48 Lê Thị Riêng, Q.1',NULL,'CUSTOMER','APPROVED',b'1','2026-06-02 10:00:00.000000','2026-06-02 10:00:00.000000'),
(36,'kh_t6_new2@constructx.vn','$2a$10$B0tBqPjy7j9MP/VlkEW46e6AD5v7eUZZwaLWZz2OJ0o70Sw0SKQxW','Đặng Trọng Nghĩa','0901660002','5 Sư Vạn Hạnh, Q.10',NULL,'CUSTOMER','APPROVED',b'1','2026-06-05 09:00:00.000000','2026-06-05 09:00:00.000000'),
(37,'ct_t6_new1@constructx.vn','$2a$10$B0tBqPjy7j9MP/VlkEW46e6AD5v7eUZZwaLWZz2OJ0o70Sw0SKQxW','Mộc Gia Bảo','0912660001','100 Kha Vạn Cân, Thủ Đức',NULL,'CONTRACTOR','APPROVED',b'1','2026-06-08 08:00:00.000000','2026-06-08 08:00:00.000000'),
(38,'ct_t6_new2@constructx.vn','$2a$10$B0tBqPjy7j9MP/VlkEW46e6AD5v7eUZZwaLWZz2OJ0o70Sw0SKQxW','Nội thất Sao Việt','0912660002','23 Phạm Văn Đồng, Thủ Đức',NULL,'CONTRACTOR','APPROVED',b'1','2026-06-15 08:30:00.000000','2026-06-15 08:30:00.000000');

-- ============================================================
-- 2. WALLETS cho users mới (id 19-38)
-- ============================================================
INSERT INTO `wallets` (`id`,`user_id`,`balance`,`locked_amount`,`updated_at`) VALUES
(19,19,80000000,0,'2026-01-05 09:00:00.000000'),
(20,20,60000000,0,'2026-01-12 10:30:00.000000'),
(21,21,200000000,0,'2026-01-18 08:00:00.000000'),
(22,22,45000000,0,'2026-02-03 09:00:00.000000'),
(23,23,90000000,0,'2026-02-14 11:00:00.000000'),
(24,24,180000000,0,'2026-02-20 08:30:00.000000'),
(25,25,55000000,0,'2026-03-07 10:00:00.000000'),
(26,26,70000000,0,'2026-03-15 09:30:00.000000'),
(27,27,250000000,0,'2026-03-22 08:00:00.000000'),
(28,28,120000000,0,'2026-04-04 10:00:00.000000'),
(29,29,65000000,0,'2026-04-10 11:30:00.000000'),
(30,30,40000000,0,'2026-04-18 09:00:00.000000'),
(31,31,300000000,0,'2026-04-25 08:30:00.000000'),
(32,32,85000000,0,'2026-05-06 10:00:00.000000'),
(33,33,50000000,0,'2026-05-12 09:30:00.000000'),
(34,34,95000000,0,'2026-05-20 11:00:00.000000'),
(35,35,70000000,0,'2026-06-02 10:00:00.000000'),
(36,36,55000000,0,'2026-06-05 09:00:00.000000'),
(37,37,220000000,0,'2026-06-08 08:00:00.000000'),
(38,38,180000000,0,'2026-06-15 08:30:00.000000');

-- ============================================================
-- 3. TRANSACTIONS — nạp tiền VNPay rải đều 6 tháng
--    (wallet_id dùng id của wallets mới)
-- ============================================================
INSERT INTO `transactions` (`id`,`wallet_id`,`amount`,`fee_amount`,`net_amount`,`type`,`status`,`description`,`gateway_order_id`,`payment_gateway`,`contract_job_id`,`escrow_account_id`,`failure_reason`,`created_at`,`completed_at`,`gateway_trans_id`) VALUES
-- T1/2026
(100,19,80000000,0,NULL,'DEPOSIT','SUCCESS','Nạp tiền thành công qua cổng kết nối VNPAY Sandbox','SANDBOX-T1-001','VNPAY',NULL,NULL,NULL,'2026-01-05 09:15:00.000000',NULL,NULL),
(101,20,60000000,0,NULL,'DEPOSIT','SUCCESS','Nạp tiền thành công qua cổng kết nối VNPAY Sandbox','SANDBOX-T1-002','VNPAY',NULL,NULL,NULL,'2026-01-12 10:45:00.000000',NULL,NULL),
(102,21,200000000,0,NULL,'DEPOSIT','SUCCESS','Nạp tiền thành công qua cổng kết nối VNPAY Sandbox','SANDBOX-T1-003','VNPAY',NULL,NULL,NULL,'2026-01-18 08:20:00.000000',NULL,NULL),
-- T2/2026
(103,22,45000000,0,NULL,'DEPOSIT','SUCCESS','Nạp tiền thành công qua cổng kết nối VNPAY Sandbox','SANDBOX-T2-001','VNPAY',NULL,NULL,NULL,'2026-02-03 09:20:00.000000',NULL,NULL),
(104,23,90000000,0,NULL,'DEPOSIT','SUCCESS','Nạp tiền thành công qua cổng kết nối VNPAY Sandbox','SANDBOX-T2-002','VNPAY',NULL,NULL,NULL,'2026-02-14 11:15:00.000000',NULL,NULL),
(105,24,180000000,0,NULL,'DEPOSIT','SUCCESS','Nạp tiền thành công qua cổng kết nối VNPAY Sandbox','SANDBOX-T2-003','VNPAY',NULL,NULL,NULL,'2026-02-20 08:45:00.000000',NULL,NULL),
-- T3/2026
(106,25,55000000,0,NULL,'DEPOSIT','SUCCESS','Nạp tiền thành công qua cổng kết nối VNPAY Sandbox','SANDBOX-T3-001','VNPAY',NULL,NULL,NULL,'2026-03-07 10:20:00.000000',NULL,NULL),
(107,26,70000000,0,NULL,'DEPOSIT','SUCCESS','Nạp tiền thành công qua cổng kết nối VNPAY Sandbox','SANDBOX-T3-002','VNPAY',NULL,NULL,NULL,'2026-03-15 09:50:00.000000',NULL,NULL),
(108,27,250000000,0,NULL,'DEPOSIT','SUCCESS','Nạp tiền thành công qua cổng kết nối VNPAY Sandbox','SANDBOX-T3-003','VNPAY',NULL,NULL,NULL,'2026-03-22 08:30:00.000000',NULL,NULL),
-- T4/2026
(109,28,120000000,0,NULL,'DEPOSIT','SUCCESS','Nạp tiền thành công qua cổng kết nối VNPAY Sandbox','SANDBOX-T4-001','VNPAY',NULL,NULL,NULL,'2026-04-04 10:20:00.000000',NULL,NULL),
(110,29,65000000,0,NULL,'DEPOSIT','SUCCESS','Nạp tiền thành công qua cổng kết nối VNPAY Sandbox','SANDBOX-T4-002','VNPAY',NULL,NULL,NULL,'2026-04-10 11:45:00.000000',NULL,NULL),
(111,30,40000000,0,NULL,'DEPOSIT','SUCCESS','Nạp tiền thành công qua cổng kết nối VNPAY Sandbox','SANDBOX-T4-003','VNPAY',NULL,NULL,NULL,'2026-04-18 09:20:00.000000',NULL,NULL),
(112,31,300000000,0,NULL,'DEPOSIT','SUCCESS','Nạp tiền thành công qua cổng kết nối VNPAY Sandbox','SANDBOX-T4-004','VNPAY',NULL,NULL,NULL,'2026-04-25 08:50:00.000000',NULL,NULL),
-- T5/2026
(113,32,85000000,0,NULL,'DEPOSIT','SUCCESS','Nạp tiền thành công qua cổng kết nối VNPAY Sandbox','SANDBOX-T5-001','VNPAY',NULL,NULL,NULL,'2026-05-06 10:20:00.000000',NULL,NULL),
(114,33,50000000,0,NULL,'DEPOSIT','SUCCESS','Nạp tiền thành công qua cổng kết nối VNPAY Sandbox','SANDBOX-T5-002','VNPAY',NULL,NULL,NULL,'2026-05-12 09:50:00.000000',NULL,NULL),
(115,34,95000000,0,NULL,'DEPOSIT','SUCCESS','Nạp tiền thành công qua cổng kết nối VNPAY Sandbox','SANDBOX-T5-003','VNPAY',NULL,NULL,NULL,'2026-05-20 11:20:00.000000',NULL,NULL),
-- T6/2026
(116,35,70000000,0,NULL,'DEPOSIT','SUCCESS','Nạp tiền thành công qua cổng kết nối VNPAY Sandbox','SANDBOX-T6-001','VNPAY',NULL,NULL,NULL,'2026-06-02 10:20:00.000000',NULL,NULL),
(117,36,55000000,0,NULL,'DEPOSIT','SUCCESS','Nạp tiền thành công qua cổng kết nối VNPAY Sandbox','SANDBOX-T6-002','VNPAY',NULL,NULL,NULL,'2026-06-05 09:20:00.000000',NULL,NULL),
(118,37,220000000,0,NULL,'DEPOSIT','SUCCESS','Nạp tiền thành công qua cổng kết nối VNPAY Sandbox','SANDBOX-T6-003','VNPAY',NULL,NULL,NULL,'2026-06-08 08:20:00.000000',NULL,NULL),
(119,38,180000000,0,NULL,'DEPOSIT','SUCCESS','Nạp tiền thành công qua cổng kết nối VNPAY Sandbox','SANDBOX-T6-004','VNPAY',NULL,NULL,NULL,'2026-06-15 08:50:00.000000',NULL,NULL);

-- ============================================================
-- 4. PROJECT (table name = `project`) — rải đều 6 tháng
--    user_id tham chiếu users mới (19-34 là customer)
-- ============================================================
INSERT INTO `project` (`id`,`user_id`,`name`,`category`,`area`,`style`,`address`,`description`,`budget_min`,`budget_max`,`bid_type`,`status`,`approval_status`,`admin_note`,`approved_at`,`created_at`) VALUES
-- T1/2026
(100,19,'Thiết kế phòng khách Hiện đại','Nội thất',45,'Hiện đại','12 Lê Duẩn, Q.1, TP.HCM','Cần thiết kế phòng khách hiện đại, tối giản',20000000,40000000,'NEGOTIABLE','OPEN','APPROVED',NULL,'2026-01-06 10:00:00','2026-01-05 14:00:00.000000'),
(101,20,'Tủ bếp gỗ tự nhiên','Nội thất',20,'Cổ điển','56 Trần Hưng Đạo, Hà Nội','Tủ bếp gỗ sồi kích thước 3m',30000000,50000000,'FIXED_PRICE','IN_PROGRESS','APPROVED',NULL,'2026-01-13 09:00:00','2026-01-12 15:00:00.000000'),
-- T2/2026
(102,22,'Sofa phòng khách góc L','Nội thất',30,'Scandinavian','88 Bạch Đằng, Đà Nẵng','Sofa góc L bọc vải linen',15000000,25000000,'NEGOTIABLE','COMPLETED','APPROVED',NULL,'2026-02-04 10:00:00','2026-02-03 14:00:00.000000'),
(103,23,'Giường ngủ gỗ óc chó','Nội thất',18,'Hiện đại','14 Lý Tự Trọng, Cần Thơ','Giường 1m8 gỗ óc chó nhập khẩu',25000000,45000000,'FIXED_PRICE','OPEN','APPROVED',NULL,'2026-02-15 09:00:00','2026-02-14 15:00:00.000000'),
-- T3/2026
(104,25,'Kệ TV âm tường','Nội thất',12,'Tối giản','3 Hoàng Diệu, Q.4, TP.HCM','Kệ TV 3m tích hợp tủ đựng',18000000,30000000,'NEGOTIABLE','IN_PROGRESS','APPROVED',NULL,'2026-03-08 10:00:00','2026-03-07 14:00:00.000000'),
(105,26,'Phòng làm việc tại nhà','Nội thất',15,'Hiện đại','22 Nguyễn Văn Cừ, Long An','Bàn làm việc + kệ sách + tủ hồ sơ',22000000,38000000,'FIXED_PRICE','OPEN','APPROVED',NULL,'2026-03-16 10:00:00','2026-03-15 14:00:00.000000'),
-- T4/2026
(106,28,'Tủ quần áo walk-in closet','Nội thất',25,'Hiện đại','66 Nguyễn Huệ, Q.1, TP.HCM','Walk-in closet 5m, đầy đủ hộc kéo và thanh treo',45000000,70000000,'NEGOTIABLE','OPEN','APPROVED',NULL,'2026-04-05 09:00:00','2026-04-04 14:00:00.000000'),
(107,29,'Bàn ăn 6 chỗ gỗ thịt','Nội thất',10,'Cổ điển','15 Nguyễn Thị Minh Khai, Hà Nội','Bàn ăn gỗ thịt nguyên khối kết hợp ghế',35000000,55000000,'FIXED_PRICE','IN_PROGRESS','APPROVED',NULL,'2026-04-11 10:00:00','2026-04-10 15:00:00.000000'),
(108,30,'Nội thất phòng trẻ em','Nội thất',20,'Trẻ em','27 Trần Phú, Đà Lạt','Giường tầng + bàn học + kệ đồ chơi',20000000,35000000,'NEGOTIABLE','COMPLETED','APPROVED',NULL,'2026-04-19 09:00:00','2026-04-18 14:00:00.000000'),
-- T5/2026
(109,32,'Phòng bếp tích hợp đảo bếp','Nội thất',35,'Hiện đại','9 Võ Văn Tần, Q.3, TP.HCM','Tủ bếp + đảo bếp + tủ rượu',60000000,90000000,'FIXED_PRICE','IN_PROGRESS','APPROVED',NULL,'2026-05-07 09:00:00','2026-05-06 14:00:00.000000'),
(110,33,'Kệ sách thư viện mini','Nội thất',18,'Tối giản','34 CMT8, Tân Bình','Kệ sách âm tường 4m x 2.4m',15000000,25000000,'NEGOTIABLE','OPEN','APPROVED',NULL,'2026-05-13 10:00:00','2026-05-12 15:00:00.000000'),
(111,34,'Tủ giày lớn hành lang','Nội thất',8,'Hiện đại','11 Trường Sa, Q.Bình Thạnh','Tủ giày 2m bao gồm gương',12000000,20000000,'FIXED_PRICE','OPEN','APPROVED',NULL,'2026-05-21 09:00:00','2026-05-20 15:00:00.000000'),
-- T6/2026
(112,35,'Phòng khách sang trọng','Nội thất',50,'Luxury','48 Lê Thị Riêng, Q.1','Sofa da + bàn cà phê + kệ tivi',80000000,120000000,'NEGOTIABLE','OPEN','APPROVED',NULL,'2026-06-03 09:00:00','2026-06-02 14:00:00.000000'),
(113,36,'Tủ quần áo 4 cánh','Nội thất',12,'Hiện đại','5 Sư Vạn Hạnh, Q.10','Tủ quần áo MDF phủ melamine',18000000,28000000,'FIXED_PRICE','OPEN','APPROVED',NULL,'2026-06-06 10:00:00','2026-06-05 15:00:00.000000');

-- ============================================================
-- 5. ORDERS — đơn hàng từ users mới, rải đều 6 tháng
--    Một số DELIVERED, một số PROCESSING, một số PENDING
-- ============================================================
INSERT INTO `orders` (`id`,`order_code`,`customer_id`,`assigned_contractor_id`,`selected_bid_id`,`type`,`status`,`total_amount`,`delivery_address`,`contact_phone`,`customer_note`,`custom_requirements`,`reference_image_url`,`processing_note`,`deposit_percent`,`deposit_amount`,`deposit_locked`,`deposit_paid_at`,`completion_image_url`,`contractor_marked_done`,`contractor_done_at`,`terms_accepted`,`fully_paid`,`created_at`,`updated_at`,`confirmed_at`,`delivered_at`,`order_client_signed`,`order_client_signed_at`,`order_contractor_signed`,`order_contractor_signed_at`) VALUES
-- T1/2026 — DELIVERED
(50,'ORD-20260110-050',19,21,NULL,'CATALOG','DELIVERED',32000000.00,'12 Lê Duẩn, Q.1, TP.HCM','0901110001','Giao giờ hành chính',NULL,NULL,'Đã giao thành công',60.00,19200000.00,b'1',NULL,NULL,b'1','2026-01-20 10:00:00.000000',b'1',b'1','2026-01-10 09:00:00.000000','2026-01-22 14:00:00.000000','2026-01-11 09:00:00.000000','2026-01-22 14:00:00.000000',NULL,NULL,NULL,NULL),
(51,'ORD-20260118-051',20,21,NULL,'CATALOG','DELIVERED',48000000.00,'56 Trần Hưng Đạo, Hà Nội','0901110002','Gọi trước khi giao',NULL,NULL,'Giao thành công',60.00,28800000.00,b'1',NULL,NULL,b'1','2026-01-25 10:00:00.000000',b'1',b'1','2026-01-18 10:00:00.000000','2026-01-27 15:00:00.000000','2026-01-19 09:00:00.000000','2026-01-27 15:00:00.000000',NULL,NULL,NULL,NULL),
-- T2/2026 — DELIVERED
(52,'ORD-20260205-052',22,24,NULL,'CUSTOM','DELIVERED',27500000.00,'88 Bạch Đằng, Đà Nẵng','0901220001','Sofa màu xám tro',NULL,NULL,'Hoàn thành',60.00,16500000.00,b'1',NULL,NULL,b'1','2026-02-18 10:00:00.000000',b'1',b'1','2026-02-05 09:00:00.000000','2026-02-20 14:00:00.000000','2026-02-06 09:00:00.000000','2026-02-20 14:00:00.000000',NULL,NULL,NULL,NULL),
(53,'ORD-20260215-053',23,24,NULL,'CATALOG','DELIVERED',65000000.00,'14 Lý Tự Trọng, Cần Thơ','0901220002','Giao cuối tuần',NULL,NULL,'Khách hài lòng',60.00,39000000.00,b'1',NULL,NULL,b'1','2026-02-28 10:00:00.000000',b'1',b'1','2026-02-15 11:00:00.000000','2026-03-01 15:00:00.000000','2026-02-16 09:00:00.000000','2026-03-01 15:00:00.000000',NULL,NULL,NULL,NULL),
-- T3/2026 — DELIVERED + PROCESSING
(54,'ORD-20260308-054',25,27,NULL,'CUSTOM','DELIVERED',42000000.00,'3 Hoàng Diệu, Q.4, TP.HCM','0901330001','Kệ TV màu walnut',NULL,NULL,'Hoàn thành tốt',60.00,25200000.00,b'1',NULL,NULL,b'1','2026-03-22 10:00:00.000000',b'1',b'1','2026-03-08 10:00:00.000000','2026-03-24 14:00:00.000000','2026-03-09 09:00:00.000000','2026-03-24 14:00:00.000000',NULL,NULL,NULL,NULL),
(55,'ORD-20260318-055',26,27,NULL,'CATALOG','PROCESSING',38000000.00,'22 Nguyễn Văn Cừ, Long An','0901330002','Bàn làm việc màu trắng',NULL,NULL,NULL,60.00,NULL,b'0',NULL,NULL,b'0',NULL,b'0',b'0','2026-03-18 09:00:00.000000','2026-03-20 09:00:00.000000','2026-03-20 09:00:00.000000',NULL,NULL,NULL,NULL,NULL),
-- T4/2026 — DELIVERED + PROCESSING
(56,'ORD-20260406-056',28,31,NULL,'CUSTOM','DELIVERED',88000000.00,'66 Nguyễn Huệ, Q.1, TP.HCM','0901440001','Walk-in closet màu trắng tinh',NULL,NULL,'Khách rất hài lòng',60.00,52800000.00,b'1',NULL,NULL,b'1','2026-04-25 10:00:00.000000',b'1',b'1','2026-04-06 10:00:00.000000','2026-04-28 14:00:00.000000','2026-04-07 09:00:00.000000','2026-04-28 14:00:00.000000',NULL,NULL,NULL,NULL),
(57,'ORD-20260412-057',29,31,NULL,'CATALOG','DELIVERED',55000000.00,'15 Nguyễn Thị Minh Khai, Hà Nội','0901440002','Bàn ăn gỗ tự nhiên',NULL,NULL,'Giao đúng hẹn',60.00,33000000.00,b'1',NULL,NULL,b'1','2026-04-28 10:00:00.000000',b'1',b'1','2026-04-12 11:00:00.000000','2026-04-30 14:00:00.000000','2026-04-13 09:00:00.000000','2026-04-30 14:00:00.000000',NULL,NULL,NULL,NULL),
(58,'ORD-20260420-058',30,31,NULL,'CUSTOM','DELIVERED',32000000.00,'27 Trần Phú, Đà Lạt','0901440003','Màu pastel cho trẻ em',NULL,NULL,'Giao thành công',60.00,19200000.00,b'1',NULL,NULL,b'1','2026-05-05 10:00:00.000000',b'1',b'1','2026-04-20 09:00:00.000000','2026-05-07 14:00:00.000000','2026-04-21 09:00:00.000000','2026-05-07 14:00:00.000000',NULL,NULL,NULL,NULL),
-- T5/2026 — DELIVERED + PROCESSING + PENDING
(59,'ORD-20260508-059',32,37,NULL,'CATALOG','DELIVERED',95000000.00,'9 Võ Văn Tần, Q.3, TP.HCM','0901550001','Phòng bếp màu trắng xám',NULL,NULL,'Hoàn thành xuất sắc',60.00,57000000.00,b'1',NULL,NULL,b'1','2026-05-28 10:00:00.000000',b'1',b'1','2026-05-08 10:00:00.000000','2026-05-30 14:00:00.000000','2026-05-09 09:00:00.000000','2026-05-30 14:00:00.000000',NULL,NULL,NULL,NULL),
(60,'ORD-20260514-060',33,37,NULL,'CUSTOM','PROCESSING',22000000.00,'34 CMT8, Tân Bình, TP.HCM','0901550002','Kệ sách màu gỗ tự nhiên',NULL,NULL,NULL,60.00,NULL,b'0',NULL,NULL,b'0',NULL,b'0',b'0','2026-05-14 09:00:00.000000','2026-05-16 09:00:00.000000','2026-05-16 09:00:00.000000',NULL,NULL,NULL,NULL,NULL),
(61,'ORD-20260522-061',34,NULL,NULL,'CATALOG','PENDING',18000000.00,'11 Trường Sa, Q.Bình Thạnh','0901550003','Tủ giày trắng bóng',NULL,NULL,NULL,60.00,NULL,b'0',NULL,NULL,b'0',NULL,b'0',b'0','2026-05-22 11:00:00.000000','2026-05-22 11:00:00.000000',NULL,NULL,NULL,NULL,NULL,NULL),
-- T6/2026 — PROCESSING + PENDING
(62,'ORD-20260603-062',35,37,NULL,'CUSTOM','PROCESSING',112000000.00,'48 Lê Thị Riêng, Q.1','0901660001','Sofa da bò thật màu caramel',NULL,NULL,NULL,60.00,NULL,b'0',NULL,NULL,b'0',NULL,b'0',b'0','2026-06-03 10:00:00.000000','2026-06-05 09:00:00.000000','2026-06-05 09:00:00.000000',NULL,NULL,NULL,NULL,NULL),
(63,'ORD-20260606-063',36,NULL,NULL,'CATALOG','PENDING',25000000.00,'5 Sư Vạn Hạnh, Q.10','0901660002','Tủ quần áo màu trắng bóng',NULL,NULL,NULL,60.00,NULL,b'0',NULL,NULL,b'0',NULL,b'0',b'0','2026-06-06 09:00:00.000000','2026-06-06 09:00:00.000000',NULL,NULL,NULL,NULL,NULL,NULL);

-- ============================================================
-- 6. CONTRACTS — hợp đồng từ orders mới, có COMPLETED trải đều
--    contractor_id dùng: 21 (T1), 24 (T2), 27 (T3), 31 (T4), 37 (T5-6)
-- ============================================================
INSERT INTO `contracts` (`id`,`admin_note`,`agreed_price`,`approved_at`,`contract_number`,`created_at`,`estimated_days`,`status`,`terms`,`updated_at`,`admin_id`,`bid_id`,`client_id`,`contractor_id`,`project_id`,`cancel_reason`,`cancelled_at`,`cancelled_by`,`client_signed`,`client_signed_at`,`contractor_deposit_amount`,`contractor_deposit_locked`,`contractor_deposit_percent`,`contractor_reputation_score`,`contractor_signed`,`contractor_signed_at`,`customer_deposit_amount`,`customer_deposit_locked`,`customer_deposit_percent`,`original_agreed_price`,`client_confirmed_completion`,`completed_at`,`completion_note`,`contractor_completion_at`,`contractor_completion_requested`,`order_id`,`warranty_end_date`,`warranty_hold_amount`,`warranty_hold_locked`,`warranty_released`,`is_disputed`) VALUES
-- T1 — COMPLETED
(20,'',32000000,'2026-01-11 10:00:00.000000','CTR-ORD-T1-050','2026-01-11 09:00:00.000000',20,'COMPLETED','Hợp đồng thi công nội thất tháng 1','2026-01-22 14:00:00.000000',1,NULL,19,21,100,NULL,NULL,NULL,b'1','2026-01-11 10:00:00.000000',1600000,b'0',5,100,b'1','2026-01-11 10:30:00.000000',0,b'0',100,32000000,b'1','2026-01-22 14:00:00.000000',NULL,NULL,NULL,50,'2026-07-22 14:00:00.000000',1600000,b'0',b'1',b'0'),
(21,'',48000000,'2026-01-19 09:00:00.000000','CTR-ORD-T1-051','2026-01-19 08:30:00.000000',18,'COMPLETED','Hợp đồng tủ bếp tháng 1','2026-01-27 15:00:00.000000',1,NULL,20,21,101,NULL,NULL,NULL,b'1','2026-01-19 09:00:00.000000',2400000,b'0',5,100,b'1','2026-01-19 09:30:00.000000',0,b'0',100,48000000,b'1','2026-01-27 15:00:00.000000',NULL,NULL,NULL,51,'2026-07-27 15:00:00.000000',2400000,b'0',b'1',b'0'),
-- T2 — COMPLETED
(22,'',27500000,'2026-02-06 09:00:00.000000','CTR-ORD-T2-052','2026-02-06 08:30:00.000000',15,'COMPLETED','Hợp đồng sofa tháng 2','2026-02-20 14:00:00.000000',1,NULL,22,24,102,NULL,NULL,NULL,b'1','2026-02-06 09:00:00.000000',1375000,b'0',5,100,b'1','2026-02-06 09:30:00.000000',0,b'0',100,27500000,b'1','2026-02-20 14:00:00.000000',NULL,NULL,NULL,52,'2026-08-20 14:00:00.000000',1375000,b'0',b'1',b'0'),
(23,'',65000000,'2026-02-16 09:00:00.000000','CTR-ORD-T2-053','2026-02-16 08:30:00.000000',16,'COMPLETED','Hợp đồng giường ngủ tháng 2','2026-03-01 15:00:00.000000',1,NULL,23,24,103,NULL,NULL,NULL,b'1','2026-02-16 09:00:00.000000',3250000,b'0',5,100,b'1','2026-02-16 09:30:00.000000',0,b'0',100,65000000,b'1','2026-03-01 15:00:00.000000',NULL,NULL,NULL,53,'2026-09-01 15:00:00.000000',3250000,b'0',b'1',b'0'),
-- T3 — COMPLETED + ACTIVE
(24,'',42000000,'2026-03-09 09:00:00.000000','CTR-ORD-T3-054','2026-03-09 08:30:00.000000',14,'COMPLETED','Hợp đồng kệ TV tháng 3','2026-03-24 14:00:00.000000',1,NULL,25,27,104,NULL,NULL,NULL,b'1','2026-03-09 09:00:00.000000',2100000,b'0',5,100,b'1','2026-03-09 09:30:00.000000',0,b'0',100,42000000,b'1','2026-03-24 14:00:00.000000',NULL,NULL,NULL,54,'2026-09-24 14:00:00.000000',2100000,b'0',b'1',b'0'),
(25,'',38000000,'2026-03-20 09:00:00.000000','CTR-ORD-T3-055','2026-03-20 08:30:00.000000',30,'ACTIVE','Hợp đồng bàn làm việc tháng 3','2026-03-21 09:00:00.000000',1,NULL,26,27,105,NULL,NULL,NULL,b'1','2026-03-20 09:00:00.000000',1900000,b'1',5,100,b'1','2026-03-20 09:30:00.000000',0,b'0',100,38000000,b'0',NULL,NULL,NULL,NULL,55,NULL,NULL,b'0',b'0',b'0'),
-- T4 — COMPLETED
(26,'',88000000,'2026-04-07 09:00:00.000000','CTR-ORD-T4-056','2026-04-07 08:30:00.000000',22,'COMPLETED','Hợp đồng walk-in closet tháng 4','2026-04-28 14:00:00.000000',1,NULL,28,31,106,NULL,NULL,NULL,b'1','2026-04-07 09:00:00.000000',4400000,b'0',5,100,b'1','2026-04-07 09:30:00.000000',0,b'0',100,88000000,b'1','2026-04-28 14:00:00.000000',NULL,NULL,NULL,56,'2026-10-28 14:00:00.000000',4400000,b'0',b'1',b'0'),
(27,'',55000000,'2026-04-13 09:00:00.000000','CTR-ORD-T4-057','2026-04-13 08:30:00.000000',18,'COMPLETED','Hợp đồng bàn ăn tháng 4','2026-04-30 14:00:00.000000',1,NULL,29,31,107,NULL,NULL,NULL,b'1','2026-04-13 09:00:00.000000',2750000,b'0',5,100,b'1','2026-04-13 09:30:00.000000',0,b'0',100,55000000,b'1','2026-04-30 14:00:00.000000',NULL,NULL,NULL,57,'2026-10-30 14:00:00.000000',2750000,b'0',b'1',b'0'),
(28,'',32000000,'2026-04-21 09:00:00.000000','CTR-ORD-T4-058','2026-04-21 08:30:00.000000',17,'COMPLETED','Hợp đồng nội thất trẻ em tháng 4','2026-05-07 14:00:00.000000',1,NULL,30,31,108,NULL,NULL,NULL,b'1','2026-04-21 09:00:00.000000',1600000,b'0',5,100,b'1','2026-04-21 09:30:00.000000',0,b'0',100,32000000,b'1','2026-05-07 14:00:00.000000',NULL,NULL,NULL,58,'2026-11-07 14:00:00.000000',1600000,b'0',b'1',b'0'),
-- T5 — COMPLETED + ACTIVE
(29,'',95000000,'2026-05-09 09:00:00.000000','CTR-ORD-T5-059','2026-05-09 08:30:00.000000',20,'COMPLETED','Hợp đồng phòng bếp tháng 5','2026-05-30 14:00:00.000000',1,NULL,32,37,109,NULL,NULL,NULL,b'1','2026-05-09 09:00:00.000000',4750000,b'0',5,100,b'1','2026-05-09 09:30:00.000000',0,b'0',100,95000000,b'1','2026-05-30 14:00:00.000000',NULL,NULL,NULL,59,'2026-11-30 14:00:00.000000',4750000,b'0',b'1',b'0'),
(30,'',22000000,'2026-05-16 09:00:00.000000','CTR-ORD-T5-060','2026-05-16 08:30:00.000000',25,'ACTIVE','Hợp đồng kệ sách tháng 5','2026-05-17 09:00:00.000000',1,NULL,33,37,110,NULL,NULL,NULL,b'1','2026-05-16 09:00:00.000000',1100000,b'1',5,100,b'1','2026-05-16 09:30:00.000000',0,b'0',100,22000000,b'0',NULL,NULL,NULL,NULL,60,NULL,NULL,b'0',b'0',b'0'),
-- T6 — ACTIVE
(31,'',112000000,'2026-06-05 09:00:00.000000','CTR-ORD-T6-062','2026-06-05 08:30:00.000000',30,'ACTIVE','Hợp đồng sofa sang trọng tháng 6','2026-06-06 09:00:00.000000',1,NULL,35,37,112,NULL,NULL,NULL,b'1','2026-06-05 09:00:00.000000',5600000,b'1',5,100,b'1','2026-06-05 09:30:00.000000',0,b'0',100,112000000,b'0',NULL,NULL,NULL,NULL,62,NULL,NULL,b'0',b'0',b'0');

-- ============================================================
-- 7. REVIEWS — đánh giá cho contractors mới
--    reviewee_id = contractor, reviewer_id = customer
-- ============================================================
INSERT INTO `reviews` (`id`,`reviewer_id`,`reviewee_id`,`reference_type`,`reference_id`,`rating`,`comment`,`created_at`,`communication_score`,`progress_score`,`quality_score`) VALUES
(10,19,21,'ORDER',50,5,'Nhà thầu rất chuyên nghiệp, giao đúng hẹn','2026-01-23 10:00:00.000000',5,5,5),
(11,20,21,'ORDER',51,4,'Chất lượng tốt, thi công sạch sẽ','2026-01-28 10:00:00.000000',4,4,5),
(12,22,24,'ORDER',52,5,'Sofa rất đẹp, khớp với yêu cầu 100%','2026-02-21 10:00:00.000000',5,5,5),
(13,23,24,'ORDER',53,4,'Giao đúng hẹn, chất lượng tốt','2026-03-02 10:00:00.000000',4,5,4),
(14,25,27,'ORDER',54,5,'Kệ TV hoàn hảo, thợ thi công cẩn thận','2026-03-25 10:00:00.000000',5,5,5),
(15,28,31,'ORDER',56,5,'Walk-in closet đẹp hơn tưởng tượng','2026-04-29 10:00:00.000000',5,5,5),
(16,29,31,'ORDER',57,4,'Bàn ăn chắc chắn, gỗ đẹp','2026-05-01 10:00:00.000000',4,4,5),
(17,30,31,'ORDER',58,5,'Con tôi thích lắm, màu sắc đúng yêu cầu','2026-05-08 10:00:00.000000',5,5,5),
(18,32,37,'ORDER',59,5,'Phòng bếp hoàn hảo, thợ rất kỹ lưỡng','2026-05-31 10:00:00.000000',5,5,5);

-- ============================================================
-- 8. DISPUTES — tranh chấp rải đều các tháng để chart đường hoạt động
-- ============================================================
INSERT INTO `disputes` (`id`,`amount`,`created_at`,`reason`,`refund_amount`,`resolution`,`resolution_type`,`status`,`updated_at`,`contractor_id`,`customer_id`,`project_id`,`chat_room_id`,`contract_id`) VALUES
(10,5000000,'2026-02-22 10:00:00.000000','Chất lượng vật liệu không đúng với báo giá',4000000,'Đã hoàn tiền một phần cho khách','refund_customer','RESOLVED','2026-02-25 14:00:00.000000',24,22,102,NULL,22),
(11,8000000,'2026-03-26 10:00:00.000000','Chậm tiến độ so với hợp đồng',NULL,NULL,NULL,'PENDING','2026-03-26 10:00:00.000000',27,25,104,NULL,24),
(12,3000000,'2026-04-15 10:00:00.000000','Màu sơn không đúng với yêu cầu ban đầu',2500000,'Đồng ý sơn lại miễn phí','redo_work','RESOLVED','2026-04-20 14:00:00.000000',31,29,107,NULL,27),
(13,12000000,'2026-05-10 10:00:00.000000','Phát sinh chi phí ngoài hợp đồng',NULL,NULL,NULL,'PENDING','2026-05-10 10:00:00.000000',37,32,109,NULL,29),
(14,6000000,'2026-06-07 10:00:00.000000','Chậm giao hàng hơn 1 tuần',NULL,NULL,NULL,'PENDING','2026-06-07 10:00:00.000000',37,35,112,NULL,31);

-- ============================================================
-- 9. PLATFORM_WALLET — cập nhật balance cộng thêm hoa hồng
--    Các hợp đồng COMPLETED mới: tổng agreedPrice = 32M+48M+27.5M+65M+42M+88M+55M+32M+95M = 484.5M
--    Hoa hồng 5% = 24.225M + số cũ 122.222 = ~24.347.222
-- ============================================================
UPDATE `platform_wallets` SET `balance` = 24347222, `updated_at` = '2026-06-30 12:00:00.000000' WHERE `id` = 1;

-- ============================================================
-- 10. RE-ENABLE FK và hoàn tất
-- ============================================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- TỔNG KẾT — sau khi import, các biểu đồ sẽ hiển thị:
-- ✅ Người dùng mới/tháng: T1=3, T2=3, T3=3, T4=4, T5=3, T6=4
-- ✅ Đơn hàng/tháng: T1=2, T2=2, T3=2, T4=3, T5=3, T6=2 (cộng thêm data cũ)
-- ✅ Hoa hồng/tháng: có completedAt trải đều T1-T5
-- ✅ Tranh chấp/tháng: T2=1, T3=1, T4=1, T5=1, T6=1
-- ✅ Top nhà thầu doanh thu: uid 21 (80M), uid 24 (92.5M), uid 31 (175M), uid 37 (117M)
-- ✅ Top nhà thầu đánh giá: uid 37 avg=5.0, uid 31 avg=4.67, uid 27 avg=5.0
-- ✅ Escrow thực: tổng wallets ~2.44 tỷ VND
-- ✅ Top khách hàng: uid 35 (112M), uid 28 (88M), uid 32 (95M)
-- ============================================================
