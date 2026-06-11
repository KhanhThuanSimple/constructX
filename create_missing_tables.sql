-- ============================================================
-- Script tạo các bảng còn thiếu trong constructx_db
-- Chạy: mysql -u root constructx_db < create_missing_tables.sql
-- Hoặc dán vào MySQL Workbench / DBeaver / HeidiSQL
-- ============================================================

USE constructx_db;

-- ── Bảng orders ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id             BIGINT NOT NULL AUTO_INCREMENT,
    order_code     VARCHAR(30) UNIQUE,
    customer_id    BIGINT NOT NULL,
    type           ENUM('CATALOG','CUSTOM') DEFAULT 'CATALOG',
    status         ENUM('PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED') DEFAULT 'PENDING',
    total_amount   DECIMAL(15,0),
    delivery_address TEXT,
    contact_phone  VARCHAR(255),
    customer_note  TEXT,
    custom_requirements TEXT,
    reference_image_url VARCHAR(500),
    processing_note TEXT,
    created_at     DATETIME(6),
    updated_at     DATETIME(6),
    confirmed_at   DATETIME(6),
    delivered_at   DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_order_customer FOREIGN KEY (customer_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Bảng order_items ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
    id          BIGINT NOT NULL AUTO_INCREMENT,
    order_id    BIGINT NOT NULL,
    product_id  BIGINT,
    item_name   VARCHAR(255) NOT NULL,
    image_url   VARCHAR(500),
    quantity    INT NOT NULL DEFAULT 1,
    unit_price  DECIMAL(15,0) NOT NULL DEFAULT 0,
    subtotal    DECIMAL(15,0) NOT NULL DEFAULT 0,
    custom_note TEXT,
    PRIMARY KEY (id),
    CONSTRAINT fk_item_order   FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
    CONSTRAINT fk_item_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Bảng contracts (nếu chưa có) ────────────────────────────
CREATE TABLE IF NOT EXISTS contracts (
    id              BIGINT NOT NULL AUTO_INCREMENT,
    contract_number VARCHAR(40) UNIQUE,
    project_id      BIGINT NOT NULL UNIQUE,
    bid_id          BIGINT NOT NULL UNIQUE,
    client_id       BIGINT NOT NULL,
    contractor_id   BIGINT NOT NULL,
    admin_id        BIGINT,
    agreed_price    BIGINT,
    estimated_days  INT,
    terms           TEXT,
    admin_note      TEXT,
    status          ENUM('PENDING_REVIEW','WAITING_SIGNATURE','ACTIVE','COMPLETED','CANCELLED') DEFAULT 'PENDING_REVIEW',
    created_at      DATETIME(6),
    updated_at      DATETIME(6),
    approved_at     DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_contract_project    FOREIGN KEY (project_id)   REFERENCES project(id),
    CONSTRAINT fk_contract_bid        FOREIGN KEY (bid_id)        REFERENCES bids(id),
    CONSTRAINT fk_contract_client     FOREIGN KEY (client_id)     REFERENCES users(id),
    CONSTRAINT fk_contract_contractor FOREIGN KEY (contractor_id) REFERENCES users(id),
    CONSTRAINT fk_contract_admin      FOREIGN KEY (admin_id)      REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Bảng contract_stages (nếu chưa có) ──────────────────────
CREATE TABLE IF NOT EXISTS contract_stages (
    id          BIGINT NOT NULL AUTO_INCREMENT,
    contract_id BIGINT NOT NULL,
    stage       ENUM('PENDING_REVIEW','WAITING_SIGNATURE','ACTIVE','COMPLETED','CANCELLED') NOT NULL,
    note        TEXT,
    performed_by VARCHAR(255),
    created_at  DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_stage_contract FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Bảng products (nếu chưa có) ─────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id              BIGINT NOT NULL AUTO_INCREMENT,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    price           DECIMAL(15,0) NOT NULL,
    original_price  DECIMAL(15,0),
    image_url       VARCHAR(500),
    category        VARCHAR(100),
    brand           VARCHAR(100),
    material        VARCHAR(200),
    dimensions      VARCHAR(100),
    color           VARCHAR(100),
    stock           INT DEFAULT 0,
    rating          DOUBLE DEFAULT 0.0,
    review_count    INT DEFAULT 0,
    featured        BOOLEAN DEFAULT FALSE,
    active          BOOLEAN DEFAULT TRUE,
    created_at      DATETIME(6),
    updated_at      DATETIME(6),
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Kiểm tra kết quả
SELECT
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'constructx_db'
  AND TABLE_NAME IN ('orders','order_items','contracts','contract_stages','products')
ORDER BY TABLE_NAME;

SELECT 'Done! Tất cả bảng đã sẵn sàng.' AS result;

-- ── Bảng portfolio_items ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio_items (
    id               BIGINT NOT NULL AUTO_INCREMENT,
    contractor_id    BIGINT NOT NULL,
    title            VARCHAR(200) NOT NULL,
    description      TEXT,
    category         VARCHAR(100),
    image_url        VARCHAR(500),
    project_value    BIGINT,
    completion_year  VARCHAR(10),
    client_name      VARCHAR(200),
    location         VARCHAR(200),
    created_at       DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    updated_at       DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_portfolio_contractor FOREIGN KEY (contractor_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Bảng reviews ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
    id             BIGINT NOT NULL AUTO_INCREMENT,
    reviewer_id    BIGINT NOT NULL,
    reviewee_id    BIGINT NOT NULL,
    reference_type VARCHAR(20) NOT NULL,
    reference_id   BIGINT NOT NULL,
    rating         INT NOT NULL,
    comment        VARCHAR(1000),
    created_at     DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_reviewer_ref (reviewer_id, reference_type, reference_id),
    CONSTRAINT fk_review_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_reviewee FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Cập nhật bảng orders: thêm columns mới ───────────────────
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS assigned_contractor_id BIGINT NULL,
    ADD COLUMN IF NOT EXISTS selected_bid_id BIGINT NULL,
    ADD COLUMN IF NOT EXISTS deposit_percent DECIMAL(5,2) NOT NULL DEFAULT 60.00,
    ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(15,0) NULL,
    ADD COLUMN IF NOT EXISTS deposit_locked BIT(1) NOT NULL DEFAULT b'0',
    ADD COLUMN IF NOT EXISTS deposit_paid_at DATETIME(6) NULL,
    ADD COLUMN IF NOT EXISTS completion_image_url VARCHAR(500) NULL,
    ADD COLUMN IF NOT EXISTS contractor_marked_done BIT(1) NOT NULL DEFAULT b'0',
    ADD COLUMN IF NOT EXISTS contractor_done_at DATETIME(6) NULL,
    ADD COLUMN IF NOT EXISTS terms_accepted BIT(1) NOT NULL DEFAULT b'0',
    ADD COLUMN IF NOT EXISTS fully_paid BIT(1) NOT NULL DEFAULT b'0';

-- Cập nhật status ENUM của orders
ALTER TABLE orders
    MODIFY COLUMN status ENUM(
        'PENDING','CONFIRMED','OPEN_BIDDING','BIDDING_CLOSED',
        'PROCESSING','SHIPPED','DELIVERED','CANCELLED'
    ) DEFAULT 'PENDING';

-- ── Cập nhật bảng bids: thêm columns mới ─────────────────────
ALTER TABLE bids
    ADD COLUMN IF NOT EXISTS warranty_months INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS payment_terms TEXT,
    ADD COLUMN IF NOT EXISTS submitted_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
    ADD COLUMN IF NOT EXISTS reviewed_at DATETIME(6) NULL;

ALTER TABLE bids
    MODIFY COLUMN status ENUM('PENDING','ACCEPTED','REJECTED','CANCELLED','WITHDRAWN') DEFAULT 'PENDING';

SELECT 'Schema update hoàn tất!' AS result;
