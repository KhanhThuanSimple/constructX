import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Camera, CheckCircle2, DollarSign, Loader2, Shield, TrendingUp, X,
  AlertCircle, Calendar, ShieldCheck, UserCheck, BadgeCheck, Unlock, Lock,
  AlertTriangle, ImagePlus, Clock, Scale
} from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';
import ContractHeader from '../components/ContractHeader';
import useAuthStore from '../store/useAuthStore';

const PHASES = [
  { label: 'Khởi công',           threshold: 20  },
  { label: 'Thi công phần thô',   threshold: 50  },
  { label: 'Hoàn thiện',          threshold: 80  },
  { label: 'Bàn giao công trình', threshold: 100 },
];

const fmt = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

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
function DisbPipeline({ d, isAdmin, isCustomer, onAdminVerify, onApprove, onReject, onUnlock, submitting }) {
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
          <button onClick={() => onAdminVerify(d.id)} disabled={submitting === d.id}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 disabled:opacity-60">
            <ShieldCheck size={13}/> {submitting === d.id ? 'Đang xử lý...' : 'Admin xác nhận hợp lệ'}
          </button>
        )}

        {/* Bước 3: Customer approve (chỉ sau Admin verify) */}
        {isCustomer && d.status === 'PENDING' && d.adminVerified && (
          <>
            <button onClick={() => onApprove(d.id)} disabled={submitting === d.id}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 disabled:opacity-60">
              <CheckCircle2 size={13}/> {submitting === d.id ? 'Đang duyệt...' : 'Duyệt giải ngân'}
            </button>
            <button onClick={() => onReject(d.id)} disabled={submitting === d.id}
              className="flex items-center gap-1.5 px-4 py-2 border border-red-300 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 disabled:opacity-60">
              <X size={13}/> Từ chối
            </button>
          </>
        )}

        {/* Bước 5: Unlock locked (Admin hoặc Customer) */}
        {(isAdmin || isCustomer) && d.status === 'APPROVED' && !d.fullyUnlocked && d.lockedAmount > 0 && (
          <button onClick={() => onUnlock(d.id)} disabled={submitting === d.id}
            className="flex items-center gap-1.5 px-4 py-2 border border-amber-300 text-amber-700 rounded-xl text-xs font-bold hover:bg-amber-50 disabled:opacity-60">
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

  // Modals
  const [showLogModal, setShowLogModal]   = useState(false);
  const [submitting, setSubmitting]       = useState(null); // 'log'
  const [uploading, setUploading]         = useState(false);

  // Log form
  const [logForm, setLogForm] = useState({
    progressPercent: '', description: '', imageUrls: [], phaseLabel: '',
  });

  // Disbursement Form Modal
  const [showDisbModal, setShowDisbModal] = useState(false);
  const [disbForm, setDisbForm] = useState({
    phaseLabel: PHASES[0].label,
    phaseThreshold: PHASES[0].threshold,
    amount: '',
    immediateRatio: 30,
    note: '',
  });

  // Verify Modal
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyTarget, setVerifyTarget] = useState(null);
  const [verifyNote, setVerifyNote] = useState('');

  // Reject Modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchAll();
  }, [contractId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [cRes, lRes, dRes] = await Promise.all([
        api.get(`/contracts/${contractId}`),
        api.get(`/contracts/${contractId}/construction-logs`),
        api.get(`/contracts/${contractId}/disbursements`),
      ]);
      setContract(cRes.data.data);
      setProgress(cRes.data.data.progressPercent || 0);
      setLogs(lRes.data.data || []);
      setDisbursements(dRes.data.data || []);
    } catch (e) {
      toast.error('Không thể tải dữ liệu hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImage = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setLogForm((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, response.data.url],
      }));
      toast.success('Đã tải lên ảnh');
    } catch (e) {
      toast.error('Lỗi khi tải lên hình ảnh');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setLogForm((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const submitLog = async () => {
    if (!logForm.progressPercent) return toast.error('Vui lòng nhập % tiến độ');
    if (Number(logForm.progressPercent) < progress) {
      return toast.error(`Tiến độ cập nhật không được nhỏ hơn tiến độ hiện tại (${progress}%)`);
    }
    if (Number(logForm.progressPercent) > 100) {
      return toast.error('Tiến độ không được lớn hơn 100%');
    }
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

  // Tính toán số liệu giải ngân cho Header
  const totalDisbursed  = disbursements.filter(d => d.status === 'APPROVED').reduce((s, d) => s + (d.amount || 0), 0);
  const totalLocked     = disbursements.filter(d => d.status === 'APPROVED' && !d.fullyUnlocked).reduce((s, d) => s + (d.lockedAmount || 0), 0);
  const maxDisbursable  = Math.round((contract?.agreedPrice || 0) * 0.80);
  const pendingCount    = disbursements.filter(d => d.status === 'PENDING').length;

  if (loading) return (
    <Layout title="Tiến độ thi công">
      <div className="flex justify-center py-24"><Loader2 size={36} className="animate-spin text-primary"/></div>
    </Layout>
  );
  if (!contract) return null;

  if (contract.isDisputed) {
    return (
      <Layout title="Tiến độ & Nhật ký thi công">
        <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-red-150 p-6 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
            <Shield size={32} className="animate-pulse" />
          </div>
          <h2 className="text-lg font-extrabold text-gray-900">Hợp đồng đang bị đóng băng tranh chấp</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Hợp đồng này hiện đang ở trạng thái tranh chấp và mọi tính năng cập nhật tiến độ thi công đã bị vô hiệu hóa tạm thời để bảo toàn tài chính. Vui lòng di chuyển đến trang giải quyết tranh chấp để gửi bằng chứng hoặc thảo luận đối chất.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate(`/contracts/${contract.id}/dispute`)}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-sm text-xs flex items-center justify-center gap-1.5"
            >
              <Shield size={14} />
              Đi tới trang Giải quyết Tranh chấp
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Tiến độ & Nhật ký thi công">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header dùng chung */}
        <ContractHeader
          contract={contract}
          progress={progress}
          totalDisbursed={totalDisbursed}
          totalLocked={totalLocked}
          activeTab="progress"
        />

        {/* Card Tiến độ & Stepper */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500 font-semibold">Tổng quan Tiến độ Công việc</span>
            <span className="font-extrabold text-primary text-base">{progress}%</span>
          </div>
          
          <div className="relative w-full h-5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-5 bg-primary rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
            {PHASES.map(p => (
              <div
                key={p.threshold}
                className="absolute top-0 bottom-0 w-px bg-white/60"
                style={{ left: `${p.threshold}%` }}
                title={p.label}
              />
            ))}
          </div>

          {/* Stepper Chỉ số mốc */}
          <div className="flex justify-between mt-3">
            {PHASES.map(p => {
              const reached = progress >= p.threshold;
              return (
                <div key={p.threshold} className="text-center" style={{ width: '25%' }}>
                  <div className={`w-3 h-3 rounded-full mx-auto mb-1 border-2 transition-all ${
                    reached ? 'bg-primary border-primary' : 'bg-white border-gray-300'
                  }`}/>
                  <p className={`text-[10px] hidden sm:block ${reached ? 'text-gray-800 font-semibold' : 'text-gray-400'}`}>{p.label}</p>
                  <p className="text-[9px] font-bold text-gray-500">{p.threshold}%</p>
                </div>
              );
            })}
          </div>
        </div>

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
              <p className={`text-sm sm:text-base font-bold mt-1 ${s.color}`}>{s.value}</p>
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

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-150 rounded-xl p-1">
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

        {/* Tab content: logs */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            {/* Tiêu đề mục nhật ký & Nút thêm */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Camera size={16} className="text-primary" />
                Dòng thời gian Nhật ký Thi công
              </h3>
              {isContractor && contract.status === 'ACTIVE' && (
                <button
                  onClick={() => setShowLogModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-sm"
                >
                  <Camera size={12}/> Cập nhật tiến độ mới
                </button>
              )}
            </div>

            {logs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
                <Camera size={40} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-400 font-semibold text-sm">Chưa có nhật ký thi công nào được đăng tải</p>
                <p className="text-xs text-gray-300 mt-1">Nhật ký hàng ngày sẽ được nhà thầu cập nhật tại đây để báo cáo tiến trình công việc.</p>
              </div>
            ) : (
              <div className="space-y-4 relative before:absolute before:top-2 before:bottom-2 before:left-6 before:w-0.5 before:bg-gray-100">
                {logs.map((log) => (
                  <div key={log.id} className="relative pl-12">
                    {/* Timeline Dot */}
                    <div className="absolute left-4 top-1.5 w-4.5 h-4.5 rounded-full border-4 border-white bg-primary shadow-sm flex items-center justify-center" />
                    
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-gray-200 transition-colors">
                      <div className="flex justify-between items-start mb-3 gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {log.phaseLabel && (
                              <span className="px-2.5 py-0.5 bg-primary-bg text-primary rounded-full text-[10px] font-bold">
                                {log.phaseLabel}
                              </span>
                            )}
                            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold">
                              {log.progressPercent}% tiến độ
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1">
                            Cập nhật bởi: <strong className="text-gray-600">{log.contractorName}</strong> • {new Date(log.createdAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                        <TrendingUp size={16} className="text-green-400 shrink-0" />
                      </div>
                      
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{log.description}</p>
                      
                      {log.imageUrls?.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                          {log.imageUrls.map((url, i) => (
                            <a href={url} target="_blank" rel="noreferrer" key={i} className="group overflow-hidden rounded-xl border border-gray-100 h-28 sm:h-32 block">
                              <img
                                src={url}
                                alt="Minh chứng thi công"
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab content: disbursements */}
        {activeTab === 'disbursements' && (
          <div className="space-y-4">
            {/* Tiêu đề & Nút thêm */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <DollarSign size={16} className="text-primary" />
                Yêu cầu Giải ngân
              </h3>
              {isContractor && contract.status === 'ACTIVE' && (
                <button
                  onClick={openDisbModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-sm"
                >
                  <DollarSign size={12}/> Yêu cầu giải ngân mới
                </button>
              )}
            </div>

            {disbursements.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
                <DollarSign size={40} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-400 font-semibold text-sm">Chưa có yêu cầu giải ngân nào</p>
                <p className="text-xs text-gray-300 mt-1">Yêu cầu thanh toán theo tiến độ sẽ hiển thị tại đây.</p>
              </div>
            ) : (
              disbursements.map(d => {
                const st = getDisbStatus(d);
                return (
                  <div key={d.id} className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${
                    d.status === 'PENDING' && d.adminVerified ? 'border-blue-200 bg-blue-50/5' :
                    d.status === 'PENDING' ? 'border-amber-250 bg-amber-50/5' :
                    d.status === 'APPROVED' ? 'border-green-250 bg-green-50/5' : 'border-gray-100'
                  }`}>
                    <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-[10px] font-bold">
                            {d.phaseLabel} ({d.phaseThreshold}%)
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${st.cls}`}>
                            {st.icon} {st.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1.5">
                          Mã yêu cầu: <strong className="text-gray-600">#{d.id}</strong> • {new Date(d.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Số tiền yêu cầu</p>
                        <p className="text-sm font-black text-slate-800 mt-0.5">{fmt(d.amount)}</p>
                      </div>
                    </div>

                    {d.note && <p className="text-xs text-gray-600 mb-3 bg-gray-50 rounded-lg p-2.5 border border-slate-100/50">📝 {d.note}</p>}
                    {d.rejectReason && (
                      <p className="text-xs text-red-600 mb-3 bg-red-50 rounded-lg p-2.5 border border-red-100/50 flex items-start gap-1.5">
                        <AlertTriangle size={11} className="mt-0.5 shrink-0"/> <strong>Từ chối:</strong> {d.rejectReason}
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
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Modal: Thêm Nhật ký thi công */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto shadow-2xl">
            <button
              onClick={() => setShowLogModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20}/>
            </button>
            
            <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Camera size={20} className="text-primary" />
              Cập nhật tiến độ thi công
            </h2>
            <p className="text-xs text-gray-500 mb-5">Đăng tải báo cáo công việc và hình ảnh thực tế thi công tại công trường.</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Giai đoạn thi công</label>
                <select
                  value={logForm.phaseLabel}
                  onChange={e => setLogForm(p => ({ ...p, phaseLabel: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                >
                  <option value="">-- Chọn giai đoạn --</option>
                  {PHASES.map(ph => <option key={ph.threshold} value={ph.label}>{ph.label}</option>)}
                </select>
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                  % Tiến độ công việc đạt được (Hiện tại: {progress}%)
                </label>
                <input
                  type="number"
                  min={progress}
                  max={100}
                  value={logForm.progressPercent}
                  onChange={e => setLogForm(p => ({ ...p, progressPercent: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                  placeholder={`Vui lòng nhập giá trị từ ${progress}% đến 100%`}
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Mô tả chi tiết công việc đã làm</label>
                <textarea
                  rows={4}
                  value={logForm.description}
                  onChange={e => setLogForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary resize-none transition-all"
                  placeholder="Mô tả cụ thể hạng mục hoàn thành, vật liệu lắp đặt, nhân sự thực hiện..."
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                  Hình ảnh thực tế minh chứng ({logForm.imageUrls.length}/6)
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {logForm.imageUrls.map((url, i) => (
                    <div key={i} className="relative h-20 rounded-xl overflow-hidden border border-gray-100">
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow"
                      >
                        <X size={10}/>
                      </button>
                    </div>
                  ))}
                  {logForm.imageUrls.length < 6 && (
                    <label className="h-20 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-primary transition-colors">
                      {uploading ? (
                        <Loader2 size={18} className="animate-spin text-primary"/>
                      ) : (
                        <ImagePlus size={18} className="text-gray-400"/>
                      )}
                      <span className="text-[10px] text-gray-400 mt-1 font-medium">
                        {uploading ? 'Đang tải...' : 'Thêm ảnh'}
                      </span>
                      <input type="file" hidden accept="image/*" onChange={e => handleUploadImage(e.target.files[0])}/>
                    </label>
                  )}
                </div>
              </div>
              
              <button
                disabled={submitting === 'log' || uploading}
                onClick={submitLog}
                className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-light disabled:opacity-50 text-sm transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {submitting === 'log' ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Đang lưu nhật ký...
                  </>
                ) : (
                  'Lưu nhật ký & Cập nhật tiến độ'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Yêu cầu giải ngân */}
      {showDisbModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowDisbModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={18}/>
            </button>
            <h3 className="font-bold text-gray-900 mb-4">Gửi yêu cầu giải ngân</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">Chọn giai đoạn đạt mốc</label>
                <select value={disbForm.phaseLabel} onChange={e => {
                  const selectedPh = PHASES.find(p => p.label === e.target.value);
                  setDisbForm(p => ({ ...p, phaseLabel: e.target.value, phaseThreshold: selectedPh ? selectedPh.threshold : PHASES[0].threshold }));
                }} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary">
                  {PHASES.map(ph => <option key={ph.threshold} value={ph.label}>{ph.label} ({ph.threshold}%)</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">Số tiền yêu cầu (VND)</label>
                <input type="number" min={1} value={disbForm.amount}
                  onChange={e => setDisbForm(p => ({ ...p, amount: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                  placeholder="Nhập số tiền..."/>
              </div>
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

      {/* Modal: Admin verify */}
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

      {/* Modal: Từ chối */}
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
    </Layout>
  );
}
