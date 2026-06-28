import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import {
  Star, ClipboardCheck, FileText, CheckCircle2, AlertCircle,
  Calendar, Loader2, User, Wallet, Clock, ChevronRight, Award, Check
} from 'lucide-react';

const fmt = (n) =>
  n == null ? '0đ' :
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n).replace('₫', 'đ');

export default function ReviewsManagementPage() {
  const { user } = useAuthStore();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' = Chưa đánh giá, 'reviewed' = Đã đánh giá
  const [selectedItem, setSelectedItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form review state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    qualityScore: 5,
    communicationScore: 5,
    progressScore: 5,
    comment: ''
  });

  const isCustomer = user?.role === 'CUSTOMER';

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setReviewForm({
      rating: 5,
      qualityScore: 5,
      communicationScore: 5,
      progressScore: 5,
      comment: ''
    });
  };

  useEffect(() => {
    fetchCompletedItems();
  }, []);

  const fetchCompletedItems = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reviews/completed');
      const data = response.data.data || [];
      setItems(data);
      if (data.length > 0) {
        // Auto-select first item in the default tab
        const defaultTabItems = data.filter(item => !item.hasReviewed);
        if (defaultTabItems.length > 0) {
          handleSelectItem(defaultTabItems[0]);
        } else {
          const reviewedItems = data.filter(item => item.hasReviewed);
          if (reviewedItems.length > 0) {
            handleSelectItem(reviewedItems[0]);
            setActiveTab('reviewed');
          } else {
            handleSelectItem(null);
          }
        }
      } else {
        handleSelectItem(null);
      }
    } catch (e) {
      toast.error('Không thể tải danh sách dự án hoàn thành');
    } finally {
      setLoading(false);
    }
  };

  // Change tab helper
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const filtered = items.filter(item => tab === 'pending' ? !item.hasReviewed : item.hasReviewed);
    if (filtered.length > 0) {
      handleSelectItem(filtered[0]);
    } else {
      handleSelectItem(null);
    }
  };

  // Submit review logic
  const handleSubmitReview = async () => {
    if (!reviewForm.comment.trim()) {
      return toast.error('Vui lòng nhập nhận xét chi tiết');
    }
    if (!selectedItem || !selectedItem.partnerId) {
      return toast.error('Thiếu thông tin đối tượng đánh giá');
    }

    setSubmitting(true);
    try {
      await api.post('/reviews', {
        rating: Number(reviewForm.rating),
        qualityScore: Number(reviewForm.qualityScore),
        communicationScore: Number(reviewForm.communicationScore),
        progressScore: Number(reviewForm.progressScore),
        comment: reviewForm.comment,
        referenceType: selectedItem.referenceType,
        referenceId: selectedItem.referenceId,
        revieweeId: selectedItem.partnerId
      });

      toast.success('🎉 Cảm ơn bạn đã gửi đánh giá!');
      setReviewForm({
        rating: 5,
        qualityScore: 5,
        communicationScore: 5,
        progressScore: 5,
        comment: ''
      });
      
      // Refresh items list
      const response = await api.get('/reviews/completed');
      const refreshedData = response.data.data || [];
      setItems(refreshedData);
      
      // Find the item that was just reviewed and update selection
      const updatedItem = refreshedData.find(
        i => i.referenceType === selectedItem.referenceType && i.referenceId === selectedItem.referenceId
      );
      if (updatedItem) {
        handleSelectItem(updatedItem);
        setActiveTab('reviewed');
      } else {
        // Fallback to first item
        const pendingItems = refreshedData.filter(item => !item.hasReviewed);
        if (pendingItems.length > 0) {
          handleSelectItem(pendingItems[0]);
          setActiveTab('pending');
        } else {
          const reviewedItems = refreshedData.filter(item => item.hasReviewed);
          handleSelectItem(reviewedItems[0] || null);
          setActiveTab('reviewed');
        }
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Không thể gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingItems = items.filter(item => !item.hasReviewed);
  const reviewedItems = items.filter(item => item.hasReviewed);
  const currentTabItems = activeTab === 'pending' ? pendingItems : reviewedItems;

  const renderStars = (score) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${star <= score ? 'text-amber-400' : 'text-gray-250 text-gray-200'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <Layout title="Quản lý Nghiệm thu & Đánh giá">
      <div className="space-y-6">
        
        {/* Banner tổng quan */}
        <div className="bg-gradient-to-r from-[#1a4f3a] to-[#2e7456] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold">Nghiệm thu & Đánh giá công trình</h2>
            <p className="text-xs text-green-100 max-w-xl">
              Nơi hiển thị và chấm điểm chất lượng cho các dự án và đơn hàng đã hoàn tất thi công. Đánh giá của bạn sẽ trực tiếp đóng góp vào xếp hạng uy tín hệ thống.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/5 backdrop-blur-sm text-center">
              <span className="block text-[10px] text-green-200 font-medium uppercase tracking-wider">Chưa đánh giá</span>
              <span className="text-lg font-black">{pendingItems.length}</span>
            </div>
            <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/5 backdrop-blur-sm text-center">
              <span className="block text-[10px] text-green-200 font-medium uppercase tracking-wider">Đã đánh giá</span>
              <span className="text-lg font-black">{reviewedItems.length}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24"><Loader2 size={36} className="animate-spin text-primary"/></div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400">
              <Clock size={28} />
            </div>
            <h3 className="text-sm font-bold text-gray-800">Không có dự án đã hoàn thành</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Bạn chưa có dự án hay đơn hàng nào ở trạng thái đã hoàn công hoặc giao hàng thành công để tiến hành đánh giá.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Cột trái: Danh sách dự án */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Tab selector */}
              <div className="bg-white p-1.5 rounded-xl border border-gray-100 shadow-sm flex gap-1">
                <button
                  onClick={() => handleTabChange('pending')}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex justify-center items-center gap-1.5
                    ${activeTab === 'pending'
                      ? 'bg-[#1a4f3a] text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                >
                  Chưa đánh giá
                  {pendingItems.length > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                      activeTab === 'pending' ? 'bg-white text-[#1a4f3a]' : 'bg-[#1a4f3a] text-white'
                    }`}>
                      {pendingItems.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => handleTabChange('reviewed')}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex justify-center items-center gap-1.5
                    ${activeTab === 'reviewed'
                      ? 'bg-[#1a4f3a] text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                >
                  Đã đánh giá
                </button>
              </div>

              {/* Danh sách thẻ */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {currentTabItems.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-xs text-gray-400">
                    Không có mục nào trong danh sách này
                  </div>
                ) : (
                  currentTabItems.map((item) => {
                    const isSelected = selectedItem && 
                      selectedItem.referenceId === item.referenceId && 
                      selectedItem.referenceType === item.referenceType;
                    
                    return (
                      <div
                        key={`${item.referenceType}-${item.referenceId}`}
                        onClick={() => handleSelectItem(item)}
                        className={`bg-white rounded-2xl border p-4 shadow-sm cursor-pointer transition-all hover:border-primary/50 relative overflow-hidden
                          ${isSelected ? 'border-primary ring-1 ring-primary/20' : 'border-gray-100'}`}
                      >
                        {/* Type tag */}
                        <div className="flex justify-between items-start gap-2 mb-2.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            item.referenceType === 'PROJECT'
                              ? 'bg-blue-50 text-blue-700 border border-blue-150'
                              : 'bg-purple-50 text-purple-700 border border-purple-150'
                          }`}>
                            {item.referenceType === 'PROJECT' ? 'Dự án' : 'Đơn hàng'}
                          </span>
                          
                          <span className="text-[10px] text-gray-400 font-medium">
                            {item.completedAt ? new Date(item.completedAt).toLocaleDateString('vi-VN') : '—'}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-sm text-gray-900 line-clamp-1 mb-1">{item.name}</h4>
                        <div className="flex justify-between items-center text-xs text-gray-500 pt-1.5 border-t border-gray-50">
                          <div>
                            <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">
                              {isCustomer ? 'Nhà thầu' : 'Chủ đầu tư'}
                            </span>
                            <span className="font-bold text-gray-700">{item.partnerName}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">Tổng giá trị</span>
                            <span className="font-bold text-[#1a4f3a]">{fmt(item.price)}</span>
                          </div>
                        </div>

                        {/* Star indicator on item lists for reviewed */}
                        {item.hasReviewed && item.review && (
                          <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-green-700 flex items-center gap-1">
                              <Check size={10}/> Đã hoàn tất đánh giá
                            </span>
                            {renderStars(item.review.rating)}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

            </div>

            {/* Cột phải: Chi tiết và Form đánh giá */}
            <div className="lg:col-span-7">
              {selectedItem ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                  
                  {/* Tiêu đề & Thông tin dự án */}
                  <div className="border-b border-gray-100 pb-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        selectedItem.referenceType === 'PROJECT'
                          ? 'bg-blue-50 text-blue-700 border border-blue-150'
                          : 'bg-purple-50 text-purple-700 border border-purple-150'
                      }`}>
                        {selectedItem.referenceType === 'PROJECT' ? 'Dự án thiết kế thi công' : 'Đơn hàng sản xuất'}
                      </span>
                      <span className="text-xs text-gray-400">
                        Nghiệm thu ngày: {selectedItem.completedAt ? new Date(selectedItem.completedAt).toLocaleDateString('vi-VN') : '—'}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-gray-900">{selectedItem.name}</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                      <div className="bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/50 text-center">
                        <span className="block text-[9px] text-gray-400 uppercase font-black tracking-wider">Tổng ngân sách</span>
                        <span className="text-xs font-bold text-gray-800">{fmt(selectedItem.price)}</span>
                      </div>
                      <div className="bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/50 text-center">
                        <span className="block text-[9px] text-gray-400 uppercase font-black tracking-wider">
                          {isCustomer ? 'Nhà thầu đối tác' : 'Chủ đầu tư'}
                        </span>
                        <span className="text-xs font-bold text-gray-850 truncate block">{selectedItem.partnerName}</span>
                      </div>
                      <div className="bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/50 text-center col-span-2 md:col-span-1">
                        <span className="block text-[9px] text-gray-400 uppercase font-black tracking-wider">Trạng thái</span>
                        <span className="text-xs font-bold text-green-700 flex justify-center items-center gap-1">
                          <CheckCircle2 size={12}/> Đã nghiệm thu
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Phần hiển thị chi tiết form hoặc bài đánh giá */}
                  {!selectedItem.hasReviewed ? (
                    isCustomer ? (
                      /* PHÂN LUỒNG: CHƯA ĐÁNH GIÁ - KHÁCH HÀNG (Giao diện gửi form) */
                      <div className="space-y-5">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-gray-900">
                            Đánh giá chất lượng Nhà thầu
                          </h4>
                          <p className="text-[11px] text-gray-400 leading-relaxed">
                            Vui lòng đánh giá khách quan dựa trên trải nghiệm hợp tác thực tế. Điểm số này sẽ cập nhật trực tiếp vào hồ sơ uy tín của đối tác trên sàn.
                          </p>
                        </div>

                        {/* Các tiêu chí đánh giá sao */}
                        <div className="space-y-3">
                          {[
                            { key: 'rating', label: '⭐ Đánh giá tổng thể chung', desc: 'Mức độ hài lòng toàn diện về dự án.' },
                            { key: 'qualityScore', label: '🛠️ Chất lượng hoàn thiện', desc: 'Chất lượng vật liệu, tay nghề hoàn thiện công trình.' },
                            { key: 'progressScore', label: '📅 Đúng hạn & Tiến độ', desc: 'Mức độ cam kết thời gian và bàn giao đúng tiến độ.' },
                            { key: 'communicationScore', label: '💬 Giao tiếp & Hợp tác', desc: 'Thái độ trao đổi thông tin, xử lý phát sinh.' },
                          ].map(crit => (
                            <div key={crit.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gray-50/50 rounded-xl border border-gray-100">
                              <div>
                                <span className="text-xs font-bold text-gray-800 block">{crit.label}</span>
                                <span className="text-[10px] text-gray-400 block">{crit.desc}</span>
                              </div>
                              <div className="flex gap-1 shrink-0">
                                {[1, 2, 3, 4, 5].map(star => (
                                <button
                                  type="button"
                                  key={star}
                                  onClick={() => setReviewForm(p => ({ ...p, [crit.key]: star }))}
                                  className={`text-2xl transition-transform hover:scale-110 ${
                                    star <= reviewForm[crit.key] ? 'text-amber-400' : 'text-gray-200'
                                  }`}
                                >
                                  ★
                                </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Nhận xét văn bản */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Nhận xét chi tiết</label>
                          <textarea
                            rows={4}
                            value={reviewForm.comment}
                            onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary resize-none transition-all"
                            placeholder="Hãy chia sẻ nhận xét chi tiết về chất lượng sản phẩm nội thất, tiến độ lắp ráp, thái độ bảo hành..."
                          />
                        </div>

                        {/* Nút gửi */}
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={handleSubmitReview}
                          className="w-full py-3 bg-[#1a4f3a] text-white font-bold rounded-xl hover:bg-[#256e52] transition-all shadow-sm flex items-center justify-center gap-2 text-xs"
                        >
                          {submitting ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              Đang gửi đánh giá...
                            </>
                          ) : (
                            'Gửi đánh giá nghiệm thu'
                          )}
                        </button>
                      </div>
                    ) : (
                      /* PHÂN LUỒNG: CHƯA ĐÁNH GIÁ - NHÀ THẦU (Chỉ hiển thị thông tin chờ đợi) */
                      <div className="bg-gray-50 border border-gray-150 rounded-2xl p-8 text-center text-gray-500 space-y-3">
                        <Clock size={36} className="mx-auto text-gray-400" />
                        <h4 className="text-xs font-bold text-gray-800">Đang chờ khách hàng gửi đánh giá chất lượng</h4>
                        <p className="text-[10px] text-gray-400 max-w-sm mx-auto leading-relaxed">
                          Dự án/Đơn hàng đã hoàn thành thi công và nghiệm thu thành công. Bạn hiện đang chờ Chủ đầu tư (Khách hàng) tiến hành chấm điểm và gửi nhận xét phản hồi chất lượng.
                        </p>
                      </div>
                    )
                  ) : (
                    
                    /* PHÂN LUỒNG: ĐÃ ĐÁNH GIÁ (Giao diện xem lại đánh giá) */
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-green-50/20 to-primary/5 border border-green-100 rounded-xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0">
                          <CheckCircle2 size={20}/>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-900">Bạn đã hoàn tất đánh giá cho dự án này</h4>
                          <p className="text-[10px] text-gray-400">Đánh giá được gửi vào ngày {selectedItem.review?.createdAt ? new Date(selectedItem.review.createdAt).toLocaleDateString('vi-VN') : '—'}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider block border-b border-gray-50 pb-1">Chi tiết điểm đánh giá</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            { label: '⭐ Đánh giá tổng thể chung', score: selectedItem.review?.rating },
                            { label: '🛠️ Chất lượng hoàn thiện', score: selectedItem.review?.qualityScore },
                            { label: '📅 Đúng hạn & Tiến độ', score: selectedItem.review?.progressScore },
                            { label: '💬 Giao tiếp & Hợp tác', score: selectedItem.review?.communicationScore },
                          ].map((crit, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
                              <span className="text-xs font-semibold text-gray-700">{crit.label}</span>
                              {renderStars(crit.score || 5)}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider block border-b border-gray-50 pb-1">Nội dung nhận xét</h4>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-150/40 text-xs text-gray-700 leading-relaxed italic">
                          "{selectedItem.review?.comment || 'Không có nhận xét chi tiết.'}"
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-xs text-gray-400">
                  Chọn một dự án từ danh sách bên trái để xem thông tin chi tiết và đánh giá
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </Layout>
  );
}
