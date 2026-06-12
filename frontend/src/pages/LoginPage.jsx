import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import { Lock, Mail, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);

  const isExpired = new URLSearchParams(location.search).get('expired') === '1';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { data } = response.data;
      setAuth(data, data.token);
      toast.success('Đăng nhập thành công!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold font-display text-[#1a4f3a]">ConstructX</h1>
          <p className="text-gray-500 text-sm mt-1">Chào mừng bạn quay trở lại</p>
        </div>

        {isExpired && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-sm text-amber-800">
            <AlertCircle size={16} className="shrink-0 text-amber-500"/>
            Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-widest block mb-1">Email</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#1a4f3a] focus:bg-white transition-all"
                placeholder="email@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-widest block mb-1">Mật khẩu</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">
                <Lock size={18} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#1a4f3a] focus:bg-white transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary py-3 mt-2 text-sm font-bold shadow-lg"
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập ngay'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-[#1a4f3a] font-bold hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
