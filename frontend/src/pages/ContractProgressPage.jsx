import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import {
  Camera, CheckCircle2, Clock, DollarSign, ImagePlus,
  Loader2, Lock, Unlock, X, ChevronLeft, AlertCircle,
  TrendingUp, ShieldCheck, UserCheck, AlertTriangle,
  ArrowRight, BadgeCheck
} from 'lucide-react';

const fmt = (n) =>
  n == null ? '—' :
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
    .format(n).replace('₫', 'đ');

const PHASES = [
  { label: 'Khởi công',           threshold: 20  },
  { label: 'Thi công phần thô',   threshold: 50  },
  { label: 'Hoàn thiện',          threshold: 80  },
  { label: 'Bàn giao công trình', threshold: 100 },
];

/**
 * Luồng giải ngân 5 bước:
 * 1. Contractor gửi yêu cầu  → PENDING (adminVerified=false)
 * 2. Admin xác nhận hợp lệ   → PENDING (adminVerified=true)
 * 3. Customer duyệt           → APPROVED
 *    • 30% immediate → ví nhà thầu available
 *    • 70% locked   → ví nhà thầu lockedAmount
 * 4. Đạt mốc tiếp → auto-unlock locked đợt trước
 * 5. Hoàn công 100% + Admin confirm → unlock toàn bộ → COMPLETED
 */

// Trạng thái hiển thị theo pipeline
function getDisbStatus(d) {
  if (d.status === 'REJECTED')  return { label: 'Bị từ chối',         cls: 'bg-red-100 text-red-600',    icon: <X size={11}/> };
  if (d.status === 'CANCELLED') return { label: 'Đã huỷ',             cls: 'bg-gray-100 text-gray-500',  icon: <X size={11}/> };
  if (d.status === 'APPROVED')  return { label: 'Đã giải ngân',        cls: 'bg-green-100 text-green-700',icon: <BadgeCheck size={11}/> };
  // PENDING
  if (!d.adminVerified)         return { label: 'Chờ Admin xác nhận', cls: 'bg-amber-100 text-amber-700',icon: <ShieldCheck size={11}/> };
  return                               { label: 'Chờ bạn duyệt',      cls: 'bg-blue-100 text-blue-700',  icon: <UserCheck size={11}/> };
}

