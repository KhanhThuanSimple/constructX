-- Tạo bảng orders nếu chưa có
CREATE TABLE IF NOT EXISTS orders (
    id              BIGINT NOT NULL AUTO_INCREMENT,
    order_code      VARCHAR(30) UNIQUE,
    customer_id     BIGINT NOT NULL,
    type            VARCHAR(20) DEFAULT 'CATALOG',
    status          VARCHAR(30) DEFAULT 'PENDING',
    total_amount    DECIMAL(15,0),
    delivery_address TEXT,
    contact_phone   VARCHAR(255),
    customer_note   TEXT,
    custom_requirements TEXT,
    reference_image_url VARCHAR(500),
    processing_note TEXT,
    created_at      DATETIME(6),
    updated_at      DATETIME(6),
    confirmed_at    DATETIME(6),
    delivered_at    DATETIME(6),
    PRIMARY KEY (id),
    CONSTRAINT fk_order_customer FOREIGN KEY (customer_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tạo bảng order_items nếu chưa có
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
