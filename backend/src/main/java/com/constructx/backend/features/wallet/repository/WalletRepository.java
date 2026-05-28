package com.constructx.backend.features.wallet.repository;

import com.constructx.backend.features.wallet.entity.Wallet;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {

    Optional<Wallet> findByUserId(Long userId);

    @Modifying
    @Query("UPDATE Wallet w SET w.balance = w.balance + :amount, w.updatedAt = CURRENT_TIMESTAMP WHERE w.id = :walletId")
    int depositBalance(@Param("walletId") Long walletId, @Param("amount") Long amount);

    @Modifying
    @Query("UPDATE Wallet w SET w.lockedAmount = w.lockedAmount + :amount, w.updatedAt = CURRENT_TIMESTAMP " +
            "WHERE w.id = :walletId AND (w.balance - w.lockedAmount) >= :amount")
    int lockAmount(@Param("walletId") Long walletId, @Param("amount") Long amount);

    @Modifying
    @Query("UPDATE Wallet w SET w.balance = w.balance - :amount, w.lockedAmount = w.lockedAmount - :amount, w.updatedAt = CURRENT_TIMESTAMP " +
            "WHERE w.id = :walletId AND w.lockedAmount >= :amount AND w.balance >= :amount")
    int debitLockedAmount(@Param("walletId") Long walletId, @Param("amount") Long amount);

    @Modifying
    @Query("UPDATE Wallet w SET w.lockedAmount = w.lockedAmount - :amount, w.updatedAt = CURRENT_TIMESTAMP " +
            "WHERE w.id = :walletId AND w.lockedAmount >= :amount")
    int unlockAmount(@Param("walletId") Long walletId, @Param("amount") Long amount);
    @Query("""
        SELECT COALESCE(SUM(w.lockedAmount),0)
        FROM Wallet w
    """)
    Long sumLockedAmount();
    // Thêm hàm này để khóa row trong Database khi đọc dữ liệu tính toán số dư
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM Wallet w WHERE w.user.id = :userId")
    Optional<Wallet> findByUserIdForUpdate(Long userId);

}