// Pipeline steps component
function DisbPipeline({ d, isAdmin, isCustomer, onAdminVerify, onApprove, onReject, onUnlock, submitting, isDisputed }) {
  const steps = [
    { key: 'sent',     label: 'Nhà thầu gửi',    done: true },
    { key: 'verify',   label: 'Admin xác nhận',   done: !!d.adminVerified },
    { key: 'customer', label: 'Khách duyệt',      done: d.status === 'APPROVED' },
    { key: 'escrow',   label: 'Escrow release',   done: d.status === 'APPROVED' },
    { key: 'unlock',   label: 'Mở lock dần',      done: !!d.fullyUnlocked },
  ];

  return (
    <div className="mt-4">
      {/* Step bar */}
      <div className="flex items-center gap-0 mb-4 overflow-x-auto pb-1">
        {steps.map((s, i) => (
          <React.Fragment key={s.key}>
            <div className="flex flex-col items-center shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                s.done
                  ? 'bg-primary border-primary text-white'
                  : 'bg-white border-gray-200 text-gray-400'
              }`}>
                {s.done ? <CheckCircle2 size={14}/> : i + 1}
              </div>
              <p className={`text-[9px] mt-1 text-center w-14 leading-tight ${s.done ? 'text-primary font-semibold' : 'text-gray-400'}`}>
                {s.label}
              </p>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 ${
                steps[i + 1].done ? 'bg-primary' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Action buttons by step */}
      <div className="flex flex-wrap gap-2">
        {/* Bước 2: Admin verify */}
        {isAdmin && d.status === 'PENDING' && !d.adminVerified && (
          <button onClick={() => onAdminVerify(d.id)} disabled={submitting === d.id || isDisputed}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed">
            <ShieldCheck size={13}/> {submitting === d.id ? 'Đang xử lý...' : 'Admin xác nhận hợp lệ'}
          </button>
        )}

        {/* Bước 3: Customer approve (chỉ sau Admin verify) */}
        {isCustomer && d.status === 'PENDING' && d.adminVerified && (
          <>
            <button onClick={() => onApprove(d.id)} disabled={submitting === d.id || isDisputed}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed">
              <CheckCircle2 size={13}/> {submitting === d.id ? 'Đang duyệt...' : 'Duyệt giải ngân'}
            </button>
            <button onClick={() => onReject(d.id)} disabled={submitting === d.id || isDisputed}
              className="flex items-center gap-1.5 px-4 py-2 border border-red-300 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed">
              <X size={13}/> Từ chối
            </button>
          </>
        )}

        {/* Bước 5: Unlock locked (Admin hoặc Customer) */}
        {(isAdmin || isCustomer) && d.status === 'APPROVED' && !d.fullyUnlocked && d.lockedAmount > 0 && (
          <button onClick={() => onUnlock(d.id)} disabled={submitting === d.id || isDisputed}
            className="flex items-center gap-1.5 px-4 py-2 border border-amber-300 text-amber-700 rounded-xl text-xs font-bold hover:bg-amber-50 disabled:opacity-60 disabled:cursor-not-allowed">
            <Unlock size={13}/> Mở khóa {fmt(d.lockedAmount)}
          </button>
        )}
      </div>

      {/* Admin verify note */}
      {d.adminVerified && d.adminVerifyNote && (
        <p className="text-xs text-gray-500 mt-2 bg-amber-50 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
          <ShieldCheck size={11} className="text-amber-500"/> Admin: {d.adminVerifyNote}
        </p>
      )}

      {/* Customer đang chờ nhưng chưa verify */}
      {isCustomer && d.status === 'PENDING' && !d.adminVerified && (
        <p className="text-xs text-amber-700 mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-1.5">
          <Clock size={11}/> Đang chờ Admin xác nhận yêu cầu này. Bạn sẽ nhận thông báo khi có thể duyệt.
        </p>
      )}
    </div>
  );
}

export default function ContractProgressPage() {
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
  const [activeTab, setActiveTab]         = useState('logs');

  // Tranh chấp & Đánh giá
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeForm, setDisputeForm] = useState({ reason: '', amount: '' });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, qualityScore: 5, communicationScore: 5, progressScore: 5, comment: '' });
  const [hasReviewed, setHasReviewed] = useState(false);

  // Modals
  const [showLogModal, setShowLogModal]       = useState(false);
  const [showDisbModal, setShowDisbModal]     = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTarget, setRejectTarget]       = useState(null);
  const [rejectReason, setRejectReason]       = useState('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyTarget, setVerifyTarget]       = useState(null);
  const [verifyNote, setVerifyNote]           = useState('');

  const [submitting, setSubmitting] = useState(null); // id đang xử lý
  const [uploading, setUploading]   = useState(false);

  // Log form
  const [logForm, setLogForm] = useState({
    progressPercent: '', description: '', imageUrls: [], phaseLabel: '',
  });

  // Disbursement form — tỉ lệ mặc định 30% immediate / 70% locked
  const [disbForm, setDisbForm] = useState({
    phaseLabel: PHASES[0].label,
    phaseThreshold: PHASES[0].threshold,
    amount: '',
    immediateRatio: 30,
    note: '',
  });

  useEffect(() => { fetchAll(); }, [contractId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [contractRes, logsRes, disbRes, progressRes] = await Promise.all([
        api.get(`/contracts/${contractId}`),
        api.get(`/contracts/${contractId}/construction-logs`),
        api.get(`/contracts/${contractId}/disbursements`),
        api.get(`/contracts/${contractId}/progress`),
      ]);
      const contractData = contractRes.data.data;
      setContract(contractData);
      setLogs(logsRes.data.data || []);
      setDisbursements(disbRes.data.data || []);
      setProgress(progressRes.data.data || 0);

      if (contractData && contractData.status === 'COMPLETED') {
        const projId = contractData.projectId || (contractData.project && contractData.project.id) || contractId;
        try {
          const checkRes = await api.get(`/reviews/check?referenceType=PROJECT&referenceId=${projId}`);
          setHasReviewed(checkRes.data.data);
        } catch (e) {
          console.error("Lỗi check review", e);
        }
      }
    } catch {
      toast.error('Không thể tải dữ liệu tiến độ');
    } finally {
      setLoading(false);
    }
  };

  // Upload ảnh Cloudinary
  const handleUploadImage = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const cloudName    = import.meta.env.VITE_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_UPLOAD_PRESET;
      if (!cloudName || !uploadPreset) { toast.error('Thiếu cấu hình Cloudinary'); return; }
      const data = new FormData();
      data.append('file', file);
      data.append('upload_preset', uploadPreset);
      const res    = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: data });
      const result = await res.json();
      if (!res.ok) throw new Error(result?.error?.message || 'Upload thất bại');
      setLogForm(prev => ({ ...prev, imageUrls: [...prev.imageUrls, result.secure_url] }));
      toast.success('Upload ảnh thành công');
    } catch (e) {
      toast.error(e.message || 'Upload thất bại');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) =>
    setLogForm(prev => ({ ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== idx) }));

  // Gửi nhật ký
  const submitLog = async () => {
    if (!logForm.progressPercent) return toast.error('Vui lòng nhập % tiến độ');
    if (!logForm.description.trim()) return toast.error('Vui lòng nhập mô tả công việc');
    setSubmitting('log');
    try {
      await api.post('/construction-logs', {
        contractId: Number(contractId),
        progressPercent: Number(logForm.progressPercent),
        description: logForm.description,
        imageUrls: logForm.imageUrls,
        phaseLabel: logForm.phaseLabel || undefined,
      });
      toast.success('Đã lưu nhật ký thi công');
      setShowLogModal(false);
      setLogForm({ progressPercent: '', description: '', imageUrls: [], phaseLabel: '' });
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(null);
    }
  };

  // Gửi yêu cầu giải ngân (Contractor)
  const submitDisbursement = async () => {
    if (!disbForm.amount || Number(disbForm.amount) <= 0) return toast.error('Vui lòng nhập số tiền hợp lệ');
    // Validate: phase phải đạt được (phòng trường hợp browser bỏ qua disabled)
    if (progress < disbForm.phaseThreshold) {
      return toast.error(`Tiến độ hiện tại (${progress}%) chưa đạt ngưỡng ${disbForm.phaseThreshold}% của giai đoạn này.`);
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
      toast.success('✅ Đã gửi yêu cầu. Admin sẽ xác nhận trước khi khách hàng duyệt.');
      setShowDisbModal(false);
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(null);
    }
  };

  // Mở modal disbursement — auto-select phase phù hợp với tiến độ hiện tại
  const openDisbModal = () => {
    // Tìm phase cao nhất mà progress đã đạt
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

  // Admin xác nhận (verify)
  const handleAdminVerify = async (id) => {
    setVerifyTarget(id);
    setVerifyNote('');
    setShowVerifyModal(true);
  };

  const confirmAdminVerify = async () => {
    setSubmitting(verifyTarget);
    try {
      await api.post(`/disbursements/${verifyTarget}/admin-verify`, { note: verifyNote });
      toast.success('✅ Đã xác nhận! Thông báo gửi đến khách hàng.');
      setShowVerifyModal(false);
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(null);
    }
  };

  // Customer duyệt
  const approveDisbursement = async (id) => {
    if (!window.confirm('Xác nhận duyệt giải ngân?\n• 30% chuyển ngay vào ví nhà thầu\n• 70% giữ locked đến mốc tiến độ tiếp theo')) return;
    setSubmitting(id);
    try {
      await api.post(`/disbursements/${id}/approve`);
      toast.success('✅ Đã duyệt! 30% chuyển ngay, 70% locked đến mốc tiếp theo.');
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(null);
    }
  };

  // Customer từ chối
  const openRejectModal = (id) => { setRejectTarget(id); setRejectReason(''); setShowRejectModal(true); };

  const rejectDisbursement = async () => {
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

  // Mở khóa locked
  const unlockLocked = async (id) => {
    if (!window.confirm('Mở khóa toàn bộ tiền bảo đảm của giai đoạn này?')) return;
    setSubmitting(id);
    try {
      await api.post(`/disbursements/${id}/unlock`);
      toast.success('Đã mở khóa tiền bảo đảm!');
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(null);
    }
  };

  const submitDispute = async () => {
    if (!disputeForm.reason.trim()) return toast.error('Vui lòng nhập lý do tranh chấp');
    setSubmitting('dispute');
    try {
      await api.post('/disputes', {
        contractJobId: Number(contractId),
        reason: disputeForm.reason,
        amount: disputeForm.amount ? Number(disputeForm.amount) : undefined
      });
      toast.success('⚠️ Đã khởi tạo tranh chấp! Hợp đồng đã bị đóng băng tài chính.');
      setShowDisputeModal(false);
      setDisputeForm({ reason: '', amount: '' });
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Không thể khởi tạo tranh chấp');
    } finally {
      setSubmitting(null);
    }
  };

  const submitReview = async () => {
    if (!reviewForm.comment.trim()) return toast.error('Vui lòng nhập nhận xét');
    setSubmitting('review');
    try {
      const projId = contract.projectId || (contract.project && contract.project.id);
      const contractorId = contract.contractorId || (contract.contractor && contract.contractor.id);
      if (!projId || !contractorId) {
        toast.error('Không tìm thấy thông tin dự án hoặc nhà thầu');
        return;
      }
      await api.post('/reviews', {
        rating: Number(reviewForm.rating),
        qualityScore: Number(reviewForm.qualityScore),
        communicationScore: Number(reviewForm.communicationScore),
        progressScore: Number(reviewForm.progressScore),
        comment: reviewForm.comment,
        referenceType: 'PROJECT',
        referenceId: projId,
        revieweeId: contractorId
      });
      toast.success('🎉 Cảm ơn bạn đã đánh giá nhà thầu!');
      setShowReviewModal(false);
      setHasReviewed(true);
      fetchAll();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Không thể gửi đánh giá');
    } finally {
      setSubmitting(null);
    }
  };

  const totalDisbursed  = disbursements.filter(d => d.status === 'APPROVED').reduce((s, d) => s + (d.amount || 0), 0);
  const totalLocked     = disbursements.filter(d => d.status === 'APPROVED' && !d.fullyUnlocked).reduce((s, d) => s + (d.lockedAmount || 0), 0);
  const maxDisbursable  = contract ? Math.round((contract.agreedPrice || 0) * 0.8) : 0;
  const pendingCount    = disbursements.filter(d => d.status === 'PENDING').length;

  if (loading) return (
    <Layout title="Tiến độ thi công">
      <div className="flex justify-center py-24"><Loader2 size={36} className="animate-spin text-primary"/></div>
    </Layout>
  );
  if (!contract) return null;

  return (
    <Layout title="Tiến độ thi công">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Back */}
        <button onClick={() => navigate('/contracts')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
          <ChevronLeft size={15}/> Quay lại hợp đồng
        </button>

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Hợp đồng</p>
              <h2 className="text-xl font-bold text-gray-900">
                {contract.projectName || contract.orderCode || contract.contractNumber}
              </h2>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{contract.contractNumber}</p>
              <div className="flex gap-3 mt-3 text-sm text-gray-600 flex-wrap">
                <span>Khách hàng: <strong>{contract.clientName}</strong></span>
                <span className="text-gray-300">|</span>
                <span>Nhà thầu: <strong>{contract.contractorName}</strong></span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Giá trị HĐ</p>
              <p className="text-2xl font-bold text-primary">{fmt(contract.agreedPrice)}</p>
              <div className="text-xs text-gray-400 mt-1 space-y-0.5">
                <p>Đã giải ngân: <strong className="text-green-600">{fmt(totalDisbursed)}</strong></p>
                {totalDisbursed < maxDisbursable && (
                  <p>Còn tối đa 80%: <strong className="text-amber-600">{fmt(maxDisbursable - totalDisbursed)}</strong></p>
                )}
                {totalDisbursed >= maxDisbursable && (
                  <p>Chờ hoàn công (20%): <strong className="text-amber-600">{fmt((contract.agreedPrice || 0) - totalDisbursed)}</strong></p>
                )}
              </div>
              {totalLocked > 0 && (
                <p className="text-xs text-amber-600 flex items-center gap-1 justify-end mt-0.5">
                  <Lock size={10}/> Đang đóng băng: {fmt(totalLocked)}
                </p>
              )}
            </div>
          </div>

          {/* Dispute & Review Action Buttons */}
          {( (contract.status === 'ACTIVE' && !contract.isDisputed && (isCustomer || isContractor)) || (contract.status === 'COMPLETED' && isCustomer) ) && (
            <div className="flex gap-2 flex-wrap border-t border-gray-50 mt-4 pt-3">
              {contract.status === 'ACTIVE' && !contract.isDisputed && (isCustomer || isContractor) && (
                <button onClick={() => setShowDisputeModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 hover:text-red-700 transition-colors">
                  <AlertTriangle size={13} /> Khiếu nại / Gửi tranh chấp
                </button>
              )}
              {contract.status === 'COMPLETED' && isCustomer && !hasReviewed && (
                <button onClick={() => setShowReviewModal(true)}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition-colors">
                  <Star size={13} fill="currentColor" /> Đánh giá nhà thầu (Đa tiêu chí)
                </button>
              )}
              {contract.status === 'COMPLETED' && isCustomer && hasReviewed && (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-600 rounded-xl text-xs font-bold">
                  <CheckCircle2 size={13} /> Bạn đã gửi đánh giá cho dự án này
                </span>
              )}
            </div>
          )}

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500 font-medium">Tiến độ thi công</span>
              <span className="font-bold text-primary">{progress}%</span>
            </div>
            <div className="relative w-full h-5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-5 bg-primary rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}/>
              {PHASES.map(p => (
                <div key={p.threshold} className="absolute top-0 bottom-0 w-px bg-white/60"
                  style={{ left: `${p.threshold}%` }} title={p.label}/>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {PHASES.map(p => (
                <div key={p.threshold} className="text-center" style={{ width: '25%' }}>
                  <div className={`w-3 h-3 rounded-full mx-auto mb-1 border-2 ${
                    progress >= p.threshold ? 'bg-primary border-primary' : 'bg-white border-gray-300'
                  }`}/>
                  <p className="text-[9px] text-gray-400 hidden sm:block">{p.label}</p>
                  <p className="text-[9px] font-bold text-gray-500">{p.threshold}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Banner: Đóng băng do tranh chấp */}
        {contract.isDisputed && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-800 shadow-sm animate-pulse">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-500" />
            <div>
              <p className="font-bold text-red-950">⚠️ Hợp đồng đang có tranh chấp & bị ĐÓNG BĂNG tài chính</p>
              <p className="text-xs mt-1 text-red-700 leading-relaxed">
                Hợp đồng này đã bị đóng băng do phát sinh tranh chấp.
                Mọi hành động cập nhật tiến độ, yêu cầu giải ngân, nghiệm thu hoặc hủy hợp đồng đều bị tạm khóa cho đến khi Admin giải quyết.
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Nhật ký',         value: logs.length,              color: 'text-blue-600' },
            { label: 'Đã giải ngân',    value: fmt(totalDisbursed),      color: 'text-green-600' },
            {
              label: totalDisbursed >= maxDisbursable ? 'Chờ hoàn công (20%)' : 'Còn giải ngân (tối đa 80%)',
              value: totalDisbursed >= maxDisbursable
                ? fmt((contract?.agreedPrice || 0) - totalDisbursed)
                : fmt(Math.max(0, maxDisbursable - totalDisbursed)),
              color: 'text-amber-600',
            },
            { label: 'Chờ xử lý',      value: pendingCount,             color: pendingCount > 0 ? 'text-red-500' : 'text-gray-500' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">{s.label}</p>
              <p className={`text-lg font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Banner: đã đạt 80% → chờ hoàn công để nhận 20% còn lại */}
        {totalDisbursed >= maxDisbursable && contract?.status === 'ACTIVE' && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-500"/>
            <div>
              <p className="font-bold">Đã giải ngân tối đa 80% trước hoàn công</p>
              <p className="text-xs mt-0.5 text-amber-700">
                Còn lại <strong>{fmt((contract?.agreedPrice || 0) - totalDisbursed)}</strong> (20%) sẽ được giải ngân sau khi Admin xác nhận hoàn công.
                Ngoài ra, 5% bảo hành sẽ được giữ thêm 6 tháng.
              </p>
            </div>
          </div>
        )}

        {/* Luồng giải ngân — info box */}
        <div className="bg-gradient-to-r from-primary/5 to-blue-50 border border-primary/20 rounded-2xl p-4">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <ArrowRight size={13}/> Quy trình giải ngân 5 bước
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              { n: 1, label: 'Contractor gửi',   cls: 'bg-gray-100 text-gray-700' },
              { n: 2, label: 'Admin xác nhận',   cls: 'bg-amber-100 text-amber-700' },
              { n: 3, label: 'Customer duyệt',   cls: 'bg-blue-100 text-blue-700' },
              { n: 4, label: '30% ngay / 70% locked', cls: 'bg-green-100 text-green-700' },
              { n: 5, label: 'Auto-unlock mốc sau', cls: 'bg-purple-100 text-purple-700' },
            ].map((s, i, arr) => (
              <React.Fragment key={s.n}>
                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold ${s.cls}`}>
                  <span className="w-4 h-4 rounded-full bg-white/60 flex items-center justify-center text-[10px] font-bold">{s.n}</span>
                  {s.label}
                </span>
                {i < arr.length - 1 && <ArrowRight size={13} className="text-gray-300 self-center"/>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {[
            { key: 'logs',          label: 'Nhật ký thi công', icon: <Camera size={14}/> },
            { key: 'disbursements', label: `Giải ngân${pendingCount > 0 ? ` (${pendingCount})` : ''}`, icon: <DollarSign size={14}/> },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 flex-1 justify-center py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === t.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab: Nhật ký ── */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            {isContractor && contract.status === 'ACTIVE' && (
              <div className="flex justify-end">
                <button onClick={() => setShowLogModal(true)} disabled={contract.isDisputed}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
                  <Camera size={16}/> Cập nhật tiến độ
                </button>
              </div>
            )}
            {logs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                <Camera size={36} className="mx-auto text-gray-200 mb-3"/>
                <p className="text-gray-400">Chưa có nhật ký thi công nào</p>
              </div>
            ) : (
              logs.map(log => (
                <div key={log.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {log.phaseLabel && (
                          <span className="px-2.5 py-1 bg-primary-bg text-primary rounded-full text-xs font-bold">{log.phaseLabel}</span>
                        )}
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-bold">
                          {log.progressPercent}% tiến độ
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {log.contractorName} • {new Date(log.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <TrendingUp size={18} className="text-green-400 shrink-0"/>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-4">{log.description}</p>
                  {log.imageUrls?.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {log.imageUrls.map((url, i) => (
                        <img key={i} src={url} alt="" className="h-32 w-full object-cover rounded-xl border border-gray-100"/>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Tab: Giải ngân ── */}
        {activeTab === 'disbursements' && (
          <div className="space-y-4">
            {isContractor && contract.status === 'ACTIVE' && (
              <div className="flex justify-end">
                <button onClick={openDisbModal} disabled={contract.isDisputed}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
                  <DollarSign size={16}/> Yêu cầu giải ngân
                </button>
              </div>
            )}

            {disbursements.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                <DollarSign size={36} className="mx-auto text-gray-200 mb-3"/>
                <p className="text-gray-400">Chưa có yêu cầu giải ngân nào</p>
              </div>
            ) : (
              disbursements.map(d => {
                const st = getDisbStatus(d);
                return (
                  <div key={d.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${
                    d.status === 'PENDING' && d.adminVerified ? 'border-blue-200' :
                    d.status === 'PENDING' ? 'border-amber-200' :
                    d.status === 'APPROVED' ? 'border-green-200' : 'border-gray-100'
                  }`}>
                    {/* Header */}
                    <div className="flex flex-wrap justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${st.cls}`}>
                            {st.icon} {st.label}
                          </span>
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            {d.phaseLabel} ({d.phaseThreshold}%)
                          </span>
                          {d.fullyUnlocked && (
                            <span className="flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold">
                              <Unlock size={11}/> Đã unlock hết
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">
                          Tiến độ lúc yêu cầu: {d.progressAtRequest}% • {new Date(d.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{fmt(d.amount)}</p>
                        {d.status === 'APPROVED' && (
                          <div className="text-xs mt-1 space-y-0.5">
                            <p className="text-green-600 font-semibold">
                              ✅ {fmt(d.immediateAmount)} vào ví ngay ({Math.round((d.immediateRatio || 0.3) * 100)}%)
                            </p>
                            {d.lockedAmount > 0 && !d.fullyUnlocked && (
                              <p className="text-amber-600 flex items-center gap-1 justify-end">
                                <Lock size={10}/> {fmt(d.lockedAmount)} đóng băng — chờ mốc tiếp theo
                              </p>
                            )}
                            {d.fullyUnlocked && (
                              <p className="text-gray-500 flex items-center gap-1 justify-end text-[10px]">
                                <Unlock size={10}/> Đã mở khóa toàn bộ
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {d.note && <p className="text-xs text-gray-600 mb-3 bg-gray-50 rounded-lg p-2">📝 {d.note}</p>}
                    {d.rejectReason && (
                      <p className="text-xs text-red-600 mb-3 bg-red-50 rounded-lg p-2 flex items-start gap-1.5">
                        <AlertTriangle size={11} className="mt-0.5 shrink-0"/> Từ chối: {d.rejectReason}
                      </p>
                    )}

                    {/* Pipeline 5 bước */}
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
              })
            )}
          </div>
        )}
      </div>

      {/* ── Modal: Nhật ký thi công ── */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-7 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowLogModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600">
              <X size={20}/>
            </button>
            <h2 className="text-xl font-bold text-gray-800 mb-5">Cập nhật tiến độ thi công</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">Giai đoạn</label>
                <select value={logForm.phaseLabel}
                  onChange={e => setLogForm(p => ({ ...p, phaseLabel: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary">
                  <option value="">-- Chọn giai đoạn --</option>
                  {PHASES.map(ph => <option key={ph.threshold} value={ph.label}>{ph.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">% Tiến độ (hiện tại: {progress}%)</label>
                <input type="number" min={progress} max={100} value={logForm.progressPercent}
                  onChange={e => setLogForm(p => ({ ...p, progressPercent: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                  placeholder={`Từ ${progress}% đến 100%`}/>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">Mô tả công việc đã thực hiện</label>
                <textarea rows={4} value={logForm.description}
                  onChange={e => setLogForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary resize-none"
                  placeholder="Mô tả chi tiết công việc đã hoàn thành..."/>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                  Ảnh minh chứng ({logForm.imageUrls.length}/6)
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {logForm.imageUrls.map((url, i) => (
                    <div key={i} className="relative">
                      <img src={url} alt="" className="h-20 w-full object-cover rounded-xl border border-gray-100"/>
                      <button onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                        <X size={10}/>
                      </button>
                    </div>
                  ))}
                  {logForm.imageUrls.length < 6 && (
                    <label className="h-20 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                      {uploading ? <Loader2 size={18} className="animate-spin text-primary"/> : <ImagePlus size={18} className="text-gray-400"/>}
                      <span className="text-[10px] text-gray-400 mt-1">{uploading ? 'Đang tải...' : 'Thêm ảnh'}</span>
                      <input type="file" hidden accept="image/*" onChange={e => handleUploadImage(e.target.files[0])}/>
                    </label>
                  )}
                </div>
              </div>
              <button disabled={submitting === 'log' || uploading} onClick={submitLog}
                className="w-full py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-50 text-sm">
                {submitting === 'log' ? 'Đang lưu...' : 'Lưu nhật ký'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Yêu cầu giải ngân ── */}
      {showDisbModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-7 relative">
            <button onClick={() => setShowDisbModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600">
              <X size={20}/>
            </button>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Yêu cầu giải ngân</h2>
            <p className="text-xs text-gray-400 mb-4">
              Tiến độ hiện tại: {progress}% •{' '}
              {maxDisbursable - totalDisbursed > 0
                ? <>Có thể yêu cầu tối đa: <strong className="text-amber-600">{fmt(maxDisbursable - totalDisbursed)}</strong></>
                : <span className="text-amber-600 font-semibold">Đã đạt giới hạn 80% — chờ Admin xác nhận hoàn công</span>
              }
            </p>

            {/* Info luồng */}
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5 text-xs text-blue-800 mb-4">
              <AlertCircle size={13} className="mt-0.5 shrink-0"/>
              <span>Sau khi gửi: <strong>Admin xác nhận</strong> → <strong>Khách duyệt</strong> → <strong>30% ngay / 70% locked</strong> đến mốc tiếp theo.</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">Giai đoạn</label>
                {/* Chỉ hiển thị phase đã đạt — loại bỏ vấn đề disabled option */}
                <div className="space-y-2">
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
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm transition-all ${
                          !reached
                            ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                            : isSelected
                            ? 'bg-primary border-primary text-white font-bold'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-primary hover:bg-primary/5'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${reached ? (isSelected ? 'bg-white' : 'bg-green-400') : 'bg-gray-200'}`}/>
                          {ph.label}
                        </span>
                        <span className={`text-xs font-semibold ${isSelected ? 'text-white/80' : reached ? 'text-green-600' : 'text-gray-300'}`}>
                          {ph.threshold}% {reached ? '✓ Đạt' : '— Chưa đạt'}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {PHASES.every(ph => progress < ph.threshold) && (
                  <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                    <AlertCircle size={11}/> Tiến độ chưa đạt mốc nào để yêu cầu giải ngân.
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">Số tiền yêu cầu (VND)</label>
                <input type="number" min={1} value={disbForm.amount}
                  onChange={e => setDisbForm(p => ({ ...p, amount: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                  placeholder="Nhập số tiền..."/>
              </div>

              {/* Tỉ lệ mới: 30% immediate / 70% locked */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">
                  Tỉ lệ nhận ngay: <strong className="text-primary">{disbForm.immediateRatio}%</strong>
                  <span className="text-gray-400 ml-2">• Locked: {100 - disbForm.immediateRatio}%</span>
                </label>
                <input type="range" min={20} max={50} step={5} value={disbForm.immediateRatio}
                  onChange={e => setDisbForm(p => ({ ...p, immediateRatio: Number(e.target.value) }))}
                  className="w-full accent-primary"/>
                <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                  <span>20% (tối thiểu)</span><span>50% (tối đa)</span>
                </div>
                {disbForm.amount > 0 && (
                  <div className="flex justify-between text-xs mt-2 bg-gray-50 rounded-xl px-3 py-2">
                    <span className="text-green-600 font-semibold">
                      ✅ Nhận ngay: {fmt(Math.round(disbForm.amount * disbForm.immediateRatio / 100))}
                    </span>
                    <span className="text-amber-600 flex items-center gap-1 font-semibold">
                      <Lock size={10}/> Locked: {fmt(Math.round(disbForm.amount * (100 - disbForm.immediateRatio) / 100))}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">Ghi chú (tuỳ chọn)</label>
                <textarea rows={2} value={disbForm.note}
                  onChange={e => setDisbForm(p => ({ ...p, note: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary resize-none"
                  placeholder="Mô tả công việc đã hoàn thành..."/>
              </div>

              <button disabled={submitting === 'disb'} onClick={submitDisbursement}
                className="w-full py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-50 text-sm">
                {submitting === 'disb' ? 'Đang gửi...' : 'Gửi yêu cầu giải ngân'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Admin verify ── */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setShowVerifyModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={18}/>
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <ShieldCheck size={20} className="text-amber-600"/>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Admin xác nhận yêu cầu giải ngân</h3>
                <p className="text-xs text-gray-500">Sau xác nhận, thông báo sẽ gửi đến khách hàng để duyệt.</p>
              </div>
            </div>
            <textarea rows={3} value={verifyNote} onChange={e => setVerifyNote(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-primary resize-none mb-4"
              placeholder="Ghi chú xác nhận (không bắt buộc)..."/>
            <div className="flex gap-3">
              <button onClick={() => setShowVerifyModal(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                Hủy
              </button>
              <button onClick={confirmAdminVerify} disabled={submitting === verifyTarget}
                className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 disabled:opacity-60">
                {submitting === verifyTarget ? 'Đang xử lý...' : '✅ Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Từ chối ── */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setShowRejectModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={18}/>
            </button>
            <h3 className="font-bold text-gray-800 mb-4">Từ chối yêu cầu giải ngân</h3>
            <textarea rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400 resize-none mb-4"
              placeholder="Lý do từ chối (để nhà thầu biết)..."/>
            <div className="flex gap-2">
              <button onClick={() => setShowRejectModal(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                Huỷ
              </button>
              <button onClick={rejectDisbursement} disabled={submitting === rejectTarget}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 disabled:opacity-60">
                {submitting === rejectTarget ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Khiếu nại / Gửi tranh chấp ── */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-7 relative">
            <button onClick={() => setShowDisputeModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600">
              <X size={20}/>
            </button>
            <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-1.5 text-red-600">
              <AlertTriangle size={22} /> Khởi tạo tranh chấp
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              Hành động này sẽ đóng băng toàn bộ hoạt động của hợp đồng và tạo phòng chat đối chất 3 bên giữa bạn, đối tác và Admin.
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">Lý do tranh chấp / khiếu nại</label>
                <textarea rows={4} value={disputeForm.reason}
                  onChange={e => setDisputeForm(p => ({ ...p, reason: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400 resize-none"
                  placeholder="Mô tả chi tiết lý do khiếu nại (ví dụ: chậm tiến độ 15 ngày, sai vật liệu thi công)..."/>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">Số tiền tranh chấp (VND, để trống để chọn toàn bộ cọc)</label>
                <input type="number" value={disputeForm.amount}
                  onChange={e => setDisputeForm(p => ({ ...p, amount: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400"
                  placeholder={`Tối đa: ${fmt(contract.agreedPrice)}`}/>
              </div>
              <button disabled={submitting === 'dispute'} onClick={submitDispute}
                className="w-full py-3.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-50 text-sm">
                {submitting === 'dispute' ? 'Đang gửi yêu cầu...' : '⚠️ Xác nhận gửi tranh chấp'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Đánh giá nhà thầu ── */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-7 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowReviewModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600">
              <X size={20}/>
            </button>
            <h2 className="text-xl font-bold text-gray-800 mb-1">Đánh giá nhà thầu</h2>
            <p className="text-xs text-gray-400 mb-5">
              Chia sẻ trải nghiệm thực tế của bạn để giúp hệ thống cập nhật điểm uy tín (AI Trust Score) cho nhà thầu.
            </p>
            <div className="space-y-4">
              {/* Rating Star Criteria */}
              {[
                { key: 'rating', label: '⭐ Đánh giá chung (Tổng thể)' },
                { key: 'qualityScore', label: '🛠️ Chất lượng thi công' },
                { key: 'progressScore', label: '📅 Đúng hạn & Tiến độ' },
                { key: 'communicationScore', label: '💬 Giao tiếp & Hợp tác' },
              ].map(crit => (
                <div key={crit.key} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                  <span className="text-xs font-semibold text-gray-700">{crit.label}</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} onClick={() => setReviewForm(p => ({ ...p, [crit.key]: star }))}
                        className={`text-xl transition-colors ${
                          star <= reviewForm[crit.key] ? 'text-amber-400 hover:text-amber-500' : 'text-gray-200 hover:text-gray-300'
                        }`}>
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">Nhận xét chi tiết</label>
                <textarea rows={4} value={reviewForm.comment}
                  onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary resize-none"
                  placeholder="Nhận xét của bạn về chất lượng hoàn thiện, thái độ làm việc..."/>
              </div>
              <button disabled={submitting === 'review'} onClick={submitReview}
                className="w-full py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-50 text-sm">
                {submitting === 'review' ? 'Đang gửi đánh giá...' : 'Gửi đánh giá'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
