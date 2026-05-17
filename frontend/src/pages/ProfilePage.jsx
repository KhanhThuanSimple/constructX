import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Save, Shield, BadgeCheck } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const ProfilePage = () => {
  const { user, setAuth, token } = useAuthStore();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    role: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/me');
      const userData = response.data.data;
      setFormData({
        fullName: userData.fullName || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        address: userData.address || '',
        role: userData.role || ''
      });
      // Sync with store if needed
      setAuth(userData, token);
    } catch (error) {
      toast.error('Không thể lấy thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await api.put('/users/me', {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: formData.address
      });
      const updatedUser = response.data.data;
      setAuth(updatedUser, token);
      toast.success('Cập nhật thông tin thành công!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Cài đặt tài khoản">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a4f3a]"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Cài đặt tài khoản">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-[#1a4f3a] to-[#2d8563] relative">
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
                <div className="w-full h-full rounded-xl bg-[#e8f5ee] flex items-center justify-center text-3xl font-bold text-[#1a4f3a]">
                  {formData.fullName.charAt(0)}
                </div>
              </div>
            </div>
          </div>
          <div className="pt-16 pb-8 px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold font-display">{formData.fullName}</h1>
                <p className="text-gray-500 flex items-center gap-1 text-sm mt-1">
                  {formData.role === 'CUSTOMER' ? 'Khách hàng' : 'Nhà thầu'} • ConstructX Member
                </p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                  <BadgeCheck size={14} /> Đã xác thực
                </span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6 flex items-center gap-2">
                <User size={16} /> Thông tin cá nhân
              </h3>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">Họ và tên</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#1a4f3a] focus:bg-white transition-all outline-none"
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">Email</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400">
                        <Mail size={18} />
                      </span>
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">Số điện thoại</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400">
                        <Phone size={18} />
                      </span>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#1a4f3a] focus:bg-white transition-all outline-none"
                        placeholder="09xx xxx xxx"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">Địa chỉ</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400">
                      <MapPin size={18} />
                    </span>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#1a4f3a] focus:bg-white transition-all outline-none min-h-[100px]"
                      placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-50 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary flex items-center gap-2 px-8 py-3 rounded-xl shadow-lg shadow-[#1a4f3a]/20"
                >
                  {saving ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  ) : (
                    <Save size={18} />
                  )}
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6 flex items-center gap-2">
                <Shield size={16} /> Bảo mật
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-700 mb-1">Mật khẩu</h4>
                  <p className="text-[10px] text-gray-400 mb-3">Cập nhật mật khẩu định kỳ để bảo vệ tài khoản</p>
                  <button type="button" className="text-xs font-bold text-[#1a4f3a] hover:underline">Đổi mật khẩu</button>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-700 mb-1">Vai trò tài khoản</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-1 bg-[#1a4f3a]/10 text-[#1a4f3a] rounded text-[10px] font-bold">
                      {formData.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
              <h3 className="text-sm font-bold text-red-600 mb-2">Vùng nguy hiểm</h3>
              <p className="text-xs text-red-400 mb-4">Một khi xóa tài khoản, bạn không thể khôi phục lại dữ liệu.</p>
              <button type="button" className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-600 hover:text-white transition-all">
                Xóa tài khoản
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ProfilePage;
