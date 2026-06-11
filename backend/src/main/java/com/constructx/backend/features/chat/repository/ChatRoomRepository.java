package com.constructx.backend.features.chat.repository;

import com.constructx.backend.features.chat.entity.ChatMessage;
import com.constructx.backend.features.chat.entity.ChatRoom;
import com.constructx.backend.features.chat.entity.ChatRoomMember;
import com.constructx.backend.features.chat.enums.RoomType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    @Query("SELECT cr FROM ChatRoom cr JOIN cr.members m WHERE m.userId = :userId " +
            "AND cr.isArchived = false ORDER BY cr.updatedAt DESC")
    Page<ChatRoom> findRoomsByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT cr FROM ChatRoom cr WHERE cr.referenceType = :refType " +
            "AND cr.referenceId = :refId AND cr.roomType = :roomType")
    Optional<ChatRoom> findByReference(
            @Param("refType") String referenceType,
            @Param("refId") Long referenceId,
            @Param("roomType") RoomType roomType
    );

    // Admin: Lấy tất cả phòng chat đang active
    @Query("SELECT cr FROM ChatRoom cr WHERE cr.isArchived = false ORDER BY cr.updatedAt DESC")
    Page<ChatRoom> findAllActiveRooms(Pageable pageable);

    // Tìm phòng chat có từ khóa nhạy cảm (chống bypass fee)
    @Query(value = "SELECT DISTINCT cr.* FROM chat_rooms cr " +
            "JOIN chat_messages cm ON cr.id = cm.room_id " +
            "WHERE cm.content REGEXP :pattern", nativeQuery = true)
    List<ChatRoom> findRoomsWithSensitiveKeywords(@Param("pattern") String pattern);
}

