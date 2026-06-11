-- ============================================================
-- ConstructX Database Schema — Unified
-- Database: constructx_db (MySQL 8)
-- Tạo database trước: CREATE DATABASE constructx_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

-- ────────────────────────────────────────────────────────────
-- 1. USERS — Tài khoản người dùng
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              BIGINT NOT NULL AUTO_INCREMENT,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255),
    phone_number    VARCHAR(50),
    address         TEXT,
    avatar_url      VARCHAR(500),
    role            ENUM('CUSTOMER','CONTRACTOR','ADMIN') NOT NULL,
    approval_status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'APPROVED',
    active          TINYINT(1) DEFAULT 1,
    created_at      DATETIME(6),
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 2. WALLETS — Ví điện tử (1-1 với users)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wallets (
    id            BIGINT NOT NULL AUTO_INCREMENT,
    user_id       BIGINT NOT NULL UNIQUE,
    balance       BIGINT DEFAULT 0,
    locked_amount BIGINT DEFAULT 0,
    updated_at    DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_wallets_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 3. TRANSACTIONS — Lịch sử giao dịch ví
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
    id                  BIGINT NOT NULL AUTO_INCREMENT,
    wallet_id           BIGINT NOT NULL,
    type                ENUM('DEPOSIT','LOCK','RELEASE','WITHDRAW','TOKEN_CREATE','TOKEN_PAY','REVENUE') NOT NULL,
    amount              BIGINT NOT NULL,
    status              ENUM('PENDING','SUCCESS','FAILED','CANCELLED') NOT NULL,
    payment_gateway     VARCHAR(100),
    gateway_order_id    VARCHAR(255),
    gateway_trans_id    VARCHAR(255),
    description         VARCHAR(500),
    created_at          DATETIME(6),
    completed_at        DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_transactions_wallet FOREIGN KEY (wallet_id) REFERENCES wallets(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 4. PRODUCTS — Sản phẩm nội thất (admin quản lý)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id              BIGINT NOT NULL AUTO_INCREMENT,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    price           DECIMAL(15,0) NOT NULL DEFAULT 0,
    original_price  DECIMAL(15,0),
    image_url       VARCHAR(500),
    category        VARCHAR(100),    -- SOFA|TABLE|CHAIR|BED|CABINET|DECOR
    brand           VARCHAR(100),
    material        VARCHAR(200),
    dimensions      VARCHAR(100),
    color           VARCHAR(100),
    stock           INT DEFAULT 0,
    rating          DOUBLE DEFAULT 0.0,
    review_count    INT DEFAULT 0,
    featured        TINYINT(1) DEFAULT 0,
    active          TINYINT(1) DEFAULT 1,
    created_at      DATETIME(6),
    updated_at      DATETIME(6),
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 5. ORDERS — Đơn đặt hàng (CATALOG hoặc CUSTOM)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id                      BIGINT NOT NULL AUTO_INCREMENT,
    order_code              VARCHAR(30) UNIQUE,
    customer_id             BIGINT NOT NULL,
    assigned_contractor_id  BIGINT,
    selected_bid_id         BIGINT,
    type                    VARCHAR(20) DEFAULT 'CATALOG',    -- CATALOG|CUSTOM
    status                  VARCHAR(30) DEFAULT 'PENDING',
    -- PENDING → OPEN_BIDDING → BIDDING_CLOSED → PROCESSING → SHIPPED → DELIVERED | CANCELLED
    total_amount            DECIMAL(15,0) DEFAULT 0,
    delivery_address        TEXT,
    contact_phone           VARCHAR(255),
    customer_note           TEXT,
    custom_requirements     TEXT,    -- yêu cầu tùy chỉnh / BOM từ Designer 2D
    reference_image_url     VARCHAR(500),
    processing_note         TEXT,    -- ghi chú admin
    created_at              DATETIME(6),
    updated_at              DATETIME(6),
    confirmed_at            DATETIME(6),
    delivered_at            DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_orders_customer          FOREIGN KEY (customer_id) REFERENCES users(id),
    CONSTRAINT fk_orders_contractor        FOREIGN KEY (assigned_contractor_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 6. ORDER_ITEMS — Chi tiết sản phẩm trong đơn hàng
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
    id          BIGINT NOT NULL AUTO_INCREMENT,
    order_id    BIGINT NOT NULL,
    product_id  BIGINT,    -- NULL nếu là custom item
    item_name   VARCHAR(255) NOT NULL,
    image_url   VARCHAR(500),
    quantity    INT NOT NULL DEFAULT 1,
    unit_price  DECIMAL(15,0) NOT NULL DEFAULT 0,
    subtotal    DECIMAL(15,0) NOT NULL DEFAULT 0,
    custom_note TEXT,
    PRIMARY KEY (id),
    CONSTRAINT fk_order_items_order   FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 7. ORDER_BIDS — Báo giá nhà thầu cho đơn CUSTOM
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_bids (
    id                   BIGINT NOT NULL AUTO_INCREMENT,
    order_id             BIGINT NOT NULL,
    contractor_id        BIGINT NOT NULL,
    quoted_price         DECIMAL(15,0),
    estimated_days       INT,
    proposal             TEXT,
    portfolio_image_url  VARCHAR(500),
    status               VARCHAR(20) DEFAULT 'PENDING',    -- PENDING|ACCEPTED|REJECTED
    created_at           DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_order_bids_order      FOREIGN KEY (order_id)      REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_bids_contractor FOREIGN KEY (contractor_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 8. ORDER_BID_ITEMS — Chi tiết hạng mục trong báo giá đơn
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_bid_items (
    id                BIGINT NOT NULL AUTO_INCREMENT,
    order_bid_id      BIGINT NOT NULL,
    item_name         VARCHAR(255) NOT NULL,
    unit              VARCHAR(50),
    quantity          DOUBLE,
    unit_price        DECIMAL(15,0),
    total_price       DECIMAL(15,0),
    description       TEXT,
    sample_image_url  VARCHAR(500),
    PRIMARY KEY (id),
    CONSTRAINT fk_order_bid_items_bid FOREIGN KEY (order_bid_id) REFERENCES order_bids(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 9. PROJECT — Dự án thi công
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project (
    id              BIGINT NOT NULL AUTO_INCREMENT,
    user_id         BIGINT NOT NULL,
    name            VARCHAR(255),
    category        VARCHAR(100),
    area            DOUBLE,
    style           VARCHAR(100),
    address         TEXT,
    description     TEXT,
    budget_min      BIGINT,
    budget_max      BIGINT,
    bid_type        ENUM('FIXED_PRICE','NEGOTIABLE'),
    status          ENUM('DRAFT','OPEN','IN_PROGRESS','CLOSED','CANCELLED') DEFAULT 'OPEN',
    approval_status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
    admin_note      TEXT,
    approved_at     DATETIME(6),
    created_at      DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_project_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 10. BIDS — Báo giá nhà thầu cho dự án
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bids (
    id             BIGINT NOT NULL AUTO_INCREMENT,
    project_id     BIGINT NOT NULL,
    contractor_id  BIGINT NOT NULL,
    total_price    BIGINT,
    estimated_days INT,
    message        TEXT,
    design_image   VARCHAR(500),
    status         ENUM('PENDING','ACCEPTED','REJECTED','CANCELLED') DEFAULT 'PENDING',
    created_at     DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_bids_project    FOREIGN KEY (project_id)    REFERENCES project(id),
    CONSTRAINT fk_bids_contractor FOREIGN KEY (contractor_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 11. BID_DETAILS — Chi tiết hạng mục trong bid dự án
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bid_details (
    id           BIGINT NOT NULL AUTO_INCREMENT,
    bid_id       BIGINT NOT NULL,
    item_name    VARCHAR(255),
    unit         VARCHAR(50),
    quantity     DOUBLE,
    unit_price   BIGINT,
    total_price  BIGINT,
    description  TEXT,
    sample_image VARCHAR(500),
    PRIMARY KEY (id),
    CONSTRAINT fk_bid_details_bid FOREIGN KEY (bid_id) REFERENCES bids(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 12. CONTRACTS — Hợp đồng điện tử
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contracts (
    id               BIGINT NOT NULL AUTO_INCREMENT,
    contract_number  VARCHAR(40) UNIQUE,
    project_id       BIGINT NOT NULL UNIQUE,
    bid_id           BIGINT NOT NULL UNIQUE,
    client_id        BIGINT NOT NULL,
    contractor_id    BIGINT NOT NULL,
    admin_id         BIGINT,
    agreed_price     BIGINT,
    estimated_days   INT,
    terms            TEXT,
    admin_note       TEXT,
    status           VARCHAR(30) DEFAULT 'PENDING_REVIEW',
    -- PENDING_REVIEW → WAITING_SIGNATURE → ACTIVE → COMPLETED | CANCELLED
    created_at       DATETIME(6),
    updated_at       DATETIME(6),
    approved_at      DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_contracts_project    FOREIGN KEY (project_id)   REFERENCES project(id),
    CONSTRAINT fk_contracts_bid        FOREIGN KEY (bid_id)        REFERENCES bids(id),
    CONSTRAINT fk_contracts_client     FOREIGN KEY (client_id)     REFERENCES users(id),
    CONSTRAINT fk_contracts_contractor FOREIGN KEY (contractor_id) REFERENCES users(id),
    CONSTRAINT fk_contracts_admin      FOREIGN KEY (admin_id)      REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 13. CONTRACT_STAGES — Lịch sử trạng thái hợp đồng
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contract_stages (
    id           BIGINT NOT NULL AUTO_INCREMENT,
    contract_id  BIGINT NOT NULL,
    stage        VARCHAR(30) NOT NULL,
    note         TEXT,
    performed_by VARCHAR(255),
    created_at   DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_contract_stages_contract FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 14. CONTRACT_JOBS — Công việc thi công (được tạo khi chọn bid)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contract_jobs (
    id            BIGINT NOT NULL AUTO_INCREMENT,
    project_id    BIGINT NOT NULL UNIQUE,
    bid_id        BIGINT NOT NULL UNIQUE,
    customer_id   BIGINT NOT NULL,
    contractor_id BIGINT NOT NULL,
    agreed_price  BIGINT,
    status        ENUM('PENDING','ACCEPTED','IN_PROGRESS','COMPLETED','CANCELLED') DEFAULT 'IN_PROGRESS',
    started_at    DATETIME(6),
    completed_at  DATETIME(6),
    created_at    DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_contract_jobs_project    FOREIGN KEY (project_id)    REFERENCES project(id),
    CONSTRAINT fk_contract_jobs_bid        FOREIGN KEY (bid_id)        REFERENCES bids(id),
    CONSTRAINT fk_contract_jobs_customer   FOREIGN KEY (customer_id)   REFERENCES users(id),
    CONSTRAINT fk_contract_jobs_contractor FOREIGN KEY (contractor_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 15. WORK_PLANS — Kế hoạch thi công
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS work_plans (
    id               BIGINT NOT NULL AUTO_INCREMENT,
    contract_job_id  BIGINT NOT NULL UNIQUE,
    note             TEXT,
    status           ENUM('PENDING_APPROVAL','APPROVED','REVISION_REQUIRED') DEFAULT 'PENDING_APPROVAL',
    created_at       DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_work_plans_job FOREIGN KEY (contract_job_id) REFERENCES contract_jobs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 16. WORK_MILESTONES — Các mốc milestone trong kế hoạch
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS work_milestones (
    id               BIGINT NOT NULL AUTO_INCREMENT,
    work_plan_id     BIGINT NOT NULL,
    title            VARCHAR(255),
    description      TEXT,
    amount           BIGINT,
    step_order       INT,
    progress_percent INT,
    deadline         DATE,
    status           ENUM('PENDING','IN_PROGRESS','WAITING_CONFIRMATION','COMPLETED','REJECTED') DEFAULT 'IN_PROGRESS',
    PRIMARY KEY (id),
    CONSTRAINT fk_work_milestones_plan FOREIGN KEY (work_plan_id) REFERENCES work_plans(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 17. MILESTONE_UPDATES — Cập nhật tiến độ thi công
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS milestone_updates (
    id           BIGINT NOT NULL AUTO_INCREMENT,
    milestone_id BIGINT NOT NULL,
    title        VARCHAR(255),
    content      TEXT,
    image_url    VARCHAR(500),
    created_at   DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_milestone_updates_milestone FOREIGN KEY (milestone_id) REFERENCES work_milestones(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 18. DISPUTES — Tranh chấp
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS disputes (
    id              BIGINT NOT NULL AUTO_INCREMENT,
    project_id      BIGINT NOT NULL,
    customer_id     BIGINT NOT NULL,
    contractor_id   BIGINT NOT NULL,
    reason          TEXT,
    amount          BIGINT,
    status          ENUM('PENDING','RESOLVED') DEFAULT 'PENDING',
    resolution      TEXT,
    resolution_type VARCHAR(50),
    refund_amount   BIGINT,
    created_at      DATETIME(6),
    updated_at      DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_disputes_project    FOREIGN KEY (project_id)    REFERENCES project(id),
    CONSTRAINT fk_disputes_customer   FOREIGN KEY (customer_id)   REFERENCES users(id),
    CONSTRAINT fk_disputes_contractor FOREIGN KEY (contractor_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 19. DISPUTE_MESSAGES — Tin nhắn tranh chấp
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dispute_messages (
    id         BIGINT NOT NULL AUTO_INCREMENT,
    dispute_id BIGINT NOT NULL,
    sender_id  BIGINT NOT NULL,
    content    TEXT,
    created_at DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_dispute_messages_dispute FOREIGN KEY (dispute_id) REFERENCES disputes(id) ON DELETE CASCADE,
    CONSTRAINT fk_dispute_messages_sender  FOREIGN KEY (sender_id)  REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 20. CHAT_ROOMS — Phòng chat
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_rooms (
    id         BIGINT NOT NULL AUTO_INCREMENT,
    name       VARCHAR(255),
    type       VARCHAR(30) DEFAULT 'DIRECT',
    created_at DATETIME(6),
    updated_at DATETIME(6),
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 21. CHAT_ROOM_MEMBERS — Thành viên phòng chat
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_room_members (
    id         BIGINT NOT NULL AUTO_INCREMENT,
    room_id    BIGINT NOT NULL,
    user_id    BIGINT NOT NULL,
    joined_at  DATETIME(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_room_user (room_id, user_id),
    CONSTRAINT fk_chat_members_room FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_chat_members_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 22. CHAT_MESSAGES — Tin nhắn chat
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
    id           BIGINT NOT NULL AUTO_INCREMENT,
    room_id      BIGINT NOT NULL,
    sender_id    BIGINT NOT NULL,
    content      TEXT,
    message_type VARCHAR(30) DEFAULT 'TEXT',
    is_read      TINYINT(1) DEFAULT 0,
    created_at   DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_chat_messages_room   FOREIGN KEY (room_id)   REFERENCES chat_rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_chat_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 23. NOTIFICATIONS — Thông báo hệ thống
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id         BIGINT NOT NULL AUTO_INCREMENT,
    user_id    BIGINT NOT NULL,
    type       VARCHAR(50),
    content    VARCHAR(500) NOT NULL,
    is_read    TINYINT(1) DEFAULT 0,
    created_at DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 24. MATERIAL_CATEGORIES — Danh mục vật liệu (admin quản lý)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS material_categories (
    id         BIGINT NOT NULL AUTO_INCREMENT,
    name       VARCHAR(120) NOT NULL UNIQUE,
    active     TINYINT(1) DEFAULT 1,
    created_at DATETIME(6),
    updated_at DATETIME(6),
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 25. SYSTEM_SETTINGS — Cấu hình hệ thống
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS system_settings (
    id    BIGINT NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(100) NOT NULL UNIQUE,
    value VARCHAR(255),
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ────────────────────────────────────────────────────────────
-- 26. USER_TOKENS — Token ví (VNPay)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_tokens (
    id          BIGINT NOT NULL AUTO_INCREMENT,
    user_id     BIGINT NOT NULL,
    token_value VARCHAR(255),
    status      VARCHAR(30),
    amount      BIGINT,
    created_at  DATETIME(6),
    expired_at  DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_user_tokens_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- ────────────────────────────────────────────────────────────
-- Verify: Kiểm tra tất cả bảng đã tạo
-- ────────────────────────────────────────────────────────────
SELECT TABLE_NAME, TABLE_ROWS
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'constructx_db'
ORDER BY TABLE_NAME;
