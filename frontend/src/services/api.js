import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Request interceptor: đính kèm JWT token (Giữ nguyên của bạn)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: xử lý lỗi
api.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toUpperCase();
    if (['POST', 'PUT', 'DELETE'].includes(method)) {
      const event = new CustomEvent('WALLET_DATA_CHANGED');
      window.dispatchEvent(event);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Chỉ redirect khi thực sự token hết hạn (401 Unauthorized)
      const token = localStorage.getItem('token');
      if (token && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    // 403 Forbidden: user không có quyền nhưng vẫn logged in — KHÔNG redirect
    return Promise.reject(error);
  }
);

export default api;