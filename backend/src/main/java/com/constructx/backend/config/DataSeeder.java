package com.constructx.backend.config;

import com.constructx.backend.admin.entity.MaterialCategory;
import com.constructx.backend.admin.repository.MaterialCategoryRepository;
import com.constructx.backend.features.constructor.entity.*;
import com.constructx.backend.features.constructor.repository.*;
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
import com.constructx.backend.admin.repository.DisputeRepository;
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
 * DataSeeder — Tạo dữ liệu demo phong phú, thực tế cho ConstructX.
 * Idempotent: kiểm tra trước khi insert.
 *
 * Tài khoản demo:
 *   ADMIN:      admin@constructx.com    / admin123
 *   CUSTOMER:   khachhang1@test.com     / test123  (Nguyễn Thị Lan — TP.HCM)
 *   CUSTOMER:   khachhang2@test.com     / test123  (Trần Văn Minh — TP.HCM)
 *   CUSTOMER:   khachhang3@test.com     / test123  (Phạm Thị Hoa — Hà Nội)
 *   CONTRACTOR: nhathauchuyennghiep@test.com / test123  (Minh Phú — đã duyệt)
 *   CONTRACTOR: nhaxuong_abc@test.com        / test123  (Xưởng Mộc ABC — đã duyệt)
 *   CONTRACTOR: noithat_vietlong@test.com    / test123  (Việt Long — đã duyệt)
 *   CONTRACTOR: contractor_pending@test.com  / test123  (chưa duyệt)
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
    private final ConstructionLogRepository constructionLogRepository;
    private final DisbursementRequestRepository disbursementRequestRepository;
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
            ensureTablesExist();
            doSeed();
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
        seedBidsAndContracts();
        seedOrders();
        seedNotifications();
    }

    // ════════════════════════════════════════════════════════════
    // TABLE CREATION
    // ════════════════════════════════════════════════════════════
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
                project_id BIGINT,
                bid_id BIGINT,
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
            boolean hasObsoleteColumn = false;
            try (Statement checkStmt = conn.createStatement();
                 java.sql.ResultSet rs = checkStmt.executeQuery("SELECT * FROM contractor_profiles LIMIT 1")) {
                java.sql.ResultSetMetaData meta = rs.getMetaData();
                for (int i = 1; i <= meta.getColumnCount(); i++) {
                    if ("user_id".equalsIgnoreCase(meta.getColumnName(i))) { hasObsoleteColumn = true; break; }
                }
            } catch (Exception ignored) {}
            if (hasObsoleteColumn) {
                try (Statement s = conn.createStatement()) { s.execute("DROP TABLE IF EXISTS contractor_profiles"); }
                catch (Exception ignored) {}
            }
            try (Statement stmt = conn.createStatement()) {
                for (String ddl : ddls) {
                    try { stmt.execute(ddl.strip()); }
                    catch (Exception ex) {
                        if (!ex.getMessage().contains("already exists") && !ex.getMessage().contains("Duplicate key"))
                            log.warn("DDL warning: {}", ex.getMessage());
                    }
                }
            }
            log.info(">>> [DataSeeder] Tables ensured ✓");
        } catch (Exception e) {
            log.error(">>> [DataSeeder] ensureTablesExist failed: {}", e.getMessage());
        }
    }

    // ════════════════════════════════════════════════════════════
    // 1. USERS — 8 tài khoản đại diện đầy đủ vai trò
    // ════════════════════════════════════════════════════════════
    private void seedUsers() {
        upsertUser("admin@constructx.com",           "Admin ConstructX",            "admin123", "0900000001",
                "Tầng 12, Tòa nhà Vincom Center, Q.1, TP.HCM",   User.Role.ADMIN,      User.ApprovalStatus.APPROVED);
        upsertUser("khachhang1@test.com",            "Nguyễn Thị Lan",              "test123",  "0901234561",
                "Vinhomes Central Park, Q.Bình Thạnh, TP.HCM",   User.Role.CUSTOMER,   User.ApprovalStatus.APPROVED);
        upsertUser("khachhang2@test.com",            "Trần Văn Minh",               "test123",  "0901234562",
                "Masteri Thảo Điền, P.Thảo Điền, Q.2, TP.HCM",  User.Role.CUSTOMER,   User.ApprovalStatus.APPROVED);
        upsertUser("khachhang3@test.com",            "Phạm Thị Hoa",                "test123",  "0901234563",
                "Vinhomes Riverside, Long Biên, Hà Nội",         User.Role.CUSTOMER,   User.ApprovalStatus.APPROVED);
        upsertUser("nhathauchuyennghiep@test.com",   "Công ty Nội thất Minh Phú",   "test123",  "0912345671",
                "56 Hai Bà Trưng, Q.1, TP.HCM",                 User.Role.CONTRACTOR, User.ApprovalStatus.APPROVED);
        upsertUser("nhaxuong_abc@test.com",          "Xưởng Mộc ABC",               "test123",  "0912345672",
                "78 Trường Chinh, Đống Đa, Hà Nội",             User.Role.CONTRACTOR, User.ApprovalStatus.APPROVED);
        upsertUser("noithat_vietlong@test.com",      "Nội thất Việt Long",           "test123",  "0912345673",
                "12 Cộng Hòa, Tân Bình, TP.HCM",               User.Role.CONTRACTOR, User.ApprovalStatus.APPROVED);
        upsertUser("contractor_pending@test.com",    "Đức Thành Furniture",          "test123",  "0912345674",
                "99 Lý Thường Kiệt, Q.10, TP.HCM",              User.Role.CONTRACTOR, User.ApprovalStatus.PENDING);
        log.info(">>> Users seeded ✓");
    }

    private void upsertUser(String email, String fullName, String pass, String phone,
                             String address, User.Role role, User.ApprovalStatus status) {
        userRepository.findByEmail(email).ifPresentOrElse(
            u -> { u.setPassword(passwordEncoder.encode(pass)); userRepository.save(u); },
            () -> userRepository.save(User.builder()
                    .email(email).fullName(fullName).password(passwordEncoder.encode(pass))
                    .phoneNumber(phone).address(address).role(role).approvalStatus(status).active(true).build())
        );
    }

    // ════════════════════════════════════════════════════════════
    // 2. WALLETS
    // ════════════════════════════════════════════════════════════
    private void seedWallets() {
        record WS(String email, long bal) {}
        List<WS> ws = List.of(
            new WS("khachhang1@test.com",          320_000_000L),
            new WS("khachhang2@test.com",           85_000_000L),
            new WS("khachhang3@test.com",          150_000_000L),
            new WS("nhathauchuyennghiep@test.com", 240_000_000L),
            new WS("nhaxuong_abc@test.com",        110_000_000L),
            new WS("noithat_vietlong@test.com",    175_000_000L),
            new WS("contractor_pending@test.com",   12_000_000L),
            new WS("admin@constructx.com",         500_000_000L)
        );
        for (WS w : ws) {
            userRepository.findByEmail(w.email()).ifPresent(u -> {
                if (walletRepository.findByUserId(u.getId()).isEmpty())
                    walletRepository.save(Wallet.builder().user(u).balance(w.bal()).lockedAmount(0L).build());
            });
        }
        log.info(">>> Wallets seeded ✓");
    }

    // ════════════════════════════════════════════════════════════
    // 3. MATERIAL CATEGORIES
    // ════════════════════════════════════════════════════════════
    private void seedMaterials() {
        if (materialCategoryRepository.count() > 0) return;
        List.of("Gỗ tự nhiên","Gỗ công nghiệp MDF","Gỗ công nghiệp HDF",
                "Kính cường lực","Inox 304","Đá nhân tạo","Đá marble nhập khẩu",
                "Vải nhung Velvet","Da PU","Da thật nhập khẩu Ý",
                "Nhôm định hình","Thép không gỉ","Sơn PU cao cấp","Sơn acrylic",
                "Gỗ óc chó","Gỗ sồi Mỹ","Đồng thau","Mây tre đan")
            .forEach(n -> materialCategoryRepository.save(MaterialCategory.builder().name(n).active(true).build()));
        log.info(">>> Materials seeded ✓");
    }

    // ════════════════════════════════════════════════════════════
    // 4. PRODUCTS — 24 sản phẩm nội thất đa dạng
    // ════════════════════════════════════════════════════════════
    private void seedProducts() {
        if (productRepository.count() > 0) { log.info(">>> Products already seeded, skipping."); return; }
        List<Product> products = List.of(
            // ── SOFA ──────────────────────────────────────────────────────
            p("Sofa góc L hiện đại 4 chỗ Premium",
              "Sofa góc L thiết kế tối giản, chân gỗ sồi tự nhiên. Đệm mút D40 cao cấp, vỏ nỉ Hàn Quốc. Phù hợp phòng khách từ 25m².",
              18_500_000,22_000_000,"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600","SOFA","HomeDecor VN","Khung gỗ sồi + Đệm mút D40 + Vỏ nỉ Hàn Quốc","280×180×85cm","Xám tro",12,4.8,124,true),
            p("Sofa văng 3 chỗ Scandinavian",
              "Phong cách Bắc Âu tối giản. Chân gỗ sồi vàng, mút xốp ép tỉ trọng cao, vải linen thô nhẹ.",
              9_800_000,12_000_000,"https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600","SOFA","Nordic Living","Gỗ sồi + Mút xốp + Vải linen","210×85×80cm","Kem trắng",8,4.6,87,true),
            p("Sofa da thật nhập khẩu Ý 2 chỗ",
              "Da bò full-grain nhập khẩu từ Ý, khung thép không gỉ, đệm lò xo túi độc lập. Bảo hành 3 năm.",
              35_000_000,0,"https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600","SOFA","Luxury Italia","Da bò thật + Khung thép + Đệm lò xo túi","175×90×82cm","Nâu caramel",3,4.9,45,true),
            p("Sofa module tự ghép 5 chỗ",
              "Hệ sofa module linh hoạt, có thể ghép nhiều cấu hình. Vải velvet cao cấp, chân inox mờ.",
              24_000_000,28_000_000,"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600","SOFA","ModHome","Vải Velvet + Khung thép + Chân inox","350×200×80cm","Xanh rêu",5,4.7,62,true),
            // ── TABLE ─────────────────────────────────────────────────────
            p("Bàn ăn gỗ óc chó 6 ghế cao cấp",
              "Mặt bàn gỗ óc chó nguyên tấm dày 4cm, đánh bóng dầu tự nhiên, chân bàn thép sơn đen tĩnh điện.",
              15_600_000,18_000_000,"https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=600","TABLE","WoodCraft VN","Gỗ óc chó nguyên tấm + Chân thép","180×90×76cm","Nâu gỗ tự nhiên",6,4.7,63,true),
            p("Bàn làm việc tối giản 120cm có ngăn kéo",
              "Bàn làm việc home office ergonomic, 2 ngăn kéo khóa từ tính, mặt bàn chống xước PVC.",
              3_200_000,4_000_000,"https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600","TABLE","OfficeStyle","Gỗ MDF phủ melamine chống xước","120×60×75cm","Trắng",25,4.4,198,false),
            p("Bàn cà phê tròn mặt đá cẩm thạch",
              "Bàn trà Á Đông hiện đại, mặt đá marble nhân tạo Calacatta, chân inox vàng 304 kiểu chân nhện.",
              4_800_000,6_200_000,"https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600","TABLE","Luxe Stone","Đá marble nhân tạo + Chân inox vàng","Ø80×45cm","Trắng vân xám",14,4.5,72,false),
            p("Bàn console gỗ tự nhiên kiểu dáng Mid-Century",
              "Bàn đầu hành lang / phòng khách. Gỗ teak tự nhiên, chân vát 45°, mặt kính cường lực phủ.",
              5_400_000,7_000_000,"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600","TABLE","WoodCraft VN","Gỗ teak + Kính cường lực 6mm","120×35×80cm","Nâu teak",7,4.6,38,false),
            // ── CHAIR ─────────────────────────────────────────────────────
            p("Ghế ăn bọc nhung Velvet cao cấp (bộ 4)",
              "Set 4 ghế ăn, bọc nhung Velvet nhập khẩu Bỉ, chân gỗ sồi sơn vàng đồng, êm ái và sang trọng.",
              5_600_000,7_200_000,"https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600","CHAIR","VelvetHome","Vải nhung Velvet + Chân gỗ sồi sơn đồng","46×52×88cm","Xanh navy",20,4.6,156,false),
            p("Ghế văn phòng ergonomic lưới thoáng khí",
              "Ghế công thái học chính hãng ErgoMax, lưng lưới thoáng, tựa đầu 4 chiều, tay vịn 4D, ngả lưng 120°.",
              6_800_000,8_500_000,"https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600","CHAIR","ErgoMax","Lưới polyester + Khung nhựa ABS","65×65×110-125cm","Đen",30,4.7,312,true),
            p("Ghế thư giãn Accent Chair Nordic",
              "Ghế đọc sách / thư giãn góc phòng khách. Vải chenille mềm mịn, đệm ngồi dày 12cm, chân gỗ óc chó.",
              4_200_000,0,"https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600","CHAIR","Nordic Living","Vải chenille + Chân gỗ óc chó","75×80×95cm","Vàng mù tạt",9,4.8,54,false),
            // ── BED ───────────────────────────────────────────────────────
            p("Giường ngủ King Size 1m8 khung gỗ sồi Mỹ",
              "Giường đôi King 1m8×2m, đầu giường bọc da PU thêu hoa văn, khung gỗ sồi Mỹ bào nhẵn. Bảo hành 5 năm.",
              22_000_000,26_000_000,"https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600","BED","SleepPro","Gỗ sồi Mỹ + Đầu giường da PU","200×180×120cm","Nâu trầm",5,4.8,89,true),
            p("Giường hộp chứa đồ đa năng 1m6",
              "Giường đôi có ngăn chứa đồ dung tích 280L bên dưới, mặt nệm nâng bằng thanh gas. Phù hợp phòng ngủ nhỏ.",
              12_500_000,15_000_000,"https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600","BED","SmartHome VN","Gỗ MDF + Chân thép + Thanh gas","200×160×40cm","Trắng sữa",10,4.5,143,false),
            p("Giường tầng trẻ em an toàn + bàn học tích hợp",
              "Giường tầng kết hợp bàn học, thanh trượt, tủ 3 ngăn. Gỗ thông tự nhiên, sơn không độc hại cho trẻ em.",
              8_800_000,11_000_000,"https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600","BED","KidsHome","Gỗ thông tự nhiên sơn không độc","200×90×180cm","Trắng + Xanh",8,4.6,77,false),
            // ── CABINET ───────────────────────────────────────────────────
            p("Tủ quần áo 4 cánh gương toàn thân Walk-in",
              "Tủ 4 cánh rộng 2m, 2 cánh gương toàn thân, hệ treo cao cấp, 4 ngăn kéo lụa, đèn LED bên trong.",
              8_900_000,11_000_000,"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600","CABINET","ClosetPro","Gỗ MDF + Gương cường lực + Khung nhôm","200×60×220cm","Trắng sữa",7,4.4,201,false),
            p("Kệ sách gỗ thông 6 tầng Vintage",
              "Kệ sách vintage phong cách công nghiệp, gỗ thông tự nhiên + khung sắt sơn đen, 6 tầng điều chỉnh.",
              2_800_000,3_500_000,"https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600","CABINET","WoodCraft VN","Gỗ thông tự nhiên + Khung sắt","80×30×180cm","Nâu gỗ vintage",18,4.6,167,false),
            p("Tủ bếp trên dưới MDF chống ẩm 3m hoàn chỉnh",
              "Bộ tủ bếp cao cấp 3m, cánh acrylic bóng gương, ray giảm chấn Blum Áo, chân nhôm chỉnh được.",
              28_000_000,33_000_000,"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600","CABINET","HomeDecor VN","MDF chống ẩm + Cánh acrylic bóng","300×60×220cm","Trắng bóng",4,4.7,58,true),
            p("Tủ tivi âm tường kèm kệ lưu trữ 2.4m",
              "Tủ tivi liền kệ phong cách hiện đại, cánh mở và ngăn mở mix, màu trắng nhám sang trọng.",
              12_000_000,14_500_000,"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600","CABINET","HomeDecor VN","MDF phủ laminate + Cánh kính mờ","240×40×200cm","Trắng nhám",6,4.5,91,false),
            // ── DECOR ─────────────────────────────────────────────────────
            p("Đèn thả trần sợi mây đan thủ công",
              "Đèn thả trần thủ công, sợi mây đan bởi nghệ nhân Bình Định, đế đồng mạ vàng, bóng LED E27 warm white.",
              1_200_000,1_600_000,"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600","DECOR","ArtLight VN","Mây đan tay + Đế đồng + Bóng LED E27","Ø45×cao35cm","Nâu mây tự nhiên",35,4.8,289,false),
            p("Thảm phòng khách lông xù Bắc Âu 160×230cm",
              "Thảm lông xù dày 3cm, sợi polyester 3D cao cấp, chống trượt, không gây dị ứng, dễ vệ sinh.",
              2_400_000,3_200_000,"https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600","DECOR","SoftHome","Sợi polyester 3D cao cấp","160×230cm, dày 3cm","Xám nhạt",22,4.5,175,false),
            p("Tranh canvas Abstract tối giản bộ 3 tấm",
              "Bộ 3 tranh canvas in phun kỹ thuật số phân giải cao, viền gỗ thông sơn trắng, sẵn đinh treo.",
              680_000,900_000,"https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=600","DECOR","ArtPrint VN","Canvas polyester + Khung gỗ thông","30×40cm × 3 tấm","Đen – Trắng – Vàng",50,4.3,412,false),
            p("Gương trang trí khung đồng mạ vàng Oval",
              "Gương trang trí phòng khách / hành lang. Khung đồng mạ vàng 18K, gương kính cường lực 5mm.",
              3_600_000,4_800_000,"https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=600","DECOR","Luxe Decor","Khung đồng mạ vàng + Kính cường lực","60×90cm","Vàng đồng",15,4.7,83,false),
            p("Chậu cây xanh đất nung trang trí cao 80cm",
              "Bộ 3 chậu đất nung thủ công kích thước S-M-L, màu đất nung tự nhiên, phù hợp cây nội thất tropical.",
              850_000,0,"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600","DECOR","GreenHome","Đất nung thủ công","Ø25cm / Ø35cm / Ø45cm","Đất nung nâu đỏ",40,4.6,156,false),
            p("Đèn sàn đứng phòng đọc sách Arc Floor Lamp",
              "Đèn sàn cổ cao 175cm, thân nhôm mạ đồng, chao vải linen tự nhiên, bóng LED 12W dimmer.",
              2_900_000,3_800_000,"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600","DECOR","ArtLight VN","Nhôm mạ đồng + Chao vải linen","Ø40cm × cao175cm","Đồng – Kem",12,4.8,104,false)
        );
        productRepository.saveAll(products);
        log.info(">>> {} products seeded ✓", products.size());
    }

    private Product p(String name, String desc, long price, long origPrice, String img,
                      String cat, String brand, String mat, String dim, String color,
                      int stock, double rating, int reviewCount, boolean featured) {
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
    // 5. PROJECTS — 12 dự án đa dạng trạng thái
    // ════════════════════════════════════════════════════════════
    private void seedProjects() {
        if (projectRepository.count() > 0) { log.info(">>> Projects already seeded, skipping."); return; }
        User c1 = u("khachhang1@test.com");
        User c2 = u("khachhang2@test.com");
        User c3 = u("khachhang3@test.com");

        List<Project> projects = new ArrayList<>();

        // ── OPEN (đang nhận thầu) ──────────────────────────────
        projects.add(proj(c1, "Thiết kế & thi công toàn bộ nội thất căn hộ 2PN Vinhomes",
            "Nội thất toàn bộ", 75.0, "Hiện đại – Bắc Âu",
            "Vinhomes Central Park, Q.Bình Thạnh, TP.HCM",
            "Căn hộ 2 phòng ngủ 75m² tầng 18, phong cách Scandinavian hiện đại. Yêu cầu vật liệu gỗ tự nhiên, " +
            "tone màu trung tính (trắng, kem, gỗ nhạt). Phòng khách: sofa, bàn trà, kệ tivi. " +
            "2 phòng ngủ đầy đủ. Bếp: tủ bếp trên dưới + đảo bếp. Thời gian thi công: 45 ngày.",
            180_000_000L, 260_000_000L, Project.Status.OPEN, Project.ApprovalStatus.APPROVED,
            LocalDateTime.now().minusDays(5)));

        projects.add(proj(c1, "Nội thất master bedroom sang trọng phong cách Luxury",
            "Phòng ngủ", 32.0, "Luxury – Tân Cổ Điển",
            "The Manor, Q.Bình Thạnh, TP.HCM",
            "Phòng ngủ master 32m² cho vợ chồng. Yêu cầu: giường King Size bọc da thật, " +
            "tủ quần áo âm tường 3.6m, bàn trang điểm có gương đèn LED, đầu giường ốp đá marble. " +
            "Vật liệu cao cấp: đá marble, da thật, vải lụa. Ngân sách linh hoạt cho chất lượng tốt nhất.",
            120_000_000L, 180_000_000L, Project.Status.OPEN, Project.ApprovalStatus.APPROVED,
            LocalDateTime.now().minusDays(3)));

        projects.add(proj(c2, "Cải tạo phòng bếp + phòng ăn chung cư Times City Hà Nội",
            "Phòng bếp & ăn", 22.0, "Hiện đại tối giản",
            "Times City, Hai Bà Trưng, Hà Nội",
            "Phòng bếp kết hợp phòng ăn 22m² cần cải tạo toàn diện. Yêu cầu: tủ bếp trên + dưới (3.6m), " +
            "đảo bếp đa năng, bàn ăn gấp 4-6 người, hệ chiếu sáng LED ấm. " +
            "Phong cách: trắng sạch + gỗ sáng. Tháo dỡ bếp cũ và thi công mới hoàn toàn.",
            75_000_000L, 110_000_000L, Project.Status.OPEN, Project.ApprovalStatus.APPROVED,
            LocalDateTime.now().minusDays(7)));

        projects.add(proj(c2, "Home office 20m² phong cách Industrial Minimalist",
            "Phòng làm việc", 20.0, "Industrial – Minimalist",
            "Masteri Thảo Điền, Q.2, TP.HCM",
            "Phòng làm việc tại nhà 20m² cho kỹ sư IT, cần 2 góc làm việc độc lập. " +
            "Yêu cầu: 2 bàn làm việc lớn (160cm), kệ sách tường từ sàn lên trần, " +
            "ghế ergonomic, hệ đèn bàn chuyên dụng, ổ cắm điện/USB tích hợp bàn. " +
            "Phong cách: gỗ thô + sắt đen + bê tông.",
            45_000_000L, 70_000_000L, Project.Status.OPEN, Project.ApprovalStatus.APPROVED,
            LocalDateTime.now().minusDays(2)));

        projects.add(proj(c3, "Thiết kế phòng khách biệt thự 60m² phong cách Châu Âu cổ điển",
            "Phòng khách", 60.0, "Cổ điển Châu Âu",
            "Vinhomes Riverside, Long Biên, Hà Nội",
            "Phòng khách 60m² biệt thự liền kề, trần cao 3.5m, cần thiết kế sang trọng đẳng cấp. " +
            "Yêu cầu: sofa góc lớn 6 chỗ bọc da thật, bàn trà đá marble, đèn chùm pha lê trung tâm, " +
            "kệ trang trí âm tường, tranh sơn dầu khổ lớn, thảm Ba Tư. " +
            "Tone màu: kem-vàng đồng-gỗ nâu. Chi phí không giới hạn với chất lượng tương xứng.",
            350_000_000L, 600_000_000L, Project.Status.OPEN, Project.ApprovalStatus.APPROVED,
            LocalDateTime.now().minusDays(1)));

        projects.add(proj(c1, "Phòng trẻ em sáng tạo & an toàn cho bé 4 tuổi",
            "Phòng trẻ em", 14.0, "Vui nhộn – Sáng tạo",
            "Eco Green Saigon, Q.7, TP.HCM",
            "Phòng ngủ + vui chơi cho bé gái 4 tuổi, tông màu pastel. " +
            "Yêu cầu: giường tầng an toàn có hàng rào, bàn học chiều cao điều chỉnh, " +
            "tủ đồ chơi có hộc kéo thấp, góc đọc sách có đệm ngồi, tường vẽ mural công chúa. " +
            "Tất cả vật liệu an toàn không độc hại cho trẻ em (chứng chỉ E0/E1).",
            35_000_000L, 55_000_000L, Project.Status.OPEN, Project.ApprovalStatus.APPROVED,
            LocalDateTime.now().minusHours(8)));

        projects.add(proj(c3, "Thi công nội thất nhà hàng fine dining 200m²",
            "Thương mại", 200.0, "Luxury Modern",
            "18 Lý Thái Tổ, Hoàn Kiếm, Hà Nội",
            "Nhà hàng fine dining cao cấp tầng 2 tòa nhà thương mại, sức chứa 80 khách. " +
            "Yêu cầu: khu ăn chính với bàn tròn 8 chỗ, phòng VIP riêng 2 phòng, bar cocktail, " +
            "bếp mở (open kitchen), hệ thống âm thanh + ánh sáng sân khấu. " +
            "Vật liệu: đá marble, đồng thau, gỗ óc chó. Phong cách: luxury tối giản.",
            800_000_000L, 1_400_000_000L, Project.Status.OPEN, Project.ApprovalStatus.APPROVED,
            LocalDateTime.now().minusHours(4)));

        // ── IN_PROGRESS (đang thi công — có hợp đồng) ─────────
        projects.add(proj(c1, "Thi công nội thất căn hộ penthouse 120m² The Landmark 81",
            "Nội thất toàn bộ", 120.0, "Ultra Luxury – Japandi",
            "The Landmark 81, Vinhomes Central Park, TP.HCM",
            "Penthouse tầng 75, 3 phòng ngủ, view sông Sài Gòn toàn cảnh. Phong cách Japandi (Nhật + Scandinavian). " +
            "Yêu cầu: gỗ tự nhiên, đá onyx, vải linen thô. Đã ký hợp đồng, đang thi công.",
            650_000_000L, 900_000_000L, Project.Status.IN_PROGRESS, Project.ApprovalStatus.APPROVED,
            LocalDateTime.now().minusMonths(2)));

        projects.add(proj(c2, "Cải tạo căn hộ studio 38m² thành không gian đa năng",
            "Nội thất toàn bộ", 38.0, "Smart Living",
            "The Sun Avenue, Q.2, TP.HCM",
            "Studio 38m² cần tối ưu không gian: giường Murphy tích hợp sofa, " +
            "bếp mini + bàn ăn gấp, góc làm việc, tủ lưu trữ tối đa. Đang thi công giai đoạn hoàn thiện.",
            85_000_000L, 120_000_000L, Project.Status.IN_PROGRESS, Project.ApprovalStatus.APPROVED,
            LocalDateTime.now().minusMonths(1)));

        // ── COMPLETED (đã hoàn thành) ─────────────────────────
        projects.add(proj(c1, "Nội thất phòng ngủ phụ 18m² phong cách Japandi",
            "Phòng ngủ", 18.0, "Japandi",
            "Vinhomes Central Park, TP.HCM",
            "Phòng ngủ phụ cho khách, tông màu đất, gỗ sáng, vải tự nhiên. Đã hoàn thành xuất sắc.",
            55_000_000L, 75_000_000L, Project.Status.COMPLETED, Project.ApprovalStatus.APPROVED,
            LocalDateTime.now().minusMonths(3)));

        projects.add(proj(c3, "Thi công quán cà phê concept 80m²",
            "Thương mại", 80.0, "Bohemian Industrial",
            "123 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội",
            "Quán cà phê phong cách Bohemian Industrial, 40 chỗ ngồi. Gỗ thô + sắt + đèn Edison. Đã hoàn thành.",
            220_000_000L, 320_000_000L, Project.Status.COMPLETED, Project.ApprovalStatus.APPROVED,
            LocalDateTime.now().minusMonths(4)));

        // ── Dự án nhỏ lẻ — bàn, ghế, tủ đơn chiếc ───────────
        projects.add(proj(c2, "Đóng bộ bàn ăn 4 chỗ gỗ sồi",
            "Bàn & Ghế", 0.0, "Hiện đại tối giản",
            "Q.Bình Thạnh, TP.HCM",
            "Cần đóng 1 bàn ăn 4 chỗ kích thước 120×80cm, chân sắt sơn đen, mặt gỗ sồi dày 4cm màu walnut. " +
            "Kèm 4 ghế ăn bọc vải linen kem, khung gỗ sồi. Giao trong 10 ngày.",
            3_000_000L, 8_000_000L, Project.Status.OPEN, Project.ApprovalStatus.APPROVED,
            LocalDateTime.now().minusHours(5)));

        projects.add(proj(c3, "Làm tủ đầu giường đôi cho phòng ngủ",
            "Tủ & Kệ", 0.0, "Tối giản",
            "Long Biên, Hà Nội",
            "Cần làm 2 tủ đầu giường đối xứng, kích thước mỗi tủ 50×40×55cm, " +
            "ngăn kéo lụa, màu trắng nhám. Gỗ MDF chống ẩm, ray Blum. Lắp tại nhà.",
            2_000_000L, 5_000_000L, Project.Status.OPEN, Project.ApprovalStatus.APPROVED,
            LocalDateTime.now().minusHours(2)));

        projects.add(proj(c1, "Sửa & bọc lại ghế sofa 3 chỗ",
            "Ghế & Sofa", 0.0, "Phục hồi",
            "Vinhomes Central Park, TP.HCM",
            "Sofa 3 chỗ hiện tại bị rách vải và lún đệm. Cần thay đệm mút D40 và bọc lại vải velvet màu navy. " +
            "Kích thước sofa: 210×85×80cm. Giao hàng về nhà hoặc nhà thầu tự đến lấy.",
            1_500_000L, 4_000_000L, Project.Status.OPEN, Project.ApprovalStatus.APPROVED,
            LocalDateTime.now().minusMinutes(90)));

        // ── PENDING APPROVAL — test admin duyệt ──────────────
        projects.add(proj(c2, "Thi công spa & wellness center cao cấp 150m²",
            "Thương mại", 150.0, "Zen – Luxury",
            "56 Nguyễn Trãi, Q.5, TP.HCM",
            "Spa cao cấp 6 phòng trị liệu, phòng xông hơi, reception, khu nghỉ ngơi. " +
            "Vật liệu: đá tự nhiên, tre bamboo, gỗ teak, vải cotton hữu cơ. Cần duyệt gấp.",
            500_000_000L, 850_000_000L, Project.Status.OPEN, Project.ApprovalStatus.PENDING,
            LocalDateTime.now().minusHours(3)));

        projectRepository.saveAll(projects);
        log.info(">>> {} projects seeded ✓", projects.size());
    }

    private Project proj(User user, String name, String cat, Double area, String style,
                          String addr, String desc, Long bMin, Long bMax,
                          Project.Status status, Project.ApprovalStatus approval, LocalDateTime created) {
        return Project.builder().user(user).name(name).category(cat).area(area).style(style)
            .address(addr).description(desc).budgetMin(bMin).budgetMax(bMax)
            .bidType(Project.BidType.NEGOTIABLE).status(status).approvalStatus(approval).createdAt(created).build();
    }


    // ════════════════════════════════════════════════════════════
    // 6. BIDS + CONTRACTS + CONSTRUCTION LOGS + DISBURSEMENTS
    // ════════════════════════════════════════════════════════════
    private void seedBidsAndContracts() {
        if (bidRepository.count() > 0) { log.info(">>> Bids already seeded, skipping."); return; }

        User c1   = u("khachhang1@test.com");
        User c2   = u("khachhang2@test.com");
        User ctr1 = u("nhathauchuyennghiep@test.com");   // Minh Phú
        User ctr2 = u("nhaxuong_abc@test.com");           // Xưởng Mộc ABC
        User ctr3 = u("noithat_vietlong@test.com");       // Việt Long

        // Lấy dự án OPEN đầu tiên (ID thấp nhất — Vinhomes 75m²)
        List<Project> openProjects = projectRepository.findAll().stream()
            .filter(p -> p.getApprovalStatus() == Project.ApprovalStatus.APPROVED
                      && p.getStatus() == Project.Status.OPEN)
            .sorted((a,b) -> a.getCreatedAt().compareTo(b.getCreatedAt()))
            .toList();

        // Dự án IN_PROGRESS để tạo HĐ + nhật ký thi công
        List<Project> inProgressProjects = projectRepository.findAll().stream()
            .filter(p -> p.getStatus() == Project.Status.IN_PROGRESS)
            .toList();

        // ── Bid cho dự án OPEN (penthouse & studio nếu chưa IN_PROGRESS hoặc các dự án OPEN) ─
        if (!openProjects.isEmpty()) {
            Project proj0 = openProjects.get(0); // Vinhomes 75m²
            // Bid 1: Minh Phú — chào giá cạnh tranh
            Bid bid1 = bidRepository.save(Bid.builder()
                .project(proj0).contractor(ctr1)
                .totalPrice(195_000_000L).estimatedDays(40)
                .message("Chúng tôi có 10 năm kinh nghiệm thi công Scandinavian. Đã hoàn thành 200+ dự án căn hộ Vinhomes. " +
                         "Cam kết đúng tiến độ, vật liệu chính hãng, bảo hành 2 năm.")
                .paymentTerms("30% khởi công - 40% thi công thô - 30% nghiệm thu")
                .warrantyMonths(24).status(Bid.Status.PENDING)
                .createdAt(LocalDateTime.now().minusDays(4)).build());
            bid1.setDetails(buildBidDetails(bid1, new Object[][]{
                {"Phòng khách: sofa, bàn trà, kệ tivi", "bộ", 1.0, 45_000_000L},
                {"2 Phòng ngủ: giường, tủ, đầu giường", "bộ", 2.0, 55_000_000L},
                {"Phòng bếp: tủ bếp trên dưới + đảo bếp", "bộ", 1.0, 55_000_000L},
                {"Nhà vệ sinh: tủ gương, kệ", "bộ", 2.0, 18_000_000L},
                {"Sơn tường + thi công hoàn thiện", "m²", 75.0, 300_000L},
            }));
            bidRepository.save(bid1);

            // Bid 2: Xưởng Mộc ABC — chào giá thấp hơn
            Bid bid2 = bidRepository.save(Bid.builder()
                .project(proj0).contractor(ctr2)
                .totalPrice(178_000_000L).estimatedDays(50)
                .message("Xưởng mộc 15 năm tại Hà Nội, chuyên sản xuất nội thất gỗ tự nhiên theo yêu cầu. " +
                         "Chúng tôi tự sản xuất tất cả, không qua trung gian, đảm bảo giá tốt nhất.")
                .paymentTerms("50% trước - 50% sau nghiệm thu")
                .warrantyMonths(18).status(Bid.Status.PENDING)
                .createdAt(LocalDateTime.now().minusDays(3)).build());
            bid2.setDetails(buildBidDetails(bid2, new Object[][]{
                {"Phòng khách toàn bộ", "bộ", 1.0, 40_000_000L},
                {"2 Phòng ngủ", "bộ", 2.0, 50_000_000L},
                {"Phòng bếp", "bộ", 1.0, 52_000_000L},
                {"Công tác sơn tường & hoàn thiện", "m²", 75.0, 280_000L},
            }));
            bidRepository.save(bid2);

            // Bid 3: Việt Long — chào giá cao nhất, chất lượng premium
            Bid bid3 = bidRepository.save(Bid.builder()
                .project(proj0).contractor(ctr3)
                .totalPrice(240_000_000L).estimatedDays(35)
                .message("Nội thất Việt Long — top 3 nhà thầu uy tín TP.HCM 2024. " +
                         "Chuyên dự án luxury & premium. Vật liệu nhập khẩu Châu Âu, " +
                         "thiết kế 3D free, thi công 35 ngày, bảo hành 3 năm toàn diện.")
                .paymentTerms("20% khởi công - 30% hoàn thiện thô - 30% hoàn thiện - 20% bàn giao")
                .warrantyMonths(36).status(Bid.Status.PENDING)
                .createdAt(LocalDateTime.now().minusDays(2)).build());
            bid3.setDetails(buildBidDetails(bid3, new Object[][]{
                {"Phòng khách premium (vật liệu nhập khẩu)", "bộ", 1.0, 58_000_000L},
                {"Phòng ngủ master premium", "bộ", 1.0, 45_000_000L},
                {"Phòng ngủ phụ", "bộ", 1.0, 32_000_000L},
                {"Phòng bếp premium + đảo bếp đá nhân tạo", "bộ", 1.0, 68_000_000L},
                {"2 nhà vệ sinh + cửa kính cường lực", "bộ", 2.0, 22_000_000L},
                {"Hoàn thiện tổng thể + đèn LED toàn nhà", "trọn gói", 1.0, 15_000_000L},
            }));
            bidRepository.save(bid3);

            // ── Bid cho các dự án nhỏ (bàn, ghế, tủ) ─────────────
            // Tìm dự án "bộ bàn ăn"
            openProjects.stream()
                .filter(p -> p.getName().contains("bàn ăn") || p.getName().contains("Bàn ăn"))
                .findFirst().ifPresent(banAn -> {
                    Bid b = bidRepository.save(Bid.builder()
                        .project(banAn).contractor(ctr2)
                        .totalPrice(6_500_000L).estimatedDays(8)
                        .message("Xưởng Mộc ABC chuyên đóng nội thất theo yêu cầu. Bàn ăn gỗ sồi + 4 ghế đúng yêu cầu, giao tận nhà, lắp đặt miễn phí.")
                        .paymentTerms("50% đặt cọc - 50% khi nhận hàng")
                        .warrantyMonths(12).status(Bid.Status.PENDING)
                        .createdAt(LocalDateTime.now().minusHours(3)).build());
                    b.setDetails(buildBidDetails(b, new Object[][]{
                        {"Bàn ăn 120×80cm gỗ sồi + chân sắt đen", "cái", 1.0, 3_200_000L},
                        {"Ghế ăn bọc vải linen khung gỗ sồi", "cái", 4.0, 800_000L},
                        {"Công lắp đặt tại nhà + vận chuyển", "lần", 1.0, 500_000L},
                    }));
                    bidRepository.save(b);

                    Bid b2 = bidRepository.save(Bid.builder()
                        .project(banAn).contractor(ctr3)
                        .totalPrice(7_200_000L).estimatedDays(6)
                        .message("Việt Long — giao nhanh 6 ngày, gỗ sồi nhập khẩu Mỹ, bảo hành 18 tháng.")
                        .paymentTerms("Thanh toán khi nhận hàng")
                        .warrantyMonths(18).status(Bid.Status.PENDING)
                        .createdAt(LocalDateTime.now().minusHours(2)).build());
                    b2.setDetails(buildBidDetails(b2, new Object[][]{
                        {"Bàn ăn 120×80cm gỗ sồi Mỹ + chân sắt sơn tĩnh điện", "cái", 1.0, 3_800_000L},
                        {"Ghế ăn velvet khung gỗ sồi sơn walnut", "cái", 4.0, 850_000L},
                    }));
                    bidRepository.save(b2);
                });

            // Tìm dự án "tủ đầu giường"
            openProjects.stream()
                .filter(p -> p.getName().contains("đầu giường"))
                .findFirst().ifPresent(tuDG -> {
                    Bid b = bidRepository.save(Bid.builder()
                        .project(tuDG).contractor(ctr1)
                        .totalPrice(3_800_000L).estimatedDays(5)
                        .message("Minh Phú làm tủ đầu giường MDF chống ẩm, ray Blum, sơn trắng nhám PU cao cấp. Giao đúng hạn.")
                        .paymentTerms("30% đặt cọc - 70% khi giao")
                        .warrantyMonths(24).status(Bid.Status.PENDING)
                        .createdAt(LocalDateTime.now().minusHours(1)).build());
                    b.setDetails(buildBidDetails(b, new Object[][]{
                        {"Tủ đầu giường MDF chống ẩm + ngăn kéo lụa", "cái", 2.0, 1_600_000L},
                        {"Sơn PU trắng nhám 2 lớp", "cái", 2.0, 200_000L},
                        {"Lắp đặt + vận chuyển", "lần", 1.0, 200_000L},
                    }));
                    bidRepository.save(b);
                });

        }

        // ── Hợp đồng ACTIVE từ dự án IN_PROGRESS — penthouse 120m² ──────
        if (!inProgressProjects.isEmpty()) {
            Project penthouse = inProgressProjects.get(0);
            LocalDateTime contractDate = LocalDateTime.now().minusDays(45);

            // Tạo Bid đã ACCEPTED
            Bid acceptedBid = bidRepository.save(Bid.builder()
                .project(penthouse).contractor(ctr1)
                .totalPrice(720_000_000L).estimatedDays(60)
                .message("Minh Phú — chuyên gia Japandi tại TP.HCM. Thi công penthouse 5* với vật liệu nhập khẩu.")
                .paymentTerms("20%-30%-30%-20% theo milestone")
                .warrantyMonths(24).status(Bid.Status.ACCEPTED)
                .createdAt(contractDate.minusDays(5)).build());
            acceptedBid.setDetails(buildBidDetails(acceptedBid, new Object[][]{
                {"Phòng khách + bếp mở Japandi", "bộ", 1.0, 180_000_000L},
                {"Master bedroom + walk-in closet", "bộ", 1.0, 155_000_000L},
                {"2 Phòng ngủ phụ", "bộ", 2.0, 120_000_000L},
                {"3 Nhà vệ sinh cao cấp", "bộ", 3.0, 135_000_000L},
                {"Hệ thống đèn thông minh Smart Home", "trọn gói", 1.0, 85_000_000L},
                {"Sơn Behr + hoàn thiện tổng thể", "m²", 120.0, 375_000L},
            }));
            bidRepository.save(acceptedBid);

            // Tạo Contract ACTIVE
            long escrow = 720_000_000L;
            long kyQuy  = Math.round(escrow * 0.05);
            String contractNum = "CTR-" + contractDate.format(DateTimeFormatter.ofPattern("yyyyMMddHHmm")) + "-" + acceptedBid.getId();
            Contract contract = Contract.builder()
                .project(penthouse).bid(acceptedBid)
                .client(c1).contractor(ctr1)
                .contractNumber(contractNum)
                .agreedPrice(720_000_000L).originalAgreedPrice(720_000_000L)
                .estimatedDays(60)
                .terms("HỢP ĐỒNG THI CÔNG NỘI THẤT — Penthouse The Landmark 81\n\n" +
                       "Bên A: Nguyễn Thị Lan (Khách hàng)\n" +
                       "Bên B: Công ty Nội thất Minh Phú\n\n" +
                       "Giá trị hợp đồng: 720,000,000 VND\n" +
                       "Thời gian thi công: 60 ngày kể từ ngày ký\n" +
                       "Phong cách: Japandi (Nhật + Scandinavian)\n\n" +
                       "Điều khoản: Giải ngân theo 4 milestone. Bảo hành 24 tháng.")
                .status(Contract.Status.ACTIVE)
                .customerDepositAmount(escrow).customerDepositLocked(true)
                .contractorDepositAmount(kyQuy).contractorDepositLocked(true)
                .clientSigned(true).clientSignedAt(contractDate)
                .contractorSigned(true).contractorSignedAt(contractDate)
                .approvedAt(contractDate)
                .createdAt(contractDate)
                .build();
            contract.getStages().add(ContractStage.builder()
                .contract(contract).stage(Contract.Status.ACTIVE)
                .note("Hợp đồng tự động có hiệu lực. Đã lock Escrow 720,000,000 VND (100%). Ký quỹ nhà thầu: 36,000,000 VND.")
                .performedBy("Nguyễn Thị Lan").createdAt(contractDate).build());
            Contract savedContract = contractRepository.save(contract);

            // Cập nhật ví: lock tiền
            walletRepository.findByUserId(c1.getId()).ifPresent(w -> {
                w.setLockedAmount(w.getLockedAmount() + escrow);
                walletRepository.save(w);
            });
            walletRepository.findByUserId(ctr1.getId()).ifPresent(w -> {
                w.setLockedAmount(w.getLockedAmount() + kyQuy);
                walletRepository.save(w);
            });

            // Nhật ký thi công — 3 cập nhật tiến độ thực tế
            constructionLogRepository.save(ConstructionLog.builder()
                .contract(savedContract).contractor(ctr1)
                .progressPercent(15).phaseLabel("Khởi công")
                .description("Đã hoàn thành: tháo dỡ nội thất cũ, vệ sinh mặt bằng, đo đạc lại hiện trạng. " +
                             "Đặt hàng vật liệu: gỗ teak nhập khẩu, đá onyx, vải linen. ETA: 7 ngày.")
                .imageUrls("[\"https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400\"," +
                            "\"https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=400\"]")
                .createdAt(contractDate.plusDays(3)).build());

            constructionLogRepository.save(ConstructionLog.builder()
                .contract(savedContract).contractor(ctr1)
                .progressPercent(35).phaseLabel("Thi công thô")
                .description("Đã hoàn thành: lắp khung xương tủ bếp, khung tường thạch cao phòng ngủ master, " +
                             "đi dây điện âm tường cho hệ Smart Home, thi công sàn gỗ khu phòng khách (80%). " +
                             "Vật liệu gỗ teak đã về, đang gia công theo bản vẽ.")
                .imageUrls("[\"https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400\"," +
                            "\"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400\"," +
                            "\"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400\"]")
                .createdAt(contractDate.plusDays(18)).build());

            constructionLogRepository.save(ConstructionLog.builder()
                .contract(savedContract).contractor(ctr1)
                .progressPercent(55).phaseLabel("Thi công thô")
                .description("Đã hoàn thành: lắp đặt toàn bộ tủ bếp (trên + dưới + đảo bếp), " +
                             "ốp đá onyx đầu giường master, lắp tủ quần áo walk-in (khung), " +
                             "thi công sàn gỗ toàn bộ. Đang: hoàn thiện phòng ngủ phụ 1.")
                .imageUrls("[\"https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400\"," +
                            "\"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400\"," +
                            "\"https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400\"," +
                            "\"https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400\"]")
                .createdAt(contractDate.plusDays(32)).build());

            // Yêu cầu giải ngân giai đoạn 1 (đã duyệt)
            DisbursementRequest disbursement1 = DisbursementRequest.builder()
                .contract(savedContract).contractor(ctr1)
                .phaseLabel("Khởi công (20%)").phaseThreshold(20)
                .amount(144_000_000L)          // 20% × 720M
                .immediateRatio(0.40)
                .immediateAmount(57_600_000L)  // 40% của 144M
                .lockedAmount(86_400_000L)     // 60% locked
                .progressAtRequest(35)
                .note("Đã hoàn thành thi công thô (35%). Yêu cầu giải ngân milestone Khởi công 20%. " +
                      "Kèm theo hóa đơn vật liệu và biên bản nghiệm thu thô.")
                .status(DisbursementRequest.Status.APPROVED)
                .adminVerified(true).adminVerifiedAt(LocalDateTime.now().minusDays(10))
                .createdAt(contractDate.plusDays(20))
                .reviewedAt(contractDate.plusDays(22))
                .build();
            disbursementRequestRepository.save(disbursement1);

            // Yêu cầu giải ngân giai đoạn 2 (đang chờ duyệt)
            DisbursementRequest disbursement2 = DisbursementRequest.builder()
                .contract(savedContract).contractor(ctr1)
                .phaseLabel("Thi công thô (50%)").phaseThreshold(50)
                .amount(216_000_000L)          // (50% - 20%) × 720M = 30% thêm
                .immediateRatio(0.40)
                .immediateAmount(86_400_000L)
                .lockedAmount(129_600_000L)
                .progressAtRequest(55)
                .note("Đã đạt 55% tiến độ, hoàn thành giai đoạn thi công thô. " +
                      "Yêu cầu giải ngân milestone 50%. Kèm ảnh và biên bản.")
                .status(DisbursementRequest.Status.PENDING)
                .adminVerified(false)
                .createdAt(contractDate.plusDays(33))
                .build();
            disbursementRequestRepository.save(disbursement2);
        }

        // ── Hợp đồng COMPLETED — studio 38m² ─────────────────
        if (inProgressProjects.size() > 1) {
            Project studio = inProgressProjects.get(1);
            LocalDateTime completedDate = LocalDateTime.now().minusMonths(1);

            Bid completedBid = bidRepository.save(Bid.builder()
                .project(studio).contractor(ctr3)
                .totalPrice(95_000_000L).estimatedDays(25)
                .message("Việt Long — chuyên gia tối ưu không gian nhỏ. Smart living solutions.")
                .warrantyMonths(12).status(Bid.Status.ACCEPTED)
                .createdAt(completedDate.minusDays(10)).build());

            long escrow2  = 95_000_000L;
            long kyQuy2   = Math.round(escrow2 * 0.05);
            long platFee  = Math.round(escrow2 * 0.05);
            long warranty2= Math.round(escrow2 * 0.05);

            Contract completedContract = contractRepository.save(Contract.builder()
                .project(studio).bid(completedBid)
                .client(c2).contractor(ctr3)
                .contractNumber("CTR-COMPLETED-" + completedBid.getId())
                .agreedPrice(escrow2).originalAgreedPrice(escrow2)
                .estimatedDays(25)
                .terms("Hợp đồng thi công studio 38m² — The Sun Avenue Q.2\nĐã hoàn thành.")
                .status(Contract.Status.COMPLETED)
                .customerDepositAmount(escrow2).customerDepositLocked(false)
                .contractorDepositAmount(kyQuy2).contractorDepositLocked(false)
                .clientSigned(true).contractorSigned(true)
                .warrantyHoldAmount(warranty2).warrantyHoldLocked(true)
                .warrantyEndDate(completedDate.plusMonths(6))
                .warrantyReleased(false)
                .completedAt(completedDate)
                .approvedAt(completedDate.minusDays(5))
                .createdAt(completedDate.minusDays(10))
                .build());

            // Cập nhật dự án
            studio.setStatus(Project.Status.COMPLETED);
            projectRepository.save(studio);

            // Nhật ký hoàn chỉnh
            constructionLogRepository.save(ConstructionLog.builder()
                .contract(completedContract).contractor(ctr3)
                .progressPercent(100).phaseLabel("Bàn giao")
                .description("Hoàn thành toàn bộ. Đã lắp đặt: giường Murphy + sofa tích hợp, " +
                             "bếp mini, bàn làm việc gấp, tủ lưu trữ âm tường, đèn Smart LED. " +
                             "Bàn giao mặt bằng sạch, hướng dẫn sử dụng smart home.")
                .imageUrls("[\"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400\"," +
                            "\"https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400\"]")
                .createdAt(completedDate.minusDays(2)).build());

            log.info(">>> Completed contract seeded ✓");
        }

        log.info(">>> Bids & Contracts seeded ✓");
    }

    private List<BidDetail> buildBidDetails(Bid bid, Object[][] rows) {
        List<BidDetail> details = new ArrayList<>();
        for (Object[] r : rows) {
            String name = (String) r[0]; String unit = (String) r[1];
            double qty  = (Double) r[2]; long unitPrice = (Long) r[3];
            details.add(BidDetail.builder()
                .bid(bid).itemName(name).unit(unit)
                .quantity(qty).unitPrice(unitPrice)
                .totalPrice(Math.round(qty * unitPrice)).build());
        }
        return details;
    }


    // ════════════════════════════════════════════════════════════
    // 7. ORDERS — 14 đơn hàng đủ loại và trạng thái
    // ════════════════════════════════════════════════════════════
    private void seedOrders() {
        if (orderRepository.count() > 0) { log.info(">>> Orders already seeded, skipping."); return; }
        User c1 = u("khachhang1@test.com");
        User c2 = u("khachhang2@test.com");
        User c3 = u("khachhang3@test.com");

        List<Product> all = productRepository.findByActiveTrueOrderByCreatedAtDesc();
        if (all.isEmpty()) return;

        Product sofa     = cat(all,"SOFA");
        Product table    = cat(all,"TABLE");
        Product chair    = cat(all,"CHAIR");
        Product bed      = cat(all,"BED");
        Product cabinet  = cat(all,"CABINET");
        Product decor    = cat(all,"DECOR");

        // ── CATALOG Orders ────────────────────────────────────

        // 1. PENDING — chờ admin xác nhận (vừa đặt)
        saveOrder(c1, Order.OrderType.CATALOG, Order.Status.PENDING,
            "Vinhomes Central Park, Q.Bình Thạnh, TP.HCM", "0901234561",
            "Giao giờ hành chính, gọi trước 30 phút. Thang máy tải hàng tầng B1.", null,
            LocalDateTime.now().minusHours(2),
            List.of(item(sofa,1), item(decor,2)));

        // 2. CONFIRMED — đã xác nhận, chuẩn bị sản xuất
        saveOrder(c1, Order.OrderType.CATALOG, Order.Status.CONFIRMED,
            "Vinhomes Central Park, Q.Bình Thạnh, TP.HCM", "0901234561",
            "Đặt trước cho căn hộ mới bàn giao tháng 8.", "Đã xác nhận đơn. Dự kiến giao 15-18/7.",
            LocalDateTime.now().minusDays(2),
            List.of(item(bed,1), item(cabinet,1)));

        // 3. PROCESSING — đang sản xuất
        saveOrder(c2, Order.OrderType.CATALOG, Order.Status.PROCESSING,
            "Masteri Thảo Điền, Q.2, TP.HCM", "0901234562",
            null, "Đang sản xuất sofa theo màu xám tro đặc biệt, ETA 5 ngày.",
            LocalDateTime.now().minusDays(8),
            List.of(item(sofa,1), item(table,1)));

        // 4. PROCESSING — thêm 1 đơn nữa cho chart
        saveOrder(c1, Order.OrderType.CATALOG, Order.Status.PROCESSING,
            "Vinhomes Central Park, TP.HCM", "0901234561",
            "Bàn ăn cần lắp ráp tại nhà.", "Hoàn thiện mặt bàn gỗ óc chó, giao 3 ngày nữa.",
            LocalDateTime.now().minusDays(12),
            List.of(item(table,1), item(chair,1)));

        // 5. SHIPPED — đang giao
        saveOrder(c3, Order.OrderType.CATALOG, Order.Status.SHIPPED,
            "Vinhomes Riverside, Long Biên, Hà Nội", "0901234563",
            "Chú ý: địa chỉ cần có xe tải nhỏ vào đường ngách.", "Đã bàn giao cho Giao Hàng Nhanh, tracking: GHN-8823411.",
            LocalDateTime.now().minusDays(18),
            List.of(item(bed,1)));

        // 6. DELIVERED — hoàn thành tháng này (doanh thu tháng 6)
        saveOrderDelivered(c2, "Masteri Thảo Điền, Q.2, TP.HCM", "0901234562",
            LocalDateTime.now().minusDays(25),
            List.of(item(cabinet,1), item(decor,3)));

        // 7. DELIVERED — tháng trước (doanh thu tháng 5 — chart)
        saveOrderDelivered(c1, "Vinhomes Central Park, TP.HCM", "0901234561",
            LocalDateTime.now().minusMonths(1).minusDays(8),
            List.of(item(sofa,1), item(table,1), item(decor,2)));

        // 8. DELIVERED — 2 tháng trước (chart tháng 4)
        saveOrderDelivered(c3, "Vinhomes Riverside, Hà Nội", "0901234563",
            LocalDateTime.now().minusMonths(2).minusDays(3),
            List.of(item(bed,1), item(cabinet,1)));

        // 9. DELIVERED — 3 tháng trước (chart tháng 3)
        saveOrderDelivered(c1, "Vinhomes Central Park, TP.HCM", "0901234561",
            LocalDateTime.now().minusMonths(3).minusDays(12),
            List.of(item(sofa,1), item(chair,2)));

        // 10. CANCELLED — hủy bởi khách
        saveOrder(c2, Order.OrderType.CATALOG, Order.Status.CANCELLED,
            "Masteri Thảo Điền, Q.2, TP.HCM", "0901234562",
            "Hủy do đổi thiết kế, chọn màu khác.", null,
            LocalDateTime.now().minusDays(30),
            List.of(item(cabinet,1)));

        // ── CUSTOM Orders ─────────────────────────────────────

        // 11. CUSTOM - PENDING (đặt thiết kế nội thất tùy chỉnh)
        saveCustomOrder(c1, "Vinhomes Central Park, TP.HCM", "0901234561",
            "Tủ quần áo âm tường walk-in cho phòng ngủ master, kích thước 3.6m × 2.6m × 60cm sâu. " +
            "Yêu cầu: gỗ MDF phủ veneer óc chó, cánh mở êm, ray giảm chấn Blum, đèn LED bên trong, " +
            "ngăn kéo lụa cho phụ kiện, thanh treo 2 tầng, ô giày 20 đôi. Màu: nâu óc chó + tay nắm inox.",
            LocalDateTime.now().minusHours(6));

        // 12. CUSTOM - OPEN_BIDDING (đang nhận báo giá nhà thầu)
        saveCustomOrderStatus(c2, "Masteri Thảo Điền, Q.2, TP.HCM", "0901234562",
            Order.Status.OPEN_BIDDING,
            "Sofa 4 chỗ tùy chỉnh cho phòng khách góc 12m². Yêu cầu chân chữ L đặc biệt: " +
            "cánh trái 280cm × cánh phải 180cm. Vải bọc: velvet màu sage green (xanh lá nhạt). " +
            "Đệm ngồi mút D40 dày 12cm, đệm tựa mút D30 dày 15cm. Chân gỗ sồi màu walnut. " +
            "Kèm 4 gối trang trí vải linen kem. Giao tháng 8/2026.",
            LocalDateTime.now().minusDays(4));

        // 13. CUSTOM từ Designer 2D — đầy đủ BOM
        saveCustomOrder(c3, "Vinhomes Riverside, Long Biên, Hà Nội", "0901234563",
            "THIẾT KẾ 2D TỪ FURNITURE DESIGNER\n\n" +
            "Phòng khách 600×450cm, trần cao 3.2m\n\n" +
            "VẬT PHẨM ĐÃ ĐẶT:\n" +
            "• Sofa góc L (320×200cm) — Vải velvet xanh đậm\n" +
            "• Bàn cà phê oval đá marble (120×70cm)\n" +
            "• Kệ tivi âm tường 2.4m — Gỗ óc chó + vân trắng\n" +
            "• 2 ghế bành Accent — Vải boucle trắng\n\n" +
            "VẬT LIỆU (BOM):\n" +
            "• Gỗ MDF chống ẩm: 8 tấm 1220×2440mm\n" +
            "• Veneer óc chó: 6m²\n" +
            "• Vải Velvet xanh: 8.5m\n" +
            "• Đá marble nhân tạo Calacatta: 0.9m²\n" +
            "• Chân inox đen: 4 bộ\n\n" +
            "GHI CHÚ: Ưu tiên nhà thầu có kinh nghiệm thi công Hà Nội, giao trong 30 ngày.",
            LocalDateTime.now().minusDays(1));

        // 14. CUSTOM - PROCESSING (đã chọn nhà thầu, đang thi công)
        saveCustomOrderStatus(c1, "Vinhomes Central Park, TP.HCM", "0901234561",
            Order.Status.PROCESSING,
            "Bàn bếp đảo (kitchen island) kích thước 180×90cm, mặt đá granite đen Galaxy, " +
            "bên dưới 4 ngăn kéo lụa + 2 cửa tủ. Chân gỗ sồi chân vát 45°. Bản vẽ kỹ thuật đã duyệt.",
            LocalDateTime.now().minusDays(14));

        log.info(">>> Orders seeded ✓");
    }

    private record ItemSeed(Product product, int qty) {}
    private ItemSeed item(Product p, int qty) { return new ItemSeed(p, qty); }
    private Product cat(List<Product> all, String cat) {
        return all.stream().filter(p -> cat.equals(p.getCategory())).findFirst().orElse(all.get(0));
    }

    private void saveOrder(User customer, Order.OrderType type, Order.Status status,
                            String addr, String phone, String note, String procNote,
                            LocalDateTime created, List<ItemSeed> items) {
        Order order = Order.builder()
            .customer(customer).type(type).status(status)
            .deliveryAddress(addr).contactPhone(phone).customerNote(note)
            .processingNote(procNote)
            .confirmedAt(status != Order.Status.PENDING && status != Order.Status.CANCELLED ? created.plusHours(3) : null)
            .createdAt(created).build();
        List<OrderItem> ois = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        for (ItemSeed s : items) {
            BigDecimal sub = s.product().getPrice().multiply(BigDecimal.valueOf(s.qty()));
            ois.add(OrderItem.builder().order(order).product(s.product())
                .itemName(s.product().getName()).imageUrl(s.product().getImageUrl())
                .quantity(s.qty()).unitPrice(s.product().getPrice()).subtotal(sub).build());
            total = total.add(sub);
        }
        order.setItems(ois); order.setTotalAmount(total);
        Order saved = orderRepository.save(order);
        saved.setOrderCode("ORD-" + created.format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + saved.getId());
        orderRepository.save(saved);
    }

    private void saveOrderDelivered(User customer, String addr, String phone,
                                     LocalDateTime created, List<ItemSeed> items) {
        Order order = Order.builder()
            .customer(customer).type(Order.OrderType.CATALOG).status(Order.Status.DELIVERED)
            .deliveryAddress(addr).contactPhone(phone)
            .confirmedAt(created.plusHours(3)).deliveredAt(created.plusDays(7))
            .fullyPaid(true).createdAt(created).build();
        List<OrderItem> ois = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        for (ItemSeed s : items) {
            BigDecimal sub = s.product().getPrice().multiply(BigDecimal.valueOf(s.qty()));
            ois.add(OrderItem.builder().order(order).product(s.product())
                .itemName(s.product().getName()).imageUrl(s.product().getImageUrl())
                .quantity(s.qty()).unitPrice(s.product().getPrice()).subtotal(sub).build());
            total = total.add(sub);
        }
        order.setItems(ois); order.setTotalAmount(total);
        Order saved = orderRepository.save(order);
        saved.setOrderCode("ORD-" + created.format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + saved.getId());
        orderRepository.save(saved);
    }

    private void saveCustomOrder(User customer, String addr, String phone,
                                  String customReq, LocalDateTime created) {
        saveCustomOrderStatus(customer, addr, phone, Order.Status.PENDING, customReq, created);
    }

    private void saveCustomOrderStatus(User customer, String addr, String phone,
                                        Order.Status status, String customReq, LocalDateTime created) {
        Order order = Order.builder()
            .customer(customer).type(Order.OrderType.CUSTOM).status(status)
            .deliveryAddress(addr).contactPhone(phone).customRequirements(customReq)
            .totalAmount(BigDecimal.ZERO).createdAt(created).build();
        String short_ = customReq != null && customReq.length() > 200 ? customReq.substring(0,200)+"..." : customReq;
        order.setItems(List.of(OrderItem.builder().order(order)
            .itemName("Sản phẩm tùy chỉnh theo yêu cầu")
            .quantity(1).unitPrice(BigDecimal.ZERO).subtotal(BigDecimal.ZERO).customNote(short_).build()));
        Order saved = orderRepository.save(order);
        saved.setOrderCode("ORD-" + created.format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + saved.getId());
        orderRepository.save(saved);
    }


    // ════════════════════════════════════════════════════════════
    // 8. NOTIFICATIONS — thông báo phong phú cho cả 3 role
    // ════════════════════════════════════════════════════════════
    private void seedNotifications() {
        if (notificationRepository.count() > 0) {
            log.info(">>> Notifications already seeded, skipping.");
            return;
        }
        User admin = u("admin@constructx.com");
        User c1    = u("khachhang1@test.com");
        User c2    = u("khachhang2@test.com");
        User c3    = u("khachhang3@test.com");
        User ctr1  = u("nhathauchuyennghiep@test.com");
        User ctr2  = u("nhaxuong_abc@test.com");
        User ctr3  = u("noithat_vietlong@test.com");

        List<Notification> notifs = new ArrayList<>();

        // ── Admin notifications ──────────────────────────────
        notifs.add(n(admin, "🔔 Có 2 dự án mới chờ bạn phê duyệt (Spa 150m² và nhà hàng Hà Nội)",
            Notification.NotifType.SYSTEM, LocalDateTime.now().minusMinutes(30)));
        notifs.add(n(admin, "💰 Yêu cầu giải ngân milestone 50% của HĐ CTR-penthouse đang chờ xác minh — 216,000,000 VND",
            Notification.NotifType.MILESTONE_REQUEST, LocalDateTime.now().minusHours(1)));
        notifs.add(n(admin, "👤 Nhà thầu mới 'Đức Thành Furniture' đăng ký chờ phê duyệt",
            Notification.NotifType.SYSTEM, LocalDateTime.now().minusHours(2)));
        notifs.add(n(admin, "📦 3 đơn hàng CATALOG đang ở trạng thái PENDING cần xác nhận",
            Notification.NotifType.SYSTEM, LocalDateTime.now().minusHours(3)));
        notifs.add(n(admin, "✅ Hợp đồng studio 38m² đã hoàn thành — đã thu phí nền tảng 4,750,000 VND",
            Notification.NotifType.PAYMENT_SUCCESS, LocalDateTime.now().minusDays(1)));
        notifs.add(n(admin, "🏗️ Dự án penthouse The Landmark 81 đang thi công — 55% tiến độ",
            Notification.NotifType.SYSTEM, LocalDateTime.now().minusDays(2)));
        notifs.add(n(admin, "💳 Yêu cầu rút tiền 45,000,000 VND từ Nguyễn Thị Lan đang chờ duyệt",
            Notification.NotifType.PAYMENT_SUCCESS, LocalDateTime.now().minusDays(3)));

        // ── Customer 1 (Nguyễn Thị Lan) ─────────────────────
        notifs.add(n(c1, "🎉 Hợp đồng CTR-Penthouse đã ACTIVE! Đã lock Escrow 720,000,000 VND. Nhà thầu bắt đầu thi công.",
            Notification.NotifType.SYSTEM, LocalDateTime.now().minusDays(45)));
        notifs.add(n(c1, "📸 Nhà thầu Minh Phú cập nhật tiến độ 55% — lắp đặt tủ bếp và đá onyx đầu giường",
            Notification.NotifType.DESIGN_UPDATED, LocalDateTime.now().minusDays(13)));
        notifs.add(n(c1, "💰 Nhà thầu Minh Phú gửi yêu cầu giải ngân milestone 50% — 216,000,000 VND. Vui lòng xem xét.",
            Notification.NotifType.MILESTONE_REQUEST, LocalDateTime.now().minusDays(1)));
        notifs.add(n(c1, "✅ Đã duyệt giải ngân milestone Khởi công (20%) — 144,000,000 VND đã chuyển cho nhà thầu",
            Notification.NotifType.PAYMENT_SUCCESS, LocalDateTime.now().minusDays(23)));
        notifs.add(n(c1, "📦 Dự án Vinhomes 75m² của bạn đã nhận được 3 báo giá. Vào xem và chọn nhà thầu!",
            Notification.NotifType.BID_RECEIVED, LocalDateTime.now().minusDays(2)));
        notifs.add(n(c1, "🛍️ Đơn hàng ORD-sofa+decor của bạn đã được xác nhận. Dự kiến giao trong 7 ngày.",
            Notification.NotifType.SYSTEM, LocalDateTime.now().minusHours(1)));
        notifs.add(n(c1, "📋 Đơn hàng tùy chỉnh (Tủ walk-in) đang chờ Admin duyệt để mở đấu giá",
            Notification.NotifType.SYSTEM, LocalDateTime.now().minusHours(5)));

        // ── Customer 2 (Trần Văn Minh) ──────────────────────
        notifs.add(n(c2, "✅ Hợp đồng studio 38m² đã HOÀN THÀNH xuất sắc! Nhà thầu Việt Long đã bàn giao.",
            Notification.NotifType.PAYMENT_SUCCESS, LocalDateTime.now().minusMonths(1)));
        notifs.add(n(c2, "⭐ Hãy đánh giá nhà thầu Nội thất Việt Long sau khi nghiệm thu dự án studio",
            Notification.NotifType.SYSTEM, LocalDateTime.now().minusMonths(1).plusDays(1)));
        notifs.add(n(c2, "📦 Đơn hàng sofa+bàn ăn đang sản xuất. ETA còn 5 ngày.",
            Notification.NotifType.DESIGN_UPDATED, LocalDateTime.now().minusDays(3)));
        notifs.add(n(c2, "🔔 Đơn hàng CUSTOM sofa góc chữ L đang nhận báo giá từ nhà thầu. Có 2 báo giá mới!",
            Notification.NotifType.BID_RECEIVED, LocalDateTime.now().minusDays(1)));

        // ── Customer 3 (Phạm Thị Hoa — Hà Nội) ─────────────
        notifs.add(n(c3, "🚚 Đơn hàng giường King Size của bạn đang trên đường giao — GHN-8823411",
            Notification.NotifType.SYSTEM, LocalDateTime.now().minusDays(2)));
        notifs.add(n(c3, "📋 Dự án thiết kế 2D phòng khách 600×450cm đang chờ Admin duyệt",
            Notification.NotifType.SYSTEM, LocalDateTime.now().minusDays(1)));
        notifs.add(n(c3, "🔔 Dự án biệt thự Vinhomes Riverside của bạn đã được duyệt và đang nhận thầu!",
            Notification.NotifType.SYSTEM, LocalDateTime.now().minusDays(1)));

        // ── Contractor 1 — Minh Phú ──────────────────────────
        notifs.add(n(ctr1, "🎯 Báo giá HĐ penthouse 720,000,000 VND đã được CHẤP NHẬN! Hợp đồng đã ACTIVE.",
            Notification.NotifType.SYSTEM, LocalDateTime.now().minusDays(45)));
        notifs.add(n(ctr1, "✅ Yêu cầu giải ngân milestone 20% đã được duyệt — 57,600,000 VND có thể rút ngay",
            Notification.NotifType.PAYMENT_SUCCESS, LocalDateTime.now().minusDays(23)));
        notifs.add(n(ctr1, "🔔 Dự án mới phù hợp chuyên môn: 'Phòng khách biệt thự 60m² Châu Âu cổ điển' — ngân sách 350-600M",
            Notification.NotifType.SYSTEM, LocalDateTime.now().minusDays(1)));
        notifs.add(n(ctr1, "📦 Dự án Vinhomes 75m² đang có 3 báo giá cạnh tranh. Hãy xem lại báo giá của bạn!",
            Notification.NotifType.BID_RECEIVED, LocalDateTime.now().minusHours(6)));
        notifs.add(n(ctr1, "⏰ Yêu cầu giải ngân milestone 50% đang chờ Admin xác minh",
            Notification.NotifType.MILESTONE_REQUEST, LocalDateTime.now().minusHours(12)));

        // ── Contractor 2 — Xưởng Mộc ABC ────────────────────
        notifs.add(n(ctr2, "🔔 Dự án mới: 'Cải tạo phòng bếp Times City 22m²' tại Hà Nội — phù hợp chuyên môn của bạn",
            Notification.NotifType.SYSTEM, LocalDateTime.now().minusDays(6)));
        notifs.add(n(ctr2, "📋 Báo giá của bạn cho dự án Vinhomes 75m² đã được khách hàng xem",
            Notification.NotifType.BID_RECEIVED, LocalDateTime.now().minusDays(2)));
        notifs.add(n(ctr2, "🎯 Đơn hàng CUSTOM mới cần báo giá: Sofa góc chữ L theo yêu cầu tại Q.2, TP.HCM",
            Notification.NotifType.SYSTEM, LocalDateTime.now().minusDays(3)));
        notifs.add(n(ctr2, "💡 Hoàn thiện hồ sơ năng lực để tăng tỷ lệ được chọn lên 40%",
            Notification.NotifType.SYSTEM, LocalDateTime.now().minusDays(7)));

        // ── Contractor 3 — Việt Long ─────────────────────────
        notifs.add(n(ctr3, "🏆 Hợp đồng studio 38m² hoàn thành xuất sắc! Khách hàng đánh giá 5 sao.",
            Notification.NotifType.PAYMENT_SUCCESS, LocalDateTime.now().minusMonths(1).plusDays(1)));
        notifs.add(n(ctr3, "💰 Đã nhận 90,250,000 VND thanh toán hợp đồng studio. Bảo hành 4,750,000 VND locked 6 tháng.",
            Notification.NotifType.PAYMENT_SUCCESS, LocalDateTime.now().minusMonths(1)));
        notifs.add(n(ctr3, "🔔 Dự án mới tại Hà Nội: 'Phòng khách biệt thự 60m²' ngân sách 350-600M — phù hợp portfolio của bạn",
            Notification.NotifType.SYSTEM, LocalDateTime.now().minusDays(1)));
        notifs.add(n(ctr3, "📦 Đơn hàng CUSTOM sofa tùy chỉnh Q.2 đang mở đấu giá — gửi báo giá ngay!",
            Notification.NotifType.SYSTEM, LocalDateTime.now().minusDays(3)));

        notificationRepository.saveAll(notifs);
        log.info(">>> {} notifications seeded ✓", notifs.size());
    }

    private Notification n(User user, String content, Notification.NotifType type, LocalDateTime created) {
        return Notification.builder()
            .user(user).content(content).type(type)
            .isRead(false).createdAt(created).build();
    }

    // ── Helpers ──────────────────────────────────────────────────
    private User u(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("[DataSeeder] User not found: " + email));
    }
}
