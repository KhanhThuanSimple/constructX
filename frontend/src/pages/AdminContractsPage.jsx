import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import {
  FileText, CheckCircle, Clock, XCircle, Search, User as UserIcon,
  ChevronRight, ChevronLeft, ShieldCheck, DollarSign, Lock, Unlock,
  BadgeCheck, X, Save, PenLine, AlertCircle, ArrowLeft, Users,
  Calendar, Banknote, TrendingUp, Eye, RefreshCw, Loader2
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const fmt = (n) =>
  n == null ? '—' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n).replace('₫', 'đ');

const STATUS_CONFIG = {
  PENDING_REVIEW:    { label: 'Chờ duyệt',    color: 'bg-amber-100 text-amber-700 border-amber-200',   dot: 'bg-amber-400' },
  WAITING_SIGNATURE: { label: 'Chờ ký',        color: 'bg-blue-100 text-blue-700 border-blue-200',     dot: 'bg-blue-400'  },
  ACTIVE:            { label: 'Đang thi công', color: 'bg-green-100 text-green-700 border-green-200',  dot: 'bg-green-400' },
  COMPLETED:         { label: 'Hoàn thành',    color: 'bg-teal-100 text-teal-700 border-teal-200',     dot: 'bg-teal-400'  },
  CANCELLED:         { label: 'Đã hủy',        color: 'bg-red-100 text-red-600 border-red-200',        dot: 'bg-red-400'   },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── View 1: Danh sách Users có hợp đồng ────────────────────────────────────
function UserListView({ onSelectUser }) {
  const [allContracts, setAllContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    api.get('/admin/contracts?status=all')
      .then(r => setAllContracts(r.data.data || []))
      .catch(() => toast.error('Không thể tải dữ liệu'))
      .finally(() => setLoading(false));
  }, []);

  // Group by user (clientId hoặc contractorId)
  const userMap = {};
  allContracts.forEach(c => {
    // Nhóm theo Khách hàng
    const cKey = `CLIENT_${c.clientId}`;
    if (!userMap[cKey]) userMap[cKey] = { id: c.clientId, name: c.clientName, role: 'CUSTOMER', contracts: [] };
    userMap[cKey].contracts.push(c);
    // Nhóm theo Nhà thầu
    const tKey = `CONTRACTOR_${c.contractorId}`;
    if (!userMap[tKey]) userMap[tKey] = { id: c.contractorId, name: c.contractorName, role: 'CONTRACTOR', contracts: [] };
    userMap[tKey].contracts.push(c);
  });

  let users = Object.values(userMap);
  if (roleFilter !== 'all') users = users.filter(u => u.role === roleFilter);
  if (search.trim()) {
    const s = search.toLowerCase();
    users = users.filter(u => u.name?.toLowerCase().includes(s));
  }

  const totalStats = {
    PENDING_REVIEW: allContracts.filter(c => c.status === 'PENDING_REVIEW').length,
    ACTIVE: allContracts.filter(c => c.status === 'ACTIVE').length,
    COMPLETED: allContracts.filter(c => c.status === 'COMPLETED').length,
    CANCELLED: allContracts.filter(c => c.status === 'CANCELLED').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Chờ duyệt',    value: totalStats.PENDING_REVIEW, color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-100' },
          { label: 'Đang thi công',value: totalStats.ACTIVE,          color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-100' },
          { label: 'Hoàn thành',   value: totalStats.COMPLETED,       color: 'text-teal-600',   bg: 'bg-teal-50',   border: 'border-teal-100'  },
          { label: 'Đã hủy',       value: totalStats.CANCELLED,       color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-100'   },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-4`}>
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={15} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên người dùng..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary" />
        </div>
        <div className="flex gap-2">
          {[{ k: 'all', l: 'Tất cả' }, { k: 'CUSTOMER', l: 'Khách hàng' }, { k: 'CONTRACTOR', l: 'Nhà thầu' }].map(r => (
            <button key={r.k} onClick={() => setRoleFilter(r.k)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                roleFilter === r.k ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}>
              {r.l}
            </button>
          ))}
        </div>
      </div>

      {/* User cards grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-primary" /></div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <Users size={36} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400">Không tìm thấy người dùng nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map(u => {
            const active = u.contracts.filter(c => c.status === 'ACTIVE').length;
            const pending = u.contracts.filter(c => c.status === 'PENDING_REVIEW').length;
            const totalValue = u.contracts.reduce((s, c) => s + (c.agreedPrice || 0), 0);
            return (
              <button key={`${u.role}_${u.id}`} onClick={() => onSelectUser(u)}
                className="bg-white border border-gray-100 rounded-2xl p-5 text-left hover:border-primary hover:shadow-md hover:shadow-primary/5 transition-all group">
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${
                    u.role === 'CUSTOMER' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                  }`}>
                    {u.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{u.name}</p>
                    <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                      u.role === 'CUSTOMER' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {u.role === 'CUSTOMER' ? 'Khách hàng' : 'Nhà thầu'}
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-primary transition-colors mt-1 shrink-0" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 rounded-xl py-2">
                    <p className="text-base font-black text-gray-800">{u.contracts.length}</p>
                    <p className="text-[10px] text-gray-400">Tổng HĐ</p>
                  </div>
                  <div className={`rounded-xl py-2 ${active > 0 ? 'bg-green-50' : 'bg-gray-50'}`}>
                    <p className={`text-base font-black ${active > 0 ? 'text-green-600' : 'text-gray-400'}`}>{active}</p>
                    <p className="text-[10px] text-gray-400">Đang TK</p>
                  </div>
                  <div className={`rounded-xl py-2 ${pending > 0 ? 'bg-amber-50' : 'bg-gray-50'}`}>
                    <p className={`text-base font-black ${pending > 0 ? 'text-amber-600' : 'text-gray-400'}`}>{pending}</p>
                    <p className="text-[10px] text-gray-400">Chờ duyệt</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-[11px] text-gray-400">Tổng giá trị hợp đồng</p>
                  <p className="font-black text-primary text-sm">{fmt(totalValue)}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── View 2: Danh sách hợp đồng của 1 user ──────────────────────────────────
function UserContractsView({ user, onBack, onSelectContract }) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = user.contracts.filter(c => {
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchSearch = !search.trim() || [c.projectName, c.orderCode, c.contractNumber, c.clientName, c.contractorName]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()));
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <button onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors group">
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        Quay lại danh sách
      </button>

      {/* User header */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-xl shrink-0 ${
          user.role === 'CUSTOMER' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
        }`}>
          {user.name?.charAt(0) || 'U'}
        </div>
        <div>
          <p className="font-black text-gray-900 text-lg">{user.name}</p>
          <span className={`inline-flex text-xs font-bold px-2.5 py-0.5 rounded-full ${
            user.role === 'CUSTOMER' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
          }`}>
            {user.role === 'CUSTOMER' ? '👤 Khách hàng' : '🔨 Nhà thầu'}
          </span>
        </div>
        <div className="ml-auto text-right">
          <p className="text-2xl font-black text-primary">{user.contracts.length}</p>
          <p className="text-xs text-gray-400">hợp đồng</p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={15} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm hợp đồng..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none focus:border-primary">
          <option value="all">Tất cả trạng thái</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Contract list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
          <FileText size={32} className="mx-auto text-gray-200 mb-2" />
          <p className="text-gray-400 text-sm">Không có hợp đồng phù hợp</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <button key={c.id} onClick={() => onSelectContract(c)}
              className="w-full bg-white border border-gray-100 rounded-2xl p-5 text-left hover:border-primary hover:shadow-md hover:shadow-primary/5 transition-all group">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <StatusBadge status={c.status} />
                    <span className="text-[10px] text-gray-400 font-mono">{c.contractNumber}</span>
                    {c.orderCode && !c.projectName && (
                      <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full font-bold">📦 {c.orderCode}</span>
                    )}
                  </div>
                  <p className="font-bold text-gray-900 truncate">{c.projectName || c.orderCode || c.contractNumber}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {user.role === 'CUSTOMER' ? `Nhà thầu: ${c.contractorName}` : `Khách hàng: ${c.clientName}`}
                    {' · '}{new Date(c.createdAt).toLocaleDateString('vi-VN')}
                  </p>
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
          ))}
        </div>
      )}
    </div>
  );
}

// ─── View 3: Chi tiết hợp đồng ──────────────────────────────────────────────
function ContractDetailView({ contract: initialContract, onBack }) {
  const [contract, setContract] = useState(initialContract);
  const [disbursements, setDisbursements] = useState([]);
  const [loadingDisbs, setLoadingDisbs] = useState(false);
  const [processing, setProcessing] = useState(null);
  const [editingTerms, setEditingTerms] = useState(false);
  const [termsValue, setTermsValue] = useState(contract.terms || '');
  const [noteModal, setNoteModal] = useState(null); // { action: 'approve'|'reject'|'complete' }
  const [noteValue, setNoteValue] = useState('');
  const [verifyModal, setVerifyModal] = useState(null);
  const [verifyNote, setVerifyNote] = useState('');
  const [activeSection, setActiveSection] = useState('info');

  const refresh = useCallback(async () => {
    try {
      const [cRes, dRes] = await Promise.all([
        api.get(`/admin/contracts?status=all`),
        api.get(`/contracts/${contract.id}/disbursements`),
      ]);
      const updated = (cRes.data.data || []).find(c => c.id === contract.id);
      if (updated) setContract(updated);
      setDisbursements(dRes.data.data || []);
    } catch {}
  }, [contract.id]);

  useEffect(() => {
    setLoadingDisbs(true);
    api.get(`/contracts/${contract.id}/disbursements`)
      .then(r => setDisbursements(r.data.data || []))
      .finally(() => setLoadingDisbs(false));
  }, [contract.id]);

  const handleApprove = async () => {
    setProcessing('approve');
    try {
      await api.post(`/admin/contracts/${contract.id}/approve`, { note: noteValue });
      toast.success('Đã phê duyệt hợp đồng');
      setNoteModal(null); setNoteValue('');
      await refresh();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
    finally { setProcessing(null); }
  };

  const handleReject = async () => {
    if (!noteValue.trim()) return toast.error('Vui lòng nhập lý do');
    setProcessing('reject');
    try {
      await api.post(`/admin/contracts/${contract.id}/reject`, { note: noteValue });
      toast.success('Đã từ chối hợp đồng');
      setNoteModal(null); setNoteValue('');
      await refresh();
    } catch { toast.error('Lỗi khi từ chối'); }
    finally { setProcessing(null); }
  };

  const handleComplete = async () => {
    setProcessing('complete');
    try {
      await api.post(`/admin/contracts/${contract.id}/complete`, { note: noteValue });
      toast.success('✅ Xác nhận hoàn công thành công');
      setNoteModal(null); setNoteValue('');
      await refresh();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
    finally { setProcessing(null); }
  };

  const handleReleaseWarranty = async () => {
    if (!window.confirm('Giải ngân 5% bảo hành cho nhà thầu?')) return;
    setProcessing('warranty');
    try {
      await api.post(`/admin/contracts/${contract.id}/release-warranty`, {});
      toast.success('✅ Đã giải ngân bảo hành');
      await refresh();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
    finally { setProcessing(null); }
  };

  const handleSaveTerms = async () => {
    setProcessing('terms');
    try {
      await api.put(`/admin/contracts/${contract.id}/terms`, { terms: termsValue, note: 'Admin chỉnh sửa điều khoản' });
      toast.success('Đã lưu điều khoản');
      setEditingTerms(false);
      await refresh();
    } catch { toast.error('Lỗi khi lưu'); }
    finally { setProcessing(null); }
  };

  const handleAdminVerify = async () => {
    if (!verifyModal) return;
    setProcessing(`verify_${verifyModal.id}`);
    try {
      await api.post(`/disbursements/${verifyModal.id}/admin-verify`, { note: verifyNote });
      toast.success('✅ Đã xác nhận giải ngân');
      setVerifyModal(null);
      await refresh();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
    finally { setProcessing(null); }
  };

  const st = STATUS_CONFIG[contract.status] || {};
  const totalDisbursed = disbursements.filter(d => d.status === 'APPROVED').reduce((s, d) => s + (d.amount || 0), 0);
  const pendingDisbs = disbursements.filter(d => d.status === 'PENDING' && !d.adminVerified);

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <button onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors group">
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        Quay lại danh sách hợp đồng
      </button>

      {/* Contract hero card */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-stretch">
          <div className={`w-1.5 shrink-0 ${st.dot?.replace('bg-', 'bg-') || 'bg-gray-200'}`} />
          <div className="flex-1 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <StatusBadge status={contract.status} />
                  <span className="text-xs text-gray-400 font-mono">{contract.contractNumber}</span>
                  {contract.isDisputed && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded-full animate-pulse">
                      🔒 Đóng băng tranh chấp
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-black text-gray-900">{contract.projectName || contract.orderCode || contract.contractNumber}</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Tạo: {new Date(contract.createdAt).toLocaleString('vi-VN')}
                  {contract.approvedAt && ` · Duyệt: ${new Date(contract.approvedAt).toLocaleString('vi-VN')}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Giá trị HĐ</p>
                <p className="text-2xl font-black text-primary">{fmt(contract.agreedPrice)}</p>
                {contract.estimatedDays && <p className="text-xs text-gray-400">{contract.estimatedDays} ngày thi công</p>}
              </div>
            </div>

            {/* Parties */}
            <div className="grid grid-cols-2 gap-3 mt-5">
              {[
                { label: 'Bên A — Khách hàng', name: contract.clientName, email: contract.clientEmail, phone: contract.clientPhone, color: 'blue' },
                { label: 'Bên B — Nhà thầu',   name: contract.contractorName, email: contract.contractorEmail, phone: contract.contractorPhone, color: 'green' },
              ].map(p => (
                <div key={p.label} className={`bg-${p.color}-50/50 border border-${p.color}-100 rounded-xl p-3.5`}>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">{p.label}</p>
                  <p className="font-bold text-gray-900 text-sm">{p.name || '—'}</p>
                  {p.email && <p className="text-[11px] text-gray-400 mt-0.5">{p.email}</p>}
                  {p.phone && <p className="text-[11px] text-gray-400">{p.phone}</p>}
                </div>
              ))}
            </div>

            {/* Financial summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {[
                { label: 'Cọc khách',    value: fmt(contract.customerDepositAmount), locked: contract.customerDepositLocked },
                { label: 'Ký quỹ thầu', value: fmt(contract.contractorDepositAmount), locked: contract.contractorDepositLocked },
                { label: 'Đã giải ngân', value: fmt(totalDisbursed), locked: false },
                { label: 'Bảo hành 5%', value: fmt(contract.warrantyHoldAmount), locked: contract.warrantyHoldLocked && !contract.warrantyReleased },
              ].map(f => (
                <div key={f.label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-gray-400 font-medium">{f.label}</p>
                  <p className="font-black text-gray-800 text-sm mt-1">{f.value}</p>
                  {f.locked != null && (
                    <p className={`text-[9px] mt-0.5 font-bold flex items-center justify-center gap-1 ${f.locked ? 'text-amber-600' : 'text-green-500'}`}>
                      {f.locked ? <><Lock size={9}/>Đang khóa</> : <><Unlock size={9}/>Đã giải phóng</>}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Admin note */}
            {contract.adminNote && (
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3 mt-4 text-xs text-blue-800">
                <AlertCircle size={13} className="mt-0.5 shrink-0" />
                <span><strong>Ghi chú:</strong> {contract.adminNote}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-gray-100">
              {contract.status === 'PENDING_REVIEW' && (
                <>
                  <button onClick={() => { setNoteModal({ action: 'reject' }); setNoteValue(''); }}
                    className="flex items-center gap-1.5 text-xs font-bold border-2 border-red-300 text-red-600 px-4 py-2.5 rounded-xl hover:bg-red-50 transition-colors">
                    <XCircle size={14} /> Từ chối
                  </button>
                  <button onClick={() => { setNoteModal({ action: 'approve' }); setNoteValue(''); }}
                    className="flex items-center gap-1.5 text-xs font-bold bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors">
                    <CheckCircle size={14} /> Phê duyệt hợp đồng
                  </button>
                </>
              )}
              {contract.status === 'ACTIVE' && (
                <button onClick={() => { setNoteModal({ action: 'complete' }); setNoteValue(''); }}
                  className="flex items-center gap-1.5 text-xs font-bold bg-teal-600 text-white px-5 py-2.5 rounded-xl hover:bg-teal-700 transition-colors">
                  <CheckCircle size={14} /> Xác nhận hoàn công
                </button>
              )}
              {contract.status === 'COMPLETED' && contract.warrantyHoldLocked && !contract.warrantyReleased && (
                <button onClick={handleReleaseWarranty} disabled={processing === 'warranty'}
                  className="flex items-center gap-1.5 text-xs font-bold bg-amber-500 text-white px-5 py-2.5 rounded-xl hover:bg-amber-600 disabled:opacity-60 transition-colors">
                  🔓 {processing === 'warranty' ? 'Đang xử lý...' : `Giải ngân bảo hành (${fmt(contract.warrantyHoldAmount)})`}
                </button>
              )}
              {contract.status === 'COMPLETED' && contract.warrantyReleased && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-teal-600 bg-teal-50 px-4 py-2.5 rounded-xl border border-teal-200">
                  ✅ Đã giải ngân bảo hành
                </span>
              )}
              {pendingDisbs.length > 0 && (
                <button onClick={() => setActiveSection('disbursements')}
                  className="flex items-center gap-1.5 text-xs font-bold border border-amber-300 text-amber-700 px-4 py-2.5 rounded-xl hover:bg-amber-50 transition-colors">
                  <ShieldCheck size={13} />
                  Xác nhận giải ngân
                  <span className="bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {pendingDisbs.length}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {[
          { key: 'info',          label: 'Điều khoản & Lịch sử',  icon: <FileText size={13}/> },
          { key: 'disbursements', label: `Giải ngân${pendingDisbs.length > 0 ? ` (${pendingDisbs.length} chờ)` : ''}`, icon: <DollarSign size={13}/> },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveSection(t.key)}
            className={`flex items-center gap-1.5 flex-1 justify-center py-2.5 rounded-lg text-xs font-semibold transition-all ${
              activeSection === t.key ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Section: Điều khoản & Lịch sử */}
      {activeSection === 'info' && (
        <div className="space-y-4">
          {/* Terms */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-800 flex items-center gap-2"><FileText size={14}/> Điều khoản hợp đồng</p>
              {!editingTerms ? (
                <button onClick={() => { setEditingTerms(true); setTermsValue(contract.terms || ''); }}
                  className="text-xs font-medium text-primary flex items-center gap-1 hover:underline">
                  <PenLine size={12}/> Chỉnh sửa
                </button>
              ) : (
                <div className="flex gap-3">
                  <button onClick={() => setEditingTerms(false)} className="text-xs text-gray-500 flex items-center gap-1 hover:text-gray-800">
                    <X size={12}/> Hủy
                  </button>
                  <button onClick={handleSaveTerms} disabled={processing === 'terms'}
                    className="text-xs font-bold text-primary flex items-center gap-1 hover:underline disabled:opacity-60">
                    <Save size={12}/> {processing === 'terms' ? 'Đang lưu...' : 'Lưu'}
                  </button>
                </div>
              )}
            </div>
            <div className="p-5">
              {editingTerms ? (
                <textarea rows={10} value={termsValue} onChange={e => setTermsValue(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-xs font-mono text-gray-700 bg-gray-50 resize-none outline-none focus:border-primary" />
              ) : (
                <pre className="text-xs text-gray-700 bg-gray-50 rounded-xl p-4 whitespace-pre-wrap font-sans leading-relaxed max-h-60 overflow-y-auto">
                  {contract.terms || 'Chưa có điều khoản'}
                </pre>
              )}
            </div>
          </div>

          {/* Stage timeline */}
          {contract.stages?.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-800 flex items-center gap-2"><Clock size={14}/> Lịch sử trạng thái</p>
              </div>
              <div className="p-5 space-y-0">
                {contract.stages.map((s, i) => {
                  const sCfg = STATUS_CONFIG[s.stage] || {};
                  return (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full mt-1 shrink-0 border-2 border-white shadow ${sCfg.dot || 'bg-gray-300'}`} />
                        {i < contract.stages.length - 1 && <div className="w-0.5 flex-1 bg-gray-100 my-1" />}
                      </div>
                      <div className="pb-4 flex-1">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <StatusBadge status={s.stage} />
                          <span className="text-[10px] text-gray-400">{new Date(s.createdAt).toLocaleString('vi-VN')}</span>
                        </div>
                        {s.note && <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{s.note}</p>}
                        {s.performedBy && <p className="text-[10px] text-gray-400 mt-0.5">— {s.performedBy}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Section: Giải ngân */}
      {activeSection === 'disbursements' && (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-800 flex items-center gap-2"><ShieldCheck size={14}/> Yêu cầu giải ngân</p>
          </div>
          <div className="p-5">
            {loadingDisbs ? (
              <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-primary" /></div>
            ) : disbursements.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">Chưa có yêu cầu giải ngân nào</div>
            ) : (
              <div className="space-y-3">
                {disbursements.map(d => {
                  const needVerify = d.status === 'PENDING' && !d.adminVerified;
                  const waitCustomer = d.status === 'PENDING' && d.adminVerified;
                  return (
                    <div key={d.id} className={`rounded-xl border p-4 ${
                      needVerify ? 'border-amber-200 bg-amber-50/30' :
                      waitCustomer ? 'border-blue-200 bg-blue-50/20' :
                      d.status === 'APPROVED' ? 'border-green-200 bg-green-50/20' : 'border-gray-100 opacity-70'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex flex-wrap gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold">
                              {d.phaseLabel} · {d.phaseThreshold}%
                            </span>
                            {needVerify && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold flex items-center gap-1"><ShieldCheck size={9}/>Chờ Admin xác nhận</span>}
                            {waitCustomer && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold flex items-center gap-1"><Clock size={9}/>Chờ khách duyệt</span>}
                            {d.status === 'APPROVED' && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold flex items-center gap-1"><BadgeCheck size={9}/>Đã giải ngân</span>}
                            {(d.status === 'REJECTED' || d.status === 'CANCELLED') && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold">{d.status}</span>}
                          </div>
                          <p className="text-[11px] text-gray-500">Tiến độ khi gửi: {d.progressAtRequest}% · {new Date(d.createdAt).toLocaleString('vi-VN')}</p>
                          {d.note && <p className="text-xs text-gray-500 mt-1">📝 {d.note}</p>}
                          {d.rejectReason && <p className="text-xs text-red-600 mt-1">❌ {d.rejectReason}</p>}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-black text-primary">{fmt(d.amount)}</p>
                          {d.status === 'APPROVED' && (
                            <div className="text-[10px] mt-1 space-y-0.5">
                              <p className="text-green-600">+{fmt(d.immediateAmount)} ngay</p>
                              {d.lockedAmount > 0 && !d.fullyUnlocked && (
                                <p className="text-amber-600 flex items-center gap-1 justify-end"><Lock size={9}/>{fmt(d.lockedAmount)}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {needVerify && (
                        <button onClick={() => { setVerifyModal(d); setVerifyNote(''); }}
                          disabled={processing === `verify_${d.id}`}
                          className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 disabled:opacity-60 transition-colors">
                          <ShieldCheck size={13}/> {processing === `verify_${d.id}` ? 'Đang xử lý...' : 'Xác nhận hợp lệ'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal: Phê duyệt / Từ chối / Hoàn công ── */}
      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center ${
                noteModal.action === 'reject' ? 'bg-red-50' : noteModal.action === 'complete' ? 'bg-teal-50' : 'bg-green-50'
              }`}>
                {noteModal.action === 'reject' ? <XCircle size={22} className="text-red-500"/> :
                 noteModal.action === 'complete' ? <CheckCircle size={22} className="text-teal-500"/> :
                 <CheckCircle size={22} className="text-green-500"/>}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  {noteModal.action === 'reject' ? 'Từ chối hợp đồng' :
                   noteModal.action === 'complete' ? 'Xác nhận hoàn công' : 'Phê duyệt hợp đồng'}
                </h3>
                <p className="text-xs text-gray-400">{contract.contractNumber}</p>
              </div>
            </div>
            <textarea rows={3} value={noteValue} onChange={e => setNoteValue(e.target.value)}
              placeholder={noteModal.action === 'reject' ? 'Lý do từ chối (bắt buộc)...' : 'Ghi chú cho hai bên (không bắt buộc)...'}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-primary resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => { setNoteModal(null); setNoteValue(''); }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">
                Hủy
              </button>
              <button
                onClick={noteModal.action === 'reject' ? handleReject : noteModal.action === 'complete' ? handleComplete : handleApprove}
                disabled={!!processing}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60 transition-colors ${
                  noteModal.action === 'reject' ? 'bg-red-500 hover:bg-red-600' :
                  noteModal.action === 'complete' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-primary hover:bg-primary/90'
                }`}>
                {processing ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Admin verify giải ngân ── */}
      {verifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-amber-50 flex items-center justify-center">
                <ShieldCheck size={22} className="text-amber-500"/>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Xác nhận yêu cầu giải ngân</h3>
                <p className="text-xs text-gray-400">{verifyModal.phaseLabel} · {fmt(verifyModal.amount)}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-3">Sau khi xác nhận, thông báo sẽ gửi đến khách hàng để duyệt.</p>
            <textarea rows={2} value={verifyNote} onChange={e => setVerifyNote(e.target.value)}
              placeholder="Ghi chú xác nhận (không bắt buộc)..."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-primary resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setVerifyModal(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">Hủy</button>
              <button onClick={handleAdminVerify} disabled={!!processing}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold disabled:opacity-60">
                {processing ? 'Đang xử lý...' : '✅ Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Root Page ───────────────────────────────────────────────────────────────
export default function AdminContractsPage() {
  // 3-level navigation state
  const [view, setView] = useState('users');         // 'users' | 'contracts' | 'detail'
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setView('contracts');
  };

  const handleSelectContract = (contract) => {
    setSelectedContract(contract);
    setView('detail');
  };

  const handleBackToUsers = () => {
    setSelectedUser(null);
    setView('users');
  };

  const handleBackToContracts = () => {
    setSelectedContract(null);
    setView('contracts');
  };

  // Breadcrumb
  const breadcrumb = (
    <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
      <button onClick={handleBackToUsers}
        className={`hover:text-primary transition-colors font-medium ${view === 'users' ? 'text-primary font-bold' : ''}`}>
        Người dùng
      </button>
      {view !== 'users' && (
        <>
          <ChevronRight size={12} />
          <button onClick={handleBackToContracts}
            className={`hover:text-primary transition-colors font-medium ${view === 'contracts' ? 'text-primary font-bold' : ''}`}>
            {selectedUser?.name}
          </button>
        </>
      )}
      {view === 'detail' && (
        <>
          <ChevronRight size={12} />
          <span className="text-primary font-bold truncate max-w-[200px]">
            {selectedContract?.projectName || selectedContract?.contractNumber}
          </span>
        </>
      )}
    </div>
  );

  return (
    <Layout title="Quản lý hợp đồng">
      <div className="space-y-4">
        {/* Breadcrumb nav */}
        {breadcrumb}

        {/* Views */}
        {view === 'users' && (
          <UserListView onSelectUser={handleSelectUser} />
        )}
        {view === 'contracts' && selectedUser && (
          <UserContractsView
            user={selectedUser}
            onBack={handleBackToUsers}
            onSelectContract={handleSelectContract}
          />
        )}
        {view === 'detail' && selectedContract && (
          <ContractDetailView
            contract={selectedContract}
            onBack={handleBackToContracts}
          />
        )}
      </div>
    </Layout>
  );
}
