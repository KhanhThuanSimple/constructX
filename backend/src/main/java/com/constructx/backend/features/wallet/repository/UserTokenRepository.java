package com.constructx.backend.features.wallet.repository;

import com.constructx.backend.features.wallet.entity.UserToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserTokenRepository extends JpaRepository<UserToken, Long> {

    // Tìm kiếm danh sách các thẻ ngân hàng đã liên kết thành công của một User
    List<UserToken> findByUserId(Long userId);

    // Tìm kiếm Token cụ thể xem đã từng được lưu vào hệ thống chưa (tránh trùng lặp)
    Optional<UserToken> findByVnpToken(String vnpToken);

    // Hủy liên kết thẻ (Xóa token khỏi hệ thống khi người dùng chọn xóa thẻ)
    void deleteByVnpToken(String vnpToken);
}