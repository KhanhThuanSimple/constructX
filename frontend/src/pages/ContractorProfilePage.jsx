import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import {
  Star, MapPin, Calendar, Image as ImageIcon, Loader2,
  Phone, Mail, ArrowLeft, Award, ThumbsUp, MessageSquare, Briefcase,
  BadgeCheck
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const fmt = (n) =>
  n == null ? '' :
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n).replace('₫', 'đ');

export default function ContractorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [contractor, setContractor] = useState(null);
  const [works, setWorks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('portfolio'); // 'portfolio' | 'reviews'
  const [selectedWork, setSelectedWork] = useState(null); // Lightbox for portfolio item

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch contractor basic info
      const userRes = await api.get(`/users/${id}`);
      const userData = userRes.data.data;
      if (userData.role !== 'CONTRACTOR') {
        toast.error('Người dùng này không phải là nhà thầu');
        navigate('/');
        return;
      }
      setContractor(userData);

      // Fetch portfolio items
      const portfolioRes = await api.get(`/portfolio/contractor/${id}`);
      setWorks(portfolioRes.data.data || []);

      // Fetch reviews
      const reviewsRes = await api.get(`/reviews/user/${id}`);
      setReviews(reviewsRes.data.data || []);

      // Fetch rating summary
      const summaryRes = await api.get(`/reviews/user/${id}/summary`);
      setSummary(summaryRes.data.data || { averageRating: 0, totalReviews: 0 });

    } catch (e) {
      toast.error('Không thể tải thông tin nhà thầu');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Đang tải...">
        <div className="flex flex-col items-center justify-center py-32 text-gray-400">
          <Loader2 size={40} className="animate-spin text-primary mb-4" />
          <p className="font-medium text-gray-500">Đang tải hồ sơ nhà thầu...</p>
        </div>
      </Layout>
    );
  }

  if (!contractor) return null;

  return (
    <Layout title={`Hồ sơ nhà thầu: ${contractor.fullName}`}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Back button */}
        <button onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft size={16} /> Quay lại
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-bg rounded-full -mr-20 -mt-20 opacity-50 blur-3xl pointer-events-none" />
          
          <div className="relative flex flex-col md:flex-row gap-6 items-center md:items-start">
            {/* Avatar */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-primary-bg text-primary flex items-center justify-center text-4xl md:text-5xl font-bold shadow-inner shrink-0 overflow-hidden border border-gray-100">
              {contractor.avatarUrl ? (
                <img src={contractor.avatarUrl} alt={contractor.fullName} className="w-full h-full object-cover" />
              ) : (
                contractor.fullName?.charAt(0) || 'C'
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left space-y-3">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">{contractor.fullName}</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 items-center text-sm">
                  <span className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2.5 py-1 rounded-full">
                    <Star size={14} fill="currentColor" /> {summary.averageRating || 'Chưa có'} / 5.0
                  </span>
                  <span className="text-gray-400">({summary.totalReviews || 0} đánh giá)</span>
                  <span className="inline-flex items-center gap-1 bg-[#e8f5ee] text-[#1a4f3a] font-bold px-2.5 py-1 rounded-full">
                    <Award size={14} /> AI Trust Score: {summary.aiTrustScore != null ? summary.aiTrustScore : 100}
                  </span>
                  {summary.isVerified && (
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-full" title="Nhà thầu được chứng nhận uy tín vượt trội bởi hệ thống AI ConstructX">
                      <BadgeCheck size={14} className="fill-blue-100" /> Verified Contractor
                    </span>
                  )}
                </div>
              </div>

              {/* Contacts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 max-w-xl">
                {contractor.phoneNumber && (
                  <p className="flex items-center justify-center md:justify-start gap-2">
                    <Phone size={14} className="text-gray-400" /> {contractor.phoneNumber}
                  </p>
                )}
                {contractor.email && (
                  <p className="flex items-center justify-center md:justify-start gap-2">
                    <Mail size={14} className="text-gray-400" /> {contractor.email}
                  </p>
                )}
                {contractor.address && (
                  <p className="flex items-center justify-center md:justify-start gap-2 sm:col-span-2">
                    <MapPin size={14} className="text-gray-400" /> {contractor.address}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Operating & Financial Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="space-y-1 text-center md:text-left md:border-r border-gray-100 pr-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tỷ lệ hoàn thành</p>
            <p className="text-xl font-extrabold text-green-600">{summary.completionRate != null ? summary.completionRate : 100}%</p>
            <p className="text-[10px] text-gray-400">Đã hoàn thành {summary.completedContracts || 0} / {summary.totalContracts || 0} HĐ</p>
          </div>
          <div className="space-y-1 text-center md:text-left md:border-r border-gray-100 px-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lịch sử tranh chấp</p>
            <p className={`text-xl font-extrabold ${summary.totalDisputes > 0 ? 'text-red-500' : 'text-gray-500'}`}>{summary.totalDisputes || 0} ca</p>
            <p className="text-[10px] text-gray-400">{summary.resolvedDisputes || 0} đã giải quyết, {summary.pendingDisputes || 0} chờ</p>
          </div>
          <div className="space-y-1 text-center md:text-left md:border-r border-gray-100 px-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Doanh thu thực tế</p>
            <p className="text-xl font-extrabold text-primary">{fmt(summary.earnedRevenue)}</p>
            <p className="text-[10px] text-gray-400">Nhận từ các dự án đã hoàn thành</p>
          </div>
          <div className="space-y-1 text-center md:text-left pl-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Giá trị thi công</p>
            <p className="text-xl font-extrabold text-gray-900">{fmt(summary.totalProjectValue)}</p>
            <p className="text-[10px] text-gray-400">Tổng quy mô các dự án</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="border-b border-gray-100 flex gap-6">
          <button onClick={() => setActiveTab('portfolio')}
            className={`pb-3.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'portfolio'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}>
            <Briefcase size={16} /> Công trình đã làm ({works.length})
          </button>
          <button onClick={() => setActiveTab('reviews')}
            className={`pb-3.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'reviews'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}>
            <MessageSquare size={16} /> Đánh giá từ khách hàng ({reviews.length})
          </button>
        </div>

        {/* Tab content */}
        <div>
          {activeTab === 'portfolio' && (
            works.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <ImageIcon size={44} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-400 font-medium">Chưa có công trình nào được cập nhật</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {works.map((work) => (
                  <div key={work.id} onClick={() => setSelectedWork(work)}
                    className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md cursor-pointer transition-all">
                    {/* Image */}
                    <div className="h-48 bg-gray-50 overflow-hidden relative">
                      {work.imageUrl ? (
                        <img src={work.imageUrl} alt={work.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl bg-primary-bg text-primary">
                          🛋️
                        </div>
                      )}
                      {work.category && (
                        <span className="absolute bottom-3 left-3 text-[10px] font-bold text-[#1a4f3a] uppercase tracking-widest bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                          {work.category}
                        </span>
                      )}
                    </div>

                    <div className="p-5 space-y-2">
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{work.title}</h3>
                      {work.description && (
                        <p className="text-xs text-gray-500 line-clamp-2">{work.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 pt-1">
                        {work.completionYear && (
                          <span className="flex items-center gap-1"><Calendar size={12} /> {work.completionYear}</span>
                        )}
                        {work.location && (
                          <span className="flex items-center gap-1"><MapPin size={12} /> {work.location}</span>
                        )}
                        {work.projectValue && (
                          <span className="font-bold text-[#1a4f3a] ml-auto">{fmt(work.projectValue)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Summary stats */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm h-fit space-y-4 text-center">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Đánh giá chung</p>
                <div className="space-y-1">
                  <p className="text-5xl font-black text-gray-900">{summary.averageRating || '0.0'}</p>
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className={`text-2xl ${s <= Math.round(summary.averageRating || 0) ? 'text-amber-400' : 'text-gray-200'}`}>
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">{summary.totalReviews || 0} lượt đánh giá thực tế</p>
                </div>
                
                <div className="border-t border-gray-100 pt-4 text-left text-xs text-gray-500 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-12 text-right">5 sao</span>
                    <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full" style={{ width: summary.averageRating >= 4.5 ? '80%' : '20%' }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-12 text-right">4 sao</span>
                    <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full" style={{ width: summary.averageRating >= 3.5 && summary.averageRating < 4.5 ? '70%' : '10%' }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-12 text-right">3 sao</span>
                    <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full" style={{ width: '0%' }} />
                    </div>
                  </div>
                </div>

                {/* Detailed Criteria Ratings */}
                <div className="border-t border-gray-100 pt-5 text-left text-xs space-y-3">
                  <p className="font-bold text-gray-700 uppercase tracking-wider text-[10px] mb-2">Đánh giá theo tiêu chí</p>
                  <div className="space-y-2.5">
                    <div>
                      <div className="flex justify-between text-gray-600 mb-1 font-medium">
                        <span>🛠️ Chất lượng thi công</span>
                        <span className="font-bold">{summary.qualityScore || '0.0'} / 5.0</span>
                      </div>
                      <div className="bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full transition-all duration-500" style={{ width: `${(summary.qualityScore || 0) * 20}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-gray-600 mb-1 font-medium">
                        <span>📅 Đúng hạn & Tiến độ</span>
                        <span className="font-bold">{summary.progressScore || '0.0'} / 5.0</span>
                      </div>
                      <div className="bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full transition-all duration-500" style={{ width: `${(summary.progressScore || 0) * 20}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-gray-600 mb-1 font-medium">
                        <span>💬 Giao tiếp & Hợp tác</span>
                        <span className="font-bold">{summary.communicationScore || '0.0'} / 5.0</span>
                      </div>
                      <div className="bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full transition-all duration-500" style={{ width: `${(summary.communicationScore || 0) * 20}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Review list */}
              <div className="lg:col-span-2 space-y-4">
                {reviews.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                    <MessageSquare size={44} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-gray-400 font-medium">Chưa có lượt đánh giá nào cho nhà thầu này</p>
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-bg text-primary flex items-center justify-center font-bold text-sm overflow-hidden border border-gray-50">
                            {rev.reviewerAvatar ? (
                              <img src={rev.reviewerAvatar} alt={rev.reviewerName} className="w-full h-full object-cover" />
                            ) : (
                              rev.reviewerName?.charAt(0) || 'U'
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{rev.reviewerName}</p>
                            <p className="text-[10px] text-gray-400">{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</p>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <span key={s} className={`text-base ${s <= rev.rating ? 'text-amber-400' : 'text-gray-200'}`}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 leading-relaxed pl-1 whitespace-pre-wrap">{rev.comment}</p>
                      
                      {/* Reference tag */}
                      <span className="inline-block text-[9px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded">
                        Mã {rev.referenceType === 'PROJECT' ? 'Dự án' : 'Đơn hàng'}: #{rev.referenceId}
                      </span>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal for Portfolio Details */}
      {selectedWork && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh]">
            
            {/* Image header */}
            <div className="h-64 sm:h-80 bg-gray-50 overflow-hidden relative shrink-0">
              {selectedWork.imageUrl ? (
                <img src={selectedWork.imageUrl} alt={selectedWork.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl bg-primary-bg text-primary">
                  🛋️
                </div>
              )}
              <button onClick={() => setSelectedWork(null)}
                className="absolute top-4 right-4 w-9 h-9 bg-black/30 backdrop-blur-xs hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-colors">
                ✕
              </button>
            </div>

            {/* Content body */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {selectedWork.category && (
                  <span className="text-[10px] font-bold text-[#1a4f3a] uppercase tracking-widest bg-[#e8f5ee] px-2.5 py-1 rounded-lg">
                    {selectedWork.category}
                  </span>
                )}
                {selectedWork.projectValue && (
                  <span className="text-lg font-black text-[#1a4f3a]">{fmt(selectedWork.projectValue)}</span>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-900">{selectedWork.title}</h3>
              
              {selectedWork.description && (
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{selectedWork.description}</p>
              )}

              {/* Stats table */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100 text-xs">
                {selectedWork.completionYear && (
                  <div>
                    <span className="text-gray-400 block mb-0.5">NĂM HOÀN THÀNH</span>
                    <span className="font-bold text-gray-800 text-sm flex items-center gap-1"><Calendar size={14} /> {selectedWork.completionYear}</span>
                  </div>
                )}
                {selectedWork.location && (
                  <div>
                    <span className="text-gray-400 block mb-0.5">ĐỊA ĐIỂM</span>
                    <span className="font-bold text-gray-800 text-sm flex items-center gap-1"><MapPin size={14} /> {selectedWork.location}</span>
                  </div>
                )}
                {selectedWork.clientName && (
                  <div className="col-span-2">
                    <span className="text-gray-400 block mb-0.5">KHÁCH HÀNG</span>
                    <span className="font-bold text-gray-800 text-sm flex items-center gap-1"><ThumbsUp size={14} /> {selectedWork.clientName}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex shrink-0 justify-end">
              <button onClick={() => setSelectedWork(null)}
                className="btn btn-outline text-xs px-5 py-2.5">
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}
    </Layout>
  );
}
