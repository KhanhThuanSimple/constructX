-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 12, 2026 at 12:53 PM
-- Server version: 11.6.2-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `constructx_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `bids`
--

CREATE TABLE `bids` (
  `id` bigint(20) NOT NULL,
  `project_id` bigint(20) NOT NULL,
  `contractor_id` bigint(20) NOT NULL,
  `total_price` bigint(20) NOT NULL,
  `estimated_days` int(11) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `design_image` varchar(500) DEFAULT NULL,
  `warranty_months` int(11) DEFAULT 0,
  `payment_terms` text DEFAULT NULL,
  `status` enum('PENDING','ACCEPTED','REJECTED','CANCELLED','WITHDRAWN') DEFAULT 'PENDING',
  `submitted_at` datetime(6) DEFAULT current_timestamp(6),
  `reviewed_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT current_timestamp(6),
  `updated_at` datetime(6) DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bids`
--

INSERT INTO `bids` (`id`, `project_id`, `contractor_id`, `total_price`, `estimated_days`, `message`, `design_image`, `warranty_months`, `payment_terms`, `status`, `submitted_at`, `reviewed_at`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 22000000, 20, 'Thi công tủ bếp MDF chống ẩm, phụ kiện Blum', NULL, 0, NULL, 'PENDING', '2026-06-11 10:59:43.139188', NULL, '2026-06-11 10:59:43.139188', '2026-06-11 10:59:43.139188'),
(2, 1, 3, 24000000, 18, 'Tủ bếp MDF cao cấp, bảo hành 2 năm', NULL, 0, NULL, 'PENDING', '2026-06-11 10:59:43.139188', NULL, '2026-06-11 10:59:43.139188', '2026-06-11 10:59:43.139188'),
(3, 2, 2, 16000000, 15, 'Sofa góc L bọc nỉ cao cấp, khung gỗ sồi', NULL, 0, NULL, 'PENDING', '2026-06-11 10:59:43.139188', NULL, '2026-06-11 10:59:43.139188', '2026-06-11 10:59:43.139188'),
(4, 1, 10, 49999, 20, 'adawda', '', 0, NULL, 'PENDING', '2026-06-11 15:10:34.088309', NULL, '2026-06-11 15:10:34.088309', '2026-06-11 22:10:34.104848'),
(5, 4, 15, 10, 12, 'adawd', '', 0, NULL, 'WITHDRAWN', '2026-06-11 15:34:59.139200', NULL, '2026-06-11 15:34:59.139200', '2026-06-11 22:41:41.902973'),
(6, 5, 15, 12000000, 20, 'Hoàn thiện đúng yêu cầu ', '', 0, NULL, 'ACCEPTED', '2026-06-12 06:38:39.248425', NULL, '2026-06-12 06:38:39.248425', '2026-06-12 13:38:50.971598');

-- --------------------------------------------------------

--
-- Table structure for table `bid_details`
--

CREATE TABLE `bid_details` (
  `id` bigint(20) NOT NULL,
  `description` text DEFAULT NULL,
  `item_name` varchar(255) DEFAULT NULL,
  `quantity` double DEFAULT NULL,
  `sample_image` varchar(255) DEFAULT NULL,
  `total_price` bigint(20) DEFAULT NULL,
  `unit` varchar(255) DEFAULT NULL,
  `unit_price` bigint(20) DEFAULT NULL,
  `bid_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bid_details`
--

INSERT INTO `bid_details` (`id`, `description`, `item_name`, `quantity`, `sample_image`, `total_price`, `unit`, `unit_price`, `bid_id`) VALUES
(1, 'aa', 'thaun', 1, '', 49999, 'khong gina la ', 49999, 4),
(2, '12', 'adawdwd', 1, '', 10, 'khanh thuan ', 10, 5),
(3, 'Sản phẩm gỗ xoài xuất xư nam phi ', 'Bàn ăn cơm ', 1, '', 12000000, 'Khanh Thuan', 12000000, 6);

-- --------------------------------------------------------

--
-- Table structure for table `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` bigint(20) NOT NULL,
  `room_id` bigint(20) NOT NULL,
  `sender_id` bigint(20) DEFAULT NULL,
  `message_type` enum('TEXT','IMAGE','FILE','SYSTEM') NOT NULL,
  `content` text DEFAULT NULL,
  `file_url` varchar(500) DEFAULT NULL,
  `is_pinned` bit(1) DEFAULT b'0',
  `created_at` datetime(6) DEFAULT current_timestamp(6),
  `file_name` varchar(255) DEFAULT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `metadata` text DEFAULT NULL,
  `pinned_at` datetime(6) DEFAULT NULL,
  `pinned_by` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chat_messages`
--

