package com.constructx.backend.features.wallet.repository;

import com.constructx.backend.features.wallet.entity.PlatformTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PlatformTransactionRepository extends JpaRepository<PlatformTransaction, Long> {
    List<PlatformTransaction> findAllByOrderByCreatedAtDesc();
}
