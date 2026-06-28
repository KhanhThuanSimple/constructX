package com.constructx.backend.config;

import com.constructx.backend.admin.entity.Dispute;
import com.constructx.backend.admin.entity.DisputeMessage;
import com.constructx.backend.admin.entity.MaterialCategory;
import com.constructx.backend.admin.repository.DisputeRepository;
import com.constructx.backend.admin.repository.MaterialCategoryRepository;
import com.constructx.backend.features.constructor.entity.Bid;
import com.constructx.backend.features.constructor.entity.Contract;
import com.constructx.backend.features.constructor.entity.ContractStage;
import com.constructx.backend.features.constructor.repository.BidRepository;
import com.constructx.backend.features.constructor.repository.ContractRepository;
import com.constructx.backend.features.notification.entity.Notification;
import com.constructx.backend.features.notification.repository.NotificationRepository;
import com.constructx.backend.features.order.entity.Order;
import com.constructx.backend.features.order.entity.OrderItem;
import com.constructx.backend.features.order.repository.OrderRepository;
import com.constructx.backend.features.product.entity.Product;
import com.constructx.backend.features.product.repository.ProductRepository;
import com.constructx.backend.features.project.entity.Project;
import com.constructx.backend.features.project.repository.ProjectRepository;
import com.constructx.backend.features.user.entity.User;
import com.constructx.backend.features.user.repository.UserRepository;
import com.constructx.backend.features.wallet.entity.Wallet;
import com.constructx.backend.features.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * DataSeeder — chạy sau ApplicationReady (sau khi Hibernate tạo schema xong).
 * Idempotent: kiểm tra trước khi insert.
 *
 * Test accounts (password: test123):
 *   ADMIN:      admin@constructx.com / admin123
 *   CUSTOMER:   khachhang1@test.com  / test123
 *   CUSTOMER:   khachhang2@test.com  / test123
 *   CUSTOMER:   khachhang3@test.com  / test123
 *   CONTRACTOR: nhathauchuyennghiep@test.com / test123
 *   CONTRACTOR: nhaxuong_abc@test.com        / test123
 *   CONTRACTOR: noithat_vietlong@test.com    / test123
 *   CONTRACTOR: contractor_pending@test.com  / test123 (chưa duyệt)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProjectRepository projectRepository;
    private final OrderRepository orderRepository;
    private final BidRepository bidRepository;
    private final ContractRepository contractRepository;
    private final WalletRepository walletRepository;
    private final MaterialCategoryRepository materialCategoryRepository;
    private final DisputeRepository disputeRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final DataSource dataSource;

    @EventListener(ApplicationReadyEvent.class)
    public void seed() {
        log.info(">>> [DataSeeder] Starting seed...");
        try {
            ensureTablesExist();   // Bước 1: Tạo bảng raw JDBC (không cần JPA)
            doSeed();              // Bước 2: Seed data trong transaction
            log.info(">>> [DataSeeder] All seed completed successfully ✓");
        } catch (Exception e) {
            log.error(">>> [DataSeeder] Seed failed: {}", e.getMessage(), e);
        }
    }

    @Transactional
    public void doSeed() {
        seedUsers();
        seedWallets();
        seedMaterials();
        seedProducts();
        seedProjects();
        seedOrders();
        seedNotifications();
    }

    /**
     * Tạo các bảng còn thiếu bằng JDBC thuần — chạy trước mọi repository call.
     * Dùng IF NOT EXISTS nên idempotent.
     */
    private void ensureTablesExist() {
        List<String> ddls = List.of(
            """
            CREATE TABLE IF NOT EXISTS products (
                id BIGINT NOT NULL AUTO_INCREMENT,
                name VARCHAR(200) NOT NULL,
                description TEXT,
                price DECIMAL(15,0) NOT NULL DEFAULT 0,
                original_price DECIMAL(15,0),
                image_url VARCHAR(500),
                category VARCHAR(100),
                brand VARCHAR(100),
                material VARCHAR(200),
                dimensions VARCHAR(100),
                color VARCHAR(100),
                stock INT DEFAULT 0,
                rating DOUBLE DEFAULT 0.0,
                review_count INT DEFAULT 0,
                featured TINYINT(1) DEFAULT 0,
                active TINYINT(1) DEFAULT 1,
                created_at DATETIME(6),
                updated_at DATETIME(6),
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """,
            """
            CREATE TABLE IF NOT EXISTS orders (
                id BIGINT NOT NULL AUTO_INCREMENT,
                order_code VARCHAR(30),
                customer_id BIGINT NOT NULL,
                type VARCHAR(20) DEFAULT 'CATALOG',
                status VARCHAR(30) DEFAULT 'PENDING',
                total_amount DECIMAL(15,0) DEFAULT 0,
                delivery_address TEXT,
                contact_phone VARCHAR(255),
                customer_note TEXT,
                custom_requirements TEXT,
                reference_image_url VARCHAR(500),
                processing_note TEXT,
                created_at DATETIME(6),
                updated_at DATETIME(6),
                confirmed_at DATETIME(6),
                delivered_at DATETIME(6),
                PRIMARY KEY (id),
                UNIQUE KEY uk_order_code (order_code),
                CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES users(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """,
            """
            CREATE TABLE IF NOT EXISTS order_items (
                id BIGINT NOT NULL AUTO_INCREMENT,
                order_id BIGINT NOT NULL,
                product_id BIGINT,
                item_name VARCHAR(255) NOT NULL,
                image_url VARCHAR(500),
                quantity INT NOT NULL DEFAULT 1,
                unit_price DECIMAL(15,0) NOT NULL DEFAULT 0,
                subtotal DECIMAL(15,0) NOT NULL DEFAULT 0,
                custom_note TEXT,
                PRIMARY KEY (id),
                CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """,
            """
            CREATE TABLE IF NOT EXISTS contracts (
                id BIGINT NOT NULL AUTO_INCREMENT,
                contract_number VARCHAR(40),
                project_id BIGINT NOT NULL,
                bid_id BIGINT NOT NULL,
                client_id BIGINT NOT NULL,
                contractor_id BIGINT NOT NULL,
                admin_id BIGINT,
                agreed_price BIGINT,
                estimated_days INT,
                terms TEXT,
                admin_note TEXT,
                status VARCHAR(30) DEFAULT 'PENDING_REVIEW',
                created_at DATETIME(6),
                updated_at DATETIME(6),
                approved_at DATETIME(6),
                PRIMARY KEY (id),
                UNIQUE KEY uk_contracts_number (contract_number),
                UNIQUE KEY uk_contracts_project (project_id),
                UNIQUE KEY uk_contracts_bid (bid_id),
                CONSTRAINT fk_contracts_project FOREIGN KEY (project_id) REFERENCES project(id),
                CONSTRAINT fk_contracts_bid FOREIGN KEY (bid_id) REFERENCES bids(id),
                CONSTRAINT fk_contracts_client FOREIGN KEY (client_id) REFERENCES users(id),
                CONSTRAINT fk_contracts_contractor FOREIGN KEY (contractor_id) REFERENCES users(id),
                CONSTRAINT fk_contracts_admin FOREIGN KEY (admin_id) REFERENCES users(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """,
            """
            CREATE TABLE IF NOT EXISTS contract_stages (
                id BIGINT NOT NULL AUTO_INCREMENT,
                contract_id BIGINT NOT NULL,
                stage VARCHAR(30) NOT NULL,
                note TEXT,
                performed_by VARCHAR(255),
                created_at DATETIME(6),
                PRIMARY KEY (id),
                CONSTRAINT fk_contract_stages_contract FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """,
            // Bảng order_bids — nhà thầu báo giá cho đơn CUSTOM
            """
            CREATE TABLE IF NOT EXISTS order_bids (
                id BIGINT NOT NULL AUTO_INCREMENT,
                order_id BIGINT NOT NULL,
                contractor_id BIGINT NOT NULL,
                quoted_price DECIMAL(15,0),
                estimated_days INT,
                proposal TEXT,
                portfolio_image_url VARCHAR(500),
                status VARCHAR(20) DEFAULT 'PENDING',
                created_at DATETIME(6),
                PRIMARY KEY (id),
                CONSTRAINT fk_order_bids_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                CONSTRAINT fk_order_bids_contractor FOREIGN KEY (contractor_id) REFERENCES users(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """,
            // Bảng order_bid_items — chi tiết từng hạng mục trong bid
            """
            CREATE TABLE IF NOT EXISTS order_bid_items (
                id BIGINT NOT NULL AUTO_INCREMENT,
                order_bid_id BIGINT NOT NULL,
                item_name VARCHAR(255) NOT NULL,
                unit VARCHAR(50),
                quantity DOUBLE,
                unit_price DECIMAL(15,0),
                total_price DECIMAL(15,0),
                description TEXT,
                sample_image_url VARCHAR(500),
                PRIMARY KEY (id),
                CONSTRAINT fk_order_bid_items_bid FOREIGN KEY (order_bid_id) REFERENCES order_bids(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """,
            // Bảng contractor_profiles — hồ sơ năng lực nhà thầu
            """
            CREATE TABLE IF NOT EXISTS contractor_profiles (
                id BIGINT NOT NULL,
                company_name VARCHAR(255),
                logo_url VARCHAR(500),
                avatar_url VARCHAR(500),
                year_established INT,
                address VARCHAR(255),
                phone_number VARCHAR(50),
                email VARCHAR(100),
                short_intro VARCHAR(1000),
                design_interior BOOLEAN DEFAULT FALSE,
                construct_interior BOOLEAN DEFAULT FALSE,
                produce_wood BOOLEAN DEFAULT FALSE,
                renovate_house BOOLEAN DEFAULT FALSE,
                experience_years INT DEFAULT 0,
                completed_projects_count INT DEFAULT 0,
                rating DOUBLE DEFAULT 5.0,
                customer_count VARCHAR(50) DEFAULT '0+',
                warranty_24_months BOOLEAN DEFAULT FALSE,
                free_quote BOOLEAN DEFAULT FALSE,
                on_time_progress BOOLEAN DEFAULT FALSE,
                PRIMARY KEY (id),
                CONSTRAINT fk_contractor_profiles_user FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """
        );

        try (Connection conn = dataSource.getConnection()) {
            // Check if table contractor_profiles has obsolete user_id column
            boolean hasObsoleteColumn = false;
            try (Statement checkStmt = conn.createStatement();
                 java.sql.ResultSet rs = checkStmt.executeQuery("SELECT * FROM contractor_profiles LIMIT 1")) {
                java.sql.ResultSetMetaData metaData = rs.getMetaData();
                int colCount = metaData.getColumnCount();
                for (int i = 1; i <= colCount; i++) {
                    if ("user_id".equalsIgnoreCase(metaData.getColumnName(i))) {
                        hasObsoleteColumn = true;
                        break;
                    }
                }
            } catch (Exception e) {
                // Table might not exist yet, which is fine
            }

            if (hasObsoleteColumn) {
                log.info(">>> [DataSeeder] Obsolete column 'user_id' detected in 'contractor_profiles'. Dropping table for clean recreation...");
                try (Statement dropStmt = conn.createStatement()) {
                    dropStmt.execute("DROP TABLE IF EXISTS contractor_profiles");
                } catch (Exception e) {
                    log.error("Failed to drop obsolete table: {}", e.getMessage());
                }
            }

            try (Statement stmt = conn.createStatement()) {
                for (String ddl : ddls) {
                    try {
                        stmt.execute(ddl.strip());
                    } catch (Exception ex) {
                        // Ignore "already exists" or FK already registered errors
                        if (!ex.getMessage().contains("already exists") &&
                            !ex.getMessage().contains("Duplicate key")) {
                            log.warn("DDL warning (ignored): {}", ex.getMessage());
                        }
                    }
                }
            }
            log.info(">>> [DataSeeder] Tables ensured ✓");
        } catch (Exception e) {
            log.error(">>> [DataSeeder] ensureTablesExist failed: {}", e.getMessage());
        }
    }

    // ════════════════════════════════════════════════════════════
    // 1. USERS
    // ════════════════════════════════════════════════════════════

    private void seedUsers() {
        // ADMIN
        upsertUser("admin@constructx.com", "Admin Hệ Thống",   "admin123",   "0900000001",
                "ConstructX HQ, TP.HCM", User.Role.ADMIN, User.ApprovalStatus.APPROVED);

        // CUSTOMERS
        upsertUser("khachhang1@test.com", "Nguyễn Thị Lan",    "test123", "0901234561",
                "123 Lê Lợi, Q.1, TP.HCM", User.Role.CUSTOMER, User.ApprovalStatus.APPROVED);
        upsertUser("khachhang2@test.com", "Trần Văn Minh",     "test123", "0901234562",
                "45 Nguyễn Huệ, Q.1, TP.HCM", User.Role.CUSTOMER, User.ApprovalStatus.APPROVED);
        upsertUser("khachhang3@test.com", "Phạm Thị Hoa",      "test123", "0901234563",
                "88 Đinh Tiên Hoàng, Hà Nội", User.Role.CUSTOMER, User.ApprovalStatus.APPROVED);

        // CONTRACTORS (approved)
        upsertUser("nhathauchuyennghiep@test.com", "Công ty Nội thất Minh Phú", "test123", "0912345671",
                "56 Hai Bà Trưng, TP.HCM", User.Role.CONTRACTOR, User.ApprovalStatus.APPROVED);
        upsertUser("nhaxuong_abc@test.com",        "Xưởng Mộc ABC",             "test123", "0912345672",
                "78 Trường Chinh, Hà Nội", User.Role.CONTRACTOR, User.ApprovalStatus.APPROVED);
        upsertUser("noithat_vietlong@test.com",    "Nội thất Việt Long",         "test123", "0912345673",
                "12 Cộng Hòa, Tân Bình, TP.HCM", User.Role.CONTRACTOR, User.ApprovalStatus.APPROVED);

        // CONTRACTOR (pending — test flow duyệt đối tác)
        upsertUser("contractor_pending@test.com",  "Nhà thầu Đăng Ký Mới",      "test123", "0912345674",
                "99 Lý Thường Kiệt, TP.HCM", User.Role.CONTRACTOR, User.ApprovalStatus.PENDING);

        log.info(">>> Users seeded ✓");
    }

    private void upsertUser(String email, String fullName, String pass, String phone,
                             String address, User.Role role, User.ApprovalStatus status) {
        userRepository.findByEmail(email).ifPresentOrElse(
            u -> {
                u.setPassword(passwordEncoder.encode(pass));
                userRepository.save(u);
            },
            () -> userRepository.save(User.builder()
                    .email(email).fullName(fullName)
                    .password(passwordEncoder.encode(pass))
                    .phoneNumber(phone).address(address)
                    .role(role).approvalStatus(status).active(true)
                    .build())
        );
    }

    // ════════════════════════════════════════════════════════════
    // 2. WALLETS — mỗi user có 1 ví
    // ════════════════════════════════════════════════════════════

    private void seedWallets() {
        List<String> emails = List.of(
            "khachhang1@test.com","khachhang2@test.com","khachhang3@test.com",
            "nhathauchuyennghiep@test.com","nhaxuong_abc@test.com","noithat_vietlong@test.com",
            "admin@constructx.com"
        );
        long[] balances = {50_000_000L, 30_000_000L, 20_000_000L,
                           150_000_000L, 80_000_000L, 120_000_000L, 500_000_000L};

        for (int i = 0; i < emails.size(); i++) {
            final long bal = balances[i];
            userRepository.findByEmail(emails.get(i)).ifPresent(u -> {
                if (walletRepository.findByUserId(u.getId()).isEmpty()) {
                    walletRepository.save(Wallet.builder()
                            .user(u).balance(bal).lockedAmount(0L).build());
                }
            });
        }
        log.info(">>> Wallets seeded ✓");
    }

    // ════════════════════════════════════════════════════════════
    // 3. MATERIAL CATEGORIES
    // ════════════════════════════════════════════════════════════

    private void seedMaterials() {
        if (materialCategoryRepository.count() > 0) return;
        List<String> mats = List.of(
            "Gỗ tự nhiên","Gỗ công nghiệp MDF","Gỗ công nghiệp HDF",
            "Kính cường lực","Inox 304","Đá nhân tạo","Đá marble",
            "Vải nhung Velvet","Da PU","Da thật nhập khẩu",
            "Nhôm định hình","Thép không gỉ","Sơn PU","Sơn acrylic"
        );
        mats.forEach(name -> materialCategoryRepository.save(
            MaterialCategory.builder().name(name).active(true).build()));
        log.info(">>> Materials seeded ✓");
    }

    // ════════════════════════════════════════════════════════════
    // 4. PRODUCTS (17 sản phẩm nội thất)
    // ════════════════════════════════════════════════════════════

    private void seedProducts() {
        if (productRepository.count() > 0) {
            log.info(">>> Products already seeded, skipping.");
            return;
        }
        List<Product> products = List.of(
            // SOFA
            p("Sofa góc L hiện đại 4 chỗ Premium","Sofa góc L thiết kế tối giản, chân gỗ sồi tự nhiên, phù hợp không gian phòng khách hiện đại từ 25m².",
              18_500_000,22_000_000,"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600","SOFA","HomeDecor VN","Khung gỗ sồi + Đệm mút D40 + Vỏ nỉ Hàn Quốc","280×180×85cm","Xám tro",12,4.8,124,true),
            p("Sofa văng 3 chỗ Scandinavian","Phong cách Bắc Âu tối giản, chân gỗ sồi vàng, mút xốp cao cấp.",
              9_800_000,12_000_000,"https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600","SOFA","Nordic Living","Gỗ sồi + Mút xốp + Vải linen","210×85×80cm","Kem trắng",8,4.6,87,true),
            p("Sofa da thật nhập khẩu Ý 2 chỗ","Da bò thật nhập khẩu từ Ý, khung thép không gỉ, bảo hành 3 năm.",
              35_000_000,0,"https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600","SOFA","Luxury Italia","Da bò thật + Khung thép + Đệm lò xo túi","175×90×82cm","Nâu caramel",3,4.9,45,true),
            // TABLE
            p("Bàn ăn gỗ óc chó 6 ghế cao cấp","Mặt bàn gỗ óc chó nguyên tấm dày 4cm, chân bàn thép sơn đen.",
              15_600_000,18_000_000,"https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=600","TABLE","WoodCraft VN","Gỗ óc chó nguyên tấm + Chân thép sơn tĩnh điện","180×90×76cm","Nâu gỗ tự nhiên",6,4.7,63,true),
            p("Bàn làm việc tối giản 120cm kèm ngăn kéo","Bàn làm việc home office, 2 ngăn kéo khóa, mặt bàn chống xước.",
              3_200_000,4_000_000,"https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600","TABLE","OfficeStyle","Gỗ MDF phủ melamine chống xước","120×60×75cm","Trắng",25,4.4,198,false),
            p("Bàn cà phê tròn mặt đá cẩm thạch","Bàn trà phong cách Á Đông hiện đại, mặt đá marble nhân tạo, chân inox vàng.",
              4_800_000,6_200_000,"https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600","TABLE","Luxe Stone","Đá cẩm thạch nhân tạo + Chân inox vàng 304","Ø80×45cm","Trắng vân xám",14,4.5,72,false),
            // CHAIR
            p("Ghế ăn bọc nhung Velvet cao cấp (bộ 4)","Ghế ăn bọc nhung Velvet nhập khẩu, chân gỗ sồi sơn vàng đồng.",
              5_600_000,7_200_000,"https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600","CHAIR","VelvetHome","Vải nhung Velvet + Chân gỗ sồi sơn đồng","46×52×88cm","Xanh navy",20,4.6,156,false),
            p("Ghế văn phòng ergonomic lưới thoáng khí","Ghế công thái học, lưng lưới, tựa đầu điều chỉnh, tay vịn 4D.",
              6_800_000,8_500_000,"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600","CHAIR","ErgoMax","Lưới polyester + Khung nhựa ABS cao cấp","65×65×110-125cm","Đen",30,4.7,312,true),
            p("Ghế thư giãn Accent Chair Nordic","Ghế accent phong cách Nordic, bọc vải chenille mềm mịn.",
              4_200_000,0,"https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600","CHAIR","Nordic Living","Vải chenille + Chân gỗ óc chó","75×80×95cm","Vàng mù tạt",9,4.8,54,false),
            // BED
            p("Giường ngủ King Size 1m8 khung gỗ sồi","Giường đôi King Size đầu giường bọc da PU, khung gỗ sồi Mỹ, bảo hành 5 năm.",
              22_000_000,26_000_000,"https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600","BED","SleepPro","Gỗ sồi Mỹ + Đầu giường bọc da PU","200×180×120cm","Nâu trầm",5,4.8,89,true),
            p("Giường hộp chứa đồ đa năng 1m6","Giường có ngăn chứa đồ bên dưới, mặt nệm nâng lên bằng gas.",
              12_500_000,15_000_000,"https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600","BED","SmartHome VN","Gỗ công nghiệp MDF + Chân thép","200×160×40cm","Trắng",10,4.5,143,false),
            // CABINET
            p("Tủ quần áo 4 cánh gương toàn thân","Tủ 4 cánh, 2 cánh gương toàn thân, thanh treo, ngăn kéo và kệ.",
              8_900_000,11_000_000,"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600","CABINET","ClosetPro","Gỗ MDF + Gương cường lực + Khung nhôm","200×60×220cm","Trắng sữa",7,4.4,201,false),
            p("Kệ sách gỗ thông 6 tầng Vintage","Kệ sách gỗ thông tự nhiên phong cách vintage, 6 tầng điều chỉnh.",
              2_800_000,3_500_000,"https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600","CABINET","WoodCraft VN","Gỗ thông tự nhiên sơn PU","80×30×180cm","Nâu gỗ vintage",18,4.6,167,false),
            p("Tủ bếp trên dưới MDF chống ẩm 3m","Bộ tủ bếp hoàn chỉnh 3m, cánh acrylic bóng gương, ray giảm chấn.",
              28_000_000,33_000_000,"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600","CABINET","HomeDecor VN","MDF chống ẩm + Cánh acrylic bóng gương","300×60×220cm","Trắng bóng",4,4.7,58,true),
            // DECOR
            p("Đèn thả trần sợi mây đan thủ công","Đèn thả trần làm từ sợi mây đan tay, đế đồng, ánh sáng ấm áp.",
              1_200_000,1_600_000,"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600","DECOR","ArtLight VN","Mây đan tay + Đế đồng + Bóng LED E27","Ø45×cao35cm","Nâu mây tự nhiên",35,4.8,289,false),
            p("Thảm phòng khách lông xù Bắc Âu 160×230cm","Thảm lông xù dày 3cm, sợi polyester cao cấp, không gây dị ứng.",
              2_400_000,3_200_000,"https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600","DECOR","SoftHome","Sợi polyester cao cấp 3D","160×230cm, dày 3cm","Xám nhạt",22,4.5,175,false),
            p("Tranh canvas treo tường Abstract 3 tấm","Bộ 3 tranh canvas in kỹ thuật số, viền gỗ thông.",
              680_000,900_000,"https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=600","DECOR","ArtPrint VN","Canvas polyester + Khung gỗ thông","30×40cm × 3 tấm","Đa sắc",50,4.3,412,false)
        );
        productRepository.saveAll(products);
        log.info(">>> {} products seeded ✓", products.size());
    }

    private Product p(String name, String desc, long price, long origPrice,
                      String img, String cat, String brand, String mat,
                      String dim, String color, int stock,
                      double rating, int reviewCount, boolean featured) {
        return Product.builder()
            .name(name).description(desc)
            .price(new BigDecimal(price))
            .originalPrice(origPrice > 0 ? new BigDecimal(origPrice) : null)
            .imageUrl(img).category(cat).brand(brand).material(mat)
            .dimensions(dim).color(color).stock(stock)
            .rating(rating).reviewCount(reviewCount)
            .featured(featured).active(true).build();
    }

    // ════════════════════════════════════════════════════════════
    // 5. PROJECTS (6 dự án mở + 1 đang thi công + 1 chờ duyệt)
    // ════════════════════════════════════════════════════════════

    private void seedProjects() {
        if (projectRepository.count() > 0) {
            log.info(">>> Projects already seeded, skipping.");
            return;
        }
        User c1 = user("khachhang1@test.com");
        User c2 = user("khachhang2@test.com");
        User c3 = user("khachhang3@test.com");

        List<Project> projects = new ArrayList<>();
        // Dự án OPEN (approved)
        projects.add(proj(c1,"Thiết kế & thi công nội thất căn hộ 2PN Vinhomes",
            "Nội thất toàn bộ",75.0,"Hiện đại – Bắc Âu",
            "Vinhomes Central Park, Q.Bình Thạnh, TP.HCM",
            "Căn hộ 2 phòng ngủ 75m², phong cách Scandinavian hiện đại. Yêu cầu gỗ tự nhiên, tone màu trung tính. Thời gian: 45 ngày.",
            180_000_000L,250_000_000L,Project.Status.OPEN,Project.ApprovalStatus.APPROVED,
            LocalDateTime.now().minusDays(5)));

        projects.add(proj(c1,"Nội thất phòng ngủ master bedroom sang trọng",
            "Phòng ngủ",25.0,"Luxury – Tân Cổ Điển",
            "The Manor, Q.Bình Thạnh, TP.HCM",
            "Phòng ngủ master 25m², giường King Size, tủ âm tường, bàn trang điểm, đèn thả. Vật liệu đá marble và vải lụa.",
            80_000_000L,120_000_000L,Project.Status.OPEN,Project.ApprovalStatus.APPROVED,
            LocalDateTime.now().minusDays(3)));

        projects.add(proj(c2,"Cải tạo phòng bếp + phòng ăn chung cư Hà Nội",
            "Phòng bếp & ăn",20.0,"Hiện đại tối giản",
            "Times City, Hai Bà Trưng, Hà Nội",
            "Phòng bếp kết hợp 20m², tủ bếp trên + dưới, đảo bếp, bàn ăn 6 người. Tone trắng + gỗ sáng.",
            60_000_000L,90_000_000L,Project.Status.OPEN,Project.ApprovalStatus.APPROVED,
            LocalDateTime.now().minusDays(7)));

        projects.add(proj(c2,"Văn phòng làm việc tại nhà 15m²",
            "Phòng làm việc",15.0,"Industrial – Minimalist",
            "Masteri Thảo Điền, Q.2, TP.HCM",
            "Phòng làm việc 15m², bàn lớn, kệ sách tường, ghế ergonomic. Ưu tiên gỗ thô và sắt.",
            30_000_000L,55_000_000L,Project.Status.OPEN,Project.ApprovalStatus.APPROVED,
            LocalDateTime.now().minusDays(2)));

        projects.add(proj(c3,"Thiết kế phòng khách biệt thự 50m²",
            "Phòng khách",50.0,"Cổ điển châu Âu",
            "Vinhomes Riverside, Long Biên, Hà Nội",
            "Phòng khách 50m², sofa góc lớn, bàn trà đá cẩm thạch, tranh tường, đèn chùm. Sang trọng, ấm áp.",
            200_000_000L,350_000_000L,Project.Status.OPEN,Project.ApprovalStatus.APPROVED,
            LocalDateTime.now().minusDays(1)));

        projects.add(proj(c1,"Nội thất phòng trẻ em 12m² sáng tạo",
            "Phòng trẻ em",12.0,"Vui nhộn – Sáng tạo",
            "Eco Green Saigon, Q.7, TP.HCM",
            "Phòng bé 5 tuổi, giường tầng an toàn, bàn học, tủ đồ chơi. Màu tươi sáng, vật liệu an toàn.",
            25_000_000L,40_000_000L,Project.Status.OPEN,Project.ApprovalStatus.APPROVED,
            LocalDateTime.now().minusHours(6)));

        // Dự án PENDING approval — test admin duyệt
        projects.add(proj(c3,"Thi công tủ bếp inox nhà hàng",
            "Thương mại",80.0,"Industrial",
            "156 Lý Tự Trọng, Q.1, TP.HCM",
            "Nhà hàng cần thi công hệ thống tủ bếp inox 304, bàn prep, hệ thống chiếu sáng và thông gió.",
            500_000_000L,800_000_000L,Project.Status.OPEN,Project.ApprovalStatus.PENDING,
            LocalDateTime.now().minusHours(2)));

        projectRepository.saveAll(projects);
        log.info(">>> {} projects seeded ✓", projects.size());
    }

    private Project proj(User user, String name, String cat, Double area, String style,
                          String addr, String desc, Long bMin, Long bMax,
                          Project.Status status, Project.ApprovalStatus approval, LocalDateTime created) {
        return Project.builder()
            .user(user).name(name).category(cat).area(area).style(style)
            .address(addr).description(desc).budgetMin(bMin).budgetMax(bMax)
            .bidType(Project.BidType.NEGOTIABLE)
            .status(status).approvalStatus(approval).createdAt(created).build();
    }

    // ════════════════════════════════════════════════════════════
    // 6. ORDERS (đơn hàng test đầy đủ trạng thái)
    // ════════════════════════════════════════════════════════════

    private void seedOrders() {
        if (orderRepository.count() > 0) {
            log.info(">>> Orders already seeded, skipping.");
            return;
        }
        User c1 = user("khachhang1@test.com");
        User c2 = user("khachhang2@test.com");
        List<Product> allProducts = productRepository.findByActiveTrueOrderByCreatedAtDesc();
        if (allProducts.isEmpty()) return;

        Product sofa  = findProduct(allProducts,"SOFA");
        Product table = findProduct(allProducts,"TABLE");
        Product decor = findProduct(allProducts,"DECOR");
        Product chair = findProduct(allProducts,"CHAIR");
        Product bed   = findProduct(allProducts,"BED");

        // Đơn 1: CATALOG - PENDING (c1) → chờ admin duyệt
        saveOrder(c1, Order.OrderType.CATALOG, Order.Status.PENDING,
            "123 Lê Lợi, Q.1, TP.HCM","0901234561","Giao giờ hành chính",null,
            LocalDateTime.now().minusHours(3),
            List.of(item(sofa,1), item(table,1)));

        // Đơn 2: CATALOG - PROCESSING (c1) → đang sản xuất
        saveOrder(c1, Order.OrderType.CATALOG, Order.Status.PROCESSING,
            "123 Lê Lợi, Q.1, TP.HCM","0901234561",null,"Đang sản xuất ghế theo đơn",
            LocalDateTime.now().minusDays(3),
            List.of(item(chair,1), item(decor,2)));

        // Đơn 3: PROCESSING (c1)
        saveOrder(c1, Order.OrderType.CATALOG, Order.Status.PROCESSING,
            "123 Lê Lợi, Q.1, TP.HCM","0901234561",null,"Đang sản xuất sofa theo đơn",
            LocalDateTime.now().minusDays(10),
            List.of(item(sofa,1)));

        // Đơn 4: SHIPPED (c2)
        saveOrder(c2, Order.OrderType.CATALOG, Order.Status.SHIPPED,
            "45 Nguyễn Huệ, Q.1, TP.HCM","0901234562",null,"Đã giao cho đơn vị vận chuyển",
            LocalDateTime.now().minusDays(15),
            List.of(item(bed,1)));

        // Đơn 5: DELIVERED (c2 - tháng trước cho chart)
        saveOrder(c2, Order.OrderType.CATALOG, Order.Status.DELIVERED,
            "45 Nguyễn Huệ, Q.1, TP.HCM","0901234562",null,null,
            LocalDateTime.now().minusMonths(1).minusDays(5),
            List.of(item(table,1), item(decor,1)));

        // Đơn 6: CUSTOM - PENDING (thiết kế riêng)
        saveCustomOrder(c1,
            "123 Lê Lợi, Q.1, TP.HCM","0901234561",
            "Tủ quần áo âm tường phòng ngủ master, kích thước 2.4m × 2.6m, có gương toàn thân, ngăn kéo lụa bên trong.",
            LocalDateTime.now().minusDays(1));

        // Đơn 7: CUSTOM - từ Designer 2D
        saveCustomOrder(c1,
            "Vinhomes Central Park, TP.HCM","0901234561",
            "THIẾT KẾ 2D - Phòng khách 500×400cm\n\nMÔ-ĐUN:\n• Sofa 3 chỗ (210×85cm) × 1\n• Bàn cà phê (90×60cm) × 1\n• Tủ tivi (160×45cm) × 1\n\nBOM:\n- Khung gỗ sồi: 1 bộ\n- Vải bọc nỉ: 4.5 m²\n- Mặt kính cường lực 10mm: 1 tấm",
            LocalDateTime.now().minusHours(30));

        // Đơn 8: CANCELLED (c2)
        saveOrder(c2, Order.OrderType.CATALOG, Order.Status.CANCELLED,
            "45 Nguyễn Huệ, Q.1, TP.HCM","0901234562","Hủy do thay đổi kế hoạch",null,
            LocalDateTime.now().minusDays(20),
            List.of(item(decor,3)));

        log.info(">>> Orders seeded ✓");
    }

    private record ItemSeed(Product product, int qty) {}
    private ItemSeed item(Product p, int qty) { return new ItemSeed(p, qty); }

    private void saveOrder(User customer, Order.OrderType type, Order.Status status,
                            String addr, String phone, String note, String procNote,
                            LocalDateTime created, List<ItemSeed> items) {
        Order order = Order.builder()
            .customer(customer).type(type).status(status)
            .deliveryAddress(addr).contactPhone(phone).customerNote(note)
            .processingNote(procNote)
            .confirmedAt(status != Order.Status.PENDING && status != Order.Status.CANCELLED ? created.plusHours(2) : null)
            .deliveredAt(status == Order.Status.DELIVERED ? created.plusDays(7) : null)
            .createdAt(created).build();

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        for (ItemSeed s : items) {
            BigDecimal sub = s.product().getPrice().multiply(BigDecimal.valueOf(s.qty()));
            orderItems.add(OrderItem.builder()
                .order(order).product(s.product())
                .itemName(s.product().getName()).imageUrl(s.product().getImageUrl())
                .quantity(s.qty()).unitPrice(s.product().getPrice()).subtotal(sub).build());
            total = total.add(sub);
        }
        order.setItems(orderItems);
        order.setTotalAmount(total);
        Order saved = orderRepository.save(order);
        saved.setOrderCode("ORD-" + created.format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + saved.getId());
        orderRepository.save(saved);
    }

    private void saveCustomOrder(User customer, String addr, String phone,
                                  String customReq, LocalDateTime created) {
        Order order = Order.builder()
            .customer(customer).type(Order.OrderType.CUSTOM)
            .status(Order.Status.PENDING)
            .deliveryAddress(addr).contactPhone(phone)
            .customRequirements(customReq)
            .totalAmount(BigDecimal.ZERO).createdAt(created).build();

        String shortNote = customReq != null && customReq.length() > 150
            ? customReq.substring(0, 150) + "..." : customReq;
        order.setItems(List.of(OrderItem.builder()
            .order(order).itemName("Sản phẩm tùy chỉnh theo yêu cầu")
            .quantity(1).unitPrice(BigDecimal.ZERO).subtotal(BigDecimal.ZERO)
            .customNote(shortNote).build()));

        Order saved = orderRepository.save(order);
        saved.setOrderCode("ORD-" + created.format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + saved.getId());
        orderRepository.save(saved);
    }

    private Product findProduct(List<Product> all, String cat) {
        return all.stream().filter(p -> cat.equals(p.getCategory())).findFirst().orElse(all.get(0));
    }

    // ════════════════════════════════════════════════════════════
    // 7. NOTIFICATIONS (test cho 3 role)
    // ════════════════════════════════════════════════════════════

    private void seedNotifications() {
        if (notificationRepository.count() > 0) {
            log.info(">>> Notifications already seeded, skipping.");
            return;
        }
        User admin = user("admin@constructx.com");
        User c1    = user("khachhang1@test.com");
        User ctr   = user("nhathauchuyennghiep@test.com");

        List<Notification> notifs = List.of(
            notif(admin,"Có 2 dự án chờ bạn phê duyệt",Notification.NotifType.SYSTEM,
                LocalDateTime.now().minusHours(1)),
            notif(admin,"Đơn hàng tùy chỉnh mới cần xem xét",Notification.NotifType.SYSTEM,
                LocalDateTime.now().minusHours(2)),
            notif(admin,"Nhà thầu mới đăng ký cần duyệt",Notification.NotifType.SYSTEM,
                LocalDateTime.now().minusHours(3)),
            notif(c1,"Dự án của bạn đã được phê duyệt và đang nhận thầu",Notification.NotifType.SYSTEM,
                LocalDateTime.now().minusHours(1)),
            notif(c1,"Bạn nhận được 2 báo giá mới cho dự án Vinhomes",Notification.NotifType.BID_RECEIVED,
                LocalDateTime.now().minusHours(4)),
            notif(c1,"Hợp đồng đã được Admin phê duyệt",Notification.NotifType.SYSTEM,
                LocalDateTime.now().minusHours(6)),
            notif(c1,"Đơn hàng của bạn đã được xác nhận",Notification.NotifType.PAYMENT_SUCCESS,
                LocalDateTime.now().minusHours(8)),
            notif(ctr,"Dự án mới phù hợp với chuyên môn của bạn",Notification.NotifType.SYSTEM,
                LocalDateTime.now().minusHours(2)),
            notif(ctr,"Báo giá của bạn đã được khách hàng xem",Notification.NotifType.BID_RECEIVED,
                LocalDateTime.now().minusHours(5))
        );
        notificationRepository.saveAll(notifs);
        log.info(">>> Notifications seeded ✓");
    }

    private Notification notif(User user, String content,
                                 Notification.NotifType type, LocalDateTime created) {
        return Notification.builder()
            .user(user).content(content).type(type)
            .isRead(false).createdAt(created).build();
    }

    // ── Helpers ─────────────────────────────────────────────────
    private User user(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }
}
