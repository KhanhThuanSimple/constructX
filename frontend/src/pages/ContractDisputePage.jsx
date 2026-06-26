import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ContractHeader from '../components/ContractHeader';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import {
  AlertTriangle, ShieldAlert, MessageSquare, Clock,
  ArrowRight, Shield, Scale, CheckCircle2, Loader2, Info
} from 'lucide-react';

const fmt = (n) =>
  n == null ? '0đ' :
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n).replace('₫', 'đ');

export default function ContractDisputePage() {
  const { contractId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const isCustomer   = user?.role === 'CUSTOMER';
  const isContractor = user?.role === 'CONTRACTOR';

  const [contract, setContract]           = useState(null);
  const [disbursements, setDisbursements] = useState([]);
  const [progress, setProgress]           = useState(0);
  const [loading, setLoading]             = useState(true);

  // Dispute Form
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      setContract(contractRes.data.data);
      setDisbursements(disbRes.data.data || []);
      setProgress(progressRes.data.data || 0);
    } catch {
      toast.error('Không thể tải thông tin tranh chấp');
    } finally {
      setLoading(false);
    }
  };

  // Gửi khiếu nại tranh chấp
  const handleSubmitDispute = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return toast.error('Vui lòng nhập lý do tranh chấp/khiếu nại');
    
    const disputeAmt = amount ? Number(amount) : contract.agreedPrice;
    if (disputeAmt > contract.agreedPrice) {
      return toast.error(`Số tiền tranh chấp không được vượt quá tổng giá trị hợp đồng (${fmt(contract.agreedPrice)})`);
    }
    if (disputeAmt <= 0) {
      return toast.error('Số tiền tranh chấp phải lớn hơn 0');
    }

    if (!window.confirm('CẢNH BÁO QUAN TRỌNG:\nHành động này sẽ đóng băng toàn bộ dòng tiền của hợp đồng ngay lập tức. Cả hai bên không thể cập nhật tiến độ hay giải ngân cho đến khi Admin đưa ra phán quyết.\n\nBạn có chắc chắn muốn khởi tạo tranh chấp này?')) return;

    setSubmitting(true);
    try {
      await api.post('/disputes', {
        contractJobId: Number(contractId),
        reason: reason,
        amount: amount ? Number(amount) : undefined
      });
      toast.success('⚠️ Đã khởi tạo tranh chấp thành công! Hợp đồng đã bị đóng băng tài chính.');
      setReason('');
      setAmount('');
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Không thể khởi tạo tranh chấp');
    } finally {
      setSubmitting(false);
    }
  };

  // Tính toán số liệu giải ngân
  const totalDisbursed  = disbursements.filter(d => d.status === 'APPROVED').reduce((s, d) => s + (d.amount || 0), 0);
  const totalLocked     = disbursements.filter(d => d.status === 'APPROVED' && !d.fullyUnlocked).reduce((s, d) => s + (d.lockedAmount || 0), 0);

  if (loading) return (
    <Layout title="Giải quyết Tranh chấp">
      <div className="flex justify-center py-24"><Loader2 size={36} className="animate-spin text-primary"/></div>
    </Layout>
  );
  if (!contract) return null;

  const isDisputed = contract.isDisputed;

  return (
    <Layout title="Giải quyết Tranh chấp">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header dùng chung */}
        <ContractHeader
          contract={contract}
          progress={progress}
          totalDisbursed={totalDisbursed}
          totalLocked={totalLocked}
          activeTab="dispute"
        />

        {/* ── TRƯỜNG HỢP 1: ĐANG CÓ TRANH CHẤP HOẠT ĐỘNG ── */}
        {isDisputed && (
          <div className="space-y-6">
            {/* Card Trạng thái tranh chấp lớn */}
            <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-red-500" />
              
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div className="space-y-2 flex-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold animate-pulse">
                    <ShieldAlert size={13} />
                    Tranh chấp đang xử lý
                  </span>
                  <h3 className="text-lg font-extrabold text-gray-900 mt-2">Hợp đồng đang bị đóng băng tài chính</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Hợp đồng đã phát sinh khiếu nại từ một trong hai bên. Mọi hoạt động cập nhật tiến độ thi công, nghiệm thu hoàn công hoặc yêu cầu giải ngân hiện đã bị khóa hoàn toàn nhằm bảo toàn tài chính Escrow.
                  </p>
                </div>
                
                <div className="bg-red-50 rounded-2xl p-4 border border-red-100/60 text-center shrink-0 w-full sm:w-auto">
                  <p className="text-[10px] uppercase tracking-wider text-red-600 font-bold">Số tiền tranh chấp</p>
                  <p className="text-xl font-black text-red-700 mt-1">
                    {contract.disputeAmount ? fmt(contract.disputeAmount) : fmt(contract.agreedPrice)}
                  </p>
                  <p className="text-[9px] text-red-500 mt-0.5">Bảo đảm đóng băng bởi Sàn</p>
                </div>
              </div>

              {/* Thông tin lý do tranh chấp */}
              {contract.disputeReason && (
                <div className="mt-5 bg-red-50/30 rounded-xl p-4 border border-red-100/50 text-xs sm:text-sm text-red-900 leading-relaxed whitespace-pre-wrap">
                  <strong>Nội dung khiếu nại gốc:</strong> "{contract.disputeReason}"
                </div>
              )}
            </div>

            {/* Quy trình giải quyết tranh chấp 4 bước */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Scale size={16} className="text-primary" />
                Quy trình Phân xử & Trọng tài 4 bước
              </h4>
              
              <div className="space-y-4 relative before:absolute before:top-2 before:bottom-2 before:left-4 before:w-0.5 before:bg-gray-100">
                {[
                  { title: '1. Khởi tạo tranh chấp', desc: 'Khiếu nại được ghi nhận và dòng tiền hợp đồng lập tức bị khóa tự động.', done: true },
                  { title: '2. Đóng băng tài chính', desc: 'Tiền tạm ứng hoặc ký quỹ của cả hai bên được Sàn giữ chặt trong ví đóng băng an toàn.', done: true },
                  { title: '3. Đối chất 3 bên & Thu thập bằng chứng (Hiện tại)', desc: 'Hai bên cung cấp hình ảnh thực tế, tin nhắn trao đổi. Admin đóng vai trò trọng tài để thẩm định hiện trường.', done: true, active: true },
                  { title: '4. Phán quyết cuối cùng', desc: 'Admin đưa ra quyết định phân chia dòng tiền dựa trên chứng cứ hợp lý (hoàn tiền khách hàng, trả một phần cho nhà thầu, v.v.).', done: false },
                ].map((s, idx) => (
                  <div key={idx} className="relative pl-9 text-xs sm:text-sm">
                    <div className={`absolute left-2.5 top-1 w-3 h-3 rounded-full border-2 ${
                      s.active ? 'bg-primary border-primary ring-4 ring-primary/20' :
                      s.done ? 'bg-primary border-primary' : 'bg-white border-gray-300'
                    }`} />
                    <p className={`font-bold ${s.active ? 'text-primary' : s.done ? 'text-gray-800' : 'text-gray-400'}`}>{s.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Phòng chat đối chất */}
            <div className="bg-gradient-to-br from-primary/5 to-blue-50/50 border border-primary/20 rounded-2xl p-6 shadow-sm text-center space-y-3">
              <MessageSquare className="w-12 h-12 text-primary mx-auto mb-2 opacity-85 animate-pulse" />
              <h4 className="font-bold text-gray-900 text-sm sm:text-base">Mở phòng đối chất trực tuyến</h4>
              <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                Phòng chat đối chất 3 bên đã được tự động mở. Bạn và đối tác cần cung cấp tin nhắn trao đổi, hình ảnh hiện trường thi công bị lỗi, hóa đơn vật tư để làm căn cứ phân xử cho Admin.
              </p>
              <button
                onClick={() => navigate('/chat')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-light transition-all shadow-sm shadow-primary/20"
              >
                <MessageSquare size={14} />
                Đi đến phòng Chat đối chất ngay
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* ── TRƯỜNG HỢP 2: KHÔNG CÓ TRANH CHẤP & CÓ THỂ KHỞI TẠO ── */}
        {!isDisputed && (
          <div className="space-y-6">
            {/* Hướng dẫn khiếu nại */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Scale size={18} className="text-primary" />
                Cơ chế Bảo vệ & Phân xử Tranh chấp của ConstructX
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5 mb-1.5">
                    <Shield size={14} className="text-primary" />
                    Khi nào nên gửi khiếu nại?
                  </h4>
                  <ul className="text-xs text-gray-500 space-y-1 list-disc pl-4 leading-relaxed">
                    <li>Đối tác vi phạm nghiêm trọng điều khoản hợp đồng.</li>
                    <li>Nhà thầu thi công sai thiết kế, sai vật liệu thỏa thuận.</li>
                    <li>Nhà thầu trễ hẹn tiến độ kéo dài không có lý do chính đáng.</li>
                    <li>Khách hàng từ chối giải ngân vô lý khi công việc đạt mốc.</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle size={14} className="text-amber-500" />
                    Hệ quả sau khi gửi khiếu nại
                  </h4>
                  <ul className="text-xs text-gray-500 space-y-1 list-disc pl-4 leading-relaxed">
                    <li>Dòng tiền Escrow lập tức bị khóa 100%.</li>
                    <li>Hợp đồng bị đóng băng mọi hoạt động thi công và tài chính.</li>
                    <li>Mở phòng chat đối chất trực tuyến có sự tham gia của Admin.</li>
                    <li>Quyết định phân chia dòng tiền cuối cùng thuộc về Admin.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Form khởi tạo tranh chấp */}
            {contract.status === 'ACTIVE' ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-500" />
                  Biểu mẫu Khởi tạo Tranh chấp Hợp đồng
                </h3>

                <form onSubmit={handleSubmitDispute} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Lý do khiếu nại chi tiết</label>
                    <textarea
                      rows={5}
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 transition-all resize-none"
                      placeholder="Hãy mô tả thật cụ thể hành vi vi phạm hợp đồng của đối tác (ví dụ: nhà thầu không đến thi công 10 ngày qua, lắp đặt sai loại đá bếp đã chốt trong hợp đồng, v.v.)..."
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                      Số tiền yêu cầu bồi thường/tranh chấp (VND)
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 transition-all"
                      placeholder={`Để trống để chọn toàn bộ giá trị hợp đồng: ${fmt(contract.agreedPrice)}`}
                      max={contract.agreedPrice || 0}
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Số tiền tranh chấp tối đa không vượt quá tổng giá trị hợp đồng.</p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Đang khởi tạo tranh chấp...
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={15} />
                          ⚠️ Xác nhận gửi khiếu nại & Khởi động Đóng băng hợp đồng
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center text-gray-500">
                <Info size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-xs font-semibold">Không thể khởi tạo khiếu nại tại thời điểm này</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Chỉ những hợp đồng đang trong trạng thái thi công (ACTIVE) mới có thể thực hiện khiếu nại hoặc tranh chấp tài chính.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
