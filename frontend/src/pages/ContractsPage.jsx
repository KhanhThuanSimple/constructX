import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText, CheckCircle, Clock, XCircle, AlertCircle,
  Printer, Building2, Phone, Wallet,
  Camera, ClipboardCheck, Shield, Lock, Unlock,
  TrendingUp, DollarSign, Star, ChevronRight, ArrowLeft,
  Loader2, BadgeCheck, ShieldCheck, UserCheck, Search,
  RefreshCw, ShoppingBag, Hammer
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';

const fmt = (n) =>
  n == null ? '—' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n).replace('₫', 'đ');

const STATUS_CFG = {
  PENDING_REVIEW:    { label: 'Chờ Admin duyệt',  color: 'bg-amber-100 text-amber-700 border-amber-200',  dot: 'bg-amber-400 animate-pulse' },
  WAITING_SIGNATURE: { label: 'Chờ ký kết',        color: 'bg-blue-100 text-blue-700 border-blue-200',    dot: 'bg-blue-400' },
  ACTIVE:            { label: 'Đang thi công',      color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
  COMPLETED:         { label: 'Hoàn thành',         color: 'bg-teal-100 text-teal-700 border-teal-200',    dot: 'bg-teal-400' },
  CANCELLED:         { label: 'Đã hủy',             color: 'bg-red-100 text-red-600 border-red-200',       dot: 'bg-red-400' },
};

function StatusBadge({ status, disputed }) {
  if (disputed) return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border bg-red-100 text-red-600 border-red-200 animate-pulse">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
      🔒 Tranh chấp
    </span>
  );
  const cfg = STATUS_CFG[status] || { label: status, color: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

/* ── In hợp đồng ── */
function printContract(c) {
  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"/>
    <title>HĐ ${c.contractNumber}</title>
    <style>body{font-family:serif;padding:40px;font-size:13pt}h1{text-align:center}table{width:100%;border-collapse:collapse;margin:12px 0}th,td{border:1px solid #999;padding:8px;text-align:left}pre{white-space:pre-wrap;font-family:inherit;background:#f9f9f9;padding:16px;border:1px solid #eee}</style>
    </head><body>
    <h1>HỢP ĐỒNG THI CÔNG<br><small>${c.contractNumber}</small></h1>
    <table><tr><th>Bên A</th><td>${c.clientName}</td></tr><tr><th>Bên B</th><td>${c.contractorName}</td></tr>
    <tr><th>Giá trị</th><td>${fmt(c.agreedPrice)}</td></tr><tr><th>Thời gian</th><td>${c.estimatedDays || '—'} ngày</td></tr></table>
    <h2>Điều khoản</h2><pre>${c.terms || 'Theo thỏa thuận'}</pre>
    <script>window.onload=()=>window.print()</script></body></html>`);
  win.document.close();
}

// ─── View 1: Danh sách hợp đồng ─────────────────────────────────────────────
function ContractListView({ contracts, loading, onSelect, onRefresh }) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const counts = Object.fromEntries(
    Object.keys(STATUS_CFG).map(k => [k, contracts.filter(c => c.status === k).length])
  );
  const disputedCount = contracts.filter(c => c.isDisputed).length;

  const filtered = contracts.filter(c => {
    const matchStatus = statusFilter === 'all' ? true
      : statusFilter === 'DISPUTED' ? c.isDisputed
      : c.status === statusFilter && !c.isDisputed;
    const matchSearch = !search.trim() || [c.projectName, c.orderCode, c.contractNumber, c.clientName, c.contractorName]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()));
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {[
          { key: 'all',       label: 'Tất cả',         value: contracts.length,       color: 'text-gray-700',  bg: 'bg-white',      active: statusFilter === 'all' },
          { key: 'ACTIVE',    label: 'Đang thi công',  value: counts.ACTIVE || 0,     color: 'text-green-600', bg: 'bg-green-50',   active: statusFilter === 'ACTIVE' },
          { key: 'COMPLETED', label: 'Hoàn thành',     value: counts.COMPLETED || 0,  color: 'text-teal-600',  bg: 'bg-teal-50',    active: statusFilter === 'COMPLETED' },
          { key: 'DISPUTED',  label: 'Tranh chấp',     value: disputedCount,          color: 'text-red-600',   bg: 'bg-red-50',     active: statusFilter === 'DISPUTED' },
        ].map(s => (
          <button key={s.key} onClick={() => setStatusFilter(s.key)}
            className={`rounded-xl border p-3 text-center transition-all ${
              s.active ? 'border-primary shadow-md shadow-primary/10 ring-1 ring-primary/20' : 'border-gray-100 hover:border-gray-200'
            } ${s.bg}`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5 font-medium truncate">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Search + Refresh */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={15} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên dự án, mã hợp đồng, đối tác..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary" />
        </div>
        <button onClick={onRefresh} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Empty */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <FileText size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400 font-semibold text-sm">
            {statusFilter === 'all' ? 'Bạn chưa có hợp đồng nào.' : 'Không có hợp đồng phù hợp bộ lọc.'}
          </p>
          {statusFilter === 'all' && user?.role === 'CUSTOMER' && (
            <div className="flex gap-3 justify-center mt-4">
              <button onClick={() => navigate('/projects/new')} className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90">Tạo dự án</button>
              <button onClick={() => navigate('/shop/order')} className="px-4 py-2 border border-gray-200 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-50">Đặt đơn hàng</button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => {
            const st = STATUS_CFG[c.status] || {};
            // Xác định "nhãn hành động gợi ý" cho từng card
            const actionHint = c.isDisputed ? '⚠️ Cần xử lý tranh chấp'
              : c.status === 'ACTIVE' ? '📷 Xem tiến độ & giải ngân'
              : c.status === 'COMPLETED' ? '🏆 Nghiệm thu & đánh giá'
              : null;

            return (
              <button key={c.id} onClick={() => onSelect(c)}
                className={`w-full bg-white rounded-2xl border p-5 text-left hover:shadow-md transition-all group ${
                  c.isDisputed ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-100 hover:border-primary'
                }`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <StatusBadge status={c.status} disputed={c.isDisputed} />
                      <span className="text-[10px] font-mono text-gray-400">{c.contractNumber}</span>
                      {c.orderCode && !c.projectName && (
                        <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full font-bold">📦 {c.orderCode}</span>
                      )}
                    </div>
                    <p className="font-bold text-gray-900 truncate">{c.projectName || c.orderCode || c.contractNumber}</p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-3">
                      <span className="flex items-center gap-1"><Building2 size={10}/>{user?.role === 'CUSTOMER' ? c.contractorName : c.clientName}</span>
                      <span className="flex items-center gap-1"><Clock size={10}/>{new Date(c.createdAt).toLocaleDateString('vi-VN')}</span>
                    </p>
                    {actionHint && (
                      <p className={`text-[11px] font-bold mt-2 px-2.5 py-1 rounded-lg w-fit ${
                        c.isDisputed ? 'bg-red-50 text-red-600' :
                        c.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-teal-50 text-teal-600'
                      }`}>{actionHint}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-black text-primary">{fmt(c.agreedPrice)}</p>
                      {c.estimatedDays && <p className="text-[11px] text-gray-400">{c.estimatedDays} ngày</p>}
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-primary transition-colors" />
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

// ─── View 2: Chi tiết hợp đồng với tab inline ───────────────────────────────
function ContractDetailView({ contract: initialC, onBack }) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [c, setC] = useState(initialC);
  const [progress, setProgress] = useState(null);
  const [logs, setLogs] = useState([]);
  const [disbursements, setDisbursements] = useState([]);
  const [loadingTab, setLoadingTab] = useState(false);

  // Hợp đồng giờ tạo thẳng ACTIVE — không cần signing flow nữa
  // defaultTab: dispute → progress (ACTIVE) → review (COMPLETED) → contract
  const defaultTab = c.isDisputed ? 'dispute'
    : c.status === 'ACTIVE' ? 'progress'
    : c.status === 'COMPLETED' ? 'review'
    : 'contract';

  const [activeTab, setActiveTab] = useState(defaultTab);

  const loadTabData = useCallback(async (tab) => {
    setLoadingTab(true);
    try {
      if (tab === 'progress') {
        const [lRes, pRes] = await Promise.all([
          api.get(`/contracts/${c.id}/construction-logs`),
          api.get(`/contracts/${c.id}/progress`),
        ]);
        setLogs(lRes.data.data || []);
        setProgress(pRes.data.data ?? 0);
      }
      if (tab === 'disbursements') {
        const res = await api.get(`/contracts/${c.id}/disbursements`);
        setDisbursements(res.data.data || []);
      }
    } catch {}
    finally { setLoadingTab(false); }
  }, [c.id]);

  useEffect(() => { loadTabData(activeTab); }, [activeTab]);

  // Tabs available theo trạng thái — bỏ WAITING_SIGNATURE vì HĐ tạo thẳng ACTIVE
  const tabs = [
    { key: 'contract', label: 'Hợp đồng', icon: <FileText size={13}/> },
    ...(c.status === 'ACTIVE' || c.status === 'COMPLETED' ? [
      { key: 'progress', label: 'Tiến độ thi công', icon: <Camera size={13}/> },
      { key: 'disbursements', label: 'Giải ngân', icon: <DollarSign size={13}/> },
    ] : []),
    ...(c.status === 'COMPLETED' ? [{ key: 'review', label: 'Nghiệm thu & Đánh giá', icon: <ClipboardCheck size={13}/> }] : []),
    ...(c.isDisputed ? [{ key: 'dispute', label: '⚠️ Tranh chấp', icon: <Shield size={13}/> }] : []),
  ];

  const pendingDisbCount = disbursements.filter(d => d.status === 'PENDING').length;

  return (
    <div className="space-y-5">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors group">
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" /> Quay lại danh sách
      </button>

      {/* Hero card */}
      <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${c.isDisputed ? 'border-red-200' : 'border-gray-100'}`}>
        <div className="flex items-stretch">
          <div className={`w-1.5 shrink-0 ${c.isDisputed ? 'bg-red-400' : STATUS_CFG[c.status]?.dot?.replace(' animate-pulse','') || 'bg-gray-300'}`} />
          <div className="flex-1 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <StatusBadge status={c.status} disputed={c.isDisputed} />
                  <span className="text-xs font-mono text-gray-400">{c.contractNumber}</span>
                </div>
                <h2 className="text-xl font-black text-gray-900">{c.projectName || c.orderCode || c.contractNumber}</h2>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1"><Building2 size={11}/>{user?.role === 'CUSTOMER' ? `Nhà thầu: ${c.contractorName}` : `Khách hàng: ${c.clientName}`}</span>
                  <span className="flex items-center gap-1"><Clock size={11}/>{new Date(c.createdAt).toLocaleDateString('vi-VN')}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Giá trị hợp đồng</p>
                <p className="text-2xl font-black text-primary">{fmt(c.agreedPrice)}</p>
                {c.estimatedDays && <p className="text-xs text-gray-400">{c.estimatedDays} ngày thi công</p>}
              </div>
            </div>

            {/* Quick action */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
              <button onClick={() => printContract(c)} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors">
                <Printer size={13}/> In hợp đồng
              </button>
              {c.status === 'ACTIVE' && !c.isDisputed && (
                <button onClick={() => navigate(`/contracts/${c.id}/progress`)}
                  className="flex items-center gap-1.5 px-5 py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition-colors">
                  <TrendingUp size={13}/> Xem tiến độ thi công
                </button>
              )}
              {c.status === 'ACTIVE' && !c.isDisputed && (
                <button onClick={() => setActiveTab('disbursements')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl hover:bg-amber-600 transition-colors">
                  <DollarSign size={13}/> Giải ngân
                  {disbursements.filter(d => d.status === 'PENDING').length > 0 && (
                    <span className="bg-white text-amber-600 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                      {disbursements.filter(d => d.status === 'PENDING').length}
                    </span>
                  )}
                </button>
              )}
              {c.status === 'COMPLETED' && (
                <button onClick={() => navigate(`/contracts/${c.id}/review`)}
                  className="flex items-center gap-1.5 px-5 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700 transition-colors">
                  <ClipboardCheck size={13}/> Nghiệm thu & Đánh giá
                </button>
              )}
              {c.isDisputed && (
                <button onClick={() => navigate(`/contracts/${c.id}/dispute`)}
                  className="flex items-center gap-1.5 px-5 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 animate-pulse transition-colors">
                  <Shield size={13}/> Vào phòng giải quyết tranh chấp
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tranh chấp banner */}
      {c.isDisputed && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-800">
          <Shield size={18} className="text-red-500 mt-0.5 shrink-0 animate-pulse" />
          <div>
            <p className="font-bold">Hợp đồng đang bị đóng băng tranh chấp</p>
            <p className="text-xs mt-1 text-red-600 leading-relaxed">Mọi cập nhật tiến độ và giải ngân đã bị tạm khóa. Nhấn nút "Vào phòng giải quyết" để gửi bằng chứng và trao đổi với Admin.</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 flex-1 justify-center py-2.5 px-3 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === t.key ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.icon} {t.label}
            {t.key === 'disbursements' && pendingDisbCount > 0 && (
              <span className="bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{pendingDisbCount}</span>
            )}
          </button>
        ))}
      </div>

      {loadingTab ? (
        <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-primary" /></div>
      ) : (
        <>
          {/* ── Tab: Hợp đồng ── */}
          {activeTab === 'contract' && (
            <div className="space-y-4">
              {/* Thông tin 2 bên */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Các bên ký kết</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: 'Bên A — Khách hàng', name: c.clientName, phone: c.clientPhone, email: c.clientEmail, color: 'blue' },
                    { label: 'Bên B — Nhà thầu',   name: c.contractorName, phone: c.contractorPhone, email: c.contractorEmail, color: 'green' },
                  ].map(p => (
                    <div key={p.label} className={`bg-${p.color}-50/40 border border-${p.color}-100 rounded-xl p-4`}>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">{p.label}</p>
                      <p className="font-bold text-gray-900">{p.name || '—'}</p>
                      {p.phone && <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Phone size={10}/>{p.phone}</p>}
                      {p.email && <p className="text-xs text-gray-500 mt-0.5">{p.email}</p>}
                      <span className="text-[10px] text-green-600 font-bold flex items-center gap-1 mt-2">
                        <CheckCircle size={11}/> Đã ký kết
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Escrow info */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ký quỹ & Đặt cọc</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Cọc khách hàng',  value: c.customerDepositAmount,  locked: c.customerDepositLocked },
                    { label: 'Ký quỹ nhà thầu', value: c.contractorDepositAmount, locked: c.contractorDepositLocked },
                  ].map(f => (
                    <div key={f.label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-[10px] text-gray-400 font-medium">{f.label}</p>
                      <p className="font-black text-gray-800 mt-1">{fmt(f.value)}</p>
                      <p className={`text-[10px] mt-0.5 flex items-center gap-1 font-bold ${f.locked ? 'text-amber-600' : 'text-green-500'}`}>
                        {f.locked ? <><Lock size={9}/>Đang giữ</> : <><Unlock size={9}/>Đã giải phóng</>}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Điều khoản */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5"><FileText size={12}/> Điều khoản hợp đồng</p>
                <pre className="text-xs text-gray-700 bg-gray-50 rounded-xl p-4 whitespace-pre-wrap font-sans leading-relaxed max-h-56 overflow-y-auto border border-gray-100">
                  {c.terms || 'Theo thỏa thuận của các bên.'}
                </pre>
              </div>

              {/* Timeline */}
              {c.stages?.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5"><Clock size={12}/> Lịch sử trạng thái</p>
                  <div className="space-y-0">
                    {c.stages.map((s, i) => {
                      const sc = STATUS_CFG[s.stage] || {};
                      return (
                        <div key={i} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${sc.dot?.replace(' animate-pulse','') || 'bg-gray-300'}`} />
                            {i < c.stages.length - 1 && <div className="w-px flex-1 bg-gray-100 my-1" />}
                          </div>
                          <div className="pb-4 flex-1">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <StatusBadge status={s.stage} />
                              <span className="text-[10px] text-gray-400">{new Date(s.createdAt).toLocaleString('vi-VN')}</span>
                            </div>
                            {s.note && <p className="text-xs text-gray-600 mt-0.5">{s.note}</p>}
                            {s.performedBy && <p className="text-[10px] text-gray-400">— {s.performedBy}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Tiến độ ── */}
          {activeTab === 'progress' && (
            <div className="space-y-4">
              {/* Progress bar */}
              {progress !== null && (
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-gray-700">Tiến độ thi công</span>
                    <span className="font-black text-primary">{progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-3 bg-primary rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-gray-400">
                    {[20, 50, 80, 100].map(p => (
                      <span key={p} className={progress >= p ? 'text-primary font-bold' : ''}>{p}%</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-gray-800">Nhật ký thi công ({logs.length})</p>
                <button onClick={() => navigate(`/contracts/${c.id}/progress`)}
                  className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
                  Xem đầy đủ <ChevronRight size={12}/>
                </button>
              </div>

              {logs.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
                  <Camera size={28} className="mx-auto text-gray-200 mb-2" />
                  <p className="text-gray-400 text-sm">Chưa có nhật ký thi công nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.slice(0, 3).map(log => (
                    <div key={log.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {log.phaseLabel && (
                          <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-bold">{log.phaseLabel}</span>
                        )}
                        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold">{log.progressPercent}% tiến độ</span>
                        <span className="text-[10px] text-gray-400 ml-auto">{new Date(log.createdAt).toLocaleString('vi-VN')}</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{log.description}</p>
                      {log.imageUrls?.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {log.imageUrls.slice(0, 3).map((url, i) => (
                            <img key={i} src={url} alt="" className="w-16 h-16 rounded-xl object-cover border border-gray-100" />
                          ))}
                          {log.imageUrls.length > 3 && <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-400 font-bold">+{log.imageUrls.length - 3}</div>}
                        </div>
                      )}
                    </div>
                  ))}
                  {logs.length > 3 && (
                    <button onClick={() => navigate(`/contracts/${c.id}/progress`)}
                      className="w-full py-3 border border-dashed border-gray-200 rounded-2xl text-xs font-bold text-primary hover:bg-primary/5 transition-colors">
                      Xem tất cả {logs.length} nhật ký →
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Giải ngân ── */}
          {activeTab === 'disbursements' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-gray-800">Yêu cầu giải ngân</p>
                <button onClick={() => navigate(`/contracts/${c.id}/progress`)}
                  className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
                  Quản lý đầy đủ <ChevronRight size={12}/>
                </button>
              </div>
              {disbursements.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
                  <DollarSign size={28} className="mx-auto text-gray-200 mb-2" />
                  <p className="text-gray-400 text-sm">Chưa có yêu cầu giải ngân nào</p>
                </div>
              ) : (
                disbursements.map(d => {
                  const isPending = d.status === 'PENDING' && !d.adminVerified;
                  const waitCustomer = d.status === 'PENDING' && d.adminVerified;
                  return (
                    <div key={d.id} className={`bg-white border rounded-2xl p-4 shadow-sm ${
                      isPending ? 'border-amber-200' : waitCustomer ? 'border-blue-200' : d.status === 'APPROVED' ? 'border-green-200' : 'border-gray-100'
                    }`}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="flex gap-2 mb-1 flex-wrap">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold">{d.phaseLabel} · {d.phaseThreshold}%</span>
                            {isPending && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold flex items-center gap-1"><ShieldCheck size={9}/>Chờ Admin</span>}
                            {waitCustomer && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold flex items-center gap-1"><UserCheck size={9}/>Chờ bạn duyệt</span>}
                            {d.status === 'APPROVED' && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold flex items-center gap-1"><BadgeCheck size={9}/>Đã giải ngân</span>}
                          </div>
                          <p className="text-[11px] text-gray-400">{new Date(d.createdAt).toLocaleString('vi-VN')}</p>
                        </div>
                        <p className="font-black text-primary">{fmt(d.amount)}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <button onClick={() => navigate(`/contracts/${c.id}/progress`)}
                className="w-full py-3 bg-primary text-white text-xs font-bold rounded-2xl hover:bg-primary/90 transition-colors">
                Mở trang Giải ngân & Tiến độ đầy đủ →
              </button>
            </div>
          )}

          {/* ── Tab: Nghiệm thu & Đánh giá ── */}
          {activeTab === 'review' && (
            <div className="space-y-4">
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
                <p className="text-sm font-bold text-gray-800 flex items-center gap-2"><ClipboardCheck size={14}/> Thông tin hoàn công</p>
                <div className="grid grid-cols-2 gap-3">
                  {c.warrantyHoldAmount && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                      <p className="text-[10px] text-amber-700 font-medium">Tiền bảo hành (5%)</p>
                      <p className="font-black text-amber-800">{fmt(c.warrantyHoldAmount)}</p>
                      <p className={`text-[10px] mt-0.5 flex items-center gap-1 font-bold ${c.warrantyReleased ? 'text-green-600' : 'text-amber-600'}`}>
                        {c.warrantyReleased ? <><Unlock size={9}/>Đã giải phóng</> : <><Lock size={9}/>Đang giữ bảo hành</>}
                      </p>
                    </div>
                  )}
                  {c.warrantyEndDate && (
                    <div className="bg-teal-50 border border-teal-100 rounded-xl p-3">
                      <p className="text-[10px] text-teal-700 font-medium">Hết hạn bảo hành</p>
                      <p className="font-black text-teal-800">{new Date(c.warrantyEndDate).toLocaleDateString('vi-VN')}</p>
                    </div>
                  )}
                </div>
                <button onClick={() => navigate(`/contracts/${c.id}/review`)}
                  className="w-full py-3 bg-teal-600 text-white text-xs font-bold rounded-2xl hover:bg-teal-700 transition-colors flex items-center justify-center gap-2">
                  <Star size={13}/> Xem nghiệm thu & Đánh giá nhà thầu đầy đủ →
                </button>
              </div>
            </div>
          )}

          {/* ── Tab: Tranh chấp ── */}
          {activeTab === 'dispute' && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 space-y-4 text-center">
              <Shield size={40} className="mx-auto text-red-400 animate-pulse" />
              <div>
                <p className="font-bold text-red-800 text-base">Hợp đồng đang bị đóng băng</p>
                <p className="text-xs text-red-600 mt-1 leading-relaxed">
                  Mọi hoạt động thi công và giải ngân đã tạm dừng. Nhấn nút bên dưới để vào phòng đối chất 3 bên và gửi bằng chứng cho Admin phân xử.
                </p>
              </div>
              <button onClick={() => navigate(`/contracts/${c.id}/dispute`)}
                className="w-full py-3.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                <Shield size={15}/> Vào phòng giải quyết tranh chấp
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Root Page ───────────────────────────────────────────────────────────────
export default function ContractsPage() {
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
    } catch {
      toast.error('Không thể tải danh sách hợp đồng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchContracts(); }, []);

  const orderContracts = contracts.filter(c => c.orderId != null);
  const projectContracts = contracts.filter(c => c.projectId != null || c.orderId == null);

  const title = selected
    ? (selected.projectName || selected.orderCode || selected.contractNumber)
    : 'Hợp đồng & Thi công';

  return (
    <Layout title={title}>
      <div className="max-w-4xl mx-auto space-y-4">
        {!selected ? (
          <>
            {/* Main Tabs switcher */}
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

            <ContractListView
              contracts={activeMainTab === 'orders' ? orderContracts : projectContracts}
              loading={loading}
              onSelect={setSelected}
              onRefresh={fetchContracts}
            />
          </>
        ) : (
          <ContractDetailView
            contract={selected}
            onBack={() => setSelected(null)}
          />
        )}
      </div>
    </Layout>
  );
}
