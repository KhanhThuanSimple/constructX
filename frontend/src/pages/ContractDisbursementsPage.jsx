import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ContractHeader from '../components/ContractHeader';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import {
  Clock, DollarSign, AlertCircle, Unlock, Lock,
  ShieldCheck, CheckCircle2, UserCheck, X, Loader2,
  ArrowRight, BadgeCheck, XCircle, TrendingUp
} from 'lucide-react';

const fmt = (n) =>
  n == null ? '0đ' :
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n).replace('₫', 'đ');

const PHASES = [
  { label: 'Khởi công',           threshold: 20  },
  { label: 'Thi công phần thô',   threshold: 50  },
  { label: 'Hoàn thiện',          threshold: 80  },
  { label: 'Bàn giao công trình', threshold: 100 },
];

function getDisbStatus(d) {
  if (d.status === 'REJECTED')  return { label: 'Bị từ chối',         cls: 'bg-red-100 text-red-600',    icon: <XCircle size={12}/> };
  if (d.status === 'CANCELLED') return { label: 'Đã huỷ',             cls: 'bg-gray-100 text-gray-500',  icon: <XCircle size={12}/> };
  if (d.status === 'APPROVED')  return { label: 'Đã giải ngân',        cls: 'bg-green-100 text-green-700',icon: <BadgeCheck size={12}/> };
  
  if (!d.adminVerified)         return { label: 'Chờ Admin xác nhận', cls: 'bg-amber-100 text-amber-700',icon: <ShieldCheck size={12}/> };
  return                               { label: 'Chờ bạn duyệt',      cls: 'bg-blue-100 text-blue-700',  icon: <UserCheck size={12}/> };
}

