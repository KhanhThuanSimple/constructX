import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import { User, Mail, Lock, Phone, Briefcase } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'CUSTOMER',
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await api.post('/auth/register', formData);

      const { data } = response.data;

      if (data.token) {
        setAuth(data, data.token);

        toast.success('Đăng ký thành công!');
        navigate('/dashboard');
      } else {
        toast.success(
          'Đăng ký nhà thầu thành công! Vui lòng chờ quản trị viên phê duyệt trước khi đăng nhập.'
        );

        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold font-display text-[#1a4f3a]">
            ConstructX
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Khởi tạo không gian mơ ước của bạn
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-widest block mb-1">
              Họ tên
            </label>

            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">
                <User size={18} />
              </span>

              <input
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fullName: e.target.value,
                  })
                }
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#1a4f3a] focus:bg-white transition-all"
                placeholder="Nguyễn Văn A"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-widest block mb-1">
              Email
            </label>

            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">
                <Mail size={18} />
              </span>

              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  })
                }
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#1a4f3a] focus:bg-white transition-all"
                placeholder="email@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-widest block mb-1">
              Số điện thoại
            </label>

            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">
                <Phone size={18} />
              </span>

              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone: e.target.value,
                  })
                }
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#1a4f3a] focus:bg-white transition-all"
                placeholder="0912 345 678"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-widest block mb-1">
              Mật khẩu
            </label>

            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">
                <Lock size={18} />
              </span>

              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password: e.target.value,
                  })
                }
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-[#1a4f3a] focus:bg-white transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-widest block mb-3">
              Bạn là ai?
            </label>

            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  id: 'CUSTOMER',
                  label: 'Khách hàng',
                  icon: User,
                },
                {
                  id: 'CONTRACTOR',
                  label: 'Nhà thầu',
                  icon: Briefcase,
                },
              ].map((role) => (
                <label
                  key={role.id}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.role === role.id
                      ? 'border-[#1a4f3a] bg-[#1a4f3a]/5 text-[#1a4f3a]'
                      : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.id}
                    checked={formData.role === role.id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value,
                      })
                    }
                    className="hidden"
                  />

                  <role.icon size={20} className="mb-1" />

                  <span className="text-[10px] font-bold uppercase">
                    {role.label}
                  </span>
                </label>
              ))}
            </div>

            {formData.role === 'CONTRACTOR' && (
              <div className="mt-3 rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-xs text-yellow-800 leading-relaxed">
                Tài khoản nhà thầu cần được quản trị viên phê duyệt trước khi đăng nhập và nhận dự án.
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary py-3 mt-2 text-sm font-bold shadow-lg"
          >
            {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Đã có tài khoản?{' '}
            <Link
              to="/login"
              className="text-[#1a4f3a] font-bold hover:underline"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;