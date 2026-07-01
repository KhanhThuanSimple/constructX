import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '../components/Layout';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Hammer, Camera, CheckCircle2, DollarSign, Loader2,
  ArrowLeft, RefreshCw, Search, AlertCircle, FileText,
  TrendingUp, Clock, MapPin, Plus, X, ImagePlus,
  ChevronDown, ChevronUp, Shield, BadgeCheck, Truck,
  Package, Building2, Phone, ShieldCheck, Unlock,
  AlertTriangle, Star, ChevronRight, Gavel, ShoppingBag
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) =>
  n == null ? '—' :
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n).replace('₫', 'đ');

const PHASES = [
  { label: 'Khởi công',           threshold: 20  },
  { label: 'Thi công phần thô',   threshold: 50  },
  { label: 'Hoàn thiện',          threshold: 80  },
  { label: 'Bàn giao công trình', threshold: 100 },
];

const CONTRACT_STATUS = {
  ACTIVE:    { label: 'Đang thi công',    color: 'bg-green-100 text-green-700 border-green-200',   dot: 'bg-green-500'             },
  COMPLETED: { label: 'Hoàn thành',       color: 'bg-teal-100 text-teal-700 border-teal-200',      dot: 'bg-teal-400'              },
  PENDING_REVIEW:    { label: 'Chờ duyệt', color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-400 animate-pulse' },
  WAITING_SIGNATURE: { label: 'Chờ ký',   color: 'bg-blue-100 text-blue-700 border-blue-200',     dot: 'bg-blue-400'              },
  CANCELLED: { label: 'Đã hủy',          color: 'bg-red-100 text-red-600 border-red-200',          dot: 'bg-red-400'               },
};

// ── Progress bar component ────────────────────────────────────────────────────
function ProgressBar({ value, className = '' }) {
  return (
    <div className={`relative w-full h-3 bg-gray-100 rounded-full overflow-hidden ${className}`}>
      <div className="h-3 bg-gradient-to-r from-[#1a4f3a] to-[#2d7a5a] rounded-full transition-all duration-700"
        style={{ width: `${value}%` }}/>
      {PHASES.map(p => (
        <div key={p.threshold} className="absolute top-0 bottom-0 w-px bg-white/70"
          style={{ left: `${p.threshold}%` }}/>
      ))}
    </div>
  );
}

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status, disputed }) {
  if (disputed) return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-600 border border-red-200 animate-pulse">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500"/> 🔒 Tranh chấp
    </span>
  );
  const cfg = CONTRACT_STATUS[status] || { label: status, color: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}/> {cfg.label}
    </span>
  );
}

