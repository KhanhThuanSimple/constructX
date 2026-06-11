package com.constructx.backend.features.chat.repository;

import com.constructx.backend.features.chat.entity.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    Page<ChatMessage> findByRoomId(Long roomId, Pageable pageable);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.room.id = :roomId AND m.id > :lastReadMessageId")
    Long countUnreadMessages(@Param("roomId") Long roomId, @Param("lastReadMessageId") Long lastReadMessageId);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.room.id = :roomId")
    Long countByRoomId(@Param("roomId") Long roomId);

    @Query("SELECT m FROM ChatMessage m WHERE m.room.id = :roomId AND LOWER(m.content) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<ChatMessage> searchMessages(@Param("roomId") Long roomId, @Param("keyword") String keyword, Pageable pageable);
}