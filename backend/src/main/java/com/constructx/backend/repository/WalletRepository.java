package com.constructx.backend.repository;

import com.constructx.backend.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface WalletRepository extends JpaRepository<Wallet, Long> {
    Optional<Wallet> findByUserId(Long userId);
    
    @Query("SELECT COALESCE(SUM(w.lockedAmount), 0) FROM Wallet w")
    Long sumLockedAmount();
}
