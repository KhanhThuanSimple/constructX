import { create } from 'zustand';

const getInitialUser = () => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const user = JSON.parse(raw);
    // Đảm bảo luôn có field `id` (backend trả userId, không phải id)
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

const useAuthStore = create((set) => ({
  user: getInitialUser(),
  token: localStorage.getItem('token') || null,

  setAuth: (userData, token) => {
    // Chuẩn hoá: map userId → id để toàn app dùng user.id nhất quán
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
}));

export default useAuthStore;
