// src/store/chatStore.ts
import { create } from 'zustand';

export interface ChatRoomMember {
  userId: number;
  fullName: string;
  avatarUrl: string;
  roleInRoom: string;
  isOnline: boolean;
  joinedAt: string;
}

export interface ChatRoom {
  id: number;
  roomType: string;
  title: string;
  referenceType?: string;
  referenceId?: number;
  members: ChatRoomMember[];
  lastMessage: ChatMessage | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: number;
  roomId: number;
  senderId: number;      // luôn là number — coerce khi nhận từ backend
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

interface ChatState {
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  messages: ChatMessage[];
  typingUsers: Record<number, string>;
  isConnected: boolean;
  currentUserId: number | null;   // ← source of truth cho userId

  // Actions
  setCurrentUserId: (id: number | null) => void;
  setRooms: (rooms: ChatRoom[]) => void;
  setCurrentRoom: (room: ChatRoom | null) => void;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setTypingUser: (userId: number, userName: string) => void;
  removeTypingUser: (userId: number) => void;
  setConnected: (connected: boolean) => void;
  incrementUnread: (roomId: number) => void;
  resetUnread: (roomId: number) => void;
  updateLastMessage: (message: ChatMessage) => void;
}

/** Coerce senderId thành number để tránh type mismatch string vs number */
const normalizeMessage = (msg: any): ChatMessage => ({
  ...msg,
  id: Number(msg.id),
  roomId: Number(msg.roomId),
  senderId: Number(msg.senderId),
});

export const useChatStore = create<ChatState>((set, get) => ({
  rooms: [],
  currentRoom: null,
  messages: [],
  typingUsers: {},
  isConnected: false,
  currentUserId: null,

  setCurrentUserId: (id) => set({ currentUserId: id !== null ? Number(id) : null }),

  setRooms: (rooms) => set({ rooms }),

  setCurrentRoom: (room) => {
    set({ currentRoom: room, messages: [] });
    if (room) {
      const rooms = get().rooms.map((r) =>
        r.id === room.id ? { ...r, unreadCount: 0 } : r
      );
      set({ rooms });
    }
  },

  addMessage: (message) => {
    const normalized = normalizeMessage(message);
    const { messages, currentRoom } = get();
    if (messages.some((m) => m.id === normalized.id)) return;
    set({ messages: [...messages, normalized] });
    get().updateLastMessage(normalized);
    if (!currentRoom || normalized.roomId !== currentRoom.id) {
      get().incrementUnread(normalized.roomId);
    }
  },

  setMessages: (messages) => set({ messages: messages.map(normalizeMessage) }),

  updateLastMessage: (message) => {
    const rooms = get().rooms.map((r) =>
      r.id === message.roomId ? { ...r, lastMessage: message } : r
    );
    set({ rooms });
  },

  setTypingUser: (userId, userName) => {
    const typingUsers = { ...get().typingUsers, [userId]: userName };
    set({ typingUsers });
    setTimeout(() => get().removeTypingUser(userId), 3000);
  },

  removeTypingUser: (userId) => {
    const typingUsers = { ...get().typingUsers };
    delete typingUsers[userId];
    set({ typingUsers });
  },

  setConnected: (connected) => set({ isConnected: connected }),

  incrementUnread: (roomId) => {
    const rooms = get().rooms.map((r) =>
      r.id === roomId ? { ...r, unreadCount: r.unreadCount + 1 } : r
    );
    set({ rooms });
  },

  resetUnread: (roomId) => {
    const rooms = get().rooms.map((r) =>
      r.id === roomId ? { ...r, unreadCount: 0 } : r
    );
    set({ rooms });
  },
}));
