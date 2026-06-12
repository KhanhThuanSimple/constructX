import { create } from 'zustand';
import api from '../services/api';

const getInitialUser = () => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const user = JSON.parse(raw);
    if (user && user.id == null && user.userId != null) {
      user.id = Number(user.userId);
    } else if (user && user.id != null) {
      user.id = Number(user.id);
    }
    return user;
  } catch (e) {
    return null;
  }
};

const useAuthStore = create((set, get) => ({
  user: getInitialUser(),
  token: localStorage.getItem('token') || null,

  setAuth: (userData, token) => {
    const normalized = {
      ...userData,
      id: Number(userData.userId ?? userData.id),
    };
    localStorage.setItem('user', JSON.stringify(normalized));
    localStorage.setItem('token', token);
    set({ user: normalized, token });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  isAuthenticated: () => !!localStorage.getItem('token'),

  /**
   * Refresh user data từ server — gọi sau khi Admin có thể đã thay đổi trạng thái
   * (approvalStatus, role, v.v.). Silent: không toast lỗi.
   */
  refreshUser: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const res = await api.get('/users/me');
      const userData = res.data.data;
      if (userData) {
        const normalized = {
          ...userData,
          id: Number(userData.userId ?? userData.id),
        };
        localStorage.setItem('user', JSON.stringify(normalized));
        set({ user: normalized });
      }
    } catch {
      // Silent — không làm gián đoạn UI
    }
  },
}));

export default useAuthStore;
