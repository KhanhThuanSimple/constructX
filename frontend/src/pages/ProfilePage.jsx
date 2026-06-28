import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import {
  User, Mail, Phone, MapPin, Save, Shield, BadgeCheck,
  Building, Upload, Image as ImageIcon, Briefcase, Award, CheckSquare, Clock
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { useNavigate, useLocation } from 'react-router-dom';

const ProfilePage = () => {
  const { user, setAuth, token } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'basic'); // 'basic' | 'portfolio'

  // Tab 1 state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    role: ''
  });

  // Tab 2 state (Contractor Portfolio Profile)
  const [portfolioData, setPortfolioData] = useState({
    companyName: '',
    logoUrl: '',
    avatarUrl: '',
    yearEstablished: 2020,
    address: '',
    phoneNumber: '',
    email: '',
    shortIntro: '',
    designInterior: false,
    constructInterior: false,
    produceWood: false,
    renovateHouse: false,
    experienceYears: 5,
    completedProjectsCount: 100,
    rating: 5.0,
    customerCount: '100+',
    warranty24Months: false,
    freeQuote: false,
    onTimeProgress: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfileAndPortfolio();
  }, []);

  const fetchProfileAndPortfolio = async () => {
    setLoading(true);
    try {
      // 1. Fetch basic profile
      const response = await api.get('/users/me');
      const userData = response.data.data;
      setFormData({
        fullName: userData.fullName || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        address: userData.address || '',
        role: userData.role || ''
      });
      setAuth(userData, token);

      // 2. Fetch contractor portfolio if role is CONTRACTOR
      if (userData.role === 'CONTRACTOR') {
        try {
          const pResponse = await api.get('/contractor-profile/my');
          if (pResponse.data?.data) {
            const pData = pResponse.data.data;
            setPortfolioData({
              companyName: pData.companyName || userData.fullName || '',
              logoUrl: pData.logoUrl || '',
              avatarUrl: pData.avatarUrl || userData.avatarUrl || '',
              yearEstablished: pData.yearEstablished || 2020,
              address: pData.address || userData.address || '',
              phoneNumber: pData.phoneNumber || userData.phoneNumber || '',
              email: pData.email || userData.email || '',
              shortIntro: pData.shortIntro || '',
              designInterior: pData.designInterior || false,
              constructInterior: pData.constructInterior || false,
              produceWood: pData.produceWood || false,
              renovateHouse: pData.renovateHouse || false,
              experienceYears: pData.experienceYears || 5,
              completedProjectsCount: pData.completedProjectsCount || 100,
              rating: pData.rating || 5.0,
              customerCount: pData.customerCount || '100+',
              warranty24Months: pData.warranty24Months || false,
              freeQuote: pData.freeQuote || false,
              onTimeProgress: pData.onTimeProgress || false,
            });
          }
        } catch (portfolioErr) {
          console.error("Lỗi tải hồ sơ năng lực thầu:", portfolioErr);
          toast.error("Không thể tải hồ sơ năng lực thầu");
        }
      }
    } catch (error) {
      toast.error('Không thể lấy thông tin tài khoản');
    } finally {
      setLoading(false);
    }
  };

  const uploadImageToCloudinary = async (file) => {
    try {
      const cloudName = 'dtufvt361';
      const apiKey = '891517336858882';
      const apiSecret = 'Sp6F1ZaE4r4dYMi5Lo-goe6TBMQ';
      
      const timestamp = Math.round((new Date).getTime() / 1000);
      const signatureString = `timestamp=${timestamp}${apiSecret}`;
      
      const encoder = new TextEncoder();
      const data = encoder.encode(signatureString);
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('api_key', apiKey);
      uploadData.append('timestamp', timestamp);
      uploadData.append('signature', signature);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: uploadData }
      );

      const dataRes = await response.json();
      if (!response.ok) {
        toast.error('Tải ảnh thất bại: ' + (dataRes.error?.message || 'Lỗi không rõ'));
        return null;
      }
      return dataRes.secure_url;
    } catch (error) {
      toast.error('Lỗi upload: ' + error.message);
      return null;
    }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImageToCloudinary(file);
    if (url) {
      setPortfolioData(prev => ({ ...prev, [field]: url }));
      toast.success('Tải ảnh lên thành công!');
    }
    setUploading(false);
  };

  const handleBasicSubmit = async (e) => {
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

  const handlePortfolioSubmit = async (e) => {
    e.preventDefault();
    
    // Validate intro length
    if (portfolioData.shortIntro.length < 100 || portfolioData.shortIntro.length > 200) {
      toast.error('Giới thiệu ngắn phải từ 100 đến 200 ký tự');
      return;
    }

    setSaving(true);
    try {
      await api.put('/contractor-profile/my', portfolioData);
      toast.success('Cập nhật hồ sơ năng lực thành công!');
      fetchProfileAndPortfolio();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cập nhật hồ sơ thất bại');
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

  const isContractor = formData.role === 'CONTRACTOR';

  return (
    <Layout title="Cài đặt tài khoản">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Banner */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-[#1a4f3a] to-[#2d8563] relative">
            <div className="absolute -bottom-12 left-8 flex items-end gap-4">
              <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg overflow-hidden">
                {isContractor && portfolioData.logoUrl ? (
                  <img src={portfolioData.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-full rounded-xl bg-[#e8f5ee] flex items-center justify-center text-3xl font-bold text-[#1a4f3a]">
                    {formData.fullName.charAt(0)}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="pt-16 pb-6 px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold font-display">{formData.fullName}</h1>
                <p className="text-gray-500 flex items-center gap-1 text-sm mt-1">
                  {isContractor ? 'Nhà thầu nội thất' : 'Khách hàng'} • ConstructX Member
                </p>
              </div>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                  isContractor && user?.approvalStatus !== 'APPROVED'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  <BadgeCheck size={14} /> 
                  {isContractor 
                    ? (user?.approvalStatus === 'APPROVED' ? 'Đã duyệt hoạt động' : 'Chờ phê duyệt')
                    : 'Đã xác thực'
                  }
                </span>
              </div>
            </div>

            {/* TAB SELECTOR */}
            {isContractor && (
              <div className="flex gap-4 mt-8 border-b border-gray-100">
                <button
                  onClick={() => setActiveTab('basic')}
                  className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
                    activeTab === 'basic' ? 'border-[#1a4f3a] text-[#1a4f3a]' : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Thông tin cá nhân
                </button>
                <button
                  onClick={() => setActiveTab('portfolio')}
                  className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
                    activeTab === 'portfolio' ? 'border-[#1a4f3a] text-[#1a4f3a]' : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Hồ sơ năng lực nhà thầu
                </button>
              </div>
            )}
          </div>
        </div>

        {/* TAB 1: THÔNG TIN CÁ NHÂN */}
        {activeTab === 'basic' && (
          <form onSubmit={handleBasicSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            </div>
          </form>
        )}

        {/* TAB 2: HỒ SƠ NĂNG LỰC NHÀ THẦU */}
        {activeTab === 'portfolio' && isContractor && (
          <form onSubmit={handlePortfolioSubmit} className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-8">
              
              {/* Phần 1: Thông tin cơ bản */}
              <div className="space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1a4f3a] border-b border-gray-50 pb-2 flex items-center gap-2">
                  <Building size={16} /> 1. Thông tin cơ bản nhà thầu
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">Tên nhà thầu / Công ty</label>
                    <input
                      type="text"
                      value={portfolioData.companyName}
                      onChange={(e) => setPortfolioData({...portfolioData, companyName: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#1a4f3a] focus:bg-white transition-all outline-none font-semibold"
                      placeholder="VD: Nội Thất Xinh"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">Năm thành lập</label>
                    <input
                      type="number"
                      value={portfolioData.yearEstablished}
                      onChange={(e) => setPortfolioData({...portfolioData, yearEstablished: parseInt(e.target.value) || 2020})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#1a4f3a] focus:bg-white transition-all outline-none"
                      placeholder="VD: 2018"
                      required
                    />
                  </div>
                </div>

                {/* Upload Logo và Avatar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">Logo nhà thầu</label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200 overflow-hidden">
                        {portfolioData.logoUrl ? (
                          <img src={portfolioData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={20} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={portfolioData.logoUrl}
                          onChange={(e) => setPortfolioData({...portfolioData, logoUrl: e.target.value})}
                          className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-[#1a4f3a] mb-2"
                          placeholder="Nhập URL ảnh hoặc upload..."
                        />
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-all">
                          <Upload size={12} /> Tải ảnh lên
                          <input type="file" onChange={(e) => handleFileUpload(e, 'logoUrl')} className="hidden" accept="image/*" />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">Ảnh đại diện profile</label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200 overflow-hidden">
                        {portfolioData.avatarUrl ? (
                          <img src={portfolioData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={20} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={portfolioData.avatarUrl}
                          onChange={(e) => setPortfolioData({...portfolioData, avatarUrl: e.target.value})}
                          className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-[#1a4f3a] mb-2"
                          placeholder="Nhập URL ảnh hoặc upload..."
                        />
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-all">
                          <Upload size={12} /> Tải ảnh lên
                          <input type="file" onChange={(e) => handleFileUpload(e, 'avatarUrl')} className="hidden" accept="image/*" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">Địa chỉ thi công</label>
                    <input
                      type="text"
                      value={portfolioData.address}
                      onChange={(e) => setPortfolioData({...portfolioData, address: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#1a4f3a] focus:bg-white transition-all outline-none"
                      placeholder="Số nhà, Tỉnh/TP..."
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">Số điện thoại liên hệ</label>
                    <input
                      type="text"
                      value={portfolioData.phoneNumber}
                      onChange={(e) => setPortfolioData({...portfolioData, phoneNumber: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#1a4f3a] focus:bg-white transition-all outline-none"
                      placeholder="09xxx..."
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">Email giao dịch</label>
                    <input
                      type="email"
                      value={portfolioData.email}
                      onChange={(e) => setPortfolioData({...portfolioData, email: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#1a4f3a] focus:bg-white transition-all outline-none"
                      placeholder="partner@gmail.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Phần 2: Giới thiệu ngắn */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1a4f3a] border-b border-gray-50 pb-2 flex items-center gap-2">
                  <Briefcase size={16} /> 2. Giới thiệu ngắn về doanh nghiệp
                </h3>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">
                    Mô tả ngắn gọn (Từ 100 đến 200 ký tự)
                  </label>
                  <textarea
                    rows={3}
                    value={portfolioData.shortIntro}
                    onChange={(e) => setPortfolioData({...portfolioData, shortIntro: e.target.value})}
                    placeholder="Chuyên thiết kế và thi công nội thất nhà ở, căn hộ, văn phòng với đội ngũ giàu kinh nghiệm, cam kết chất lượng và đúng tiến độ."
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#1a4f3a] focus:bg-white transition-all outline-none font-medium"
                    maxLength={300}
                    required
                  />
                  <div className="flex justify-between items-center mt-1.5 text-xs">
                    <span className={portfolioData.shortIntro.length < 100 || portfolioData.shortIntro.length > 200 ? 'text-red-500 font-bold' : 'text-green-600 font-bold'}>
                      Độ dài hiện tại: {portfolioData.shortIntro.length} ký tự
                    </span>
                    <span className="text-gray-400">Yêu cầu: 100 - 200 ký tự</span>
                  </div>
                </div>
              </div>

              {/* Phần 3: Lĩnh vực hoạt động */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1a4f3a] border-b border-gray-50 pb-2 flex items-center gap-2">
                  <CheckSquare size={16} /> 3. Lĩnh vực hoạt động
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-150 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={portfolioData.designInterior}
                      onChange={(e) => setPortfolioData({...portfolioData, designInterior: e.target.checked})}
                      className="accent-[#1a4f3a] w-4 h-4 rounded"
                    />
                    <span className="text-sm font-semibold text-gray-700">Thiết kế nội thất</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-150 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={portfolioData.constructInterior}
                      onChange={(e) => setPortfolioData({...portfolioData, constructInterior: e.target.checked})}
                      className="accent-[#1a4f3a] w-4 h-4 rounded"
                    />
                    <span className="text-sm font-semibold text-gray-700">Thi công nội thất</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-150 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={portfolioData.produceWood}
                      onChange={(e) => setPortfolioData({...portfolioData, produceWood: e.target.checked})}
                      className="accent-[#1a4f3a] w-4 h-4 rounded"
                    />
                    <span className="text-sm font-semibold text-gray-700">Sản xuất đồ gỗ</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-150 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={portfolioData.renovateHouse}
                      onChange={(e) => setPortfolioData({...portfolioData, renovateHouse: e.target.checked})}
                      className="accent-[#1a4f3a] w-4 h-4 rounded"
                    />
                    <span className="text-sm font-semibold text-gray-700">Cải tạo nhà ở</span>
                  </label>
                </div>
              </div>

              {/* Phần 4: Thống kê năng lực */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1a4f3a] border-b border-gray-50 pb-2 flex items-center gap-2">
                  <Award size={16} /> 4. Thống kê năng lực
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">Số năm kinh nghiệm</label>
                    <input
                      type="number"
                      value={portfolioData.experienceYears}
                      onChange={(e) => setPortfolioData({...portfolioData, experienceYears: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#1a4f3a] focus:bg-white transition-all outline-none"
                      placeholder="VD: 5"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">Số lượng dự án hoàn thành</label>
                    <input
                      type="number"
                      value={portfolioData.completedProjectsCount}
                      onChange={(e) => setPortfolioData({...portfolioData, completedProjectsCount: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#1a4f3a] focus:bg-white transition-all outline-none"
                      placeholder="VD: 120"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">Số khách hàng phục vụ</label>
                    <input
                      type="text"
                      value={portfolioData.customerCount}
                      onChange={(e) => setPortfolioData({...portfolioData, customerCount: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#1a4f3a] focus:bg-white transition-all outline-none font-semibold"
                      placeholder="VD: 150+"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Phần 5: Chính sách */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1a4f3a] border-b border-gray-50 pb-2 flex items-center gap-2">
                  <Clock size={16} /> 5. Chính sách & Cam kết
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-150 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={portfolioData.warranty24Months}
                      onChange={(e) => setPortfolioData({...portfolioData, warranty24Months: e.target.checked})}
                      className="accent-[#1a4f3a] w-4 h-4 rounded"
                    />
                    <span className="text-sm font-semibold text-gray-700">Bảo hành 24 tháng</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-150 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={portfolioData.freeQuote}
                      onChange={(e) => setPortfolioData({...portfolioData, freeQuote: e.target.checked})}
                      className="accent-[#1a4f3a] w-4 h-4 rounded"
                    />
                    <span className="text-sm font-semibold text-gray-700">Báo giá miễn phí</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-150 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={portfolioData.onTimeProgress}
                      onChange={(e) => setPortfolioData({...portfolioData, onTimeProgress: e.target.checked})}
                      className="accent-[#1a4f3a] w-4 h-4 rounded"
                    />
                    <span className="text-sm font-semibold text-gray-700">Thi công đúng tiến độ</span>
                  </label>
                </div>
              </div>

              {/* Nút submit */}
              <div className="pt-6 border-t border-gray-50 flex justify-end">
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="btn btn-primary flex items-center gap-2 px-10 py-3.5 rounded-xl shadow-lg shadow-[#1a4f3a]/20 font-bold animate-bounce"
                >
                  {saving ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  ) : (
                    <Save size={18} />
                  )}
                  {saving ? 'Đang lưu hồ sơ...' : (user?.approvalStatus !== 'APPROVED' ? 'Gửi hồ sơ duyệt ngay 🚀' : 'Cập nhật hồ sơ')}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage;
