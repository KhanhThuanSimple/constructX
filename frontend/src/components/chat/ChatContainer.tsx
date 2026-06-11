// src/components/chat/ChatContainer.tsx
import React, { useEffect, useMemo } from 'react';
import { ChatSidebar } from './ChatSidebar';
import { ChatWindow } from './ChatWindow';
import { websocketService } from '../../services/WebSocketService';
import { useChatStore } from '../../store/chatStore';
import { useParams } from 'react-router-dom';
import { chatApi } from '../../services/chatapi';
import useAuthStore from '../../store/useAuthStore';

export const ChatContainer: React.FC = () => {
  const { setConnected, setCurrentRoom, rooms, setCurrentUserId, currentUserId } = useChatStore();
  const { roomId } = useParams<{ roomId?: string }>();
  const { user } = useAuthStore();

  // ── Set currentUserId đồng bộ ngay khi có user ──────────────────────
  // useMemo để coerce ngay trong render cycle, không đợi useEffect
  const resolvedUserId = useMemo(
    () => (user?.id != null ? Number(user.id) : null),
    [user?.id]
  );

  // Đồng bộ vào store (chạy trước render children nhờ React batch)
  useEffect(() => {
    if (resolvedUserId !== null && resolvedUserId !== currentUserId) {
      setCurrentUserId(resolvedUserId);
    }
  }, [resolvedUserId]);

  // ── Kết nối WebSocket ────────────────────────────────────────────────
  useEffect(() => {
    websocketService.connect(() => setConnected(true));
    return () => {
      websocketService.disconnect();
      setConnected(false);
    };
  }, []);

  // ── Auto-select room từ URL /chat/:roomId ────────────────────────────
  useEffect(() => {
    if (!roomId) return;
    const numId = parseInt(roomId, 10);
    if (isNaN(numId)) return;

    const existing = rooms.find((r) => r.id === numId);
    if (existing) {
      setCurrentRoom(existing);
      websocketService.subscribeToRoom(numId, (msg) =>
        useChatStore.getState().addMessage(msg)
      );
      return;
    }

    chatApi.getRooms().then((res) => {
      const allRooms = res.data.content || res.data || [];
      useChatStore.getState().setRooms(allRooms);
      const target = allRooms.find((r: any) => r.id === numId);
      if (target) {
        setCurrentRoom(target);
        websocketService.subscribeToRoom(numId, (msg) =>
          useChatStore.getState().addMessage(msg)
        );
      }
    }).catch(() => {});
  }, [roomId]);

  return (
    <div className="flex w-full h-full overflow-hidden bg-gray-100 relative">
      <ChatSidebar />
      <ChatWindow />
    </div>
  );
};
