package com.constructx.backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.Statement;

/**
 * Chay migration SQL mot lan khi startup de sua cac constraint NOT NULL
 * ma Hibernate ddl-auto:update khong tu dong thay doi.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Order(1)
public class SchemaMigration {

    private final DataSource dataSource;

    @EventListener(ApplicationReadyEvent.class)
    public void runMigrations() {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {

            // 1. Sua bid_id thanh nullable trong bang contracts
            if (isColumnNotNull(conn, "contracts", "bid_id")) {
                stmt.execute("ALTER TABLE contracts MODIFY COLUMN bid_id BIGINT(20) NULL");
                log.info("[Migration] contracts.bid_id: NOT NULL -> NULL");
            }

            // 2. Sua project_id thanh nullable trong bang contracts
            if (isColumnNotNull(conn, "contracts", "project_id")) {
                stmt.execute("ALTER TABLE contracts MODIFY COLUMN project_id BIGINT(20) NULL");
                log.info("[Migration] contracts.project_id: NOT NULL -> NULL");
            }

            // 3. Them cot order_id neu chua co
            if (!columnExists(conn, "contracts", "order_id")) {
                stmt.execute("ALTER TABLE contracts ADD COLUMN order_id BIGINT(20) NULL");
                log.info("[Migration] contracts.order_id: column added");
            }

            // 4. Hibernate se tu dong mapping qua @JoinColumn(name = "order_id")

            // 5. Sua disbursement_requests: bo cot gross_amount NOT NULL neu ton tai
            if (isColumnNotNull(conn, "disbursement_requests", "gross_amount")) {
                stmt.execute("ALTER TABLE disbursement_requests MODIFY COLUMN gross_amount BIGINT(20) NULL DEFAULT 0");
                log.info("[Migration] disbursement_requests.gross_amount: NOT NULL -> NULL");
            }

            // 6. Admin-verify columns trong disbursement_requests
            if (!columnExists(conn, "disbursement_requests", "admin_verified")) {
                stmt.execute("ALTER TABLE disbursement_requests ADD COLUMN admin_verified TINYINT(1) NOT NULL DEFAULT 0");
                log.info("[Migration] disbursement_requests.admin_verified: column added");
            }
            if (!columnExists(conn, "disbursement_requests", "admin_verified_at")) {
                stmt.execute("ALTER TABLE disbursement_requests ADD COLUMN admin_verified_at DATETIME(6) NULL");
                log.info("[Migration] disbursement_requests.admin_verified_at: column added");
            }
            if (!columnExists(conn, "disbursement_requests", "admin_verified_by")) {
                stmt.execute("ALTER TABLE disbursement_requests ADD COLUMN admin_verified_by BIGINT(20) NULL");
                log.info("[Migration] disbursement_requests.admin_verified_by: column added");
            }
            if (!columnExists(conn, "disbursement_requests", "admin_verify_note")) {
                stmt.execute("ALTER TABLE disbursement_requests ADD COLUMN admin_verify_note TEXT NULL");
                log.info("[Migration] disbursement_requests.admin_verify_note: column added");
            }

            // 7. Warranty hold columns trong bang contracts
            if (!columnExists(conn, "contracts", "warranty_hold_amount")) {
                stmt.execute("ALTER TABLE contracts ADD COLUMN warranty_hold_amount BIGINT(20) NULL DEFAULT 0");
                log.info("[Migration] contracts.warranty_hold_amount: column added");
            }
            if (!columnExists(conn, "contracts", "warranty_hold_locked")) {
                stmt.execute("ALTER TABLE contracts ADD COLUMN warranty_hold_locked TINYINT(1) NOT NULL DEFAULT 0");
                log.info("[Migration] contracts.warranty_hold_locked: column added");
            }
            if (!columnExists(conn, "contracts", "warranty_end_date")) {
                stmt.execute("ALTER TABLE contracts ADD COLUMN warranty_end_date DATETIME(6) NULL");
                log.info("[Migration] contracts.warranty_end_date: column added");
            }
            if (!columnExists(conn, "contracts", "warranty_released")) {
                stmt.execute("ALTER TABLE contracts ADD COLUMN warranty_released TINYINT(1) NOT NULL DEFAULT 0");
                log.info("[Migration] contracts.warranty_released: column added");
            }
            if (!columnExists(conn, "contracts", "client_confirmed_completion")) {
                stmt.execute("ALTER TABLE contracts ADD COLUMN client_confirmed_completion TINYINT(1) NOT NULL DEFAULT 0");
                log.info("[Migration] contracts.client_confirmed_completion: column added");
            }
            if (!columnExists(conn, "contracts", "completed_at")) {
                stmt.execute("ALTER TABLE contracts ADD COLUMN completed_at DATETIME(6) NULL");
                log.info("[Migration] contracts.completed_at: column added");
            }

            // 8. is_disputed column in contracts table
            if (!columnExists(conn, "contracts", "is_disputed")) {
                stmt.execute("ALTER TABLE contracts ADD COLUMN is_disputed TINYINT(1) NOT NULL DEFAULT 0");
                log.info("[Migration] contracts.is_disputed: column added");
            }

            // 9. chat_room_id column in disputes table
            if (!columnExists(conn, "disputes", "chat_room_id")) {
                stmt.execute("ALTER TABLE disputes ADD COLUMN chat_room_id BIGINT(20) NULL");
                log.info("[Migration] disputes.chat_room_id: column added");
            }

            // 9.1. contract_id column in disputes table
            if (!columnExists(conn, "disputes", "contract_id")) {
                stmt.execute("ALTER TABLE disputes ADD COLUMN contract_id BIGINT(20) NULL");
                log.info("[Migration] disputes.contract_id: column added");
            }

            // 9.5. Sua project_id thanh nullable trong bang disputes
            if (isColumnNotNull(conn, "disputes", "project_id")) {
                stmt.execute("ALTER TABLE disputes MODIFY COLUMN project_id BIGINT(20) NULL");
                log.info("[Migration] disputes.project_id: NOT NULL -> NULL");
            }

            // 10. quality_score, communication_score, progress_score in reviews table
            if (!columnExists(conn, "reviews", "quality_score")) {
                stmt.execute("ALTER TABLE reviews ADD COLUMN quality_score INT NULL");
                log.info("[Migration] reviews.quality_score: column added");
            }
            if (!columnExists(conn, "reviews", "communication_score")) {
                stmt.execute("ALTER TABLE reviews ADD COLUMN communication_score INT NULL");
                log.info("[Migration] reviews.communication_score: column added");
            }
            if (!columnExists(conn, "reviews", "progress_score")) {
                stmt.execute("ALTER TABLE reviews ADD COLUMN progress_score INT NULL");
                log.info("[Migration] reviews.progress_score: column added");
            }

            // 11. Create platform_wallets table
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS platform_wallets (
                    id BIGINT NOT NULL AUTO_INCREMENT,
                    balance BIGINT NOT NULL DEFAULT 0,
                    updated_at DATETIME(6) NULL,
                    PRIMARY KEY (id)
                )
            """);
            // Check if platform_wallets is empty, if so, insert the first row
            try (ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM platform_wallets")) {
                if (rs.next() && rs.getLong(1) == 0) {
                    stmt.execute("INSERT INTO platform_wallets (id, balance, updated_at) VALUES (1, 0, NOW())");
                    log.info("[Migration] platform_wallets: default row inserted");
                }
            }

            log.info("[Migration] Schema migration completed successfully.");

        } catch (Exception e) {
            log.warn("[Migration] Schema migration warning (non-fatal): {}", e.getMessage());
        }
    }

    private boolean isColumnNotNull(Connection conn, String table, String column) {
        try {
            DatabaseMetaData meta = conn.getMetaData();
            try (ResultSet rs = meta.getColumns(conn.getCatalog(), null, table, column)) {
                if (rs.next()) {
                    return "NO".equalsIgnoreCase(rs.getString("IS_NULLABLE"));
                }
            }
        } catch (Exception e) {
            log.debug("[Migration] isColumnNotNull check failed for {}.{}: {}", table, column, e.getMessage());
        }
        return false;
    }

    private boolean columnExists(Connection conn, String table, String column) {
        try {
            DatabaseMetaData meta = conn.getMetaData();
            try (ResultSet rs = meta.getColumns(conn.getCatalog(), null, table, column)) {
                return rs.next();
            }
        } catch (Exception e) {
            log.debug("[Migration] columnExists check failed for {}.{}: {}", table, column, e.getMessage());
        }
        return false;
    }
}
