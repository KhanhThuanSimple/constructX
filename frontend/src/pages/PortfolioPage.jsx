import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  Star, MapPin, Calendar, Image as ImageIcon, Loader2
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const fmt = (n) =>
  n == null ? '' :
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n).replace('₫', 'đ');

const PortfolioPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [works, setWorks] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPortfolio(); }, []);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      // Fetch platform contracts for this contractor
      const res = await api.get('/contracts/my');
      const allContracts = res.data.data || [];
      
      // Filter for COMPLETED contracts
      const completedContracts = allContracts.filter(c => c.status === 'COMPLETED');
      
      // Sort by completedAt descending (most recently completed first) and take top 3
      const top3Contracts = completedContracts
        .sort((a, b) => {
          const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
          const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 3);
        
      // Map platform completed contracts to visual works schema
      const mappedWorks = top3Contracts.map(c => ({
        id: c.id,
        title: c.projectName || `Hợp đồng #${c.contractNumber}`,
        description: c.terms ? (c.terms.length > 100 ? c.terms.substring(0, 97) + '...' : c.terms) : 'Thi công hoàn thiện công trình nội thất chất lượng cao trên sàn.',
        completionYear: c.completedAt ? new Date(c.completedAt).getFullYear() : (c.createdAt ? new Date(c.createdAt).getFullYear() : 2026),
        location: c.contractorAddress || 'TP. Hồ Chí Minh',
        projectValue: c.agreedPrice,
        category: c.orderId ? 'Đơn hàng Custom' : 'Dự án thầu'
      }));
        
      setWorks(mappedWorks);
      
      // Also fetch contractor portfolio profile details
      try {
        const profileRes = await api.get('/contractor-profile/my');
        setProfileData(profileRes.data.data);
      } catch (err) {
        // ignore
      }
    } catch { 
      toast.error('Không thể tải hồ sơ năng lực'); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <Layout title="Hồ sơ năng lực (Portfolio)">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header card */}
        <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-[#1a4f3a] flex items-center justify-center text-3xl text-white font-bold shadow-lg shrink-0 overflow-hidden">
              {profileData?.logoUrl ? (
                <img src={profileData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                user?.fullName?.charAt(0) || 'C'
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{profileData?.companyName || user?.fullName || 'Nhà thầu'}</h2>
              <div className="flex items-center gap-4 mt-1.5">
                <span className="flex items-center gap-1 text-sm text-amber-500 font-bold">
                  <Star size={16} fill="currentColor" /> Hồ sơ thầu hoạt động
                </span>
                <span className="text-sm text-gray-400">{works.length} công trình đã hoàn thành tiêu biểu</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contractor Profile Details Preview */}
        {profileData ? (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-100">
              <h3 className="font-extrabold text-gray-900 text-base">Thông tin năng lực nhà thầu</h3>
              <button
                type="button"
                onClick={() => navigate('/profile', { state: { activeTab: 'portfolio' } })}
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition-all border border-gray-200 flex items-center gap-1.5"
              >
                Chỉnh sửa hồ sơ thầu ⚙️
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Intro, Fields, Policies */}
              <div className="lg:col-span-2 space-y-4 lg:border-r border-gray-100 lg:pr-6">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Mô tả giới thiệu ngắn</span>
                  <p className="text-sm text-gray-700 leading-relaxed font-semibold italic bg-gray-50 p-4 rounded-xl border border-gray-100">
                    "{profileData.shortIntro || 'Chuyên thiết kế và thi công nội thất nhà ở, căn hộ, văn phòng với đội ngũ giàu kinh nghiệm, cam kết chất lượng và đúng tiến độ.'}"
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Lĩnh vực hoạt động</span>
                  <div className="flex flex-wrap gap-2">
                    {profileData.designInterior && (
                      <span className="px-2.5 py-1 bg-[#e8f5ee] text-[#1a4f3a] text-xs font-bold rounded-lg border border-green-200">
                        ☑ Thiết kế nội thất
                      </span>
                    )}
                    {profileData.constructInterior && (
                      <span className="px-2.5 py-1 bg-[#e8f5ee] text-[#1a4f3a] text-xs font-bold rounded-lg border border-green-200">
                        ☑ Thi công nội thất
                      </span>
                    )}
                    {profileData.produceWood && (
                      <span className="px-2.5 py-1 bg-[#e8f5ee] text-[#1a4f3a] text-xs font-bold rounded-lg border border-green-200">
                        ☑ Sản xuất đồ gỗ
                      </span>
                    )}
                    {profileData.renovateHouse && (
                      <span className="px-2.5 py-1 bg-[#e8f5ee] text-[#1a4f3a] text-xs font-bold rounded-lg border border-green-200">
                        ☑ Cải tạo nhà ở
                      </span>
                    )}
                    {!profileData.designInterior && !profileData.constructInterior && !profileData.produceWood && !profileData.renovateHouse && (
                      <span className="text-xs text-gray-400 italic">Chưa chọn lĩnh vực</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Chính sách cam kết</span>
                  <div className="flex flex-wrap gap-2">
                    {profileData.warranty24Months && (
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200">
                        ✔ Bảo hành 24 tháng
                      </span>
                    )}
                    {profileData.freeQuote && (
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200">
                        ✔ Báo giá miễn phí
                      </span>
                    )}
                    {profileData.onTimeProgress && (
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200">
                        ✔ Thi công đúng tiến độ
                      </span>
                    )}
                    {!profileData.warranty24Months && !profileData.freeQuote && !profileData.onTimeProgress && (
                      <span className="text-xs text-gray-400 italic">Chưa chọn chính sách cam kết</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Stats preview */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block text-center lg:text-left">Chỉ số năng lực thầu</span>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Kinh nghiệm</p>
                    <p className="font-extrabold text-sm text-gray-800 mt-1">{profileData.experienceYears || '5'} năm</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Dự án thầu</p>
                    <p className="font-extrabold text-sm text-gray-800 mt-1">{profileData.completedProjectsCount || '120'}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl col-span-2">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Khách hàng</p>
                    <p className="font-extrabold text-sm text-gray-800 mt-1">{profileData.customerCount || '150+'}</p>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-100 p-3.5 rounded-xl text-xs space-y-1.5">
                  <p className="text-gray-500 font-medium flex justify-between">
                    <span>Số điện thoại:</span> <span className="font-bold text-gray-700">{profileData.phoneNumber || '—'}</span>
                  </p>
                  <p className="text-gray-500 font-medium flex justify-between">
                    <span>Email liên hệ:</span> <span className="font-bold text-gray-700">{profileData.email || '—'}</span>
                  </p>
                  <p className="text-gray-500 font-medium flex flex-col">
                    <span>Địa chỉ thi công:</span> <span className="font-bold text-gray-700 mt-0.5">{profileData.address || '—'}</span>
                  </p>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 text-center space-y-3">
            <p className="text-sm font-semibold text-amber-800">Bạn chưa thiết lập hồ sơ năng lực nhà thầu (Logo, giới thiệu, cam kết...)</p>
            <button
              onClick={() => navigate('/profile', { state: { activeTab: 'portfolio' } })}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Thiết lập hồ sơ năng lực thầu ngay 🚀
            </button>
          </div>
        )}

        {/* Works Heading */}
        <div className="pt-4">
          <h3 className="font-extrabold text-gray-900 text-lg mb-2">3 công trình tiêu biểu đã hoàn thành</h3>
          <p className="text-xs text-gray-400">Danh sách các công trình thực tế đã hoàn thành nghiệm thu giao dịch thành công trên sàn.</p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <Loader2 size={32} className="animate-spin mx-auto mb-3"/>
            Đang tải...
          </div>
        ) : works.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <ImageIcon size={44} className="mx-auto text-gray-200 mb-3"/>
            <p className="text-gray-400 font-medium">Chưa có công trình hoàn thành nào</p>
            <p className="text-gray-300 text-sm mt-1">Các công trình thầu hoàn thành sẽ tự động xuất hiện ở đây sau khi hoàn tất hợp đồng trên hệ thống.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {works.map((work) => (
              <div key={work.id}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                {/* Image Placeholder icon for clean style */}
                <div className="h-44 bg-[#e8f5ee] flex items-center justify-center text-5xl">
                  {work.category === 'Đơn hàng Custom' ? '📦' : '🏗️'}
                </div>

                <div className="p-5">
                  <span className="text-[10px] font-bold text-[#1a4f3a] uppercase tracking-widest bg-[#e8f5ee] px-2 py-1 rounded-md mb-2 inline-block">
                    {work.category}
                  </span>
                  <h3 className="text-base font-bold text-gray-800 mt-1.5 mb-1 line-clamp-1">{work.title}</h3>
                  {work.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{work.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={12}/> {work.completionYear}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12}/> {work.location}
                    </span>
                    <span className="font-bold text-[#1a4f3a] ml-auto">{fmt(work.projectValue)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PortfolioPage;
