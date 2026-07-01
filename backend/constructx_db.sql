-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 01, 2026 at 12:16 PM
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
(6, 5, 15, 12000000, 20, 'Hoàn thiện đúng yêu cầu ', '', 0, NULL, 'ACCEPTED', '2026-06-12 06:38:39.248425', NULL, '2026-06-12 06:38:39.248425', '2026-06-12 13:38:50.971598'),
(7, 18, 15, 0, 12, 'adwwda', NULL, 0, NULL, 'PENDING', '2026-06-28 11:57:09.853128', NULL, '2026-06-28 11:57:09.853128', '2026-06-28 18:57:09.889085'),
(8, 19, 15, 12222220, 21, 'đă', NULL, 0, NULL, 'ACCEPTED', '2026-06-28 13:07:23.974613', NULL, '2026-06-28 13:07:23.974613', '2026-06-28 20:07:46.784622');

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
(3, 'Sản phẩm gỗ xoài xuất xư nam phi ', 'Bàn ăn cơm ', 1, '', 12000000, 'Khanh Thuan', 12000000, 6),
(4, NULL, 'Lắp tủ ', 1, NULL, 0, 'Hạng mục', 0, 7),
(5, NULL, 'Adw', 1, NULL, 12222220, 'Hạng mục', 12222220, 8);

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
(12, 3, 1, 'TEXT', 'Vui lòng cung cấp thêm thông tin chi tiết.', NULL, b'0', '2026-06-12 07:57:35.550733', NULL, NULL, NULL, NULL, NULL),
(13, 4, 1, 'TEXT', 'Vui lòng cung cấp thêm thông tin chi tiết.', NULL, b'0', '2026-06-12 11:39:40.652132', NULL, NULL, NULL, NULL, NULL),
(14, 4, 16, 'TEXT', 'Có thể gặp trực tiếp không?', NULL, b'0', '2026-06-12 11:39:43.341689', NULL, NULL, NULL, NULL, NULL),
(15, 4, 1, 'TEXT', 'Tôi đã nhận được yêu cầu, sẽ xem xét ngay.', NULL, b'0', '2026-06-12 11:39:45.389216', NULL, NULL, NULL, NULL, NULL),
(16, 4, 1, 'TEXT', 'Cảm ơn bạn đã liên hệ ConstructX!', NULL, b'0', '2026-06-12 11:39:45.981183', NULL, NULL, NULL, NULL, NULL),
(17, 5, 15, 'TEXT', 'Gửi báo giá chi tiết', NULL, b'0', '2026-06-17 08:42:26.249510', NULL, NULL, NULL, NULL, NULL),
(18, 5, 1, 'TEXT', 'Vui lòng cung cấp thêm thông tin chi tiết.', NULL, b'0', '2026-06-17 08:42:50.046913', NULL, NULL, NULL, NULL, NULL),
(19, 7, 14, 'TEXT', 'Gửi báo giá chi tiết', NULL, b'0', '2026-06-24 14:33:17.610307', NULL, NULL, NULL, NULL, NULL),
(20, 7, 1, 'TEXT', 'Vấn đề đã được ghi nhận và chuyển xử lý.', NULL, b'0', '2026-06-24 14:33:31.840818', NULL, NULL, NULL, NULL, NULL),
(21, 8, 1, 'TEXT', 'Tôi đã nhận được yêu cầu, sẽ xem xét ngay.', NULL, b'0', '2026-06-24 14:41:21.949902', NULL, NULL, NULL, NULL, NULL),
(22, 8, 14, 'TEXT', 'Bảo hành bao lâu?', NULL, b'0', '2026-06-24 14:41:27.965697', NULL, NULL, NULL, NULL, NULL),
(23, 8, 15, 'TEXT', 'Bảo hành bao lâu?', NULL, b'0', '2026-06-24 14:41:54.112991', NULL, NULL, NULL, NULL, NULL),
(24, 8, 15, 'TEXT', 'Có thể gặp trực tiếp không?', NULL, b'0', '2026-06-24 14:41:57.807853', NULL, NULL, NULL, NULL, NULL),
(25, 8, 14, 'TEXT', 'Gửi báo giá chi tiết', NULL, b'0', '2026-06-24 14:42:18.453498', NULL, NULL, NULL, NULL, NULL),
(26, 8, 14, 'TEXT', 'Có thể gặp trực tiếp không?', NULL, b'0', '2026-06-24 14:42:18.941291', NULL, NULL, NULL, NULL, NULL),
(27, 8, 14, 'TEXT', 'Bảo hành bao lâu?', NULL, b'0', '2026-06-24 14:42:19.428943', NULL, NULL, NULL, NULL, NULL),
(28, 8, 14, 'TEXT', 'Cho tôi xem portfolio', NULL, b'0', '2026-06-24 14:42:19.767982', NULL, NULL, NULL, NULL, NULL),
(29, 8, 15, 'TEXT', 'Bảo hành bao lâu?', NULL, b'0', '2026-06-24 14:42:24.515328', NULL, NULL, NULL, NULL, NULL),
(30, 8, 15, 'TEXT', 'Có thể gặp trực tiếp không?', NULL, b'0', '2026-06-24 14:42:24.836973', NULL, NULL, NULL, NULL, NULL),
(31, 8, 15, 'TEXT', 'Có thể gặp trực tiếp không?', NULL, b'0', '2026-06-24 14:42:25.083785', NULL, NULL, NULL, NULL, NULL),
(32, 8, 15, 'TEXT', 'Gửi báo giá chi tiết', NULL, b'0', '2026-06-24 14:42:25.445045', NULL, NULL, NULL, NULL, NULL),
(33, 8, 15, 'TEXT', 'Gửi báo giá chi tiết', NULL, b'0', '2026-06-24 14:42:25.664555', NULL, NULL, NULL, NULL, NULL),
(34, 8, 15, 'TEXT', 'Bảo hành bao lâu?', NULL, b'0', '2026-06-24 14:42:27.281057', NULL, NULL, NULL, NULL, NULL),
(35, 8, 15, 'TEXT', 'Cho tôi xem portfolio', NULL, b'0', '2026-06-24 14:42:27.698117', NULL, NULL, NULL, NULL, NULL),
(36, 8, 15, 'TEXT', 'Cho tôi xem portfolio', NULL, b'0', '2026-06-24 14:42:27.914233', NULL, NULL, NULL, NULL, NULL),
(37, 8, 15, 'TEXT', 'Cho tôi xem portfolio', NULL, b'0', '2026-06-24 14:42:28.088808', NULL, NULL, NULL, NULL, NULL),
(38, 8, 15, 'TEXT', 'adad', NULL, b'0', '2026-06-24 14:42:29.535241', NULL, NULL, NULL, NULL, NULL),
(39, 8, 15, 'TEXT', 'Bảo hành bao lâu?', NULL, b'0', '2026-06-24 14:42:30.873241', NULL, NULL, NULL, NULL, NULL),
(40, 8, 15, 'TEXT', 'Bảo hành bao lâu?', NULL, b'0', '2026-06-24 14:42:31.065173', NULL, NULL, NULL, NULL, NULL),
(41, 8, 15, 'TEXT', 'Bảo hành bao lâu?', NULL, b'0', '2026-06-24 14:42:31.312079', NULL, NULL, NULL, NULL, NULL),
(42, 8, 15, 'TEXT', 'Bảo hành bao lâu?', NULL, b'0', '2026-06-24 14:42:31.480806', NULL, NULL, NULL, NULL, NULL),
(43, 8, 15, 'TEXT', 'Bảo hành bao lâu?', NULL, b'0', '2026-06-24 14:42:31.706048', NULL, NULL, NULL, NULL, NULL),
(44, 8, 15, 'TEXT', 'Bảo hành bao lâu?', NULL, b'0', '2026-06-24 14:42:31.882958', NULL, NULL, NULL, NULL, NULL),
(45, 8, 15, 'TEXT', 'Có thể gặp trực tiếp không?', NULL, b'0', '2026-06-24 14:42:32.095435', NULL, NULL, NULL, NULL, NULL),
(46, 8, 15, 'TEXT', 'Có thể gặp trực tiếp không?', NULL, b'0', '2026-06-24 14:42:32.383710', NULL, NULL, NULL, NULL, NULL),
(47, 8, 15, 'TEXT', 'Có thể gặp trực tiếp không?', NULL, b'0', '2026-06-24 14:42:32.592420', NULL, NULL, NULL, NULL, NULL),
(48, 8, 15, 'TEXT', 'Có thể gặp trực tiếp không?', NULL, b'0', '2026-06-24 14:42:37.165816', NULL, NULL, NULL, NULL, NULL),
(49, 8, 15, 'TEXT', 'Có thể gặp trực tiếp không?', NULL, b'0', '2026-06-24 14:42:37.332567', NULL, NULL, NULL, NULL, NULL),
(50, 8, 15, 'TEXT', 'Có thể gặp trực tiếp không?', NULL, b'0', '2026-06-24 14:42:37.517346', NULL, NULL, NULL, NULL, NULL),
(51, 8, 15, 'TEXT', 'Có thể gặp trực tiếp không?', NULL, b'0', '2026-06-24 14:42:43.642857', NULL, NULL, NULL, NULL, NULL),
(52, 8, 15, 'TEXT', 'Có thể gặp trực tiếp không?', NULL, b'0', '2026-06-24 14:42:43.832299', NULL, NULL, NULL, NULL, NULL),
(53, 8, 15, 'TEXT', 'Có thể gặp trực tiếp không?', NULL, b'0', '2026-06-24 14:42:44.010863', NULL, NULL, NULL, NULL, NULL),
(54, 8, 15, 'TEXT', 'Gửi báo giá chi tiết', NULL, b'0', '2026-06-24 14:42:44.762236', NULL, NULL, NULL, NULL, NULL),
(55, 8, 15, 'TEXT', 'Gửi báo giá chi tiết', NULL, b'0', '2026-06-24 14:42:44.978377', NULL, NULL, NULL, NULL, NULL),
(56, 8, 15, 'TEXT', 'Bảo hành bao lâu?', NULL, b'0', '2026-06-24 14:42:45.292235', NULL, NULL, NULL, NULL, NULL),
(57, 8, 14, 'TEXT', 'Bảo hành bao lâu?', NULL, b'0', '2026-06-24 14:42:55.329973', NULL, NULL, NULL, NULL, NULL),
(58, 8, 14, 'TEXT', 'Bảo hành bao lâu?', NULL, b'0', '2026-06-24 14:46:20.728353', NULL, NULL, NULL, NULL, NULL),
(59, 9, 14, 'TEXT', 'Cho tôi xem portfolio', NULL, b'0', '2026-06-25 14:33:28.504648', NULL, NULL, NULL, NULL, NULL),
(60, 9, 15, 'TEXT', 'Có thể gặp trực tiếp không?', NULL, b'0', '2026-06-25 14:33:33.999694', NULL, NULL, NULL, NULL, NULL),
(61, 9, 1, 'TEXT', 'Vấn đề đã được ghi nhận và chuyển xử lý.', NULL, b'0', '2026-06-25 14:33:41.969344', NULL, NULL, NULL, NULL, NULL),
(62, 10, 1, 'TEXT', 'chia 23', NULL, b'0', '2026-06-26 16:28:50.384505', NULL, NULL, NULL, NULL, NULL),
(63, 10, 14, 'TEXT', 'Bảo hành bao lâu?', NULL, b'0', '2026-06-27 07:57:19.360174', NULL, NULL, NULL, NULL, NULL),
(64, 10, 14, 'TEXT', 'Có thể gặp trực tiếp không?', NULL, b'0', '2026-06-27 07:57:19.817756', NULL, NULL, NULL, NULL, NULL),
(65, 10, 1, 'TEXT', 'adwd', NULL, b'0', '2026-06-27 08:04:34.523757', NULL, NULL, NULL, NULL, NULL),
(66, 10, 14, 'TEXT', 'Gửi báo giá chi tiết', NULL, b'0', '2026-06-27 08:04:48.384791', NULL, NULL, NULL, NULL, NULL),
(67, 10, 1, 'TEXT', 'adw', NULL, b'0', '2026-06-27 08:55:52.692966', NULL, NULL, NULL, NULL, NULL),
(68, 10, 14, 'TEXT', 'Bảo hành bao lâu?', NULL, b'0', '2026-06-27 08:56:10.426414', NULL, NULL, NULL, NULL, NULL),
(69, 10, 14, 'TEXT', 'Có thể gặp trực tiếp không?', NULL, b'0', '2026-06-27 08:56:10.952877', NULL, NULL, NULL, NULL, NULL),
(70, 10, 14, 'TEXT', 'Gửi báo giá chi tiết', NULL, b'0', '2026-06-27 08:56:12.831411', NULL, NULL, NULL, NULL, NULL),
(71, 10, 1, 'TEXT', 'ad', NULL, b'0', '2026-06-27 08:56:17.227875', NULL, NULL, NULL, NULL, NULL);

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
(3, 'SUPPORT', NULL, NULL, 'Hỗ trợ: a', b'0', '2026-06-11 06:55:52.954588', '2026-06-12 07:57:35.552718'),
(4, 'SUPPORT', NULL, NULL, 'Hỗ trợ: a', b'0', '2026-06-12 11:39:28.293001', '2026-06-12 11:39:45.982183'),
(5, 'DISPUTE', 'CONTRACT', NULL, '⚖️ Tranh chấp: Cồng trình chậm tiến độ ', b'0', '2026-06-17 08:42:22.470927', '2026-06-17 08:42:50.048422'),
(7, 'SUPPORT', NULL, NULL, 'Hỗ trợ: Hổ trợ', b'0', '2026-06-24 14:33:13.138374', '2026-06-24 14:33:31.842818'),
(8, 'DISPUTE', 'CONTRACT', 6, '⚖️ Tranh chấp HĐ #CTR-ORD-20260624213537-27', b'0', '2026-06-24 14:40:55.150028', '2026-06-24 14:46:20.731616'),
(9, 'DISPUTE', 'CONTRACT', 8, '⚖️ Tranh chấp HĐ #CTR-ORD-20260625213226-29', b'0', '2026-06-25 14:33:21.415851', '2026-06-25 14:33:41.974621'),
(10, 'DISPUTE', 'CONTRACT', 10, '⚖️ Tranh chấp HĐ #CTR-ORD-20260626213544-32', b'0', '2026-06-26 14:44:46.178091', '2026-06-27 08:56:17.239066'),
(11, 'DISPUTE', 'CONTRACT', 12, '⚖️ Tranh chấp HĐ #CTR-ORD-20260627172807-35', b'0', '2026-06-27 10:29:27.974959', '2026-06-27 10:29:27.974959'),
(12, 'DISPUTE', 'CONTRACT', 14, '⚖️ Tranh chấp HĐ #CTR-20260628200746-8', b'0', '2026-06-28 13:14:24.317669', '2026-06-28 13:14:24.317669');

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
(1, '2026-06-11 06:55:52.965851', '2026-06-24 14:46:18.065359', 6, 'CUSTOMER', 14, 3),
(2, '2026-06-11 06:55:52.968408', '2026-06-12 07:57:35.571705', 12, 'ADMIN', 1, 3),
(3, '2026-06-12 11:39:28.318352', '2026-06-12 11:39:46.002725', 16, 'CUSTOMER', 16, 4),
(4, '2026-06-12 11:39:28.321362', '2026-06-12 11:39:46.002725', 16, 'ADMIN', 1, 4),
(5, '2026-06-17 08:42:22.495317', '2026-06-30 04:31:49.751913', 17, 'CONTRACTOR', 15, 5),
(6, '2026-06-17 08:42:22.498016', '2026-06-30 04:26:14.250352', 17, 'ADMIN', 1, 5),
(9, '2026-06-24 14:33:13.152921', '2026-06-24 14:46:17.716583', 19, 'CUSTOMER', 14, 7),
(10, '2026-06-24 14:33:13.154999', '2026-06-30 04:26:13.455079', 19, 'ADMIN', 1, 7),
(11, '2026-06-24 14:40:55.157784', '2026-06-30 04:25:17.684217', 21, 'CUSTOMER', 14, 8),
(12, '2026-06-24 14:40:55.160317', '2026-06-30 04:31:48.969299', 21, 'CONTRACTOR', 15, 8),
(13, '2026-06-24 14:40:55.160317', '2026-06-25 14:44:17.718421', 21, 'ADMIN', 1, 8),
(14, '2026-06-25 14:33:21.423406', '2026-06-30 04:25:14.841883', 59, 'CUSTOMER', 14, 9),
(15, '2026-06-25 14:33:21.426392', '2026-06-25 14:33:42.035179', 61, 'CONTRACTOR', 15, 9),
(16, '2026-06-25 14:33:21.426392', '2026-06-25 14:44:16.709178', 59, 'ADMIN', 1, 9),
(17, '2026-06-26 14:44:46.198450', '2026-06-30 04:25:14.458819', 62, 'CUSTOMER', 14, 10),
(18, '2026-06-26 14:44:46.201184', NULL, NULL, 'CONTRACTOR', 15, 10),
(19, '2026-06-26 14:44:46.201184', NULL, NULL, 'ADMIN', 1, 10),
(20, '2026-06-27 10:29:27.987500', NULL, NULL, 'CUSTOMER', 14, 11),
(21, '2026-06-27 10:29:27.987500', NULL, NULL, 'CONTRACTOR', 15, 11),
(22, '2026-06-27 10:29:27.988473', NULL, NULL, 'ADMIN', 1, 11),
(23, '2026-06-28 13:14:24.328332', NULL, NULL, 'CUSTOMER', 14, 12),
(24, '2026-06-28 13:14:24.331316', NULL, NULL, 'CONTRACTOR', 15, 12),
(25, '2026-06-28 13:14:24.331316', NULL, NULL, 'ADMIN', 1, 12);

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
(4, '2026-06-12 08:45:48.264158', 'ad', '[]', NULL, 100, 1, 15),
(5, '2026-06-12 11:59:34.529688', 'a', '[]', NULL, 20, 3, 15),
(6, '2026-06-12 16:13:38.514143', 'a', '[]', 'Thi công phần thô', 20, 3, 15),
(7, '2026-06-12 16:14:00.096423', 'a', '[]', 'Hoàn thiện', 50, 3, 15),
(8, '2026-06-12 16:21:47.498085', 'a2qdsdad', '[]', 'Bàn giao công trình', 100, 3, 15),
(9, '2026-06-17 08:37:04.495957', 'Bàn giao ', '[]', 'Bàn giao công trình', 100, 4, 15),
(10, '2026-06-17 08:46:27.594162', 'Hoàn thiện ', '[]', NULL, 100, 5, 15),
(11, '2026-06-24 14:55:23.391237', 'a', '[]', 'Bàn giao công trình', 100, 6, 15),
(12, '2026-06-25 13:55:42.030301', 'Đã Hoàn thành \n', '[]', 'Bàn giao công trình', 100, 7, 15),
(13, '2026-06-26 14:15:57.567786', 'a', '[]', 'Hoàn thiện', 100, 8, 15),
(14, '2026-06-26 14:40:01.526165', 'a', '[]', 'Thi công phần thô', 50, 10, 15),
(15, '2026-06-26 16:31:32.725338', 'lắp ráp', '[]', NULL, 100, 11, 15),
(16, '2026-06-27 11:01:49.239707', 'a', '[]', 'Bàn giao công trình', 100, 9, 15),
(17, '2026-06-28 12:24:48.799395', 'a', '[]', 'Thi công phần thô', 50, 13, 15),
(18, '2026-06-28 12:27:00.376122', '1', '[]', 'Bàn giao công trình', 100, 13, 15),
(19, '2026-06-28 13:08:23.223236', 'adw', '[]', 'Thi công phần thô', 50, 14, 15),
(20, '2026-06-28 13:13:10.923469', 'a', '[]', NULL, 100, 14, 15);

-- --------------------------------------------------------

--
-- Table structure for table `contractor_profiles`
--

