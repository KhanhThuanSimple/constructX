// src/components/chat/ChatWindow.tsx
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useChatStore } from '../../store/chatStore';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { websocketService } from '../../services/WebSocketService';
import { chatApi } from '../../services/chatapi';
import useAuthStore from '../../store/useAuthStore';
import {
  Users, MessageCircle, ShieldCheck, Scale, AlertTriangle, CheckCircle, ArrowDown,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ChatWindow: React.FC = () => {
  const { currentRoom, messages, typingUsers, setMessages, isConnected } = useChatStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Coerce ngay trong render — không delay useEffect
  const currentUserId: number | null = user?.id != null ? Number(user.id) : null;

  const messagesAreaRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);
  const prevLengthRef   = useRef(0);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason,    setReportReason]    = useState('');
  const [isReporting,     setIsReporting]     = useState(false);
  const [reportSuccess,   setReportSuccess]   = useState(false);

  // ── Scroll xuống cuối — dùng scrollIntoView sau khi DOM paint ─────────
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    requestAnimationFrame(() => {
      bottomAnchorRef.current?.scrollIntoView({ behavior, block: 'end' });
    });
  }, []);

  // ── Load lịch sử ──────────────────────────────────────────────────────
  const loadMessages = useCallback(async () => {
    if (!currentRoom) return;
    try {
      const res = await chatApi.getMessages(currentRoom.id, 0, 100);
      const raw: any[] = res.data.content || res.data || [];
      // Backend trả DESC → reverse: cũ trên, mới dưới
      setMessages([...raw].reverse());
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  }, [currentRoom?.id]);

  // Load + subscribe typing khi đổi phòng
  useEffect(() => {
    if (!currentRoom) return;
    loadMessages();
    let typingSub: any;
    websocketService
      .subscribeToTyping(currentRoom.id, (data) => {
        if (Number(data.userId) === currentUserId) return;
        if (data.isTyping) useChatStore.getState().setTypingUser(data.userId, data.userName);
        else               useChatStore.getState().removeTypingUser(data.userId);
      })
      .then((s) => { typingSub = s; });
    return () => { typingSub?.unsubscribe(); };
  }, [currentRoom?.id, isConnected]);

  // Scroll instant (không smooth) khi MỚI VÀO phòng (sau khi load xong)
  useEffect(() => {
    if (messages.length > 0 && prevLengthRef.current === 0) {
      scrollToBottom('auto');
    }
  }, [messages.length]);

  // Scroll smooth / hiện nút khi có TIN MỚI real-time
  useEffect(() => {
    if (messages.length === 0) return;
    const isNewMsg = messages.length > prevLengthRef.current;
    prevLengthRef.current = messages.length;
    if (!isNewMsg) return;

    const el = messagesAreaRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;

    if (nearBottom) {
      scrollToBottom('smooth');
      setShowScrollBtn(false);
    } else {
      setShowScrollBtn(true);
    }
  }, [messages.length]);

  // Reset prevLength khi đổi phòng
  useEffect(() => {
    prevLengthRef.current = 0;
    setShowScrollBtn(false);
  }, [currentRoom?.id]);

  // Ẩn nút khi user scroll xuống cuối
  const handleScroll = () => {
    const el = messagesAreaRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 80) {
      setShowScrollBtn(false);
    }
  };

  // Mark as read
  useEffect(() => {
    if (!currentRoom || messages.length === 0 || !isConnected) return;
    websocketService.markAsRead(currentRoom.id, messages[messages.length - 1].id);
  }, [messages.length, currentRoom?.id, isConnected]);

  // Báo cáo
  const handleReport = async () => {
    if (!reportReason.trim() || !currentRoom) return;
    setIsReporting(true);
    try {
      await chatApi.createSupportRoom(`[Báo cáo phòng #${currentRoom.id}] ${reportReason}`);
      setReportSuccess(true);
      setTimeout(() => {
        setShowReportModal(false); setReportSuccess(false); setReportReason('');
        navigate('/chat');
      }, 2000);
    } catch { alert('Không thể gửi báo cáo.'); }
    finally  { setIsReporting(false); }
  };

  // ── Empty state ────────────────────────────────────────────────────────
  if (!currentRoom) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 gap-4">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
          <MessageCircle className="text-blue-300" size={40} />
        </div>
        <div className="text-center">
          <p className="text-gray-500 font-medium">Chọn một cuộc trò chuyện</p>
          <p className="text-gray-400 text-sm mt-1">Tin nhắn sẽ hiển thị ở đây</p>
        </div>
      </div>
    );
  }

  const typingList  = Object.values(typingUsers);
  const onlineCount = currentRoom.members.filter((m) => m.isOnline).length;

  const ROOM_CFG: Record<string, { icon: React.ReactNode; badge: string; color: string }> = {
    SUPPORT: { icon: <ShieldCheck size={14} />,  badge: 'Hỗ trợ',     color: 'bg-blue-100 text-blue-700'    },
    DISPUTE: { icon: <Scale size={14} />,         badge: 'Tranh chấp', color: 'bg-red-100 text-red-700'      },
    DIRECT:  { icon: <MessageCircle size={14} />, badge: 'Trực tiếp',  color: 'bg-green-100 text-green-700'  },
    GROUP:   { icon: <Users size={14} />,          badge: 'Nhóm',       color: 'bg-purple-100 text-purple-700'},
  };
  const cfg = ROOM_CFG[currentRoom.roomType] ?? ROOM_CFG.DIRECT;

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-w-0 overflow-hidden relative">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-bold text-base truncate text-gray-800">
              {currentRoom.title || 'Phòng chat'}
            </h2>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 shrink-0 ${cfg.color}`}>
              {cfg.icon}{cfg.badge}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {currentRoom.members.length} thành viên
            {onlineCount > 0 && <span className="text-green-500 ml-1.5">· {onlineCount} online</span>}
          </p>
        </div>
        {currentRoom.roomType === 'DIRECT' && (
          <button
            onClick={() => setShowReportModal(true)}
            className="text-xs text-red-500 hover:text-red-600 border border-red-200
                       hover:border-red-300 px-2.5 py-1.5 rounded-lg transition-colors
                       flex items-center gap-1.5 shrink-0"
          >
            <AlertTriangle size={13} /> Báo cáo
          </button>
        )}
      </div>

      {/* Messages area */}
      <div
        ref={messagesAreaRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-3 min-h-0"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
            <MessageCircle size={28} className="opacity-30" />
            <p className="text-sm">Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!</p>
          </div>
        ) : (
          <div className="space-y-1 pb-2">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}

        {/* Typing indicator */}
        {typingList.length > 0 && (
          <div className="flex items-center gap-2 mt-2 pl-10 text-xs text-gray-500">
            <div className="flex gap-1">
              {[0, 0.15, 0.3].map((d, i) => (
                <span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${d}s` }} />
              ))}
            </div>
            <span>{typingList.join(', ')} đang nhập...</span>
          </div>
        )}

        {/* Anchor — scrollIntoView nhắm vào đây */}
        <div ref={bottomAnchorRef} />
      </div>

      {/* Nút "Tin nhắn mới" khi user đang scroll lên */}
      {showScrollBtn && (
        <button
          onClick={() => { scrollToBottom('smooth'); setShowScrollBtn(false); }}
          className="absolute bottom-[72px] left-1/2 -translate-x-1/2 bg-blue-600 text-white
                     text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5
                     hover:bg-blue-700 transition-colors z-10"
        >
          <ArrowDown size={13} /> Tin nhắn mới ↓
        </button>
      )}

      {/* Input */}
      <ChatInput roomId={currentRoom.id} />

      {/* Report modal */}
      {showReportModal && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
          <div className="bg-white rounded-2xl p-6 w-[360px] shadow-2xl mx-4">
            {reportSuccess ? (
              <div className="text-center py-4">
                <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
                <p className="font-semibold text-gray-800">Báo cáo đã được gửi!</p>
                <p className="text-sm text-gray-500 mt-1">Admin sẽ liên hệ sớm nhất.</p>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-500" /> Báo cáo vấn đề
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Admin sẽ tham gia phân xử. Lịch sử chat được lưu làm bằng chứng.
                </p>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Mô tả vấn đề..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm
                             focus:outline-none focus:ring-2 focus:ring-red-400 resize-none mb-4"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowReportModal(false); setReportReason(''); }}
                    className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleReport}
                    disabled={!reportReason.trim() || isReporting}
                    className="flex-1 bg-red-500 text-white py-2 rounded-xl text-sm font-medium
                               hover:bg-red-600 disabled:opacity-50 transition-colors"
                  >
                    {isReporting ? 'Đang gửi...' : 'Gửi báo cáo'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