// ── CONTRACT LIST VIEW ────────────────────────────────────────────────────────
function ContractListView({ contracts, loading, onSelect, onRefresh }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ACTIVE');

  const active    = contracts.filter(c => c.status === 'ACTIVE').length;
  const completed = contracts.filter(c => c.status === 'COMPLETED').length;
  const disputed  = contracts.filter(c => c.isDisputed).length;

  const filtered = contracts.filter(c => {
    const ms = filter === 'all' ? true
      : filter === 'DISPUTED' ? c.isDisputed
      : c.status === filter;
    const mq = !search.trim() ||
      c.projectName?.toLowerCase().includes(search.toLowerCase()) ||
      c.contractNumber?.toLowerCase().includes(search.toLowerCase()) ||
      c.orderCode?.toLowerCase().includes(search.toLowerCase()) ||
      c.clientName?.toLowerCase().includes(search.toLowerCase());
    return ms && mq;
  });

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { key: 'ACTIVE',    label: 'Đang thi công', value: active,            color: 'text-green-600',  bg: 'bg-green-50 border-green-100'  },
          { key: 'COMPLETED', label: 'Hoàn thành',    value: completed,          color: 'text-teal-600',   bg: 'bg-teal-50 border-teal-100'    },
          { key: 'DISPUTED',  label: 'Tranh chấp',    value: disputed,           color: 'text-red-600',    bg: 'bg-red-50 border-red-100'      },
          { key: 'all',       label: 'Tất cả',        value: contracts.length,   color: 'text-gray-700',   bg: 'bg-white border-gray-100'      },
        ].map(s => (
          <button key={s.key} onClick={() => setFilter(s.key)}
            className={`rounded-2xl border p-4 text-center transition-all ${s.bg} ${
              filter === s.key ? 'ring-2 ring-[#1a4f3a]/30 shadow-sm' : 'hover:shadow-sm'
            }`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-400 font-medium mt-1">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={14}/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm tên dự án, mã hợp đồng, khách hàng..."
            className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1a4f3a]"/>
        </div>
        <button onClick={onRefresh}
          className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 shrink-0">
          <RefreshCw size={15}/>
        </button>
        <button onClick={() => navigate('/order-bidding')}
          className="flex items-center gap-2 bg-[#1a4f3a] text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-[#2d7a5a] shrink-0 shadow-sm shadow-[#1a4f3a]/20">
          <Gavel size={14}/> Tìm đơn hàng mới
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-[#1a4f3a]"/></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Hammer size={28} className="text-gray-300"/>
          </div>
          <p className="font-bold text-gray-500 text-sm">
            {search ? 'Không tìm thấy hợp đồng phù hợp' : 'Chưa có hợp đồng nào đang thi công'}
          </p>
          <p className="text-xs text-gray-400 mt-1">Tham gia đấu thầu để nhận hợp đồng mới</p>
          <button onClick={() => navigate('/order-bidding')}
            className="mt-4 px-5 py-2.5 bg-[#1a4f3a] text-white text-xs font-bold rounded-xl hover:bg-[#2d7a5a]">
            Xem đơn hàng đang mở
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => {
            const needAction = c.status === 'ACTIVE' && !c.isDisputed;
            return (
              <button key={c.id} onClick={() => onSelect(c)}
                className={`w-full bg-white rounded-2xl border-2 p-5 text-left transition-all group hover:shadow-md ${
                  c.isDisputed ? 'border-red-200 shadow-sm shadow-red-50'
                    : c.status === 'ACTIVE' ? 'border-green-200 hover:border-[#1a4f3a]/40'
                    : 'border-gray-100 hover:border-gray-200'
                }`}>
                {/* Top accent */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl ${
                  c.isDisputed ? 'bg-red-400' :
                  c.status === 'ACTIVE' ? 'bg-green-500' :
                  c.status === 'COMPLETED' ? 'bg-teal-500' : 'bg-gray-300'
                }`}/>

                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <StatusBadge status={c.status} disputed={c.isDisputed}/>
                      <span className="text-[10px] font-mono text-gray-400">{c.contractNumber}</span>
                      {c.orderCode && !c.projectName && (
                        <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full font-bold">
                          📦 {c.orderCode}
                        </span>
                      )}
                    </div>
                    <p className="font-black text-gray-900 text-base mb-1 truncate">
                      {c.projectName || c.orderCode || c.contractNumber}
                    </p>
                    <div className="flex flex-wrap gap-3 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Building2 size={10}/> {c.clientName || '—'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={10}/> {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                      {c.estimatedDays && (
                        <span className="flex items-center gap-1">
                          <Camera size={10}/> {c.estimatedDays} ngày
                        </span>
                      )}
                    </div>

                    {/* Action hint */}
                    {needAction && (
                      <span className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg">
                        <Camera size={10}/> Nhấn để cập nhật tiến độ
                      </span>
                    )}
                    {c.isDisputed && (
                      <span className="inline-flex items-center gap-1.5 mt-2 text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">
                        <AlertTriangle size={10}/> Đang có tranh chấp — cần xử lý
                      </span>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-lg font-black text-[#1a4f3a]">{fmt(c.agreedPrice)}</p>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-[#1a4f3a] ml-auto mt-1 transition-colors"/>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── CONTRACT DETAIL + PROGRESS UPDATE ────────────────────────────────────────
function ContractDetailView({ contract: initialC, onBack }) {
  const navigate = useNavigate();
  const [contract, setContract] = useState(initialC);
  const [logs, setLogs] = useState([]);
  const [disbursements, setDisbursements] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('logs');

  // Log form state
  const [showLogForm, setShowLogForm] = useState(false);
  const [logForm, setLogForm] = useState({ progressPercent: '', description: '', imageUrls: [], phaseLabel: '' });
  const [submittingLog, setSubmittingLog] = useState(false);

  // Disbursement form
  const [showDisbForm, setShowDisbForm] = useState(false);
  const [disbForm, setDisbForm] = useState({ phaseLabel: PHASES[0].label, phaseThreshold: PHASES[0].threshold, amount: '', immediateRatio: 30, note: '' });
  const [submittingDisb, setSubmittingDisb] = useState(false);

  // Image URL input + file upload
  const [imgUrlInput, setImgUrlInput] = useState('');
  const [uploadingImg, setUploadingImg] = useState(false);
  const imgFileInputRef = useRef(null);

  // Upload ảnh nhật ký thi công lên Cloudinary (unsigned preset)
  const uploadLogImage = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dtufvt361';
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'constructx_unsigned';

    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', uploadPreset);
    fd.append('folder', 'constructx/construction-logs');

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST', body: fd,
    });
    const data = await res.json();
    if (!res.ok) {
      // Fallback: dùng ảnh Unsplash đẹp thay vì crash
      console.warn('Cloudinary upload failed, using placeholder:', data.error?.message);
      return 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80';
    }
    return data.secure_url;
  };

  const handleImgFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (logForm.imageUrls.length + files.length > 6) {
      toast.error('Tối đa 6 ảnh mỗi nhật ký'); return;
    }
    setUploadingImg(true);
    toast.loading('Đang tải ảnh lên...', { id: 'log-img-upload' });
    try {
      const urls = await Promise.all(files.map(uploadLogImage));
      setLogForm(f => ({ ...f, imageUrls: [...f.imageUrls, ...urls.filter(Boolean)] }));
      toast.success(`Tải lên ${urls.filter(Boolean).length} ảnh thành công`, { id: 'log-img-upload' });
    } catch (err) {
      toast.error('Lỗi tải ảnh: ' + err.message, { id: 'log-img-upload' });
    } finally {
      setUploadingImg(false);
      e.target.value = '';
    }
  };

  const isActive    = contract.status === 'ACTIVE' && !contract.isDisputed;
  const isDisputed  = contract.isDisputed;
  const isCompleted = contract.status === 'COMPLETED';

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [lRes, dRes, pRes] = await Promise.all([
        api.get(`/contracts/${contract.id}/construction-logs`),
        api.get(`/contracts/${contract.id}/disbursements`),
        api.get(`/contracts/${contract.id}/progress`),
      ]);
      setLogs(lRes.data.data || []);
      setDisbursements(dRes.data.data || []);
      setProgress(pRes.data.data ?? 0);
    } catch { toast.error('Không thể tải dữ liệu'); }
    finally { setLoading(false); }
  }, [contract.id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addImageUrl = () => {
    if (!imgUrlInput.trim()) return;
    setLogForm(f => ({ ...f, imageUrls: [...f.imageUrls, imgUrlInput.trim()] }));
    setImgUrlInput('');
  };

  const removeImage = (i) => setLogForm(f => ({ ...f, imageUrls: f.imageUrls.filter((_, j) => j !== i) }));

  const submitLog = async () => {
    if (!logForm.progressPercent) { toast.error('Vui lòng nhập % tiến độ'); return; }
    const pct = Number(logForm.progressPercent);
    if (pct < progress) { toast.error(`Tiến độ không được nhỏ hơn hiện tại (${progress}%)`); return; }
    if (pct > 100) { toast.error('Tiến độ không vượt quá 100%'); return; }
    if (!logForm.description.trim()) { toast.error('Vui lòng nhập mô tả công việc'); return; }
    setSubmittingLog(true);
    try {
      await api.post('/construction-logs', {
        contractId: Number(contract.id),
        progressPercent: pct,
        description: logForm.description,
        imageUrls: logForm.imageUrls,
        phaseLabel: logForm.phaseLabel || undefined,
      });
      toast.success('✅ Đã cập nhật tiến độ!');
      setShowLogForm(false);
      setLogForm({ progressPercent: '', description: '', imageUrls: [], phaseLabel: '' });
      fetchAll();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi cập nhật'); }
    finally { setSubmittingLog(false); }
  };

  const openDisbForm = () => {
    const best = [...PHASES].reverse().find(ph => progress >= ph.threshold) || PHASES[0];
    setDisbForm({ phaseLabel: best.label, phaseThreshold: best.threshold, amount: '', immediateRatio: 30, note: '' });
    setShowDisbForm(true);
  };

  const submitDisb = async () => {
    if (!disbForm.amount || Number(disbForm.amount) <= 0) { toast.error('Vui lòng nhập số tiền hợp lệ'); return; }
    if (progress < disbForm.phaseThreshold) {
      toast.error(`Tiến độ hiện tại (${progress}%) chưa đạt ngưỡng ${disbForm.phaseThreshold}%`); return;
    }
    setSubmittingDisb(true);
    try {
      await api.post('/disbursements', {
        contractId: Number(contract.id),
        phaseLabel: disbForm.phaseLabel,
        phaseThreshold: Number(disbForm.phaseThreshold),
        amount: Number(disbForm.amount),
        immediateRatio: disbForm.immediateRatio / 100,
        note: disbForm.note || undefined,
      });
      toast.success('✅ Đã gửi yêu cầu giải ngân! Admin sẽ xác nhận trước.');
      setShowDisbForm(false);
      fetchAll();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi gửi yêu cầu'); }
    finally { setSubmittingDisb(false); }
  };

  const totalDisbursed = disbursements.filter(d => d.status === 'APPROVED').reduce((s, d) => s + (d.amount || 0), 0);
  const pendingDisb    = disbursements.filter(d => d.status === 'PENDING').length;
  const maxDisbursable = Math.round((contract.agreedPrice || 0) * 0.80);
  const canRequestDisb = isActive && totalDisbursed < maxDisbursable && PHASES.some(ph => progress >= ph.threshold);

  const tabs = [
    { key: 'logs',  label: `Nhật ký (${logs.length})`,     icon: <Camera size={13}/> },
    { key: 'disb',  label: `Giải ngân${pendingDisb > 0 ? ` (${pendingDisb})` : ''}`, icon: <DollarSign size={13}/> },
    { key: 'info',  label: 'Hợp đồng',                     icon: <FileText size={13}/> },
  ];

  return (
    <div className="space-y-5">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1a4f3a] group transition-colors">
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform"/> Quay lại danh sách
      </button>

      {/* Hero card */}
      <div className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden ${
        isDisputed ? 'border-red-200' : isActive ? 'border-green-200' : isCompleted ? 'border-teal-200' : 'border-gray-100'
      }`}>
        <div className={`h-1.5 w-full ${
          isDisputed ? 'bg-red-400' : isActive ? 'bg-green-500' : isCompleted ? 'bg-teal-500' : 'bg-gray-300'
        }`}/>
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <StatusBadge status={contract.status} disputed={isDisputed}/>
                <span className="text-[10px] font-mono text-gray-400">{contract.contractNumber}</span>
              </div>
              <h2 className="text-xl font-black text-gray-900">
                {contract.projectName || contract.orderCode || contract.contractNumber}
              </h2>
              <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1.5">
                <span className="flex items-center gap-1"><Building2 size={11}/>{contract.clientName}</span>
                {contract.clientPhone && <span className="flex items-center gap-1"><Phone size={11}/>{contract.clientPhone}</span>}
                {contract.estimatedDays && <span className="flex items-center gap-1"><Clock size={11}/>{contract.estimatedDays} ngày</span>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Giá trị hợp đồng</p>
              <p className="text-2xl font-black text-[#1a4f3a]">{fmt(contract.agreedPrice)}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Đã giải ngân: {fmt(totalDisbursed)}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-600 text-xs">Tiến độ thi công</span>
              <span className="font-black text-[#1a4f3a] text-base">{progress}%</span>
            </div>
            <ProgressBar value={progress}/>
            <div className="flex justify-between mt-2">
              {PHASES.map(p => (
                <div key={p.threshold} className="text-center">
                  <div className={`w-2.5 h-2.5 rounded-full mx-auto mb-1 border-2 transition-all ${
                    progress >= p.threshold ? 'bg-[#1a4f3a] border-[#1a4f3a]' : 'bg-white border-gray-300'
                  }`}/>
                  <p className={`text-[9px] font-bold ${progress >= p.threshold ? 'text-[#1a4f3a]' : 'text-gray-400'}`}>{p.threshold}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          {isActive && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100 mt-4">
              <button onClick={() => { setShowLogForm(true); setActiveTab('logs'); }}
                className="flex items-center gap-2 bg-[#1a4f3a] text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#2d7a5a] shadow-sm shadow-[#1a4f3a]/20">
                <Camera size={13}/> Cập nhật tiến độ
              </button>
              {canRequestDisb && (
                <button onClick={openDisbForm}
                  className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-amber-600">
                  <DollarSign size={13}/> Yêu cầu giải ngân
                </button>
              )}
              <button onClick={() => navigate(`/contracts/${contract.id}/dispute`)}
                className="flex items-center gap-2 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-red-50">
                <AlertTriangle size={13}/> Khiếu nại
              </button>
            </div>
          )}
          {isDisputed && (
            <div className="pt-4 border-t border-gray-100 mt-4">
              <button onClick={() => navigate(`/contracts/${contract.id}/dispute`)}
                className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-red-700 animate-pulse">
                <Shield size={13}/> Vào phòng giải quyết tranh chấp
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      {!loading && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-blue-600">{logs.length}</p>
            <p className="text-[10px] text-gray-400 font-medium mt-1">Nhật ký</p>
          </div>
          <div className={`rounded-2xl p-4 text-center border ${pendingDisb > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}`}>
            <p className={`text-2xl font-black ${pendingDisb > 0 ? 'text-amber-600' : 'text-gray-400'}`}>{pendingDisb}</p>
            <p className="text-[10px] text-gray-400 font-medium mt-1">Chờ duyệt</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
            <p className="text-lg font-black text-green-700">{fmt(totalDisbursed)}</p>
            <p className="text-[10px] text-gray-400 font-medium mt-1">Đã nhận</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 flex-1 justify-center py-2.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === t.key ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.icon}{t.label}
            {t.key === 'disb' && pendingDisb > 0 && (
              <span className="bg-amber-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{pendingDisb}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-[#1a4f3a]"/></div>
      ) : (
        <>

          {/* ── TAB: LOGS ─────────────────────────────────────────── */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              {/* Inline log form */}
              {isActive && showLogForm && (
                <div className="bg-white border-2 border-[#1a4f3a]/30 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><Camera size={16} className="text-[#1a4f3a]"/>Cập nhật tiến độ mới</h3>
                    <button onClick={() => setShowLogForm(false)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200">
                      <X size={14}/>
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-gray-700 mb-1.5 block">% Tiến độ mới *</label>
                        <input type="number" min={progress} max={100} value={logForm.progressPercent}
                          onChange={e => setLogForm(f => ({...f, progressPercent: e.target.value}))}
                          placeholder={`Hiện tại: ${progress}%`}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a4f3a]"/>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-700 mb-1.5 block">Giai đoạn thi công</label>
                        <select value={logForm.phaseLabel} onChange={e => setLogForm(f => ({...f, phaseLabel: e.target.value}))}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a4f3a] bg-white">
                          <option value="">-- Chọn giai đoạn --</option>
                          {PHASES.map(p => <option key={p.label} value={p.label}>{p.label} ({p.threshold}%)</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 mb-1.5 block">Mô tả công việc đã thực hiện *</label>
                      <textarea rows={3} value={logForm.description}
                        onChange={e => setLogForm(f => ({...f, description: e.target.value}))}
                        placeholder="VD: Hoàn thiện phần móng, đổ bê tông cột trục A1-A4, kiểm tra chất lượng..."
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a4f3a] resize-none"/>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 mb-1.5 block">
                        Ảnh thi công
                        <span className="text-gray-400 font-normal ml-1">({logForm.imageUrls.length}/6)</span>
                      </label>
                      {/* Upload file + nhập URL */}
                      <div className="flex gap-2">
                        {/* Nút upload file */}
                        <input
                          ref={imgFileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleImgFileSelect}
                        />
                        <button
                          type="button"
                          onClick={() => imgFileInputRef.current?.click()}
                          disabled={uploadingImg || logForm.imageUrls.length >= 6}
                          className="flex items-center gap-1.5 px-3 py-2 bg-[#1a4f3a] text-white rounded-xl text-xs font-bold hover:bg-[#2d7a5a] disabled:opacity-50 shrink-0 transition-colors"
                        >
                          <ImagePlus size={13}/>
                          {uploadingImg ? 'Đang tải...' : 'Upload ảnh'}
                        </button>
                        {/* Hoặc nhập URL thủ công */}
                        <input value={imgUrlInput} onChange={e => setImgUrlInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                          placeholder="Hoặc dán URL ảnh rồi nhấn Enter..."
                          disabled={logForm.imageUrls.length >= 6}
                          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#1a4f3a] disabled:bg-gray-50 disabled:text-gray-400"/>
                        <button onClick={addImageUrl}
                          disabled={!imgUrlInput.trim() || logForm.imageUrls.length >= 6}
                          className="px-3 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 disabled:opacity-40 shrink-0">
                          <Plus size={14}/>
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1.5">
                        Upload tối đa 6 ảnh. Định dạng: JPG, PNG, WEBP.
                      </p>
                      {logForm.imageUrls.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {logForm.imageUrls.map((url, i) => (
                            <div key={i} className="relative group">
                              <img src={url} alt="" className="w-16 h-16 rounded-xl object-cover border border-gray-200"/>
                              <button onClick={() => removeImage(i)}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <X size={10}/>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button onClick={() => setShowLogForm(false)}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50">Hủy</button>
                      <button onClick={submitLog} disabled={submittingLog}
                        className="flex-1 py-2.5 rounded-xl bg-[#1a4f3a] text-white text-xs font-bold hover:bg-[#2d7a5a] disabled:opacity-60 flex items-center justify-center gap-2">
                        {submittingLog ? <><Loader2 size={13} className="animate-spin"/>Đang lưu...</> : <><CheckCircle2 size={13}/>Lưu tiến độ</>}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Add button when form hidden */}
              {isActive && !showLogForm && (
                <button onClick={() => setShowLogForm(true)}
                  className="w-full py-3 border-2 border-dashed border-[#1a4f3a]/30 rounded-2xl text-sm font-bold text-[#1a4f3a] hover:bg-[#1a4f3a]/5 transition-colors flex items-center justify-center gap-2">
                  <Plus size={16}/> Thêm nhật ký thi công mới
                </button>
              )}

              {/* Logs timeline */}
              {logs.length === 0 ? (
                <div className="text-center py-14 bg-white rounded-2xl border border-dashed border-gray-200">
                  <Camera size={32} className="mx-auto text-gray-200 mb-3"/>
                  <p className="text-gray-400 text-sm font-medium">Chưa có nhật ký thi công</p>
                  <p className="text-xs text-gray-300 mt-1">Hãy thêm nhật ký đầu tiên để ghi lại tiến độ</p>
                </div>
              ) : (
                <div className="relative space-y-4">
                  <div className="absolute top-2 bottom-2 left-5 w-0.5 bg-gray-100"/>
                  {logs.map((log, idx) => (
                    <div key={log.id} className="relative pl-11">
                      <div className={`absolute left-3.5 top-2 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                        idx === 0 ? 'bg-[#1a4f3a]' : 'bg-gray-300'
                      }`}/>
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-gray-200 transition-colors">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <div className="flex flex-wrap gap-2">
                            {log.phaseLabel && (
                              <span className="px-2.5 py-0.5 bg-[#1a4f3a]/10 text-[#1a4f3a] rounded-full text-[10px] font-bold">
                                {log.phaseLabel}
                              </span>
                            )}
                            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold">
                              {log.progressPercent}% tiến độ
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400">
                            {new Date(log.createdAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{log.description}</p>
                        {log.imageUrls?.length > 0 && (
                          <div className="flex gap-2 mt-3 flex-wrap">
                            {log.imageUrls.map((url, i) => (
                              <img key={i} src={url} alt="" className="w-20 h-20 rounded-xl object-cover border border-gray-100 cursor-pointer hover:opacity-90"/>
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

          {/* ── TAB: DISBURSEMENTS ────────────────────────────────── */}
          {activeTab === 'disb' && (
            <div className="space-y-4">
              {/* Inline disb form */}
              {showDisbForm && (
                <div className="bg-white border-2 border-amber-300 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><DollarSign size={16} className="text-amber-600"/>Yêu cầu giải ngân</h3>
                    <button onClick={() => setShowDisbForm(false)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200"><X size={14}/></button>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-xs text-amber-800">
                    <ShieldCheck size={12} className="inline mr-1.5"/>
                    Quy trình: Bạn gửi → Admin xác nhận → Khách duyệt → <strong>30% nhận ngay</strong>, 70% locked đến mốc tiếp theo.
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-gray-700 mb-1.5 block">Giai đoạn xin giải ngân</label>
                      <select value={disbForm.phaseLabel}
                        onChange={e => {
                          const ph = PHASES.find(p => p.label === e.target.value) || PHASES[0];
                          setDisbForm(f => ({...f, phaseLabel: ph.label, phaseThreshold: ph.threshold}));
                        }}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400 bg-white">
                        {PHASES.map(p => (
                          <option key={p.label} value={p.label} disabled={progress < p.threshold}>
                            {p.label} ({p.threshold}%) {progress < p.threshold ? '— chưa đạt' : '✓'}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 mb-1.5 block">Số tiền yêu cầu (VNĐ) *</label>
                      <input type="number" min="0" value={disbForm.amount}
                        onChange={e => setDisbForm(f => ({...f, amount: e.target.value}))}
                        placeholder="VD: 50000000"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400"/>
                      {disbForm.amount > 0 && (
                        <p className="text-[10px] text-gray-500 mt-1">
                          → Nhận ngay: <strong className="text-green-600">{fmt(disbForm.amount * 0.3)}</strong> | 
                          Locked: <strong className="text-amber-600">{fmt(disbForm.amount * 0.7)}</strong>
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 mb-1.5 block">Ghi chú (không bắt buộc)</label>
                      <input type="text" value={disbForm.note} onChange={e => setDisbForm(f => ({...f, note: e.target.value}))}
                        placeholder="VD: Hoàn thành phần móng, đúng tiến độ..."
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-amber-400"/>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button onClick={() => setShowDisbForm(false)}
                        className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50">Hủy</button>
                      <button onClick={submitDisb} disabled={submittingDisb}
                        className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 disabled:opacity-60 flex items-center justify-center gap-2">
                        {submittingDisb ? <><Loader2 size={13} className="animate-spin"/>Đang gửi...</> : <><DollarSign size={13}/>Gửi yêu cầu</>}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Request button */}
              {isActive && canRequestDisb && !showDisbForm && (
                <button onClick={openDisbForm}
                  className="w-full py-3 border-2 border-dashed border-amber-300 rounded-2xl text-sm font-bold text-amber-700 hover:bg-amber-50 transition-colors flex items-center justify-center gap-2">
                  <Plus size={16}/> Gửi yêu cầu giải ngân mới
                </button>
              )}
              {isActive && !canRequestDisb && !showDisbForm && totalDisbursed >= maxDisbursable && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
                  <AlertCircle size={14} className="mt-0.5 shrink-0"/>
                  <span>Đã đạt giới hạn 80% giải ngân trước hoàn công. Còn <strong>{fmt((contract.agreedPrice || 0) - totalDisbursed)}</strong> sẽ giải ngân sau khi Admin xác nhận hoàn công.</span>
                </div>
              )}

              {/* Disb list */}
              {disbursements.length === 0 ? (
                <div className="text-center py-14 bg-white rounded-2xl border border-dashed border-gray-200">
                  <DollarSign size={32} className="mx-auto text-gray-200 mb-3"/>
                  <p className="text-gray-400 text-sm font-medium">Chưa có yêu cầu giải ngân nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {disbursements.map(d => {
                    const isPending   = d.status === 'PENDING' && !d.adminVerified;
                    const waitCustomer = d.status === 'PENDING' && d.adminVerified;
                    const isApproved  = d.status === 'APPROVED';
                    return (
                      <div key={d.id} className={`bg-white border-2 rounded-2xl p-4 shadow-sm ${
                        isPending ? 'border-amber-200' : waitCustomer ? 'border-blue-200' : isApproved ? 'border-green-200' : 'border-gray-100'
                      }`}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap gap-2 mb-1.5">
                              <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold">{d.phaseLabel} · {d.phaseThreshold}%</span>
                              {isPending && <span className="px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold flex items-center gap-1"><ShieldCheck size={9}/>Chờ Admin xác nhận</span>}
                              {waitCustomer && <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold flex items-center gap-1"><CheckCircle2 size={9}/>Chờ khách duyệt</span>}
                              {isApproved && <span className="px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold flex items-center gap-1"><CheckCircle2 size={9}/>Đã giải ngân</span>}
                              {d.status === 'REJECTED' && <span className="px-2.5 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-bold flex items-center gap-1"><X size={9}/>Bị từ chối</span>}
                            </div>
                            <p className="text-sm font-bold text-gray-800">{fmt(d.amount)}</p>
                            {d.note && <p className="text-xs text-gray-400 mt-0.5">{d.note}</p>}
                            <p className="text-[10px] text-gray-300 mt-1">{new Date(d.createdAt).toLocaleString('vi-VN')}</p>
                          </div>
                          {isApproved && (
                            <div className="text-right text-xs text-gray-500">
                              <p>Nhận ngay: <strong className="text-green-600">{fmt(d.immediateAmount)}</strong></p>
                              <p>Locked: <strong className="text-amber-600">{fmt(d.lockedAmount)}</strong></p>
                              {d.fullyUnlocked && <p className="text-green-600 font-bold">✓ Đã mở khóa hoàn toàn</p>}
                            </div>
                          )}
                        </div>
                        {waitCustomer && (
                          <div className="mt-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-xs text-blue-700 flex items-center gap-1.5">
                            <Clock size={11}/> Admin đã xác nhận. Đang chờ khách hàng duyệt — bạn sẽ nhận thông báo.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TAB: CONTRACT INFO ────────────────────────────────── */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Các bên ký kết</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: 'Bên A — Khách hàng', name: contract.clientName, phone: contract.clientPhone, email: contract.clientEmail },
                    { label: 'Bên B — Nhà thầu',   name: contract.contractorName, phone: contract.contractorPhone, email: contract.contractorEmail },
                  ].map(p => (
                    <div key={p.label} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">{p.label}</p>
                      <p className="font-bold text-gray-900">{p.name || '—'}</p>
                      {p.phone && <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Phone size={10}/>{p.phone}</p>}
                      {p.email && <p className="text-xs text-gray-500 mt-0.5">{p.email}</p>}
                      <span className="text-[10px] text-green-600 font-bold flex items-center gap-1 mt-2"><CheckCircle2 size={11}/> Đã ký kết</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><FileText size={12}/>Điều khoản hợp đồng</p>
                <pre className="text-xs text-gray-700 bg-gray-50 rounded-xl p-4 whitespace-pre-wrap font-sans leading-relaxed max-h-64 overflow-y-auto border border-gray-100">
                  {contract.terms || 'Theo thỏa thuận của các bên.'}
                </pre>
              </div>
              <button onClick={() => navigate(`/contracts/${contract.id}/progress`)}
                className="w-full py-3 border border-[#1a4f3a] text-[#1a4f3a] text-xs font-bold rounded-2xl hover:bg-[#1a4f3a]/5 flex items-center justify-center gap-2">
                <TrendingUp size={14}/> Xem trang tiến độ đầy đủ
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── ROOT PAGE ─────────────────────────────────────────────────────────────────
export default function ContractorProgressPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeMainTab = searchParams.get('tab') || 'orders';
  const setMainTab = (tab) => setSearchParams({ tab });

  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchContracts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/contracts/my');
      setContracts(res.data.data || []);
    } catch { toast.error('Không thể tải danh sách hợp đồng'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchContracts(); }, [fetchContracts]);

  // Sync selected after refresh
  useEffect(() => {
    if (selected) {
      const updated = contracts.find(c => c.id === selected.id);
      if (updated) setSelected(updated);
    }
  }, [contracts, selected]);

  const orderContracts = contracts.filter(c => c.orderId != null);
  const projectContracts = contracts.filter(c => c.projectId != null || c.orderId == null);

  const disputedCount  = (activeMainTab === 'orders' ? orderContracts : projectContracts).filter(c => c.isDisputed).length;

  if (selected) {
    return (
      <Layout title="Báo cáo tiến độ thi công">
        <div className="max-w-4xl mx-auto">
          <ContractDetailView
            contract={selected}
            onBack={() => { setSelected(null); fetchContracts(); }}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Báo cáo tiến độ & Thi công">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* ── Main Tabs switcher ── */}
        {!selected && (
          <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 p-1.5 shadow-sm">
            <button onClick={() => setMainTab('orders')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all relative ${
                activeMainTab === 'orders' ? 'bg-primary text-white shadow-sm shadow-primary/30' : 'text-gray-500 hover:bg-gray-50'
              }`}>
              <ShoppingBag size={15}/> Hợp đồng Đơn hàng
              {orderContracts.length > 0 && (
                <span className={`absolute top-1.5 right-2 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${activeMainTab === 'orders' ? 'bg-white text-[#1a4f3a]' : 'bg-primary text-white'}`}>
                  {orderContracts.length}
                </span>
              )}
            </button>
            <button onClick={() => setMainTab('projects')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all relative ${
                activeMainTab === 'projects' ? 'bg-primary text-white shadow-sm shadow-primary/30' : 'text-gray-500 hover:bg-gray-50'
              }`}>
              <Hammer size={15}/> Hợp đồng Dự án
              {projectContracts.length > 0 && (
                <span className={`absolute top-1.5 right-2 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${activeMainTab === 'projects' ? 'bg-white text-[#1a4f3a]' : 'bg-primary text-white'}`}>
                  {projectContracts.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* ── Alert: có tranh chấp ─────────────────────────────────── */}
        {disputedCount > 0 && (
          <div className="flex items-start gap-3 bg-red-50 border-2 border-red-300 rounded-2xl px-5 py-4">
            <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0"/>
            <div>
              <p className="font-bold text-red-800 text-sm">{disputedCount} hợp đồng đang có tranh chấp</p>
              <p className="text-xs text-red-700 mt-0.5">Hợp đồng bị đóng băng cho đến khi Admin giải quyết. Nhấn vào hợp đồng để xử lý.</p>
            </div>
          </div>
        )}

        {/* ── Contract list ─────────────────────────────────────────── */}
        <ContractListView
          contracts={activeMainTab === 'orders' ? orderContracts : projectContracts}
          loading={loading}
          onSelect={setSelected}
          onRefresh={fetchContracts}
        />

      </div>
    </Layout>
  );
}