CREATE TABLE `contractor_profiles` (
  `id` bigint(20) NOT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `year_established` int(11) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone_number` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `short_intro` varchar(1000) DEFAULT NULL,
  `design_interior` tinyint(1) DEFAULT 0,
  `construct_interior` tinyint(1) DEFAULT 0,
  `produce_wood` tinyint(1) DEFAULT 0,
  `renovate_house` tinyint(1) DEFAULT 0,
  `experience_years` int(11) DEFAULT 0,
  `completed_projects_count` int(11) DEFAULT 0,
  `rating` double DEFAULT 5,
  `customer_count` varchar(50) DEFAULT '0+',
  `warranty_24_months` tinyint(1) DEFAULT 0,
  `free_quote` tinyint(1) DEFAULT 0,
  `on_time_progress` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `contractor_profiles`
--

INSERT INTO `contractor_profiles` (`id`, `company_name`, `logo_url`, `avatar_url`, `year_established`, `address`, `phone_number`, `email`, `short_intro`, `design_interior`, `construct_interior`, `produce_wood`, `renovate_house`, `experience_years`, `completed_projects_count`, `rating`, `customer_count`, `warranty_24_months`, `free_quote`, `on_time_progress`) VALUES
(15, 'Khánh THuan simple ', 'https://res.cloudinary.com/dtufvt361/image/upload/v1782656986/gxxysmnrto2fxh4zedpb.jpg', 'https://res.cloudinary.com/dtufvt361/image/upload/v1782656987/cal4nx4np4ebpdpmkjb7.jpg', 2020, 'Hồ Chi Minh', '0987654321', 'thuan.dokhanh04@gmail.com', 'react-dom_client.js?v=97887653:14338 Download the React DevTools for a better development experience: https:/', 1, 1, 1, 1, 5, 100, 5, '100+', 1, 1, 1),
(18, 'Nội thất xinh ', 'https://res.cloudinary.com/dtufvt361/image/upload/v1782656591/jjrbinzz4ejtxzsd7lge.jpg', 'https://res.cloudinary.com/dtufvt361/image/upload/v1782656592/p70g2u0xmeutgqin0xvg.jpg', 2020, 'adw', '098744231', 'thuan@gmail.com', 'Địa chỉ\nChi nhánh\nWebsite\nEmail\nSố điện thoại\nNgười đại diện\nGiấy phép kinh doanh\n\nVí dụ\n\nTên công ty:\nCông ty TNHH Xây Dựng ABC\n\nThành lập:\n2018\n', 1, 0, 0, 0, 5, 100, 5, '100+', 1, 1, 1);

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
  `bid_id` bigint(20) DEFAULT NULL,
  `client_id` bigint(20) NOT NULL,
  `contractor_id` bigint(20) NOT NULL,
  `project_id` bigint(20) DEFAULT NULL,
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
  `order_id` bigint(20) DEFAULT NULL,
  `warranty_end_date` datetime(6) DEFAULT NULL,
  `warranty_hold_amount` bigint(20) DEFAULT NULL,
  `warranty_hold_locked` bit(1) DEFAULT NULL,
  `warranty_released` bit(1) DEFAULT NULL,
  `is_disputed` bit(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contracts`
--

INSERT INTO `contracts` (`id`, `admin_note`, `agreed_price`, `approved_at`, `contract_number`, `created_at`, `estimated_days`, `status`, `terms`, `updated_at`, `admin_id`, `bid_id`, `client_id`, `contractor_id`, `project_id`, `cancel_reason`, `cancelled_at`, `cancelled_by`, `client_signed`, `client_signed_at`, `contractor_deposit_amount`, `contractor_deposit_locked`, `contractor_deposit_percent`, `contractor_reputation_score`, `contractor_signed`, `contractor_signed_at`, `customer_deposit_amount`, `customer_deposit_locked`, `customer_deposit_percent`, `original_agreed_price`, `client_confirmed_completion`, `completed_at`, `completion_note`, `contractor_completion_at`, `contractor_completion_requested`, `order_id`, `warranty_end_date`, `warranty_hold_amount`, `warranty_hold_locked`, `warranty_released`, `is_disputed`) VALUES
(1, '', 12000000, '2026-06-12 06:39:31.616011', 'CTR-20260612133850-6', '2026-06-12 06:38:50.983580', 20, 'COMPLETED', 'HOP DONG THI CONG\nDu an: Bàn ăn Cơm\nGia tri: 12.000.000 VND\nThoi gian thi cong: 20 ngay\nPham vi cong viec: --- SẢN PHẨM MẪU YÊU CẦU ---\n• Sofa da thật nhập khẩu Ý (x1)\n• Đèn thả trần mây đan (x1)\n\n--- YÊU CẦU RIÊNG ---\nSòa\nDieu kien thanh toan: Theo thoa thuan\n', '2026-06-12 15:25:56.161621', 1, 6, 14, 15, 5, NULL, NULL, NULL, b'1', '2026-06-12 06:42:16.841806', 600000, b'0', 5, 100, b'1', '2026-06-12 06:42:36.137340', 1200000, b'0', 10, 12000000, NULL, '2026-06-12 15:25:45.566936', NULL, NULL, NULL, NULL, '2026-12-12 15:25:45.566936', 600000, b'0', b'1', b'0'),
(2, '', 22222222, '2026-06-12 15:21:17.440361', 'CTR-ORD-20260612184313-20', '2026-06-12 11:43:13.040486', 12, 'WAITING_SIGNATURE', 'HOP DONG CUNG UNG SAN PHAM / THI CONG NOI THAT\n\nLoai don: San pham tuy chinh\nMa don hang: ORD-20260612-20\n\nDanh sach san pham:\n- Tủ đôi (120×50cm) × 1\n\nGia tri hop dong: 22 trieu d\nThoi gian thuc hien: 12 ngay\nDia chi giao hang: a\n\nYeu cau cu the:\nTHIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khối\n\nBOM:\n  - Tấm gỗ MDF 18mm: 4 tấm\n  - Bản lề giảm chấn: 4 cái\n  - Tay nắm tủ: 2 cái\n\nDieu kien thanh toan: Theo quy dinh san ConstructX.\nBao hanh: a\n', '2026-06-12 15:21:40.809345', 1, NULL, 16, 15, NULL, NULL, NULL, NULL, b'1', '2026-06-12 15:21:40.790057', 1111111, b'0', 5, 100, b'0', NULL, 0, b'0', 10, 22222222, NULL, NULL, NULL, NULL, NULL, 20, NULL, NULL, NULL, NULL, b'0'),
(3, '', 22222222, '2026-06-12 11:58:09.862046', 'CTR-ORD-20260612184928-24', '2026-06-12 11:49:28.475148', 2, 'COMPLETED', 'HOP DONG CUNG UNG SAN PHAM / THI CONG NOI THAT\n\nLoai don: San pham co san\nMa don hang: ORD-20260612-24\n\nDanh sach san pham:\n- Sofa da thật nhập khẩu Ý × 1\n\nGia tri hop dong: 22 trieu d\nThoi gian thuc hien: 2 ngay\nDia chi giao hang: a\n\nYeu cau cu the:\n\n\nDieu kien thanh toan: Theo quy dinh san ConstructX.\nBao hanh: gỗ keo\n', '2026-06-24 15:17:12.077050', 1, NULL, 16, 15, NULL, NULL, NULL, NULL, b'1', '2026-06-12 11:58:52.199900', 1111111, b'0', 5, 100, b'1', '2026-06-12 11:58:32.123331', 0, b'0', 10, 22222222, NULL, '2026-06-12 16:24:27.887649', NULL, NULL, NULL, 24, '2026-12-12 16:24:27.887649', 1111111, b'0', b'1', b'0'),
(4, '', 1999998, '2026-06-17 08:35:24.413482', 'CTR-ORD-20260617153438-26', '2026-06-17 08:34:38.523611', 24, 'COMPLETED', 'HOP DONG CUNG UNG SAN PHAM / THI CONG NOI THAT\n\nLoai don: San pham co san\nMa don hang: ORD-20260617-26\n\nDanh sach san pham:\n- Sofa góc L hiện đại × 1\n\nGia tri hop dong: 2 trieu d\nThoi gian thuc hien: 24 ngay\nDia chi giao hang: Trần não\n\nYeu cau cu the:\n\n\nDieu kien thanh toan: Theo quy dinh san ConstructX.\nBao hanh: Gỗ Xoài\n', '2026-06-24 15:17:00.649384', 1, NULL, 14, 15, NULL, NULL, NULL, NULL, b'1', '2026-06-17 08:35:40.965093', 100000, b'0', 5, 100, b'1', '2026-06-17 08:35:34.654052', 0, b'0', 100, 1999998, b'0', '2026-06-17 08:38:39.965494', NULL, NULL, NULL, 26, '2026-12-17 08:38:39.965494', 100000, b'0', b'1', b'0'),
(5, '', 4000000, '2026-06-17 08:45:26.320001', 'CTR-ORD-20260617154516-25', '2026-06-17 08:45:16.104239', 99, 'COMPLETED', 'HOP DONG CUNG UNG SAN PHAM / THI CONG NOI THAT\n\nLoai don: San pham tuy chinh\nMa don hang: ORD-20260617-25\n\nDanh sach san pham:\n- Tủ đôi (120×50cm) × 1\n- Kệ mở (80×30cm) × 1\n- Tủ đôi (120×50cm) × 1\n\nGia tri hop dong: 4 trieu d\nThoi gian thuc hien: 99 ngay\nDia chi giao hang: 53 Trần Não\n\nYeu cau cu the:\nTHIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khối\n• Kệ mở (80×30cm) × 1 khối\n• Tủ đôi (120×50cm) × 1 khối\n\nBOM:\n  - Tấm gỗ MDF 18mm: 9 tấm\n  - Bản lề giảm chấn: 8 cái\n  - Tay nắm tủ: 4 cái\n  - Thanh đỡ kệ: 4 cái\n\nDieu kien thanh toan: Theo quy dinh san ConstructX.\nBao hanh: Dă\n', '2026-06-24 15:16:56.094459', 1, NULL, 14, 15, NULL, NULL, NULL, NULL, b'1', '2026-06-17 08:45:54.579624', 200000, b'0', 5, 100, b'1', '2026-06-17 08:46:11.100580', 0, b'0', 100, 4000000, b'0', '2026-06-24 13:38:24.402358', NULL, NULL, NULL, 25, '2026-12-24 13:38:24.402358', 200000, b'0', b'1', b'0'),
(6, '', 22222222, '2026-06-24 14:36:07.656123', 'CTR-ORD-20260624213537-27', '2026-06-24 14:35:37.708376', 12, 'ACTIVE', 'HOP DONG CUNG UNG SAN PHAM / THI CONG NOI THAT\n\nLoai don: San pham co san\nMa don hang: ORD-20260624-27\n\nDanh sach san pham:\n- Sofa da thật nhập khẩu Ý × 1\n\nGia tri hop dong: 22 trieu d\nThoi gian thuc hien: 12 ngay\nDia chi giao hang: a\n\nYeu cau cu the:\n\n\nDieu kien thanh toan: Theo quy dinh san ConstructX.\nBao hanh: adawda\n', '2026-06-24 14:40:55.169401', 1, NULL, 14, 15, NULL, NULL, NULL, NULL, b'1', '2026-06-24 14:36:14.960446', 1111111, b'1', 5, 100, b'1', '2026-06-24 14:36:19.454727', 0, b'0', 100, 22222222, b'0', NULL, NULL, NULL, NULL, 27, NULL, NULL, b'0', b'0', b'1'),
(7, '', 2222222, '2026-06-25 13:54:58.506643', 'CTR-ORD-20260625205425-28', '2026-06-25 13:54:25.640254', 21, 'COMPLETED', 'HOP DONG CUNG UNG SAN PHAM / THI CONG NOI THAT\n\nLoai don: San pham co san\nMa don hang: ORD-20260625-28\n\nDanh sach san pham:\n- Sofa văng 3 chỗ Scandinavian × 1\n\nGia tri hop dong: 2 trieu d\nThoi gian thuc hien: 21 ngay\nDia chi giao hang: 121\n\nYeu cau cu the:\n\n\nDieu kien thanh toan: Theo quy dinh san ConstructX.\nBao hanh: gỗ \n', '2026-06-25 14:01:21.425644', 1, NULL, 14, 15, NULL, NULL, NULL, NULL, b'1', '2026-06-25 13:55:12.120429', 111111, b'0', 5, 100, b'1', '2026-06-25 13:55:07.294298', 0, b'0', 100, 2222222, b'0', '2026-06-25 13:58:53.515984', NULL, NULL, NULL, 28, '2026-12-25 13:58:53.515984', 111111, b'0', b'1', b'0'),
(8, '', 20000000, '2026-06-25 14:32:44.714367', 'CTR-ORD-20260625213226-29', '2026-06-25 14:32:26.151860', 15, 'ACTIVE', 'HOP DONG CUNG UNG SAN PHAM / THI CONG NOI THAT\n\nLoai don: San pham co san\nMa don hang: ORD-20260625-29\n\nDanh sach san pham:\n- Sofa da thật nhập khẩu Ý × 1\n\nGia tri hop dong: 20 trieu d\nThoi gian thuc hien: 15 ngay\nDia chi giao hang: dâd\n\nYeu cau cu the:\n\n\nDieu kien thanh toan: Theo quy dinh san ConstructX.\nBao hanh: â\n', '2026-06-27 08:05:25.520785', 1, NULL, 14, 15, NULL, NULL, NULL, NULL, b'1', '2026-06-25 14:32:57.694825', 1000000, b'1', 5, 100, b'1', '2026-06-25 14:32:50.872199', 0, b'0', 100, 20000000, b'0', NULL, NULL, NULL, NULL, 29, NULL, NULL, b'0', b'0', b'0'),
(9, '', 2222222, '2026-06-26 14:26:19.368664', 'CTR-ORD-20260626212604-11', '2026-06-26 14:26:04.667177', 23, 'ACTIVE', 'HOP DONG CUNG UNG SAN PHAM / THI CONG NOI THAT\n\nLoai don: San pham tuy chinh\nMa don hang: ORD-20260611-11\n\nDanh sach san pham:\n- Tủ đôi (120×50cm) × 1\n\nGia tri hop dong: 2 trieu d\nThoi gian thuc hien: 23 ngay\nDia chi giao hang: Hồ chí Minh\n\nYeu cau cu the:\nTHIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khối\n\nBOM:\n  - Tấm gỗ MDF 18mm: 4 tấm\n  - Bản lề giảm chấn: 4 cái\n  - Tay nắm tủ: 2 cái\n\nDieu kien thanh toan: Theo quy dinh san ConstructX.\nBao hanh: a\n', '2026-06-26 14:39:19.821386', 1, NULL, 14, 15, NULL, NULL, NULL, NULL, b'1', '2026-06-26 14:28:52.181067', 111111, b'1', 5, 100, b'1', '2026-06-26 14:39:19.794213', 0, b'0', 100, 2222222, b'0', NULL, NULL, NULL, NULL, 11, NULL, NULL, b'0', b'0', b'0'),
(10, '', 25000000, '2026-06-26 14:35:54.834488', 'CTR-ORD-20260626213544-32', '2026-06-26 14:35:44.445960', 15, 'ACTIVE', 'HOP DONG CUNG UNG SAN PHAM / THI CONG NOI THAT\n\nLoai don: San pham tuy chinh\nMa don hang: ORD-20260626-32\n\nDanh sach san pham:\n- Bàn ăn cơm  × 1\n\nGia tri hop dong: 25 trieu d\nThoi gian thuc hien: 15 ngay\nDia chi giao hang: Hồ Chí Minh\n\nYeu cau cu the:\nChâu Ă\n\nDieu kien thanh toan: Theo quy dinh san ConstructX.\nBao hanh: Bàn \n', '2026-06-27 07:58:12.587235', 1, NULL, 14, 15, NULL, NULL, NULL, NULL, b'1', '2026-06-26 14:36:11.777258', 1250000, b'1', 5, 100, b'1', '2026-06-26 14:38:57.207938', 0, b'0', 100, 25000000, b'0', NULL, NULL, NULL, NULL, 32, NULL, NULL, b'0', b'0', b'0'),
(11, '', 2222222, '2026-06-26 16:30:36.247605', 'CTR-ORD-20260626233019-33', '2026-06-26 16:30:19.007507', 21, 'COMPLETED', 'HOP DONG CUNG UNG SAN PHAM / THI CONG NOI THAT\n\nLoai don: San pham tuy chinh\nMa don hang: ORD-20260626-33\n\nDanh sach san pham:\n- Tủ đôi (120×50cm) × 1\n\nGia tri hop dong: 2 trieu d\nThoi gian thuc hien: 21 ngay\nDia chi giao hang: Khánh THuận\n\nYeu cau cu the:\nTHIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khối\n\nBOM:\n  - Tấm gỗ MDF 18mm: 4 tấm\n  - Bản lề giảm chấn: 4 cái\n  - Tay nắm tủ: 2 cái\n\nDieu kien thanh toan: Theo quy dinh san ConstructX.\nBao hanh: a\n', '2026-06-26 16:33:04.883517', 1, NULL, 14, 15, NULL, NULL, NULL, NULL, b'1', '2026-06-26 16:30:57.827515', 111111, b'0', 5, 100, b'1', '2026-06-26 16:31:10.410695', 0, b'0', 100, 2222222, b'0', '2026-06-26 16:33:04.864939', NULL, NULL, NULL, 33, '2026-12-26 16:33:04.864939', 111111, b'1', b'0', b'0'),
(12, '', 11111111, '2026-06-27 10:28:16.731798', 'CTR-ORD-20260627172807-35', '2026-06-27 10:28:07.395651', 21, 'ACTIVE', 'HOP DONG CUNG UNG SAN PHAM / THI CONG NOI THAT\n\nLoai don: San pham tuy chinh\nMa don hang: ORD-20260627-35\n\nDanh sach san pham:\n- Tủ đơn (60×50cm) × 1\n- Hộc kéo 3 tầng (40×50cm) × 1\n\nGia tri hop dong: 11 trieu d\nThoi gian thuc hien: 21 ngay\nDia chi giao hang: a\n\nYeu cau cu the:\nTHIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối\n• Hộc kéo 3 tầng (40×50cm) × 1 khối\n\nBOM:\n  - Tấm gỗ MDF 18mm: 4 tấm\n  - Bản lề giảm chấn: 2 cái\n  - Tay nắm tủ: 1 cái\n  - Ray trượt hộc kéo: 3 bộ\n  - Tay nắm: 3 cái\n\nDieu kien thanh toan: Theo quy dinh san ConstructX.\nBao hanh: a\n', '2026-06-27 11:02:55.583447', 1, NULL, 14, 15, NULL, NULL, NULL, NULL, b'1', '2026-06-27 10:28:32.774696', 555556, b'1', 5, 100, b'1', '2026-06-27 10:28:22.839122', 0, b'0', 100, 11111111, b'0', NULL, NULL, NULL, NULL, 35, NULL, NULL, b'0', b'0', b'0'),
(13, NULL, 2112321, '2026-06-28 11:22:41.126663', 'CTR-ORD-20260628182241-42', '2026-06-28 11:22:41.128526', 21, 'ACTIVE', 'HOP DONG CUNG UNG SAN PHAM / THI CONG NOI THAT\n\nLoai don: San pham tuy chinh\nMa don hang: ORD-20260628-42\n\nDanh sach san pham:\n- Tủ đơn (60×50cm) × 1\n\nGia tri hop dong: 2 trieu d\nThoi gian thuc hien: 21 ngay\nDia chi giao hang: adwad\n\nYeu cau cu the:\nTHIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối\n\nBOM:\n  - Tấm gỗ MDF 18mm: 2 tấm\n  - Bản lề giảm chấn: 2 cái\n  - Tay nắm tủ: 1 cái\n\nDieu kien thanh toan: Theo quy dinh san ConstructX.\nBao hanh: a\n', NULL, NULL, NULL, 14, 15, NULL, NULL, NULL, NULL, b'1', '2026-06-28 11:22:41.126663', 105616, b'0', 5, 100, b'1', '2026-06-28 11:22:41.126663', 0, b'0', 100, 2112321, b'0', NULL, NULL, NULL, NULL, 42, NULL, NULL, b'0', b'0', b'0'),
(14, NULL, 12222220, '2026-06-28 13:07:46.808493', 'CTR-20260628200746-8', '2026-06-28 13:07:46.821078', 21, 'CANCELLED', 'HOP DONG THI CONG\nDu an: Sofa văng 3 chỗ Scandinavian\nGia tri: 12.222.220 VND\nThoi gian thi cong: 21 ngay\nPham vi cong viec: • Sofa văng 3 chỗ Scandinavian (x1)\nDieu kien thanh toan: Theo thoa thuan\n', '2026-06-28 13:15:40.714721', NULL, 8, 14, 15, 19, NULL, NULL, NULL, b'1', '2026-06-28 13:07:46.808493', 611111, b'1', 5, 100, b'1', '2026-06-28 13:07:46.808493', 12222220, b'1', 100, 12222220, b'0', NULL, NULL, NULL, NULL, NULL, NULL, NULL, b'0', b'0', b'0');

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
(7, '2026-06-12 08:00:32.153846', 'Khach hang duyet giai ngan 4.600.000 VND giai doan \'Bàn giao công trình\'. Immediate: 3.220.000 VND, Locked: 1.380.000 VND.', 'a', 'ACTIVE', 1),
(8, '2026-06-12 11:43:13.043335', 'Hop dong duoc tao tu don hang ORD-20260612-20. Khach hang chon nha thau a — 22 trieu d. Cho Admin phe duyet.', 'Nguyên Hoàng Dũng ', 'PENDING_REVIEW', 2),
(9, '2026-06-12 11:49:28.477277', 'Hop dong duoc tao tu don hang ORD-20260612-24. Khach hang chon nha thau a — 22 trieu d. Cho Admin phe duyet.', 'Nguyên Hoàng Dũng ', 'PENDING_REVIEW', 3),
(10, '2026-06-12 11:58:09.862046', '', 'Admin Hệ Thống', 'WAITING_SIGNATURE', 3),
(11, '2026-06-12 11:58:32.123331', 'Nha thau ky hop dong. Da lock ky quy 1.111.111 VND (5%%).', 'a', 'WAITING_SIGNATURE', 3),
(12, '2026-06-12 11:58:52.199900', 'Khach hang ky hop dong.', 'Nguyên Hoàng Dũng ', 'WAITING_SIGNATURE', 3),
(13, '2026-06-12 11:58:52.203510', 'Ca hai ben da ky. Hop dong chinh thuc co hieu luc.', 'SYSTEM', 'ACTIVE', 3),
(14, '2026-06-12 15:21:17.440361', '', 'Admin Hệ Thống', 'WAITING_SIGNATURE', 2),
(15, '2026-06-12 15:21:40.790057', 'Khach hang ky hop dong.', 'Nguyên Hoàng Dũng ', 'WAITING_SIGNATURE', 2),
(16, '2026-06-12 15:25:45.567929', 'Admin xac nhan hoan cong. Giai ngan 95% (11.400.000 VND) cho nha thau. Giu lai 5% bao hanh (600.000 VND) trong 6 thang den 2026-12-12.', 'Admin Hệ Thống', 'COMPLETED', 1),
(17, '2026-06-12 15:25:56.143577', 'Giai ngan tien bao hanh 600.000 VND cho nha thau. Ket thuc bao hanh.', 'Admin Hệ Thống', 'COMPLETED', 1),
(18, '2026-06-12 15:53:30.914753', 'Khach hang duyet giai ngan 2.000.000 VND giai doan \'Khởi công\'. Immediate: 800.000 VND, Locked: 1.200.000 VND.', 'Nguyên Hoàng Dũng ', 'ACTIVE', 3),
(19, '2026-06-12 16:14:59.390789', 'Khach hang duyet giai ngan 10.000.000 VND giai doan \'Thi công phần thô\'. Immediate: 3.000.000 VND, Locked: 7.000.000 VND.', 'Nguyên Hoàng Dũng ', 'ACTIVE', 3),
(20, '2026-06-12 16:22:57.587720', 'Khach hang duyet giai ngan 5.777.778 VND giai doan \'Bàn giao công trình\'. Immediate: 2.888.889 VND, Locked: 2.888.889 VND.', 'Nguyên Hoàng Dũng ', 'ACTIVE', 3),
(21, '2026-06-12 16:24:27.887649', 'Admin xac nhan hoan cong. Giai ngan 95% (21.111.111 VND) cho nha thau. Giu lai 5% bao hanh (1.111.111 VND) trong 6 thang den 2026-12-12.', 'Admin Hệ Thống', 'COMPLETED', 3),
(22, '2026-06-17 08:34:38.526156', 'Hop dong duoc tao tu don hang ORD-20260617-26. Khach hang chon nha thau a — 2 trieu d. Cho Admin phe duyet.', 'a', 'PENDING_REVIEW', 4),
(23, '2026-06-17 08:35:24.413482', '', 'Admin Hệ Thống', 'WAITING_SIGNATURE', 4),
(24, '2026-06-17 08:35:34.654903', 'Nha thau ky hop dong. Da lock ky quy 100.000 VND (5%%).', 'a', 'WAITING_SIGNATURE', 4),
(25, '2026-06-17 08:35:40.965093', 'Khach hang ky hop dong.', 'a', 'WAITING_SIGNATURE', 4),
(26, '2026-06-17 08:35:40.967101', 'Ca hai ben da ky. Hop dong chinh thuc co hieu luc.', 'SYSTEM', 'ACTIVE', 4),
(27, '2026-06-17 08:38:26.365035', 'Khach hang duyet giai ngan 1.599.998 VND giai doan \'Bàn giao công trình\'. Immediate: 479.999 VND, Locked: 1.119.999 VND.', 'a', 'ACTIVE', 4),
(28, '2026-06-17 08:38:39.965494', 'Admin xac nhan hoan cong. Giai ngan 95% (1.899.998 VND) cho nha thau. Giu lai 5% bao hanh (100.000 VND) trong 6 thang den 2026-12-17.', 'Admin Hệ Thống', 'COMPLETED', 4),
(29, '2026-06-17 08:45:16.105368', 'Hop dong duoc tao tu don hang ORD-20260617-25. Khach hang chon nha thau a — 4 trieu d. Cho Admin phe duyet.', 'a', 'PENDING_REVIEW', 5),
(30, '2026-06-17 08:45:26.320001', '', 'Admin Hệ Thống', 'WAITING_SIGNATURE', 5),
(31, '2026-06-17 08:45:54.579624', 'Khach hang ky hop dong.', 'a', 'WAITING_SIGNATURE', 5),
(32, '2026-06-17 08:46:11.100580', 'Nha thau ky hop dong. Da lock ky quy 200.000 VND (5%%).', 'a', 'WAITING_SIGNATURE', 5),
(33, '2026-06-17 08:46:11.103328', 'Ca hai ben da ky. Hop dong chinh thuc co hieu luc.', 'SYSTEM', 'ACTIVE', 5),
(34, '2026-06-17 08:47:10.265850', 'Khach hang duyet giai ngan 3.200.000 VND giai doan \'Bàn giao công trình\'. Immediate: 960.000 VND, Locked: 2.240.000 VND.', 'a', 'ACTIVE', 5),
(35, '2026-06-24 13:38:24.416388', 'Admin xac nhan hoan cong. Giai ngan 95% (3.800.000 VND) cho nha thau. Giu lai 5% bao hanh (200.000 VND) trong 6 thang den 2026-12-24.', 'Admin Hệ Thống', 'COMPLETED', 5),
(36, '2026-06-24 14:35:37.710786', 'Hop dong duoc tao tu don hang ORD-20260624-27. Khach hang chon nha thau a — 22 trieu d. Cho Admin phe duyet.', 'a', 'PENDING_REVIEW', 6),
(37, '2026-06-24 14:36:07.656123', '', 'Admin Hệ Thống', 'WAITING_SIGNATURE', 6),
(38, '2026-06-24 14:36:14.960446', 'Khach hang ky hop dong.', 'a', 'WAITING_SIGNATURE', 6),
(39, '2026-06-24 14:36:19.454727', 'Nha thau ky hop dong. Da lock ky quy 1.111.111 VND (5%%).', 'a', 'WAITING_SIGNATURE', 6),
(40, '2026-06-24 14:36:19.458737', 'Ca hai ben da ky. Hop dong chinh thuc co hieu luc.', 'SYSTEM', 'ACTIVE', 6),
(41, '2026-06-24 15:16:56.057464', 'Giai ngan tien bao hanh 200.000 VND cho nha thau. Ket thuc bao hanh.', 'Admin Hệ Thống', 'COMPLETED', 5),
(42, '2026-06-24 15:17:00.629917', 'Giai ngan tien bao hanh 100.000 VND cho nha thau. Ket thuc bao hanh.', 'Admin Hệ Thống', 'COMPLETED', 4),
(43, '2026-06-24 15:17:12.054454', 'Giai ngan tien bao hanh 1.111.111 VND cho nha thau. Ket thuc bao hanh.', 'Admin Hệ Thống', 'COMPLETED', 3),
(44, '2026-06-25 13:54:25.643372', 'Hop dong duoc tao tu don hang ORD-20260625-28. Khach hang chon nha thau a — 2 trieu d. Cho Admin phe duyet.', 'a', 'PENDING_REVIEW', 7),
(45, '2026-06-25 13:54:58.506643', '', 'Admin Hệ Thống', 'WAITING_SIGNATURE', 7),
(46, '2026-06-25 13:55:07.294298', 'Nha thau ky hop dong. Da lock ky quy 111.111 VND (5%%).', 'a', 'WAITING_SIGNATURE', 7),
(47, '2026-06-25 13:55:12.120429', 'Khach hang ky hop dong.', 'a', 'WAITING_SIGNATURE', 7),
(48, '2026-06-25 13:55:12.123439', 'Ca hai ben da ky. Hop dong chinh thuc co hieu luc.', 'SYSTEM', 'ACTIVE', 7),
(49, '2026-06-25 13:56:46.138398', 'Khach hang duyet giai ngan 1.777.777 VND giai doan \'Bàn giao công trình\'. Immediate: 533.333 VND, Locked: 1.244.444 VND.', 'a', 'ACTIVE', 7),
(50, '2026-06-25 13:58:53.516990', 'Admin xac nhan hoan cong. Giai ngan 95% (2.000.000 VND) cho nha thau. Giu lai 5% bao hanh (111.111 VND) trong 6 thang den 2026-12-25.', 'Admin Hệ Thống', 'COMPLETED', 7),
(51, '2026-06-25 14:01:21.406531', 'Giai ngan tien bao hanh 111.111 VND cho nha thau. Ket thuc bao hanh.', 'Admin Hệ Thống', 'COMPLETED', 7),
(52, '2026-06-25 14:32:26.154406', 'Hop dong duoc tao tu don hang ORD-20260625-29. Khach hang chon nha thau a — 20 trieu d. Cho Admin phe duyet.', 'a', 'PENDING_REVIEW', 8),
(53, '2026-06-25 14:32:44.714367', '', 'Admin Hệ Thống', 'WAITING_SIGNATURE', 8),
(54, '2026-06-25 14:32:50.872199', 'Nha thau ky hop dong. Da lock ky quy 1.000.000 VND (5%%).', 'a', 'WAITING_SIGNATURE', 8),
(55, '2026-06-25 14:32:57.694825', 'Khach hang ky hop dong.', 'a', 'WAITING_SIGNATURE', 8),
(56, '2026-06-25 14:32:57.697395', 'Ca hai ben da ky. Hop dong chinh thuc co hieu luc.', 'SYSTEM', 'ACTIVE', 8),
(57, '2026-06-26 14:26:04.668782', 'Hop dong duoc tao tu don hang ORD-20260611-11. Khach hang chon nha thau a — 2 trieu d. Cho Admin phe duyet.', 'a', 'PENDING_REVIEW', 9),
(58, '2026-06-26 14:26:19.368664', '', 'Admin Hệ Thống', 'WAITING_SIGNATURE', 9),
(59, '2026-06-26 14:28:52.181067', 'Khach hang ky hop dong.', 'a', 'WAITING_SIGNATURE', 9),
(60, '2026-06-26 14:35:44.446934', 'Hop dong duoc tao tu don hang ORD-20260626-32. Khach hang chon nha thau a — 25 trieu d. Cho Admin phe duyet.', 'a', 'PENDING_REVIEW', 10),
(61, '2026-06-26 14:35:54.834488', '', 'Admin Hệ Thống', 'WAITING_SIGNATURE', 10),
(62, '2026-06-26 14:36:11.777258', 'Khach hang ky hop dong.', 'a', 'WAITING_SIGNATURE', 10),
(63, '2026-06-26 14:38:57.209036', 'Nha thau ky hop dong. Da lock ky quy 1.250.000 VND (5%%).', 'a', 'WAITING_SIGNATURE', 10),
(64, '2026-06-26 14:38:57.212767', 'Ca hai ben da ky. Hop dong chinh thuc co hieu luc.', 'SYSTEM', 'ACTIVE', 10),
(65, '2026-06-26 14:39:19.794213', 'Nha thau ky hop dong. Da lock ky quy 111.111 VND (5%%).', 'a', 'WAITING_SIGNATURE', 9),
(66, '2026-06-26 14:39:19.798121', 'Ca hai ben da ky. Hop dong chinh thuc co hieu luc.', 'SYSTEM', 'ACTIVE', 9),
(67, '2026-06-26 16:30:19.009517', 'Hop dong duoc tao tu don hang ORD-20260626-33. Khach hang chon nha thau a — 2 trieu d. Cho Admin phe duyet.', 'a', 'PENDING_REVIEW', 11),
(68, '2026-06-26 16:30:36.247605', '', 'Admin Hệ Thống', 'WAITING_SIGNATURE', 11),
(69, '2026-06-26 16:30:57.827515', 'Khach hang ky hop dong.', 'a', 'WAITING_SIGNATURE', 11),
(70, '2026-06-26 16:31:10.410695', 'Nha thau ky hop dong. Da lock ky quy 111.111 VND (5%%).', 'a', 'WAITING_SIGNATURE', 11),
(71, '2026-06-26 16:31:10.413820', 'Ca hai ben da ky. Hop dong chinh thuc co hieu luc.', 'SYSTEM', 'ACTIVE', 11),
(72, '2026-06-26 16:32:42.960116', 'Khach hang duyet giai ngan 1.500.000 VND giai doan \'Bàn giao công trình\'. Immediate: 450.000 VND, Locked: 1.050.000 VND.', 'a', 'ACTIVE', 11),
(73, '2026-06-26 16:33:04.865942', 'Admin xac nhan hoan cong. Giai ngan 95% (2.000.000 VND) cho nha thau. Giu lai 5% bao hanh (111.111 VND) trong 6 thang den 2026-12-26.', 'Admin Hệ Thống', 'COMPLETED', 11),
(74, '2026-06-27 10:28:07.397636', 'Hop dong duoc tao tu don hang ORD-20260627-35. Khach hang chon nha thau a — 11 trieu d. Cho Admin phe duyet.', 'a', 'PENDING_REVIEW', 12),
(75, '2026-06-27 10:28:16.731798', '', 'Admin Hệ Thống', 'WAITING_SIGNATURE', 12),
(76, '2026-06-27 10:28:22.840745', 'Nha thau ky hop dong. Da lock ky quy 555.556 VND (5%%).', 'a', 'WAITING_SIGNATURE', 12),
(77, '2026-06-27 10:28:32.774696', 'Khach hang ky hop dong.', 'a', 'WAITING_SIGNATURE', 12),
(78, '2026-06-27 10:28:32.776325', 'Ca hai ben da ky. Hop dong chinh thuc co hieu luc.', 'SYSTEM', 'ACTIVE', 12),
(79, '2026-06-28 11:22:41.133072', 'Khach hang chon nha thau a cho don ORD-20260628-42 — 2 trieu d. Hop dong tu dong ACTIVE.', 'a', 'ACTIVE', 13),
(80, '2026-06-28 13:07:46.822060', 'Khach hang xac nhan chon nha thau. Da lock ESCROW 12.222.220 VND (100%). Hop dong tu dong co hieu luc.', 'a', 'ACTIVE', 14),
(81, '2026-06-28 13:11:45.230330', 'Khach hang duyet giai ngan 5.000.000 VND giai doan \'Thi công phần thô\'. Immediate: 1.500.000 VND, Locked: 3.500.000 VND.', 'a', 'ACTIVE', 14),
(82, '2026-06-28 13:14:03.922291', 'Khach hang duyet giai ngan 4.777.776 VND giai doan \'Bàn giao công trình\'. Immediate: 1.433.333 VND, Locked: 3.344.443 VND.', 'a', 'ACTIVE', 14);

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
  `gross_amount` bigint(20) DEFAULT 0,
  `net_amount` bigint(20) DEFAULT NULL,
  `phase_index` int(11) DEFAULT NULL,
  `platform_fee` bigint(20) DEFAULT NULL,
  `admin_verified` bit(1) DEFAULT NULL,
  `admin_verified_at` datetime(6) DEFAULT NULL,
  `admin_verify_note` text DEFAULT NULL,
  `admin_verified_by` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `disbursement_requests`
--

INSERT INTO `disbursement_requests` (`id`, `amount`, `created_at`, `fully_unlocked`, `immediate_amount`, `immediate_ratio`, `locked_amount`, `note`, `phase_label`, `phase_threshold`, `progress_at_request`, `reject_reason`, `reviewed_at`, `status`, `contract_id`, `contractor_id`, `reviewed_by`, `gross_amount`, `net_amount`, `phase_index`, `platform_fee`, `admin_verified`, `admin_verified_at`, `admin_verify_note`, `admin_verified_by`) VALUES
(1, 9600000, '2026-06-12 07:20:34.207811', b'0', 2400000, 0.25, 7200000, NULL, 'Khởi công', 20, 20, 'Quá nhiều ', '2026-06-12 07:22:36.814363', 'REJECTED', 1, 15, 14, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 5000000, '2026-06-12 07:23:05.430224', b'1', 2000000, 0.4, 0, NULL, 'Khởi công', 20, 20, NULL, '2026-06-12 07:58:08.146072', 'APPROVED', 1, 15, 14, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 4600000, '2026-06-12 08:00:09.041093', b'1', 3220000, 0.7, 0, NULL, 'Bàn giao công trình', 100, 100, NULL, '2026-06-12 08:00:32.153846', 'APPROVED', 1, 15, 14, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 2000000, '2026-06-12 11:59:52.394944', b'1', 800000, 0.4, 0, NULL, 'Khởi công', 20, 20, NULL, '2026-06-12 15:53:30.913652', 'APPROVED', 3, 15, 16, 0, NULL, NULL, NULL, b'1', '2026-06-12 15:52:59.395150', '', 1),
(5, 10000000, '2026-06-12 16:14:18.892799', b'1', 3000000, 0.3, 0, NULL, 'Thi công phần thô', 50, 50, NULL, '2026-06-12 16:14:59.389849', 'APPROVED', 3, 15, 16, 0, NULL, NULL, NULL, b'1', '2026-06-12 16:14:32.708751', '', 1),
(6, 5777778, '2026-06-12 16:22:16.067045', b'1', 2888889, 0.5, 0, NULL, 'Bàn giao công trình', 100, 100, NULL, '2026-06-12 16:22:57.587720', 'APPROVED', 3, 15, 16, 0, NULL, NULL, NULL, b'1', '2026-06-12 16:22:34.268708', '', 1),
(7, 1599998, '2026-06-17 08:37:42.567216', b'0', 479999, 0.3, 1119999, '1599998', 'Bàn giao công trình', 100, 100, NULL, '2026-06-17 08:38:26.364019', 'APPROVED', 4, 15, 14, 0, NULL, NULL, NULL, b'1', '2026-06-17 08:38:11.129780', '', 1),
(8, 3200000, '2026-06-17 08:46:43.500243', b'0', 960000, 0.3, 2240000, NULL, 'Bàn giao công trình', 100, 100, NULL, '2026-06-17 08:47:10.265850', 'APPROVED', 5, 15, 14, 0, NULL, NULL, NULL, b'1', '2026-06-17 08:46:56.835619', '', 1),
(9, 1777777, '2026-06-25 13:56:17.102531', b'0', 533333, 0.3, 1244444, NULL, 'Bàn giao công trình', 100, 100, NULL, '2026-06-25 13:56:46.137377', 'APPROVED', 7, 15, 14, 0, NULL, NULL, NULL, b'1', '2026-06-25 13:56:31.959360', '', 1),
(10, 5000000, '2026-06-26 14:41:08.942748', b'0', 2000000, 0.4, 3000000, NULL, 'Thi công phần thô', 50, 50, NULL, NULL, 'PENDING', 10, 15, NULL, 0, NULL, NULL, NULL, b'1', '2026-06-26 14:43:32.468300', '', 1),
(11, 1500000, '2026-06-26 16:32:05.887303', b'1', 450000, 0.3, 0, NULL, 'Bàn giao công trình', 100, 100, NULL, '2026-06-26 16:32:42.959111', 'APPROVED', 11, 15, 14, 0, NULL, NULL, NULL, b'1', '2026-06-26 16:32:05.887303', 'Hệ thống tự động xác nhận', NULL),
(12, 1000000, '2026-06-28 12:25:18.417741', b'0', 300000, 0.3, 700000, NULL, 'Thi công phần thô', 50, 50, NULL, NULL, 'PENDING', 13, 15, NULL, 0, NULL, NULL, NULL, b'0', NULL, NULL, NULL),
(13, 999999, '2026-06-28 12:27:17.875690', b'0', 300000, 0.3, 699999, 'a', 'Bàn giao công trình', 100, 100, NULL, NULL, 'PENDING', 13, 15, NULL, 0, NULL, NULL, NULL, b'0', NULL, NULL, NULL),
(14, 5000000, '2026-06-28 13:08:40.975308', b'1', 1500000, 0.3, 0, NULL, 'Thi công phần thô', 50, 50, NULL, '2026-06-28 13:11:45.230330', 'APPROVED', 14, 15, 14, 0, NULL, NULL, NULL, b'1', '2026-06-28 13:08:40.975308', 'Hệ thống tự động xác nhận', NULL),
(15, 4777776, '2026-06-28 13:13:48.196507', b'0', 1433333, 0.3, 3344443, NULL, 'Bàn giao công trình', 100, 100, NULL, '2026-06-28 13:14:03.922291', 'APPROVED', 14, 15, 14, 0, NULL, NULL, NULL, b'1', '2026-06-28 13:13:48.196507', 'Hệ thống tự động xác nhận', NULL);

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
  `project_id` bigint(20) DEFAULT NULL,
  `chat_room_id` bigint(20) DEFAULT NULL,
  `contract_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `disputes`
--

INSERT INTO `disputes` (`id`, `amount`, `created_at`, `reason`, `refund_amount`, `resolution`, `resolution_type`, `status`, `updated_at`, `contractor_id`, `customer_id`, `project_id`, `chat_room_id`, `contract_id`) VALUES
(1, 2100000, '2026-06-24 14:40:55.098935', 'chậm tiến độ ', NULL, NULL, NULL, 'PENDING', '2026-06-24 14:40:55.294957', 15, 14, NULL, 8, NULL),
(2, 1500000, '2026-06-25 14:33:21.398236', 'sai ', NULL, NULL, NULL, 'PENDING', '2026-06-25 14:33:21.469054', 15, 14, NULL, 9, 8),
(3, 25000000, '2026-06-26 14:44:46.137361', 'sai yêu câu ', NULL, NULL, NULL, 'PENDING', '2026-06-26 14:44:46.339033', 15, 14, NULL, 10, 10),
(4, 111111, '2026-06-27 10:29:27.942507', 'sad', NULL, NULL, NULL, 'PENDING', '2026-06-27 10:29:28.090877', 15, 14, NULL, 11, 12),
(5, 500000, '2026-06-28 13:14:24.288208', 'dă', 5788887, 'đâ', 'refund_customer', 'RESOLVED', '2026-06-28 13:15:40.714721', 15, 14, 19, 12, 14);

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

--
-- Dumping data for table `dispute_messages`
--

INSERT INTO `dispute_messages` (`id`, `author`, `content`, `created_at`, `dispute_id`) VALUES
(1, 'Admin Hệ Thống', 'đă', '2026-06-27 07:56:36.410679', 3),
(2, 'Admin Hệ Thống', 'adw', '2026-06-27 07:57:28.208507', 3);

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
(1, 'Gỗ tự nhiên', 'Gỗ sồi, gỗ óc chó, gỗ hương...', NULL, b'0', 1, '2026-06-11 10:59:43.188826', '2026-06-28 13:50:03.102050'),
(2, 'Gỗ công nghiệp', 'MDF, MFC, HDF, Melamine...', NULL, b'0', 2, '2026-06-11 10:59:43.188826', '2026-06-28 13:50:03.102050'),
(3, 'Kính cường lực', 'Kính temper, kính hộp...', NULL, b'0', 3, '2026-06-11 10:59:43.188826', '2026-06-28 13:50:03.103063'),
(4, 'Inox 304', 'Inox không gỉ, inox mạ...', NULL, b'0', 4, '2026-06-11 10:59:43.188826', '2026-06-28 13:50:03.103063'),
(5, 'Đá nhân tạo', 'Đá marble, đá granite...', NULL, b'0', 5, '2026-06-11 10:59:43.188826', '2026-06-28 13:50:03.103063'),
(6, 'Ván vỗ công nghiệp', NULL, NULL, b'1', 0, '2026-06-30 04:30:18.553821', NULL),
(7, 'Ván MDF', NULL, NULL, b'1', 0, '2026-06-30 04:30:18.553821', NULL),
(8, 'Xoài Đài Loan', NULL, NULL, b'1', 0, '2026-06-30 04:30:18.553821', NULL),
(9, 'Óc chó Nam Phi', NULL, NULL, b'1', 0, '2026-06-30 04:30:18.553821', NULL);

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
(6, 14, 'SYSTEM', NULL, 'Dự án #4 - a đã được admin duyệt và hiển thị trên sàn.', NULL, NULL, b'1', '2026-06-11 06:47:20.544932'),
(7, 1, 'SYSTEM', NULL, 'Nhà thầu mới a (thuan.dokhanh04@gmail.com) đang chờ phê duyệt.', NULL, NULL, b'1', '2026-06-11 06:47:57.607783'),
(8, 15, 'SYSTEM', NULL, 'Tài khoản nhà thầu của bạn đã được quản trị viên phê duyệt. Bạn có thể đăng nhập và nhận dự án.', NULL, NULL, b'0', '2026-06-11 06:48:15.970968'),
(9, 14, 'PAYMENT_SUCCESS', NULL, '✅ Đã khóa tiền đặt cọc 9 triệuđ cho đơn hàng ORD-20260611-7. Nhà thầu sẽ bắt đầu sản xuất ngay!', NULL, NULL, b'1', '2026-06-11 06:52:34.443878'),
(10, 1, 'SYSTEM', NULL, '🛒 Đơn catalog mới từ a — ORD-20260611-7. Cần xác nhận.', NULL, NULL, b'1', '2026-06-11 06:52:34.454545'),
(11, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260611-7 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'1', '2026-06-11 06:52:34.456557'),
(12, 1, 'SYSTEM', NULL, '📦 Đơn tùy chỉnh mới từ a — ORD-20260611-8. Cần phê duyệt để mở đấu giá.', NULL, NULL, b'1', '2026-06-11 06:52:57.095319'),
(13, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260611-8 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'1', '2026-06-11 06:52:57.098546'),
(14, 14, 'PAYMENT_SUCCESS', NULL, '✅ Đã khóa tiền đặt cọc 6 triệuđ cho đơn hàng ORD-20260611-9. Nhà thầu sẽ bắt đầu sản xuất ngay!', NULL, NULL, b'1', '2026-06-11 15:01:13.908118'),
(15, 1, 'SYSTEM', NULL, '🛒 Đơn catalog mới từ a — ORD-20260611-9. Cần xác nhận.', NULL, NULL, b'1', '2026-06-11 15:01:13.919870'),
(16, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260611-9 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'1', '2026-06-11 15:01:13.921633'),
(17, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260611-8 của bạn đã được Admin phê duyệt và đang mở đấu giá. Các nhà thầu sẽ sớm gửi báo giá!', NULL, NULL, b'1', '2026-06-11 15:32:25.899160'),
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
(34, 14, 'BID_RECEIVED', NULL, 'Đơn hàng ORD-20260611-8 vừa nhận được báo giá mới từ a — 20 triệu đ', NULL, NULL, b'1', '2026-06-11 15:35:50.019732'),
(35, 15, 'SYSTEM', NULL, '🎉 Chúc mừng! Báo giá của bạn cho đơn ORD-20260611-8 đã được khách hàng chấp nhận. Admin sẽ liên hệ để ký kết hợp đồng.', NULL, NULL, b'0', '2026-06-11 15:37:45.182028'),
(36, 1, 'SYSTEM', NULL, 'Đơn ORD-20260611-8 đã chọn nhà thầu: a — 20 triệu đ. Cần ký kết hợp đồng.', NULL, NULL, b'1', '2026-06-11 15:37:45.204215'),
(37, 6, 'SYSTEM', NULL, '🚚 Đơn ORD-20260611-005 đang được giao đến bạn!', NULL, NULL, b'0', '2026-06-11 15:38:10.918686'),
(38, 6, 'SYSTEM', NULL, '✅ Đơn ORD-20260611-005 đã giao thành công. Cảm ơn bạn!', NULL, NULL, b'0', '2026-06-11 15:40:40.380425'),
(39, 14, 'SYSTEM', NULL, '🔨 Đơn ORD-20260611-8 đang được sản xuất/thi công.', NULL, NULL, b'1', '2026-06-11 15:41:05.789231'),
(40, 5, 'BID_RECEIVED', NULL, 'Đơn hàng ORD-20260610-003 vừa nhận được báo giá mới từ a — 12 triệu đ', NULL, NULL, b'0', '2026-06-11 15:44:12.855104'),
(41, 14, 'PAYMENT_SUCCESS', NULL, '✅ Đã khóa tiền đặt cọc 9 triệuđ cho đơn hàng ORD-20260611-10. Nhà thầu sẽ bắt đầu sản xuất ngay!', NULL, NULL, b'1', '2026-06-11 15:57:56.656839'),
(42, 1, 'SYSTEM', NULL, '🛒 Đơn catalog mới từ a — ORD-20260611-10. Cần xác nhận.', NULL, NULL, b'1', '2026-06-11 15:57:56.666554'),
(43, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260611-10 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'1', '2026-06-11 15:57:56.666554'),
(44, 1, 'SYSTEM', NULL, '📦 Đơn tùy chỉnh mới từ a — ORD-20260611-11. Cần phê duyệt để mở đấu giá.', NULL, NULL, b'1', '2026-06-11 15:59:02.922645'),
(45, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260611-11 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'1', '2026-06-11 15:59:02.927785'),
(46, 14, 'SYSTEM', NULL, 'Dự án #5 - Bàn ăn Cơm đã được admin duyệt và hiển thị trên sàn.', NULL, NULL, b'1', '2026-06-12 06:37:08.567670'),
(47, 14, 'SYSTEM', NULL, 'Da lock coc 1.200.000 VND (10%%). HD CTR-20260612133850-6 cho Admin duyet.', NULL, NULL, b'1', '2026-06-12 06:38:51.026558'),
(48, 15, 'SYSTEM', NULL, 'Bao gia duoc chon (du an: Bàn ăn Cơm, 12.000.000 VND)! Cho Admin duyet HD.', NULL, NULL, b'0', '2026-06-12 06:38:51.031551'),
(49, 1, 'SYSTEM', NULL, 'HD moi can duyet: CTR-20260612133850-6 - 12.000.000 VND. Customer da coc 1.200.000 VND', NULL, NULL, b'1', '2026-06-12 06:38:51.047241'),
(50, 14, 'SYSTEM', NULL, 'HD CTR-20260612133850-6 duoc duyet! Vao trang Hop dong de ky xac nhan.', NULL, NULL, b'1', '2026-06-12 06:39:31.633009'),
(51, 15, 'SYSTEM', NULL, 'HD CTR-20260612133850-6 duoc duyet! Khi ky HD can ky quy 600.000 VND (5%%).', NULL, NULL, b'0', '2026-06-12 06:39:31.636728'),
(52, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260611-11 của bạn đã được Admin phê duyệt và đang mở đấu giá. Các nhà thầu sẽ sớm gửi báo giá!', NULL, NULL, b'1', '2026-06-12 06:40:07.933336'),
(53, 2, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260611-11. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 06:40:07.945349'),
(54, 3, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260611-11. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 06:40:07.948445'),
(55, 10, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260611-11. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 06:40:07.950455'),
(56, 11, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260611-11. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 06:40:07.953888'),
(57, 12, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260611-11. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 06:40:07.956283'),
(58, 13, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260611-11. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 06:40:07.958361'),
(59, 15, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260611-11. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 06:40:07.962391'),
(60, 15, 'SYSTEM', NULL, 'Khach hang da ky HD CTR-20260612133850-6. Vui long ky de bat dau thi cong.', NULL, NULL, b'0', '2026-06-12 06:42:16.844805'),
(61, 14, 'SYSTEM', NULL, 'Nha thau da ky HD CTR-20260612133850-6. Den luot ban ky de bat dau thi cong.', NULL, NULL, b'1', '2026-06-12 06:42:36.139341'),
(62, 14, 'SYSTEM', NULL, 'HD CTR-20260612133850-6 chinh thuc ACTIVE! Cong trinh bat dau thi cong.', NULL, NULL, b'1', '2026-06-12 06:42:36.142299'),
(63, 15, 'SYSTEM', NULL, 'HD CTR-20260612133850-6 chinh thuc ACTIVE! Bat dau thi cong du an.', NULL, NULL, b'0', '2026-06-12 06:42:36.145510'),
(64, 14, 'MILESTONE_REQUEST', NULL, 'Nha thau da cap nhat tien do: 20% - HD CTR-20260612133850-6. [Khởi công]', NULL, NULL, b'1', '2026-06-12 07:19:51.013440'),
(65, 14, 'PAYMENT_SUCCESS', NULL, 'Nha thau yeu cau giai ngan 9.600.000 VND giai doan \'Khởi công\' - HD CTR-20260612133850-6. Vui long xem xet va xac nhan.', NULL, NULL, b'1', '2026-06-12 07:20:34.229585'),
(66, 15, 'PAYMENT_FAILED', NULL, 'Khach hang tu choi giai ngan giai doan \'Khởi công\'. Ly do: Quá nhiều .', NULL, NULL, b'0', '2026-06-12 07:22:36.815373'),
(67, 14, 'PAYMENT_SUCCESS', NULL, 'Nha thau yeu cau giai ngan 5.000.000 VND giai doan \'Khởi công\' - HD CTR-20260612133850-6. Vui long xem xet va xac nhan.', NULL, NULL, b'1', '2026-06-12 07:23:05.442785'),
(68, 14, 'MILESTONE_REQUEST', NULL, 'Nha thau da cap nhat tien do: 30% - HD CTR-20260612133850-6. [Thi công phần thô]', NULL, NULL, b'1', '2026-06-12 07:25:19.333544'),
(69, 15, 'PAYMENT_SUCCESS', NULL, 'Khach hang da duyet giai ngan 5.000.000 VND giai doan \'Khởi công\'. 2.000.000 VND dung ngay, 3.000.000 VND con locked.', NULL, NULL, b'0', '2026-06-12 07:58:08.169196'),
(70, 14, 'MILESTONE_REQUEST', NULL, 'Nha thau da cap nhat tien do: 100% - HD CTR-20260612133850-6. [Bàn giao công trình]', NULL, NULL, b'1', '2026-06-12 07:59:22.945281'),
(71, 14, 'PAYMENT_SUCCESS', NULL, 'Nha thau yeu cau giai ngan 4.600.000 VND giai doan \'Bàn giao công trình\' - HD CTR-20260612133850-6. Vui long xem xet va xac nhan.', NULL, NULL, b'1', '2026-06-12 08:00:09.044633'),
(72, 15, 'PAYMENT_SUCCESS', NULL, 'Khach hang da duyet giai ngan 4.600.000 VND giai doan \'Bàn giao công trình\'. 3.220.000 VND dung ngay, 1.380.000 VND con locked.', NULL, NULL, b'0', '2026-06-12 08:00:32.156479'),
(73, 15, 'PAYMENT_SUCCESS', NULL, 'Da mo khoa 1.380.000 VND tien bao dam giai doan \'Bàn giao công trình\' HD CTR-20260612133850-6.', NULL, NULL, b'0', '2026-06-12 08:00:48.237976'),
(74, 14, 'MILESTONE_REQUEST', NULL, 'Nha thau da cap nhat tien do: 100% - HD CTR-20260612133850-6.', NULL, NULL, b'1', '2026-06-12 08:45:48.295106'),
(75, 14, 'PAYMENT_SUCCESS', NULL, '✅ Đã khóa tiền đặt cọc 9 triệuđ cho đơn hàng ORD-20260612-12. Nhà thầu sẽ bắt đầu sản xuất ngay!', NULL, NULL, b'1', '2026-06-12 08:47:43.051464'),
(76, 1, 'SYSTEM', NULL, '🛒 Đơn catalog mới từ a — ORD-20260612-12. Cần xác nhận.', NULL, NULL, b'1', '2026-06-12 08:47:43.063967'),
(77, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260612-12 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'1', '2026-06-12 08:47:43.067005'),
(78, 1, 'SYSTEM', NULL, '📦 Đơn tùy chỉnh mới từ a — ORD-20260612-13. Cần phê duyệt để mở đấu giá.', NULL, NULL, b'1', '2026-06-12 08:48:49.174266'),
(79, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260612-13 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'1', '2026-06-12 08:48:49.179234'),
(80, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260612-13 của bạn đã được Admin phê duyệt và đang mở đấu giá. Các nhà thầu sẽ sớm gửi báo giá!', NULL, NULL, b'1', '2026-06-12 08:49:00.034831'),
(81, 2, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-13. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 08:49:00.045390'),
(82, 3, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-13. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 08:49:00.047383'),
(83, 10, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-13. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 08:49:00.050382'),
(84, 11, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-13. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 08:49:00.052368'),
(85, 12, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-13. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 08:49:00.054882'),
(86, 13, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-13. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 08:49:00.057879'),
(87, 15, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-13. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 08:49:00.059893'),
(88, 14, 'BID_RECEIVED', NULL, 'Đơn hàng ORD-20260612-13 vừa nhận được báo giá mới từ a — 20 triệu đ', NULL, NULL, b'1', '2026-06-12 08:50:29.599310'),
(89, 15, 'SYSTEM', NULL, '🎉 Chúc mừng! Báo giá của bạn cho đơn ORD-20260612-13 đã được khách hàng chấp nhận. Admin sẽ liên hệ để ký kết hợp đồng.', NULL, NULL, b'0', '2026-06-12 08:52:39.453346'),
(90, 1, 'SYSTEM', NULL, 'Đơn ORD-20260612-13 đã chọn nhà thầu: a — 20 triệu đ. Cần ký kết hợp đồng.', NULL, NULL, b'1', '2026-06-12 08:52:39.477120'),
(91, 14, 'SYSTEM', NULL, '🔨 Đơn ORD-20260612-13 đang được sản xuất/thi công.', NULL, NULL, b'1', '2026-06-12 08:54:43.390916'),
(92, 1, 'SYSTEM', NULL, '📦 Đơn tùy chỉnh mới từ a — ORD-20260612-14. Cần phê duyệt để mở đấu giá.', NULL, NULL, b'1', '2026-06-12 09:59:16.422371'),
(93, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260612-14 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'1', '2026-06-12 09:59:16.437319'),
(94, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260612-14 của bạn đã được Admin phê duyệt và đang mở đấu giá. Các nhà thầu sẽ sớm gửi báo giá!', NULL, NULL, b'1', '2026-06-12 09:59:33.527333'),
(95, 2, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-14. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 09:59:33.535862'),
(96, 3, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-14. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 09:59:33.538872'),
(97, 10, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-14. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 09:59:33.540864'),
(98, 11, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-14. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 09:59:33.542369'),
(99, 12, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-14. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 09:59:33.544390'),
(100, 13, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-14. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 09:59:33.546394'),
(101, 15, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-14. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 09:59:33.549913'),
(102, 14, 'BID_RECEIVED', NULL, 'Đơn hàng ORD-20260612-14 vừa nhận được báo giá mới từ a — 5 triệu đ', NULL, NULL, b'1', '2026-06-12 10:00:20.444105'),
(103, 15, 'SYSTEM', NULL, '🎉 Chúc mừng! Báo giá của bạn cho đơn ORD-20260612-14 đã được khách hàng chấp nhận. Admin sẽ liên hệ để ký kết hợp đồng.', NULL, NULL, b'0', '2026-06-12 10:00:42.965948'),
(104, 1, 'SYSTEM', NULL, 'Đơn ORD-20260612-14 đã chọn nhà thầu: a — 5 triệu đ. Cần ký kết hợp đồng.', NULL, NULL, b'1', '2026-06-12 10:00:42.980939'),
(105, 14, 'SYSTEM', NULL, '🔨 Đơn ORD-20260612-14 đang được sản xuất/thi công.', NULL, NULL, b'1', '2026-06-12 10:01:25.256179'),
(106, 1, 'SYSTEM', NULL, '📦 Đơn tùy chỉnh mới từ a — ORD-20260612-15. Cần phê duyệt để mở đấu giá.', NULL, NULL, b'1', '2026-06-12 10:05:42.267541'),
(107, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260612-15 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'1', '2026-06-12 10:05:42.272040'),
(108, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260612-15 của bạn đã được Admin phê duyệt và đang mở đấu giá. Các nhà thầu sẽ sớm gửi báo giá!', NULL, NULL, b'1', '2026-06-12 10:05:53.420387'),
(109, 2, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-15. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:05:53.430547'),
(110, 3, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-15. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:05:53.430547'),
(111, 10, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-15. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:05:53.430547'),
(112, 11, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-15. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:05:53.440637'),
(113, 12, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-15. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:05:53.446751'),
(114, 13, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-15. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:05:53.450118'),
(115, 15, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-15. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:05:53.453656'),
(116, 14, 'BID_RECEIVED', NULL, 'Đơn hàng ORD-20260612-15 vừa nhận được báo giá mới từ a — 10 triệu đ', NULL, NULL, b'1', '2026-06-12 10:06:52.374116'),
(117, 15, 'SYSTEM', NULL, '🎉 Chúc mừng! Báo giá của bạn cho đơn ORD-20260612-15 đã được khách hàng chấp nhận. Admin sẽ liên hệ để ký kết hợp đồng.', NULL, NULL, b'0', '2026-06-12 10:07:29.385815'),
(118, 1, 'SYSTEM', NULL, 'Đơn ORD-20260612-15 đã chọn nhà thầu: a — 10 triệu đ. Cần ký kết hợp đồng.', NULL, NULL, b'1', '2026-06-12 10:07:29.398886'),
(119, 14, 'SYSTEM', NULL, '🔨 Đơn ORD-20260612-15 đang được sản xuất/thi công.', NULL, NULL, b'1', '2026-06-12 10:08:02.136187'),
(120, 1, 'SYSTEM', NULL, '📦 Đơn tùy chỉnh mới từ a — ORD-20260612-16. Cần phê duyệt để mở đấu giá.', NULL, NULL, b'1', '2026-06-12 10:12:41.301616'),
(121, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260612-16 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'1', '2026-06-12 10:12:41.309496'),
(122, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260612-16 của bạn đã được Admin phê duyệt và đang mở đấu giá. Các nhà thầu sẽ sớm gửi báo giá!', NULL, NULL, b'1', '2026-06-12 10:12:52.657153'),
(123, 2, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-16. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:12:52.663550'),
(124, 3, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-16. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:12:52.665635'),
(125, 10, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-16. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:12:52.666942'),
(126, 11, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-16. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:12:52.669012'),
(127, 12, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-16. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:12:52.672808'),
(128, 13, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-16. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:12:52.675932'),
(129, 15, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260612-16. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 10:12:52.676904'),
(130, 14, 'BID_RECEIVED', NULL, 'Đơn hàng ORD-20260612-16 vừa nhận được báo giá mới từ a — 20 triệu đ', NULL, NULL, b'1', '2026-06-12 10:13:32.577351'),
(131, 15, 'SYSTEM', NULL, '🎉 Chúc mừng! Báo giá của bạn cho đơn ORD-20260612-16 đã được khách hàng chấp nhận. Admin sẽ liên hệ để ký kết hợp đồng.', NULL, NULL, b'0', '2026-06-12 10:14:33.697928'),
(132, 1, 'SYSTEM', NULL, 'Đơn ORD-20260612-16 đã chọn nhà thầu: a — 20 triệu đ. Cần ký kết hợp đồng.', NULL, NULL, b'1', '2026-06-12 10:14:33.714677'),
(133, 1, 'SYSTEM', NULL, '📦 Đơn tùy chỉnh mới từ Nguyên Hoàng Dũng  — ORD-20260612-17. Cần phê duyệt để mở đấu giá.', NULL, NULL, b'1', '2026-06-12 10:17:30.678836'),
(134, 16, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260612-17 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-12 10:17:30.681865'),
(135, 16, 'PAYMENT_SUCCESS', NULL, '✅ Đã khóa tiền đặt cọc 6 triệuđ cho đơn hàng ORD-20260612-18. Nhà thầu sẽ bắt đầu sản xuất ngay!', NULL, NULL, b'0', '2026-06-12 10:17:48.613187'),
(136, 1, 'SYSTEM', NULL, '🛒 Đơn catalog mới từ Nguyên Hoàng Dũng  — ORD-20260612-18. Cần xác nhận.', NULL, NULL, b'1', '2026-06-12 10:17:48.620992'),
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
(148, 1, 'SYSTEM', NULL, 'Đơn ORD-20260612-17 đã chọn nhà thầu: a — 2 triệu đ. Cần ký kết hợp đồng.', NULL, NULL, b'1', '2026-06-12 10:19:41.710370'),
(149, 16, 'PAYMENT_SUCCESS', NULL, '✅ Đã khóa tiền đặt cọc 6 triệuđ cho đơn hàng ORD-20260612-19. Nhà thầu sẽ bắt đầu sản xuất ngay!', NULL, NULL, b'0', '2026-06-12 10:44:03.854956'),
(150, 1, 'SYSTEM', NULL, '🛒 Đơn catalog mới từ Nguyên Hoàng Dũng  — ORD-20260612-19. Cần xác nhận.', NULL, NULL, b'1', '2026-06-12 10:44:03.866798'),
(151, 16, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260612-19 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-12 10:44:03.866798'),
(152, 1, 'SYSTEM', NULL, '📦 Đơn tùy chỉnh mới từ Nguyên Hoàng Dũng  — ORD-20260612-20. Cần phê duyệt để mở đấu giá.', NULL, NULL, b'1', '2026-06-12 10:44:31.293064'),
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
(164, 14, 'SYSTEM', NULL, '🔨 Đơn ORD-20260612-16 đang được sản xuất/thi công.', NULL, NULL, b'1', '2026-06-12 10:51:07.345353'),
(165, 1, 'SYSTEM', NULL, '📦 Đơn tùy chỉnh mới từ Nguyên Hoàng Dũng  — ORD-20260612-21. Cần phê duyệt để mở đấu giá.', NULL, NULL, b'1', '2026-06-12 11:36:19.428480'),
(166, 16, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260612-21 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-12 11:36:19.441985'),
(167, 16, 'PAYMENT_SUCCESS', NULL, '✅ Đã khóa tiền đặt cọc 6 triệuđ cho đơn hàng ORD-20260612-22. Nhà thầu sẽ bắt đầu sản xuất ngay!', NULL, NULL, b'0', '2026-06-12 11:36:30.356912'),
(168, 1, 'SYSTEM', NULL, '🛒 Đơn catalog mới từ Nguyên Hoàng Dũng  — ORD-20260612-22. Cần xác nhận.', NULL, NULL, b'1', '2026-06-12 11:36:30.366983'),
(169, 16, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260612-22 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-12 11:36:30.371640'),
(170, 16, 'SYSTEM', NULL, 'Dự án #6 - phòng ngủ  đã được admin duyệt và hiển thị trên sàn.', NULL, NULL, b'0', '2026-06-12 11:38:43.139063'),
(171, 1, 'SYSTEM', NULL, '📦 Đơn tùy chỉnh mới từ Nguyên Hoàng Dũng  — ORD-20260612-23. Cần phê duyệt để mở đấu giá.', NULL, NULL, b'1', '2026-06-12 11:40:27.379335'),
(172, 16, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260612-23 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-12 11:40:27.384084'),
(173, 15, 'SYSTEM', NULL, '🎉 Báo giá của bạn cho đơn ORD-20260612-20 đã được chấp nhận! Hợp đồng CTR-ORD-20260612184313-20 đã được tạo, chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-12 11:43:13.066696'),
(174, 1, 'SYSTEM', NULL, '📋 Hợp đồng CTR-ORD-20260612184313-20 từ đơn ORD-20260612-20 cần phê duyệt: a — 22 triệu đ', NULL, NULL, b'1', '2026-06-12 11:43:13.095277'),
(175, 16, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260612-23 của bạn đã được Admin phê duyệt và đang mở đấu giá. Các nhà thầu sẽ sớm gửi báo giá!', NULL, NULL, b'0', '2026-06-12 11:47:44.507661'),
(176, 2, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-23. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 11:47:44.543259'),
(177, 3, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-23. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 11:47:44.546663'),
(178, 10, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-23. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 11:47:44.548686'),
(179, 11, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-23. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 11:47:44.551358'),
(180, 12, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-23. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 11:47:44.554380'),
(181, 13, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-23. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 11:47:44.556365'),
(182, 15, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-23. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 11:47:44.558971'),
(183, 16, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260612-21 của bạn đã được Admin phê duyệt và đang mở đấu giá. Các nhà thầu sẽ sớm gửi báo giá!', NULL, NULL, b'0', '2026-06-12 11:47:54.371503'),
(184, 2, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-21. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 11:47:54.371503'),
(185, 3, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-21. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 11:47:54.381573'),
(186, 10, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-21. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 11:47:54.382580'),
(187, 11, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-21. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 11:47:54.385106'),
(188, 12, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-21. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 11:47:54.386767'),
(189, 13, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-21. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 11:47:54.388796'),
(190, 15, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260612-21. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 11:47:54.390570'),
(191, 1, 'SYSTEM', NULL, '📦 Đơn hàng mới từ Nguyên Hoàng Dũng  — ORD-20260612-24. Cần phê duyệt & mở đấu giá.', NULL, NULL, b'1', '2026-06-12 11:48:06.575476'),
(192, 1, 'SYSTEM', NULL, '📦 Đơn hàng mới từ Nguyên Hoàng Dũng  — ORD-20260612-24. Cần phê duyệt & mở đấu giá.', NULL, NULL, b'1', '2026-06-12 11:48:06.588658'),
(193, 16, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260612-24 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-12 11:48:06.592117'),
(194, 16, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260612-24 của bạn đã được Admin phê duyệt và đang mở đấu giá. Các nhà thầu sẽ sớm gửi báo giá!', NULL, NULL, b'0', '2026-06-12 11:48:21.571969'),
(195, 2, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260612-24. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 11:48:21.582248'),
(196, 3, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260612-24. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 11:48:21.584000'),
(197, 10, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260612-24. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 11:48:21.586351'),
(198, 11, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260612-24. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 11:48:21.586351'),
(199, 12, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260612-24. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 11:48:21.586351'),
(200, 13, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260612-24. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 11:48:21.592415'),
(201, 15, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260612-24. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-12 11:48:21.592415'),
(202, 16, 'BID_RECEIVED', NULL, 'Đơn hàng ORD-20260612-24 vừa nhận được báo giá mới từ a — 22 triệu đ', NULL, NULL, b'0', '2026-06-12 11:49:15.470910'),
(203, 15, 'SYSTEM', NULL, '🎉 Báo giá của bạn cho đơn ORD-20260612-24 đã được chấp nhận! Hợp đồng CTR-ORD-20260612184928-24 đã được tạo, chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-12 11:49:28.488547'),
(204, 1, 'SYSTEM', NULL, '📋 Hợp đồng CTR-ORD-20260612184928-24 từ đơn ORD-20260612-24 cần phê duyệt: a — 22 triệu đ', NULL, NULL, b'1', '2026-06-12 11:49:28.507417'),
(205, 16, 'SYSTEM', NULL, 'HD CTR-ORD-20260612184928-24 duoc duyet! Vao trang Hop dong de ky xac nhan.', NULL, NULL, b'0', '2026-06-12 11:58:09.884064'),
(206, 15, 'SYSTEM', NULL, 'HD CTR-ORD-20260612184928-24 duoc duyet! Khi ky HD can ky quy 1.111.111 VND (5%%).', NULL, NULL, b'0', '2026-06-12 11:58:09.895005'),
(207, 16, 'SYSTEM', NULL, 'Nha thau da ky HD CTR-ORD-20260612184928-24. Den luot ban ky de bat dau thi cong.', NULL, NULL, b'0', '2026-06-12 11:58:32.124399'),
(208, 15, 'SYSTEM', NULL, 'Khach hang da ky HD CTR-ORD-20260612184928-24. Vui long ky de bat dau thi cong.', NULL, NULL, b'0', '2026-06-12 11:58:52.199900'),
(209, 16, 'SYSTEM', NULL, 'HD CTR-ORD-20260612184928-24 chinh thuc ACTIVE! Cong trinh bat dau thi cong.', NULL, NULL, b'0', '2026-06-12 11:58:52.203510'),
(210, 15, 'SYSTEM', NULL, 'HD CTR-ORD-20260612184928-24 chinh thuc ACTIVE! Bat dau thi cong du an.', NULL, NULL, b'0', '2026-06-12 11:58:52.207645'),
(211, 16, 'MILESTONE_REQUEST', NULL, 'Nha thau da cap nhat tien do: 20% - HD CTR-ORD-20260612184928-24.', NULL, NULL, b'0', '2026-06-12 11:59:34.544951'),
(212, 16, 'PAYMENT_SUCCESS', NULL, 'Nha thau yeu cau giai ngan 2.000.000 VND giai doan \'Khởi công\' - HD CTR-ORD-20260612184928-24. Vui long xem xet va xac nhan.', NULL, NULL, b'0', '2026-06-12 11:59:52.416719'),
(213, 16, 'SYSTEM', NULL, 'HD CTR-ORD-20260612184313-20 duoc duyet! Vao trang Hop dong de ky xac nhan.', NULL, NULL, b'0', '2026-06-12 15:21:17.463184'),
(214, 15, 'SYSTEM', NULL, 'HD CTR-ORD-20260612184313-20 duoc duyet! Khi ky HD can ky quy 1.111.111 VND (5%%).', NULL, NULL, b'0', '2026-06-12 15:21:17.468871'),
(215, 15, 'SYSTEM', NULL, 'Khach hang da ky HD CTR-ORD-20260612184313-20. Vui long ky de bat dau thi cong.', NULL, NULL, b'0', '2026-06-12 15:21:40.791017'),
(216, 14, 'PAYMENT_SUCCESS', NULL, 'HD CTR-20260612133850-6 hoan thanh! Nha thau nhan 95%% ngay. 5%% bao hanh giu 6 thang.', NULL, NULL, b'1', '2026-06-12 15:25:45.573476'),
(217, 15, 'PAYMENT_SUCCESS', NULL, 'HD CTR-20260612133850-6 hoan thanh! Nhan 11.400.000 VND ngay. 600.000 VND bao hanh giu den 2026-12-12.', NULL, NULL, b'0', '2026-06-12 15:25:45.582619'),
(218, 15, 'PAYMENT_SUCCESS', NULL, '✅ Da giai ngan 600.000 VND tien bao hanh HD CTR-20260612133850-6. Bao hanh ket thuc.', NULL, NULL, b'0', '2026-06-12 15:25:56.148832'),
(219, 14, 'SYSTEM', NULL, 'Tien bao hanh HD CTR-20260612133850-6 da duoc giai ngan cho nha thau sau 6 thang bao hanh.', NULL, NULL, b'1', '2026-06-12 15:25:56.151385'),
(220, 16, 'PAYMENT_SUCCESS', NULL, '✅ Admin da xac nhan yeu cau giai ngan 2.000.000 VND giai doan \'Khởi công\' - HD CTR-ORD-20260612184928-24. Vui long vao trang Tien do de duyet.', NULL, NULL, b'0', '2026-06-12 15:52:59.411368'),
(221, 15, 'SYSTEM', NULL, '✅ Admin da xac nhan yeu cau giai ngan giai doan \'Khởi công\'. Dang cho khach hang duyet.', NULL, NULL, b'0', '2026-06-12 15:52:59.445196'),
(222, 15, 'PAYMENT_SUCCESS', NULL, 'Khach hang da duyet giai ngan 2.000.000 VND giai doan \'Khởi công\'. 800.000 VND dung ngay, 1.200.000 VND con locked.', NULL, NULL, b'0', '2026-06-12 15:53:30.930274'),
(223, 16, 'BID_RECEIVED', NULL, 'Đơn hàng ORD-20260612-23 vừa nhận được báo giá mới từ a — 12 triệu đ', NULL, NULL, b'0', '2026-06-12 16:00:34.645190'),
(224, 1, 'SYSTEM', NULL, 'Nhà thầu mới a (dothuan@gmail.com) đang chờ phê duyệt.', NULL, NULL, b'0', '2026-06-12 16:01:00.146681'),
(225, 17, 'SYSTEM', NULL, 'Tài khoản nhà thầu của bạn đã được quản trị viên phê duyệt. Bạn có thể đăng nhập và nhận dự án.', NULL, NULL, b'0', '2026-06-12 16:01:26.391168'),
(226, 17, 'SYSTEM', NULL, 'Tài khoản nhà thầu của bạn đã bị từ chối bởi quản trị viên.', NULL, NULL, b'0', '2026-06-12 16:06:03.980426'),
(227, 17, 'SYSTEM', NULL, 'Tài khoản nhà thầu của bạn đã được quản trị viên phê duyệt. Bạn có thể đăng nhập và nhận dự án.', NULL, NULL, b'0', '2026-06-12 16:06:09.828862'),
(228, 16, 'BID_RECEIVED', NULL, 'Đơn hàng ORD-20260612-23 vừa nhận được báo giá mới từ a — 12 triệu đ', NULL, NULL, b'0', '2026-06-12 16:11:54.372966'),
(229, 16, 'MILESTONE_REQUEST', NULL, 'Nha thau da cap nhat tien do: 20% - HD CTR-ORD-20260612184928-24. [Thi công phần thô]', NULL, NULL, b'0', '2026-06-12 16:13:38.531557'),
(230, 16, 'MILESTONE_REQUEST', NULL, 'Nha thau da cap nhat tien do: 50% - HD CTR-ORD-20260612184928-24. [Hoàn thiện]', NULL, NULL, b'0', '2026-06-12 16:14:00.099874'),
(231, 16, 'PAYMENT_SUCCESS', NULL, 'Nha thau yeu cau giai ngan 10.000.000 VND giai doan \'Thi công phần thô\' - HD CTR-ORD-20260612184928-24. Vui long cho Admin xac nhan truoc.', NULL, NULL, b'0', '2026-06-12 16:14:18.906685'),
(232, 1, 'SYSTEM', NULL, '📋 Yeu cau giai ngan moi: HD CTR-ORD-20260612184928-24 - Nha thau a - Giai doan \'Thi công phần thô\' - So tien: 10.000.000 VND. Can xac nhan.', NULL, NULL, b'0', '2026-06-12 16:14:18.924596'),
(233, 16, 'PAYMENT_SUCCESS', NULL, '✅ Admin da xac nhan yeu cau giai ngan 10.000.000 VND giai doan \'Thi công phần thô\' - HD CTR-ORD-20260612184928-24. Vui long vao trang Tien do de duyet.', NULL, NULL, b'0', '2026-06-12 16:14:32.708751'),
(234, 15, 'SYSTEM', NULL, '✅ Admin da xac nhan yeu cau giai ngan giai doan \'Thi công phần thô\'. Dang cho khach hang duyet.', NULL, NULL, b'0', '2026-06-12 16:14:32.715825'),
(235, 15, 'PAYMENT_SUCCESS', NULL, 'Khach hang da duyet giai ngan 10.000.000 VND giai doan \'Thi công phần thô\'. 3.000.000 VND dung ngay, 7.000.000 VND con locked.', NULL, NULL, b'0', '2026-06-12 16:14:59.398631'),
(236, 16, 'MILESTONE_REQUEST', NULL, 'Nha thau da cap nhat tien do: 100% - HD CTR-ORD-20260612184928-24. [Bàn giao công trình]', NULL, NULL, b'0', '2026-06-12 16:21:47.502605'),
(237, 16, 'PAYMENT_SUCCESS', NULL, 'Nha thau yeu cau giai ngan 5.777.778 VND giai doan \'Bàn giao công trình\' - HD CTR-ORD-20260612184928-24. Vui long cho Admin xac nhan truoc.', NULL, NULL, b'0', '2026-06-12 16:22:16.073043'),
(238, 1, 'SYSTEM', NULL, '📋 Yeu cau giai ngan moi: HD CTR-ORD-20260612184928-24 - Nha thau a - Giai doan \'Bàn giao công trình\' - So tien: 5.777.778 VND. Can xac nhan.', NULL, NULL, b'0', '2026-06-12 16:22:16.077563'),
(239, 16, 'PAYMENT_SUCCESS', NULL, '✅ Admin da xac nhan yeu cau giai ngan 5.777.778 VND giai doan \'Bàn giao công trình\' - HD CTR-ORD-20260612184928-24. Vui long vao trang Tien do de duyet.', NULL, NULL, b'0', '2026-06-12 16:22:34.271724'),
(240, 15, 'SYSTEM', NULL, '✅ Admin da xac nhan yeu cau giai ngan giai doan \'Bàn giao công trình\'. Dang cho khach hang duyet.', NULL, NULL, b'0', '2026-06-12 16:22:34.273919'),
(241, 15, 'PAYMENT_SUCCESS', NULL, 'Khach hang da duyet giai ngan 5.777.778 VND giai doan \'Bàn giao công trình\'. 2.888.889 VND dung ngay, 2.888.889 VND con locked.', NULL, NULL, b'0', '2026-06-12 16:22:57.594907'),
(242, 15, 'PAYMENT_SUCCESS', NULL, 'Da mo khoa 2.888.889 VND tien bao dam giai doan \'Bàn giao công trình\' HD CTR-ORD-20260612184928-24.', NULL, NULL, b'0', '2026-06-12 16:24:04.107860'),
(243, 16, 'PAYMENT_SUCCESS', NULL, 'HD CTR-ORD-20260612184928-24 hoan thanh! Nha thau nhan 95%% ngay. 5%% bao hanh giu 6 thang.', NULL, NULL, b'0', '2026-06-12 16:24:27.898942'),
(244, 15, 'PAYMENT_SUCCESS', NULL, 'HD CTR-ORD-20260612184928-24 hoan thanh! Nhan 21.111.111 VND ngay. 1.111.111 VND bao hanh giu den 2026-12-12.', NULL, NULL, b'0', '2026-06-12 16:24:27.898942'),
(245, 1, 'SYSTEM', NULL, '📦 Đơn hàng mới từ a — ORD-20260617-25. Cần phê duyệt & mở đấu giá.', NULL, NULL, b'0', '2026-06-17 08:32:29.372200'),
(246, 1, 'SYSTEM', NULL, '📦 Đơn hàng mới từ a — ORD-20260617-25. Cần phê duyệt & mở đấu giá.', NULL, NULL, b'0', '2026-06-17 08:32:29.396355'),
(247, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260617-25 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'1', '2026-06-17 08:32:29.411549'),
(248, 1, 'SYSTEM', NULL, '📦 Đơn hàng mới từ a — ORD-20260617-26. Cần phê duyệt & mở đấu giá.', NULL, NULL, b'0', '2026-06-17 08:32:44.844951'),
(249, 1, 'SYSTEM', NULL, '📦 Đơn hàng mới từ a — ORD-20260617-26. Cần phê duyệt & mở đấu giá.', NULL, NULL, b'0', '2026-06-17 08:32:44.851504'),
(250, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260617-26 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'1', '2026-06-17 08:32:44.852520'),
(251, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260617-26 của bạn đã được Admin phê duyệt và đang mở đấu giá. Các nhà thầu sẽ sớm gửi báo giá!', NULL, NULL, b'1', '2026-06-17 08:33:08.947764'),
(252, 2, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260617-26. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-17 08:33:08.956240'),
(253, 3, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260617-26. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-17 08:33:08.959438'),
(254, 10, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260617-26. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-17 08:33:08.960436'),
(255, 11, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260617-26. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-17 08:33:08.962874'),
(256, 12, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260617-26. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-17 08:33:08.965063'),
(257, 13, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260617-26. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-17 08:33:08.968058'),
(258, 15, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260617-26. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-17 08:33:08.968796'),
(259, 17, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260617-26. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-17 08:33:08.972751'),
(260, 14, 'BID_RECEIVED', NULL, 'Đơn hàng ORD-20260617-26 vừa nhận được báo giá mới từ a — 2 triệu đ', NULL, NULL, b'1', '2026-06-17 08:33:55.281883'),
(261, 15, 'SYSTEM', NULL, '🎉 Báo giá của bạn cho đơn ORD-20260617-26 đã được chấp nhận! Hợp đồng CTR-ORD-20260617153438-26 đã được tạo, chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-17 08:34:38.542040'),
(262, 1, 'SYSTEM', NULL, '📋 Hợp đồng CTR-ORD-20260617153438-26 từ đơn ORD-20260617-26 cần phê duyệt: a — 2 triệu đ', NULL, NULL, b'0', '2026-06-17 08:34:38.554209'),
(263, 14, 'SYSTEM', NULL, 'HD CTR-ORD-20260617153438-26 duoc duyet! Vao trang Hop dong de ky xac nhan.', NULL, NULL, b'1', '2026-06-17 08:35:24.420597'),
(264, 15, 'SYSTEM', NULL, 'HD CTR-ORD-20260617153438-26 duoc duyet! Khi ky HD can ky quy 100.000 VND (5%%).', NULL, NULL, b'0', '2026-06-17 08:35:24.429955'),
(265, 14, 'SYSTEM', NULL, 'Nha thau da ky HD CTR-ORD-20260617153438-26. Den luot ban ky de bat dau thi cong.', NULL, NULL, b'1', '2026-06-17 08:35:34.654903'),
(266, 15, 'SYSTEM', NULL, 'Khach hang da ky HD CTR-ORD-20260617153438-26. Vui long ky de bat dau thi cong.', NULL, NULL, b'0', '2026-06-17 08:35:40.965093'),
(267, 14, 'SYSTEM', NULL, 'HD CTR-ORD-20260617153438-26 chinh thuc ACTIVE! Cong trinh bat dau thi cong.', NULL, NULL, b'1', '2026-06-17 08:35:40.967101'),
(268, 15, 'SYSTEM', NULL, 'HD CTR-ORD-20260617153438-26 chinh thuc ACTIVE! Bat dau thi cong du an.', NULL, NULL, b'0', '2026-06-17 08:35:40.969126'),
(269, 14, 'MILESTONE_REQUEST', NULL, 'Nha thau da cap nhat tien do: 100% - HD CTR-ORD-20260617153438-26. [Bàn giao công trình]', NULL, NULL, b'1', '2026-06-17 08:37:04.502992'),
(270, 14, 'PAYMENT_SUCCESS', NULL, 'Nha thau yeu cau giai ngan 1.599.998 VND giai doan \'Bàn giao công trình\' - HD CTR-ORD-20260617153438-26. Vui long cho Admin xac nhan truoc.', NULL, NULL, b'1', '2026-06-17 08:37:42.579630'),
(271, 1, 'SYSTEM', NULL, '📋 Yeu cau giai ngan moi: HD CTR-ORD-20260617153438-26 - Nha thau a - Giai doan \'Bàn giao công trình\' - So tien: 1.599.998 VND. Can xac nhan.', NULL, NULL, b'0', '2026-06-17 08:37:42.584429'),
(272, 14, 'PAYMENT_SUCCESS', NULL, '✅ Admin da xac nhan yeu cau giai ngan 1.599.998 VND giai doan \'Bàn giao công trình\' - HD CTR-ORD-20260617153438-26. Vui long vao trang Tien do de duyet.', NULL, NULL, b'1', '2026-06-17 08:38:11.137872'),
(273, 15, 'SYSTEM', NULL, '✅ Admin da xac nhan yeu cau giai ngan giai doan \'Bàn giao công trình\'. Dang cho khach hang duyet.', NULL, NULL, b'0', '2026-06-17 08:38:11.141084'),
(274, 15, 'PAYMENT_SUCCESS', NULL, 'Khach hang da duyet giai ngan 1.599.998 VND giai doan \'Bàn giao công trình\'. 479.999 VND dung ngay, 1.119.999 VND con locked.', NULL, NULL, b'0', '2026-06-17 08:38:26.369020'),
(275, 14, 'PAYMENT_SUCCESS', NULL, 'HD CTR-ORD-20260617153438-26 hoan thanh! Nha thau nhan 95%% ngay. 5%% bao hanh giu 6 thang.', NULL, NULL, b'1', '2026-06-17 08:38:39.980755'),
(276, 15, 'PAYMENT_SUCCESS', NULL, 'HD CTR-ORD-20260617153438-26 hoan thanh! Nhan 1.899.998 VND ngay. 100.000 VND bao hanh giu den 2026-12-17.', NULL, NULL, b'0', '2026-06-17 08:38:39.986850');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `content`, `action_url`, `reference_id`, `is_read`, `created_at`) VALUES
(277, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260617-25 của bạn đã được Admin phê duyệt và đang mở đấu giá. Các nhà thầu sẽ sớm gửi báo giá!', NULL, NULL, b'1', '2026-06-17 08:40:15.293605'),
(278, 2, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260617-25. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-17 08:40:15.302140'),
(279, 3, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260617-25. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-17 08:40:15.304649'),
(280, 10, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260617-25. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-17 08:40:15.306897'),
(281, 11, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260617-25. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-17 08:40:15.307907'),
(282, 12, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260617-25. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-17 08:40:15.309945'),
(283, 13, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260617-25. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-17 08:40:15.311998'),
(284, 15, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260617-25. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-17 08:40:15.313995'),
(285, 17, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260617-25. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-17 08:40:15.315003'),
(286, 14, 'BID_RECEIVED', NULL, 'Đơn hàng ORD-20260617-25 vừa nhận được báo giá mới từ a — 4 triệu đ', NULL, NULL, b'1', '2026-06-17 08:41:03.764311'),
(287, 15, 'SYSTEM', NULL, '🎉 Báo giá của bạn cho đơn ORD-20260617-25 đã được chấp nhận! Hợp đồng CTR-ORD-20260617154516-25 đã được tạo, chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-17 08:45:16.119055'),
(288, 1, 'SYSTEM', NULL, '📋 Hợp đồng CTR-ORD-20260617154516-25 từ đơn ORD-20260617-25 cần phê duyệt: a — 4 triệu đ', NULL, NULL, b'0', '2026-06-17 08:45:16.126160'),
(289, 14, 'SYSTEM', NULL, 'HD CTR-ORD-20260617154516-25 duoc duyet! Vao trang Hop dong de ky xac nhan.', NULL, NULL, b'1', '2026-06-17 08:45:26.322652'),
(290, 15, 'SYSTEM', NULL, 'HD CTR-ORD-20260617154516-25 duoc duyet! Khi ky HD can ky quy 200.000 VND (5%%).', NULL, NULL, b'0', '2026-06-17 08:45:26.326019'),
(291, 15, 'SYSTEM', NULL, 'Khach hang da ky HD CTR-ORD-20260617154516-25. Vui long ky de bat dau thi cong.', NULL, NULL, b'0', '2026-06-17 08:45:54.579624'),
(292, 14, 'SYSTEM', NULL, 'Nha thau da ky HD CTR-ORD-20260617154516-25. Den luot ban ky de bat dau thi cong.', NULL, NULL, b'1', '2026-06-17 08:46:11.101264'),
(293, 14, 'SYSTEM', NULL, 'HD CTR-ORD-20260617154516-25 chinh thuc ACTIVE! Cong trinh bat dau thi cong.', NULL, NULL, b'1', '2026-06-17 08:46:11.103328'),
(294, 15, 'SYSTEM', NULL, 'HD CTR-ORD-20260617154516-25 chinh thuc ACTIVE! Bat dau thi cong du an.', NULL, NULL, b'0', '2026-06-17 08:46:11.105948'),
(295, 14, 'MILESTONE_REQUEST', NULL, 'Nha thau da cap nhat tien do: 100% - HD CTR-ORD-20260617154516-25.', NULL, NULL, b'1', '2026-06-17 08:46:27.599389'),
(296, 14, 'PAYMENT_SUCCESS', NULL, 'Nha thau yeu cau giai ngan 3.200.000 VND giai doan \'Bàn giao công trình\' - HD CTR-ORD-20260617154516-25. Vui long cho Admin xac nhan truoc.', NULL, NULL, b'1', '2026-06-17 08:46:43.513211'),
(297, 1, 'SYSTEM', NULL, '📋 Yeu cau giai ngan moi: HD CTR-ORD-20260617154516-25 - Nha thau a - Giai doan \'Bàn giao công trình\' - So tien: 3.200.000 VND. Can xac nhan.', NULL, NULL, b'0', '2026-06-17 08:46:43.523064'),
(298, 14, 'PAYMENT_SUCCESS', NULL, '✅ Admin da xac nhan yeu cau giai ngan 3.200.000 VND giai doan \'Bàn giao công trình\' - HD CTR-ORD-20260617154516-25. Vui long vao trang Tien do de duyet.', NULL, NULL, b'1', '2026-06-17 08:46:56.835619'),
(299, 15, 'SYSTEM', NULL, '✅ Admin da xac nhan yeu cau giai ngan giai doan \'Bàn giao công trình\'. Dang cho khach hang duyet.', NULL, NULL, b'0', '2026-06-17 08:46:56.838685'),
(300, 15, 'PAYMENT_SUCCESS', NULL, 'Khach hang da duyet giai ngan 3.200.000 VND giai doan \'Bàn giao công trình\'. 960.000 VND dung ngay, 2.240.000 VND con locked.', NULL, NULL, b'0', '2026-06-17 08:47:10.268847'),
(301, 14, 'BID_RECEIVED', NULL, 'Đơn hàng ORD-20260611-11 vừa nhận được báo giá mới từ a — 2 triệu đ', NULL, NULL, b'1', '2026-06-17 08:51:09.979003'),
(302, 14, 'PAYMENT_SUCCESS', NULL, 'HD CTR-ORD-20260617154516-25 hoan thanh! Nha thau nhan 95%% ngay. 5%% bao hanh giu 6 thang.', NULL, NULL, b'1', '2026-06-24 13:38:24.459085'),
(303, 15, 'PAYMENT_SUCCESS', NULL, 'HD CTR-ORD-20260617154516-25 hoan thanh! Nhan 3.800.000 VND ngay. 200.000 VND bao hanh giu den 2026-12-24.', NULL, NULL, b'0', '2026-06-24 13:38:24.474695'),
(304, 1, 'SYSTEM', NULL, '📦 Đơn hàng mới từ a — ORD-20260624-27. Cần phê duyệt & mở đấu giá.', NULL, NULL, b'0', '2026-06-24 14:33:50.767274'),
(305, 1, 'SYSTEM', NULL, '📦 Đơn hàng mới từ a — ORD-20260624-27. Cần phê duyệt & mở đấu giá.', NULL, NULL, b'0', '2026-06-24 14:33:50.774001'),
(306, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260624-27 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-24 14:33:50.777528'),
(307, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260624-27 của bạn đã được Admin phê duyệt và đang mở đấu giá. Các nhà thầu sẽ sớm gửi báo giá!', NULL, NULL, b'0', '2026-06-24 14:34:28.395637'),
(308, 2, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260624-27. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-24 14:34:28.417812'),
(309, 3, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260624-27. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-24 14:34:28.419822'),
(310, 10, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260624-27. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-24 14:34:28.422399'),
(311, 11, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260624-27. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-24 14:34:28.425403'),
(312, 12, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260624-27. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-24 14:34:28.429531'),
(313, 13, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260624-27. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-24 14:34:28.432156'),
(314, 15, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260624-27. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-24 14:34:28.434156'),
(315, 17, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260624-27. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-24 14:34:28.437234'),
(316, 14, 'BID_RECEIVED', NULL, 'Đơn hàng ORD-20260624-27 vừa nhận được báo giá mới từ a — 22 triệu đ', NULL, NULL, b'0', '2026-06-24 14:35:02.854936'),
(317, 15, 'SYSTEM', NULL, '🎉 Báo giá của bạn cho đơn ORD-20260624-27 đã được chấp nhận! Hợp đồng CTR-ORD-20260624213537-27 đã được tạo, chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-24 14:35:37.730710'),
(318, 1, 'SYSTEM', NULL, '📋 Hợp đồng CTR-ORD-20260624213537-27 từ đơn ORD-20260624-27 cần phê duyệt: a — 22 triệu đ', NULL, NULL, b'0', '2026-06-24 14:35:37.744823'),
(319, 14, 'SYSTEM', NULL, 'HD CTR-ORD-20260624213537-27 duoc duyet! Vao trang Hop dong de ky xac nhan.', NULL, NULL, b'0', '2026-06-24 14:36:07.668497'),
(320, 15, 'SYSTEM', NULL, 'HD CTR-ORD-20260624213537-27 duoc duyet! Khi ky HD can ky quy 1.111.111 VND (5%%).', NULL, NULL, b'0', '2026-06-24 14:36:07.677500'),
(321, 15, 'SYSTEM', NULL, 'Khach hang da ky HD CTR-ORD-20260624213537-27. Vui long ky de bat dau thi cong.', NULL, NULL, b'0', '2026-06-24 14:36:14.961455'),
(322, 14, 'SYSTEM', NULL, 'Nha thau da ky HD CTR-ORD-20260624213537-27. Den luot ban ky de bat dau thi cong.', NULL, NULL, b'0', '2026-06-24 14:36:19.454727'),
(323, 14, 'SYSTEM', NULL, 'HD CTR-ORD-20260624213537-27 chinh thuc ACTIVE! Cong trinh bat dau thi cong.', NULL, NULL, b'0', '2026-06-24 14:36:19.459412'),
(324, 15, 'SYSTEM', NULL, 'HD CTR-ORD-20260624213537-27 chinh thuc ACTIVE! Bat dau thi cong du an.', NULL, NULL, b'0', '2026-06-24 14:36:19.462545'),
(325, 14, 'DISPUTE', NULL, '⚠️ Khởi tạo tranh chấp: Hợp đồng CTR-ORD-20260624213537-27 đã bị đóng băng thi công và thanh toán. Lý do: chậm tiến độ .', NULL, NULL, b'0', '2026-06-24 14:40:55.272255'),
(326, 15, 'DISPUTE', NULL, '⚠️ Khởi tạo tranh chấp: Hợp đồng CTR-ORD-20260624213537-27 đã bị đóng băng thi công và thanh toán. Lý do: chậm tiến độ .', NULL, NULL, b'0', '2026-06-24 14:40:55.277713'),
(327, 1, 'DISPUTE', NULL, '[Hệ Thống] Tranh chấp mới được mở cho hợp đồng CTR-ORD-20260624213537-27', NULL, NULL, b'0', '2026-06-24 14:40:55.285831'),
(328, 14, 'MILESTONE_REQUEST', NULL, 'Nha thau da cap nhat tien do: 100% - HD CTR-ORD-20260624213537-27. [Bàn giao công trình]', NULL, NULL, b'0', '2026-06-24 14:55:23.423282'),
(329, 15, 'PAYMENT_SUCCESS', NULL, '✅ Da giai ngan 200.000 VND tien bao hanh HD CTR-ORD-20260617154516-25. Bao hanh ket thuc.', NULL, NULL, b'0', '2026-06-24 15:16:56.071565'),
(330, 14, 'SYSTEM', NULL, 'Tien bao hanh HD CTR-ORD-20260617154516-25 da duoc giai ngan cho nha thau sau 6 thang bao hanh.', NULL, NULL, b'0', '2026-06-24 15:16:56.075559'),
(331, 15, 'PAYMENT_SUCCESS', NULL, '✅ Da giai ngan 100.000 VND tien bao hanh HD CTR-ORD-20260617153438-26. Bao hanh ket thuc.', NULL, NULL, b'0', '2026-06-24 15:17:00.632913'),
(332, 14, 'SYSTEM', NULL, 'Tien bao hanh HD CTR-ORD-20260617153438-26 da duoc giai ngan cho nha thau sau 6 thang bao hanh.', NULL, NULL, b'0', '2026-06-24 15:17:00.636250'),
(333, 15, 'PAYMENT_SUCCESS', NULL, '✅ Da giai ngan 1.111.111 VND tien bao hanh HD CTR-ORD-20260612184928-24. Bao hanh ket thuc.', NULL, NULL, b'0', '2026-06-24 15:17:12.057522'),
(334, 16, 'SYSTEM', NULL, 'Tien bao hanh HD CTR-ORD-20260612184928-24 da duoc giai ngan cho nha thau sau 6 thang bao hanh.', NULL, NULL, b'0', '2026-06-24 15:17:12.061104'),
(335, 1, 'SYSTEM', NULL, '📦 Đơn hàng mới từ a — ORD-20260625-28. Cần phê duyệt & mở đấu giá.', NULL, NULL, b'0', '2026-06-25 13:52:47.910850'),
(336, 1, 'SYSTEM', NULL, '📦 Đơn hàng mới từ a — ORD-20260625-28. Cần phê duyệt & mở đấu giá.', NULL, NULL, b'0', '2026-06-25 13:52:47.920240'),
(337, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260625-28 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-25 13:52:47.925061'),
(338, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260625-28 của bạn đã được Admin phê duyệt và đang mở đấu giá. Các nhà thầu sẽ sớm gửi báo giá!', NULL, NULL, b'0', '2026-06-25 13:52:56.282773'),
(339, 2, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260625-28. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-25 13:52:56.289446'),
(340, 3, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260625-28. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-25 13:52:56.291431'),
(341, 10, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260625-28. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-25 13:52:56.293434'),
(342, 11, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260625-28. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-25 13:52:56.295843'),
(343, 12, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260625-28. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-25 13:52:56.296861'),
(344, 13, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260625-28. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-25 13:52:56.297857'),
(345, 15, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260625-28. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-25 13:52:56.299369'),
(346, 17, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260625-28. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-25 13:52:56.301413'),
(347, 14, 'BID_RECEIVED', NULL, 'Đơn hàng ORD-20260625-28 vừa nhận được báo giá mới từ a — 2 triệu đ', NULL, NULL, b'0', '2026-06-25 13:53:16.383610'),
(348, 15, 'SYSTEM', NULL, '🎉 Báo giá của bạn cho đơn ORD-20260625-28 đã được chấp nhận! Hợp đồng CTR-ORD-20260625205425-28 đã được tạo, chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-25 13:54:25.691346'),
(349, 1, 'SYSTEM', NULL, '📋 Hợp đồng CTR-ORD-20260625205425-28 từ đơn ORD-20260625-28 cần phê duyệt: a — 2 triệu đ', NULL, NULL, b'0', '2026-06-25 13:54:25.713348'),
(350, 14, 'SYSTEM', NULL, 'HD CTR-ORD-20260625205425-28 duoc duyet! Vao trang Hop dong de ky xac nhan.', NULL, NULL, b'0', '2026-06-25 13:54:58.517739'),
(351, 15, 'SYSTEM', NULL, 'HD CTR-ORD-20260625205425-28 duoc duyet! Khi ky HD can ky quy 111.111 VND (5%%).', NULL, NULL, b'0', '2026-06-25 13:54:58.532798'),
(352, 14, 'SYSTEM', NULL, 'Nha thau da ky HD CTR-ORD-20260625205425-28. Den luot ban ky de bat dau thi cong.', NULL, NULL, b'0', '2026-06-25 13:55:07.294298'),
(353, 15, 'SYSTEM', NULL, 'Khach hang da ky HD CTR-ORD-20260625205425-28. Vui long ky de bat dau thi cong.', NULL, NULL, b'0', '2026-06-25 13:55:12.120429'),
(354, 14, 'SYSTEM', NULL, 'HD CTR-ORD-20260625205425-28 chinh thuc ACTIVE! Cong trinh bat dau thi cong.', NULL, NULL, b'0', '2026-06-25 13:55:12.123439'),
(355, 15, 'SYSTEM', NULL, 'HD CTR-ORD-20260625205425-28 chinh thuc ACTIVE! Bat dau thi cong du an.', NULL, NULL, b'0', '2026-06-25 13:55:12.125701'),
(356, 14, 'MILESTONE_REQUEST', NULL, 'Nha thau da cap nhat tien do: 100% - HD CTR-ORD-20260625205425-28. [Bàn giao công trình]', NULL, NULL, b'0', '2026-06-25 13:55:42.045899'),
(357, 14, 'PAYMENT_SUCCESS', NULL, 'Nha thau yeu cau giai ngan 1.777.777 VND giai doan \'Bàn giao công trình\' - HD CTR-ORD-20260625205425-28. Vui long cho Admin xac nhan truoc.', NULL, NULL, b'0', '2026-06-25 13:56:17.120190'),
(358, 1, 'SYSTEM', NULL, '📋 Yeu cau giai ngan moi: HD CTR-ORD-20260625205425-28 - Nha thau a - Giai doan \'Bàn giao công trình\' - So tien: 1.777.777 VND. Can xac nhan.', NULL, NULL, b'0', '2026-06-25 13:56:17.125430'),
(359, 14, 'PAYMENT_SUCCESS', NULL, '✅ Admin da xac nhan yeu cau giai ngan 1.777.777 VND giai doan \'Bàn giao công trình\' - HD CTR-ORD-20260625205425-28. Vui long vao trang Tien do de duyet.', NULL, NULL, b'0', '2026-06-25 13:56:31.961394'),
(360, 15, 'SYSTEM', NULL, '✅ Admin da xac nhan yeu cau giai ngan giai doan \'Bàn giao công trình\'. Dang cho khach hang duyet.', NULL, NULL, b'0', '2026-06-25 13:56:31.966668'),
(361, 15, 'PAYMENT_SUCCESS', NULL, 'Khach hang da duyet giai ngan 1.777.777 VND giai doan \'Bàn giao công trình\'. 533.333 VND dung ngay, 1.244.444 VND con locked.', NULL, NULL, b'0', '2026-06-25 13:56:46.141379'),
(362, 14, 'PAYMENT_SUCCESS', NULL, 'HD CTR-ORD-20260625205425-28 hoan thanh! Nha thau nhan 95%% ngay. 5%% bao hanh giu 6 thang.', NULL, NULL, b'0', '2026-06-25 13:58:53.522507'),
(363, 15, 'PAYMENT_SUCCESS', NULL, 'HD CTR-ORD-20260625205425-28 hoan thanh! Nhan 2.000.000 VND ngay. 111.111 VND bao hanh giu den 2026-12-25.', NULL, NULL, b'0', '2026-06-25 13:58:53.525549'),
(364, 15, 'PAYMENT_SUCCESS', NULL, '✅ Da giai ngan 111.111 VND tien bao hanh HD CTR-ORD-20260625205425-28. Bao hanh ket thuc.', NULL, NULL, b'0', '2026-06-25 14:01:21.411098'),
(365, 14, 'SYSTEM', NULL, 'Tien bao hanh HD CTR-ORD-20260625205425-28 da duoc giai ngan cho nha thau sau 6 thang bao hanh.', NULL, NULL, b'0', '2026-06-25 14:01:21.415600'),
(366, 1, 'SYSTEM', NULL, '📦 Đơn hàng mới từ a — ORD-20260625-29. Cần phê duyệt & mở đấu giá.', NULL, NULL, b'0', '2026-06-25 14:25:12.904923'),
(367, 1, 'SYSTEM', NULL, '📦 Đơn hàng mới từ a — ORD-20260625-29. Cần phê duyệt & mở đấu giá.', NULL, NULL, b'0', '2026-06-25 14:25:12.913642'),
(368, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260625-29 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-25 14:25:12.915661'),
(369, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260625-29 của bạn đã được Admin phê duyệt và đang mở đấu giá. Các nhà thầu sẽ sớm gửi báo giá!', NULL, NULL, b'0', '2026-06-25 14:27:07.530300'),
(370, 2, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260625-29. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-25 14:27:07.535084'),
(371, 3, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260625-29. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-25 14:27:07.537590'),
(372, 10, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260625-29. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-25 14:27:07.539596'),
(373, 11, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260625-29. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-25 14:27:07.542598'),
(374, 12, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260625-29. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-25 14:27:07.544605'),
(375, 13, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260625-29. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-25 14:27:07.547620'),
(376, 15, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260625-29. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-25 14:27:07.549954'),
(377, 17, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260625-29. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-25 14:27:07.550954'),
(378, 14, 'BID_RECEIVED', NULL, 'Đơn hàng ORD-20260625-29 vừa nhận được báo giá mới từ a — 20 triệu đ', NULL, NULL, b'0', '2026-06-25 14:28:24.037854'),
(379, 15, 'SYSTEM', NULL, '🎉 Báo giá của bạn cho đơn ORD-20260625-29 đã được chấp nhận! Hợp đồng CTR-ORD-20260625213226-29 đã được tạo, chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-25 14:32:26.192131'),
(380, 1, 'SYSTEM', NULL, '📋 Hợp đồng CTR-ORD-20260625213226-29 từ đơn ORD-20260625-29 cần phê duyệt: a — 20 triệu đ', NULL, NULL, b'0', '2026-06-25 14:32:26.206522'),
(381, 14, 'SYSTEM', NULL, 'HD CTR-ORD-20260625213226-29 duoc duyet! Vao trang Hop dong de ky xac nhan.', NULL, NULL, b'0', '2026-06-25 14:32:44.716377'),
(382, 15, 'SYSTEM', NULL, 'HD CTR-ORD-20260625213226-29 duoc duyet! Khi ky HD can ky quy 1.000.000 VND (5%%).', NULL, NULL, b'0', '2026-06-25 14:32:44.718616'),
(383, 14, 'SYSTEM', NULL, 'Nha thau da ky HD CTR-ORD-20260625213226-29. Den luot ban ky de bat dau thi cong.', NULL, NULL, b'0', '2026-06-25 14:32:50.872199'),
(384, 15, 'SYSTEM', NULL, 'Khach hang da ky HD CTR-ORD-20260625213226-29. Vui long ky de bat dau thi cong.', NULL, NULL, b'0', '2026-06-25 14:32:57.694825'),
(385, 14, 'SYSTEM', NULL, 'HD CTR-ORD-20260625213226-29 chinh thuc ACTIVE! Cong trinh bat dau thi cong.', NULL, NULL, b'0', '2026-06-25 14:32:57.697395'),
(386, 15, 'SYSTEM', NULL, 'HD CTR-ORD-20260625213226-29 chinh thuc ACTIVE! Bat dau thi cong du an.', NULL, NULL, b'0', '2026-06-25 14:32:57.700407'),
(387, 14, 'DISPUTE', NULL, '⚠️ Khởi tạo tranh chấp: Hợp đồng CTR-ORD-20260625213226-29 đã bị đóng băng thi công và thanh toán. Lý do: sai .', NULL, NULL, b'0', '2026-06-25 14:33:21.455818'),
(388, 15, 'DISPUTE', NULL, '⚠️ Khởi tạo tranh chấp: Hợp đồng CTR-ORD-20260625213226-29 đã bị đóng băng thi công và thanh toán. Lý do: sai .', NULL, NULL, b'0', '2026-06-25 14:33:21.457463'),
(389, 1, 'DISPUTE', NULL, '[Hệ Thống] Tranh chấp mới được mở cho hợp đồng CTR-ORD-20260625213226-29', NULL, NULL, b'0', '2026-06-25 14:33:21.464505'),
(390, 1, 'SYSTEM', NULL, '📦 Đơn hàng mới từ a — ORD-20260625-30. Cần phê duyệt & mở đấu giá.', NULL, NULL, b'0', '2026-06-25 14:38:15.131797'),
(391, 1, 'SYSTEM', NULL, '📦 Đơn hàng mới từ a — ORD-20260625-30. Cần phê duyệt & mở đấu giá.', NULL, NULL, b'0', '2026-06-25 14:38:15.139417'),
(392, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260625-30 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-25 14:38:15.143889'),
(393, 1, 'SYSTEM', NULL, '📦 Đơn hàng mới từ a — ORD-20260625-31. Cần phê duyệt & mở đấu giá.', NULL, NULL, b'0', '2026-06-25 14:38:58.513285'),
(394, 1, 'SYSTEM', NULL, '📦 Đơn hàng mới từ a — ORD-20260625-31. Cần phê duyệt & mở đấu giá.', NULL, NULL, b'0', '2026-06-25 14:38:58.519830'),
(395, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260625-31 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-25 14:38:58.521830'),
(396, 14, 'MILESTONE_REQUEST', NULL, 'Nha thau da cap nhat tien do: 100% - HD CTR-ORD-20260625213226-29. [Hoàn thiện]', NULL, NULL, b'0', '2026-06-26 14:15:57.647327'),
(397, 16, 'BID_RECEIVED', NULL, 'Đơn hàng ORD-20260612-21 vừa nhận được báo giá mới từ a — 222,222đ', NULL, NULL, b'0', '2026-06-26 14:25:22.566840'),
(398, 15, 'SYSTEM', NULL, '🎉 Báo giá của bạn cho đơn ORD-20260611-11 đã được chấp nhận! Hợp đồng CTR-ORD-20260626212604-11 đã được tạo, chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-26 14:26:04.682027'),
(399, 1, 'SYSTEM', NULL, '📋 Hợp đồng CTR-ORD-20260626212604-11 từ đơn ORD-20260611-11 cần phê duyệt: a — 2 triệu đ', NULL, NULL, b'0', '2026-06-26 14:26:04.700776'),
(400, 14, 'SYSTEM', NULL, 'HD CTR-ORD-20260626212604-11 duoc duyet! Vao trang Hop dong de ky xac nhan.', NULL, NULL, b'0', '2026-06-26 14:26:19.377348'),
(401, 15, 'SYSTEM', NULL, 'HD CTR-ORD-20260626212604-11 duoc duyet! Khi ky HD can ky quy 111.111 VND (5%%).', NULL, NULL, b'0', '2026-06-26 14:26:19.385914'),
(402, 15, 'SYSTEM', NULL, 'Khach hang da ky HD CTR-ORD-20260626212604-11. Vui long ky de bat dau thi cong.', NULL, NULL, b'0', '2026-06-26 14:28:52.182065'),
(403, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260625-30 của bạn đã được Admin phê duyệt và đang mở đấu giá. Các nhà thầu sẽ sớm gửi báo giá!', NULL, NULL, b'0', '2026-06-26 14:30:51.981190'),
(404, 2, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260625-30. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-26 14:30:51.987190'),
(405, 3, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260625-30. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-26 14:30:51.989747'),
(406, 10, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260625-30. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-26 14:30:51.991730'),
(407, 11, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260625-30. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-26 14:30:51.993900'),
(408, 12, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260625-30. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-26 14:30:51.995895'),
(409, 13, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260625-30. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-26 14:30:51.996896'),
(410, 15, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260625-30. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-26 14:30:52.000438'),
(411, 17, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260625-30. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-26 14:30:52.002447'),
(412, 14, 'BID_RECEIVED', NULL, 'Đơn hàng ORD-20260625-30 vừa nhận được báo giá mới từ a — 12 triệu đ', NULL, NULL, b'0', '2026-06-26 14:32:07.075001'),
(413, 1, 'SYSTEM', NULL, '📦 Đơn hàng mới từ a — ORD-20260626-32. Cần phê duyệt & mở đấu giá.', NULL, NULL, b'0', '2026-06-26 14:34:31.347036'),
(414, 1, 'SYSTEM', NULL, '📦 Đơn hàng mới từ a — ORD-20260626-32. Cần phê duyệt & mở đấu giá.', NULL, NULL, b'0', '2026-06-26 14:34:31.352823'),
(415, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260626-32 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-26 14:34:31.354956'),
(416, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260626-32 của bạn đã được Admin phê duyệt và đang mở đấu giá. Các nhà thầu sẽ sớm gửi báo giá!', NULL, NULL, b'0', '2026-06-26 14:34:56.801622'),
(417, 2, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"Châu Ă\" — ORD-20260626-32. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-26 14:34:56.806635'),
(418, 3, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"Châu Ă\" — ORD-20260626-32. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-26 14:34:56.808633'),
(419, 10, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"Châu Ă\" — ORD-20260626-32. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-26 14:34:56.809635'),
(420, 11, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"Châu Ă\" — ORD-20260626-32. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-26 14:34:56.811140'),
(421, 12, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"Châu Ă\" — ORD-20260626-32. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-26 14:34:56.813158'),
(422, 13, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"Châu Ă\" — ORD-20260626-32. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-26 14:34:56.814160'),
(423, 15, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"Châu Ă\" — ORD-20260626-32. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-26 14:34:56.816114'),
(424, 17, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"Châu Ă\" — ORD-20260626-32. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-26 14:34:56.818118'),
(425, 14, 'BID_RECEIVED', NULL, 'Đơn hàng ORD-20260626-32 vừa nhận được báo giá mới từ a — 25 triệu đ', NULL, NULL, b'0', '2026-06-26 14:35:25.870610'),
(426, 15, 'SYSTEM', NULL, '🎉 Báo giá của bạn cho đơn ORD-20260626-32 đã được chấp nhận! Hợp đồng CTR-ORD-20260626213544-32 đã được tạo, chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-26 14:35:44.473740'),
(427, 1, 'SYSTEM', NULL, '📋 Hợp đồng CTR-ORD-20260626213544-32 từ đơn ORD-20260626-32 cần phê duyệt: a — 25 triệu đ', NULL, NULL, b'0', '2026-06-26 14:35:44.488297'),
(428, 14, 'SYSTEM', NULL, 'HD CTR-ORD-20260626213544-32 duoc duyet! Vao trang Hop dong de ky xac nhan.', NULL, NULL, b'0', '2026-06-26 14:35:54.837488'),
(429, 15, 'SYSTEM', NULL, 'HD CTR-ORD-20260626213544-32 duoc duyet! Khi ky HD can ky quy 1.250.000 VND (5%%).', NULL, NULL, b'0', '2026-06-26 14:35:54.839489'),
(430, 15, 'SYSTEM', NULL, 'Khach hang da ky HD CTR-ORD-20260626213544-32. Vui long ky de bat dau thi cong.', NULL, NULL, b'0', '2026-06-26 14:36:11.777258'),
(431, 14, 'SYSTEM', NULL, 'Nha thau da ky HD CTR-ORD-20260626213544-32. Den luot ban ky de bat dau thi cong.', NULL, NULL, b'0', '2026-06-26 14:38:57.209036'),
(432, 14, 'SYSTEM', NULL, 'HD CTR-ORD-20260626213544-32 chinh thuc ACTIVE! Cong trinh bat dau thi cong.', NULL, NULL, b'0', '2026-06-26 14:38:57.212767'),
(433, 15, 'SYSTEM', NULL, 'HD CTR-ORD-20260626213544-32 chinh thuc ACTIVE! Bat dau thi cong du an.', NULL, NULL, b'0', '2026-06-26 14:38:57.216437'),
(434, 14, 'SYSTEM', NULL, 'Nha thau da ky HD CTR-ORD-20260626212604-11. Den luot ban ky de bat dau thi cong.', NULL, NULL, b'0', '2026-06-26 14:39:19.795135'),
(435, 14, 'SYSTEM', NULL, 'HD CTR-ORD-20260626212604-11 chinh thuc ACTIVE! Cong trinh bat dau thi cong.', NULL, NULL, b'0', '2026-06-26 14:39:19.798121'),
(436, 15, 'SYSTEM', NULL, 'HD CTR-ORD-20260626212604-11 chinh thuc ACTIVE! Bat dau thi cong du an.', NULL, NULL, b'0', '2026-06-26 14:39:19.801961'),
(437, 14, 'MILESTONE_REQUEST', NULL, 'Nha thau da cap nhat tien do: 50% - HD CTR-ORD-20260626213544-32. [Thi công phần thô]', NULL, NULL, b'0', '2026-06-26 14:40:01.541418'),
(438, 14, 'PAYMENT_SUCCESS', NULL, 'Nha thau yeu cau giai ngan 5.000.000 VND giai doan \'Thi công phần thô\' - HD CTR-ORD-20260626213544-32. Vui long cho Admin xac nhan truoc.', NULL, NULL, b'0', '2026-06-26 14:41:08.967868'),
(439, 1, 'SYSTEM', NULL, '📋 Yeu cau giai ngan moi: HD CTR-ORD-20260626213544-32 - Nha thau a - Giai doan \'Thi công phần thô\' - So tien: 5.000.000 VND. Can xac nhan.', NULL, NULL, b'0', '2026-06-26 14:41:08.977079'),
(440, 14, 'PAYMENT_SUCCESS', NULL, '✅ Admin da xac nhan yeu cau giai ngan 5.000.000 VND giai doan \'Thi công phần thô\' - HD CTR-ORD-20260626213544-32. Vui long vao trang Tien do de duyet.', NULL, NULL, b'0', '2026-06-26 14:43:32.470934'),
(441, 15, 'SYSTEM', NULL, '✅ Admin da xac nhan yeu cau giai ngan giai doan \'Thi công phần thô\'. Dang cho khach hang duyet.', NULL, NULL, b'0', '2026-06-26 14:43:32.476051'),
(442, 14, 'DISPUTE', NULL, '⚠️ Khởi tạo tranh chấp: Hợp đồng CTR-ORD-20260626213544-32 đã bị đóng băng thi công và thanh toán. Lý do: sai yêu câu .', NULL, NULL, b'0', '2026-06-26 14:44:46.321208'),
(443, 15, 'DISPUTE', NULL, '⚠️ Khởi tạo tranh chấp: Hợp đồng CTR-ORD-20260626213544-32 đã bị đóng băng thi công và thanh toán. Lý do: sai yêu câu .', NULL, NULL, b'0', '2026-06-26 14:44:46.324337'),
(444, 1, 'DISPUTE', NULL, '[Hệ Thống] Tranh chấp mới được mở cho hợp đồng CTR-ORD-20260626213544-32', NULL, NULL, b'0', '2026-06-26 14:44:46.333052'),
(445, 1, 'SYSTEM', NULL, '📦 Đơn hàng mới từ a — ORD-20260626-33. Cần phê duyệt & mở đấu giá.', NULL, NULL, b'0', '2026-06-26 16:29:19.384198'),
(446, 1, 'SYSTEM', NULL, '📦 Đơn hàng mới từ a — ORD-20260626-33. Cần phê duyệt & mở đấu giá.', NULL, NULL, b'0', '2026-06-26 16:29:19.404446'),
(447, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260626-33 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-26 16:29:19.411246'),
(448, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260626-33 của bạn đã được Admin phê duyệt và đang mở đấu giá. Các nhà thầu sẽ sớm gửi báo giá!', NULL, NULL, b'0', '2026-06-26 16:29:41.833373'),
(449, 2, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260626-33. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-26 16:29:41.840530'),
(450, 3, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260626-33. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-26 16:29:41.843529'),
(451, 10, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260626-33. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-26 16:29:41.845518'),
(452, 11, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260626-33. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-26 16:29:41.848638'),
(453, 12, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260626-33. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-26 16:29:41.849652'),
(454, 13, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260626-33. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-26 16:29:41.851647'),
(455, 15, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260626-33. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-26 16:29:41.853651'),
(456, 17, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260626-33. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-26 16:29:41.856121'),
(457, 14, 'BID_RECEIVED', NULL, 'Đơn hàng ORD-20260626-33 vừa nhận được báo giá mới từ a — 2 triệu đ', NULL, NULL, b'0', '2026-06-26 16:30:02.889829'),
(458, 15, 'SYSTEM', NULL, '🎉 Báo giá của bạn cho đơn ORD-20260626-33 đã được chấp nhận! Hợp đồng CTR-ORD-20260626233019-33 đã được tạo, chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-26 16:30:19.042057'),
(459, 1, 'SYSTEM', NULL, '📋 Hợp đồng CTR-ORD-20260626233019-33 từ đơn ORD-20260626-33 cần phê duyệt: a — 2 triệu đ', NULL, NULL, b'0', '2026-06-26 16:30:19.065896'),
(460, 14, 'SYSTEM', NULL, 'HD CTR-ORD-20260626233019-33 duoc duyet! Vao trang Hop dong de ky xac nhan.', NULL, NULL, b'0', '2026-06-26 16:30:36.256638'),
(461, 15, 'SYSTEM', NULL, 'HD CTR-ORD-20260626233019-33 duoc duyet! Khi ky HD can ky quy 111.111 VND (5%%).', NULL, NULL, b'0', '2026-06-26 16:30:36.267325'),
(462, 15, 'SYSTEM', NULL, 'Khach hang da ky HD CTR-ORD-20260626233019-33. Vui long ky de bat dau thi cong.', NULL, NULL, b'0', '2026-06-26 16:30:57.827515'),
(463, 14, 'SYSTEM', NULL, 'Nha thau da ky HD CTR-ORD-20260626233019-33. Den luot ban ky de bat dau thi cong.', NULL, NULL, b'0', '2026-06-26 16:31:10.410695'),
(464, 14, 'SYSTEM', NULL, 'HD CTR-ORD-20260626233019-33 chinh thuc ACTIVE! Cong trinh bat dau thi cong.', NULL, NULL, b'0', '2026-06-26 16:31:10.413820'),
(465, 15, 'SYSTEM', NULL, 'HD CTR-ORD-20260626233019-33 chinh thuc ACTIVE! Bat dau thi cong du an.', NULL, NULL, b'0', '2026-06-26 16:31:10.417697'),
(466, 14, 'MILESTONE_REQUEST', NULL, 'Nha thau da cap nhat tien do: 100% - HD CTR-ORD-20260626233019-33.', NULL, NULL, b'0', '2026-06-26 16:31:32.736726'),
(467, 14, 'PAYMENT_SUCCESS', NULL, 'Nha thau yeu cau giai ngan 1.500.000 VND giai doan \'Bàn giao công trình\' - HD CTR-ORD-20260626233019-33. Vui long vao trang Tien do de duyet.', NULL, NULL, b'0', '2026-06-26 16:32:05.911323'),
(468, 1, 'SYSTEM', NULL, '📋 Yeu cau giai ngan moi: HD CTR-ORD-20260626233019-33 - Nha thau a - Giai doan \'Bàn giao công trình\' - So tien: 1.500.000 VND. Can xac nhan.', NULL, NULL, b'0', '2026-06-26 16:32:05.924724'),
(469, 15, 'PAYMENT_SUCCESS', NULL, 'Khach hang da duyet giai ngan 1.500.000 VND giai doan \'Bàn giao công trình\'. 450.000 VND dung ngay, 1.050.000 VND con locked.', NULL, NULL, b'0', '2026-06-26 16:32:42.965099'),
(470, 14, 'PAYMENT_SUCCESS', NULL, 'HD CTR-ORD-20260626233019-33 hoan thanh! Nha thau nhan 95%% ngay. 5%% bao hanh giu 6 thang.', NULL, NULL, b'0', '2026-06-26 16:33:04.871460'),
(471, 15, 'PAYMENT_SUCCESS', NULL, 'HD CTR-ORD-20260626233019-33 hoan thanh! Nhan 2.000.000 VND ngay. 111.111 VND bao hanh giu den 2026-12-26.', NULL, NULL, b'0', '2026-06-26 16:33:04.875472'),
(472, 15, 'PAYMENT_SUCCESS', NULL, 'Da mo khoa 1.050.000 VND tien bao dam giai doan \'Bàn giao công trình\' HD CTR-ORD-20260626233019-33.', NULL, NULL, b'0', '2026-06-26 16:34:21.423781'),
(473, 14, 'SYSTEM', NULL, '🔓 Hợp đồng CTR-ORD-20260626213544-32 đã được Admin bỏ phong tỏa. Quá trình thi công và các hoạt động khác có thể tiếp tục.', NULL, NULL, b'0', '2026-06-27 07:58:12.554416'),
(474, 15, 'SYSTEM', NULL, '🔓 Hợp đồng CTR-ORD-20260626213544-32 đã được Admin bỏ phong tỏa. Quá trình thi công và các hoạt động khác có thể tiếp tục.', NULL, NULL, b'0', '2026-06-27 07:58:12.564457'),
(475, 14, 'SYSTEM', NULL, '🔓 Hợp đồng CTR-ORD-20260625213226-29 đã được Admin bỏ phong tỏa. Quá trình thi công và các hoạt động khác có thể tiếp tục.', NULL, NULL, b'0', '2026-06-27 08:05:25.496926'),
(476, 15, 'SYSTEM', NULL, '🔓 Hợp đồng CTR-ORD-20260625213226-29 đã được Admin bỏ phong tỏa. Quá trình thi công và các hoạt động khác có thể tiếp tục.', NULL, NULL, b'0', '2026-06-27 08:05:25.500253'),
(477, 1, 'SYSTEM', NULL, '📦 Đơn hàng mới từ a — ORD-20260627-34. Cần phê duyệt & mở đấu giá.', NULL, NULL, b'0', '2026-06-27 08:44:21.800171'),
(478, 1, 'SYSTEM', NULL, '📦 Đơn hàng mới từ a — ORD-20260627-34. Cần phê duyệt & mở đấu giá.', NULL, NULL, b'0', '2026-06-27 08:44:21.806933'),
(479, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260627-34 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-27 08:44:21.809463'),
(480, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260627-34 của bạn đã được Admin phê duyệt và đang mở đấu giá. Các nhà thầu sẽ sớm gửi báo giá!', NULL, NULL, b'0', '2026-06-27 08:45:16.501016'),
(481, 2, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260627-34. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-27 08:45:16.501016'),
(482, 3, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260627-34. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-27 08:45:16.512310'),
(483, 10, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260627-34. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-27 08:45:16.512310'),
(484, 11, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260627-34. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-27 08:45:16.521130'),
(485, 12, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260627-34. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-27 08:45:16.521130'),
(486, 13, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260627-34. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-27 08:45:16.528022'),
(487, 15, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260627-34. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-27 08:45:16.531076'),
(488, 17, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"\" — ORD-20260627-34. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-27 08:45:16.532619'),
(489, 1, 'SYSTEM', NULL, '📦 Đơn hàng mới từ a — ORD-20260627-35. Cần phê duyệt & mở đấu giá.', NULL, NULL, b'0', '2026-06-27 10:11:26.036899'),
(490, 1, 'SYSTEM', NULL, '📦 Đơn hàng mới từ a — ORD-20260627-35. Cần phê duyệt & mở đấu giá.', NULL, NULL, b'0', '2026-06-27 10:11:26.060518'),
(491, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260627-35 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-27 10:11:26.072822'),
(492, 14, 'SYSTEM', NULL, 'Dự án #9 - Sofa văng 3 chỗ Scandinavian đã được admin duyệt và hiển thị trên sàn.', NULL, NULL, b'0', '2026-06-27 10:12:30.550810'),
(493, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260627-35 của bạn đã được Admin phê duyệt và đang mở đấu giá. Các nhà thầu sẽ sớm gửi báo giá!', NULL, NULL, b'0', '2026-06-27 10:12:37.490742'),
(494, 2, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260627-35. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-27 10:12:37.499329'),
(495, 3, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260627-35. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-27 10:12:37.499329'),
(496, 10, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260627-35. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-27 10:12:37.499329'),
(497, 11, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260627-35. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-27 10:12:37.504977'),
(498, 12, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260627-35. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-27 10:12:37.504977'),
(499, 13, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260627-35. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-27 10:12:37.507855'),
(500, 15, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260627-35. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-27 10:12:37.507855'),
(501, 17, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối...\" — ORD-20260627-35. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-27 10:12:37.507855'),
(502, 14, 'BID_RECEIVED', NULL, 'Đơn hàng ORD-20260627-34 vừa nhận được báo giá mới từ a — 21 triệu đ', NULL, NULL, b'0', '2026-06-27 10:13:43.156539'),
(503, 14, 'BID_RECEIVED', NULL, 'Đơn hàng ORD-20260627-35 vừa nhận được báo giá mới từ a — 11 triệu đ', NULL, NULL, b'0', '2026-06-27 10:13:57.794555'),
(504, 1, 'SYSTEM', NULL, '📦 Đơn hàng mới từ a — ORD-20260627-36. Cần phê duyệt & mở đấu giá.', NULL, NULL, b'0', '2026-06-27 10:21:13.725512'),
(505, 1, 'SYSTEM', NULL, '📦 Đơn hàng mới từ a — ORD-20260627-36. Cần phê duyệt & mở đấu giá.', NULL, NULL, b'0', '2026-06-27 10:21:13.738065'),
(506, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260627-36 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-27 10:21:13.744773'),
(507, 14, 'SYSTEM', NULL, 'Dự án #10 - Bàn ăn gỗ óc chó đã được admin duyệt và hiển thị trên sàn.', NULL, NULL, b'0', '2026-06-27 10:24:51.923682'),
(508, 15, 'SYSTEM', NULL, '🎉 Báo giá của bạn cho đơn ORD-20260627-35 đã được chấp nhận! Hợp đồng CTR-ORD-20260627172807-35 đã được tạo, chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-27 10:28:07.426831'),
(509, 1, 'SYSTEM', NULL, '📋 Hợp đồng CTR-ORD-20260627172807-35 từ đơn ORD-20260627-35 cần phê duyệt: a — 11 triệu đ', NULL, NULL, b'0', '2026-06-27 10:28:07.445261'),
(510, 14, 'SYSTEM', NULL, 'HD CTR-ORD-20260627172807-35 duoc duyet! Vao trang Hop dong de ky xac nhan.', NULL, NULL, b'0', '2026-06-27 10:28:16.744173'),
(511, 15, 'SYSTEM', NULL, 'HD CTR-ORD-20260627172807-35 duoc duyet! Khi ky HD can ky quy 555.556 VND (5%%).', NULL, NULL, b'0', '2026-06-27 10:28:16.754883'),
(512, 14, 'SYSTEM', NULL, 'Nha thau da ky HD CTR-ORD-20260627172807-35. Den luot ban ky de bat dau thi cong.', NULL, NULL, b'0', '2026-06-27 10:28:22.840745'),
(513, 15, 'SYSTEM', NULL, 'Khach hang da ky HD CTR-ORD-20260627172807-35. Vui long ky de bat dau thi cong.', NULL, NULL, b'0', '2026-06-27 10:28:32.774696'),
(514, 14, 'SYSTEM', NULL, 'HD CTR-ORD-20260627172807-35 chinh thuc ACTIVE! Cong trinh bat dau thi cong.', NULL, NULL, b'0', '2026-06-27 10:28:32.776325'),
(515, 15, 'SYSTEM', NULL, 'HD CTR-ORD-20260627172807-35 chinh thuc ACTIVE! Bat dau thi cong du an.', NULL, NULL, b'0', '2026-06-27 10:28:32.779873'),
(516, 14, 'DISPUTE', NULL, '⚠️ Khởi tạo tranh chấp: Hợp đồng CTR-ORD-20260627172807-35 đã bị đóng băng thi công và thanh toán. Lý do: sad.', NULL, NULL, b'0', '2026-06-27 10:29:28.071587'),
(517, 15, 'DISPUTE', NULL, '⚠️ Khởi tạo tranh chấp: Hợp đồng CTR-ORD-20260627172807-35 đã bị đóng băng thi công và thanh toán. Lý do: sad.', NULL, NULL, b'0', '2026-06-27 10:29:28.073760'),
(518, 1, 'DISPUTE', NULL, '[Hệ Thống] Tranh chấp mới được mở cho hợp đồng CTR-ORD-20260627172807-35', NULL, NULL, b'0', '2026-06-27 10:29:28.081317'),
(519, 14, 'MILESTONE_REQUEST', NULL, 'Nha thau da cap nhat tien do: 100% - HD CTR-ORD-20260626212604-11. [Bàn giao công trình]', NULL, NULL, b'0', '2026-06-27 11:01:49.304526'),
(520, 14, 'SYSTEM', NULL, '🔓 Hợp đồng CTR-ORD-20260627172807-35 đã được Admin bỏ phong tỏa. Quá trình thi công và các hoạt động khác có thể tiếp tục.', NULL, NULL, b'0', '2026-06-27 11:02:55.554522'),
(521, 15, 'SYSTEM', NULL, '🔓 Hợp đồng CTR-ORD-20260627172807-35 đã được Admin bỏ phong tỏa. Quá trình thi công và các hoạt động khác có thể tiếp tục.', NULL, NULL, b'0', '2026-06-27 11:02:55.566070'),
(522, 1, 'SYSTEM', NULL, '📦 Đơn hàng mới từ a — ORD-20260627-37. Cần phê duyệt & mở đấu giá.', NULL, NULL, b'0', '2026-06-27 14:41:06.917855'),
(523, 1, 'SYSTEM', NULL, '📦 Đơn hàng mới từ a — ORD-20260627-37. Cần phê duyệt & mở đấu giá.', NULL, NULL, b'0', '2026-06-27 14:41:06.936111'),
(524, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260627-37 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-27 14:41:06.948964'),
(525, 1, 'SYSTEM', NULL, '📦 Đơn hàng mới từ a — ORD-20260627-38. Cần phê duyệt & mở đấu giá.', NULL, NULL, b'0', '2026-06-27 14:47:50.468575'),
(526, 1, 'SYSTEM', NULL, '📦 Đơn hàng mới từ a — ORD-20260627-38. Cần phê duyệt & mở đấu giá.', NULL, NULL, b'0', '2026-06-27 14:47:50.482805'),
(527, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260627-38 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-27 14:47:50.488572'),
(528, 1, 'SYSTEM', NULL, '📦 Đơn hàng mới từ a — ORD-20260627-39. Cần phê duyệt & mở đấu giá.', NULL, NULL, b'0', '2026-06-27 15:36:50.092827'),
(529, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260627-39 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-27 15:36:50.105931'),
(530, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260627-38 của bạn đã được Admin phê duyệt và đang mở đấu giá. Các nhà thầu sẽ sớm gửi báo giá!', NULL, NULL, b'0', '2026-06-27 15:37:13.893897'),
(531, 2, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260627-38. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-27 15:37:13.907522'),
(532, 3, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260627-38. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-27 15:37:13.910806'),
(533, 10, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260627-38. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-27 15:37:13.912962'),
(534, 11, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260627-38. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-27 15:37:13.914087'),
(535, 12, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260627-38. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-27 15:37:13.917519'),
(536, 13, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260627-38. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-27 15:37:13.920749'),
(537, 15, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260627-38. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-27 15:37:13.923746'),
(538, 17, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: \"THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khố...\" — ORD-20260627-38. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-27 15:37:13.927797'),
(539, 14, 'SYSTEM', NULL, 'Dự án #16 - Bàn ăn gỗ óc chó đã được admin duyệt và hiển thị trên sàn.', NULL, NULL, b'0', '2026-06-27 16:29:15.115768'),
(540, 14, 'SYSTEM', NULL, 'Dự án #15 - Tủ quần áo 4 cánh gương đã được admin duyệt và hiển thị trên sàn.', NULL, NULL, b'0', '2026-06-27 16:29:25.474465'),
(541, 1, 'SYSTEM', NULL, '📦 Đơn hàng mới từ a — ORD-20260628-40. Cần phê duyệt & mở đấu giá.', NULL, NULL, b'0', '2026-06-28 10:39:03.164550'),
(542, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260628-40 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-28 10:39:03.172558'),
(543, 1, 'SYSTEM', NULL, '📦 Đơn hàng mới từ a — ORD-20260628-41. Cần phê duyệt & mở đấu giá.', NULL, NULL, b'0', '2026-06-28 11:01:40.618815'),
(544, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260628-41 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-28 11:01:40.628066'),
(545, 1, 'SYSTEM', NULL, '📦 Đơn hàng mới từ a — ORD-20260628-42. Cần phê duyệt & mở đấu giá.', NULL, NULL, b'0', '2026-06-28 11:05:50.928154'),
(546, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260628-42 đã được tạo. Đang chờ Admin phê duyệt.', NULL, NULL, b'0', '2026-06-28 11:05:50.935649'),
(547, 14, 'SYSTEM', NULL, 'Dự án #18 - Sofa góc L hiện đại đã được admin duyệt và hiển thị trên sàn.', NULL, NULL, b'0', '2026-06-28 11:15:19.346939'),
(548, 14, 'BID_RECEIVED', NULL, 'Đơn hàng ORD-20260628-42 vừa nhận được báo giá mới từ a — 2 triệu đ', NULL, NULL, b'0', '2026-06-28 11:22:20.439109'),
(549, 15, 'SYSTEM', NULL, '🎉 Báo giá của bạn cho đơn ORD-20260628-42 đã được chấp nhận! Hợp đồng CTR-ORD-20260628182241-42 đã có hiệu lực — bắt đầu thi công.', NULL, NULL, b'0', '2026-06-28 11:22:41.175009'),
(550, 14, 'SYSTEM', NULL, '✅ Hợp đồng CTR-ORD-20260628182241-42 đã được tạo và có hiệu lực. Nhà thầu a bắt đầu thi công.', NULL, NULL, b'0', '2026-06-28 11:22:41.178514'),
(551, 14, 'MILESTONE_REQUEST', NULL, 'Nha thau da cap nhat tien do: 50% - HD CTR-ORD-20260628182241-42. [Thi công phần thô]', NULL, NULL, b'0', '2026-06-28 12:24:48.856233'),
(552, 14, 'PAYMENT_SUCCESS', NULL, 'Nha thau yeu cau giai ngan 1.000.000 VND giai doan \'Thi công phần thô\' - HD CTR-ORD-20260628182241-42. Vui long vao trang Tien do de duyet.', NULL, NULL, b'0', '2026-06-28 12:25:18.443511'),
(553, 1, 'SYSTEM', NULL, '📋 Yeu cau giai ngan moi: HD CTR-ORD-20260628182241-42 - Nha thau a - Giai doan \'Thi công phần thô\' - So tien: 1.000.000 VND. Can xac nhan.', NULL, NULL, b'0', '2026-06-28 12:25:18.461583'),
(554, 14, 'MILESTONE_REQUEST', NULL, 'Nha thau da cap nhat tien do: 100% - HD CTR-ORD-20260628182241-42. [Bàn giao công trình]', NULL, NULL, b'0', '2026-06-28 12:27:00.393537'),
(555, 14, 'PAYMENT_SUCCESS', NULL, 'Nha thau yeu cau giai ngan 999.999 VND giai doan \'Bàn giao công trình\' - HD CTR-ORD-20260628182241-42. Vui long vao trang Tien do de duyet.', NULL, NULL, b'0', '2026-06-28 12:27:17.882719'),
(556, 1, 'SYSTEM', NULL, '📋 Yeu cau giai ngan moi: HD CTR-ORD-20260628182241-42 - Nha thau a - Giai doan \'Bàn giao công trình\' - So tien: 999.999 VND. Can xac nhan.', NULL, NULL, b'0', '2026-06-28 12:27:17.887738'),
(557, 2, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: ORD-20260628-43. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-28 13:05:36.078205'),
(558, 3, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: ORD-20260628-43. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-28 13:05:36.084215'),
(559, 10, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: ORD-20260628-43. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-28 13:05:36.088213'),
(560, 11, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: ORD-20260628-43. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-28 13:05:36.092345'),
(561, 12, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: ORD-20260628-43. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-28 13:05:36.097377'),
(562, 13, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: ORD-20260628-43. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-28 13:05:36.101676'),
(563, 15, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: ORD-20260628-43. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-28 13:05:36.105709');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `content`, `action_url`, `reference_id`, `is_read`, `created_at`) VALUES
(564, 17, 'BID_RECEIVED', NULL, '📣 Đơn hàng mới đang mở đấu giá: ORD-20260628-43. Xem và gửi báo giá ngay!', NULL, NULL, b'0', '2026-06-28 13:05:36.109209'),
(565, 14, 'SYSTEM', NULL, '✅ Đơn hàng ORD-20260628-43 đã được tạo và đang mở đấu giá. Nhà thầu sẽ sớm gửi báo giá!', NULL, NULL, b'0', '2026-06-28 13:05:36.111195'),
(566, 14, 'SYSTEM', NULL, 'Hợp đồng CTR-20260628200746-8 đã có hiệu lực! Đã khóa escrow 12.222.220 VND. Nhà thầu bắt đầu thi công.', NULL, NULL, b'0', '2026-06-28 13:07:46.859581'),
(567, 15, 'SYSTEM', NULL, '🎉 Báo giá được chọn! Hợp đồng CTR-20260628200746-8 (12.222.220 VND) đã ACTIVE. Bắt đầu thi công.', NULL, NULL, b'0', '2026-06-28 13:07:46.864981'),
(568, 14, 'MILESTONE_REQUEST', NULL, 'Nha thau da cap nhat tien do: 50% - HD CTR-20260628200746-8. [Thi công phần thô]', NULL, NULL, b'0', '2026-06-28 13:08:23.237190'),
(569, 14, 'PAYMENT_SUCCESS', NULL, 'Nhà thầu yêu cầu giải ngân 5.000.000 VND giai đoạn \'Thi công phần thô\' - HĐ CTR-20260628200746-8. Vui lòng vào trang Tiến độ để duyệt.', NULL, NULL, b'0', '2026-06-28 13:08:40.986878'),
(570, 15, 'PAYMENT_SUCCESS', NULL, 'Khach hang da duyet giai ngan 5.000.000 VND giai doan \'Thi công phần thô\'. 1.500.000 VND dung ngay, 3.500.000 VND con locked.', NULL, NULL, b'0', '2026-06-28 13:11:45.242396'),
(571, 14, 'MILESTONE_REQUEST', NULL, 'Nha thau da cap nhat tien do: 100% - HD CTR-20260628200746-8.', NULL, NULL, b'0', '2026-06-28 13:13:10.935212'),
(572, 14, 'PAYMENT_SUCCESS', NULL, 'Nhà thầu yêu cầu giải ngân 4.777.776 VND giai đoạn \'Bàn giao công trình\' - HĐ CTR-20260628200746-8. Vui lòng vào trang Tiến độ để duyệt.', NULL, NULL, b'0', '2026-06-28 13:13:48.214429'),
(573, 15, 'PAYMENT_SUCCESS', NULL, 'Khach hang da duyet giai ngan 4.777.776 VND giai doan \'Bàn giao công trình\'. 1.433.333 VND dung ngay, 3.344.443 VND con locked.', NULL, NULL, b'0', '2026-06-28 13:14:03.930594'),
(574, 14, 'DISPUTE', NULL, '⚠️ Khởi tạo tranh chấp: Hợp đồng CTR-20260628200746-8 đã bị đóng băng thi công và thanh toán. Lý do: dă.', NULL, NULL, b'0', '2026-06-28 13:14:24.405363'),
(575, 15, 'DISPUTE', NULL, '⚠️ Khởi tạo tranh chấp: Hợp đồng CTR-20260628200746-8 đã bị đóng băng thi công và thanh toán. Lý do: dă.', NULL, NULL, b'0', '2026-06-28 13:14:24.407773'),
(576, 1, 'DISPUTE', NULL, '[Hệ Thống] Tranh chấp mới được mở cho hợp đồng CTR-20260628200746-8', NULL, NULL, b'0', '2026-06-28 13:14:24.414809'),
(577, 14, 'DISPUTE', NULL, '⚖️ Kết quả phân xử tranh chấp HĐ CTR-20260628200746-8: Khách hàng nhận lại 100.0% (5.788.887 VND), Nhà thầu nhận 0.0% (0 VND). Quyết định: đâ.', NULL, NULL, b'0', '2026-06-28 13:15:40.698936'),
(578, 15, 'DISPUTE', NULL, '⚖️ Kết quả phân xử tranh chấp HĐ CTR-20260628200746-8: Khách hàng nhận lại 100.0% (5.788.887 VND), Nhà thầu nhận 0.0% (0 VND). Quyết định: đâ.', NULL, NULL, b'0', '2026-06-28 13:15:40.700936'),
(579, 2, 'SYSTEM', NULL, 'Tài khoản của bạn đã bị Admin tạm khóa. Vui lòng liên hệ hỗ trợ để biết thêm chi tiết.', NULL, NULL, b'0', '2026-06-28 14:12:47.119127'),
(580, 2, 'SYSTEM', NULL, 'Tài khoản của bạn đã được Admin mở khóa. Chào mừng bạn trở lại!', NULL, NULL, b'0', '2026-06-28 14:12:50.925504'),
(581, 1, 'SYSTEM', NULL, 'Nhà thầu mới adwdaw (thuando1@gmail.com) đang chờ phê duyệt.', NULL, NULL, b'0', '2026-06-28 14:22:24.867321'),
(582, 18, 'SYSTEM', NULL, 'Tài khoản nhà thầu của bạn đã được quản trị viên phê duyệt. Bạn có thể đăng nhập và nhận dự án.', NULL, NULL, b'0', '2026-06-28 14:37:03.959798');

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
(11, 'ORD-20260611-11', 14, 15, 16, 'CUSTOM', 'BIDDING_CLOSED', 2222222.00, 'Hồ chí Minh', '0987654312', '', 'THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khối\n\nBOM:\n  - Tấm gỗ MDF 18mm: 4 tấm\n  - Bản lề giảm chấn: 4 cái\n  - Tay nắm tủ: 2 cái', '', '', 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-11 15:59:02.898717', '2026-06-26 14:26:04.707649', '2026-06-26 14:26:04.663593', NULL, NULL, NULL, NULL, NULL),
(12, 'ORD-20260612-12', 14, NULL, NULL, 'CATALOG', 'DEPOSIT_PAID', 15600000.00, 'Linh Dông ', '0987654321', 'Giờ hành chính ', '', '', NULL, 60.00, 9360000.00, b'1', NULL, NULL, b'0', NULL, b'1', b'0', '2026-06-12 08:47:42.972327', '2026-06-12 08:47:43.071015', NULL, NULL, NULL, NULL, NULL, NULL),
(13, 'ORD-20260612-13', 14, 15, 5, 'CUSTOM', 'PROCESSING', 19999998.00, 'Linh Dong', '0987654321', 'a', 'THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khối\n\nBOM:\n  - Tấm gỗ MDF 18mm: 4 tấm\n  - Bản lề giảm chấn: 4 cái\n  - Tay nắm tủ: 2 cái', '', '', 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-12 08:48:49.158092', '2026-06-12 08:54:43.393912', '2026-06-12 08:54:43.389957', NULL, NULL, NULL, NULL, NULL),
(14, 'ORD-20260612-14', 14, 15, 6, 'CUSTOM', 'PROCESSING', 5000000.00, 'COngty', '0987654321', 'khanh Thuan', 'THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối\n• Hộc kéo 3 tầng (40×50cm) × 1 khối\n\nBOM:\n  - Tấm gỗ MDF 18mm: 4 tấm\n  - Bản lề giảm chấn: 2 cái\n  - Tay nắm tủ: 1 cái\n  - Ray trượt hộc kéo: 3 bộ\n  - Tay nắm: 3 cái', '', '', 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-12 09:59:16.299005', '2026-06-12 10:01:25.260236', '2026-06-12 10:01:25.255188', NULL, b'0', NULL, b'0', NULL),
(15, 'ORD-20260612-15', 14, 15, 7, 'CUSTOM', 'PROCESSING', 10000000.00, 'quan 2 ', '09876666666', 'ahd;oădawd', 'THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối\n• Hộc kéo 3 tầng (40×50cm) × 1 khối\n• Tủ đôi (120×50cm) × 1 khối\n\nBOM:\n  - Tấm gỗ MDF 18mm: 8 tấm\n  - Bản lề giảm chấn: 6 cái\n  - Tay nắm tủ: 3 cái\n  - Ray trượt hộc kéo: 3 bộ\n  - Tay nắm: 3 cái', '', '', 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-12 10:05:42.238351', '2026-06-12 10:08:02.141280', '2026-06-12 10:08:02.135192', NULL, b'0', NULL, b'0', NULL),
(16, 'ORD-20260612-16', 14, 15, 8, 'CUSTOM', 'PROCESSING', 20000000.00, 'nam kỳ khởi nghĩa ', '0999999999', '', 'THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối\n\nBOM:\n  - Tấm gỗ MDF 18mm: 2 tấm\n  - Bản lề giảm chấn: 2 cái\n  - Tay nắm tủ: 1 cái', '', '', 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-12 10:12:41.279502', '2026-06-12 10:51:07.349752', '2026-06-12 10:51:07.344278', NULL, b'0', NULL, b'0', NULL),
(17, 'ORD-20260612-17', 16, 15, 9, 'CUSTOM', 'PROCESSING', 2222222.00, 'NGUYEN VAN A', '0987777777', 'NGUYEN VAN A', 'THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khối\n• Hộc kéo 3 tầng (40×50cm) × 1 khối\n\nBOM:\n  - Tấm gỗ MDF 18mm: 6 tấm\n  - Bản lề giảm chấn: 4 cái\n  - Tay nắm tủ: 2 cái\n  - Ray trượt hộc kéo: 3 bộ\n  - Tay nắm: 3 cái', '', '', 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-12 10:17:30.659703', '2026-06-12 10:51:01.503288', '2026-06-12 10:51:01.468203', NULL, b'0', NULL, b'0', NULL),
(18, 'ORD-20260612-18', 16, NULL, NULL, 'CATALOG', 'DEPOSIT_PAID', 9800000.00, 'NGUYEN VAN A', '098777777', 'NGUYEN VAN A', '', '', NULL, 60.00, 5880000.00, b'1', NULL, NULL, b'0', NULL, b'1', b'0', '2026-06-12 10:17:48.575481', '2026-06-12 10:17:48.625729', NULL, NULL, b'0', NULL, b'0', NULL),
(19, 'ORD-20260612-19', 16, NULL, NULL, 'CATALOG', 'DEPOSIT_PAID', 9800000.00, 'a', '000000000', 'adwwd', '', '', NULL, 60.00, 5880000.00, b'1', NULL, NULL, b'0', NULL, b'1', b'0', '2026-06-12 10:44:03.764659', '2026-06-12 10:44:03.877582', NULL, NULL, NULL, NULL, NULL, NULL),
(20, 'ORD-20260612-20', 16, 15, 10, 'CUSTOM', 'BIDDING_CLOSED', 22222222.00, 'a', '0987654321', '', 'THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khối\n\nBOM:\n  - Tấm gỗ MDF 18mm: 4 tấm\n  - Bản lề giảm chấn: 4 cái\n  - Tay nắm tủ: 2 cái', '', '', 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-12 10:44:31.272090', '2026-06-12 11:43:13.100516', '2026-06-12 11:43:13.036406', NULL, NULL, NULL, NULL, NULL),
(21, 'ORD-20260612-21', 16, NULL, NULL, 'CUSTOM', 'OPEN_BIDDING', 4400000.00, 'adw', '0987666666', 'a', 'THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khối\n• Hộc kéo 3 tầng (40×50cm) × 1 khối\n\nBOM:\n  - Tấm gỗ MDF 18mm: 6 tấm\n  - Bản lề giảm chấn: 4 cái\n  - Tay nắm tủ: 2 cái\n  - Ray trượt hộc kéo: 3 bộ\n  - Tay nắm: 3 cái', '', '', 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-12 11:36:19.297916', '2026-06-12 11:47:54.392969', '2026-06-12 11:47:54.371503', NULL, NULL, NULL, NULL, NULL),
(22, 'ORD-20260612-22', 16, NULL, NULL, 'CATALOG', 'DEPOSIT_PAID', 9800000.00, 'a', '0987654321', 'a', '', '', NULL, 60.00, 5880000.00, b'1', NULL, NULL, b'0', NULL, b'1', b'0', '2026-06-12 11:36:30.308538', '2026-06-12 11:36:30.373664', NULL, NULL, NULL, NULL, NULL, NULL),
(23, 'ORD-20260612-23', 16, NULL, NULL, 'CUSTOM', 'OPEN_BIDDING', 5000000.00, 'a', '1', 'a', 'THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khối\n• Tủ đơn (60×50cm) × 1 khối\n\nBOM:\n  - Tấm gỗ MDF 18mm: 6 tấm\n  - Bản lề giảm chấn: 6 cái\n  - Tay nắm tủ: 3 cái', '', '', 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-12 11:40:27.350140', '2026-06-12 11:47:44.562414', '2026-06-12 11:47:44.499251', NULL, NULL, NULL, NULL, NULL),
(24, 'ORD-20260612-24', 16, 15, 11, 'CATALOG', 'BIDDING_CLOSED', 22222222.00, 'a', '0', 'a', '', '', '', 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-12 11:48:06.552090', '2026-06-12 11:49:28.513864', '2026-06-12 11:49:28.474030', NULL, NULL, NULL, NULL, NULL),
(25, 'ORD-20260617-25', 14, 15, 15, 'CUSTOM', 'DELIVERED', 4000000.00, '53 Trần Não', '09876543212', 'a', 'THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khối\n• Kệ mở (80×30cm) × 1 khối\n• Tủ đôi (120×50cm) × 1 khối\n\nBOM:\n  - Tấm gỗ MDF 18mm: 9 tấm\n  - Bản lề giảm chấn: 8 cái\n  - Tay nắm tủ: 4 cái\n  - Thanh đỡ kệ: 4 cái', '', '', 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'1', '2026-06-17 08:32:29.235013', '2026-06-24 13:38:24.501353', '2026-06-17 08:45:16.104239', '2026-06-24 13:38:24.427423', NULL, NULL, NULL, NULL),
(26, 'ORD-20260617-26', 14, 15, 14, 'CATALOG', 'DELIVERED', 1999998.00, 'Trần não', '0987654321', 'a', '', '', '', 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'1', '2026-06-17 08:32:44.825811', '2026-06-17 08:38:39.995664', '2026-06-17 08:34:38.521610', '2026-06-17 08:38:39.975738', NULL, NULL, NULL, NULL),
(27, 'ORD-20260624-27', 14, 15, 17, 'CATALOG', 'BIDDING_CLOSED', 22222222.00, 'a', 'a091', 'a', '', '', '', 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-24 14:33:50.747010', '2026-06-24 14:35:37.749889', '2026-06-24 14:35:37.706386', NULL, NULL, NULL, NULL, NULL),
(28, 'ORD-20260625-28', 14, 15, 18, 'CATALOG', 'DELIVERED', 2222222.00, '121', '0987654321', '', '', '', '', 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'1', '2026-06-25 13:52:47.825132', '2026-06-25 13:58:53.532065', '2026-06-25 13:54:25.638256', '2026-06-25 13:58:53.519497', NULL, NULL, NULL, NULL),
(29, 'ORD-20260625-29', 14, 15, 19, 'CATALOG', 'BIDDING_CLOSED', 20000000.00, 'dâd', '0987654321', 'â', '', '', '', 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-25 14:25:12.877714', '2026-06-25 14:32:26.210047', '2026-06-25 14:32:26.150846', NULL, NULL, NULL, NULL, NULL),
(30, 'ORD-20260625-30', 14, NULL, NULL, 'CATALOG', 'OPEN_BIDDING', 9800000.00, 'dă', '098765', 'âdada', '', '', '', 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-25 14:38:15.113526', '2026-06-26 14:30:52.004433', '2026-06-26 14:30:51.980192', NULL, NULL, NULL, NULL, NULL),
(31, 'ORD-20260625-31', 14, NULL, NULL, 'CATALOG', 'CANCELLED', 9800000.00, 'a', '0987271', '09', '', '', NULL, 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-25 14:38:58.501240', '2026-06-25 14:46:20.317246', NULL, NULL, NULL, NULL, NULL, NULL),
(32, 'ORD-20260626-32', 14, 15, 22, 'CUSTOM', 'BIDDING_CLOSED', 25000000.00, 'Hồ Chí Minh', '0987654321', 'a', 'Châu Ă', '', '', 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-26 14:34:31.316601', '2026-06-26 14:35:44.490948', '2026-06-26 14:35:44.444929', NULL, NULL, NULL, NULL, NULL),
(33, 'ORD-20260626-33', 14, 15, 23, 'CUSTOM', 'DELIVERED', 2222222.00, 'Khánh THuận', '09866543223', 'a', 'THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khối\n\nBOM:\n  - Tấm gỗ MDF 18mm: 4 tấm\n  - Bản lề giảm chấn: 4 cái\n  - Tay nắm tủ: 2 cái', '', '', 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'1', '2026-06-26 16:29:19.319997', '2026-06-26 16:33:04.883517', '2026-06-26 16:30:19.003946', '2026-06-26 16:33:04.867452', NULL, NULL, NULL, NULL),
(34, 'ORD-20260627-34', 14, NULL, NULL, 'CATALOG', 'OPEN_BIDDING', 9800000.00, '1', '0987654321', 'a', '', '', '', 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-27 08:44:21.760725', '2026-06-27 08:45:16.532619', '2026-06-27 08:45:16.501016', NULL, NULL, NULL, NULL, NULL),
(35, 'ORD-20260627-35', 14, 15, 25, 'CUSTOM', 'BIDDING_CLOSED', 11111111.00, 'a', '0987654321', 'a', 'THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối\n• Hộc kéo 3 tầng (40×50cm) × 1 khối\n\nBOM:\n  - Tấm gỗ MDF 18mm: 4 tấm\n  - Bản lề giảm chấn: 2 cái\n  - Tay nắm tủ: 1 cái\n  - Ray trượt hộc kéo: 3 bộ\n  - Tay nắm: 3 cái', '', '', 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-27 10:11:25.913893', '2026-06-27 10:28:07.449320', '2026-06-27 10:28:07.392624', NULL, NULL, NULL, NULL, NULL),
(36, 'ORD-20260627-36', 14, NULL, NULL, 'CUSTOM', 'PENDING', 5000000.00, 'a', '0987654321', '', 'THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối\n• Tủ đôi (120×50cm) × 1 khối\n\nBOM:\n  - Tấm gỗ MDF 18mm: 6 tấm\n  - Bản lề giảm chấn: 6 cái\n  - Tay nắm tủ: 3 cái', '', NULL, 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-27 10:21:13.689638', '2026-06-27 10:21:13.750237', NULL, NULL, NULL, NULL, NULL, NULL),
(37, 'ORD-20260627-37', 14, NULL, NULL, 'CUSTOM', 'PENDING', 3200000.00, 'a', '0987654321', 'a', 'THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khối\n\nBOM:\n  - Tấm gỗ MDF 18mm: 4 tấm\n  - Bản lề giảm chấn: 4 cái\n  - Tay nắm tủ: 2 cái', '', NULL, 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-27 14:41:06.854860', '2026-06-27 14:41:06.959526', NULL, NULL, NULL, NULL, NULL, NULL),
(38, 'ORD-20260627-38', 14, NULL, NULL, 'CUSTOM', 'OPEN_BIDDING', 4400000.00, 'a', '09872222121', 'a', 'THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khối\n• Hộc kéo 3 tầng (40×50cm) × 1 khối\n\nBOM:\n  - Tấm gỗ MDF 18mm: 6 tấm\n  - Bản lề giảm chấn: 4 cái\n  - Tay nắm tủ: 2 cái\n  - Ray trượt hộc kéo: 3 bộ\n  - Tay nắm: 3 cái', '', '', 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-27 14:47:50.420312', '2026-06-27 15:37:13.930065', '2026-06-27 15:37:13.893897', NULL, NULL, NULL, NULL, NULL),
(39, 'ORD-20260627-39', 14, NULL, NULL, 'CUSTOM', 'CANCELLED', 3000000.00, 'q', '0987654321', '', 'THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối\n• Hộc kéo 3 tầng (40×50cm) × 1 khối\n\nBOM:\n  - Tấm gỗ MDF 18mm: 4 tấm\n  - Bản lề giảm chấn: 2 cái\n  - Tay nắm tủ: 1 cái\n  - Ray trượt hộc kéo: 3 bộ\n  - Tay nắm: 3 cái', '', NULL, 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-27 15:36:50.018156', '2026-06-27 15:44:02.921286', NULL, NULL, NULL, NULL, NULL, NULL),
(40, 'ORD-20260628-40', 14, NULL, NULL, 'CUSTOM', 'PENDING', 6200000.00, '123456', '0987654321', 'a', 'THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đôi (120×50cm) × 1 khối\n• Tủ đơn (60×50cm) × 1 khối\n• Hộc kéo 3 tầng (40×50cm) × 1 khối\n\nBOM:\n  - Tấm gỗ MDF 18mm: 8 tấm\n  - Bản lề giảm chấn: 6 cái\n  - Tay nắm tủ: 3 cái\n  - Ray trượt hộc kéo: 3 bộ\n  - Tay nắm: 3 cái', '', NULL, 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-28 10:39:03.118584', '2026-06-28 10:39:03.178796', NULL, NULL, NULL, NULL, NULL, NULL),
(41, 'ORD-20260628-41', 14, NULL, NULL, 'CUSTOM', 'PENDING', 3000000.00, '1231313', '0987654321', 'a', 'THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối\n• Hộc kéo 3 tầng (40×50cm) × 1 khối\n\nBOM:\n  - Tấm gỗ MDF 18mm: 4 tấm\n  - Bản lề giảm chấn: 2 cái\n  - Tay nắm tủ: 1 cái\n  - Ray trượt hộc kéo: 3 bộ\n  - Tay nắm: 3 cái', '', NULL, 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-28 11:01:40.510050', '2026-06-28 11:01:40.638801', NULL, NULL, NULL, NULL, NULL, NULL),
(42, 'ORD-20260628-42', 14, 15, 26, 'CUSTOM', 'PROCESSING', 2112321.00, 'adwad', '1231231231', 'ada', 'THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối\n\nBOM:\n  - Tấm gỗ MDF 18mm: 2 tấm\n  - Bản lề giảm chấn: 2 cái\n  - Tay nắm tủ: 1 cái', '', 'Admin đã duyệt, mở đấu thầu', 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-28 11:05:50.837064', '2026-06-28 11:22:41.196108', '2026-06-28 11:22:41.124646', NULL, NULL, NULL, NULL, NULL),
(43, 'ORD-20260628-43', 14, NULL, NULL, 'CUSTOM', 'OPEN_BIDDING', 5000000.00, 'adw', '0987654321', 'adwdaw', 'THIẾT KẾ 2D - 500x400cm\n\nMÔ-ĐUN:\n• Tủ đơn (60×50cm) × 1 khối\n• Tủ đôi (120×50cm) × 1 khối\n\nBOM:\n  - Tấm gỗ MDF 18mm: 6 tấm\n  - Bản lề giảm chấn: 6 cái\n  - Tay nắm tủ: 3 cái', '', NULL, 60.00, NULL, b'0', NULL, NULL, b'0', NULL, b'0', b'0', '2026-06-28 13:05:36.035249', '2026-06-28 13:05:36.116210', NULL, NULL, NULL, NULL, NULL, NULL);

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
(10, 20, 15, 22222222, 12, 'a', '', 'ACCEPTED', '2026-06-12 10:45:29.984378'),
(11, 24, 15, 22222222, 2, 'gỗ keo', '', 'ACCEPTED', '2026-06-12 11:49:15.459866'),
(12, 23, 15, 12345678, 12, 'a', '', 'PENDING', '2026-06-12 16:00:34.625645'),
(13, 23, 17, 12345678, 12, 'a', '', 'PENDING', '2026-06-12 16:11:54.356422'),
(14, 26, 15, 1999998, 24, 'Gỗ Xoài', '', 'ACCEPTED', '2026-06-17 08:33:55.270828'),
(15, 25, 15, 4000000, 99, 'Dă', '', 'ACCEPTED', '2026-06-17 08:41:03.752063'),
(16, 11, 15, 2222222, 23, 'a', '', 'ACCEPTED', '2026-06-17 08:51:09.945635'),
(17, 27, 15, 22222222, 12, 'adawda', '', 'ACCEPTED', '2026-06-24 14:35:02.828469'),
(18, 28, 15, 2222222, 21, 'gỗ ', 'âdw', 'ACCEPTED', '2026-06-25 13:53:16.370484'),
(19, 29, 15, 20000000, 15, 'â', '', 'ACCEPTED', '2026-06-25 14:28:24.025766'),
(20, 21, 15, 222222, 12, 'adw', '', 'PENDING', '2026-06-26 14:25:22.541610'),
(21, 30, 15, 12222222, 12, 'a', 'a', 'PENDING', '2026-06-26 14:32:07.062839'),
(22, 32, 15, 25000000, 15, 'Bàn ', '', 'ACCEPTED', '2026-06-26 14:35:25.866104'),
(23, 33, 15, 2222222, 21, 'a', '', 'ACCEPTED', '2026-06-26 16:30:02.876772'),
(24, 34, 15, 21222222, 18, 'ăd', 'ad', 'PENDING', '2026-06-27 10:13:43.147264'),
(25, 35, 15, 11111111, 21, 'a', '', 'ACCEPTED', '2026-06-27 10:13:57.788445'),
(26, 42, 15, 2112321, 21, 'a', 'a', 'ACCEPTED', '2026-06-28 11:22:20.418391');

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
(10, '', 'a', 1, '', 22222222, 'cái', 22222222, 10),
(11, '', 'a', 1, '', 22222222, 'cái', 22222222, 11),
(12, '', 'a', 1, '', 12345678, 'cái', 12345678, 12),
(13, '', 'q', 1, '', 12345678, 'cái', 12345678, 13),
(14, '', 'SoFa', 1, '', 1999998, 'cái', 1999998, 14),
(15, '', 'Bàn dài', 2, '', 4000000, 'cái', 2000000, 15),
(16, '', 'Shop hay ', 1, '', 2222222, 'cái', 2222222, 16),
(17, '', 'adw', 1, '', 22222222, 'cái', 22222222, 17),
(18, '', 'adw', 1, '', 2222222, 'cái', 2222222, 18),
(19, '', 'Sofa', 1, '', 20000000, 'cái', 20000000, 19),
(20, '', 'A', 1, '', 222222, 'cái', 222222, 20),
(21, '', 'a', 1, '', 12222222, 'cái', 12222222, 21),
(22, '', 'SoFa', 1, '', 25000000, 'cái', 25000000, 22),
(23, '', 'aaaaaaaaaaaaa', 1, '', 2222222, 'cái', 2222222, 23),
(24, '', 'Soafa', 1, '', 21222222, 'cái', 21222222, 24),
(25, '', 'So fa', 1, '', 11111111, 'cái', 11111111, 25),
(26, '', 'adw', 1, '', 2112321, 'cái', 2112321, 26);

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
(24, 20, NULL, 'Tủ đôi (120×50cm)', '', 1, 3200000, 3200000, 'Kích thước: 120×50cm'),
(25, 21, NULL, 'Tủ đôi (120×50cm)', '', 1, 3200000, 3200000, 'Kích thước: 120×50cm'),
(26, 21, NULL, 'Hộc kéo 3 tầng (40×50cm)', '', 1, 1200000, 1200000, 'Kích thước: 40×50cm'),
(27, 22, 2, 'Sofa văng 3 chỗ Scandinavian', 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600', 1, 9800000, 9800000, ''),
(28, 23, NULL, 'Tủ đôi (120×50cm)', '', 1, 3200000, 3200000, 'Kích thước: 120×50cm'),
(29, 23, NULL, 'Tủ đơn (60×50cm)', '', 1, 1800000, 1800000, 'Kích thước: 60×50cm'),
(30, 24, 3, 'Sofa da thật nhập khẩu Ý', 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600', 1, 35000000, 35000000, ''),
(31, 25, NULL, 'Tủ đôi (120×50cm)', '', 1, 3200000, 3200000, 'Kích thước: 120×50cm'),
(32, 25, NULL, 'Kệ mở (80×30cm)', '', 1, 800000, 800000, 'Kích thước: 80×30cm'),
(33, 25, NULL, 'Tủ đôi (120×50cm)', '', 1, 3200000, 3200000, 'Kích thước: 120×50cm'),
(34, 26, 1, 'Sofa góc L hiện đại', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600', 1, 18500000, 18500000, ''),
(35, 27, 3, 'Sofa da thật nhập khẩu Ý', 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600', 1, 35000000, 35000000, ''),
(36, 28, 2, 'Sofa văng 3 chỗ Scandinavian', 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600', 1, 9800000, 9800000, ''),
(37, 29, 3, 'Sofa da thật nhập khẩu Ý', 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600', 1, 35000000, 35000000, ''),
(38, 30, 2, 'Sofa văng 3 chỗ Scandinavian', 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600', 1, 9800000, 9800000, ''),
(39, 31, 2, 'Sofa văng 3 chỗ Scandinavian', 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600', 1, 9800000, 9800000, ''),
(40, 32, NULL, 'Bàn ăn cơm ', '', 1, 15000000, 15000000, ''),
(41, 33, NULL, 'Tủ đôi (120×50cm)', '', 1, 3200000, 3200000, 'Kích thước: 120×50cm'),
(42, 34, 2, 'Sofa văng 3 chỗ Scandinavian', 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600', 1, 9800000, 9800000, ''),
(43, 35, NULL, 'Tủ đơn (60×50cm)', '', 1, 1800000, 1800000, 'Kích thước: 60×50cm'),
(44, 35, NULL, 'Hộc kéo 3 tầng (40×50cm)', '', 1, 1200000, 1200000, 'Kích thước: 40×50cm'),
(45, 36, NULL, 'Tủ đơn (60×50cm)', '', 1, 1800000, 1800000, 'Kích thước: 60×50cm'),
(46, 36, NULL, 'Tủ đôi (120×50cm)', '', 1, 3200000, 3200000, 'Kích thước: 120×50cm'),
(47, 37, NULL, 'Tủ đôi (120×50cm)', '', 1, 3200000, 3200000, 'Kích thước: 120×50cm'),
(48, 38, NULL, 'Tủ đôi (120×50cm)', '', 1, 3200000, 3200000, 'Kích thước: 120×50cm'),
(49, 38, NULL, 'Hộc kéo 3 tầng (40×50cm)', '', 1, 1200000, 1200000, 'Kích thước: 40×50cm'),
(50, 39, NULL, 'Tủ đơn (60×50cm)', '', 1, 1800000, 1800000, 'Kích thước: 60×50cm'),
(51, 39, NULL, 'Hộc kéo 3 tầng (40×50cm)', '', 1, 1200000, 1200000, 'Kích thước: 40×50cm'),
(52, 40, NULL, 'Tủ đôi (120×50cm)', '', 1, 3200000, 3200000, 'Kích thước: 120×50cm'),
(53, 40, NULL, 'Tủ đơn (60×50cm)', '', 1, 1800000, 1800000, 'Kích thước: 60×50cm'),
(54, 40, NULL, 'Hộc kéo 3 tầng (40×50cm)', '', 1, 1200000, 1200000, 'Kích thước: 40×50cm'),
(55, 41, NULL, 'Tủ đơn (60×50cm)', '', 1, 1800000, 1800000, 'Kích thước: 60×50cm'),
(56, 41, NULL, 'Hộc kéo 3 tầng (40×50cm)', '', 1, 1200000, 1200000, 'Kích thước: 40×50cm'),
(57, 42, NULL, 'Tủ đơn (60×50cm)', '', 1, 1800000, 1800000, 'Kích thước: 60×50cm'),
(58, 43, NULL, 'Tủ đơn (60×50cm)', '', 1, 1800000, 1800000, 'Kích thước: 60×50cm'),
(59, 43, NULL, 'Tủ đôi (120×50cm)', '', 1, 3200000, 3200000, 'Kích thước: 120×50cm');

-- --------------------------------------------------------

--
-- Table structure for table `platform_transactions`
--

CREATE TABLE `platform_transactions` (
  `id` bigint(20) NOT NULL,
  `amount` bigint(20) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `reference_id` varchar(255) DEFAULT NULL,
  `type` enum('COMMISSION','DISPUTE_PENALTY','WITHDRAW','REFUND') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `platform_transactions`
--

INSERT INTO `platform_transactions` (`id`, `amount`, `created_at`, `description`, `reference_id`, `type`) VALUES
(1, 111111, '2026-06-26 16:33:04.838736', 'Phí hoa hồng 5% từ hợp đồng hoàn thành: CTR-ORD-20260626233019-33', 'CTR-ORD-20260626233019-33', 'COMMISSION'),
(2, 100000, '2026-06-30 04:27:13.291929', 'Chuyển lợi tức', 'WITHDRAW-1782793633290', 'WITHDRAW');

-- --------------------------------------------------------

--
-- Table structure for table `platform_wallets`
--

CREATE TABLE `platform_wallets` (
  `id` bigint(20) NOT NULL,
  `balance` bigint(20) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `platform_wallets`
--

INSERT INTO `platform_wallets` (`id`, `balance`, `updated_at`) VALUES
(1, 122222, '2026-06-30 04:27:13.298636');

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
(1, 'Sofa góc L hiện đại', 'Sofa góc L chân gỗ sồi, bọc nỉ cao cấp', 18500000, 22000000, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600', 'SOFA', NULL, 'Gỗ sồi + Nỉ Hàn Quốc', NULL, NULL, 11, 0, 0, b'1', b'1', '2026-06-11 10:59:43.082994', '2026-06-24 14:32:14.163424'),
(2, 'Sofa văng 3 chỗ Scandinavian', 'Phong cách Bắc Âu tối giản, màu kem', 9800000, 12000000, 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600', 'SOFA', NULL, 'Gỗ sồi + Vải linen', NULL, NULL, 1, 0, 0, b'1', b'1', '2026-06-11 10:59:43.082994', '2026-06-27 08:44:21.810772'),
(3, 'Sofa da thật nhập khẩu Ý', 'Da bò thật, khung thép không gỉ', 35000000, NULL, 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600', 'SOFA', NULL, 'Da bò thật', NULL, NULL, 0, 0, 0, b'1', b'1', '2026-06-11 10:59:43.082994', '2026-06-25 14:25:12.918997'),
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
(5, 14, 'Bàn ăn Cơm', '--- SẢN PHẨM MẪU YÊU CẦU ---\n• Sofa da thật nhập khẩu Ý (x1)\n• Đèn thả trần mây đan (x1)\n\n--- YÊU CẦU RIÊNG ---\nSòa', NULL, NULL, 'Trần Não , quận 2 , Hồ Chí Minh ', NULL, 50000000, 100000000, 'FIXED_PRICE', 'IN_PROGRESS', 'APPROVED', 'Hồ sơ hợp lệ', NULL, '2026-06-12 06:37:08.563670', NULL, NULL, '2026-06-11 16:00:15.880538', '2026-06-12 13:38:51.062154'),
(6, 16, 'phòng ngủ ', '--- YÊU CẦU RIÊNG ---\na', NULL, NULL, 'tran ano, quan 2 , Hồ Chí Minh', NULL, 50000000, 100000000, 'FIXED_PRICE', 'OPEN', 'APPROVED', 'a', NULL, '2026-06-12 11:38:43.136152', NULL, NULL, '2026-06-12 11:37:00.709533', '2026-06-12 18:38:43.153041'),
(7, 14, 't', '--- SẢN PHẨM MẪU YÊU CẦU ---\n• Sofa văng 3 chỗ Scandinavian (x1)', NULL, NULL, 'quan 1 , ho chi minh ', NULL, 50000000, 100000000, 'FIXED_PRICE', 'DRAFT', 'PENDING', NULL, NULL, NULL, NULL, NULL, '2026-06-25 14:35:49.468996', '2026-06-25 21:35:49.473974'),
(8, 14, 'a', '--- SẢN PHẨM MẪU YÊU CẦU ---\n• Tranh canvas Abstract (x1)', NULL, NULL, 'a, a, a', NULL, 50000000, 100000000, 'FIXED_PRICE', 'DRAFT', 'PENDING', NULL, NULL, NULL, NULL, NULL, '2026-06-25 14:40:20.286479', '2026-06-25 21:40:20.293862'),
(9, 14, 'Sofa văng 3 chỗ Scandinavian', '• Sofa văng 3 chỗ Scandinavian (x1)', NULL, NULL, 'a', NULL, 50000000, 100000000, 'FIXED_PRICE', 'OPEN', 'APPROVED', 'a', NULL, '2026-06-27 10:12:30.549825', NULL, NULL, '2026-06-27 10:11:43.101988', '2026-06-27 17:12:30.554307'),
(10, 14, 'Bàn ăn gỗ óc chó', '• Bàn ăn gỗ óc chó (x1)', NULL, NULL, 'adw, Huyện Yên Phong, Tỉnh Bắc Ninh', NULL, 50000000, 100000000, 'FIXED_PRICE', 'OPEN', 'APPROVED', 'a', NULL, '2026-06-27 10:24:51.923682', NULL, NULL, '2026-06-27 10:17:35.632530', '2026-06-27 17:24:51.938682'),
(11, 14, 'Sofa văng 3 chỗ Scandinavian', '• Sofa văng 3 chỗ Scandinavian (x1)', NULL, NULL, 'a, Thành phố Phúc Yên, Tỉnh Vĩnh Phúc', NULL, 50000000, 100000000, 'FIXED_PRICE', 'DRAFT', 'PENDING', NULL, NULL, NULL, NULL, NULL, '2026-06-27 14:45:02.918940', '2026-06-27 21:45:02.925796'),
(12, 14, 'Sofa văng 3 chỗ Scandinavian', '• Sofa văng 3 chỗ Scandinavian (x1)', NULL, NULL, '', NULL, 50000000, 100000000, 'FIXED_PRICE', 'DRAFT', 'PENDING', NULL, NULL, NULL, NULL, NULL, '2026-06-27 15:35:22.795934', '2026-06-27 22:35:22.807345'),
(13, 14, 'Tủ quần áo 4 cánh gương', '• Tủ quần áo 4 cánh gương (x1)', NULL, NULL, '', NULL, 50000000, 100000000, 'FIXED_PRICE', 'DRAFT', 'PENDING', NULL, NULL, NULL, NULL, NULL, '2026-06-27 15:35:51.596995', '2026-06-27 22:35:51.598368'),
(14, 14, 'Bàn ăn gỗ óc chó', '• Bàn ăn gỗ óc chó (x1)', NULL, NULL, '', NULL, 50000000, 100000000, 'FIXED_PRICE', 'CANCELLED', 'REJECTED', 'a', NULL, NULL, NULL, NULL, '2026-06-27 15:36:29.787642', '2026-06-27 22:44:11.636105'),
(15, 14, 'Tủ quần áo 4 cánh gương', '• Tủ quần áo 4 cánh gương (x1)', NULL, NULL, '123, Huyện Gia Lộc, Tỉnh Hải Dương', NULL, 50000000, 100000000, 'FIXED_PRICE', 'OPEN', 'APPROVED', 'adw', NULL, '2026-06-27 16:29:25.474465', NULL, NULL, '2026-06-27 16:12:39.528226', '2026-06-27 23:29:25.484111'),
(16, 14, 'Bàn ăn gỗ óc chó', '• Bàn ăn gỗ óc chó (x1)\n• Bàn cà phê mặt đá marble (x1)', NULL, NULL, 'Huyện Ninh Giang, Tỉnh Hải Dương', NULL, 50000000, 100000000, 'FIXED_PRICE', 'OPEN', 'APPROVED', 'a', NULL, '2026-06-27 16:29:15.108200', NULL, NULL, '2026-06-27 16:13:29.752592', '2026-06-27 23:29:15.134528'),
(17, 14, 'Sofa văng 3 chỗ Scandinavian', '• Sofa văng 3 chỗ Scandinavian (x1)', NULL, NULL, '1234, Thành phố Phúc Yên, Tỉnh Vĩnh Phúc', NULL, 50000000, 100000000, 'FIXED_PRICE', 'DRAFT', 'PENDING', NULL, NULL, NULL, NULL, NULL, '2026-06-28 10:37:33.443861', '2026-06-28 17:37:33.460762'),
(18, 14, 'Sofa góc L hiện đại', '• Sofa góc L hiện đại (x1)', NULL, NULL, '12345, Huyện Gia Bình, Tỉnh Bắc Ninh', NULL, 50000000, 100000000, 'FIXED_PRICE', 'OPEN', 'APPROVED', NULL, NULL, '2026-06-28 11:15:19.341948', NULL, NULL, '2026-06-28 10:38:27.972905', '2026-06-28 18:15:19.375234'),
(19, 14, 'Sofa văng 3 chỗ Scandinavian', '• Sofa văng 3 chỗ Scandinavian (x1)', NULL, NULL, 'a, Huyện Mường Nhé, Tỉnh Điện Biên', NULL, 50000000, 100000000, 'FIXED_PRICE', 'IN_PROGRESS', 'APPROVED', NULL, NULL, NULL, NULL, NULL, '2026-06-28 13:05:08.675222', '2026-06-28 20:07:46.880589'),
(20, 14, 'Sofa văng 3 chỗ Scandinavian', '• Sofa văng 3 chỗ Scandinavian (x1)', NULL, NULL, 'adw, Huyện Yên Phong, Tỉnh Bắc Ninh', NULL, 50000000, 100000000, 'FIXED_PRICE', 'OPEN', 'APPROVED', NULL, NULL, NULL, NULL, NULL, '2026-06-28 13:50:32.452513', '2026-06-28 20:50:32.457562');

-- --------------------------------------------------------

--
-- Table structure for table `project_image_urls`
--

CREATE TABLE `project_image_urls` (
  `project_id` bigint(20) NOT NULL,
  `image_urls` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `project_image_urls`
--

INSERT INTO `project_image_urls` (`project_id`, `image_urls`) VALUES
(9, 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600'),
(10, 'https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=600'),
(11, 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600'),
(12, 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600'),
(13, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'),
(14, 'https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=600'),
(15, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'),
(16, 'https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=600'),
(16, 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600'),
(17, 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600'),
(18, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600'),
(19, 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600'),
(20, 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600');

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
  `created_at` datetime(6) DEFAULT current_timestamp(6),
  `communication_score` int(11) DEFAULT NULL,
  `progress_score` int(11) DEFAULT NULL,
  `quality_score` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `reviewer_id`, `reviewee_id`, `reference_type`, `reference_id`, `rating`, `comment`, `created_at`, `communication_score`, `progress_score`, `quality_score`) VALUES
(1, 14, 15, 'ORDER', 26, 3, 'Nhà Thầu oke', '2026-06-17 08:39:12.973108', NULL, NULL, NULL),
(2, 14, 15, 'PROJECT', 5, 5, 'Oke', '2026-06-17 08:55:08.502279', NULL, NULL, NULL),
(3, 14, 15, 'ORDER', 28, 5, 'adwdaw', '2026-06-25 14:01:38.370355', 5, 5, 5),
(4, 14, 15, 'ORDER', 25, 5, 'adwadw', '2026-06-28 13:39:54.220138', 5, 5, 5),
(5, 14, 15, 'ORDER', 33, 4, 'Nhà thấu quá đúng thời gian ', '2026-06-28 13:40:49.291311', 3, 4, 4);

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
(4, 'BID_DEADLINE_DAYS', '7', 'Số ngày nhà thầu có thể gửi bid', '2026-06-11 10:59:43.180087'),
(5, 'customerFee', '5.0', NULL, '2026-06-30 04:27:56.121858'),
(6, 'contractorFee', '5.0', NULL, '2026-06-30 04:27:56.128807'),
(7, 'platformFee', '5.0', NULL, '2026-06-30 04:27:56.131946'),
(8, 'managementFee', '5.0', NULL, '2026-06-30 04:27:56.141680'),
(9, 'vnpay.tmnCode', 'PV7YIINN', NULL, '2026-06-28 13:50:13.776471'),
(10, 'vnpay.hashSecretNormal', 'P4UJTF7S9STPZFQ11RSD2Z59CSG2KXAP', NULL, '2026-06-28 13:50:13.780470'),
(11, 'vnpay.hashSecretToken', 'P4UJTF7S9STPZFQ11RSD2Z59CSG2KXAP', NULL, '2026-06-28 13:50:13.785004'),
(12, 'vnpay.apiUrl', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html', NULL, '2026-06-28 13:50:13.790005'),
(13, 'vnpay.returnUrl', 'http://localhost:5173/wallet', NULL, '2026-06-28 13:50:13.797509'),
(14, 'vnpay.cancelUrl', 'http://localhost:5173/wallet', NULL, '2026-06-28 13:50:13.802771'),
(15, 'vnpay.useMock', 'false', NULL, '2026-06-28 13:04:45.194659'),
(16, 'feature.vnpay.enabled', 'true', NULL, '2026-06-30 05:24:03.365986'),
(17, 'feature.chat.enabled', 'true', NULL, '2026-06-28 13:04:45.206758'),
(18, 'chat.rateLimit.maxMessages', '30', NULL, '2026-06-28 13:04:45.211463'),
(19, 'chat.rateLimit.windowMinutes', '1', NULL, '2026-06-28 13:04:45.215538'),
(20, 'feature.project.approvalRequired', 'false', NULL, '2026-06-28 13:50:13.826556'),
(21, 'feature.disbursement.adminApprovalRequired', 'false', NULL, '2026-06-28 13:50:13.832057'),
(22, 'feature.order.approvalRequired', 'false', NULL, '2026-06-28 13:50:13.838087'),
(23, 'wallet.minCustomerBalanceToOrder', '10000000000', NULL, '2026-06-28 13:50:03.195487'),
(24, 'wallet.minContractorBalanceToBid', '1000000', NULL, '2026-06-28 13:50:03.213098'),
(25, 'wallet.minCustomerBalanceToProject', '1222222', NULL, '2026-06-28 14:04:07.013829');

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
(23, 15, 5880000, 0, NULL, 'LOCK', 'SUCCESS', 'Khóa tiền đơn hàng: ORD-20260612-19-DEPOSIT', 'LOCK-ORD-20260612-19-DEPOSIT', 'CONSTRUCTX_ESCROW', NULL, NULL, NULL, '2026-06-12 10:44:03.844800', NULL, NULL),
(24, 15, 5880000, 0, NULL, 'LOCK', 'SUCCESS', 'Khóa tiền đơn hàng: ORD-20260612-22-DEPOSIT', 'LOCK-ORD-20260612-22-DEPOSIT', 'CONSTRUCTX_ESCROW', NULL, NULL, NULL, '2026-06-12 11:36:30.350406', NULL, NULL),
(25, 14, 1111111, 0, NULL, 'LOCK', 'SUCCESS', 'Khóa tiền đơn hàng: CTR-KQ-CTR-ORD-20260612184928-24', 'LOCK-CTR-KQ-CTR-ORD-20260612184928-24', 'CONSTRUCTX_ESCROW', NULL, NULL, NULL, '2026-06-12 11:58:32.106464', NULL, NULL),
(26, 14, 11400000, 0, NULL, 'REVENUE', 'SUCCESS', 'Giai ngan 95%% hoan cong HD CTR-20260612133850-6', 'CTR-COMPLETE-95-CTR-20260612133850-6', 'CONSTRUCTX_ESCROW', NULL, NULL, NULL, '2026-06-12 15:25:45.550455', NULL, NULL),
(27, 14, 600000, 0, NULL, 'LOCK', 'SUCCESS', 'Khóa tiền đơn hàng: CTR-WARRANTY-CTR-20260612133850-6', 'LOCK-CTR-WARRANTY-CTR-20260612133850-6', 'CONSTRUCTX_WARRANTY', NULL, NULL, NULL, '2026-06-12 15:25:45.558071', NULL, NULL),
(28, 14, 600000, 0, NULL, 'RELEASE', 'SUCCESS', 'Giai ngan tien bao hanh 5%% HD CTR-20260612133850-6', 'CTR-WARRANTY-RELEASE-CTR-20260612133850-6', 'CONSTRUCTX_WARRANTY', NULL, NULL, NULL, '2026-06-12 15:25:56.139988', NULL, NULL),
(29, 15, 2000000, 0, NULL, 'LOCK', 'SUCCESS', 'Thanh toan giai ngan giai doan \'Khởi công\' HD CTR-ORD-20260612184928-24', 'PAY-DISB-4', 'CONSTRUCTX_DISBURSEMENT', NULL, NULL, NULL, '2026-06-12 15:53:30.884039', NULL, NULL),
(30, 14, 2000000, 0, NULL, 'REVENUE', 'SUCCESS', 'Nhan giai ngan giai doan \'Khởi công\' HD CTR-ORD-20260612184928-24 (immediate: 800.000 VND, locked: 1.200.000 VND)', 'RECV-DISB-4', 'CONSTRUCTX_DISBURSEMENT', NULL, NULL, NULL, '2026-06-12 15:53:30.909760', NULL, NULL),
(31, 15, 10000000, 0, NULL, 'LOCK', 'SUCCESS', 'Thanh toan giai ngan giai doan \'Thi công phần thô\' HD CTR-ORD-20260612184928-24', 'PAY-DISB-5', 'CONSTRUCTX_DISBURSEMENT', NULL, NULL, NULL, '2026-06-12 16:14:59.365262', NULL, NULL),
(32, 14, 10000000, 0, NULL, 'REVENUE', 'SUCCESS', 'Nhan giai ngan giai doan \'Thi công phần thô\' HD CTR-ORD-20260612184928-24 (immediate: 3.000.000 VND, locked: 7.000.000 VND)', 'RECV-DISB-5', 'CONSTRUCTX_DISBURSEMENT', NULL, NULL, NULL, '2026-06-12 16:14:59.385904', NULL, NULL),
(33, 14, 1200000, 0, NULL, 'RELEASE', 'SUCCESS', 'Tu dong mo khoa tien bao dam giai doan \'Khởi công\' khi dat moc moi 50%', 'AUTO-UNLOCK-DISB-4', 'CONSTRUCTX_AUTO_UNLOCK', NULL, NULL, NULL, '2026-06-12 16:14:59.421385', NULL, NULL),
(34, 15, 5777778, 0, NULL, 'LOCK', 'SUCCESS', 'Thanh toan giai ngan giai doan \'Bàn giao công trình\' HD CTR-ORD-20260612184928-24', 'PAY-DISB-6', 'CONSTRUCTX_DISBURSEMENT', NULL, NULL, NULL, '2026-06-12 16:22:57.566847', NULL, NULL),
(35, 14, 5777778, 0, NULL, 'REVENUE', 'SUCCESS', 'Nhan giai ngan giai doan \'Bàn giao công trình\' HD CTR-ORD-20260612184928-24 (immediate: 2.888.889 VND, locked: 2.888.889 VND)', 'RECV-DISB-6', 'CONSTRUCTX_DISBURSEMENT', NULL, NULL, NULL, '2026-06-12 16:22:57.578844', NULL, NULL),
(36, 14, 7000000, 0, NULL, 'RELEASE', 'SUCCESS', 'Tu dong mo khoa tien bao dam giai doan \'Thi công phần thô\' khi dat moc moi 100%', 'AUTO-UNLOCK-DISB-5', 'CONSTRUCTX_AUTO_UNLOCK', NULL, NULL, NULL, '2026-06-12 16:22:57.611601', NULL, NULL),
(37, 14, 2888889, 0, NULL, 'RELEASE', 'SUCCESS', 'Mo khoa tien bao dam giai doan \'Bàn giao công trình\' HD CTR-ORD-20260612184928-24', 'UNLOCK-DISB-6', 'CONSTRUCTX_UNLOCK', NULL, NULL, NULL, '2026-06-12 16:24:04.102701', NULL, NULL),
(38, 14, 21111111, 0, NULL, 'REVENUE', 'SUCCESS', 'Giai ngan 95%% hoan cong HD CTR-ORD-20260612184928-24', 'CTR-COMPLETE-95-CTR-ORD-20260612184928-24', 'CONSTRUCTX_ESCROW', NULL, NULL, NULL, '2026-06-12 16:24:27.887649', NULL, NULL),
(39, 14, 1111111, 0, NULL, 'LOCK', 'SUCCESS', 'Khóa tiền đơn hàng: CTR-WARRANTY-CTR-ORD-20260612184928-24', 'LOCK-CTR-WARRANTY-CTR-ORD-20260612184928-24', 'CONSTRUCTX_WARRANTY', NULL, NULL, NULL, '2026-06-12 16:24:27.887649', NULL, NULL),
(40, 14, 100000, 0, NULL, 'LOCK', 'SUCCESS', 'Khóa tiền đơn hàng: CTR-KQ-CTR-ORD-20260617153438-26', 'LOCK-CTR-KQ-CTR-ORD-20260617153438-26', 'CONSTRUCTX_ESCROW', NULL, NULL, NULL, '2026-06-17 08:35:34.645216', NULL, NULL),
(41, 13, 1599998, 0, NULL, 'LOCK', 'SUCCESS', 'Thanh toan giai ngan giai doan \'Bàn giao công trình\' HD CTR-ORD-20260617153438-26', 'PAY-DISB-7', 'CONSTRUCTX_DISBURSEMENT', NULL, NULL, NULL, '2026-06-17 08:38:26.346597', NULL, NULL),
(42, 14, 479999, 0, NULL, 'REVENUE', 'SUCCESS', 'Nhan ngay 479.999 VND giai doan \'Bàn giao công trình\' HD CTR-ORD-20260617153438-26 (30% immediate)', 'RECV-IMM-7', 'CONSTRUCTX_DISBURSEMENT', NULL, NULL, NULL, '2026-06-17 08:38:26.357692', NULL, NULL),
(43, 14, 1119999, 0, NULL, 'LOCK', 'SUCCESS', 'Dong bang 1.119.999 VND giai doan \'Bàn giao công trình\' HD CTR-ORD-20260617153438-26 (70% — mo khi dat moc tiep theo)', 'RECV-LOCK-7', 'CONSTRUCTX_ESCROW', NULL, NULL, NULL, '2026-06-17 08:38:26.361700', NULL, NULL),
(44, 14, 1899998, 0, NULL, 'REVENUE', 'SUCCESS', 'Giai ngan 95%% hoan cong HD CTR-ORD-20260617153438-26', 'CTR-COMPLETE-95-CTR-ORD-20260617153438-26', 'CONSTRUCTX_ESCROW', NULL, NULL, NULL, '2026-06-17 08:38:39.965494', NULL, NULL),
(45, 14, 100000, 0, NULL, 'LOCK', 'SUCCESS', 'Khóa tiền đơn hàng: CTR-WARRANTY-CTR-ORD-20260617153438-26', 'LOCK-CTR-WARRANTY-CTR-ORD-20260617153438-26', 'CONSTRUCTX_WARRANTY', NULL, NULL, NULL, '2026-06-17 08:38:39.965494', NULL, NULL),
(46, 14, 200000, 0, NULL, 'LOCK', 'SUCCESS', 'Khóa tiền đơn hàng: CTR-KQ-CTR-ORD-20260617154516-25', 'LOCK-CTR-KQ-CTR-ORD-20260617154516-25', 'CONSTRUCTX_ESCROW', NULL, NULL, NULL, '2026-06-17 08:46:11.094167', NULL, NULL),
(47, 13, 3200000, 0, NULL, 'LOCK', 'SUCCESS', 'Thanh toan giai ngan giai doan \'Bàn giao công trình\' HD CTR-ORD-20260617154516-25', 'PAY-DISB-8', 'CONSTRUCTX_DISBURSEMENT', NULL, NULL, NULL, '2026-06-17 08:47:10.251720', NULL, NULL),
(48, 14, 960000, 0, NULL, 'REVENUE', 'SUCCESS', 'Nhan ngay 960.000 VND giai doan \'Bàn giao công trình\' HD CTR-ORD-20260617154516-25 (30% immediate)', 'RECV-IMM-8', 'CONSTRUCTX_DISBURSEMENT', NULL, NULL, NULL, '2026-06-17 08:47:10.257806', NULL, NULL),
(49, 14, 2240000, 0, NULL, 'LOCK', 'SUCCESS', 'Dong bang 2.240.000 VND giai doan \'Bàn giao công trình\' HD CTR-ORD-20260617154516-25 (70% — mo khi dat moc tiep theo)', 'RECV-LOCK-8', 'CONSTRUCTX_ESCROW', NULL, NULL, NULL, '2026-06-17 08:47:10.262844', NULL, NULL),
(50, 14, 3800000, 0, NULL, 'REVENUE', 'SUCCESS', 'Giai ngan 95%% hoan cong HD CTR-ORD-20260617154516-25', 'CTR-COMPLETE-95-CTR-ORD-20260617154516-25', 'CONSTRUCTX_ESCROW', NULL, NULL, NULL, '2026-06-24 13:38:24.350841', NULL, NULL),
(51, 14, 200000, 0, NULL, 'LOCK', 'SUCCESS', 'Khóa tiền đơn hàng: CTR-WARRANTY-CTR-ORD-20260617154516-25', 'LOCK-CTR-WARRANTY-CTR-ORD-20260617154516-25', 'CONSTRUCTX_WARRANTY', NULL, NULL, NULL, '2026-06-24 13:38:24.398157', NULL, NULL),
(52, 14, 1111111, 0, NULL, 'LOCK', 'SUCCESS', 'Khóa tiền đơn hàng: CTR-KQ-CTR-ORD-20260624213537-27', 'LOCK-CTR-KQ-CTR-ORD-20260624213537-27', 'CONSTRUCTX_ESCROW', NULL, NULL, NULL, '2026-06-24 14:36:19.440555', NULL, NULL),
(53, 14, 200000, 0, NULL, 'RELEASE', 'SUCCESS', 'Giai ngan tien bao hanh 5%% HD CTR-ORD-20260617154516-25', 'CTR-WARRANTY-RELEASE-CTR-ORD-20260617154516-25', 'CONSTRUCTX_WARRANTY', NULL, NULL, NULL, '2026-06-24 15:16:56.029298', NULL, NULL),
(54, 14, 100000, 0, NULL, 'RELEASE', 'SUCCESS', 'Giai ngan tien bao hanh 5%% HD CTR-ORD-20260617153438-26', 'CTR-WARRANTY-RELEASE-CTR-ORD-20260617153438-26', 'CONSTRUCTX_WARRANTY', NULL, NULL, NULL, '2026-06-24 15:17:00.626384', NULL, NULL),
(55, 14, 1111111, 0, NULL, 'RELEASE', 'SUCCESS', 'Giai ngan tien bao hanh 5%% HD CTR-ORD-20260612184928-24', 'CTR-WARRANTY-RELEASE-CTR-ORD-20260612184928-24', 'CONSTRUCTX_WARRANTY', NULL, NULL, NULL, '2026-06-24 15:17:12.049917', NULL, NULL),
(56, 14, 111111, 0, NULL, 'LOCK', 'SUCCESS', 'Khóa tiền đơn hàng: CTR-KQ-CTR-ORD-20260625205425-28', 'LOCK-CTR-KQ-CTR-ORD-20260625205425-28', 'CONSTRUCTX_ESCROW', NULL, NULL, NULL, '2026-06-25 13:55:07.287573', NULL, NULL),
(57, 13, 1777777, 0, NULL, 'LOCK', 'SUCCESS', 'Thanh toan giai ngan giai doan \'Bàn giao công trình\' HD CTR-ORD-20260625205425-28', 'PAY-DISB-9', 'CONSTRUCTX_DISBURSEMENT', NULL, NULL, NULL, '2026-06-25 13:56:46.124105', NULL, NULL),
(58, 14, 533333, 0, NULL, 'REVENUE', 'SUCCESS', 'Nhan ngay 533.333 VND giai doan \'Bàn giao công trình\' HD CTR-ORD-20260625205425-28 (30% immediate)', 'RECV-IMM-9', 'CONSTRUCTX_DISBURSEMENT', NULL, NULL, NULL, '2026-06-25 13:56:46.132140', NULL, NULL),
(59, 14, 1244444, 0, NULL, 'LOCK', 'SUCCESS', 'Dong bang 1.244.444 VND giai doan \'Bàn giao công trình\' HD CTR-ORD-20260625205425-28 (70% — mo khi dat moc tiep theo)', 'RECV-LOCK-9', 'CONSTRUCTX_ESCROW', NULL, NULL, NULL, '2026-06-25 13:56:46.135381', NULL, NULL),
(60, 13, 111111, 0, NULL, 'RELEASE', 'SUCCESS', 'Khấu trừ 5% phí hoa hồng nền tảng: 111.111 VND', 'CTR-COMM-CTR-ORD-20260625205425-28', 'CONSTRUCTX_COMMISSION', NULL, NULL, NULL, '2026-06-25 13:58:53.502292', NULL, NULL),
(61, 14, 2000000, 0, NULL, 'REVENUE', 'SUCCESS', 'Giai ngan 90%% hoan cong (da tru 5%% phi) HD CTR-ORD-20260625205425-28', 'CTR-COMPLETE-90-CTR-ORD-20260625205425-28', 'CONSTRUCTX_ESCROW', NULL, NULL, NULL, '2026-06-25 13:58:53.510461', NULL, NULL),
(62, 14, 111111, 0, NULL, 'LOCK', 'SUCCESS', 'Khóa tiền đơn hàng: CTR-WARRANTY-CTR-ORD-20260625205425-28', 'LOCK-CTR-WARRANTY-CTR-ORD-20260625205425-28', 'CONSTRUCTX_WARRANTY', NULL, NULL, NULL, '2026-06-25 13:58:53.513975', NULL, NULL),
(63, 14, 111111, 0, NULL, 'RELEASE', 'SUCCESS', 'Giai ngan tien bao hanh 5%% HD CTR-ORD-20260625205425-28', 'CTR-WARRANTY-RELEASE-CTR-ORD-20260625205425-28', 'CONSTRUCTX_WARRANTY', NULL, NULL, NULL, '2026-06-25 14:01:21.404144', NULL, NULL),
(64, 14, 1000000, 0, NULL, 'LOCK', 'SUCCESS', 'Khóa tiền đơn hàng: CTR-KQ-CTR-ORD-20260625213226-29', 'LOCK-CTR-KQ-CTR-ORD-20260625213226-29', 'CONSTRUCTX_ESCROW', NULL, NULL, NULL, '2026-06-25 14:32:50.866661', NULL, NULL),
(65, 14, 1250000, 0, NULL, 'LOCK', 'SUCCESS', 'Khóa tiền đơn hàng: CTR-KQ-CTR-ORD-20260626213544-32', 'LOCK-CTR-KQ-CTR-ORD-20260626213544-32', 'CONSTRUCTX_ESCROW', NULL, NULL, NULL, '2026-06-26 14:38:57.200460', NULL, NULL),
(66, 14, 111111, 0, NULL, 'LOCK', 'SUCCESS', 'Khóa tiền đơn hàng: CTR-KQ-CTR-ORD-20260626212604-11', 'LOCK-CTR-KQ-CTR-ORD-20260626212604-11', 'CONSTRUCTX_ESCROW', NULL, NULL, NULL, '2026-06-26 14:39:19.780842', NULL, NULL),
(67, 13, 10000000, 0, NULL, 'WITHDRAW', 'SUCCESS', 'Rút về NH: Vietcombank | STK: 1234 | Tên: alo | Admin duyệt: Hệ thống phê duyệt - Đã chuyển khoản thành công.', 'WD-99005721', 'MANUAL_BANK_TRANSFER', NULL, NULL, NULL, '2026-06-26 16:20:29.358347', NULL, NULL),
(68, 14, 111111, 0, NULL, 'LOCK', 'SUCCESS', 'Khóa tiền đơn hàng: CTR-KQ-CTR-ORD-20260626233019-33', 'LOCK-CTR-KQ-CTR-ORD-20260626233019-33', 'CONSTRUCTX_ESCROW', NULL, NULL, NULL, '2026-06-26 16:31:10.401171', NULL, NULL),
(69, 13, 1500000, 0, NULL, 'LOCK', 'SUCCESS', 'Thanh toan giai ngan giai doan \'Bàn giao công trình\' HD CTR-ORD-20260626233019-33', 'PAY-DISB-11', 'CONSTRUCTX_DISBURSEMENT', NULL, NULL, NULL, '2026-06-26 16:32:42.945997', NULL, NULL),
(70, 14, 450000, 0, NULL, 'REVENUE', 'SUCCESS', 'Nhan ngay 450.000 VND giai doan \'Bàn giao công trình\' HD CTR-ORD-20260626233019-33 (30% immediate)', 'RECV-IMM-11', 'CONSTRUCTX_DISBURSEMENT', NULL, NULL, NULL, '2026-06-26 16:32:42.955570', NULL, NULL),
(71, 14, 1050000, 0, NULL, 'LOCK', 'SUCCESS', 'Dong bang 1.050.000 VND giai doan \'Bàn giao công trình\' HD CTR-ORD-20260626233019-33 (70% — mo khi dat moc tiep theo)', 'RECV-LOCK-11', 'CONSTRUCTX_ESCROW', NULL, NULL, NULL, '2026-06-26 16:32:42.957557', NULL, NULL),
(72, 13, 111111, 0, NULL, 'RELEASE', 'SUCCESS', 'Khấu trừ 5% phí hoa hồng nền tảng: 111.111 VND', 'CTR-COMM-CTR-ORD-20260626233019-33', 'CONSTRUCTX_COMMISSION', NULL, NULL, NULL, '2026-06-26 16:33:04.855708', NULL, NULL),
(73, 14, 2000000, 0, NULL, 'REVENUE', 'SUCCESS', 'Giai ngan 90%% hoan cong (da tru 5%% phi) HD CTR-ORD-20260626233019-33', 'CTR-COMPLETE-90-CTR-ORD-20260626233019-33', 'CONSTRUCTX_ESCROW', NULL, NULL, NULL, '2026-06-26 16:33:04.860945', NULL, NULL),
(74, 14, 111111, 0, NULL, 'LOCK', 'SUCCESS', 'Khóa tiền đơn hàng: CTR-WARRANTY-CTR-ORD-20260626233019-33', 'LOCK-CTR-WARRANTY-CTR-ORD-20260626233019-33', 'CONSTRUCTX_WARRANTY', NULL, NULL, NULL, '2026-06-26 16:33:04.862923', NULL, NULL),
(75, 14, 1050000, 0, NULL, 'RELEASE', 'SUCCESS', 'Mo khoa tien bao dam giai doan \'Bàn giao công trình\' HD CTR-ORD-20260626233019-33', 'UNLOCK-DISB-11', 'CONSTRUCTX_UNLOCK', NULL, NULL, NULL, '2026-06-26 16:34:21.417482', NULL, NULL),
(76, 14, 555556, 0, NULL, 'LOCK', 'SUCCESS', 'Khóa tiền đơn hàng: CTR-KQ-CTR-ORD-20260627172807-35', 'LOCK-CTR-KQ-CTR-ORD-20260627172807-35', 'CONSTRUCTX_ESCROW', NULL, NULL, NULL, '2026-06-27 10:28:22.829511', NULL, NULL),
(77, 13, 1000000, 0, NULL, 'DEPOSIT', 'SUCCESS', 'Nạp tiền thành công qua cổng kết nối VNPAY Sandbox', 'SANDBOX-LOCAL-SUCCESS-1782571384182', 'VNPAY', NULL, NULL, NULL, '2026-06-27 14:42:27.753955', NULL, NULL),
(78, 13, 12222220, 0, NULL, 'LOCK', 'FAILED', 'Khóa tiền đơn hàng: CTR-ESCROW-19-8 | [Hội đồng giải quyết tranh chấp nhiều giai đoạn] Quỹ tranh chấp: 5788887. Hoàn trả User 100.0% (5788887), Trả Constructor 0.0% (0)', 'LOCK-CTR-ESCROW-19-8', 'CONSTRUCTX_ESCROW', NULL, NULL, NULL, '2026-06-28 13:07:46.733035', NULL, NULL),
(79, 14, 611111, 0, NULL, 'LOCK', 'SUCCESS', 'Khóa tiền đơn hàng: CTR-KQ-PRJ-19-8', 'LOCK-CTR-KQ-PRJ-19-8', 'CONSTRUCTX_ESCROW', NULL, NULL, NULL, '2026-06-28 13:07:46.805504', NULL, NULL),
(80, 13, 5000000, 0, NULL, 'LOCK', 'SUCCESS', 'Thanh toan giai ngan giai doan \'Thi công phần thô\' HD CTR-20260628200746-8', 'PAY-DISB-14', 'CONSTRUCTX_DISBURSEMENT', NULL, NULL, NULL, '2026-06-28 13:11:45.215543', NULL, NULL),
(81, 14, 1500000, 0, NULL, 'REVENUE', 'SUCCESS', 'Nhan ngay 1.500.000 VND giai doan \'Thi công phần thô\' HD CTR-20260628200746-8 (30% immediate)', 'RECV-IMM-14', 'CONSTRUCTX_DISBURSEMENT', NULL, NULL, NULL, '2026-06-28 13:11:45.224638', NULL, NULL),
(82, 14, 3500000, 0, NULL, 'LOCK', 'SUCCESS', 'Dong bang 3.500.000 VND giai doan \'Thi công phần thô\' HD CTR-20260628200746-8 (70% — mo khi dat moc tiep theo)', 'RECV-LOCK-14', 'CONSTRUCTX_ESCROW', NULL, NULL, NULL, '2026-06-28 13:11:45.227308', NULL, NULL),
(83, 13, 4777776, 0, NULL, 'LOCK', 'SUCCESS', 'Thanh toan giai ngan giai doan \'Bàn giao công trình\' HD CTR-20260628200746-8', 'PAY-DISB-15', 'CONSTRUCTX_DISBURSEMENT', NULL, NULL, NULL, '2026-06-28 13:14:03.902177', NULL, NULL),
(84, 14, 1433333, 0, NULL, 'REVENUE', 'SUCCESS', 'Nhan ngay 1.433.333 VND giai doan \'Bàn giao công trình\' HD CTR-20260628200746-8 (30% immediate)', 'RECV-IMM-15', 'CONSTRUCTX_DISBURSEMENT', NULL, NULL, NULL, '2026-06-28 13:14:03.919311', NULL, NULL),
(85, 14, 3344443, 0, NULL, 'LOCK', 'SUCCESS', 'Dong bang 3.344.443 VND giai doan \'Bàn giao công trình\' HD CTR-20260628200746-8 (70% — mo khi dat moc tiep theo)', 'RECV-LOCK-15', 'CONSTRUCTX_ESCROW', NULL, NULL, NULL, '2026-06-28 13:14:03.921292', NULL, NULL),
(86, 14, 3500000, 0, NULL, 'RELEASE', 'SUCCESS', 'Tu dong mo khoa tien bao dam giai doan \'Thi công phần thô\' khi dat moc moi 100%', 'AUTO-UNLOCK-DISB-14', 'CONSTRUCTX_AUTO_UNLOCK', NULL, NULL, NULL, '2026-06-28 13:14:03.945675', NULL, NULL),
(87, 13, 5788887, 0, NULL, 'RELEASE', 'SUCCESS', 'Nhận tiền phân xử tranh chấp dự án: PRJ-19 (Quỹ còn lại: 2444444, Hoàn trả: 5788887)', 'DISP-USER-PRJ-19', 'CONSTRUCTX_ARBITRATION', NULL, NULL, NULL, '2026-06-28 13:15:40.690828', NULL, NULL),
(88, 14, 0, 0, NULL, 'REVENUE', 'SUCCESS', 'Nhận tiền phân xử tranh chấp dự án: PRJ-19 (Quỹ khóa: 3344443, Được nhận: 0)', 'DISP-CONS-PRJ-19', 'CONSTRUCTX_ARBITRATION', NULL, NULL, NULL, '2026-06-28 13:15:40.692825', NULL, NULL),
(89, 14, 1000000, 0, NULL, 'DEPOSIT', 'SUCCESS', 'Nạp tiền thành công qua cổng kết nối VNPAY Sandbox', 'SANDBOX-LOCAL-SUCCESS-1782793751190', 'VNPAY', NULL, NULL, NULL, '2026-06-30 04:28:22.006734', NULL, NULL),
(90, 14, 1000000, 0, NULL, 'DEPOSIT', 'PENDING', 'Yêu cầu nạp tiền hệ thống ConstructX', '20260630112929324966', 'VNPAY', NULL, NULL, NULL, '2026-06-30 04:29:29.550741', NULL, NULL),
(91, 14, 500000, 0, NULL, 'DEPOSIT', 'PENDING', 'Yêu cầu nạp tiền hệ thống ConstructX', '20260630112932431220', 'VNPAY', NULL, NULL, NULL, '2026-06-30 04:29:32.685175', NULL, NULL),
(92, 14, 1000000, 0, NULL, 'DEPOSIT', 'PENDING', 'Yêu cầu nạp tiền hệ thống ConstructX', '20260630112940177312', 'VNPAY', NULL, NULL, NULL, '2026-06-30 04:29:40.663552', NULL, NULL),
(93, 14, 1000000, 0, NULL, 'DEPOSIT', 'PENDING', 'Yêu cầu nạp tiền hệ thống ConstructX', '20260630122203679500', 'VNPAY', NULL, NULL, NULL, '2026-06-30 05:22:03.370895', NULL, NULL);

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
(1, 'admin@constructx.com', '$2a$10$GxJTLUHbDM/PhnUExLhrJumEfp0YHl5Xzdtu0sSGWXNKIl6d7Ix4O', 'Admin Hệ Thống', '0912345678', NULL, NULL, 'ADMIN', 'APPROVED', b'1', '2026-06-11 10:59:43.041987', '2026-06-30 12:21:18.016991'),
(2, 'contractor1@gmail.com', '$2a$10$B0tBqPjy7j9MP/VlkEW46e6AD5v7eUZZwaLWZz2OJ0o70Sw0SKQxW', 'Xưởng Mộc ABC', '0988888881', NULL, NULL, 'CONTRACTOR', 'APPROVED', b'1', '2026-06-11 10:59:43.041987', '2026-06-28 21:12:50.930499'),
(3, 'contractor2@gmail.com', '$2a$10$B0tBqPjy7j9MP/VlkEW46e6AD5v7eUZZwaLWZz2OJ0o70Sw0SKQxW', 'Nội Thất Đức Duy', '0988888882', NULL, NULL, 'CONTRACTOR', 'APPROVED', b'1', '2026-06-11 10:59:43.041987', '2026-06-11 10:59:43.041987'),
(4, 'customer1@gmail.com', '$2a$10$B0tBqPjy7j9MP/VlkEW46e6AD5v7eUZZwaLWZz2OJ0o70Sw0SKQxW', 'Nguyễn Văn A', '0901234561', NULL, NULL, 'CUSTOMER', 'APPROVED', b'1', '2026-06-11 10:59:43.041987', '2026-06-11 10:59:43.041987'),
(5, 'customer2@gmail.com', '$2a$10$B0tBqPjy7j9MP/VlkEW46e6AD5v7eUZZwaLWZz2OJ0o70Sw0SKQxW', 'Trần Thị B', '0901234562', NULL, NULL, 'CUSTOMER', 'APPROVED', b'1', '2026-06-11 10:59:43.041987', '2026-06-11 10:59:43.041987'),
(6, 'customer3@gmail.com', '$2a$10$B0tBqPjy7j9MP/VlkEW46e6AD5v7eUZZwaLWZz2OJ0o70Sw0SKQxW', 'Lê Văn C', '0901234563', NULL, NULL, 'CUSTOMER', 'APPROVED', b'1', '2026-06-11 10:59:43.041987', '2026-06-11 10:59:43.041987'),
(7, 'khachhang1@test.com', '$2a$10$QoAd9N8k2C.zKN5E16BIL.5vyn.X1uOnfs4jY6VCE/7aTXl8FaoUO', 'Nguyễn Thị Lan', '0901234561', '123 Lê Lợi, Q.1, TP.HCM', NULL, 'CUSTOMER', 'APPROVED', b'1', '2026-06-11 06:44:26.234242', '2026-06-30 12:21:18.179168'),
(8, 'khachhang2@test.com', '$2a$10$AhuF3ngjfeYu29Yyf5184.Sx8jSFao/MILCsDEU.4xKyn3En2Vkbm', 'Trần Văn Minh', '0901234562', '45 Nguyễn Huệ, Q.1, TP.HCM', NULL, 'CUSTOMER', 'APPROVED', b'1', '2026-06-11 06:44:26.312338', '2026-06-30 12:21:18.355537'),
(9, 'khachhang3@test.com', '$2a$10$rTlBpChai.kvHzj8bx7Zke8sVhhehy24OSgGbbfhOxk0xvE/CH6PK', 'Phạm Thị Hoa', '0901234563', '88 Đinh Tiên Hoàng, Hà Nội', NULL, 'CUSTOMER', 'APPROVED', b'1', '2026-06-11 06:44:26.390590', '2026-06-30 12:21:18.535666'),
(10, 'nhathauchuyennghiep@test.com', '$2a$10$PkIwiXrizF.nuff4zPJRR.v7O1CjZYDzMJamG4d9FDR5XtVdvSLEy', 'Công ty Nội thất Minh Phú', '0912345671', '56 Hai Bà Trưng, TP.HCM', NULL, 'CONTRACTOR', 'APPROVED', b'1', '2026-06-11 06:44:26.484822', '2026-06-30 12:21:18.718892'),
(11, 'nhaxuong_abc@test.com', '$2a$10$NafjuTT3GCp0xtfIMr5b4eQ.7pl/8z5zCIvjEt5KJz1l2czqKeX..', 'Xưởng Mộc ABC', '0912345672', '78 Trường Chinh, Hà Nội', NULL, 'CONTRACTOR', 'APPROVED', b'1', '2026-06-11 06:44:26.624319', '2026-06-30 12:21:18.889371'),
(12, 'noithat_vietlong@test.com', '$2a$10$LOYXZPuVtu9VXLuiLS8rnuryF/U6OoTH811H7zD6Cr.b1VLNSAq7m', 'Nội thất Việt Long', '0912345673', '12 Cộng Hòa, Tân Bình, TP.HCM', NULL, 'CONTRACTOR', 'APPROVED', b'1', '2026-06-11 06:44:26.790588', '2026-06-30 12:21:19.078143'),
(13, 'contractor_pending@test.com', '$2a$10$9xYW8388w7cA75SpdOhZ6eEmH0c4g3qdvfrWsL7O1HzWrRDwdntmS', 'Nhà thầu Đăng Ký Mới', '0912345674', '99 Lý Thường Kiệt, TP.HCM', NULL, 'CONTRACTOR', 'APPROVED', b'1', '2026-06-11 06:44:26.959180', '2026-06-30 12:21:19.250454'),
(14, 'thuando@gmail.com', '$2a$10$TtnFbEK9EUM47pkvM0wPQeYVyk.2zQ/OZC.d5O0hm6dPyJCAfJC7a', 'Đỗ Khán Thuận', '0987654321', '', NULL, 'CUSTOMER', 'APPROVED', b'1', '2026-06-11 06:46:11.950228', '2026-06-30 11:25:09.525178'),
(15, 'thuan.dokhanh04@gmail.com', '$2a$10$kuF9mC96UqOMgRJcunpwxe65OGUoi6PZwY6AitDxI7egPy4GMR9wW', 'Khánh THuan simple ', '0987654321', 'Hồ Chi Minh', 'https://res.cloudinary.com/dtufvt361/image/upload/v1782656987/cal4nx4np4ebpdpmkjb7.jpg', 'CONTRACTOR', 'APPROVED', b'1', '2026-06-11 06:47:57.594635', '2026-06-28 21:30:09.558989'),
(16, 'hoang@gmail.com', '$2a$10$iXPe178bHmQ494vbXlf5N.7BJHbh0WFXZoqWrt6TPdxHlEkx7pflW', 'Nguyên Hoàng Dũng ', '099999999', NULL, NULL, 'CUSTOMER', 'APPROVED', b'1', '2026-06-12 10:16:24.071180', '2026-06-12 17:16:24.076442'),
(17, 'dothuan@gmail.com', '$2a$10$Idg1ZvCoWGbCMBNb85.YkOnL.D9ql3SsG5AJa780l380XWqMMwMm2', 'a', '0999999999', NULL, NULL, 'CONTRACTOR', 'APPROVED', b'1', '2026-06-12 16:01:00.124305', '2026-06-12 23:06:09.833485'),
(18, 'thuando1@gmail.com', '$2a$10$T63ocwMjn2p9Nu3gK2Ax6ufLRkApfsV6w4NN1abay7.P8hG2XPvn6', 'Nội thất xinh ', '098744231', 'adw', 'https://res.cloudinary.com/dtufvt361/image/upload/v1782656592/p70g2u0xmeutgqin0xvg.jpg', 'CONTRACTOR', 'APPROVED', b'1', '2026-06-28 14:22:24.846125', '2026-06-28 21:37:04.004179');

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
(13, 14, 65577783, 43737776, NULL),
(14, 15, 185099995, 9354443, NULL),
(15, 16, 82222222, 17640000, NULL),
(16, 17, 0, 0, NULL),
(17, 18, 0, 0, NULL),
(18, 13, 12000000, 0, NULL);

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
  ADD PRIMARY KEY (`id`);

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
  ADD KEY `FKgt0ptrh4a7m56ko9goqvfmbv4` (`reviewed_by`),
  ADD KEY `FKbikfl6u96fxnddss52jo7is5h` (`admin_verified_by`);

--
-- Indexes for table `disputes`
--
ALTER TABLE `disputes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK1lwc0ndqd7yheurmc394ik080` (`contractor_id`),
  ADD KEY `FKrbd7ru76utd4uqya6dyjjhpws` (`customer_id`),
  ADD KEY `FKt9k296yc6dqsbc74t7ed0yefc` (`project_id`),
  ADD KEY `FKech212qqnjqbft1r3cgk6wi45` (`contract_id`);

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
-- Indexes for table `platform_transactions`
--
ALTER TABLE `platform_transactions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `platform_wallets`
--
ALTER TABLE `platform_wallets`
  ADD PRIMARY KEY (`id`);

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
-- Indexes for table `project_image_urls`
--
ALTER TABLE `project_image_urls`
  ADD KEY `FKe4j9f6bnrr7yagt4krq1bsv8k` (`project_id`);

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
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `bid_details`
--
ALTER TABLE `bid_details`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

--
-- AUTO_INCREMENT for table `chat_rooms`
--
ALTER TABLE `chat_rooms`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `chat_room_members`
--
ALTER TABLE `chat_room_members`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `construction_logs`
--
ALTER TABLE `construction_logs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `contracts`
--
ALTER TABLE `contracts`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `contract_jobs`
--
ALTER TABLE `contract_jobs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contract_stages`
--
ALTER TABLE `contract_stages`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- AUTO_INCREMENT for table `disbursement_requests`
--
ALTER TABLE `disbursement_requests`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `disputes`
--
ALTER TABLE `disputes`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `dispute_messages`
--
ALTER TABLE `dispute_messages`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `escrow_accounts`
--
ALTER TABLE `escrow_accounts`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `material_categories`
--
ALTER TABLE `material_categories`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `milestone_updates`
--
ALTER TABLE `milestone_updates`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=583;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `order_bids`
--
ALTER TABLE `order_bids`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `order_bid_items`
--
ALTER TABLE `order_bid_items`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `platform_transactions`
--
ALTER TABLE `platform_transactions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `platform_wallets`
--
ALTER TABLE `platform_wallets`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=94;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `user_tokens`
--
ALTER TABLE `user_tokens`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wallets`
--
ALTER TABLE `wallets`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

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
  ADD CONSTRAINT `fk_contractor_profiles_user` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `FKbikfl6u96fxnddss52jo7is5h` FOREIGN KEY (`admin_verified_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKdba6cjk6w2lkw7hvyxjtuonej` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`),
  ADD CONSTRAINT `FKgt0ptrh4a7m56ko9goqvfmbv4` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `disputes`
--
ALTER TABLE `disputes`
  ADD CONSTRAINT `FK1lwc0ndqd7yheurmc394ik080` FOREIGN KEY (`contractor_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FKech212qqnjqbft1r3cgk6wi45` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`),
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
-- Constraints for table `project_image_urls`
--
ALTER TABLE `project_image_urls`
  ADD CONSTRAINT `FKe4j9f6bnrr7yagt4krq1bsv8k` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`);

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
