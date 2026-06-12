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
    const status = error.response?.status;
    const url = error.config?.url || '';

    if (status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else if (status === 403) {
      // Kiểm tra xem có token không — nếu có token mà vẫn 403 thì token hết hạn
      const token = localStorage.getItem('token');
      if (token && !url.includes('/auth/')) {
        // Thử decode để kiểm tra expiry
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const now = Math.floor(Date.now() / 1000);
          if (payload.exp && payload.exp < now) {
            // Token đã hết hạn
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login?expired=1';
            }
          }
        } catch {
          // Token malformed — clear it
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;