function DisbPipeline({ d, isAdmin, isCustomer, onAdminVerify, onApprove, onReject, onUnlock, submitting, isDisputed }) {
  const steps = [
    { key: 'sent',     label: 'Nhà thầu gửi',    done: true },
    { key: 'verify',   label: 'Admin xác nhận',   done: !!d.adminVerified },
    { key: 'customer', label: 'Khách duyệt',      done: d.status === 'APPROVED' },
    { key: 'escrow',   label: 'Escrow giải ngân',done: d.status === 'APPROVED' },
    { key: 'unlock',   label: 'Mở khóa bảo đảm', done: !!d.fullyUnlocked },
  ];

  return (
    <div className="mt-5 border-t border-gray-50 pt-4">
      {/* Tiến trình 5 bước đồ họa */}
      <div className="flex items-center gap-0 mb-4 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <React.Fragment key={s.key}>
            <div className="flex flex-col items-center shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                s.done
                  ? 'bg-primary border-primary text-white shadow-sm'
                  : 'bg-white border-gray-200 text-gray-400'
              }`}>
                {s.done ? '✓' : i + 1}
              </div>
              <p className={`text-[10px] mt-1.5 text-center w-16 leading-tight font-medium ${s.done ? 'text-primary font-bold' : 'text-gray-400'}`}>
                {s.label}
              </p>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-5 min-w-[30px] ${
                steps[i + 1].done ? 'bg-primary' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Các nút hành động tương ứng với vai trò */}
      <div className="flex flex-wrap gap-2 mt-2">
        {/* Bước 2: Admin xác nhận */}
        {isAdmin && d.status === 'PENDING' && !d.adminVerified && (
          <button
            onClick={() => onAdminVerify(d.id)}
            disabled={submitting === d.id || isDisputed}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShieldCheck size={13}/>
            {submitting === d.id ? 'Đang xử lý...' : 'Admin xác nhận hợp lệ'}
          </button>
        )}

        {/* Bước 3: Khách duyệt giải ngân */}
        {isCustomer && d.status === 'PENDING' && d.adminVerified && (
          <>
            <button
              onClick={() => onApprove(d.id)}
              disabled={submitting === d.id || isDisputed}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <CheckCircle2 size={13}/>
              {submitting === d.id ? 'Đang duyệt...' : 'Phê duyệt giải ngân'}
            </button>
            <button
              onClick={() => onReject(d.id)}
              disabled={submitting === d.id || isDisputed}
              className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 bg-white rounded-xl text-xs font-bold hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={13}/>
              Từ chối yêu cầu
            </button>
          </>
        )}

        {/* Bước 5: Mở khóa phần locked 70% (sau khi thi công đạt mốc tiếp theo) */}
        {(isAdmin || isCustomer) && d.status === 'APPROVED' && !d.fullyUnlocked && d.lockedAmount > 0 && (
          <button
            onClick={() => onUnlock(d.id)}
            disabled={submitting === d.id || isDisputed}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Unlock size={13}/>
            Mở khóa bảo đảm {fmt(d.lockedAmount)}
          </button>
        )}
      </div>

      {/* Các dòng trạng thái / thông báo */}
      {d.adminVerified && d.adminVerifyNote && (
        <p className="text-xs text-gray-500 mt-2 bg-amber-50 rounded-xl px-3 py-2 flex items-center gap-1.5 border border-amber-100">
          <ShieldCheck size={13} className="text-amber-500 shrink-0"/>
          <span><strong>Ghi chú Admin:</strong> {d.adminVerifyNote}</span>
        </p>
      )}

      {isCustomer && d.status === 'PENDING' && !d.adminVerified && (
        <p className="text-xs text-amber-800 mt-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center gap-1.5">
          <Clock size={13} className="text-amber-500 shrink-0"/>
          Yêu cầu đang chờ Admin kiểm tra điều kiện thi công tại công trường. Khi Admin xác nhận hợp lệ, bạn mới có thể duyệt giải ngân.
        </p>
      )}
    </div>
  );
}

export default function ContractDisbursementsPage() {
  const { contractId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const isContractor = user?.role === 'CONTRACTOR';
  const isCustomer   = user?.role === 'CUSTOMER';
  const isAdmin      = user?.role === 'ADMIN';

  const [contract, setContract]           = useState(null);
  const [logs, setLogs]                   = useState([]);
  const [disbursements, setDisbursements] = useState([]);
  const [progress, setProgress]           = useState(0);
  const [loading, setLoading]             = useState(true);

  // Modals
  const [showDisbModal, setShowDisbModal]     = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const [verifyTarget, setVerifyTarget]       = useState(null);
  const [verifyNote, setVerifyNote]           = useState('');
  const [rejectTarget, setRejectTarget]       = useState(null);
  const [rejectReason, setRejectReason]       = useState('');

  const [submitting, setSubmitting] = useState(null); // id đang xử lý hoặc 'disb'

  // Disbursement form (30% immediate / 70% locked)
  const [disbForm, setDisbForm] = useState({
    phaseLabel: PHASES[0].label,
    phaseThreshold: PHASES[0].threshold,
    amount: '',
    immediateRatio: 30,
    note: '',
  });

  useEffect(() => {
    fetchAll();
  }, [contractId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [contractRes, logsRes, disbRes, progressRes] = await Promise.all([
        api.get(`/contracts/${contractId}`),
        api.get(`/contracts/${contractId}/construction-logs`),
        api.get(`/contracts/${contractId}/disbursements`),
        api.get(`/contracts/${contractId}/progress`),
      ]);
      setContract(contractRes.data.data);
      setLogs(logsRes.data.data || []);
      setDisbursements(disbRes.data.data || []);
      setProgress(progressRes.data.data || 0);
    } catch {
      toast.error('Không thể tải dữ liệu giải ngân');
    } finally {
      setLoading(false);
    }
  };

  // Mở modal yêu cầu giải ngân - tự động chọn phase phù hợp tiến độ
  const openDisbModal = () => {
    const eligiblePhases = PHASES.filter(ph => progress >= ph.threshold);
    const bestPhase = eligiblePhases.length > 0
      ? eligiblePhases[eligiblePhases.length - 1]
      : null;

    setDisbForm({
      phaseLabel: bestPhase ? bestPhase.label : PHASES[0].label,
      phaseThreshold: bestPhase ? bestPhase.threshold : PHASES[0].threshold,
      amount: '',
      immediateRatio: 30,
      note: '',
    });
    setShowDisbModal(true);
  };

  // Gửi yêu cầu giải ngân (Contractor)
  const submitDisbursement = async () => {
    if (!disbForm.amount || Number(disbForm.amount) <= 0) return toast.error('Vui lòng nhập số tiền hợp lệ');
    if (progress < disbForm.phaseThreshold) {
      return toast.error(`Tiến độ thi công hiện tại (${progress}%) chưa đạt ngưỡng ${disbForm.phaseThreshold}% để giải ngân giai đoạn này`);
    }

    const agreedPrice = contract.agreedPrice || 0;
    const stageMax = Math.round(agreedPrice * (disbForm.phaseThreshold / 100));
    const alreadyDisbursed = disbursements.filter(d => d.status === 'APPROVED').reduce((s, d) => s + (d.amount || 0), 0);
    const maxAllowedThisStage = stageMax - alreadyDisbursed;
    
    if (Number(disbForm.amount) > maxAllowedThisStage) {
      return toast.error(`Số tiền yêu cầu giải ngân (${fmt(Number(disbForm.amount))}) vượt quá hạn mức tối đa cho phép của giai đoạn này (${fmt(maxAllowedThisStage)})`);
    }
    
    setSubmitting('disb');
    try {
      await api.post('/disbursements', {
        contractId: Number(contractId),
        phaseLabel: disbForm.phaseLabel,
        phaseThreshold: Number(disbForm.phaseThreshold),
        amount: Number(disbForm.amount),
        immediateRatio: disbForm.immediateRatio / 100,
        note: disbForm.note || undefined,
      });
      toast.success('✅ Đã gửi yêu cầu! Chờ Admin xác minh công trình.');
      setShowDisbModal(false);
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(null);
    }
  };

  // Admin mở modal xác nhận
  const handleAdminVerify = async (id) => {
    setVerifyTarget(id);
    setVerifyNote('');
    setShowVerifyModal(true);
  };

  const confirmAdminVerify = async () => {
    setSubmitting(verifyTarget);
    try {
      await api.post(`/disbursements/${verifyTarget}/admin-verify`, { note: verifyNote });
      toast.success('✅ Đã xác nhận! Thông báo đã gửi tới khách hàng để phê duyệt.');
      setShowVerifyModal(false);
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(null);
    }
  };

  // Khách hàng duyệt giải ngân
  const approveDisbursement = async (id) => {
    const d = disbursements.find(item => item.id === id);
    if (!d) return;
    const ratio = Math.round((d.immediateRatio || 0.3) * 100);
    const lockedRatio = 100 - ratio;
    
    if (!window.confirm(`Xác nhận duyệt giải ngân?\n• ${ratio}% (${fmt(d.immediateAmount)}) chuyển ngay vào ví nhà thầu.\n• ${lockedRatio}% (${fmt(d.lockedAmount)}) sẽ bị đóng băng (escrow) bảo đảm cho đến mốc thi công tiếp theo.`)) return;
    
    setSubmitting(id);
    try {
      await api.post(`/disbursements/${id}/approve`);
      toast.success('🎉 Giải ngân thành công! 30% đã chuyển đi, 70% được lock an toàn.');
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(null);
    }
  };

  // Khách hàng từ chối giải ngân
  const openRejectModal = (id) => {
    setRejectTarget(id);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const rejectDisbursement = async () => {
    if (!rejectReason.trim()) return toast.error('Vui lòng nhập lý do từ chối');
    setSubmitting(rejectTarget);
    try {
      await api.post(`/disbursements/${rejectTarget}/reject`, { reason: rejectReason });
      toast.success('Đã từ chối yêu cầu giải ngân');
      setShowRejectModal(false);
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(null);
    }
  };

  // Mở khóa số tiền đóng băng (escrow locked)
  const unlockLocked = async (id) => {
    if (!window.confirm('Xác nhận mở khóa toàn bộ số tiền đóng băng bảo đảm của giai đoạn này? Số tiền này sẽ khả dụng ngay trong ví nhà thầu.')) return;
    setSubmitting(id);
    try {
      await api.post(`/disbursements/${id}/unlock`);
      toast.success('🔓 Đã mở khóa thành công! Tiền đã chuyển vào ví khả dụng của nhà thầu.');
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(null);
    }
  };

  // Tính toán số liệu giải ngân
  const totalDisbursed  = disbursements.filter(d => d.status === 'APPROVED').reduce((s, d) => s + (d.amount || 0), 0);
  const totalLocked     = disbursements.filter(d => d.status === 'APPROVED' && !d.fullyUnlocked).reduce((s, d) => s + (d.lockedAmount || 0), 0);
  const maxDisbursable  = contract ? Math.round((contract.agreedPrice || 0) * 0.8) : 0;
  const pendingCount    = disbursements.filter(d => d.status === 'PENDING').length;

  if (loading) return (
    <Layout title="Quản lý Giải ngân">
      <div className="flex justify-center py-24"><Loader2 size={36} className="animate-spin text-primary"/></div>
    </Layout>
  );
  if (!contract) return null;

  if (contract.isDisputed) {
    return (
      <Layout title="Quản lý Giải ngân & Escrow">
        <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-red-150 p-6 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
            <AlertCircle size={32} className="animate-pulse" />
          </div>
          <h2 className="text-lg font-extrabold text-gray-900">Hợp đồng đang bị đóng băng tranh chấp</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Hợp đồng này hiện đang ở trạng thái tranh chấp và mọi tính năng giải ngân tài chính đã bị vô hiệu hóa tạm thời để bảo toàn tài chính Escrow. Vui lòng di chuyển đến trang giải quyết tranh chấp để đối chất hoặc chờ phán quyết của Admin.
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

  return (
    <Layout title="Quản lý Giải ngân & Escrow">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header dùng chung */}
        <ContractHeader
          contract={contract}
          progress={progress}
          totalDisbursed={totalDisbursed}
          totalLocked={totalLocked}
          activeTab="disbursements"
        />

        {/* Thẻ Thống kê Tài chính (Grid) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Tổng giá trị hợp đồng', value: fmt(contract.agreedPrice), color: 'text-gray-900' },
            { label: 'Đã giải ngân (APPROVED)', value: fmt(totalDisbursed), color: 'text-green-600' },
            { label: 'Tiền bảo đảm đóng băng', value: fmt(totalLocked), color: 'text-amber-600' },
            { 
              label: totalDisbursed >= maxDisbursable ? 'Chờ hoàn công (20%)' : 'Giải ngân trước hoàn công (80%)', 
              value: totalDisbursed >= maxDisbursable ? fmt((contract.agreedPrice || 0) - totalDisbursed) : fmt(maxDisbursable - totalDisbursed), 
              color: 'text-blue-600' 
            },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{stat.label}</p>
              <p className={`text-base sm:text-lg font-extrabold mt-1.5 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Banner đạt mốc giải ngân tối đa 80% */}
        {totalDisbursed >= maxDisbursable && contract.status === 'ACTIVE' && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800 shadow-sm">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-500"/>
            <div>
              <p className="font-bold">Đã đạt giới hạn giải ngân 80% trước nghiệm thu</p>
              <p className="text-xs mt-1 text-amber-700 leading-relaxed">
                Hệ thống chỉ cho phép giải ngân tối đa 80% giá trị hợp đồng trong quá trình thi công. 
                Số tiền <strong>20% còn lại ({fmt((contract.agreedPrice || 0) - totalDisbursed)})</strong> sẽ được giải phóng ngay sau khi hai bên nghiệm thu hoàn công và được xác nhận bởi Admin tại tab <strong>Nghiệm thu & Đánh giá</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Quy trình giải ngân 5 bước đồ họa */}
        

        {/* Danh sách yêu cầu giải ngân */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <DollarSign size={18} className="text-primary" />
              Danh sách Yêu cầu giải ngân
            </h3>
            
            {isContractor && contract.status === 'ACTIVE' && (
              <button
                onClick={openDisbModal}
                disabled={contract.isDisputed || totalDisbursed >= maxDisbursable}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DollarSign size={14}/>
                Tạo yêu cầu giải ngân mới
              </button>
            )}
          </div>

          {disbursements.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center shadow-sm">
              <DollarSign size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-400 font-semibold text-sm">Chưa phát sinh yêu cầu giải ngân nào</p>
              <p className="text-xs text-gray-300 mt-1">Các yêu cầu thanh toán từng mốc thi công sẽ xuất hiện tại đây sau khi nhà thầu gửi đề xuất giải ngân.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {disbursements.map((d) => {
                const st = getDisbStatus(d);
                return (
                  <div
                    key={d.id}
                    className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${
                      d.status === 'PENDING' && d.adminVerified ? 'border-blue-200 ring-2 ring-blue-50/50' :
                      d.status === 'PENDING' ? 'border-amber-200' :
                      d.status === 'APPROVED' ? 'border-green-100' : 'border-gray-100'
                    }`}
                  >
                    {/* Header yêu cầu */}
                    <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${st.cls}`}>
                            {st.icon}
                            {st.label}
                          </span>
                          <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold">
                            Mốc: {d.phaseLabel} ({d.phaseThreshold}%)
                          </span>
                          {d.fullyUnlocked && (
                            <span className="flex items-center gap-1 px-2.5 py-0.5 bg-green-50 text-green-700 rounded-full text-[10px] font-bold border border-green-100 animate-fadeIn">
                              🔓 Đã mở khóa hết
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400">
                          Yêu cầu lúc tiến độ đạt: <strong>{d.progressAtRequest}%</strong> • Ngày gửi: {new Date(d.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-black text-primary">{fmt(d.amount)}</p>
                        {d.status === 'APPROVED' && (
                          <div className="text-[10px] mt-1 space-y-0.5 font-medium">
                            <p className="text-green-600">
                              ✓ Đã chuyển ví: {fmt(d.immediateAmount)} ({Math.round((d.immediateRatio || 0.3) * 100)}%)
                            </p>
                            {d.lockedAmount > 0 && !d.fullyUnlocked && (
                              <p className="text-amber-600 flex items-center gap-1 justify-end">
                                <Lock size={9}/>
                                Đóng băng: {fmt(d.lockedAmount)} ({100 - Math.round((d.immediateRatio || 0.3) * 100)}%)
                              </p>
                            )}
                            {d.fullyUnlocked && (
                              <p className="text-gray-400 flex items-center gap-1 justify-end">
                                <Unlock size={9}/>
                                Mở khóa bảo đảm: {fmt(d.lockedAmount)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ghi chú */}
                    {d.note && (
                      <div className="text-xs text-gray-600 bg-gray-50 rounded-xl p-3 mb-3 border border-gray-100/50">
                        <strong>Ghi chú từ nhà thầu:</strong> {d.note}
                      </div>
                    )}

                    {d.rejectReason && (
                      <div className="text-xs text-red-700 bg-red-50 rounded-xl p-3 mb-3 border border-red-100 flex items-start gap-1.5">
                        <AlertCircle size={13} className="mt-0.5 shrink-0" />
                        <div><strong>Lý do từ chối của khách hàng:</strong> {d.rejectReason}</div>
                      </div>
                    )}

                    {/* Pipeline xử lý */}
                    {d.status !== 'CANCELLED' && d.status !== 'REJECTED' && (
                      <DisbPipeline
                        d={d}
                        isAdmin={isAdmin}
                        isCustomer={isCustomer}
                        onAdminVerify={handleAdminVerify}
                        onApprove={approveDisbursement}
                        onReject={openRejectModal}
                        onUnlock={unlockLocked}
                        submitting={submitting}
                        isDisputed={contract.isDisputed}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Thêm Yêu cầu giải ngân */}
      {showDisbModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 relative shadow-2xl">
            <button
              onClick={() => setShowDisbModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20}/>
            </button>
            
            <h2 className="text-lg font-bold text-gray-850 mb-1 flex items-center gap-2">
              <DollarSign size={20} className="text-primary" />
              Yêu cầu giải ngân
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              Tiến độ hiện tại: {progress}% •{' '}
              {Math.round((contract?.agreedPrice || 0) * (disbForm.phaseThreshold / 100)) - totalDisbursed > 0 ? (
                <>Hạn mức tối đa đợt này: <strong className="text-amber-600">{fmt(Math.round((contract?.agreedPrice || 0) * (disbForm.phaseThreshold / 100)) - totalDisbursed)}</strong></>
              ) : (
                <span className="text-red-500 font-bold">Đã giải ngân đạt hoặc vượt hạn mức tối đa của giai đoạn này ({fmt(Math.round((contract?.agreedPrice || 0) * (disbForm.phaseThreshold / 100)))}).</span>
              )}
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Chọn Giai đoạn thi công đã hoàn thành</label>
                <div className="space-y-1.5">
                  {PHASES.map(ph => {
                    const reached = progress >= ph.threshold;
                    const isSelected = disbForm.phaseLabel === ph.label;
                    return (
                      <button
                        key={ph.threshold}
                        type="button"
                        disabled={!reached}
                        onClick={() => reached && setDisbForm(prev => ({
                          ...prev,
                          phaseLabel: ph.label,
                          phaseThreshold: ph.threshold
                        }))}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs sm:text-sm transition-all ${
                          !reached
                            ? 'bg-gray-50 border-gray-100 text-gray-350 cursor-not-allowed'
                            : isSelected
                            ? 'bg-primary border-primary text-white font-bold shadow-sm'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-primary hover:bg-primary/5'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${reached ? (isSelected ? 'bg-white' : 'bg-green-400') : 'bg-gray-200'}`}/>
                          {ph.label}
                        </span>
                        <span className={`text-xs font-semibold ${isSelected ? 'text-white/85' : reached ? 'text-green-600 font-bold' : 'text-gray-300'}`}>
                          {ph.threshold}% {reached ? '✓ Đạt mốc' : '— Chưa đạt'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Số tiền yêu cầu giải ngân (VND)</label>
                <input
                  type="number"
                  min={1}
                  value={disbForm.amount}
                  onChange={e => setDisbForm(p => ({ ...p, amount: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                  placeholder="Ví dụ: 10000000"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                  Tỷ lệ giải ngân nhận ngay: <strong className="text-primary">{disbForm.immediateRatio}%</strong>
                  <span className="text-gray-400 ml-2 font-normal">• Gửi cọc (locked): {100 - disbForm.immediateRatio}%</span>
                </label>
                <input
                  type="range"
                  min={20}
                  max={50}
                  step={5}
                  value={disbForm.immediateRatio}
                  onChange={e => setDisbForm(p => ({ ...p, immediateRatio: Number(e.target.value) }))}
                  className="w-full accent-primary h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-gray-400 mt-1">
                  <span>20% (tối thiểu nhận ngay)</span>
                  <span>50% (tối đa nhận ngay)</span>
                </div>
                {disbForm.amount > 0 && (
                  <div className="flex justify-between text-xs mt-3 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                    <span className="text-green-600 font-bold">
                      ✓ Nhận ngay: {fmt(Math.round(disbForm.amount * disbForm.immediateRatio / 100))}
                    </span>
                    <span className="text-amber-600 flex items-center gap-1 font-bold">
                      <Lock size={10}/>
                      Tạm khóa: {fmt(Math.round(disbForm.amount * (100 - disbForm.immediateRatio) / 100))}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Mô tả công việc đã hoàn thiện</label>
                <textarea
                  rows={2}
                  value={disbForm.note}
                  onChange={e => setDisbForm(p => ({ ...p, note: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary resize-none transition-all"
                  placeholder="Ghi chú tóm tắt đợt giải ngân..."
                />
              </div>

              <button
                disabled={submitting === 'disb'}
                onClick={submitDisbursement}
                className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-light disabled:opacity-50 text-sm transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {submitting === 'disb' ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Đang gửi yêu cầu...
                  </>
                ) : (
                  'Gửi yêu cầu giải ngân Escrow'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Admin verify */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button onClick={() => setShowVerifyModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={18}/>
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <ShieldCheck size={20} className="text-amber-600"/>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">Admin xác minh yêu cầu giải ngân</h3>
                <p className="text-xs text-gray-400">Xác nhận nhà thầu thi công thực tế tại công trình hợp lệ trước khi gửi khách hàng duyệt.</p>
              </div>
            </div>
            
            <textarea
              rows={3}
              value={verifyNote}
              onChange={e => setVerifyNote(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-primary resize-none mb-4"
              placeholder="Ghi chú xác thực (năng lực thi công, chất lượng bàn giao)..."
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowVerifyModal(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmAdminVerify}
                disabled={submitting === verifyTarget}
                className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
              >
                {submitting === verifyTarget ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  '✓ Xác nhận hợp lệ'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Customer từ chối */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button onClick={() => setShowRejectModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={18}/>
            </button>
            
            <h3 className="font-bold text-gray-850 text-base mb-2">Từ chối yêu cầu giải ngân</h3>
            <p className="text-xs text-gray-400 mb-4">Vui lòng cung cấp lý do từ chối cụ thể để nhà thầu khắc phục hoặc điều chỉnh yêu cầu giải ngân.</p>
            
            <textarea
              rows={3}
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400 resize-none mb-4 transition-all"
              placeholder="Ví dụ: Thi công sai thiết kế phần thô, cần sửa lại trước khi giải ngân..."
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-650 hover:bg-gray-50 transition-colors"
              >
                Huỷ
              </button>
              <button
                onClick={rejectDisbursement}
                disabled={submitting === rejectTarget}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-650 disabled:opacity-50 transition-colors"
              >
                {submitting === rejectTarget ? 'Đang từ chối...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
