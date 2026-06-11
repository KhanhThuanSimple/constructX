// src/components/chat/ChatFloatingButton.tsx
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Bot, Send, Loader2, HeadphonesIcon, ChevronRight } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import { chatApi } from '../../services/chatapi';
import { useNavigate } from 'react-router-dom';

interface BotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  '📋 Quy trình tạo dự án?',
  '💳 Hướng dẫn thanh toán',
  '🪵 Tư vấn vật liệu nội thất',
  '⚖️ Xử lý tranh chấp',
];

export const ChatFloatingButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'bot' | 'support'>('bot');
  const [messages, setMessages] = useState<BotMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: '👋 Xin chào! Tôi là trợ lý AI của ConstructX, hỗ trợ 24/7!\n\nTôi có thể giúp bạn về:\n• Quy trình tạo dự án\n• Thanh toán & ví\n• Vật liệu nội thất\n• Xử lý tranh chấp\n\nBạn cần hỗ trợ gì? 😊',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [supportTopic, setSupportTopic] = useState('');
  const [isCreatingSupport, setIsCreatingSupport] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { user, token } = useAuthStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && activeTab === 'bot') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, activeTab]);

  if (!token || !user) return null;

  const getHistory = () =>
    messages.slice(1).map((m) => ({ role: m.role, content: m.content }));

  const handleSend = async (text?: string) => {
    const msg = (text ?? inputValue).trim();
    if (!msg || isLoading) return;

    const userMsg: BotMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: msg,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await chatApi.chatWithBot(msg, getHistory());
      const { reply, escalateToAdmin } = response.data;

      const botMsg: BotMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);

      // Nếu AI suggest chuyển Admin, tự động mở tab support
      if (escalateToAdmin) {
        setTimeout(() => setActiveTab('support'), 800);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '😔 Xin lỗi, đang có sự cố kết nối. Vui lòng thử lại hoặc liên hệ Admin.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSupportRoom = async () => {
    if (!supportTopic.trim()) return;
    setIsCreatingSupport(true);
    try {
      const response = await chatApi.createSupportRoom(supportTopic);
      const room = response.data;
      setIsOpen(false);
      navigate(`/chat/${room.id}`);
    } catch {
      alert('Không thể tạo phòng hỗ trợ. Vui lòng thử lại.');
    } finally {
      setIsCreatingSupport(false);
    }
  };

  const formatContent = (content: string) =>
    content.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition-all z-50 hover:scale-110 active:scale-95"
        title="Chat hỗ trợ"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat modal */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 w-[380px] h-[560px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200"
          style={{ animation: 'slideUp 0.25s ease-out' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <Bot size={20} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">ConstructX AI</p>
              <p className="text-xs text-blue-100">Hỗ trợ 24/7 · Grok AI</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab('bot')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'bot'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Bot size={15} /> AI Chatbot
            </button>
            <button
              onClick={() => setActiveTab('support')}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'support'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <HeadphonesIcon size={15} /> Gặp Admin
            </button>
          </div>

          {/* ─── Tab: AI Bot ─────────────────────────────────── */}
          {activeTab === 'bot' && (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center mr-2 mt-0.5 shrink-0">
                        <Bot size={14} className="text-blue-600" />
                      </div>
                    )}
                    <div
                      className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-800 rounded-bl-md'
                      }`}
                    >
                      {formatContent(msg.content)}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center mr-2 shrink-0">
                      <Bot size={14} className="text-blue-600" />
                    </div>
                    <div className="bg-gray-100 px-3 py-2 rounded-2xl rounded-bl-md flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggested questions */}
              {messages.length <= 2 && (
                <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="border-t border-gray-100 p-3 flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Nhập câu hỏi..."
                  disabled={isLoading}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || isLoading}
                  className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </>
          )}

          {/* ─── Tab: Support / Admin ─────────────────────────── */}
          {activeTab === 'support' && (
            <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <HeadphonesIcon size={32} className="text-blue-500 mx-auto mb-2" />
                <p className="font-semibold text-gray-800 mb-1">Hỗ trợ trực tiếp từ Admin</p>
                <p className="text-xs text-gray-500">Phản hồi trong vòng 2-4 giờ làm việc</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Mô tả vấn đề của bạn
                </label>
                <textarea
                  value={supportTopic}
                  onChange={(e) => setSupportTopic(e.target.value)}
                  placeholder="VD: Lỗi thanh toán, tranh chấp với nhà thầu, hỗ trợ kỹ thuật..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />
              </div>

              <button
                onClick={handleCreateSupportRoom}
                disabled={!supportTopic.trim() || isCreatingSupport}
                className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isCreatingSupport ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Đang tạo phòng chat...
                  </>
                ) : (
                  <>
                    <HeadphonesIcon size={16} />
                    Kết nối với Admin
                    <ChevronRight size={16} />
                  </>
                )}
              </button>

              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-500 font-medium mb-2">Hoặc truy cập trang chat đầy đủ:</p>
                <button
                  onClick={() => { setIsOpen(false); navigate('/chat'); }}
                  className="w-full border border-gray-200 text-gray-700 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} />
                  Mở trang Tin nhắn
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};
