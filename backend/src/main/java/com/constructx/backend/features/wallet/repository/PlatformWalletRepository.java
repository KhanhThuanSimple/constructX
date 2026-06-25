package com.constructx.backend.features.wallet.repository;

import com.constructx.backend.features.wallet.entity.PlatformWallet;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlatformWalletRepository extends JpaRepository<PlatformWallet, Long> {
}
