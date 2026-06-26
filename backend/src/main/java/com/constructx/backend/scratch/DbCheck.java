package com.constructx.backend.scratch;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class DbCheck {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/constructx_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
        String user = "root";
        String password = "";

        System.out.println("Connecting to database...");
        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            
            System.out.println("\n=== CONTRACTS TABLE ===");
            String queryContracts = "SELECT id, contract_number, status, is_disputed, agreed_price FROM contracts";
            try (ResultSet rs = stmt.executeQuery(queryContracts)) {
                int count = 0;
                while (rs.next()) {
                    count++;
                    System.out.printf("ID: %d | Num: %s | Status: %s | Disputed: %b | Price: %d%n",
                            rs.getLong("id"),
                            rs.getString("contract_number"),
                            rs.getString("status"),
                            rs.getBoolean("is_disputed"),
                            rs.getLong("agreed_price"));
                }
                System.out.println("Total contracts: " + count);
            }

            System.out.println("\n=== DISPUTES TABLE ===");
            String queryDisputes = "SELECT id, contract_id, amount, status, reason FROM disputes";
            try (ResultSet rs = stmt.executeQuery(queryDisputes)) {
                int count = 0;
                while (rs.next()) {
                    count++;
                    System.out.printf("ID: %d | ContractID: %d | Amount: %d | Status: %s | Reason: %s%n",
                            rs.getLong("id"),
                            rs.getLong("contract_id"),
                            rs.getLong("amount"),
                            rs.getString("status"),
                            rs.getString("reason"));
                }
                System.out.println("Total disputes: " + count);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
