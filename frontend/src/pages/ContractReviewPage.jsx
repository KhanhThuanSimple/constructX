import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ContractHeader from '../components/ContractHeader';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import {
  Star, ShieldCheck, CheckCircle2, AlertCircle, Calendar,
  TrendingUp, Award, AwardIcon, Loader2, FileText, Check, Clock
} from 'lucide-react';

const fmt = (n) =>
  n == null ? '0đ' :
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n).replace('₫', 'đ');

export default function ContractReviewPage() {
  const { contractId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const isCustomer   = user?.role === 'CUSTOMER';
  const isAdmin      = user?.role === 'ADMIN';

  const [contract, setContract]           = useState(null);
  const [disbursements, setDisbursements] = useState([]);
  const [progress, setProgress]           = useState(0);
  const [loading, setLoading]             = useState(true);
  const [hasReviewed, setHasReviewed]     = useState(false);

  const [submitting, setSubmitting] = useState(null); // 'complete' hoặc 'review'

  // Review form (Đánh giá đa tiêu chí)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    qualityScore: 5,
    communicationScore: 5,
    progressScore: 5,
    comment: ''
  });

  useEffect(() => {
    fetchData();
  }, [contractId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contractRes, disbRes, progressRes] = await Promise.all([
        api.get(`/contracts/${contractId}`),
        api.get(`/contracts/${contractId}/disbursements`),
        api.get(`/contracts/${contractId}/progress`),
      ]);
      const c = contractRes.data.data;
      setContract(c);
      setDisbursements(disbRes.data.data || []);
      setProgress(progressRes.data.data || 0);

      // Check review status
      if (c && c.status === 'COMPLETED') {
        const refType = c.projectId ? 'PROJECT' : 'ORDER';
        const refId = c.projectId || c.orderId;
        if (refId) {
          const checkRes = await api.get(`/reviews/check?referenceType=${refType}&referenceId=${refId}`);
          setHasReviewed(checkRes.data.data || false);
        }
      }
    } catch {
      toast.error('Không thể tải thông tin nghiệm thu & đánh giá');
    } finally {
      setLoading(false);
    }
  };

  // Admin bấm nghiệm thu hoàn công
  const handleCompleteContract = async () => {
    if (!window.confirm('Xác nhận nghiệm thu & hoàn công hợp đồng?\nHành động này sẽ:\n• Giải phóng 95% số tiền thanh toán cho nhà thầu.\n• Giữ lại 5% tiền cọc bảo hành đóng băng trong 6 tháng.')) return;
    setSubmitting('complete');
    try {
      await api.post(`/admin/contracts/${contractId}/complete`);
      toast.success('🎉 Đã nghiệm thu và hoàn công hợp đồng thành công!');
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(null);
    }
  };

  // Khách hàng gửi đánh giá đa tiêu chí
  const submitReview = async () => {
    if (!reviewForm.comment.trim()) return toast.error('Vui lòng nhập nhận xét chi tiết');
    
    setSubmitting('review');
    try {
      const refType = contract.projectId ? 'PROJECT' : 'ORDER';
      const refId = contract.projectId || contract.orderId;
      const contractorId = contract.contractorId || (contract.contractor && contract.contractor.id);
      
      if (!refId || !contractorId) {
        toast.error('Thiếu thông tin đối chiếu đánh giá');
        return;
      }

      await api.post('/reviews', {
        rating: Number(reviewForm.rating),
        qualityScore: Number(reviewForm.qualityScore),
        communicationScore: Number(reviewForm.communicationScore),
        progressScore: Number(reviewForm.progressScore),
        comment: reviewForm.comment,
        referenceType: refType,
        referenceId: refId,
        revieweeId: contractorId
      });
      
      toast.success('🎉 Cảm ơn bạn đã gửi đánh giá đa tiêu chí cho nhà thầu!');
      setHasReviewed(true);
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Không thể gửi đánh giá');
    } finally {
      setSubmitting(null);
    }
  };

  // Admin giải phóng tiền bảo hành (release-warranty)
  const handleReleaseWarranty = async () => {
    if (!window.confirm('Xác nhận giải ngân 5% tiền bảo hành cho nhà thầu?')) return;
    setSubmitting('complete');
    try {
      await api.post(`/admin/contracts/${contractId}/release-warranty`);
      toast.success('✅ Đã giải ngân thành công số tiền bảo hành 5%!');
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(null);
    }
  };

  // Tính toán số liệu giải ngân
  const totalDisbursed  = disbursements.filter(d => d.status === 'APPROVED').reduce((s, d) => s + (d.amount || 0), 0);
  const totalLocked     = disbursements.filter(d => d.status === 'APPROVED' && !d.fullyUnlocked).reduce((s, d) => s + (d.lockedAmount || 0), 0);

  if (loading) return (
    <Layout title="Nghiệm thu & Đánh giá">
      <div className="flex justify-center py-24"><Loader2 size={36} className="animate-spin text-primary"/></div>
    </Layout>
  );
  if (!contract) return null;

  if (contract.isDisputed) {
    return (
      <Layout title="Nghiệm thu & Đánh giá">
        <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-red-150 p-6 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
            <AlertCircle size={32} className="animate-pulse" />
          </div>
          <h2 className="text-lg font-extrabold text-gray-900">Hợp đồng đang bị đóng băng tranh chấp</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Hợp đồng này hiện đang ở trạng thái tranh chấp và mọi tính năng nghiệm thu & đánh giá chất lượng đã bị vô hiệu hóa tạm thời. Vui lòng di chuyển đến trang giải quyết tranh chấp để đối chất hoặc chờ phán quyết phân bổ ví từ Admin.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate(`/contracts/${contract.id}/dispute`)}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-sm text-xs flex items-center justify-center gap-1.5"
            >
              <AlertCircle size={14} />
              Đi tới trang Giải quyết Tranh chấp
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const isCompleted = contract.status === 'COMPLETED';
  const isActive = contract.status === 'ACTIVE';

  return (
    <Layout title="Nghiệm thu & Đánh giá">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header dùng chung */}
        <ContractHeader
          contract={contract}
          progress={progress}
          totalDisbursed={totalDisbursed}
          totalLocked={totalLocked}
          activeTab="review"
        />

        {/* ── PHÂN LUỒNG 1: NGHIỆM THU HOÀN CÔNG ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Award size={18} className="text-primary" />
            Nghiệm thu & Hoàn công công trình
          </h3>

          {/* Chưa đạt 100% tiến độ */}
          {progress < 100 && isActive && (
            <div className="flex items-start gap-3 bg-gray-50 border border-gray-250/60 rounded-2xl p-4 text-sm text-gray-600">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-gray-400" />
              <div>
                <p className="font-semibold text-gray-800">Hợp đồng đang trong quá trình thi công</p>
                <p className="text-xs text-gray-500 mt-1">
                  Tiến độ hiện tại đạt <strong>{progress}%</strong>. Khi nhà thầu hoàn thành toàn bộ công việc (100% tiến độ) và gửi báo cáo hoàn công, Admin sẽ tiến hành kiểm tra công trình thực tế để kích hoạt nghiệm thu hoàn công.
                </p>
              </div>
            </div>
          )}

          {/* Đã đạt 100% tiến độ nhưng chưa hoàn công */}
          {progress === 100 && isActive && (
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-850 shadow-sm">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-blue-500" />
              <div className="flex-1">
                <p className="font-bold">Đã hoàn thành 100% tiến độ thi công</p>
                <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                  Công trình đã hoàn thành thi công trên thực tế. Đang chờ Admin xác nhận hoàn công để chính thức kết thúc hợp đồng, giải ngân 95% dòng tiền và chuyển hợp đồng sang thời gian bảo hành.
                </p>
                
                {/* Nút bấm dành cho Admin */}
                {isAdmin && (
                  <button
                    onClick={handleCompleteContract}
                    disabled={submitting === 'complete'}
                    className="mt-3 flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {submitting === 'complete' ? 'Đang xử lý hoàn công...' : '✓ Xác nhận Nghiệm thu & Hoàn công'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Đã hoàn công thành công */}
          {isCompleted && (
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-2xl p-4 text-sm text-green-850 shadow-sm">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-green-600" />
              <div>
                <p className="font-bold">Hợp đồng đã hoàn công thành công!</p>
                <p className="text-xs text-green-700 mt-1 leading-relaxed">
                  Hợp đồng đã hoàn thành toàn bộ các thủ tục nghiệm thu pháp lý và kiểm tra thực địa vào ngày <strong>{contract.completedAt ? new Date(contract.completedAt).toLocaleDateString('vi-VN') : '—'}</strong>. 
                  Dòng tiền đã được giải ngân an toàn cho nhà thầu.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── PHÂN LUỒNG 2: BẢO HÀNH CÔNG TRÌNH (Chỉ hiện khi COMPLETED) ── */}
        {isCompleted && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              Theo dõi thời hạn Bảo hành
            </h3>
            
            <div className={`flex items-start gap-3 rounded-2xl p-4 text-sm border ${
              contract.warrantyReleased
                ? 'bg-green-50/50 border-green-100 text-green-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <span className="text-lg shrink-0">{contract.warrantyReleased ? '✅' : '🔒'}</span>
              <div className="flex-1">
                {contract.warrantyReleased ? (
                  <div>
                    <p className="font-bold">Thời hạn bảo hành đã kết thúc</p>
                    <p className="text-xs text-green-600 mt-1">
                      Toàn bộ số tiền 5% bảo hành trị giá <strong>{fmt(contract.warrantyHoldAmount)}</strong> đã được mở khóa và giải ngân hoàn toàn cho nhà thầu.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-bold">Đang trong thời hạn bảo hành 6 tháng</p>
                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                      Hợp đồng được bảo hành đến ngày <strong>{contract.warrantyEndDate ? new Date(contract.warrantyEndDate).toLocaleDateString('vi-VN') : '—'}</strong>. 
                      Khoản giữ lại bảo hành 5% tương đương <strong>{fmt(contract.warrantyHoldAmount)}</strong> đang được đóng băng an toàn trên hệ thống để bảo đảm quyền lợi của khách hàng.
                    </p>

                    {/* Nút Admin giải ngân bảo hành */}
                    {isAdmin && (
                      <button
                        onClick={handleReleaseWarranty}
                        disabled={submitting === 'complete'}
                        className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition-colors disabled:opacity-50"
                      >
                        {submitting === 'complete' ? 'Đang giải phóng...' : '🔓 Giải phóng Tiền Bảo hành'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── PHÂN LUỒNG 3: ĐÁNH GIÁ NHÀ THẦU ĐA TIÊU CHÍ (Chỉ hiện khi COMPLETED) ── */}
        {isCompleted && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Star size={18} className="text-primary" />
              Đánh giá chất lượng Nhà thầu (Đa tiêu chí)
            </h3>

            {/* Chưa đánh giá & là Khách hàng */}
            {isCustomer && !hasReviewed && (
              <div className="space-y-4">
                <p className="text-xs text-gray-500">
                  Vui lòng đánh giá nhà thầu dựa trên trải nghiệm thực tế trong quá trình thi công hợp tác. Đánh giá của bạn sẽ cập nhật trực tiếp vào điểm uy tín AI Trust Score của nhà thầu.
                </p>

                {/* Tiêu chí đánh giá sao */}
                {[
                  { key: 'rating', label: '⭐ Đánh giá tổng thể (Chung)' },
                  { key: 'qualityScore', label: '🛠️ Chất lượng hoàn thiện sản phẩm' },
                  { key: 'progressScore', label: '📅 Đúng hạn & Đúng tiến độ cam kết' },
                  { key: 'communicationScore', label: '💬 Giao tiếp & Thái độ hợp tác' },
                ].map(crit => (
                  <div key={crit.key} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100/50">
                    <span className="text-xs font-bold text-gray-700">{crit.label}</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => setReviewForm(p => ({ ...p, [crit.key]: star }))}
                          className={`text-2xl transition-transform hover:scale-110 ${
                            star <= reviewForm[crit.key] ? 'text-amber-455 text-amber-400' : 'text-gray-200'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Nhận xét văn bản */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Nhận xét chi tiết</label>
                  <textarea
                    rows={4}
                    value={reviewForm.comment}
                    onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary resize-none transition-all"
                    placeholder="Hãy chia sẻ nhận xét chi tiết về sản phẩm nội thất, thái độ làm việc, khâu lắp đặt..."
                  />
                </div>

                <button
                  disabled={submitting === 'review'}
                  onClick={submitReview}
                  className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-light transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
                >
                  {submitting === 'review' ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Đang gửi đánh giá...
                    </>
                  ) : (
                    'Gửi đánh giá đa tiêu chí'
                  )}
                </button>
              </div>
            )}

            {/* Đã đánh giá xong */}
            {hasReviewed && (
              <div className="bg-gradient-to-br from-green-50/20 to-primary/5 border border-green-100 rounded-2xl p-5 shadow-sm text-center">
                <Award className="w-12 h-12 text-amber-400 mx-auto mb-2 drop-shadow-sm animate-bounce" />
                <h4 className="font-bold text-gray-950 text-sm sm:text-base">Giao dịch đã được nghiệm thu và đánh giá!</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto leading-relaxed">
                  Cảm ơn bạn đã gửi đánh giá khách quan về chất lượng thi công. Phản hồi của bạn đã giúp ConstructX xây dựng một cộng đồng nhà thầu uy tín và chất lượng.
                </p>
                <span className="inline-flex items-center gap-1 mt-4 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                  <Check size={12}/>
                  Đã hoàn tất đánh giá
                </span>
              </div>
            )}

            {/* Không phải khách hàng nhưng đã completed */}
            {!isCustomer && !hasReviewed && (
              <div className="bg-gray-50 border border-gray-150 rounded-2xl p-5 text-center text-gray-500">
                <Clock size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-xs font-semibold">Đang chờ khách hàng gửi đánh giá chất lượng</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Hợp đồng đã hoàn công, nhà thầu đang đợi khách hàng viết nhận xét phản hồi.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
