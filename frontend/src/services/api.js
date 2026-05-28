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

// Response interceptor: xử lý đồng bộ sự kiện và chặn lỗi 401/403
api.interceptors.response.use(
  (response) => {
    // ĐÃ BỔ SUNG: Tự động bắt tất cả các hành động ghi/sửa dữ liệu thành công
    const method = response.config.method?.toUpperCase();
    if (['POST', 'PUT', 'DELETE'].includes(method)) {
      // Phát đi một tín hiệu tàng hình trên toàn bộ trình duyệt
      const event = new CustomEvent('WALLET_DATA_CHANGED');
      window.dispatchEvent(event);
    }
    return response;
  },
  (error) => {
    // Giữ nguyên logic xử lý 401/403 (token hết hạn hoặc không hợp lệ) của bạn
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;