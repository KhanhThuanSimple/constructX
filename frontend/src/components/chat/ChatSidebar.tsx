// src/components/chat/ChatSidebar.tsx
import React, { useEffect, useState } from 'react';
import { useChatStore, ChatRoom } from '../../store/chatStore';
import { chatApi } from '../../services/chatapi';
import { websocketService } from '../../services/WebSocketService';
import useAuthStore from '../../store/useAuthStore';
import { MessageCircle, ShieldCheck, Scale, Plus, X, Loader2, Search, HeadphonesIcon } from 'lucide-react';

type NewRoomType = 'direct' | 'support' | 'dispute' | null;

export const ChatSidebar: React.FC = () => {
  const { rooms, currentRoom, setCurrentRoom, setRooms, isConnected } = useChatStore();
  const { user } = useAuthStore();
  const currentUserId = user?.id;
  const isAdmin = user?.role === 'ADMIN';

  const [showNewRoom, setShowNewRoom] = useState<NewRoomType>(null);
  const [newRoomInput, setNewRoomInput] = useState('');
  const [contractorId, setContractorId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    if (!isConnected || !currentUserId) return;
    let sub: any;
    websocketService.subscribeToNewRooms(currentUserId, (room) => {
      setRooms([room, ...useChatStore.getState().rooms]);
    }).then((s) => { sub = s; });
    return () => sub?.unsubscribe();
  }, [isConnected, currentUserId]);

  const loadRooms = async () => {
    try {
      const response = await chatApi.getRooms();
      setRooms(response.data.content || response.data || []);
    } catch (err) {
      console.error('Error loading rooms:', err);
    }
  };

  const handleRoomClick = async (room: ChatRoom) => {
    if (currentRoom?.id === room.id) return;
    setCurrentRoom(room);
    websocketService.subscribeToRoom(room.id, (message) => {
      useChatStore.getState().addMessage(message);
    });
  };

  const handleCreateRoom = async () => {
    if (!newRoomInput.trim()) return;
    if (showNewRoom === 'direct' && !contractorId.trim()) return;

    setIsCreating(true);
    try {
      let response;
      if (showNewRoom === 'support') {
        response = await chatApi.createSupportRoom(newRoomInput);
      } else if (showNewRoom === 'direct') {
        response = await chatApi.createDirectRoom({
          contractorId: parseInt(contractorId),
          title: newRoomInput,
        });
      } else if (showNewRoom === 'dispute') {
        // Dispute cần contractJobId — dùng 0 nếu không rõ
        response = await chatApi.createDisputeRoom(0, newRoomInput);
      }
      if (response?.data) {
        const newRoom = response.data;
        setRooms([newRoom, ...useChatStore.getState().rooms]);
        setCurrentRoom(newRoom);
        websocketService.subscribeToRoom(newRoom.id, (message) => {
          useChatStore.getState().addMessage(message);
        });
      }
      setShowNewRoom(null);
      setNewRoomInput('');
      setContractorId('');
    } catch (err) {
      console.error('Error creating room:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const getRoomIcon = (roomType: string) => {
    switch (roomType) {
      case 'SUPPORT': return <ShieldCheck className="text-blue-500 shrink-0" size={18} />;
      case 'DISPUTE': return <Scale className="text-red-500 shrink-0" size={18} />;
      default:        return <MessageCircle className="text-green-500 shrink-0" size={18} />;
    }
  };

  const getRoomTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      DIRECT: 'Trực tiếp',
      SUPPORT: 'Hỗ trợ',
      DISPUTE: 'Tranh chấp',
      GROUP: 'Nhóm',
    };
    return map[type] || type;
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      if (diff < 60_000) return 'Vừa xong';
      if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} phút`;
      if (diff < 86_400_000) return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    } catch { return ''; }
  };

  const filteredRooms = rooms.filter((r) =>
    !searchQuery ||
    (r.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.lastMessage?.content || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800">Tin nhắn</h2>
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-gray-300'}`}
              title={isConnected ? 'Đã kết nối' : 'Đang kết nối...'}
            />
            <button
              onClick={() => setShowNewRoom(showNewRoom ? null : 'support')}
              className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
              title="Tạo phòng chat mới"
            >
              {showNewRoom ? <X size={18} /> : <Plus size={18} />}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm cuộc trò chuyện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* New room form */}
      {showNewRoom && (
        <div className="p-3 border-b border-gray-200 bg-blue-50">
          {/* Room type selector */}
          <div className="flex gap-1 mb-3">
            {(['support', 'direct', 'dispute'] as NewRoomType[]).map((type) => (
              <button
                key={type}
                onClick={() => { setShowNewRoom(type); setNewRoomInput(''); setContractorId(''); }}
                className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                  showNewRoom === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {type === 'support' ? '🛡️ Hỗ trợ' : type === 'direct' ? '💬 Trực tiếp' : '⚖️ Tranh chấp'}
              </button>
            ))}
          </div>

          {showNewRoom === 'direct' && (
            <input
              type="number"
              placeholder="ID nhà thầu..."
              value={contractorId}
              onChange={(e) => setContractorId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          )}

          <input
            type="text"
            placeholder={
              showNewRoom === 'support' ? 'Mô tả vấn đề cần hỗ trợ...' :
              showNewRoom === 'direct'  ? 'Tiêu đề cuộc trò chuyện...' :
              'Lý do tranh chấp...'
            }
            value={newRoomInput}
            onChange={(e) => setNewRoomInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateRoom()}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleCreateRoom}
            disabled={isCreating || !newRoomInput.trim() || (showNewRoom === 'direct' && !contractorId)}
            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isCreating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {isCreating ? 'Đang tạo...' : 'Tạo phòng chat'}
          </button>
        </div>
      )}

      {/* Room list */}
      <div className="flex-1 overflow-y-auto">
        {filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <MessageCircle className="text-gray-200 mb-3" size={40} />
            <p className="text-gray-400 text-sm">
              {searchQuery ? 'Không tìm thấy cuộc trò chuyện' : 'Chưa có cuộc trò chuyện nào'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowNewRoom('support')}
                className="mt-3 text-blue-500 text-xs hover:underline flex items-center gap-1"
              >
                <HeadphonesIcon size={12} /> Tạo phòng hỗ trợ
              </button>
            )}
          </div>
        ) : (
          filteredRooms.map((room) => (
            <div
              key={room.id}
              onClick={() => handleRoomClick(room)}
              className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${
                currentRoom?.id === room.id
                  ? 'bg-blue-50 border-l-4 border-l-blue-500'
                  : 'border-l-4 border-l-transparent'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getRoomIcon(room.roomType)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-gray-800 truncate">
                      {room.title || 'Phòng chat'}
                    </h3>
                    <div className="flex items-center gap-1.5 shrink-0 ml-1">
                      {room.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                          {room.unreadCount > 99 ? '99+' : room.unreadCount}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">{formatTime(room.updatedAt)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {room.lastMessage
                      ? `${room.lastMessage.senderName ? room.lastMessage.senderName + ': ' : ''}${room.lastMessage.content || '[File đính kèm]'}`
                      : <span className="italic">{getRoomTypeLabel(room.roomType)}</span>
                    }
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {room.members.slice(0, 3).map((m) => (
                      <img
                        key={m.userId}
                        src={m.avatarUrl || '/default-avatar.png'}
                        className="w-4 h-4 rounded-full object-cover"
                        alt={m.fullName}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
                        title={m.fullName}
                      />
                    ))}
                    {room.members.length > 3 && (
                      <span className="text-xs text-gray-400">+{room.members.length - 3}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
