import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import {
  User, Mail, Phone, MapPin, Save, Shield, BadgeCheck,
  Building, Upload, Image as ImageIcon, Briefcase, Award, CheckSquare, Clock,
  CreditCard, Camera, FileCheck, AlertCircle, CheckCircle2, Clock3, ChevronRight,
  ShoppingBag, Trophy, Eye, Star, Activity
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { useNavigate, useLocation } from 'react-router-dom';

const ProfilePage = () => {
  const { user, setAuth, token } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'basic'); // 'basic' | 'portfolio' | 'kyc'

  // KYC state — lưu trong localStorage để giữ trạng thái demo
  const [kycData, setKycData] = useState(() => {
    try {
      const saved = localStorage.getItem(`kyc_${user?.id || 'guest'}`);
      return saved ? JSON.parse(saved) : {
        status: 'UNVERIFIED', // UNVERIFIED | PENDING | VERIFIED
        idType: 'CCCD',       // CCCD | PASSPORT
        idNumber: '',
        idFrontUrl: '',
        idBackUrl: '',
        selfieUrl: '',
        submittedAt: null,
        verifiedAt: null,
      };
    } catch { return { status: 'UNVERIFIED', idType: 'CCCD', idNumber: '', idFrontUrl: '', idBackUrl: '', selfieUrl: '', submittedAt: null, verifiedAt: null }; }
  });
  const [kycUploading, setKycUploading] = useState({ front: false, back: false, selfie: false });
  const [kycSubmitting, setKycSubmitting] = useState(false);

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
      const formData = new FormData();
      formData.append('file', file);

      // Dùng backend local upload thay vì Cloudinary (tránh lỗi preset)
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.url) {
        return response.data.url;
      }
      toast.error('Upload thất bại: phản hồi không hợp lệ từ server');
      return null;
    } catch (error) {
      const msg = error.response?.data?.error || error.message || 'Lỗi upload';
      toast.error('Upload thất bại: ' + msg);
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

  // ── KYC handlers ──────────────────────────────────────────────────────────
  const saveKycToStorage = (data) => {
    localStorage.setItem(`kyc_${user?.id || 'guest'}`, JSON.stringify(data));
    setKycData(data);
  };

  const handleKycImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    setKycUploading(prev => ({ ...prev, [field]: true }));
    const url = await uploadImageToCloudinary(file);
    if (url) {
      const updated = { ...kycData, [`${field}Url`]: url };
      saveKycToStorage(updated);
      toast.success('Tải ảnh lên thành công!');
    }
    setKycUploading(prev => ({ ...prev, [field]: false }));
  };

  const handleKycSubmit = async (e) => {
    e.preventDefault();
    if (!kycData.idNumber.trim()) { toast.error('Vui lòng nhập số CCCD/Hộ chiếu'); return; }
    if (!kycData.idFrontUrl)       { toast.error('Vui lòng tải ảnh mặt trước CCCD/Hộ chiếu'); return; }
    if (!kycData.selfieUrl)        { toast.error('Vui lòng tải ảnh selfie cầm giấy tờ'); return; }

    setKycSubmitting(true);
    // Simulate API call — trong thực tế gọi POST /api/users/kyc
    await new Promise(r => setTimeout(r, 1200));
    const updated = { ...kycData, status: 'PENDING', submittedAt: new Date().toISOString() };
    saveKycToStorage(updated);
    toast.success('Hồ sơ KYC đã được gửi! Admin sẽ xét duyệt trong 1-2 ngày làm việc.');
    setKycSubmitting(false);
  };

  // Demo: Admin approve KYC (chỉ dùng để demo trạng thái VERIFIED)
  const handleKycApproveDemo = () => {
    const updated = { ...kycData, status: 'VERIFIED', verifiedAt: new Date().toISOString() };
    saveKycToStorage(updated);
    toast.success('✅ [Demo] Xác minh thành công — badge Verified Customer được cấp!');
  };

  const handleKycReset = () => {
    const fresh = { status: 'UNVERIFIED', idType: 'CCCD', idNumber: '', idFrontUrl: '', idBackUrl: '', selfieUrl: '', submittedAt: null, verifiedAt: null };
    saveKycToStorage(fresh);
    toast('Đã đặt lại trạng thái KYC');
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
  const kycStatusCfg = {
    UNVERIFIED: { label: 'Chưa xác minh',   icon: <AlertCircle size={14}/>,  color: 'text-gray-500',  bg: 'bg-gray-100',   border: 'border-gray-200',   dot: 'bg-gray-400' },
    PENDING:    { label: 'Đang xác minh',    icon: <Clock3 size={14}/>,       color: 'text-amber-600', bg: 'bg-amber-50',   border: 'border-amber-200',  dot: 'bg-amber-400 animate-pulse' },
    VERIFIED:   { label: 'Đã xác minh',      icon: <CheckCircle2 size={14}/>, color: 'text-green-600', bg: 'bg-green-50',   border: 'border-green-200',  dot: 'bg-green-500' },
  };
  const kycCfg = kycStatusCfg[kycData.status] || kycStatusCfg.UNVERIFIED;

  // Sidebar nav items
  const sidebarTabs = [
    { key: 'basic',     label: 'Thông tin cá nhân',   icon: <User size={15}/> },
    { key: 'kyc',       label: 'Xác minh danh tính',  icon: <CreditCard size={15}/> },
    ...(isContractor ? [{ key: 'portfolio', label: 'Hồ sơ năng lực', icon: <Briefcase size={15}/> }] : []),
    { key: 'security',  label: 'Bảo mật',              icon: <Shield size={15}/> },
  ];

  return (
    <Layout title="Cài đặt tài khoản">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Hero Banner ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-28 bg-gradient-to-r from-[#1a4f3a] to-[#2d8563] relative">
            <div className="absolute inset-0 opacity-10"
              style={{backgroundImage:'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}
            />
            <div className="absolute -bottom-10 left-6 flex items-end gap-4">
              <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-lg overflow-hidden ring-4 ring-white">
                {isContractor && portfolioData.logoUrl ? (
                  <img src={portfolioData.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-full rounded-xl bg-[#e8f5ee] flex items-center justify-center text-2xl font-bold text-[#1a4f3a]">
                    {formData.fullName.charAt(0)}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="pt-14 pb-5 px-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold">{formData.fullName}</h1>
                {kycData.status === 'VERIFIED' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-200 rounded-full text-[10px] font-black text-blue-700">
                    <BadgeCheck size={11}/> Verified Customer
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1.5">
                {isContractor ? '🔨 Nhà thầu nội thất' : '🏠 Khách hàng'}
                <span className="text-gray-200">•</span>
                <span className={`inline-flex items-center gap-1 font-semibold ${kycCfg.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${kycCfg.dot}`}/>
                  {kycCfg.label}
                </span>
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border ${
                isContractor && user?.approvalStatus !== 'APPROVED'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-green-50 text-green-700 border-green-200'
              }`}>
                <BadgeCheck size={13}/>
                {isContractor ? (user?.approvalStatus === 'APPROVED' ? 'Nhà thầu đã duyệt' : 'Chờ phê duyệt') : 'Tài khoản hoạt động'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Main layout: sidebar + content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

          {/* ── Sidebar ── */}
          <div className="lg:col-span-1 space-y-4">
            {/* Nav */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {sidebarTabs.map((tab, i) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold transition-all ${
                    i < sidebarTabs.length - 1 ? 'border-b border-gray-50' : ''
                  } ${activeTab === tab.key
                    ? 'bg-[#e8f5ee] text-[#1a4f3a]'
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">{tab.icon}{tab.label}</span>
                  <ChevronRight size={14} className={activeTab === tab.key ? 'text-[#1a4f3a]' : 'text-gray-300'}/>
                </button>
              ))}
            </div>

            {/* Stats card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Thống kê hoạt động</p>
              {[
                { icon: <ShoppingBag size={13}/>, label: 'Đơn hàng', value: '—' },
                { icon: <Trophy size={13}/>, label: 'Hợp đồng hoàn thành', value: '—' },
                { icon: <Star size={13}/>, label: 'Đánh giá', value: '—' },
                { icon: <Activity size={13}/>, label: 'Tham gia từ', value: user?.createdAt ? new Date(user.createdAt).getFullYear() : '2026' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">{s.icon}{s.label}</span>
                  <span className="text-xs font-bold text-gray-800">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Content ── */}
          <div className="lg:col-span-3 space-y-6">

        {/* TAB: THÔNG TIN CÁ NHÂN */}
        {activeTab === 'basic' && (
          <form onSubmit={handleBasicSubmit} className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6 flex items-center gap-2">
                <User size={16} /> Thông tin cá nhân
              </h3>
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">Họ và tên</label>
                  <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#1a4f3a] focus:bg-white transition-all outline-none" placeholder="Nguyễn Văn A" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">Email</label>
                    <div className="relative"><span className="absolute left-3 top-3 text-gray-400"><Mail size={16}/></span>
                      <input type="email" value={formData.email} disabled className="w-full pl-9 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-400 cursor-not-allowed outline-none"/>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">Số điện thoại</label>
                    <div className="relative"><span className="absolute left-3 top-3 text-gray-400"><Phone size={16}/></span>
                      <input type="tel" value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#1a4f3a] focus:bg-white transition-all outline-none" placeholder="09xx xxx xxx"/>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">Địa chỉ</label>
                  <div className="relative"><span className="absolute left-3 top-3 text-gray-400"><MapPin size={16}/></span>
                    <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#1a4f3a] focus:bg-white transition-all outline-none min-h-[80px]"
                      placeholder="Số nhà, đường, phường, quận, tỉnh/thành phố"/>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-5 border-t border-gray-50 flex justify-end">
                <button type="submit" disabled={saving}
                  className="btn btn-primary flex items-center gap-2 px-7 py-2.5 rounded-xl shadow-lg shadow-[#1a4f3a]/20">
                  {saving ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"/> : <Save size={16}/>}
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB: BẢO MẬT */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2"><Shield size={16}/> Bảo mật tài khoản</h3>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-gray-700">Mật khẩu</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Cập nhật mật khẩu định kỳ để bảo vệ tài khoản</p>
              </div>
              <button type="button" className="text-xs font-bold text-[#1a4f3a] border border-[#1a4f3a]/30 px-3 py-1.5 rounded-lg hover:bg-[#e8f5ee] transition-all">Đổi mật khẩu</button>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <h4 className="text-xs font-bold text-gray-700 mb-2">Vai trò tài khoản</h4>
              <span className="px-2.5 py-1 bg-[#1a4f3a]/10 text-[#1a4f3a] rounded-lg text-[11px] font-bold">{formData.role}</span>
            </div>
          </div>
        )}

        {/* TAB: XÁC MINH DANH TÍNH KYC */}
        {activeTab === 'kyc' && (
          <div className="space-y-5">
            {/* Status header */}
            <div className={`rounded-2xl border p-5 flex flex-wrap items-center justify-between gap-4 ${kycCfg.bg} ${kycCfg.border}`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${kycCfg.bg} border ${kycCfg.border}`}>
                  <span className={kycCfg.color}>{
                    kycData.status === 'VERIFIED'   ? <CheckCircle2 size={24}/> :
                    kycData.status === 'PENDING'    ? <Clock3 size={24}/> :
                    <AlertCircle size={24}/>
                  }</span>
                </div>
                <div>
                  <p className={`font-black text-base ${kycCfg.color}`}>{kycCfg.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {kycData.status === 'VERIFIED'   && `Xác minh lúc: ${new Date(kycData.verifiedAt).toLocaleDateString('vi-VN')}`}
                    {kycData.status === 'PENDING'    && `Nộp lúc: ${new Date(kycData.submittedAt).toLocaleDateString('vi-VN')} · Đang xét duyệt`}
                    {kycData.status === 'UNVERIFIED' && 'Hoàn thành xác minh để nhận badge Verified Customer'}
                  </p>
                </div>
              </div>
              {/* Demo controls */}
              <div className="flex gap-2">
                {kycData.status === 'PENDING' && (
                  <button onClick={handleKycApproveDemo}
                    className="text-xs font-bold px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all">
                    [Demo] Duyệt ngay ✓
                  </button>
                )}
                {kycData.status !== 'UNVERIFIED' && (
                  <button onClick={handleKycReset}
                    className="text-xs font-semibold px-3 py-1.5 bg-white border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition-all">
                    Đặt lại demo
                  </button>
                )}
              </div>
            </div>

            {/* Sau khi verified — show benefits */}
            {kycData.status === 'VERIFIED' && (
              <div className="bg-white rounded-2xl border border-green-200 p-5">
                <p className="text-sm font-black text-green-700 mb-3 flex items-center gap-2"><BadgeCheck size={18}/> Quyền lợi sau khi xác minh</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    '✓ Badge "Verified Customer" trên hồ sơ',
                    '✓ Ưu tiên hiển thị khi đặt dự án',
                    '✓ Tăng giới hạn giao dịch ví',
                    '✓ Truy cập các nhà thầu cao cấp',
                    '✓ Bảo vệ tranh chấp ưu tiên',
                    '✓ Nhận hỗ trợ chuyên viên 24/7',
                  ].map(b => <p key={b} className="text-xs text-gray-600 bg-green-50 px-3 py-2 rounded-lg font-medium">{b}</p>)}
                </div>
              </div>
            )}

            {/* Form upload — chỉ hiện khi chưa verified */}
            {kycData.status !== 'VERIFIED' && (
              <form onSubmit={handleKycSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">

                {/* Loại giấy tờ */}
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-3">Loại giấy tờ tùy thân <span className="text-red-500">*</span></label>
                  <div className="flex gap-3">
                    {[{ val: 'CCCD', label: '🪪 CCCD / CMND' }, { val: 'PASSPORT', label: '📘 Hộ chiếu' }].map(t => (
                      <label key={t.val} className={`flex-1 flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        kycData.idType === t.val ? 'border-[#1a4f3a] bg-[#e8f5ee]' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input type="radio" name="idType" value={t.val} checked={kycData.idType === t.val}
                          onChange={() => saveKycToStorage({ ...kycData, idType: t.val })} className="accent-[#1a4f3a]"/>
                        <span className="text-sm font-semibold text-gray-700">{t.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Số giấy tờ */}
                <div>
                  <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">
                    Số {kycData.idType === 'CCCD' ? 'CCCD / CMND' : 'Hộ chiếu'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={kycData.idNumber}
                    onChange={(e) => saveKycToStorage({ ...kycData, idNumber: e.target.value.replace(/\D/g,'') })}
                    placeholder={kycData.idType === 'CCCD' ? '12 số CCCD hoặc 9 số CMND...' : 'B1234567...'}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono tracking-wider focus:border-[#1a4f3a] focus:bg-white transition-all outline-none"
                    maxLength={12}
                    required
                  />
                </div>

                {/* Upload ảnh */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Mặt trước */}
                  <KycUploadBox
                    label={kycData.idType === 'CCCD' ? 'Mặt trước CCCD' : 'Trang chính hộ chiếu'}
                    hint="Rõ nét, đủ 4 góc"
                    icon={<CreditCard size={22}/>}
                    previewUrl={kycData.idFrontUrl}
                    loading={kycUploading.front}
                    required
                    onChange={(e) => handleKycImageUpload(e, 'front')}
                  />
                  {/* Mặt sau */}
                  <KycUploadBox
                    label={kycData.idType === 'CCCD' ? 'Mặt sau CCCD' : 'Ảnh bổ sung (tùy chọn)'}
                    hint="Không bắt buộc với hộ chiếu"
                    icon={<FileCheck size={22}/>}
                    previewUrl={kycData.idBackUrl}
                    loading={kycUploading.back}
                    onChange={(e) => handleKycImageUpload(e, 'back')}
                  />
                  {/* Selfie */}
                  <KycUploadBox
                    label="Ảnh selfie cầm giấy tờ"
                    hint="Khuôn mặt + giấy tờ rõ"
                    icon={<Camera size={22}/>}
                    previewUrl={kycData.selfieUrl}
                    loading={kycUploading.selfie}
                    required
                    onChange={(e) => handleKycImageUpload(e, 'selfie')}
                  />
                </div>

                {/* Hướng dẫn */}
                <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-[11px] text-blue-800 space-y-1">
                  <p className="font-black text-blue-700 mb-1.5 flex items-center gap-1.5"><Eye size={13}/> Yêu cầu ảnh hợp lệ</p>
                  <p>• Ảnh chụp thẳng, đủ sáng, không mờ, không bị che khuất</p>
                  <p>• CCCD/Hộ chiếu còn hiệu lực, không bị rách hư</p>
                  <p>• Ảnh selfie: khuôn mặt nhìn thấy rõ, cầm giấy tờ trước ngực</p>
                  <p>• Định dạng: JPG, PNG — Tối đa 5MB mỗi ảnh</p>
                </div>

                {/* Submit */}
                {kycData.status === 'PENDING' ? (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center">
                    <Clock3 size={20} className="mx-auto text-amber-500 mb-2"/>
                    <p className="text-sm font-bold text-amber-700">Hồ sơ đang chờ xét duyệt</p>
                    <p className="text-xs text-amber-600 mt-1">Admin sẽ xét duyệt trong 1–2 ngày làm việc. Bạn sẽ nhận thông báo khi có kết quả.</p>
                  </div>
                ) : (
                  <div className="flex justify-end pt-2 border-t border-gray-50">
                    <button type="submit" disabled={kycSubmitting}
                      className="flex items-center gap-2 px-7 py-2.5 bg-[#1a4f3a] hover:bg-[#163b2d] text-white text-sm font-bold rounded-xl shadow-lg shadow-[#1a4f3a]/20 transition-all disabled:opacity-50">
                      {kycSubmitting ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"/> : <Shield size={16}/>}
                      {kycSubmitting ? 'Đang gửi hồ sơ...' : 'Gửi yêu cầu xác minh'}
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        )}

        {/* TAB: HỒ SƠ NĂNG LỰC */}
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

        </div>{/* end content col */}
        </div>{/* end grid */}
      </div>{/* end max-w */}
    </Layout>
  );
};

/* ── KycUploadBox sub-component ──────────────────────────────────────── */
function KycUploadBox({ label, hint, icon, previewUrl, loading, required, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-gray-500 uppercase tracking-wide flex items-center gap-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <label className={`relative flex flex-col items-center justify-center h-36 rounded-2xl border-2 border-dashed cursor-pointer transition-all overflow-hidden ${
        previewUrl ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50 hover:border-[#1a4f3a] hover:bg-[#e8f5ee]'
      }`}>
        {loading ? (
          <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1a4f3a]"/>
        ) : previewUrl ? (
          <>
            <img src={previewUrl} alt={label} className="absolute inset-0 w-full h-full object-cover rounded-2xl"/>
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-2xl opacity-0 hover:opacity-100 transition-all">
              <span className="text-white text-xs font-bold flex items-center gap-1"><Upload size={12}/> Thay ảnh</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-gray-400">
            {icon}
            <span className="text-[10px] font-semibold">Nhấn để tải ảnh</span>
            <span className="text-[9px] text-gray-300">{hint}</span>
          </div>
        )}
        <input type="file" accept="image/*" onChange={onChange} className="hidden"/>
      </label>
      {previewUrl && (
        <p className="text-[9px] text-green-600 font-bold flex items-center gap-1"><CheckCircle2 size={9}/> Đã tải lên</p>
      )}
    </div>
  );
}

export default ProfilePage;
