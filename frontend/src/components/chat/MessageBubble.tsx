// src/components/chat/MessageBubble.tsx
import React from 'react';
import { websocketService } from '../../services/WebSocketService';
import { ChatMessage } from '../../store/chatStore';
import { Download, MapPin, Pin, FileText } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
  /** ID của người đang xem — phải là number đã được coerce */
  currentUserId?: number | null;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, currentUserId }) => {
  // So sánh sau khi ép kiểu cả hai về number
  // currentUserId từ ChatWindow = Number(user.id) — luôn là number hoặc null
  // message.senderId đã được normalizeMessage coerce trong chatStore
  const isOwn: boolean =
    currentUserId !== undefined &&
    currentUserId !== null &&
    Number(message.senderId) === Number(currentUserId);

  /* ── Helpers ─────────────────────────────────────────────────────────── */
  const fmtSize = (b?: number) => {
    if (!b) return '';
    if (b < 1024) return `${b} B`;
    if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / 1048576).toFixed(1)} MB`;
  };

  const fmtTime = (s: string) => {
    try {
      return new Date(s).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  const roleColor = (role?: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':      return 'text-red-600 bg-red-50';
      case 'CONTRACTOR': return 'text-blue-600 bg-blue-50';
      default:           return 'text-green-700 bg-green-50';
    }
  };

  const senderRole = message.metadata?.senderRole as string | undefined;

  /* ── SYSTEM ─────────────────────────────────────────────────────────── */
  if (message.messageType === 'SYSTEM') {
    return (
      <div className="flex justify-center my-3">
        <span className="bg-gray-100 text-gray-500 text-xs px-4 py-1.5 rounded-full border border-gray-200">
          {message.content}
        </span>
      </div>
    );
  }

  /* ── Nội dung bubble ─────────────────────────────────────────────────── */
  const renderContent = () => {
    switch (message.messageType) {
      case 'TEXT':
        return (
          <p className="whitespace-pre-wrap break-words leading-relaxed text-sm">
            {message.content}
          </p>
        );

      case 'IMAGE':
        return (
          <img
            src={message.fileUrl}
            alt={message.fileName || 'ảnh'}
            className="max-w-[260px] rounded-xl cursor-pointer hover:opacity-90 transition-opacity block"
            onClick={() => window.open(message.fileUrl, '_blank')}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        );

      case 'FILE':
        return (
          <a
            href={message.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 p-3 rounded-xl hover:opacity-90 transition-opacity no-underline ${
              isOwn ? 'bg-white/15' : 'bg-blue-50'
            }`}
          >
            <div className={`p-2 rounded-lg shrink-0 ${isOwn ? 'bg-white/20' : 'bg-blue-100'}`}>
              <FileText size={18} className={isOwn ? 'text-white' : 'text-blue-600'} />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`font-medium text-sm truncate ${isOwn ? 'text-white' : 'text-gray-800'}`}>
                {message.fileName}
              </p>
              <p className={`text-xs mt-0.5 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                {fmtSize(message.fileSize)}
              </p>
            </div>
            <Download size={14} className={isOwn ? 'text-white/70' : 'text-blue-400'} />
          </a>
        );

      case 'MODEL_3D':
        return (
          <div className={`p-3 rounded-xl ${isOwn ? 'bg-white/10' : 'bg-gray-50 border border-gray-200'}`}>
            <p className={`text-sm font-semibold mb-1.5 ${isOwn ? 'text-white' : 'text-gray-800'}`}>
              📐 Bản vẽ 3D
            </p>
            <a href={message.fileUrl} target="_blank" rel="noopener noreferrer"
              className={`text-sm underline ${isOwn ? 'text-blue-100' : 'text-blue-500'}`}>
              {message.fileName}
            </a>
          </div>
        );

      case 'COLOR_PALETTE': {
        const colors: any[] = message.metadata?.colors || [];
        return (
          <div className={`p-3 rounded-xl ${isOwn ? 'bg-white/10' : 'bg-white border border-gray-200'}`}>
            <p className={`text-sm font-semibold mb-2 ${isOwn ? 'text-white' : 'text-gray-800'}`}>
              🎨 Bảng màu vật liệu
            </p>
            <div className="flex flex-wrap gap-2">
              {colors.map((c: any, i: number) => (
                <button key={i}
                  className="w-9 h-9 rounded-lg border-2 border-white shadow-sm hover:scale-110 transition-transform"
                  style={{ backgroundColor: c.hex }}
                  title={`${c.name} (${c.hex})`}
                  onClick={() => websocketService.sendMessage(message.roomId, {
                    messageType: 'TEXT',
                    content: `Tôi chọn màu ${c.name} (${c.hex})`,
                  })}
                />
              ))}
            </div>
          </div>
        );
      }

      case 'ACTION_BUTTON': {
        const action = message.metadata?.action;
        return (
          <div className="bg-white p-4 rounded-xl border-2 border-blue-200 min-w-[220px]">
            <p className="font-semibold text-sm mb-2 text-gray-800">{message.content}</p>
            {message.fileUrl && <img src={message.fileUrl} className="w-full rounded-lg mb-3" alt="" />}
            <div className="flex gap-2">
              <button onClick={() => handleAction(action?.confirmEndpoint, true)}
                className="flex-1 bg-green-500 text-white py-1.5 rounded-lg hover:bg-green-600 text-xs font-medium transition-colors">
                {action?.confirmText || '✅ Xác nhận'}
              </button>
              <button onClick={() => handleAction(action?.rejectEndpoint, false)}
                className="flex-1 bg-red-500 text-white py-1.5 rounded-lg hover:bg-red-600 text-xs font-medium transition-colors">
                {action?.rejectText || '❌ Từ chối'}
              </button>
            </div>
          </div>
        );
      }

      case 'LOCATION': {
        const { lat, lng, name } = message.metadata || {};
        return (
          <div className={`p-3 rounded-xl ${isOwn ? 'bg-white/10' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-1.5">
              <MapPin size={15} className="text-red-400 shrink-0" />
              <p className={`text-sm font-semibold ${isOwn ? 'text-white' : 'text-gray-800'}`}>
                {name || 'Vị trí công trình'}
              </p>
            </div>
            {lat && lng ? (
              <a href={`https://maps.google.com/?q=${lat},${lng}`} target="_blank" rel="noopener noreferrer"
                className={`text-xs underline ${isOwn ? 'text-blue-100' : 'text-blue-500'}`}>
                Xem trên Google Maps
              </a>
            ) : (
              <p className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>{message.content}</p>
            )}
          </div>
        );
      }

      default:
        return <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>;
    }
  };

  const handleAction = async (endpoint: string, confirmed: boolean) => {
    if (!endpoint) return;
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ confirmed }),
      });
      websocketService.sendMessage(message.roomId, {
        messageType: 'TEXT',
        content: confirmed ? '✅ Đã xác nhận' : '❌ Đã từ chối',
      });
    } catch (err) { console.error('Action error:', err); }
  };

  /* ── Layout ──────────────────────────────────────────────────────────── */
  return (
    <div className={`flex gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end`}>

      {/* Avatar — chỉ hiện cho tin người khác */}
      {!isOwn ? (
        <img
          src={message.senderAvatar || '/default-avatar.png'}
          className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
          alt={message.senderName}
          onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
        />
      ) : (
        <div className="w-8 shrink-0" /> /* placeholder để căn đều */
      )}

      {/* Bubble + meta */}
      <div className={`flex flex-col max-w-[70%] gap-0.5 ${isOwn ? 'items-end' : 'items-start'}`}>

        {/* Tên + role — chỉ hiện cho tin người khác */}
        {!isOwn && (
          <div className="flex items-center gap-1.5 ml-1">
            <span className="text-xs font-semibold text-gray-700">{message.senderName}</span>
            {senderRole && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${roleColor(senderRole)}`}>
                {senderRole === 'ADMIN' ? 'Admin' : senderRole === 'CONTRACTOR' ? 'Nhà thầu' : 'Khách hàng'}
              </span>
            )}
          </div>
        )}

        {/* Bubble */}
        <div
          className={`px-3.5 py-2.5 shadow-sm max-w-full ${
            isOwn
              ? 'bg-blue-500 text-white rounded-2xl rounded-br-sm'
              : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-bl-sm'
          }`}
        >
          {renderContent()}

          {/* Timestamp + pin */}
          <div className={`flex items-center gap-1 mt-1 text-[10px] ${
            isOwn ? 'justify-end text-blue-100' : 'text-gray-400'
          }`}>
            <span>{fmtTime(message.createdAt)}</span>
            {message.isPinned && (
              <Pin size={9} className={isOwn ? 'text-blue-200' : 'text-amber-400'} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
