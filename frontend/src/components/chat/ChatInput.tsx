// src/components/chat/ChatInput.tsx
import React, { useState, useRef, useCallback } from 'react';
import { chatApi } from '../../services/chatapi';
import { websocketService } from '../../services/WebSocketService';
import { Paperclip, Send, X } from 'lucide-react';

interface ChatInputProps {
  roomId: number;
}

const QUICK_REPLIES = [
  'Cho tôi xem portfolio',
  'Bảo hành bao lâu?',
  'Có thể gặp trực tiếp không?',
  'Gửi báo giá chi tiết',
];

export const ChatInput: React.FC<ChatInputProps> = ({ roomId }) => {
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSendMessage = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed || isUploading) return;

    websocketService.sendMessage(roomId, {
      messageType: 'TEXT',
      content: trimmed,
    });

    setMessage('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    // Stop typing indicator
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    websocketService.sendTypingIndicator(roomId, false);
  }, [message, roomId, isUploading]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(`Đang tải "${file.name}"...`);

    try {
      const uploadResponse = await chatApi.uploadFile(roomId, file);
      const { fileUrl, fileName, fileSize } = uploadResponse.data;

      let messageType = 'FILE';
      if (file.type.startsWith('image/')) {
        messageType = 'IMAGE';
      } else if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) {
        messageType = 'MODEL_3D';
      }

      websocketService.sendMessage(roomId, {
        messageType,
        fileUrl,
        fileName,
        fileSize,
      });
      setUploadProgress(null);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadProgress('Tải file thất bại. Vui lòng thử lại.');
      setTimeout(() => setUploadProgress(null), 3000);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleTypingChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto resize
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    }

    // Typing indicator with debounce
    websocketService.sendTypingIndicator(roomId, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      websocketService.sendTypingIndicator(roomId, false);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const sendQuickReply = (text: string) => {
    websocketService.sendMessage(roomId, {
      messageType: 'TEXT',
      content: text,
    });
  };

  return (
    <div className="bg-white border-t border-gray-200 p-3">
      {/* Quick replies */}
      <div className="flex gap-2 mb-2 overflow-x-auto pb-1 scrollbar-hide">
        {QUICK_REPLIES.map((reply) => (
          <button
            key={reply}
            onClick={() => sendQuickReply(reply)}
            className="px-3 py-1 bg-gray-100 rounded-full text-xs hover:bg-gray-200 whitespace-nowrap transition-colors"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Upload progress */}
      {uploadProgress && (
        <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
          {isUploading && (
            <span className="inline-block w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          )}
          {uploadProgress}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,.pdf,.glb,.gltf,.dwg,.skp,.doc,.docx,.xls,.xlsx"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-2 text-gray-400 hover:text-blue-500 disabled:opacity-40 transition-colors"
          title="Đính kèm file"
        >
          <Paperclip size={20} />
        </button>

        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleTypingChange}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn... (Enter để gửi, Shift+Enter xuống dòng)"
          className="flex-1 border border-gray-300 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          rows={1}
          style={{ maxHeight: '120px' }}
        />

        <button
          onClick={handleSendMessage}
          disabled={!message.trim() || isUploading}
          className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Gửi (Enter)"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};