INSERT INTO `chat_messages` (`id`, `room_id`, `sender_id`, `message_type`, `content`, `file_url`, `is_pinned`, `created_at`, `file_name`, `file_size`, `metadata`, `pinned_at`, `pinned_by`) VALUES
(1, 1, 4, 'TEXT', 'Cho tôi hỏi đơn hàng của tôi đã giao chưa?', NULL, b'0', '2026-06-03 14:00:00.000000', NULL, NULL, NULL, NULL, NULL),
(2, 1, 1, 'TEXT', 'Dạ đơn hàng đã được giao ngày 02/06, quý khách vui lòng kiểm tra ạ', NULL, b'0', '2026-06-03 14:05:00.000000', NULL, NULL, NULL, NULL, NULL),
(3, 1, 4, 'TEXT', 'Cảm ơn bạn, tôi đã nhận được hàng rồi!', NULL, b'0', '2026-06-03 14:10:00.000000', NULL, NULL, NULL, NULL, NULL),
(4, 2, 5, 'TEXT', 'Tôi muốn hỏi về tiến độ báo giá', NULL, b'0', '2026-06-10 11:00:00.000000', NULL, NULL, NULL, NULL, NULL),
(5, 2, 1, 'TEXT', 'Dạ hiện tại đã có 2 nhà thầu báo giá, hệ thống đang xử lý ạ', NULL, b'0', '2026-06-10 11:05:00.000000', NULL, NULL, NULL, NULL, NULL),
(6, 3, 14, 'TEXT', 'Bảo hành bao lâu?', NULL, b'0', '2026-06-11 06:55:54.317855', NULL, NULL, NULL, NULL, NULL),
(7, 3, 1, 'TEXT', 'Vấn đề đã được ghi nhận và chuyển xử lý.', NULL, b'0', '2026-06-11 06:55:59.955418', NULL, NULL, NULL, NULL, NULL),
(8, 3, 1, 'TEXT', 'Vui lòng cung cấp thêm thông tin chi tiết.', NULL, b'0', '2026-06-11 06:56:00.677000', NULL, NULL, NULL, NULL, NULL),
(9, 3, 1, 'TEXT', 'Vui lòng cung cấp thêm thông tin chi tiết.', NULL, b'0', '2026-06-12 07:57:35.086584', NULL, NULL, NULL, NULL, NULL),
(10, 3, 1, 'TEXT', 'Vui lòng cung cấp thêm thông tin chi tiết.', NULL, b'0', '2026-06-12 07:57:35.240895', NULL, NULL, NULL, NULL, NULL),
(11, 3, 1, 'TEXT', 'Vui lòng cung cấp thêm thông tin chi tiết.', NULL, b'0', '2026-06-12 07:57:35.393364', NULL, NULL, NULL, NULL, NULL),
(12, 3, 1, 'TEXT', 'Vui lòng cung cấp thêm thông tin chi tiết.', NULL, b'0', '2026-06-12 07:57:35.550733', NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `chat_rooms`
--

CREATE TABLE `chat_rooms` (
  `id` bigint(20) NOT NULL,
  `room_type` enum('DIRECT','SUPPORT','DISPUTE','GROUP') NOT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` bigint(20) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `is_archived` bit(1) DEFAULT b'0',
  `created_at` datetime(6) DEFAULT current_timestamp(6),
  `updated_at` datetime(6) DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chat_rooms`
--

INSERT INTO `chat_rooms` (`id`, `room_type`, `reference_type`, `reference_id`, `title`, `is_archived`, `created_at`, `updated_at`) VALUES
(1, 'SUPPORT', NULL, NULL, 'Hỗ trợ khách hàng - Đơn hàng ORD-20260601-001', b'0', '2026-06-01 09:00:00.000000', '2026-06-11 10:59:43.148412'),
(2, 'SUPPORT', NULL, NULL, 'Hỗ trợ đơn hàng ORD-20260610-003', b'0', '2026-06-10 10:30:00.000000', '2026-06-11 10:59:43.148412'),
(3, 'SUPPORT', NULL, NULL, 'Hỗ trợ: a', b'0', '2026-06-11 06:55:52.954588', '2026-06-12 07:57:35.552718');

-- --------------------------------------------------------

--
-- Table structure for table `chat_room_members`
--

CREATE TABLE `chat_room_members` (
  `id` bigint(20) NOT NULL,
  `joined_at` datetime(6) DEFAULT NULL,
  `last_read_at` datetime(6) DEFAULT NULL,
  `last_read_message_id` bigint(20) DEFAULT NULL,
  `role_in_room` enum('CUSTOMER','CONTRACTOR','ADMIN','SUPPORT_BOT') NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `room_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chat_room_members`
--

INSERT INTO `chat_room_members` (`id`, `joined_at`, `last_read_at`, `last_read_message_id`, `role_in_room`, `user_id`, `room_id`) VALUES
(1, '2026-06-11 06:55:52.965851', '2026-06-11 15:54:00.616153', 6, 'CUSTOMER', 14, 3),
(2, '2026-06-11 06:55:52.968408', '2026-06-12 07:57:35.571705', 12, 'ADMIN', 1, 3);

-- --------------------------------------------------------

--
-- Table structure for table `construction_logs`
--

CREATE TABLE `construction_logs` (
  `id` bigint(20) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text NOT NULL,
  `image_urls` text DEFAULT NULL,
  `phase_label` varchar(100) DEFAULT NULL,
  `progress_percent` int(11) NOT NULL,
  `contract_id` bigint(20) NOT NULL,
  `contractor_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `construction_logs`
--

INSERT INTO `construction_logs` (`id`, `created_at`, `description`, `image_urls`, `phase_label`, `progress_percent`, `contract_id`, `contractor_id`) VALUES
(1, '2026-06-12 07:19:50.984391', 'Đã mua vật liệu ', '[]', 'Khởi công', 20, 1, 15),
(2, '2026-06-12 07:25:19.326412', 'đã hoàn thiện ', '[]', 'Thi công phần thô', 30, 1, 15),
(3, '2026-06-12 07:59:22.939721', 'a', '[]', 'Bàn giao công trình', 100, 1, 15),
(4, '2026-06-12 08:45:48.264158', 'ad', '[]', NULL, 100, 1, 15);

-- --------------------------------------------------------

--
-- Table structure for table `contractor_profiles`
--

CREATE TABLE `contractor_profiles` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `tax_code` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `rating_average` decimal(3,2) DEFAULT 0.00,
  `total_reviews` int(11) DEFAULT 0,
  `completed_projects` int(11) DEFAULT 0,
  `created_at` datetime(6) DEFAULT current_timestamp(6),
  `updated_at` datetime(6) DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contractor_profiles`
--

INSERT INTO `contractor_profiles` (`id`, `user_id`, `company_name`, `tax_code`, `description`, `rating_average`, `total_reviews`, `completed_projects`, `created_at`, `updated_at`) VALUES
(1, 2, 'Xưởng Mộc ABC', NULL, 'Chuyên thi công nội thất gỗ tự nhiên và gỗ công nghiệp', 4.80, 0, 45, '2026-06-11 10:59:43.197801', '2026-06-11 10:59:43.197801'),
(2, 3, 'Nội Thất Đức Duy', NULL, '10 năm kinh nghiệm trong lĩnh vực nội thất cao cấp', 4.90, 0, 67, '2026-06-11 10:59:43.197801', '2026-06-11 10:59:43.197801');

-- --------------------------------------------------------

--
-- Table structure for table `contracts`
--

CREATE TABLE `contracts` (
  `id` bigint(20) NOT NULL,
  `admin_note` text DEFAULT NULL,
  `agreed_price` bigint(20) DEFAULT NULL,
  `approved_at` datetime(6) DEFAULT NULL,
  `contract_number` varchar(40) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `estimated_days` int(11) DEFAULT NULL,
  `status` enum('PENDING_REVIEW','WAITING_SIGNATURE','ACTIVE','COMPLETED','CANCELLED') DEFAULT NULL,
  `terms` text DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `admin_id` bigint(20) DEFAULT NULL,
  `bid_id` bigint(20) NOT NULL,
  `client_id` bigint(20) NOT NULL,
  `contractor_id` bigint(20) NOT NULL,
  `project_id` bigint(20) NOT NULL,
  `cancel_reason` text DEFAULT NULL,
  `cancelled_at` datetime(6) DEFAULT NULL,
  `cancelled_by` enum('CLIENT','CONTRACTOR') DEFAULT NULL,
  `client_signed` bit(1) DEFAULT NULL,
  `client_signed_at` datetime(6) DEFAULT NULL,
  `contractor_deposit_amount` bigint(20) DEFAULT NULL,
  `contractor_deposit_locked` bit(1) DEFAULT NULL,
  `contractor_deposit_percent` double DEFAULT NULL,
  `contractor_reputation_score` int(11) DEFAULT NULL,
  `contractor_signed` bit(1) DEFAULT NULL,
  `contractor_signed_at` datetime(6) DEFAULT NULL,
  `customer_deposit_amount` bigint(20) DEFAULT NULL,
  `customer_deposit_locked` bit(1) DEFAULT NULL,
  `customer_deposit_percent` double DEFAULT NULL,
  `original_agreed_price` bigint(20) DEFAULT NULL,
  `client_confirmed_completion` bit(1) DEFAULT NULL,
  `completed_at` datetime(6) DEFAULT NULL,
  `completion_note` text DEFAULT NULL,
  `contractor_completion_at` datetime(6) DEFAULT NULL,
  `contractor_completion_requested` bit(1) DEFAULT NULL,
  `order_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contracts`
--

INSERT INTO `contracts` (`id`, `admin_note`, `agreed_price`, `approved_at`, `contract_number`, `created_at`, `estimated_days`, `status`, `terms`, `updated_at`, `admin_id`, `bid_id`, `client_id`, `contractor_id`, `project_id`, `cancel_reason`, `cancelled_at`, `cancelled_by`, `client_signed`, `client_signed_at`, `contractor_deposit_amount`, `contractor_deposit_locked`, `contractor_deposit_percent`, `contractor_reputation_score`, `contractor_signed`, `contractor_signed_at`, `customer_deposit_amount`, `customer_deposit_locked`, `customer_deposit_percent`, `original_agreed_price`, `client_confirmed_completion`, `completed_at`, `completion_note`, `contractor_completion_at`, `contractor_completion_requested`, `order_id`) VALUES
(1, '', 12000000, '2026-06-12 06:39:31.616011', 'CTR-20260612133850-6', '2026-06-12 06:38:50.983580', 20, 'ACTIVE', 'HOP DONG THI CONG\nDu an: Bàn ăn Cơm\nGia tri: 12.000.000 VND\nThoi gian thi cong: 20 ngay\nPham vi cong viec: --- SẢN PHẨM MẪU YÊU CẦU ---\n• Sofa da thật nhập khẩu Ý (x1)\n• Đèn thả trần mây đan (x1)\n\n--- YÊU CẦU RIÊNG ---\nSòa\nDieu kien thanh toan: Theo thoa thuan\n', '2026-06-12 06:42:36.158476', 1, 6, 14, 15, 5, NULL, NULL, NULL, b'1', '2026-06-12 06:42:16.841806', 600000, b'1', 5, 100, b'1', '2026-06-12 06:42:36.137340', 1200000, b'1', 10, 12000000, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `contract_jobs`
--

CREATE TABLE `contract_jobs` (
  `id` bigint(20) NOT NULL,
  `project_id` bigint(20) NOT NULL,
  `bid_id` bigint(20) NOT NULL,
  `customer_id` bigint(20) NOT NULL,
  `contractor_id` bigint(20) NOT NULL,
  `agreed_price` bigint(20) NOT NULL,
  `status` enum('PENDING','ACCEPTED','IN_PROGRESS','COMPLETED','CANCELLED','DISPUTED') DEFAULT 'PENDING',
  `started_at` datetime(6) DEFAULT NULL,
  `completed_at` datetime(6) DEFAULT NULL,
  `cancelled_at` datetime(6) DEFAULT NULL,
  `cancellation_reason` text DEFAULT NULL,
  `customer_rating` int(11) DEFAULT NULL,
  `contractor_rating` int(11) DEFAULT NULL,
  `customer_feedback` text DEFAULT NULL,
  `contractor_feedback` text DEFAULT NULL,
  `created_at` datetime(6) DEFAULT current_timestamp(6),
  `updated_at` datetime(6) DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contract_stages`
--

CREATE TABLE `contract_stages` (
  `id` bigint(20) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `performed_by` varchar(255) DEFAULT NULL,
  `stage` enum('PENDING_REVIEW','WAITING_SIGNATURE','ACTIVE','COMPLETED','CANCELLED') NOT NULL,
  `contract_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contract_stages`
--

INSERT INTO `contract_stages` (`id`, `created_at`, `note`, `performed_by`, `stage`, `contract_id`) VALUES
(1, '2026-06-12 06:38:50.992952', 'Customer chap nhan bao gia. Da lock coc 1.200.000 VND (10%%). Cho Admin duyet.', 'a', 'PENDING_REVIEW', 1),
(2, '2026-06-12 06:39:31.616011', '', 'Admin Hệ Thống', 'WAITING_SIGNATURE', 1),
(3, '2026-06-12 06:42:16.842798', 'Khach hang ky hop dong.', 'a', 'WAITING_SIGNATURE', 1),
(4, '2026-06-12 06:42:36.138403', 'Nha thau ky hop dong. Da lock ky quy 600.000 VND (5%%).', 'a', 'WAITING_SIGNATURE', 1),
(5, '2026-06-12 06:42:36.142299', 'Ca hai ben da ky. Hop dong chinh thuc co hieu luc.', 'SYSTEM', 'ACTIVE', 1),
(6, '2026-06-12 07:58:08.147955', 'Khach hang duyet giai ngan 5.000.000 VND giai doan \'Khởi công\'. Immediate: 2.000.000 VND, Locked: 3.000.000 VND.', 'a', 'ACTIVE', 1),
(7, '2026-06-12 08:00:32.153846', 'Khach hang duyet giai ngan 4.600.000 VND giai doan \'Bàn giao công trình\'. Immediate: 3.220.000 VND, Locked: 1.380.000 VND.', 'a', 'ACTIVE', 1);

-- --------------------------------------------------------

--
-- Table structure for table `disbursement_requests`
--

CREATE TABLE `disbursement_requests` (
  `id` bigint(20) NOT NULL,
  `amount` bigint(20) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `fully_unlocked` bit(1) DEFAULT NULL,
  `immediate_amount` bigint(20) DEFAULT NULL,
  `immediate_ratio` double DEFAULT NULL,
  `locked_amount` bigint(20) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `phase_label` varchar(100) NOT NULL,
  `phase_threshold` int(11) DEFAULT NULL,
  `progress_at_request` int(11) DEFAULT NULL,
  `reject_reason` text DEFAULT NULL,
  `reviewed_at` datetime(6) DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','CANCELLED') DEFAULT NULL,
  `contract_id` bigint(20) NOT NULL,
  `contractor_id` bigint(20) NOT NULL,
  `reviewed_by` bigint(20) DEFAULT NULL,
  `gross_amount` bigint(20) NOT NULL,
  `net_amount` bigint(20) DEFAULT NULL,
  `phase_index` int(11) DEFAULT NULL,
  `platform_fee` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `disbursement_requests`
--

INSERT INTO `disbursement_requests` (`id`, `amount`, `created_at`, `fully_unlocked`, `immediate_amount`, `immediate_ratio`, `locked_amount`, `note`, `phase_label`, `phase_threshold`, `progress_at_request`, `reject_reason`, `reviewed_at`, `status`, `contract_id`, `contractor_id`, `reviewed_by`, `gross_amount`, `net_amount`, `phase_index`, `platform_fee`) VALUES
(1, 9600000, '2026-06-12 07:20:34.207811', b'0', 2400000, 0.25, 7200000, NULL, 'Khởi công', 20, 20, 'Quá nhiều ', '2026-06-12 07:22:36.814363', 'REJECTED', 1, 15, 14, 0, NULL, NULL, NULL),
(2, 5000000, '2026-06-12 07:23:05.430224', b'1', 2000000, 0.4, 0, NULL, 'Khởi công', 20, 20, NULL, '2026-06-12 07:58:08.146072', 'APPROVED', 1, 15, 14, 0, NULL, NULL, NULL),
(3, 4600000, '2026-06-12 08:00:09.041093', b'1', 3220000, 0.7, 0, NULL, 'Bàn giao công trình', 100, 100, NULL, '2026-06-12 08:00:32.153846', 'APPROVED', 1, 15, 14, 0, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `disputes`
--

CREATE TABLE `disputes` (
  `id` bigint(20) NOT NULL,
  `amount` bigint(20) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `refund_amount` bigint(20) DEFAULT NULL,
  `resolution` text DEFAULT NULL,
  `resolution_type` varchar(50) DEFAULT NULL,
  `status` enum('PENDING','RESOLVED') DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `contractor_id` bigint(20) NOT NULL,
  `customer_id` bigint(20) NOT NULL,
  `project_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dispute_messages`
--

CREATE TABLE `dispute_messages` (
  `id` bigint(20) NOT NULL,
  `author` varchar(100) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `dispute_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `escrow_accounts`
--

CREATE TABLE `escrow_accounts` (
  `id` bigint(20) NOT NULL,
  `contract_job_id` bigint(20) NOT NULL,
  `total_amount` bigint(20) NOT NULL,
  `locked_amount` bigint(20) NOT NULL DEFAULT 0,
  `released_amount` bigint(20) NOT NULL DEFAULT 0,
  `refunded_amount` bigint(20) NOT NULL DEFAULT 0,
  `platform_fee` bigint(20) NOT NULL DEFAULT 0,
  `platform_fee_rate` decimal(5,2) DEFAULT 5.00,
  `status` enum('ACTIVE','COMPLETED','DISPUTED','CANCELLED') DEFAULT 'ACTIVE',
  `created_at` datetime(6) DEFAULT current_timestamp(6),
  `completed_at` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `material_categories`
--

CREATE TABLE `material_categories` (
  `id` bigint(20) NOT NULL,
  `name` varchar(120) NOT NULL,
  `description` text DEFAULT NULL,
  `icon_url` varchar(255) DEFAULT NULL,
  `active` bit(1) NOT NULL DEFAULT b'1',
  `sort_order` int(11) DEFAULT 0,
  `created_at` datetime(6) DEFAULT current_timestamp(6),
  `updated_at` datetime(6) DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `material_categories`
--

INSERT INTO `material_categories` (`id`, `name`, `description`, `icon_url`, `active`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'Gỗ tự nhiên', 'Gỗ sồi, gỗ óc chó, gỗ hương...', NULL, b'1', 1, '2026-06-11 10:59:43.188826', '2026-06-11 10:59:43.188826'),
(2, 'Gỗ công nghiệp', 'MDF, MFC, HDF, Melamine...', NULL, b'1', 2, '2026-06-11 10:59:43.188826', '2026-06-11 10:59:43.188826'),
(3, 'Kính cường lực', 'Kính temper, kính hộp...', NULL, b'1', 3, '2026-06-11 10:59:43.188826', '2026-06-11 10:59:43.188826'),
(4, 'Inox 304', 'Inox không gỉ, inox mạ...', NULL, b'1', 4, '2026-06-11 10:59:43.188826', '2026-06-11 10:59:43.188826'),
(5, 'Đá nhân tạo', 'Đá marble, đá granite...', NULL, b'1', 5, '2026-06-11 10:59:43.188826', '2026-06-11 10:59:43.188826');

-- --------------------------------------------------------

--
-- Table structure for table `milestone_updates`
--

CREATE TABLE `milestone_updates` (
  `id` bigint(20) NOT NULL,
  `content` text DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `milestone_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `content` varchar(500) NOT NULL,
  `action_url` varchar(255) DEFAULT NULL,
  `reference_id` bigint(20) DEFAULT NULL,
  `is_read` bit(1) NOT NULL DEFAULT b'0',
  `created_at` datetime(6) DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `content`, `action_url`, `reference_id`, `is_read`, `created_at`) VALUES
(1, 4, 'ORDER_CONFIRMED', NULL, 'Đơn hàng ORD-20260601-001 đã được xác nhận', NULL, NULL, b'0', '2026-06-02 08:00:00.000000'),
(2, 4, 'ORDER_SHIPPED', NULL, 'Đơn hàng ORD-20260601-001 đã được giao', NULL, NULL, b'0', '2026-06-02 15:00:00.000000'),
(3, 5, 'BID_RECEIVED', NULL, 'Có 2 nhà thầu đã gửi báo giá cho đơn hàng của bạn', NULL, NULL, b'0', '2026-06-10 09:00:00.000000'),
(4, 2, 'SYSTEM', NULL, 'Tài khoản nhà thầu của bạn đã được phê duyệt', NULL, NULL, b'0', '2026-06-01 08:00:00.000000'),
(5, 6, 'SYSTEM', NULL, 'Dự án #3 - Bàn ghế ăn 6 chỗ đã được admin duyệt và hiển thị trên sàn.', NULL, NULL, b'0', '2026-06-11 06:47:18.343352'),
(6, 14, 'SYSTEM', NULL, 'Dự án #4 - a đã được admin duyệt và hiển thị trên sàn.', NULL, NULL, b'0', '2026-06-11 06:47:20.544932'),
(7, 1, 'SYSTEM', NULL, 'Nhà thầu mới a (thuan.dokhanh04@gmail.com) đang chờ phê duyệt.', NULL, NULL, b'0', '2026-06-11 06:47:57.607783'),
(8, 15, 'SYSTEM', NULL, 'Tài khoản nhà thầu của bạn đã được quản trị viên phê duyệt. Bạn có thể đăng nhập và nhận dự án.', NULL, NULL, b'0', '2026-06-11 06:48:15.970968'),
(9, 14, 'PAYMENT_SUCCESS', NULL, '✅ Đã khóa tiền đặt cọc 9 triệuđ cho đơn hàng ORD-20260611-7. Nhà thầu sẽ bắt đầu sản xuất ngay!', NULL, NULL, b'0', '2026-06-11 06:52:34.443878'),
(10, 1, 'SYSTEM', NULL, '🛒 Đơn catalog mới từ a — ORD-20260611-7. Cần xác nhận.', NULL, NULL, b'0', '2026-06-11 06:52:34.454545'),
(11, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260611-7 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-11 06:52:34.456557'),
(12, 1, 'SYSTEM', NULL, '📦 Đơn tùy chỉnh mới từ a — ORD-20260611-8. Cần phê duyệt để mở đấu giá.', NULL, NULL, b'0', '2026-06-11 06:52:57.095319'),
(13, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260611-8 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-11 06:52:57.098546'),
(14, 14, 'PAYMENT_SUCCESS', NULL, '✅ Đã khóa tiền đặt cọc 6 triệuđ cho đơn hàng ORD-20260611-9. Nhà thầu sẽ bắt đầu sản xuất ngay!', NULL, NULL, b'0', '2026-06-11 15:01:13.908118'),
(15, 1, 'SYSTEM', NULL, '🛒 Đơn catalog mới từ a — ORD-20260611-9. Cần xác nhận.', NULL, NULL, b'0', '2026-06-11 15:01:13.919870'),
(16, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260611-9 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-11 15:01:13.921633'),
(17, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260611-8 của bạn đã được Admin phê duyệt và đang mở đấu giá. Các nhà thầu sẽ sớm gửi báo giá!', NULL, NULL, b'0', '2026-06-11 15:32:25.899160'),
(18, 2, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260611-8. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-11 15:32:25.929809'),
(19, 3, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260611-8. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-11 15:32:25.931782'),
(20, 10, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260611-8. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-11 15:32:25.933527'),
(21, 11, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260611-8. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-11 15:32:25.936591'),
(22, 12, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260611-8. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-11 15:32:25.938537'),
(23, 15, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260611-8. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-11 15:32:25.940632'),
(24, 6, 'SYSTEM', NULL, '✅ Đơn ORD-20260611-005 đã được Admin xác nhận.', NULL, NULL, b'0', '2026-06-11 15:32:29.573176'),
(25, 6, 'SYSTEM', NULL, '🔨 Đơn ORD-20260611-005 đang được sản xuất/thi công. Ghi chú: a', NULL, NULL, b'0', '2026-06-11 15:32:33.687785'),
(26, 5, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260610-003 của bạn đã được Admin phê duyệt và đang mở đấu giá. Các nhà thầu sẽ sớm gửi báo giá!', NULL, NULL, b'0', '2026-06-11 15:32:39.438246'),
(27, 2, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"Yêu cầu tùy chỉnh\" — ORD-20260610-003. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-11 15:32:39.447478'),
(28, 3, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"Yêu cầu tùy chỉnh\" — ORD-20260610-003. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-11 15:32:39.451482'),
(29, 10, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"Yêu cầu tùy chỉnh\" — ORD-20260610-003. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-11 15:32:39.455127'),
(30, 11, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"Yêu cầu tùy chỉnh\" — ORD-20260610-003. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-11 15:32:39.457479'),
(31, 12, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"Yêu cầu tùy chỉnh\" — ORD-20260610-003. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-11 15:32:39.460467'),
(32, 15, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"Yêu cầu tùy chỉnh\" — ORD-20260610-003. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-11 15:32:39.463345'),
(33, 13, 'SYSTEM', NULL, 'Tài khoản nhà thầu của bạn đã được quản trị viên phê duyệt. Bạn có thể đăng nhập và nhận dự án.', NULL, NULL, b'0', '2026-06-11 15:34:23.203096'),
(34, 14, 'BID_RECEIVED', NULL, 'Đơn hàng ORD-20260611-8 vừa nhận được báo giá mới từ a — 20 triệu đ', NULL, NULL, b'0', '2026-06-11 15:35:50.019732'),
(35, 15, 'SYSTEM', NULL, '🎉 Chúc mừng! Báo giá của bạn cho đơn ORD-20260611-8 đã được khách hàng chấp nhận. Admin sẽ liên hệ để ký kết hợp đồng.', NULL, NULL, b'0', '2026-06-11 15:37:45.182028'),
(36, 1, 'SYSTEM', NULL, 'Đơn ORD-20260611-8 đã chọn nhà thầu: a — 20 triệu đ. Cần ký kết hợp đồng.', NULL, NULL, b'0', '2026-06-11 15:37:45.204215'),
(37, 6, 'SYSTEM', NULL, '🚚 Đơn ORD-20260611-005 đang được giao đến bạn!', NULL, NULL, b'0', '2026-06-11 15:38:10.918686'),
(38, 6, 'SYSTEM', NULL, '✅ Đơn ORD-20260611-005 đã giao thành công. Cảm ơn bạn!', NULL, NULL, b'0', '2026-06-11 15:40:40.380425'),
(39, 14, 'SYSTEM', NULL, '🔨 Đơn ORD-20260611-8 đang được sản xuất/thi công.', NULL, NULL, b'0', '2026-06-11 15:41:05.789231'),
(40, 5, 'BID_RECEIVED', NULL, 'Đơn hàng ORD-20260610-003 vừa nhận được báo giá mới từ a — 12 triệu đ', NULL, NULL, b'0', '2026-06-11 15:44:12.855104'),
(41, 14, 'PAYMENT_SUCCESS', NULL, '✅ Đã khóa tiền đặt cọc 9 triệuđ cho đơn hàng ORD-20260611-10. Nhà thầu sẽ bắt đầu sản xuất ngay!', NULL, NULL, b'0', '2026-06-11 15:57:56.656839'),
(42, 1, 'SYSTEM', NULL, '🛒 Đơn catalog mới từ a — ORD-20260611-10. Cần xác nhận.', NULL, NULL, b'0', '2026-06-11 15:57:56.666554'),
(43, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260611-10 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-11 15:57:56.666554'),
(44, 1, 'SYSTEM', NULL, '📦 Đơn tùy chỉnh mới từ a — ORD-20260611-11. Cần phê duyệt để mở đấu giá.', NULL, NULL, b'0', '2026-06-11 15:59:02.922645'),
(45, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260611-11 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-11 15:59:02.927785'),
(46, 14, 'SYSTEM', NULL, 'Dự án #5 - Bàn ăn Cơm đã được admin duyệt và hiển thị trên sàn.', NULL, NULL, b'0', '2026-06-12 06:37:08.567670'),
(47, 14, 'SYSTEM', NULL, 'Da lock coc 1.200.000 VND (10%%). HD CTR-20260612133850-6 cho Admin duyet.', NULL, NULL, b'0', '2026-06-12 06:38:51.026558'),
(48, 15, 'SYSTEM', NULL, 'Bao gia duoc chon (du an: Bàn ăn Cơm, 12.000.000 VND)! Cho Admin duyet HD.', NULL, NULL, b'0', '2026-06-12 06:38:51.031551'),
(49, 1, 'SYSTEM', NULL, 'HD moi can duyet: CTR-20260612133850-6 - 12.000.000 VND. Customer da coc 1.200.000 VND', NULL, NULL, b'0', '2026-06-12 06:38:51.047241'),
(50, 14, 'SYSTEM', NULL, 'HD CTR-20260612133850-6 duoc duyet! Vao trang Hop dong de ky xac nhan.', NULL, NULL, b'0', '2026-06-12 06:39:31.633009'),
(51, 15, 'SYSTEM', NULL, 'HD CTR-20260612133850-6 duoc duyet! Khi ky HD can ky quy 600.000 VND (5%%).', NULL, NULL, b'0', '2026-06-12 06:39:31.636728'),
(52, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260611-11 của bạn đã được Admin phê duyệt và đang mở đấu giá. Các nhà thầu sẽ sớm gửi báo giá!', NULL, NULL, b'0', '2026-06-12 06:40:07.933336'),
(53, 2, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260611-11. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 06:40:07.945349'),
(54, 3, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260611-11. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 06:40:07.948445'),
(55, 10, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260611-11. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 06:40:07.950455'),
(56, 11, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260611-11. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 06:40:07.953888'),
(57, 12, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260611-11. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 06:40:07.956283'),
(58, 13, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260611-11. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 06:40:07.958361'),
(59, 15, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260611-11. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 06:40:07.962391'),
(60, 15, 'SYSTEM', NULL, 'Khach hang da ky HD CTR-20260612133850-6. Vui long ky de bat dau thi cong.', NULL, NULL, b'0', '2026-06-12 06:42:16.844805'),
(61, 14, 'SYSTEM', NULL, 'Nha thau da ky HD CTR-20260612133850-6. Den luot ban ky de bat dau thi cong.', NULL, NULL, b'0', '2026-06-12 06:42:36.139341'),
(62, 14, 'SYSTEM', NULL, 'HD CTR-20260612133850-6 chinh thuc ACTIVE! Cong trinh bat dau thi cong.', NULL, NULL, b'0', '2026-06-12 06:42:36.142299'),
(63, 15, 'SYSTEM', NULL, 'HD CTR-20260612133850-6 chinh thuc ACTIVE! Bat dau thi cong du an.', NULL, NULL, b'0', '2026-06-12 06:42:36.145510'),
(64, 14, 'MILESTONE_REQUEST', NULL, 'Nha thau da cap nhat tien do: 20% - HD CTR-20260612133850-6. [Khởi công]', NULL, NULL, b'0', '2026-06-12 07:19:51.013440'),
(65, 14, 'PAYMENT_SUCCESS', NULL, 'Nha thau yeu cau giai ngan 9.600.000 VND giai doan \'Khởi công\' - HD CTR-20260612133850-6. Vui long xem xet va xac nhan.', NULL, NULL, b'0', '2026-06-12 07:20:34.229585'),
(66, 15, 'PAYMENT_FAILED', NULL, 'Khach hang tu choi giai ngan giai doan \'Khởi công\'. Ly do: Quá nhiều .', NULL, NULL, b'0', '2026-06-12 07:22:36.815373'),
(67, 14, 'PAYMENT_SUCCESS', NULL, 'Nha thau yeu cau giai ngan 5.000.000 VND giai doan \'Khởi công\' - HD CTR-20260612133850-6. Vui long xem xet va xac nhan.', NULL, NULL, b'0', '2026-06-12 07:23:05.442785'),
(68, 14, 'MILESTONE_REQUEST', NULL, 'Nha thau da cap nhat tien do: 30% - HD CTR-20260612133850-6. [Thi công phần thô]', NULL, NULL, b'0', '2026-06-12 07:25:19.333544'),
(69, 15, 'PAYMENT_SUCCESS', NULL, 'Khach hang da duyet giai ngan 5.000.000 VND giai doan \'Khởi công\'. 2.000.000 VND dung ngay, 3.000.000 VND con locked.', NULL, NULL, b'0', '2026-06-12 07:58:08.169196'),
(70, 14, 'MILESTONE_REQUEST', NULL, 'Nha thau da cap nhat tien do: 100% - HD CTR-20260612133850-6. [Bàn giao công trình]', NULL, NULL, b'0', '2026-06-12 07:59:22.945281'),
(71, 14, 'PAYMENT_SUCCESS', NULL, 'Nha thau yeu cau giai ngan 4.600.000 VND giai doan \'Bàn giao công trình\' - HD CTR-20260612133850-6. Vui long xem xet va xac nhan.', NULL, NULL, b'0', '2026-06-12 08:00:09.044633'),
(72, 15, 'PAYMENT_SUCCESS', NULL, 'Khach hang da duyet giai ngan 4.600.000 VND giai doan \'Bàn giao công trình\'. 3.220.000 VND dung ngay, 1.380.000 VND con locked.', NULL, NULL, b'0', '2026-06-12 08:00:32.156479'),
(73, 15, 'PAYMENT_SUCCESS', NULL, 'Da mo khoa 1.380.000 VND tien bao dam giai doan \'Bàn giao công trình\' HD CTR-20260612133850-6.', NULL, NULL, b'0', '2026-06-12 08:00:48.237976'),
(74, 14, 'MILESTONE_REQUEST', NULL, 'Nha thau da cap nhat tien do: 100% - HD CTR-20260612133850-6.', NULL, NULL, b'0', '2026-06-12 08:45:48.295106'),
(75, 14, 'PAYMENT_SUCCESS', NULL, '✅ Đã khóa tiền đặt cọc 9 triệuđ cho đơn hàng ORD-20260612-12. Nhà thầu sẽ bắt đầu sản xuất ngay!', NULL, NULL, b'0', '2026-06-12 08:47:43.051464'),
(76, 1, 'SYSTEM', NULL, '🛒 Đơn catalog mới từ a — ORD-20260612-12. Cần xác nhận.', NULL, NULL, b'0', '2026-06-12 08:47:43.063967'),
(77, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260612-12 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-12 08:47:43.067005'),
(78, 1, 'SYSTEM', NULL, '📦 Đơn tùy chỉnh mới từ a — ORD-20260612-13. Cần phê duyệt để mở đấu giá.', NULL, NULL, b'0', '2026-06-12 08:48:49.174266'),
(79, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260612-13 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-12 08:48:49.179234'),
(80, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260612-13 của bạn đã được Admin phê duyệt và đang mở đấu giá. Các nhà thầu sẽ sớm gửi báo giá!', NULL, NULL, b'0', '2026-06-12 08:49:00.034831'),
(81, 2, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-13. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 08:49:00.045390'),
(82, 3, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-13. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 08:49:00.047383'),
(83, 10, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-13. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 08:49:00.050382'),
(84, 11, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-13. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 08:49:00.052368'),
(85, 12, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-13. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 08:49:00.054882'),
(86, 13, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-13. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 08:49:00.057879'),
(87, 15, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-13. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 08:49:00.059893'),
(88, 14, 'BID_RECEIVED', NULL, 'Đơn hàng ORD-20260612-13 vừa nhận được báo giá mới từ a — 20 triệu đ', NULL, NULL, b'0', '2026-06-12 08:50:29.599310'),
(89, 15, 'SYSTEM', NULL, '🎉 Chúc mừng! Báo giá của bạn cho đơn ORD-20260612-13 đã được khách hàng chấp nhận. Admin sẽ liên hệ để ký kết hợp đồng.', NULL, NULL, b'0', '2026-06-12 08:52:39.453346'),
(90, 1, 'SYSTEM', NULL, 'Đơn ORD-20260612-13 đã chọn nhà thầu: a — 20 triệu đ. Cần ký kết hợp đồng.', NULL, NULL, b'0', '2026-06-12 08:52:39.477120'),
(91, 14, 'SYSTEM', NULL, '🔨 Đơn ORD-20260612-13 đang được sản xuất/thi công.', NULL, NULL, b'0', '2026-06-12 08:54:43.390916'),
(92, 1, 'SYSTEM', NULL, '📦 Đơn tùy chỉnh mới từ a — ORD-20260612-14. Cần phê duyệt để mở đấu giá.', NULL, NULL, b'0', '2026-06-12 09:59:16.422371'),
(93, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260612-14 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-12 09:59:16.437319'),
(94, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260612-14 của bạn đã được Admin phê duyệt và đang mở đấu giá. Các nhà thầu sẽ sớm gửi báo giá!', NULL, NULL, b'0', '2026-06-12 09:59:33.527333'),
(95, 2, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-14. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 09:59:33.535862'),
(96, 3, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-14. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 09:59:33.538872'),
(97, 10, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-14. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 09:59:33.540864'),
(98, 11, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-14. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 09:59:33.542369'),
(99, 12, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-14. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 09:59:33.544390'),
(100, 13, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-14. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 09:59:33.546394'),
(101, 15, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-14. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 09:59:33.549913'),
(102, 14, 'BID_RECEIVED', NULL, 'Đơn hàng ORD-20260612-14 vừa nhận được báo giá mới từ a — 5 triệu đ', NULL, NULL, b'0', '2026-06-12 10:00:20.444105'),
(103, 15, 'SYSTEM', NULL, '🎉 Chúc mừng! Báo giá của bạn cho đơn ORD-20260612-14 đã được khách hàng chấp nhận. Admin sẽ liên hệ để ký kết hợp đồng.', NULL, NULL, b'0', '2026-06-12 10:00:42.965948'),
(104, 1, 'SYSTEM', NULL, 'Đơn ORD-20260612-14 đã chọn nhà thầu: a — 5 triệu đ. Cần ký kết hợp đồng.', NULL, NULL, b'0', '2026-06-12 10:00:42.980939'),
(105, 14, 'SYSTEM', NULL, '🔨 Đơn ORD-20260612-14 đang được sản xuất/thi công.', NULL, NULL, b'0', '2026-06-12 10:01:25.256179'),
(106, 1, 'SYSTEM', NULL, '📦 Đơn tùy chỉnh mới từ a — ORD-20260612-15. Cần phê duyệt để mở đấu giá.', NULL, NULL, b'0', '2026-06-12 10:05:42.267541'),
(107, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260612-15 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-12 10:05:42.272040'),
(108, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260612-15 của bạn đã được Admin phê duyệt và đang mở đấu giá. Các nhà thầu sẽ sớm gửi báo giá!', NULL, NULL, b'0', '2026-06-12 10:05:53.420387'),
(109, 2, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-15. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:05:53.430547'),
(110, 3, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-15. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:05:53.430547'),
(111, 10, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-15. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:05:53.430547'),
(112, 11, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-15. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:05:53.440637'),
(113, 12, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-15. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:05:53.446751'),
(114, 13, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-15. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:05:53.450118'),
(115, 15, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-15. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:05:53.453656'),
(116, 14, 'BID_RECEIVED', NULL, 'Đơn hàng ORD-20260612-15 vừa nhận được báo giá mới từ a — 10 triệu đ', NULL, NULL, b'0', '2026-06-12 10:06:52.374116'),
(117, 15, 'SYSTEM', NULL, '🎉 Chúc mừng! Báo giá của bạn cho đơn ORD-20260612-15 đã được khách hàng chấp nhận. Admin sẽ liên hệ để ký kết hợp đồng.', NULL, NULL, b'0', '2026-06-12 10:07:29.385815'),
(118, 1, 'SYSTEM', NULL, 'Đơn ORD-20260612-15 đã chọn nhà thầu: a — 10 triệu đ. Cần ký kết hợp đồng.', NULL, NULL, b'0', '2026-06-12 10:07:29.398886'),
(119, 14, 'SYSTEM', NULL, '🔨 Đơn ORD-20260612-15 đang được sản xuất/thi công.', NULL, NULL, b'0', '2026-06-12 10:08:02.136187'),
(120, 1, 'SYSTEM', NULL, '📦 Đơn tùy chỉnh mới từ a — ORD-20260612-16. Cần phê duyệt để mở đấu giá.', NULL, NULL, b'0', '2026-06-12 10:12:41.301616'),
(121, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260612-16 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-12 10:12:41.309496'),
(122, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260612-16 của bạn đã được Admin phê duyệt và đang mở đấu giá. Các nhà thầu sẽ sớm gửi báo giá!', NULL, NULL, b'0', '2026-06-12 10:12:52.657153'),
(123, 2, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-16. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:12:52.663550'),
(124, 3, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-16. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:12:52.665635'),
(125, 10, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-16. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:12:52.666942'),
(126, 11, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-16. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:12:52.669012'),
(127, 12, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-16. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:12:52.672808'),
(128, 13, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-16. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:12:52.675932'),
(129, 15, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-16. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:12:52.676904'),
(130, 14, 'BID_RECEIVED', NULL, 'Đơn hàng ORD-20260612-16 vừa nhận được báo giá mới từ a — 20 triệu đ', NULL, NULL, b'0', '2026-06-12 10:13:32.577351'),
(131, 15, 'SYSTEM', NULL, '🎉 Chúc mừng! Báo giá của bạn cho đơn ORD-20260612-16 đã được khách hàng chấp nhận. Admin sẽ liên hệ để ký kết hợp đồng.', NULL, NULL, b'0', '2026-06-12 10:14:33.697928'),
(132, 1, 'SYSTEM', NULL, 'Đơn ORD-20260612-16 đã chọn nhà thầu: a — 20 triệu đ. Cần ký kết hợp đồng.', NULL, NULL, b'0', '2026-06-12 10:14:33.714677'),
(133, 1, 'SYSTEM', NULL, '📦 Đơn tùy chỉnh mới từ Nguyên Hoàng Dũng  — ORD-20260612-17. Cần phê duyệt để mở đấu giá.', NULL, NULL, b'0', '2026-06-12 10:17:30.678836'),
(134, 16, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260612-17 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-12 10:17:30.681865'),
(135, 16, 'PAYMENT_SUCCESS', NULL, '✅ Đã khóa tiền đặt cọc 6 triệuđ cho đơn hàng ORD-20260612-18. Nhà thầu sẽ bắt đầu sản xuất ngay!', NULL, NULL, b'0', '2026-06-12 10:17:48.613187'),
(136, 1, 'SYSTEM', NULL, '🛒 Đơn catalog mới từ Nguyên Hoàng Dũng  — ORD-20260612-18. Cần xác nhận.', NULL, NULL, b'0', '2026-06-12 10:17:48.620992'),
(137, 16, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260612-18 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-12 10:17:48.623549'),
(138, 16, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260612-17 của bạn đã được Admin phê duyệt và đang mở đấu giá. Các nhà thầu sẽ sớm gửi báo giá!', NULL, NULL, b'0', '2026-06-12 10:18:38.630176'),
(139, 2, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-17. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:18:38.637236'),
(140, 3, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-17. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:18:38.640207'),
(141, 10, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-17. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:18:38.642739'),
(142, 11, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-17. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:18:38.643745'),
(143, 12, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-17. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:18:38.645762'),
(144, 13, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-17. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:18:38.647761'),
(145, 15, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-17. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:18:38.649758'),
(146, 16, 'BID_RECEIVED', NULL, 'Đơn hàng ORD-20260612-17 vừa nhận được báo giá mới từ a — 2 triệu đ', NULL, NULL, b'0', '2026-06-12 10:19:18.649816'),
(147, 15, 'SYSTEM', NULL, '🎉 Chúc mừng! Báo giá của bạn cho đơn ORD-20260612-17 đã được khách hàng chấp nhận. Admin sẽ liên hệ để ký kết hợp đồng.', NULL, NULL, b'0', '2026-06-12 10:19:41.694801'),
(148, 1, 'SYSTEM', NULL, 'Đơn ORD-20260612-17 đã chọn nhà thầu: a — 2 triệu đ. Cần ký kết hợp đồng.', NULL, NULL, b'0', '2026-06-12 10:19:41.710370'),
(149, 16, 'PAYMENT_SUCCESS', NULL, '✅ Đã khóa tiền đặt cọc 6 triệuđ cho đơn hàng ORD-20260612-19. Nhà thầu sẽ bắt đầu sản xuất ngay!', NULL, NULL, b'0', '2026-06-12 10:44:03.854956'),
(150, 1, 'SYSTEM', NULL, '🛒 Đơn catalog mới từ Nguyên Hoàng Dũng  — ORD-20260612-19. Cần xác nhận.', NULL, NULL, b'0', '2026-06-12 10:44:03.866798'),
(151, 16, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260612-19 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-12 10:44:03.866798'),
(152, 1, 'SYSTEM', NULL, '📦 Đơn tùy chỉnh mới từ Nguyên Hoàng Dũng  — ORD-20260612-20. Cần phê duyệt để mở đấu giá.', NULL, NULL, b'0', '2026-06-12 10:44:31.293064'),
(153, 16, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260612-20 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-12 10:44:31.297478'),
(154, 16, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260612-20 của bạn đã được Admin phê duyệt và đang mở đấu giá. Các nhà thầu sẽ sớm gửi báo giá!', NULL, NULL, b'0', '2026-06-12 10:45:04.736064'),
(155, 2, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-20. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:45:04.746086'),
(156, 3, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-20. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:45:04.749065'),
(157, 10, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-20. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:45:04.751089'),
(158, 11, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-20. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:45:04.752088'),
(159, 12, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-20. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:45:04.754081'),
(160, 13, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-20. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:45:04.755079'),
(161, 15, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-20. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:45:04.757066'),
(162, 16, 'BID_RECEIVED', NULL, 'Đơn hàng ORD-20260612-20 vừa nhận được báo giá mới từ a — 22 triệu đ', NULL, NULL, b'0', '2026-06-12 10:45:29.985491'),
(163, 16, 'SYSTEM', NULL, '🔨 Đơn ORD-20260612-17 đang được sản xuất/thi công.', NULL, NULL, b'0', '2026-06-12 10:51:01.472624'),
(164, 14, 'SYSTEM', NULL, '🔨 Đơn ORD-20260612-16 đang được sản xuất/thi công.', NULL, NULL, b'0', '2026-06-12 10:51:07.345353');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint(20) NOT NULL,
  `order_code` varchar(30) DEFAULT NULL,
  `customer_id` bigint(20) NOT NULL,
  `assigned_contractor_id` bigint(20) DEFAULT NULL,
  `selected_bid_id` bigint(20) DEFAULT NULL,
  `type` enum('CATALOG','CUSTOM') DEFAULT 'CATALOG',
  `status` enum('PENDING','CONFIRMED','DEPOSIT_PAID','OPEN_BIDDING','BIDDING','BIDDING_CLOSED','PROCESSING','SHIPPED','DELIVERED','CANCELLED') DEFAULT NULL,
  `total_amount` decimal(38,2) DEFAULT NULL,
  `delivery_address` text DEFAULT NULL,
  `contact_phone` varchar(255) DEFAULT NULL,
  `customer_note` text DEFAULT NULL,
  `custom_requirements` text DEFAULT NULL,
  `reference_image_url` varchar(500) DEFAULT NULL,
  `processing_note` text DEFAULT NULL,
  `deposit_percent` decimal(38,2) DEFAULT NULL,
  `deposit_amount` decimal(38,2) DEFAULT NULL,
  `deposit_locked` bit(1) NOT NULL DEFAULT b'0',
  `deposit_paid_at` datetime(6) DEFAULT NULL,
  `completion_image_url` varchar(500) DEFAULT NULL,
  `contractor_marked_done` bit(1) NOT NULL DEFAULT b'0',
  `contractor_done_at` datetime(6) DEFAULT NULL,
  `terms_accepted` bit(1) NOT NULL DEFAULT b'0',
  `fully_paid` bit(1) NOT NULL DEFAULT b'0',
  `created_at` datetime(6) DEFAULT current_timestamp(6),
  `updated_at` datetime(6) DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `confirmed_at` datetime(6) DEFAULT NULL,
  `delivered_at` datetime(6) DEFAULT NULL,
  `order_client_signed` bit(1) DEFAULT NULL,
  `order_client_signed_at` datetime(6) DEFAULT NULL,
  `order_contractor_signed` bit(1) DEFAULT NULL,
  `order_contractor_signed_at` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `order_code`, `customer_id`, `assigned_contractor_id`, `selected_bid_id`, `type`, `status`, `total_amount`, `delivery_address`, `contact_phone`, `customer_note`, `custom_requirements`, `reference_image_url`, `processing_note`, `deposit_percent`, `deposit_amount`, `deposit_locked`, `deposit_paid_at`, `completion_image_url`, `contractor_marked_done`, `contractor_done_at`, `terms_accepted`, `fully_paid`, `created_at`, `updated_at`, `confirmed_at`, `delivered_at`, `order_client_signed`, `order_client_signed_at`, `order_contractor_signed`, `order_contractor_signed_at`) VALUES
(1, 'ORD-20260601-001', 4, NULL, NULL, 'CATALOG', 'DELIVERED', 35000000.00, '123 Lê Lợi, Q.1, TP.HCM', '0901234561', NULL, NULL, NULL, NULL, 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-01 08:00:00.000000', '2026-06-11 10:59:43.097428', '2026-06-02 08:00:00.000000', NULL, NULL, NULL, NULL, NULL),
(2, 'ORD-20260605-002', 4, NULL, NULL, 'CATALOG', 'PROCESSING', 18500000.00, '123 Lê Lợi, Q.1, TP.HCM', '0901234561', NULL, NULL, NULL, NULL, 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-05 08:00:00.000000', '2026-06-11 10:59:43.097428', '2026-06-06 08:00:00.000000', NULL, NULL, NULL, NULL, NULL),
(3, 'ORD-20260610-003', 5, NULL, NULL, 'CUSTOM', 'OPEN_BIDDING', 0.00, '45 Nguyễn Huệ, Q.1, TP.HCM', '0901234562', NULL, NULL, NULL, '', 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-10 08:00:00.000000', '2026-06-11 15:32:39.466257', '2026-06-11 15:32:39.438246', NULL, NULL, NULL, NULL, NULL),
(4, 'ORD-20260610-004', 5, NULL, NULL, 'CUSTOM', 'BIDDING', 0.00, '45 Nguyễn Huệ, Q.1, TP.HCM', '0901234562', NULL, NULL, NULL, NULL, 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-10 10:00:00.000000', '2026-06-11 10:59:43.097428', NULL, NULL, NULL, NULL, NULL, NULL),
(5, 'ORD-20260611-005', 6, NULL, NULL, 'CATALOG', 'DELIVERED', 6800000.00, '88 Đinh Tiên Hoàng, Hà Nội', '0901234563', NULL, NULL, NULL, 'a', 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-11 08:00:00.000000', '2026-06-11 15:40:40.386413', '2026-06-11 15:32:33.687785', '2026-06-11 15:40:40.378105', NULL, NULL, NULL, NULL),
(7, 'ORD-20260611-7', 14, NULL, NULL, 'CATALOG', 'DEPOSIT_PAID', 15600000.00, 'a', '0987654321', 'aada', '', '', NULL, 60.00, 9360000.00, b'1', NULL, NULL, b'0', NULL, b'1', b'0', '2026-06-11 06:52:34.427457', '2026-06-11 06:52:34.462566', NULL, NULL, NULL, NULL, NULL, NULL),
(8, 'ORD-20260611-8', 14, 15, 3, 'CUSTOM', 'PROCESSING', 19999998.00, 'ad', '0987654321', 'a', 'THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối\n• Hộc kéo 3 tầng (40×50cm) × 1 khối\n• Hộc kéo 3 tầng (40×50cm) × 1 khối\n\nBOM:\n  - Tấm gỗ MDF 18mm: 6 tấm\n  - Bản lề giảm chấn: 2 cái\n  - Tay nắm tủ: 1 cái\n  - Ray trượt hộc kéo: 6 bộ\n  - Tay nắm: 6 cái', '', '', 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-11 06:52:57.074536', '2026-06-11 15:41:05.789231', '2026-06-11 15:41:05.789231', NULL, NULL, NULL, NULL, NULL),
(9, 'ORD-20260611-9', 14, NULL, NULL, 'CATALOG', 'DEPOSIT_PAID', 9800000.00, 'a', '0987654321', 'â', '', '', NULL, 60.00, 5880000.00, b'1', NULL, NULL, b'0', NULL, b'1', b'0', '2026-06-11 15:01:13.827118', '2026-06-11 15:01:13.928673', NULL, NULL, NULL, NULL, NULL, NULL),
(10, 'ORD-20260611-10', 14, NULL, NULL, 'CATALOG', 'DEPOSIT_PAID', 15600000.00, 'Hồ Chí Minh', '0987654321', 'a', '', '', NULL, 60.00, 9360000.00, b'1', NULL, NULL, b'0', NULL, b'1', b'0', '2026-06-11 15:57:56.596604', '2026-06-11 15:57:56.672032', NULL, NULL, NULL, NULL, NULL, NULL),
(11, 'ORD-20260611-11', 14, NULL, NULL, 'CUSTOM', 'OPEN_BIDDING', 3200000.00, 'Hồ chí Minh', '0987654312', '', 'THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khối\n\nBOM:\n  - Tấm gỗ MDF 18mm: 4 tấm\n  - Bản lề giảm chấn: 4 cái\n  - Tay nắm tủ: 2 cái', '', '', 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-11 15:59:02.898717', '2026-06-12 06:40:07.967396', '2026-06-12 06:40:07.932233', NULL, NULL, NULL, NULL, NULL),
(12, 'ORD-20260612-12', 14, NULL, NULL, 'CATALOG', 'DEPOSIT_PAID', 15600000.00, 'Linh Dông ', '0987654321', 'Giờ hành chính ', '', '', NULL, 60.00, 9360000.00, b'1', NULL, NULL, b'0', NULL, b'1', b'0', '2026-06-12 08:47:42.972327', '2026-06-12 08:47:43.071015', NULL, NULL, NULL, NULL, NULL, NULL),
(13, 'ORD-20260612-13', 14, 15, 5, 'CUSTOM', 'PROCESSING', 19999998.00, 'Linh Dong', '0987654321', 'a', 'THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khối\n\nBOM:\n  - Tấm gỗ MDF 18mm: 4 tấm\n  - Bản lề giảm chấn: 4 cái\n  - Tay nắm tủ: 2 cái', '', '', 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-12 08:48:49.158092', '2026-06-12 08:54:43.393912', '2026-06-12 08:54:43.389957', NULL, NULL, NULL, NULL, NULL),
(14, 'ORD-20260612-14', 14, 15, 6, 'CUSTOM', 'PROCESSING', 5000000.00, 'COngty', '0987654321', 'khanh Thuan', 'THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối\n• Hộc kéo 3 tầng (40×50cm) × 1 khối\n\nBOM:\n  - Tấm gỗ MDF 18mm: 4 tấm\n  - Bản lề giảm chấn: 2 cái\n  - Tay nắm tủ: 1 cái\n  - Ray trượt hộc kéo: 3 bộ\n  - Tay nắm: 3 cái', '', '', 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-12 09:59:16.299005', '2026-06-12 10:01:25.260236', '2026-06-12 10:01:25.255188', NULL, b'0', NULL, b'0', NULL),
(15, 'ORD-20260612-15', 14, 15, 7, 'CUSTOM', 'PROCESSING', 10000000.00, 'quan 2 ', '09876666666', 'ahd;oădawd', 'THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối\n• Hộc kéo 3 tầng (40×50cm) × 1 khối\n• Tủ đôi (120×50cm) × 1 khối\n\nBOM:\n  - Tấm gỗ MDF 18mm: 8 tấm\n  - Bản lề giảm chấn: 6 cái\n  - Tay nắm tủ: 3 cái\n  - Ray trượt hộc kéo: 3 bộ\n  - Tay nắm: 3 cái', '', '', 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-12 10:05:42.238351', '2026-06-12 10:08:02.141280', '2026-06-12 10:08:02.135192', NULL, b'0', NULL, b'0', NULL),
(16, 'ORD-20260612-16', 14, 15, 8, 'CUSTOM', 'PROCESSING', 20000000.00, 'nam kỳ khởi nghĩa ', '0999999999', '', 'THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối\n\nBOM:\n  - Tấm gỗ MDF 18mm: 2 tấm\n  - Bản lề giảm chấn: 2 cái\n  - Tay nắm tủ: 1 cái', '', '', 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-12 10:12:41.279502', '2026-06-12 10:51:07.349752', '2026-06-12 10:51:07.344278', NULL, b'0', NULL, b'0', NULL),
(17, 'ORD-20260612-17', 16, 15, 9, 'CUSTOM', 'PROCESSING', 2222222.00, 'NGUYEN VAN A', '0987777777', 'NGUYEN VAN A', 'THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khối\n• Hộc kéo 3 tầng (40×50cm) × 1 khối\n\nBOM:\n  - Tấm gỗ MDF 18mm: 6 tấm\n  - Bản lề giảm chấn: 4 cái\n  - Tay nắm tủ: 2 cái\n  - Ray trượt hộc kéo: 3 bộ\n  - Tay nắm: 3 cái', '', '', 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-12 10:17:30.659703', '2026-06-12 10:51:01.503288', '2026-06-12 10:51:01.468203', NULL, b'0', NULL, b'0', NULL),
(18, 'ORD-20260612-18', 16, NULL, NULL, 'CATALOG', 'DEPOSIT_PAID', 9800000.00, 'NGUYEN VAN A', '098777777', 'NGUYEN VAN A', '', '', NULL, 60.00, 5880000.00, b'1', NULL, NULL, b'0', NULL, b'1', b'0', '2026-06-12 10:17:48.575481', '2026-06-12 10:17:48.625729', NULL, NULL, b'0', NULL, b'0', NULL),
(19, 'ORD-20260612-19', 16, NULL, NULL, 'CATALOG', 'DEPOSIT_PAID', 9800000.00, 'a', '000000000', 'adwwd', '', '', NULL, 60.00, 5880000.00, b'1', NULL, NULL, b'0', NULL, b'1', b'0', '2026-06-12 10:44:03.764659', '2026-06-12 10:44:03.877582', NULL, NULL, NULL, NULL, NULL, NULL),
(20, 'ORD-20260612-20', 16, NULL, NULL, 'CUSTOM', 'OPEN_BIDDING', 3200000.00, 'a', '0987654321', '', 'THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khối\n\nBOM:\n  - Tấm gỗ MDF 18mm: 4 tấm\n  - Bản lề giảm chấn: 4 cái\n  - Tay nắm tủ: 2 cái', '', '', 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-12 10:44:31.272090', '2026-06-12 10:45:04.759065', '2026-06-12 10:45:04.730282', NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `order_bids`
--

CREATE TABLE `order_bids` (
  `id` bigint(20) NOT NULL,
  `order_id` bigint(20) NOT NULL,
  `contractor_id` bigint(20) NOT NULL,
  `quoted_price` decimal(15,0) DEFAULT NULL,
  `estimated_days` int(11) DEFAULT NULL,
  `proposal` text DEFAULT NULL,
  `portfolio_image_url` varchar(500) DEFAULT NULL,
  `status` enum('PENDING','ACCEPTED','REJECTED') DEFAULT 'PENDING',
  `created_at` datetime(6) DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_bids`
--

INSERT INTO `order_bids` (`id`, `order_id`, `contractor_id`, `quoted_price`, `estimated_days`, `proposal`, `portfolio_image_url`, `status`, `created_at`) VALUES
(1, 3, 2, 25000000, 15, 'Thi công tủ bếp gỗ MDF chống ẩm, kích thước 3m dài', NULL, 'PENDING', '2026-06-11 10:59:43.117376'),
(2, 3, 3, 28000000, 12, 'Tủ bếp gỗ sồi tự nhiên, phong cách hiện đại', NULL, 'PENDING', '2026-06-11 10:59:43.117376'),
(3, 8, 15, 19999998, 20, 'Gỗ xoài ', '', 'ACCEPTED', '2026-06-11 15:35:50.007116'),
(4, 3, 15, 12000000, 40, 'a', '', 'PENDING', '2026-06-11 15:44:12.842748'),
(5, 13, 15, 19999998, 20, 'Gỗ xoài nam mỹ ', '', 'ACCEPTED', '2026-06-12 08:50:29.585736'),
(6, 14, 15, 5000000, 40, 'Xoài đài loan MDF', '', 'ACCEPTED', '2026-06-12 10:00:20.428207'),
(7, 15, 15, 10000000, 21, 'xoài đài laon ', '', 'ACCEPTED', '2026-06-12 10:06:52.352404'),
(8, 16, 15, 20000000, 50, 'adw', '', 'ACCEPTED', '2026-06-12 10:13:32.566069'),
(9, 17, 15, 2222222, 21, 'a', '', 'ACCEPTED', '2026-06-12 10:19:18.637890'),
(10, 20, 15, 22222222, 12, 'a', '', 'PENDING', '2026-06-12 10:45:29.984378');

-- --------------------------------------------------------

--
-- Table structure for table `order_bid_items`
--

CREATE TABLE `order_bid_items` (
  `id` bigint(20) NOT NULL,
  `description` text DEFAULT NULL,
  `item_name` varchar(255) NOT NULL,
  `quantity` double DEFAULT NULL,
  `sample_image_url` varchar(500) DEFAULT NULL,
  `total_price` decimal(15,0) DEFAULT NULL,
  `unit` varchar(255) DEFAULT NULL,
  `unit_price` decimal(15,0) DEFAULT NULL,
  `order_bid_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_bid_items`
--

INSERT INTO `order_bid_items` (`id`, `description`, `item_name`, `quantity`, `sample_image_url`, `total_price`, `unit`, `unit_price`, `order_bid_id`) VALUES
(1, '', 'Sofa', 1, '', 19999998, 'cái', 19999998, 3),
(2, '', 'Sofa', 1, '', 12000000, 'cái', 12000000, 4),
(3, '', 'Tủ Đôi ', 1, '', 19999998, 'cái', 19999998, 5),
(4, '', 'Tủ đơn ', 2, '', 5000000, 'cái', 2500000, 6),
(5, '', 'Tủ đơn (60×50cm) × 1 khối', 1, '', 2000000, 'cái', 2000000, 7),
(6, '', ' Hộc kéo 3 tầng (40×50cm) × 1 khối', 1, '', 5000000, 'cái', 5000000, 7),
(7, '', 'Tủ đôi (120×50cm) × 1 khối', 1, '', 3000000, 'cái', 3000000, 7),
(8, '', 'Tủ đơn (60×50cm) × 1 khối', 1, '', 20000000, 'cái', 20000000, 8),
(9, '', 'a', 1, '', 2222222, 'cái', 2222222, 9),
(10, '', 'a', 1, '', 22222222, 'cái', 22222222, 10);

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint(20) NOT NULL,
  `order_id` bigint(20) NOT NULL,
  `product_id` bigint(20) DEFAULT NULL,
  `item_name` varchar(255) NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unit_price` decimal(15,0) NOT NULL DEFAULT 0,
  `subtotal` decimal(15,0) NOT NULL DEFAULT 0,
  `custom_note` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `item_name`, `image_url`, `quantity`, `unit_price`, `subtotal`, `custom_note`) VALUES
(1, 1, 3, 'Sofa da thật nhập khẩu Ý', NULL, 1, 35000000, 35000000, NULL),
(2, 2, 1, 'Sofa góc L hiện đại', NULL, 1, 18500000, 18500000, NULL),
(3, 5, 8, 'Ghế văn phòng ergonomic', NULL, 1, 6800000, 6800000, NULL),
(5, 7, 4, 'Bàn ăn gỗ óc chó', 'https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=600', 1, 15600000, 15600000, ''),
(6, 8, NULL, 'Tủ đơn (60×50cm)', '', 1, 1800000, 1800000, 'Kích thước: 60×50cm'),
(7, 8, NULL, 'Hộc kéo 3 tầng (40×50cm)', '', 1, 1200000, 1200000, 'Kích thước: 40×50cm'),
(8, 8, NULL, 'Hộc kéo 3 tầng (40×50cm)', '', 1, 1200000, 1200000, 'Kích thước: 40×50cm'),
(9, 9, 2, 'Sofa văng 3 chỗ Scandinavian', 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600', 1, 9800000, 9800000, ''),
(10, 10, 4, 'Bàn ăn gỗ óc chó', 'https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=600', 1, 15600000, 15600000, ''),
(11, 11, NULL, 'Tủ đôi (120×50cm)', '', 1, 3200000, 3200000, 'Kích thước: 120×50cm'),
(12, 12, 4, 'Bàn ăn gỗ óc chó', 'https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=600', 1, 15600000, 15600000, ''),
(13, 13, NULL, 'Tủ đôi (120×50cm)', '', 1, 3200000, 3200000, 'Kích thước: 120×50cm'),
(14, 14, NULL, 'Tủ đơn (60×50cm)', '', 1, 1800000, 1800000, 'Kích thước: 60×50cm'),
(15, 14, NULL, 'Hộc kéo 3 tầng (40×50cm)', '', 1, 1200000, 1200000, 'Kích thước: 40×50cm'),
(16, 15, NULL, 'Tủ đơn (60×50cm)', '', 1, 1800000, 1800000, 'Kích thước: 60×50cm'),
(17, 15, NULL, 'Hộc kéo 3 tầng (40×50cm)', '', 1, 1200000, 1200000, 'Kích thước: 40×50cm'),
(18, 15, NULL, 'Tủ đôi (120×50cm)', '', 1, 3200000, 3200000, 'Kích thước: 120×50cm'),
(19, 16, NULL, 'Tủ đơn (60×50cm)', '', 1, 1800000, 1800000, 'Kích thước: 60×50cm'),
(20, 17, NULL, 'Tủ đôi (120×50cm)', '', 1, 3200000, 3200000, 'Kích thước: 120×50cm'),
(21, 17, NULL, 'Hộc kéo 3 tầng (40×50cm)', '', 1, 1200000, 1200000, 'Kích thước: 40×50cm'),
(22, 18, 2, 'Sofa văng 3 chỗ Scandinavian', 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600', 1, 9800000, 9800000, ''),
(23, 19, 2, 'Sofa văng 3 chỗ Scandinavian', 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600', 1, 9800000, 9800000, ''),
(24, 20, NULL, 'Tủ đôi (120×50cm)', '', 1, 3200000, 3200000, 'Kích thước: 120×50cm');

-- --------------------------------------------------------

--
-- Table structure for table `portfolio_items`
--

CREATE TABLE `portfolio_items` (
  `id` bigint(20) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `client_name` varchar(200) DEFAULT NULL,
  `completion_year` varchar(10) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `project_value` bigint(20) DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `contractor_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(15,0) NOT NULL DEFAULT 0,
  `original_price` decimal(15,0) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `material` varchar(200) DEFAULT NULL,
  `dimensions` varchar(100) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `rating` double DEFAULT 0,
  `review_count` int(11) DEFAULT 0,
  `featured` bit(1) DEFAULT b'0',
  `active` bit(1) DEFAULT b'1',
  `created_at` datetime(6) DEFAULT current_timestamp(6),
  `updated_at` datetime(6) DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `original_price`, `image_url`, `category`, `brand`, `material`, `dimensions`, `color`, `stock`, `rating`, `review_count`, `featured`, `active`, `created_at`, `updated_at`) VALUES
(1, 'Sofa góc L hiện đại', 'Sofa góc L chân gỗ sồi, bọc nỉ cao cấp', 18500000, 22000000, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600', 'SOFA', NULL, 'Gỗ sồi + Nỉ Hàn Quốc', NULL, NULL, 12, 0, 0, b'1', b'1', '2026-06-11 10:59:43.082994', '2026-06-11 10:59:43.082994'),
(2, 'Sofa văng 3 chỗ Scandinavian', 'Phong cách Bắc Âu tối giản, màu kem', 9800000, 12000000, 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600', 'SOFA', NULL, 'Gỗ sồi + Vải linen', NULL, NULL, 5, 0, 0, b'1', b'1', '2026-06-11 10:59:43.082994', '2026-06-12 10:44:03.876535'),
(3, 'Sofa da thật nhập khẩu Ý', 'Da bò thật, khung thép không gỉ', 35000000, NULL, 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600', 'SOFA', NULL, 'Da bò thật', NULL, NULL, 3, 0, 0, b'1', b'1', '2026-06-11 10:59:43.082994', '2026-06-11 10:59:43.082994'),
(4, 'Bàn ăn gỗ óc chó', 'Mặt bàn gỗ óc chó nguyên tấm', 15600000, 18000000, 'https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=600', 'TABLE', NULL, 'Gỗ óc chó', NULL, NULL, 3, 0, 0, b'1', b'1', '2026-06-11 10:59:43.082994', '2026-06-12 08:47:43.071015'),
(5, 'Bàn làm việc tối giản', 'Bàn home office có ngăn kéo', 3200000, 4000000, 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600', 'TABLE', NULL, 'MDF chống xước', NULL, NULL, 25, 0, 0, b'0', b'1', '2026-06-11 10:59:43.082994', '2026-06-11 10:59:43.082994'),
(6, 'Bàn cà phê mặt đá marble', 'Mặt đá cẩm thạch nhân tạo', 4800000, 6200000, 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600', 'TABLE', NULL, 'Đá marble + Inox', NULL, NULL, 14, 0, 0, b'0', b'1', '2026-06-11 10:59:43.082994', '2026-06-11 10:59:43.082994'),
(7, 'Ghế ăn bọc nhung Velvet', 'Bộ 4 ghế, chân gỗ sồi', 5600000, 7200000, 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600', 'CHAIR', NULL, 'Nhung Velvet', NULL, NULL, 20, 0, 0, b'0', b'1', '2026-06-11 10:59:43.082994', '2026-06-11 10:59:43.082994'),
(8, 'Ghế văn phòng ergonomic', 'Lưng lưới thoáng khí, tựa đầu chỉnh', 6800000, 8500000, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600', 'CHAIR', NULL, 'Lưới + Nhựa ABS', NULL, NULL, 29, 0, 0, b'1', b'1', '2026-06-11 10:59:43.082994', '2026-06-11 10:59:43.082994'),
(9, 'Giường ngủ King Size', '1m8 khung gỗ sồi Mỹ', 22000000, 26000000, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600', 'BED', NULL, 'Gỗ sồi Mỹ', NULL, NULL, 5, 0, 0, b'1', b'1', '2026-06-11 10:59:43.082994', '2026-06-11 10:59:43.082994'),
(10, 'Tủ quần áo 4 cánh gương', '2 cánh gương toàn thân', 8900000, 11000000, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600', 'CABINET', NULL, 'MDF + Gương', NULL, NULL, 7, 0, 0, b'0', b'1', '2026-06-11 10:59:43.082994', '2026-06-11 10:59:43.082994'),
(11, 'Đèn thả trần mây đan', 'Thủ công, ánh sáng ấm', 1200000, 1600000, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600', 'DECOR', NULL, 'Mây đan + Đồng', NULL, NULL, 35, 0, 0, b'0', b'1', '2026-06-11 10:59:43.082994', '2026-06-11 10:59:43.082994'),
(12, 'Tranh canvas Abstract', 'Bộ 3 tấm phong cách hiện đại', 680000, 900000, 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=600', 'DECOR', NULL, 'Canvas + Gỗ', NULL, NULL, 50, 0, 0, b'0', b'1', '2026-06-11 10:59:43.082994', '2026-06-11 10:59:43.082994');

-- --------------------------------------------------------

--
-- Table structure for table `project`
--

CREATE TABLE `project` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `style` varchar(100) DEFAULT NULL,
  `address` varchar(300) DEFAULT NULL,
  `area` double DEFAULT NULL,
  `budget_min` bigint(20) DEFAULT NULL,
  `budget_max` bigint(20) DEFAULT NULL,
  `bid_type` enum('FIXED_PRICE','NEGOTIABLE','OPEN','DIRECT') DEFAULT 'FIXED_PRICE',
  `status` enum('DRAFT','OPEN','IN_PROGRESS','COMPLETED','CLOSED','CANCELLED') DEFAULT 'DRAFT',
  `approval_status` enum('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  `admin_note` text DEFAULT NULL,
  `approved_by` bigint(20) DEFAULT NULL,
  `approved_at` datetime(6) DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `deadline` date DEFAULT NULL,
  `created_at` datetime(6) DEFAULT current_timestamp(6),
  `updated_at` datetime(6) DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `project`
--

INSERT INTO `project` (`id`, `user_id`, `name`, `description`, `category`, `style`, `address`, `area`, `budget_min`, `budget_max`, `bid_type`, `status`, `approval_status`, `admin_note`, `approved_by`, `approved_at`, `rejection_reason`, `deadline`, `created_at`, `updated_at`) VALUES
(1, 4, 'Thiết kế + thi công tủ bếp', 'Tủ bếp chữ L, kích thước 3m x 2.5m, chất liệu gỗ MDF chống ẩm', NULL, NULL, NULL, NULL, 15000000, 25000000, 'FIXED_PRICE', 'OPEN', 'APPROVED', NULL, NULL, '2026-06-05 08:00:00.000000', NULL, '2026-07-01', '2026-06-11 10:59:43.128538', '2026-06-11 10:59:43.128538'),
(2, 5, 'Sofa phòng khách chung cư', 'Sofa góc L, bọc nỉ cao cấp, kích thước phù hợp phòng 25m2', NULL, NULL, NULL, NULL, 12000000, 20000000, 'FIXED_PRICE', 'OPEN', 'APPROVED', NULL, NULL, '2026-06-08 08:00:00.000000', NULL, '2026-06-30', '2026-06-11 10:59:43.128538', '2026-06-11 10:59:43.128538'),
(3, 6, 'Bàn ghế ăn 6 chỗ', 'Bàn gỗ óc chó + 6 ghế bọc da, phong cách tân cổ điển', NULL, NULL, NULL, NULL, 18000000, 30000000, 'FIXED_PRICE', 'OPEN', 'APPROVED', 'a', NULL, '2026-06-11 06:47:18.343352', NULL, '2026-07-10', '2026-06-11 10:59:43.128538', '2026-06-11 13:47:18.356562'),
(4, 14, 'a', '--- SẢN PHẨM MẪU YÊU CẦU ---\n• Sofa góc L hiện đại (x1)', NULL, NULL, ' linh dong , quan1 , ho', NULL, 500000, 20000000, 'FIXED_PRICE', 'OPEN', 'APPROVED', 'a', NULL, '2026-06-11 06:47:20.544932', NULL, NULL, NULL, '2026-06-11 13:47:20.553629'),
(5, 14, 'Bàn ăn Cơm', '--- SẢN PHẨM MẪU YÊU CẦU ---\n• Sofa da thật nhập khẩu Ý (x1)\n• Đèn thả trần mây đan (x1)\n\n--- YÊU CẦU RIÊNG ---\nSòa', NULL, NULL, 'Trần Não , quận 2 , Hồ Chí Minh ', NULL, 50000000, 100000000, 'FIXED_PRICE', 'IN_PROGRESS', 'APPROVED', 'Hồ sơ hợp lệ', NULL, '2026-06-12 06:37:08.563670', NULL, NULL, '2026-06-11 16:00:15.880538', '2026-06-12 13:38:51.062154');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` bigint(20) NOT NULL,
  `reviewer_id` bigint(20) NOT NULL,
  `reviewee_id` bigint(20) NOT NULL,
  `reference_type` varchar(20) NOT NULL,
  `reference_id` bigint(20) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` varchar(1000) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` bigint(20) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `description`, `updated_at`) VALUES
(1, 'PLATFORM_FEE_PERCENT', '5.00', 'Phí nền tảng (%)', '2026-06-11 10:59:43.180087'),
(2, 'MIN_DEPOSIT_AMOUNT', '10000', 'Số tiền nạp tối thiểu', '2026-06-11 10:59:43.180087'),
(3, 'MAX_DEPOSIT_AMOUNT', '100000000', 'Số tiền nạp tối đa', '2026-06-11 10:59:43.180087'),
(4, 'BID_DEADLINE_DAYS', '7', 'Số ngày nhà thầu có thể gửi bid', '2026-06-11 10:59:43.180087');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` bigint(20) NOT NULL,
  `wallet_id` bigint(20) NOT NULL,
  `amount` bigint(20) NOT NULL,
  `fee_amount` bigint(20) DEFAULT 0,
  `net_amount` bigint(20) DEFAULT NULL,
  `type` enum('DEPOSIT','LOCK','RELEASE','WITHDRAW','TOKEN_CREATE','TOKEN_PAY','REVENUE') NOT NULL,
  `status` enum('PENDING','SUCCESS','FAILED','CANCELLED') NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `gateway_order_id` varchar(255) DEFAULT NULL,
  `payment_gateway` varchar(50) DEFAULT NULL,
  `contract_job_id` bigint(20) DEFAULT NULL,
  `escrow_account_id` bigint(20) DEFAULT NULL,
  `failure_reason` text DEFAULT NULL,
  `created_at` datetime(6) DEFAULT current_timestamp(6),
  `completed_at` datetime(6) DEFAULT NULL,
  `gateway_trans_id` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `wallet_id`, `amount`, `fee_amount`, `net_amount`, `type`, `status`, `description`, `gateway_order_id`, `payment_gateway`, `contract_job_id`, `escrow_account_id`, `failure_reason`, `created_at`, `completed_at`, `gateway_trans_id`) VALUES
(1, 14, 100000000, 0, NULL, 'DEPOSIT', 'SUCCESS', 'Nạp tiền thành công qua cổng kết nối VNPAY Sandbox', 'SANDBOX-LOCAL-SUCCESS-1781160577658', 'VNPAY', NULL, NULL, NULL, '2026-06-11 06:49:06.918002', NULL, NULL),
(2, 13, 100000000, 0, NULL, 'DEPOSIT', 'SUCCESS', 'Nạp tiền thành công qua cổng kết nối VNPAY Sandbox', 'SANDBOX-LOCAL-SUCCESS-1781160744253', 'VNPAY', NULL, NULL, NULL, '2026-06-11 06:52:02.520947', NULL, NULL),
(3, 13, 9360000, 0, NULL, 'LOCK', 'SUCCESS', 'Khóa tiền đơn hàng: ORD-20260611-7-DEPOSIT', 'LOCK-ORD-20260611-7-DEPOSIT', 'CONSTRUCTX_ESCROW', NULL, NULL, NULL, '2026-06-11 06:52:34.434975', NULL, NULL),
(4, 13, 111109, 0, NULL, 'WITHDRAW', 'SUCCESS', 'Rút về NH: Vietcombank | STK: 1234 | Tên: alo | Admin duyệt: Hệ thống phê duyệt - Đã chuyển khoản thành công.', 'WD-6C8FE087', 'MANUAL_BANK_TRANSFER', NULL, NULL, NULL, '2026-06-11 06:56:58.183564', NULL, NULL),
(5, 13, 5880000, 0, NULL, 'LOCK', 'SUCCESS', 'Khóa tiền đơn hàng: ORD-20260611-9-DEPOSIT', 'LOCK-ORD-20260611-9-DEPOSIT', 'CONSTRUCTX_ESCROW', NULL, NULL, NULL, '2026-06-11 15:01:13.898781', NULL, NULL),
(6, 13, 9360000, 0, NULL, 'LOCK', 'SUCCESS', 'Khóa tiền đơn hàng: ORD-20260611-10-DEPOSIT', 'LOCK-ORD-20260611-10-DEPOSIT', 'CONSTRUCTX_ESCROW', NULL, NULL, NULL, '2026-06-11 15:57:56.648412', NULL, NULL),
(7, 13, 1200000, 0, NULL, 'LOCK', 'SUCCESS', 'Khóa tiền đơn hàng: CTR-DEPOSIT-5-6', 'LOCK-CTR-DEPOSIT-5-6', 'CONSTRUCTX_ESCROW', NULL, NULL, NULL, '2026-06-12 06:38:50.925914', NULL, NULL),
(8, 14, 600000, 0, NULL, 'LOCK', 'SUCCESS', 'Khóa tiền đơn hàng: CTR-KQ-CTR-20260612133850-6', 'LOCK-CTR-KQ-CTR-20260612133850-6', 'CONSTRUCTX_ESCROW', NULL, NULL, NULL, '2026-06-12 06:42:36.127149', NULL, NULL),
(14, 13, 5000000, 0, NULL, 'LOCK', 'SUCCESS', 'Thanh toan giai ngan giai doan \'Khởi công\' HD CTR-20260612133850-6', 'PAY-DISB-2', 'CONSTRUCTX_DISBURSEMENT', NULL, NULL, NULL, '2026-06-12 07:58:08.129491', NULL, NULL),
(15, 14, 5000000, 0, NULL, 'REVENUE', 'SUCCESS', 'Nhan giai ngan giai doan \'Khởi công\' HD CTR-20260612133850-6 (immediate: 2.000.000 VND, locked: 3.000.000 VND)', 'RECV-DISB-2', 'CONSTRUCTX_DISBURSEMENT', NULL, NULL, NULL, '2026-06-12 07:58:08.141607', NULL, NULL),
(16, 13, 4600000, 0, NULL, 'LOCK', 'SUCCESS', 'Thanh toan giai ngan giai doan \'Bàn giao công trình\' HD CTR-20260612133850-6', 'PAY-DISB-3', 'CONSTRUCTX_DISBURSEMENT', NULL, NULL, NULL, '2026-06-12 08:00:32.143509', NULL, NULL),
(17, 14, 4600000, 0, NULL, 'REVENUE', 'SUCCESS', 'Nhan giai ngan giai doan \'Bàn giao công trình\' HD CTR-20260612133850-6 (immediate: 3.220.000 VND, locked: 1.380.000 VND)', 'RECV-DISB-3', 'CONSTRUCTX_DISBURSEMENT', NULL, NULL, NULL, '2026-06-12 08:00:32.151869', NULL, NULL),
(18, 14, 3000000, 0, NULL, 'RELEASE', 'SUCCESS', 'Tu dong mo khoa tien bao dam giai doan \'Khởi công\' khi dat moc moi 100%', 'AUTO-UNLOCK-DISB-2', 'CONSTRUCTX_AUTO_UNLOCK', NULL, NULL, NULL, '2026-06-12 08:00:32.173788', NULL, NULL),
(19, 14, 1380000, 0, NULL, 'RELEASE', 'SUCCESS', 'Mo khoa tien bao dam giai doan \'Bàn giao công trình\' HD CTR-20260612133850-6', 'UNLOCK-DISB-3', 'CONSTRUCTX_UNLOCK', NULL, NULL, NULL, '2026-06-12 08:00:48.234952', NULL, NULL),
(20, 13, 9360000, 0, NULL, 'LOCK', 'SUCCESS', 'Khóa tiền đơn hàng: ORD-20260612-12-DEPOSIT', 'LOCK-ORD-20260612-12-DEPOSIT', 'CONSTRUCTX_ESCROW', NULL, NULL, NULL, '2026-06-12 08:47:43.041756', NULL, NULL),
(21, 15, 100000000, 0, NULL, 'DEPOSIT', 'SUCCESS', 'Nạp tiền thành công qua cổng kết nối VNPAY Sandbox', 'SANDBOX-LOCAL-SUCCESS-1781259432175', 'VNPAY', NULL, NULL, NULL, '2026-06-12 10:16:40.456729', NULL, NULL),
(22, 15, 5880000, 0, NULL, 'LOCK', 'SUCCESS', 'Khóa tiền đơn hàng: ORD-20260612-18-DEPOSIT', 'LOCK-ORD-20260612-18-DEPOSIT', 'CONSTRUCTX_ESCROW', NULL, NULL, NULL, '2026-06-12 10:17:48.608634', NULL, NULL),
(23, 15, 5880000, 0, NULL, 'LOCK', 'SUCCESS', 'Khóa tiền đơn hàng: ORD-20260612-19-DEPOSIT', 'LOCK-ORD-20260612-19-DEPOSIT', 'CONSTRUCTX_ESCROW', NULL, NULL, NULL, '2026-06-12 10:44:03.844800', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `phone_number` varchar(50) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `role` enum('CUSTOMER','CONTRACTOR','ADMIN') NOT NULL DEFAULT 'CUSTOMER',
  `approval_status` enum('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  `active` bit(1) NOT NULL DEFAULT b'1',
  `created_at` datetime(6) DEFAULT current_timestamp(6),
  `updated_at` datetime(6) DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `full_name`, `phone_number`, `address`, `avatar_url`, `role`, `approval_status`, `active`, `created_at`, `updated_at`) VALUES
(1, 'admin@constructx.com', '$2a$10$TTdVjOHkiUCJLzac1ZaKgeJsCD/.c07ZzwmX4g8sObH0LOrbziusq', 'Admin Hệ Thống', '0912345678', NULL, NULL, 'ADMIN', 'APPROVED', b'1', '2026-06-11 10:59:43.041987', '2026-06-12 17:50:22.987738'),
(2, 'contractor1@gmail.com', '$2a$10$B0tBqPjy7j9MP/VlkEW46e6AD5v7eUZZwaLWZz2OJ0o70Sw0SKQxW', 'Xưởng Mộc ABC', '0988888881', NULL, NULL, 'CONTRACTOR', 'APPROVED', b'1', '2026-06-11 10:59:43.041987', '2026-06-11 10:59:43.041987'),
(3, 'contractor2@gmail.com', '$2a$10$B0tBqPjy7j9MP/VlkEW46e6AD5v7eUZZwaLWZz2OJ0o70Sw0SKQxW', 'Nội Thất Đức Duy', '0988888882', NULL, NULL, 'CONTRACTOR', 'APPROVED', b'1', '2026-06-11 10:59:43.041987', '2026-06-11 10:59:43.041987'),
(4, 'customer1@gmail.com', '$2a$10$B0tBqPjy7j9MP/VlkEW46e6AD5v7eUZZwaLWZz2OJ0o70Sw0SKQxW', 'Nguyễn Văn A', '0901234561', NULL, NULL, 'CUSTOMER', 'APPROVED', b'1', '2026-06-11 10:59:43.041987', '2026-06-11 10:59:43.041987'),
(5, 'customer2@gmail.com', '$2a$10$B0tBqPjy7j9MP/VlkEW46e6AD5v7eUZZwaLWZz2OJ0o70Sw0SKQxW', 'Trần Thị B', '0901234562', NULL, NULL, 'CUSTOMER', 'APPROVED', b'1', '2026-06-11 10:59:43.041987', '2026-06-11 10:59:43.041987'),
(6, 'customer3@gmail.com', '$2a$10$B0tBqPjy7j9MP/VlkEW46e6AD5v7eUZZwaLWZz2OJ0o70Sw0SKQxW', 'Lê Văn C', '0901234563', NULL, NULL, 'CUSTOMER', 'APPROVED', b'1', '2026-06-11 10:59:43.041987', '2026-06-11 10:59:43.041987'),
(7, 'khachhang1@test.com', '$2a$10$mJmtMGW4DiCLfiYMK7SH.e2YcsxGcVqX5cvS0TpUfZuqW7EuKTIee', 'Nguyễn Thị Lan', '0901234561', '123 Lê Lợi, Q.1, TP.HCM', NULL, 'CUSTOMER', 'APPROVED', b'1', '2026-06-11 06:44:26.234242', '2026-06-12 17:50:23.069774'),
(8, 'khachhang2@test.com', '$2a$10$SxHgxHwlJT35ICE98Tw.K.xvlLzsPUwBK7A2Q8ST2wLt1zNDEJNFm', 'Trần Văn Minh', '0901234562', '45 Nguyễn Huệ, Q.1, TP.HCM', NULL, 'CUSTOMER', 'APPROVED', b'1', '2026-06-11 06:44:26.312338', '2026-06-12 17:50:23.339757'),
(9, 'khachhang3@test.com', '$2a$10$1qq/t2CjRozfOiv7FCOgruGqcvn0/Bm/f6gHvwJNPv2WyXTIfg5u6', 'Phạm Thị Hoa', '0901234563', '88 Đinh Tiên Hoàng, Hà Nội', NULL, 'CUSTOMER', 'APPROVED', b'1', '2026-06-11 06:44:26.390590', '2026-06-12 17:50:23.756105'),
(10, 'nhathauchuyennghiep@test.com', '$2a$10$JEIHlyr6X9B3aljs.C1FIedYV3rdCTOABgACvykRx89kStXpiw8TK', 'Công ty Nội thất Minh Phú', '0912345671', '56 Hai Bà Trưng, TP.HCM', NULL, 'CONTRACTOR', 'APPROVED', b'1', '2026-06-11 06:44:26.484822', '2026-06-12 17:50:24.027715'),
(11, 'nhaxuong_abc@test.com', '$2a$10$kiDxmHJ/Gjh2nuD2nfkRp.CNMCqjI8.SrBexnFUHs2QA0pxCj5Bty', 'Xưởng Mộc ABC', '0912345672', '78 Trường Chinh, Hà Nội', NULL, 'CONTRACTOR', 'APPROVED', b'1', '2026-06-11 06:44:26.624319', '2026-06-12 17:50:24.188127'),
(12, 'noithat_vietlong@test.com', '$2a$10$DumOiZCudZPYUd5QM54zQuolKN9/Gp30TnU8pRO3/RfznNVAPPVy6', 'Nội thất Việt Long', '0912345673', '12 Cộng Hòa, Tân Bình, TP.HCM', NULL, 'CONTRACTOR', 'APPROVED', b'1', '2026-06-11 06:44:26.790588', '2026-06-12 17:50:24.266690'),
(13, 'contractor_pending@test.com', '$2a$10$u.3gshnRjVnwXxztBZ5zv.J8TVQVIkaZQso/Tw5HWAYLmc.0q5qu6', 'Nhà thầu Đăng Ký Mới', '0912345674', '99 Lý Thường Kiệt, TP.HCM', NULL, 'CONTRACTOR', 'APPROVED', b'1', '2026-06-11 06:44:26.959180', '2026-06-12 17:50:24.342901'),
(14, 'thuando@gmail.com', '$2a$10$TtnFbEK9EUM47pkvM0wPQeYVyk.2zQ/OZC.d5O0hm6dPyJCAfJC7a', 'a', '0987654321', NULL, NULL, 'CUSTOMER', 'APPROVED', b'1', '2026-06-11 06:46:11.950228', '2026-06-11 13:46:11.952330'),
(15, 'thuan.dokhanh04@gmail.com', '$2a$10$kuF9mC96UqOMgRJcunpwxe65OGUoi6PZwY6AitDxI7egPy4GMR9wW', 'a', '0987654321', NULL, NULL, 'CONTRACTOR', 'APPROVED', b'1', '2026-06-11 06:47:57.594635', '2026-06-11 13:48:15.975591'),
(16, 'hoang@gmail.com', '$2a$10$iXPe178bHmQ494vbXlf5N.7BJHbh0WFXZoqWrt6TPdxHlEkx7pflW', 'Nguyên Hoàng Dũng ', '099999999', NULL, NULL, 'CUSTOMER', 'APPROVED', b'1', '2026-06-12 10:16:24.071180', '2026-06-12 17:16:24.076442');

-- --------------------------------------------------------

--
-- Table structure for table `user_tokens`
--

CREATE TABLE `user_tokens` (
  `id` bigint(20) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `vnp_bank_code` varchar(20) DEFAULT NULL,
  `vnp_card_number` varchar(30) DEFAULT NULL,
  `vnp_token` varchar(150) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wallets`
--

CREATE TABLE `wallets` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `balance` bigint(20) NOT NULL DEFAULT 0,
  `locked_amount` bigint(20) NOT NULL DEFAULT 0,
  `updated_at` datetime(6) DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `wallets`
--

INSERT INTO `wallets` (`id`, `user_id`, `balance`, `locked_amount`, `updated_at`) VALUES
(1, 1, 0, 0, '2026-06-11 10:59:43.054460'),
(2, 2, 150000000, 0, '2026-06-11 10:59:43.054460'),
(3, 3, 80000000, 0, '2026-06-11 10:59:43.054460'),
(4, 4, 50000000, 0, '2026-06-11 10:59:43.054460'),
(5, 5, 30000000, 0, '2026-06-11 10:59:43.054460'),
(6, 6, 20000000, 0, '2026-06-11 10:59:43.054460'),
(7, 7, 50000000, 0, NULL),
(8, 8, 30000000, 0, NULL),
(9, 9, 20000000, 0, NULL),
(10, 10, 150000000, 0, NULL),
(11, 11, 80000000, 0, NULL),
(12, 12, 120000000, 0, NULL),
(13, 14, 90288891, 35160000, NULL),
(14, 15, 109600000, 600000, NULL),
(15, 16, 100000000, 11760000, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `work_milestones`
--

CREATE TABLE `work_milestones` (
  `id` bigint(20) NOT NULL,
  `amount` bigint(20) DEFAULT NULL,
  `deadline` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `progress_percent` int(11) DEFAULT NULL,
  `status` enum('PENDING','IN_PROGRESS','WAITING_CONFIRMATION','COMPLETED','REJECTED') DEFAULT NULL,
  `step_order` int(11) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `work_plan_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `work_plans`
--

CREATE TABLE `work_plans` (
  `id` bigint(20) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `status` enum('PENDING_APPROVAL','APPROVED','REVISION_REQUIRED') DEFAULT NULL,
  `contract_job_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bids`
--
ALTER TABLE `bids`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_project_contractor` (`project_id`,`contractor_id`),
  ADD KEY `fk_bid_contractor` (`contractor_id`);

--
-- Indexes for table `bid_details`
--
ALTER TABLE `bid_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK8482hebprndfrkm0rmp8asyvx` (`bid_id`);

--
-- Indexes for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_msg_room` (`room_id`);

--
-- Indexes for table `chat_rooms`
--
ALTER TABLE `chat_rooms`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `chat_room_members`
--
ALTER TABLE `chat_room_members`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKdvub8k7sypahkamqjaiokb44t` (`room_id`);

--
-- Indexes for table `construction_logs`
--
ALTER TABLE `construction_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKrmvjgli0aod5d0s4ebrer3in5` (`contract_id`),
  ADD KEY `FKqytcarl2ld4oocjxbqbaxs21m` (`contractor_id`);

--
-- Indexes for table `contractor_profiles`
--
ALTER TABLE `contractor_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_user_id` (`user_id`);

--
-- Indexes for table `contracts`
--
ALTER TABLE `contracts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_cg3nh00ennwk5b6it1efxwqqa` (`bid_id`),
  ADD UNIQUE KEY `UK_nbv5jhiblw69121gnrnm8tgw9` (`project_id`),
  ADD UNIQUE KEY `UK_bx9jyu2cccdntb3ehrf0ojpfd` (`contract_number`),
  ADD KEY `FKawu5vt7p47eer2jpdn9k2icb2` (`admin_id`),
  ADD KEY `FKe285wbos42v6rhaxv7gugpimi` (`client_id`),
  ADD KEY `FKf7p85d9kir2jb99ippss5s2h1` (`contractor_id`),
  ADD KEY `FK5yknvfmbs6bdjclgsgi0iv80k` (`order_id`);

--
-- Indexes for table `contract_jobs`
--
ALTER TABLE `contract_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_bid_id` (`bid_id`),
  ADD UNIQUE KEY `uk_project_id` (`project_id`),
  ADD KEY `fk_contract_customer` (`customer_id`),
  ADD KEY `fk_contract_contractor` (`contractor_id`);

--
-- Indexes for table `contract_stages`
--
ALTER TABLE `contract_stages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK8wb0qhuowfhwkklmo7acnwmfh` (`contract_id`);

--
-- Indexes for table `disbursement_requests`
--
ALTER TABLE `disbursement_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKdba6cjk6w2lkw7hvyxjtuonej` (`contract_id`),
  ADD KEY `FK5ymp671sj9xpmy04g2qacpk84` (`contractor_id`),
  ADD KEY `FKgt0ptrh4a7m56ko9goqvfmbv4` (`reviewed_by`);

--
-- Indexes for table `disputes`
--
ALTER TABLE `disputes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK1lwc0ndqd7yheurmc394ik080` (`contractor_id`),
  ADD KEY `FKrbd7ru76utd4uqya6dyjjhpws` (`customer_id`),
  ADD KEY `FKt9k296yc6dqsbc74t7ed0yefc` (`project_id`);

--
-- Indexes for table `dispute_messages`
--
ALTER TABLE `dispute_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK7w7adb3j48ka7vtvtevnghisp` (`dispute_id`);

--
-- Indexes for table `escrow_accounts`
--
ALTER TABLE `escrow_accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_contract_job_id` (`contract_job_id`);

--
-- Indexes for table `material_categories`
--
ALTER TABLE `material_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_name` (`name`);

--
-- Indexes for table `milestone_updates`
--
ALTER TABLE `milestone_updates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKamdiby7h1sse3pf387hjfncwm` (`milestone_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_notif_user` (`user_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_order_code` (`order_code`),
  ADD KEY `FK4c8nf729r7tl06ar10clpx64b` (`assigned_contractor_id`),
  ADD KEY `FKsjfs85qf6vmcurlx43cnc16gy` (`customer_id`);

--
-- Indexes for table `order_bids`
--
ALTER TABLE `order_bids`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_order_bids_order` (`order_id`),
  ADD KEY `fk_order_bids_contractor` (`contractor_id`);

--
-- Indexes for table `order_bid_items`
--
ALTER TABLE `order_bid_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKsx8kj2pi779bd7p4m6qs8x66p` (`order_bid_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_order_items_order` (`order_id`),
  ADD KEY `FKocimc7dtr037rh4ls4l95nlfi` (`product_id`);

--
-- Indexes for table `portfolio_items`
--
ALTER TABLE `portfolio_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK87ong43ngmg4haj497gaiwmga` (`contractor_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `project`
--
ALTER TABLE `project`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_project_user` (`user_id`),
  ADD KEY `fk_project_approved_by` (`approved_by`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_reviewer_ref` (`reviewer_id`,`reference_type`,`reference_id`),
  ADD UNIQUE KEY `UKcnvgpk1l29kfrbt6ocroiic7v` (`reviewer_id`,`reference_type`,`reference_id`),
  ADD KEY `FK1sjw2c8j34ew366vfqxergp0b` (`reviewee_id`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_setting_key` (`setting_key`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_tx_wallet` (`wallet_id`),
  ADD KEY `fk_tx_contract` (`contract_job_id`),
  ADD KEY `fk_tx_escrow` (`escrow_account_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_email` (`email`);

--
-- Indexes for table `user_tokens`
--
ALTER TABLE `user_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK61iiu6gfevpvo2v3yl76sar7r` (`user_id`);

--
-- Indexes for table `wallets`
--
ALTER TABLE `wallets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_user_id` (`user_id`);

--
-- Indexes for table `work_milestones`
--
ALTER TABLE `work_milestones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FKmkwmy00lx0wxt8skeub6rp105` (`work_plan_id`);

--
-- Indexes for table `work_plans`
--
ALTER TABLE `work_plans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UK_hndwcj6k3fvvhjdfy76vbnayl` (`contract_job_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bids`
--
ALTER TABLE `bids`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `bid_details`
--
ALTER TABLE `bid_details`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `chat_rooms`
--
ALTER TABLE `chat_rooms`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `chat_room_members`
--
ALTER TABLE `chat_room_members`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `construction_logs`
--
ALTER TABLE `construction_logs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `contractor_profiles`
--
ALTER TABLE `contractor_profiles`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `contracts`
--
ALTER TABLE `contracts`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `contract_jobs`
--
ALTER TABLE `contract_jobs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contract_stages`
--
ALTER TABLE `contract_stages`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `disbursement_requests`
--
ALTER TABLE `disbursement_requests`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `disputes`
--
ALTER TABLE `disputes`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `dispute_messages`
--
ALTER TABLE `dispute_messages`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `escrow_accounts`
--
ALTER TABLE `escrow_accounts`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `material_categories`
--
ALTER TABLE `material_categories`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `milestone_updates`
--
ALTER TABLE `milestone_updates`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=165;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `order_bids`
--
ALTER TABLE `order_bids`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `order_bid_items`
--
ALTER TABLE `order_bid_items`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `portfolio_items`
--
ALTER TABLE `portfolio_items`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `project`
--
ALTER TABLE `project`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `user_tokens`
--
ALTER TABLE `user_tokens`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wallets`
--
ALTER TABLE `wallets`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `work_milestones`
--
ALTER TABLE `work_milestones`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `work_plans`
--
ALTER TABLE `work_plans`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bids`
--
ALTER TABLE `bids`
  ADD CONSTRAINT `fk_bid_contractor` FOREIGN KEY (`contractor_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_bid_project` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `bid_details`
--
ALTER TABLE `bid_details`
  ADD CONSTRAINT `FK8482hebprndfrkm0rmp8asyvx` FOREIGN KEY (`bid_id`) REFERENCES `bids` (`id`);

--
-- Constraints for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD CONSTRAINT `fk_msg_room` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `chat_room_members`
--
ALTER TABLE `chat_room_members`
  ADD CONSTRAINT `FKdvub8k7sypahkamqjaiokb44t` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms` (`id`);

--
-- Constraints for table `construction_logs`
--
ALTER TABLE `construction_logs`
  ADD CONSTRAINT `FKqytcarl2ld4oocjxbqbaxs21m` FOREIGN KEY (`contractor_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKrmvjgli0aod5d0s4ebrer3in5` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`);

--
-- Constraints for table `contractor_profiles`
--
ALTER TABLE `contractor_profiles`
  ADD CONSTRAINT `fk_profile_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `contracts`
--
ALTER TABLE `contracts`
  ADD CONSTRAINT `FK5yknvfmbs6bdjclgsgi0iv80k` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `FKawu5vt7p47eer2jpdn9k2icb2` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKe285wbos42v6rhaxv7gugpimi` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKf7p85d9kir2jb99ippss5s2h1` FOREIGN KEY (`contractor_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKii6o75fi1fe4s3k9mquern0s3` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`),
  ADD CONSTRAINT `FKkg15ruhse8s2me89i7wcudg7i` FOREIGN KEY (`bid_id`) REFERENCES `bids` (`id`);

--
-- Constraints for table `contract_jobs`
--
ALTER TABLE `contract_jobs`
  ADD CONSTRAINT `fk_contract_bid` FOREIGN KEY (`bid_id`) REFERENCES `bids` (`id`),
  ADD CONSTRAINT `fk_contract_contractor` FOREIGN KEY (`contractor_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_contract_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_contract_project` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`);

--
-- Constraints for table `contract_stages`
--
ALTER TABLE `contract_stages`
  ADD CONSTRAINT `FK8wb0qhuowfhwkklmo7acnwmfh` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`);

--
-- Constraints for table `disbursement_requests`
--
ALTER TABLE `disbursement_requests`
  ADD CONSTRAINT `FK5ymp671sj9xpmy04g2qacpk84` FOREIGN KEY (`contractor_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKdba6cjk6w2lkw7hvyxjtuonej` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`),
  ADD CONSTRAINT `FKgt0ptrh4a7m56ko9goqvfmbv4` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `disputes`
--
ALTER TABLE `disputes`
  ADD CONSTRAINT `FK1lwc0ndqd7yheurmc394ik080` FOREIGN KEY (`contractor_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKrbd7ru76utd4uqya6dyjjhpws` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKt9k296yc6dqsbc74t7ed0yefc` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`);

--
-- Constraints for table `dispute_messages`
--
ALTER TABLE `dispute_messages`
  ADD CONSTRAINT `FK7w7adb3j48ka7vtvtevnghisp` FOREIGN KEY (`dispute_id`) REFERENCES `disputes` (`id`);

--
-- Constraints for table `escrow_accounts`
--
ALTER TABLE `escrow_accounts`
  ADD CONSTRAINT `fk_escrow_contract` FOREIGN KEY (`contract_job_id`) REFERENCES `contract_jobs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `milestone_updates`
--
ALTER TABLE `milestone_updates`
  ADD CONSTRAINT `FKamdiby7h1sse3pf387hjfncwm` FOREIGN KEY (`milestone_id`) REFERENCES `work_milestones` (`id`);

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `FK4c8nf729r7tl06ar10clpx64b` FOREIGN KEY (`assigned_contractor_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKsjfs85qf6vmcurlx43cnc16gy` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_orders_contractor` FOREIGN KEY (`assigned_contractor_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_orders_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `order_bids`
--
ALTER TABLE `order_bids`
  ADD CONSTRAINT `fk_order_bids_contractor` FOREIGN KEY (`contractor_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_order_bids_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_bid_items`
--
ALTER TABLE `order_bid_items`
  ADD CONSTRAINT `FKsx8kj2pi779bd7p4m6qs8x66p` FOREIGN KEY (`order_bid_id`) REFERENCES `order_bids` (`id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `FKocimc7dtr037rh4ls4l95nlfi` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `portfolio_items`
--
ALTER TABLE `portfolio_items`
  ADD CONSTRAINT `FK87ong43ngmg4haj497gaiwmga` FOREIGN KEY (`contractor_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `project`
--
ALTER TABLE `project`
  ADD CONSTRAINT `fk_project_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_project_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `FK1sjw2c8j34ew366vfqxergp0b` FOREIGN KEY (`reviewee_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKd1isgfajhtdl8mgg29up6mofi` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_review_reviewee` FOREIGN KEY (`reviewee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_review_reviewer` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `fk_tx_contract` FOREIGN KEY (`contract_job_id`) REFERENCES `contract_jobs` (`id`),
  ADD CONSTRAINT `fk_tx_escrow` FOREIGN KEY (`escrow_account_id`) REFERENCES `escrow_accounts` (`id`),
  ADD CONSTRAINT `fk_tx_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`);

--
-- Constraints for table `user_tokens`
--
ALTER TABLE `user_tokens`
  ADD CONSTRAINT `FK61iiu6gfevpvo2v3yl76sar7r` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `wallets`
--
ALTER TABLE `wallets`
  ADD CONSTRAINT `fk_wallet_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `work_milestones`
--
ALTER TABLE `work_milestones`
  ADD CONSTRAINT `FKmkwmy00lx0wxt8skeub6rp105` FOREIGN KEY (`work_plan_id`) REFERENCES `work_plans` (`id`);

--
-- Constraints for table `work_plans`
--
ALTER TABLE `work_plans`
  ADD CONSTRAINT `FK75m9ux81ur5fnt0x5huk68yfc` FOREIGN KEY (`contract_job_id`) REFERENCES `contract_jobs` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
