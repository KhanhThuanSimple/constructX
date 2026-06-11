// src/services/chatapi.ts
import api from './api';

export const chatApi = {
  // ─── User endpoints ──────────────────────────────────────────────────────
  getRooms: (page = 0, size = 20) =>
    api.get(`/chat/rooms?page=${page}&size=${size}`),

  getMessages: (roomId: number, page = 0, size = 50) =>
    api.get(`/chat/rooms/${roomId}/messages?page=${page}&size=${size}`),

  getRoomMembers: (roomId: number) =>
    api.get(`/chat/rooms/${roomId}/members`),

  createRoom: (data: {
    roomType: string;
    referenceType?: string;
    referenceId?: number;
    title?: string;
    memberIds: number[];
  }) => api.post('/chat/rooms', data),

  /** Tạo phòng DIRECT với contractor */
  createDirectRoom: (data: {
    contractorId: number;
    title?: string;
    referenceType?: string;
    referenceId?: number;
  }) => api.post('/chat/direct', data),

  /** Tạo phòng SUPPORT với Admin */
  createSupportRoom: (topic: string) =>
    api.post('/chat/support', { topic }),

  /** Tạo phòng DISPUTE 3 bên từ contract job */
  createDisputeRoom: (contractJobId: number, reason: string) =>
    api.post(`/chat/dispute/${contractJobId}`, { reason }),

  uploadFile: (roomId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/chat/messages/${roomId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // ─── AI Chatbot ──────────────────────────────────────────────────────────
  /** Grok AI chatbot 24/7 */
  chatWithBot: (message: string, history: Array<{ role: string; content: string }> = []) =>
    api.post('/chat/chatbot', { message, history }),

  // ─── Admin endpoints ─────────────────────────────────────────────────────
  getAllRooms: (page = 0, size = 50) =>
    api.get(`/chat/admin/rooms?page=${page}&size=${size}`),

  searchMessages: (roomId: number, keyword: string, page = 0, size = 50) =>
    api.get(`/chat/admin/rooms/${roomId}/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`),

  pinMessage: (messageId: number) =>
    api.post(`/chat/admin/messages/${messageId}/pin`),
};
