package com.constructx.backend.features.chat.repository;


import com.constructx.backend.features.chat.entity.ChatRoomMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomMemberRepository extends JpaRepository<ChatRoomMember, Long> {

    Optional<ChatRoomMember> findByRoomIdAndUserId(Long roomId, Long userId);

    List<ChatRoomMember> findByRoomId(Long roomId);

    boolean existsByRoomIdAndUserId(Long roomId, Long userId);
}