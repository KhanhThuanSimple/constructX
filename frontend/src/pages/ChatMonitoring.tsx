// src/pages/ChatMonitoring.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import { chatApi } from '../services/chatapi';
import { websocketService } from '../services/WebSocketService';
import { MessageBubble } from '../components/chat/MessageBubble';
import useAuthStore from '../store/useAuthStore';
import {
  Search, Pin, Users, Send, Paperclip, MessageCircle,
  ShieldCheck, Scale, RefreshCw,
  X, Loader2, Info,
  CheckCircle,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Member {
  userId: number;
  fullName: string;
  avatarUrl: string;
  roleInRoom: string;
  isOnline: boolean;
  joinedAt: string;
}

interface Message {
  id: number;
  roomId: number;
  senderId: number;
  senderName: string;
  senderAvatar: string;
  messageType: string;
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  metadata?: any;
  isPinned?: boolean;
  createdAt: string;
}

interface Room {
  id: number;
  roomType: string;
  title: string;
  referenceType?: string;
  referenceId?: number;
  members: Member[];
  lastMessage: Message | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ROOM_TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  DIRECT:  { label: 'Trực tiếp',  icon: <MessageCircle size={14} />, color: 'text-green-700',  bg: 'bg-green-100'  },
  SUPPORT: { label: 'Hỗ trợ',     icon: <ShieldCheck size={14} />,   color: 'text-blue-700',   bg: 'bg-blue-100'   },
  DISPUTE: { label: 'Tranh chấp', icon: <Scale size={14} />,          color: 'text-red-700',    bg: 'bg-red-100'    },
  GROUP:   { label: 'Nhóm',       icon: <Users size={14} />,          color: 'text-purple-700', bg: 'bg-purple-100' },
};

const rtc = (type: string) => ROOM_TYPE_CONFIG[type] ?? ROOM_TYPE_CONFIG.DIRECT;

const formatRelativeTime = (dateStr?: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return 'Vừa xong';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} phút`;
  if (diff < 86_400_000) return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

const formatFullTime = (dateStr: string) =>
  new Date(dateStr).toLocaleString('vi-VN');

// ─── Component ────────────────────────────────────────────────────────────────
export const ChatMonitoring: React.FC = () => {
  const { user } = useAuthStore();
  // Coerce sang Number ngay tại render — tránh delay useEffect
  const currentUserId: number | null = user?.id != null ? Number(user.id) : null;

  // Rooms
  const [rooms, setRooms]           = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchRoom, setSearchRoom] = useState('');

  // Selected room & messages
  const [selectedRoom, setSelectedRoom]   = useState<Room | null>(null);
  const [messages, setMessages]           = useState<Message[]>([]);
  const [loadingMsgs, setLoadingMsgs]     = useState(false);
  const [typingUsers, setTypingUsers]     = useState<Record<number, string>>({});

  // Input
  const [inputMsg, setInputMsg]   = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Search in messages (admin feature)
  const [searchKeyword, setSearchKeyword]   = useState('');
  const [searchResults, setSearchResults]   = useState<Message[]>([]);
  const [isSearching, setIsSearching]       = useState(false);
  const [showSearch, setShowSearch]         = useState(false);
  const [pinnedIds, setPinnedIds]           = useState<Set<number>>(new Set());

  // Right panel
  const [showInfo, setShowInfo] = useState(false);

  // WebSocket connected
  const [wsConnected, setWsConnected] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesAreaRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);
  const prevMsgLenRef   = useRef(0);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    requestAnimationFrame(() => {
      bottomAnchorRef.current?.scrollIntoView({ behavior, block: 'end' });
    });
  }, []);

  const handleScrollArea = () => {
    const el = messagesAreaRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 80) setShowScrollBtn(false);
  };

  // ─── Load rooms ─────────────────────────────────────────────────────────
  const loadRooms = useCallback(async () => {
    setLoadingRooms(true);
    try {
      const res = await chatApi.getAllRooms(0, 100);
      const data: Room[] = res.data.content || res.data || [];
      setRooms(data);
    } catch (err) {
      console.error('Error loading rooms:', err);
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  useEffect(() => {
    loadRooms();

    // Connect WebSocket for admin
    websocketService.connect(() => setWsConnected(true));

    // Subscribe to new room notifications
    websocketService.subscribeToNewRooms(currentUserId ?? 0, (room: Room) => {
      setRooms((prev) => {
        const exists = prev.some((r) => r.id === room.id);
        return exists ? prev.map((r) => r.id === room.id ? { ...r, ...room } : r) : [room, ...prev];
      });
    });

    return () => {
      websocketService.disconnect();
    };
  }, []);

  // ─── Select room & load messages ────────────────────────────────────────
  const selectRoom = useCallback(async (room: Room) => {
    setSelectedRoom(room);
    setMessages([]);
    setSearchResults([]);
    setSearchKeyword('');
    setShowSearch(false);
    setLoadingMsgs(true);

    try {
      const res = await chatApi.getMessages(room.id, 0, 100);
      const content: Message[] = res.data.content || res.data || [];
      // Backend DESC → reverse, đồng thời coerce senderId
      setMessages(
        [...content].reverse().map((m) => ({ ...m, senderId: Number(m.senderId) }))
      );
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoadingMsgs(false);
    }

    // Subscribe real-time
    websocketService.subscribeToRoom(room.id, (msg: Message) => {
      const normalized = { ...msg, senderId: Number(msg.senderId) };
      setMessages((prev) => {
        if (prev.some((m) => m.id === normalized.id)) return prev;
        return [...prev, normalized];
      });
      // Update last message in sidebar
      setRooms((prev) =>
        prev.map((r) => r.id === normalized.roomId ? { ...r, lastMessage: normalized } : r)
      );
    });

    websocketService.subscribeToTyping(room.id, (data: any) => {
      if (Number(data.userId) === Number(currentUserId)) return;
      if (data.isTyping) {
        setTypingUsers((p) => ({ ...p, [data.userId]: data.userName }));
        setTimeout(() => setTypingUsers((p) => { const n = { ...p }; delete n[data.userId]; return n; }), 3000);
      } else {
        setTypingUsers((p) => { const n = { ...p }; delete n[data.userId]; return n; });
      }
    });
  }, [currentUserId]);

  // Scroll instant khi mới vào phòng
  useEffect(() => {
    if (messages.length > 0 && prevMsgLenRef.current === 0) {
      scrollToBottom('auto');
    }
  }, [messages.length]);

  // Scroll smooth / nút khi có tin mới real-time
  useEffect(() => {
    if (messages.length === 0) return;
    const isNew = messages.length > prevMsgLenRef.current;
    prevMsgLenRef.current = messages.length;
    if (!isNew) return;
    const el = messagesAreaRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
    if (nearBottom) { scrollToBottom('smooth'); setShowScrollBtn(false); }
    else              setShowScrollBtn(true);
  }, [messages.length]);

  // Reset khi đổi phòng
  useEffect(() => {
    prevMsgLenRef.current = 0;
    setShowScrollBtn(false);
  }, [selectedRoom?.id]);

  // Mark read when messages change
  useEffect(() => {
    if (selectedRoom && messages.length > 0 && wsConnected) {
      const last = messages[messages.length - 1];
      websocketService.markAsRead(selectedRoom.id, last.id);
    }
  }, [messages.length, selectedRoom?.id, wsConnected]);

  // ─── Send message ────────────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    const trimmed = inputMsg.trim();
    if (!trimmed || !selectedRoom || isSending) return;

    websocketService.sendMessage(selectedRoom.id, {
      messageType: 'TEXT',
      content: trimmed,
    });
    setInputMsg('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    websocketService.sendTypingIndicator(selectedRoom.id, false);
  }, [inputMsg, selectedRoom, isSending]);

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMsg(e.target.value);
    const ta = textareaRef.current;
    if (ta) { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'; }
    if (!selectedRoom) return;
    websocketService.sendTypingIndicator(selectedRoom.id, true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      websocketService.sendTypingIndicator(selectedRoom.id, false);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ─── File upload ─────────────────────────────────────────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedRoom) return;
    setIsUploading(true);
    try {
      const res = await chatApi.uploadFile(selectedRoom.id, file);
      const { fileUrl, fileName, fileSize } = res.data;
      let messageType = 'FILE';
      if (file.type.startsWith('image/')) messageType = 'IMAGE';
      else if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) messageType = 'MODEL_3D';
      websocketService.sendMessage(selectedRoom.id, { messageType, fileUrl, fileName, fileSize });
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ─── Search messages ─────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!selectedRoom || !searchKeyword.trim()) return;
    setIsSearching(true);
    try {
      const res = await chatApi.searchMessages(selectedRoom.id, searchKeyword);
      setSearchResults(res.data.content || res.data || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // ─── Pin message ─────────────────────────────────────────────────────────
  const handlePin = async (messageId: number) => {
    try {
      await chatApi.pinMessage(messageId);
      setPinnedIds((p) => new Set([...p, messageId]));
      setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, isPinned: true } : m));
    } catch (err) {
      console.error('Pin error:', err);
    }
  };

  // ─── Filtered rooms ──────────────────────────────────────────────────────
  const filteredRooms = rooms.filter((r) => {
    const matchType = filterType === 'ALL' || r.roomType === filterType;
    const matchSearch = !searchRoom ||
      (r.title || '').toLowerCase().includes(searchRoom.toLowerCase()) ||
      r.members.some((m) => m.fullName.toLowerCase().includes(searchRoom.toLowerCase()));
    return matchType && matchSearch;
  });

  const supportCount = rooms.filter((r) => r.roomType === 'SUPPORT').length;
  const disputeCount = rooms.filter((r) => r.roomType === 'DISPUTE').length;
  const unreadTotal  = rooms.reduce((s, r) => s + (r.unreadCount || 0), 0);

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <Layout title="Giám sát & Hỗ trợ Chat">
      <div className="-m-6 h-[calc(100vh-4rem)] flex overflow-hidden bg-gray-100">
        {/* ══════════════════ PANEL LEFT — Room list ══════════════════════ */}
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col shrink-0">

          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-800">Phòng chat</h2>
              <div className="flex items-center gap-2">
                {unreadTotal > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                    {unreadTotal}
                  </span>
                )}
                <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-400' : 'bg-gray-300'}`}
                  title={wsConnected ? 'WebSocket đã kết nối' : 'Đang kết nối...'} />
                <button onClick={loadRooms} className="text-gray-400 hover:text-blue-500 transition-colors" title="Làm mới">
                  <RefreshCw size={15} className={loadingRooms ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* Stats strip */}
            <div className="flex gap-2 mb-3">
              {[
                { label: 'Hỗ trợ', count: supportCount, color: 'text-blue-600 bg-blue-50' },
                { label: 'T.Chấp', count: disputeCount, color: 'text-red-600 bg-red-50'  },
                { label: 'Tổng',   count: rooms.length, color: 'text-gray-600 bg-gray-50' },
              ].map((s) => (
                <div key={s.label} className={`flex-1 rounded-lg px-2 py-1.5 text-center ${s.color}`}>
                  <p className="text-base font-bold leading-none">{s.count}</p>
                  <p className="text-[10px] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Search */}
            <div className="relative mb-2">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm phòng hoặc thành viên..."
                value={searchRoom}
                onChange={(e) => setSearchRoom(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1">
              {['ALL', 'SUPPORT', 'DISPUTE', 'DIRECT'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`flex-1 text-[10px] py-1 rounded-md font-medium transition-colors ${
                    filterType === type
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {type === 'ALL' ? 'Tất cả' : type === 'SUPPORT' ? 'H.Trợ' : type === 'DISPUTE' ? 'T.Chấp' : 'Trực tiếp'}
                </button>
              ))}
            </div>
          </div>

          {/* Room list */}
          <div className="flex-1 overflow-y-auto">
            {loadingRooms && filteredRooms.length === 0 ? (
              <div className="flex justify-center py-8">
                <Loader2 size={20} className="animate-spin text-gray-400" />
              </div>
            ) : filteredRooms.length === 0 ? (
              <p className="text-center text-gray-400 text-xs py-8">Không có phòng nào</p>
            ) : (
              filteredRooms.map((room) => {
                const cfg = rtc(room.roomType);
                const isSelected = selectedRoom?.id === room.id;
                return (
                  <div
                    key={room.id}
                    onClick={() => selectRoom(room)}
                    className={`px-3 py-3 border-b border-gray-50 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 border-l-4 border-l-blue-500'
                        : 'border-l-4 border-l-transparent hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${cfg.bg}`}>
                        <span className={cfg.color}>{cfg.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm text-gray-800 truncate">
                            {room.title || `Phòng #${room.id}`}
                          </p>
                          <div className="flex items-center gap-1 shrink-0 ml-1">
                            {room.unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-[10px] rounded-full px-1.5 min-w-[16px] text-center">
                                {room.unreadCount}
                              </span>
                            )}
                            <span className="text-[10px] text-gray-400">
                              {formatRelativeTime(room.updatedAt)}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {room.lastMessage
                            ? `${room.lastMessage.senderName ? room.lastMessage.senderName + ': ' : ''}${room.lastMessage.content || '[File]'}`
                            : <span className="italic">{cfg.label}</span>
                          }
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {room.members.slice(0, 4).map((m) => (
                            <div key={m.userId} className="relative">
                              <img
                                src={m.avatarUrl || '/default-avatar.png'}
                                className="w-4 h-4 rounded-full object-cover border border-white"
                                alt={m.fullName}
                                onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
                                title={m.fullName}
                              />
                              {m.isOnline && (
                                <span className="absolute -bottom-px -right-px w-1.5 h-1.5 bg-green-400 rounded-full border border-white" />
                              )}
                            </div>
                          ))}
                          {room.members.length > 4 && (
                            <span className="text-[10px] text-gray-400">+{room.members.length - 4}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ══════════════════ PANEL CENTER — Chat window ══════════════════ */}
        <div className="flex-1 flex flex-col min-w-0 bg-gray-50 relative">

          {selectedRoom ? (
            <>
              {/* Chat header */}
              <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
                <div className={`p-2 rounded-xl ${rtc(selectedRoom.roomType).bg}`}>
                  <span className={rtc(selectedRoom.roomType).color}>
                    {rtc(selectedRoom.roomType).icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-base text-gray-800 truncate">
                      {selectedRoom.title || `Phòng #${selectedRoom.id}`}
                    </h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rtc(selectedRoom.roomType).bg} ${rtc(selectedRoom.roomType).color}`}>
                      {rtc(selectedRoom.roomType).label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedRoom.members.length} thành viên ·{' '}
                    {selectedRoom.members.filter((m) => m.isOnline).length} online
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setShowSearch(!showSearch); setShowInfo(false); }}
                    className={`p-2 rounded-lg transition-colors ${showSearch ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                    title="Tìm kiếm tin nhắn"
                  >
                    <Search size={16} />
                  </button>
                  <button
                    onClick={() => { setShowInfo(!showInfo); setShowSearch(false); }}
                    className={`p-2 rounded-lg transition-colors ${showInfo ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                    title="Thông tin phòng"
                  >
                    <Info size={16} />
                  </button>
                </div>
              </div>

              {/* Search bar (toggleable) */}
              {showSearch && (
                <div className="bg-white border-b border-gray-200 px-4 py-2 flex gap-2">
                  <div className="flex-1 relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Tìm từ khóa trong cuộc trò chuyện..."
                      className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={isSearching || !searchKeyword.trim()}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isSearching ? <Loader2 size={14} className="animate-spin" /> : 'Tìm'}
                  </button>
                  {searchResults.length > 0 && (
                    <button onClick={() => { setSearchResults([]); setSearchKeyword(''); }}
                      className="text-gray-400 hover:text-gray-600">
                      <X size={16} />
                    </button>
                  )}
                </div>
              )}

              {/* Search results overlay */}
              {showSearch && searchResults.length > 0 && (
                <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 max-h-48 overflow-y-auto">
                  <p className="text-xs font-semibold text-amber-700 mb-2">
                    {searchResults.length} kết quả cho "{searchKeyword}"
                  </p>
                  <div className="space-y-1.5">
                    {searchResults.map((msg) => (
                      <div key={msg.id} className="bg-white rounded-lg px-3 py-2 flex items-center justify-between border border-amber-200">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-gray-600">{msg.senderName}</p>
                          <p className="text-sm text-gray-800 truncate">{msg.content}</p>
                          <p className="text-[10px] text-gray-400">{formatFullTime(msg.createdAt)}</p>
                        </div>
                        <button
                          onClick={() => handlePin(msg.id)}
                          disabled={pinnedIds.has(msg.id) || msg.isPinned}
                          className={`ml-3 shrink-0 text-xs px-2 py-1 rounded-lg flex items-center gap-1 transition-colors ${
                            pinnedIds.has(msg.id) || msg.isPinned
                              ? 'bg-gray-100 text-gray-400 cursor-default'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          <Pin size={10} />
                          {pinnedIds.has(msg.id) || msg.isPinned ? 'Đã ghim' : 'Ghim'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {showSearch && searchKeyword && searchResults.length === 0 && !isSearching && (
                <div className="bg-white border-b border-gray-200 px-4 py-2 text-center text-xs text-gray-400">
                  Không tìm thấy tin nhắn với "{searchKeyword}"
                </div>
              )}

              {/* Messages area */}
              <div
                ref={messagesAreaRef}
                onScroll={handleScrollArea}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
              >
                {loadingMsgs ? (
                  <div className="flex justify-center py-12">
                    <Loader2 size={24} className="animate-spin text-gray-400" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 py-16">
                    <MessageCircle size={36} className="opacity-20" />
                    <p className="text-sm">Chưa có tin nhắn nào</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      currentUserId={currentUserId}
                    />
                  ))
                )}

                {/* Typing indicator */}
                {Object.keys(typingUsers).length > 0 && (
                  <div className="flex items-center gap-2 pl-10 text-xs text-gray-500">
                    <div className="flex gap-1">
                      {[0, 0.15, 0.3].map((d, i) => (
                        <span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${d}s` }} />
                      ))}
                    </div>
                    <span>{Object.values(typingUsers).join(', ')} đang nhập...</span>
                  </div>
                )}
                {/* Anchor scroll */}
                <div ref={bottomAnchorRef} />
              </div>

              {/* Nút tin nhắn mới */}
              {showScrollBtn && (
                <button
                  onClick={() => { scrollToBottom('smooth'); setShowScrollBtn(false); }}
                  className="absolute bottom-[80px] left-1/2 -translate-x-1/2 bg-blue-600 text-white
                             text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5
                             hover:bg-blue-700 z-10 transition-colors"
                >
                  ↓ Tin nhắn mới
                </button>
              )}

              {/* Input bar */}
              <div className="bg-white border-t border-gray-200 px-4 py-3">
                {/* Admin quick replies */}
                <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1">
                  {[
                    'Tôi đã nhận được yêu cầu, sẽ xem xét ngay.',
                    'Vui lòng cung cấp thêm thông tin chi tiết.',
                    'Vấn đề đã được ghi nhận và chuyển xử lý.',
                    'Cảm ơn bạn đã liên hệ ConstructX!',
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => websocketService.sendMessage(selectedRoom.id, { messageType: 'TEXT', content: q })}
                      className="text-[11px] bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full hover:bg-blue-100 whitespace-nowrap transition-colors border border-blue-100 shrink-0"
                    >
                      {q.length > 30 ? q.slice(0, 28) + '…' : q}
                    </button>
                  ))}
                </div>

                <div className="flex items-end gap-2">
                  {/* File upload */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.glb,.gltf"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="p-2 text-gray-400 hover:text-blue-500 disabled:opacity-40 transition-colors"
                    title="Đính kèm file"
                  >
                    {isUploading
                      ? <Loader2 size={19} className="animate-spin" />
                      : <Paperclip size={19} />
                    }
                  </button>

                  <textarea
                    ref={textareaRef}
                    value={inputMsg}
                    onChange={handleTyping}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập tin nhắn với người dùng... (Enter gửi, Shift+Enter xuống dòng)"
                    rows={1}
                    className="flex-1 border border-gray-300 rounded-xl px-3 py-2 resize-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    style={{ maxHeight: '120px' }}
                  />

                  <button
                    onClick={handleSend}
                    disabled={!inputMsg.trim() || isSending}
                    className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Gửi (Enter)"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* No room selected */
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-400">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                <MessageCircle size={36} className="text-blue-300" />
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-500">Chọn một phòng chat để bắt đầu</p>
                <p className="text-sm mt-1">Trao đổi trực tiếp với người dùng từ đây</p>
              </div>
              <div className="flex gap-3 mt-2">
                {[
                  { label: `${supportCount} Hỗ trợ`, color: 'bg-blue-50 text-blue-700 border-blue-200' },
                  { label: `${disputeCount} Tranh chấp`, color: 'bg-red-50 text-red-700 border-red-200' },
                ].map((s) => (
                  <span key={s.label} className={`px-4 py-2 rounded-xl text-sm font-medium border ${s.color}`}>
                    {s.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ══════════════════ PANEL RIGHT — Room info (toggleable) ════════ */}
        {showInfo && selectedRoom && (
          <div className="w-64 bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-y-auto">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-800">Thông tin phòng</h3>
              <button onClick={() => setShowInfo(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>

            {/* Room meta */}
            <div className="p-4 border-b border-gray-100">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium mb-3 ${rtc(selectedRoom.roomType).bg} ${rtc(selectedRoom.roomType).color}`}>
                {rtc(selectedRoom.roomType).icon}
                {rtc(selectedRoom.roomType).label}
              </div>
              <p className="text-sm font-semibold text-gray-800 mb-1">{selectedRoom.title || `Phòng #${selectedRoom.id}`}</p>
              <p className="text-xs text-gray-400">
                Tạo lúc: {formatFullTime(selectedRoom.createdAt)}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Tin nhắn cuối: {formatRelativeTime(selectedRoom.updatedAt)}
              </p>
            </div>

            {/* Members */}
            <div className="p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Users size={12} /> Thành viên ({selectedRoom.members.length})
              </h4>
              <div className="space-y-3">
                {selectedRoom.members.map((m) => (
                  <div key={m.userId} className="flex items-center gap-2.5">
                    <div className="relative shrink-0">
                      <img
                        src={m.avatarUrl || '/default-avatar.png'}
                        className="w-9 h-9 rounded-full object-cover border-2 border-gray-100"
                        alt={m.fullName}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
                      />
                      <span className={`absolute -bottom-px -right-px w-3 h-3 rounded-full border-2 border-white ${m.isOnline ? 'bg-green-400' : 'bg-gray-300'}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{m.fullName}</p>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">{m.roleInRoom}</span>
                        {m.isOnline && <span className="text-[10px] text-green-500">· Online</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pinned messages */}
            {messages.filter((m) => m.isPinned).length > 0 && (
              <div className="p-4 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Pin size={12} /> Tin nhắn đã ghim
                </h4>
                <div className="space-y-2">
                  {messages.filter((m) => m.isPinned).map((m) => (
                    <div key={m.id} className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      <p className="text-xs text-gray-600 font-medium">{m.senderName}</p>
                      <p className="text-xs text-gray-800 mt-0.5 line-clamp-2">{m.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick action: Resolve */}
            {selectedRoom.roomType === 'DISPUTE' && (
              <div className="p-4 border-t border-gray-100 mt-auto">
                <button
                  onClick={() => websocketService.sendMessage(selectedRoom.id, {
                    messageType: 'SYSTEM',
                    content: '✅ Admin đã đánh dấu tranh chấp này là đã giải quyết.',
                  })}
                  className="w-full bg-green-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={15} /> Đánh dấu đã giải quyết
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </Layout>
  );
};
