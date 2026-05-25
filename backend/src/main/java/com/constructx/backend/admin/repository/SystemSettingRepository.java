package com.constructx.backend.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.constructx.backend.admin.entity.SystemSetting;

import java.util.Optional;

public interface SystemSettingRepository extends JpaRepository<SystemSetting, Long> {
    Optional<SystemSetting> findByKey(String key);
}