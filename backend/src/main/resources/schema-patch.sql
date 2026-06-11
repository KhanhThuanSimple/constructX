-- ============================================================
-- Schema patch: thêm các bảng và columns mới
-- Chạy khi application.yml dùng: sql.init.schema-locations: classpath:schema-patch.sql
-- ============================================================

-- Bảng portfolio_items (hồ sơ năng lực nhà thầu)
CREATE TABLE IF NOT EXISTS `portfolio_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `contractor_id` BIGINT NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT,
    `category` VARCHAR(100),
    `image_url` VARCHAR(500),
    `project_value` BIGINT,
    `completion_year` VARCHAR(10),
    `client_name` VARCHAR(200),
    `location` VARCHAR(200),
    `created_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_portfolio_contractor` FOREIGN KEY (`contractor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng reviews (đánh giá)
CREATE TABLE IF NOT EXISTS `reviews` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `reviewer_id` BIGINT NOT NULL,
    `reviewee_id` BIGINT NOT NULL,
    `reference_type` VARCHAR(20) NOT NULL,
    `reference_id` BIGINT NOT NULL,
    `rating` INT NOT NULL,
    `comment` VARCHAR(1000),
    `created_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_reviewer_ref` (`reviewer_id`, `reference_type`, `reference_id`),
    CONSTRAINT `fk_review_reviewer` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_review_reviewee` FOREIGN KEY (`reviewee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thêm columns vào bảng bids nếu chưa có
ALTER TABLE `bids`
    ADD COLUMN IF NOT EXISTS `warranty_months` INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS `payment_terms` TEXT,
    ADD COLUMN IF NOT EXISTS `submitted_at` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN IF NOT EXISTS `reviewed_at` DATETIME(6) NULL;

-- Cập nhật ENUM status của bids để thêm WITHDRAWN
-- (MySQL không hỗ trợ ALTER ENUM trực tiếp đơn giản, dùng MODIFY COLUMN)
ALTER TABLE `bids`
    MODIFY COLUMN `status` ENUM('PENDING','ACCEPTED','REJECTED','CANCELLED','WITHDRAWN') DEFAULT 'PENDING';

-- Cập nhật ENUM status của project để thêm COMPLETED
ALTER TABLE `project`
    MODIFY COLUMN `status` ENUM('DRAFT','OPEN','IN_PROGRESS','COMPLETED','CLOSED','CANCELLED') DEFAULT 'DRAFT';
