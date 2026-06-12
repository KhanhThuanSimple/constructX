import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  FileText, CheckCircle, Clock, XCircle, PenLine,
  ChevronDown, ChevronUp, Save, X, AlertCircle,
  User as UserIcon, Search, ShieldCheck, DollarSign,
  Lock, Unlock, BadgeCheck
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const fmt = (n) =>
  n == null ? '—' :
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n).replace('₫', 'đ');

const STATUS_CONFIG = {
  PENDING_REVIEW:    { label: 'Chờ duyệt',   cls: 'badge-amber' },
  WAITING_SIGNATURE: { label: 'Chờ ký',       cls: 'badge-blue'  },
  ACTIVE:            { label: 'Đang thi công', cls: 'badge-green' },
  COMPLETED:         { label: 'Hoàn thành',    cls: 'badge-blue'  },
  CANCELLED:         { label: 'Đã hủy',        cls: 'badge-red'   },
};

export default function AdminContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [editingTerms, setEditingTerms] = useState(null);
  const [termsValue, setTermsValue] = useState('');
  const [noteModal, setNoteModal] = useState(null);
  const [noteValue, setNoteValue] = useState('');
  const [processing, setProcessing] = useState(null);
  // Disbursements cần Admin xác nhận (pending verify)
  const [pendingDisbs, setPendingDisbs] = useState({});   // { contractId: [disb] }
  const [loadingDisbs, setLoadingDisbs] = useState({});
  const [disbExpanded, setDisbExpanded] = useState(null); // contractId đang mở panel
  const [verifyModal, setVerifyModal] = useState(null);   // { disbId, contractId }
  const [verifyNote, setVerifyNote] = useState('');

  useEffect(() => { fetchContracts(); }, [statusFilter]);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/contracts?status=${statusFilter}`);
      setContracts(res.data.data || []);
    } catch {
      toast.error('Không thể tải hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setProcessing(noteModal.id);
    try {
      await api.post(`/admin/contracts/${noteModal.id}/approve`, { note: noteValue });
      toast.success('Đã phê duyệt hợp đồng. Thông báo gửi đến hai bên.');
      setNoteModal(null); setNoteValue('');
      fetchContracts();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi khi duyệt');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!noteValue.trim()) { toast.error('Vui lòng nhập lý do từ chối'); return; }
    setProcessing(noteModal.id);
    try {
      await api.post(`/admin/contracts/${noteModal.id}/reject`, { note: noteValue });
      toast.success('Đã từ chối hợp đồng');
      setNoteModal(null); setNoteValue('');
      fetchContracts();
    } catch {
      toast.error('Lỗi khi từ chối');
    } finally {
      setProcessing(null);
    }
  };

  const handleComplete = async () => {
    setProcessing(noteModal.id);
    try {
      await api.post(`/admin/contracts/${noteModal.id}/complete`, { note: noteValue });
      toast.success('✅ Xác nhận hoàn công! Đã giải ngân 95%, giữ 5% bảo hành 6 tháng.');
      setNoteModal(null); setNoteValue('');
      fetchContracts();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi khi xác nhận hoàn công');
    } finally {
      setProcessing(null);
    }
  };

  const handleReleaseWarranty = async (contractId) => {
    if (!window.confirm('Giải ngân 5% tiền bảo hành cho nhà thầu?\nHành động này không thể hoàn tác.')) return;
    setProcessing(contractId);
    try {
      await api.post(`/admin/contracts/${contractId}/release-warranty`, {});
      toast.success('✅ Đã giải ngân tiền bảo hành cho nhà thầu.');
      fetchContracts();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi khi giải ngân bảo hành');
    } finally {
      setProcessing(null);
    }
  };

  // ── Disbursement admin verify ────────────────────────────────────────────

  const toggleDisbPanel = async (contractId) => {
    if (disbExpanded === contractId) { setDisbExpanded(null); return; }
    setDisbExpanded(contractId);
    if (pendingDisbs[contractId]) return; // đã load rồi
    setLoadingDisbs(prev => ({ ...prev, [contractId]: true }));
    try {
      const res = await api.get(`/contracts/${contractId}/disbursements`);
      const all = res.data.data || [];
      // Chỉ giữ PENDING (chưa approve/reject)
      setPendingDisbs(prev => ({ ...prev, [contractId]: all }));
    } catch {
      toast.error('Không thể tải yêu cầu giải ngân');
    } finally {
      setLoadingDisbs(prev => ({ ...prev, [contractId]: false }));
    }
  };

  const refreshDisbs = async (contractId) => {
    setLoadingDisbs(prev => ({ ...prev, [contractId]: true }));
    try {
      const res = await api.get(`/contracts/${contractId}/disbursements`);
      setPendingDisbs(prev => ({ ...prev, [contractId]: res.data.data || [] }));
    } catch {}
    finally { setLoadingDisbs(prev => ({ ...prev, [contractId]: false })); }
  };

  const openVerifyModal = (disbId, contractId) => {
    setVerifyModal({ disbId, contractId });
    setVerifyNote('');
  };

  const confirmAdminVerify = async () => {
    if (!verifyModal) return;
    setProcessing(verifyModal.disbId);
    try {
      await api.post(`/disbursements/${verifyModal.disbId}/admin-verify`, { note: verifyNote });
      toast.success('✅ Đã xác nhận! Thông báo gửi đến khách hàng để duyệt.');
      setVerifyModal(null);
      refreshDisbs(verifyModal.contractId);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi xác nhận');
    } finally {
      setProcessing(null);
    }
  };

  const handleSaveTerms = async (contractId) => {
    setProcessing(contractId);
    try {
      await api.put(`/admin/contracts/${contractId}/terms`, {
        terms: termsValue,
        note: 'Admin đã chỉnh sửa điều khoản'
      });
      toast.success('Đã lưu điều khoản');
      setEditingTerms(null);
      fetchContracts();
    } catch {
      toast.error('Lỗi khi lưu');
    } finally {
      setProcessing(null);
    }
  };

  const filtered = contracts.filter(c =>
    c.projectName?.toLowerCase().includes(search.toLowerCase()) ||
    c.orderCode?.toLowerCase().includes(search.toLowerCase()) ||
    c.clientName?.toLowerCase().includes(search.toLowerCase()) ||
    c.contractorName?.toLowerCase().includes(search.toLowerCase()) ||
    c.contractNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = Object.fromEntries(
    Object.keys(STATUS_CONFIG).map(k => [k, contracts.filter(c => c.status === k).length])
  );

  return (
    <Layout title="Quản lý hợp đồng">
      <div className="space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <button key={k}
              onClick={() => setStatusFilter(statusFilter === k ? 'all' : k)}
              className={`bg-white rounded-xl border p-3 text-center transition-all ${
                statusFilter === k ? 'border-primary shadow-md shadow-primary/10' : 'border-gray-100 shadow-sm hover:border-gray-200'
              }`}
            >
              <p className="text-xs text-gray-500 mb-1 truncate">{v.label}</p>
              <p className={`text-2xl font-bold ${statusFilter === k ? 'text-primary' : 'text-gray-900'}`}>{stats[k] || 0}</p>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input type="text" placeholder="Tìm theo dự án, khách hàng, nhà thầu..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white outline-none focus:border-primary">
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        {/* Contracts list */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
            <FileText size={36} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400">Không có hợp đồng nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(c => {
              const st = STATUS_CONFIG[c.status] || {};
              const isExp = expanded === c.id;
              const isEditingThis = editingTerms === c.id;

              return (
                <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`badge ${st.cls}`}>{st.label}</span>
                          <span className="text-xs font-mono text-gray-400">{c.contractNumber}</span>
                        </div>
                        <h3 className="font-bold text-gray-900">{c.projectName || c.orderCode || c.contractNumber}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {c.orderCode && !c.projectName && (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 text-[10px] font-bold mr-1">
                              📦 Đơn {c.orderCode}
                            </span>
                          )}
                          Tạo: {new Date(c.createdAt).toLocaleString('vi-VN')}
                          {c.approvedAt && ` · Duyệt: ${new Date(c.approvedAt).toLocaleDateString('vi-VN')}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Giá trị</p>
                        <p className="text-xl font-bold text-primary">{fmt(c.agreedPrice)}</p>
                        {c.estimatedDays && <p className="text-xs text-gray-400">{c.estimatedDays} ngày</p>}
                      </div>
                    </div>

                    {/* Parties */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {[['Bên A — Khách hàng', c.clientName], ['Bên B — Nhà thầu', c.contractorName]].map(([label, name]) => (
                        <div key={label} className="bg-gray-50 rounded-xl p-3">
                          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">{label}</p>
                          <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                            <UserIcon size={13} className="text-gray-400" /> {name}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Admin note */}
                    {c.adminNote && (
                      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 text-xs text-blue-800">
                        <AlertCircle size={13} className="mt-0.5 shrink-0" />
                        <span><strong>Ghi chú:</strong> {c.adminNote}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 items-center justify-between">
                      <div className="flex gap-2 items-center">
                        <button onClick={() => setExpanded(isExp ? null : c.id)}
                          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
                          {isExp ? <><ChevronUp size={15}/> Ẩn</> : <><ChevronDown size={15}/> Chi tiết & Điều khoản</>}
                        </button>
                        {/* Nút xem giải ngân cho HĐ ACTIVE */}
                        {c.status === 'ACTIVE' && (
                          <button
                            onClick={() => toggleDisbPanel(c.id)}
                            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors ${
                              disbExpanded === c.id
                                ? 'bg-amber-500 text-white border-amber-500'
                                : 'border-amber-300 text-amber-700 hover:bg-amber-50'
                            }`}
                          >
                            <ShieldCheck size={13}/>
                            Yêu cầu giải ngân
                            {pendingDisbs[c.id]?.filter(d => d.status === 'PENDING' && !d.adminVerified).length > 0 && (
                              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {pendingDisbs[c.id].filter(d => d.status === 'PENDING' && !d.adminVerified).length}
                              </span>
                            )}
                          </button>
                        )}
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {c.status === 'PENDING_REVIEW' && (
                          <>
                            <button onClick={() => { setNoteModal({ id: c.id, action: 'reject' }); setNoteValue(''); }}
                              className="flex items-center gap-1.5 text-xs font-bold border-2 border-red-300 text-red-600 px-4 py-2 rounded-xl hover:bg-red-50 transition-colors">
                              <XCircle size={14}/> Từ chối
                            </button>
                            <button onClick={() => { setNoteModal({ id: c.id, action: 'approve' }); setNoteValue(''); }}
                              className="flex items-center gap-1.5 text-xs font-bold bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary-light transition-colors">
                              <CheckCircle size={14}/> Phê duyệt
                            </button>
                          </>
                        )}
                        {/* Xác nhận hoàn công — chỉ khi ACTIVE */}
                        {c.status === 'ACTIVE' && (
                          <button onClick={() => { setNoteModal({ id: c.id, action: 'complete' }); setNoteValue(''); }}
                            className="flex items-center gap-1.5 text-xs font-bold bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors">
                            <CheckCircle size={14}/> Xác nhận hoàn công
                          </button>
                        )}                        {/* Giải ngân bảo hành 5% — chỉ khi COMPLETED + còn locked */}
                        {c.status === 'COMPLETED' && c.warrantyHoldLocked && !c.warrantyReleased && (
                          <div className="flex flex-col items-end gap-1">
                            <button onClick={() => handleReleaseWarranty(c.id)} disabled={processing === c.id}
                              className="flex items-center gap-1.5 text-xs font-bold bg-amber-500 text-white px-4 py-2 rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-60">
                              🔓 {processing === c.id ? 'Đang xử lý...' : `Giải ngân bảo hành (${fmt(c.warrantyHoldAmount)})`}
                            </button>
                            {c.warrantyEndDate && (
                              <p className="text-[10px] text-amber-600">
                                Hết bảo hành: {new Date(c.warrantyEndDate).toLocaleDateString('vi-VN')}
                              </p>
                            )}
                          </div>
                        )}
                        {/* Đã giải ngân bảo hành xong */}
                        {c.status === 'COMPLETED' && c.warrantyReleased && (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-3 py-2 rounded-xl border border-green-200">
                            ✅ Đã giải ngân bảo hành
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Panel: Yêu cầu giải ngân (ACTIVE contracts) ── */}
                  {c.status === 'ACTIVE' && disbExpanded === c.id && (
                    <div className="border-t border-amber-100 bg-amber-50/40 p-5">
                      <p className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-3 flex items-center gap-1.5">
                        <ShieldCheck size={13}/> Yêu cầu giải ngân từ nhà thầu
                      </p>
                      {loadingDisbs[c.id] ? (
                        <p className="text-xs text-gray-400 py-4 text-center">Đang tải...</p>
                      ) : !pendingDisbs[c.id] || pendingDisbs[c.id].length === 0 ? (
                        <p className="text-xs text-gray-400 py-4 text-center">Chưa có yêu cầu giải ngân nào.</p>
                      ) : (
                        <div className="space-y-3">
                          {pendingDisbs[c.id].map(d => {
                            const needVerify = d.status === 'PENDING' && !d.adminVerified;
                            const waitCustomer = d.status === 'PENDING' && d.adminVerified;
                            const approved = d.status === 'APPROVED';
                            const rejected = d.status === 'REJECTED' || d.status === 'CANCELLED';
                            return (
                              <div key={d.id} className={`rounded-xl border p-4 bg-white ${
                                needVerify   ? 'border-amber-300' :
                                waitCustomer ? 'border-blue-200' :
                                approved     ? 'border-green-200' : 'border-gray-100 opacity-60'
                              }`}>
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      {needVerify && (
                                        <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold">
                                          <ShieldCheck size={10}/> Chờ Admin xác nhận
                                        </span>
                                      )}
                                      {waitCustomer && (
                                        <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold">
                                          <Clock size={10}/> Chờ khách duyệt
                                        </span>
                                      )}
                                      {approved && (
                                        <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">
                                          <BadgeCheck size={10}/> Đã giải ngân
                                        </span>
                                      )}
                                      {rejected && (
                                        <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold">
                                          <X size={10}/> {d.status}
                                        </span>
                                      )}
                                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px]">
                                        {d.phaseLabel} ({d.phaseThreshold}%)
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                      Tiến độ lúc gửi: {d.progressAtRequest}% •{' '}
                                      {new Date(d.createdAt).toLocaleString('vi-VN')}
                                    </p>
                                    {d.note && <p className="text-xs text-gray-500 mt-1">📝 {d.note}</p>}
                                    {d.adminVerifyNote && (
                                      <p className="text-xs text-amber-700 mt-1">
                                        ✅ Ghi chú Admin: {d.adminVerifyNote}
                                      </p>
                                    )}
                                    {d.rejectReason && (
                                      <p className="text-xs text-red-600 mt-1">❌ {d.rejectReason}</p>
                                    )}
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="font-bold text-primary">{fmt(d.amount)}</p>
                                    {approved && (
                                      <div className="text-[10px] mt-0.5 space-y-0.5">
                                        <p className="text-green-600">+{fmt(d.immediateAmount)} ngay</p>
                                        {d.lockedAmount > 0 && !d.fullyUnlocked && (
                                          <p className="text-amber-600 flex items-center gap-1 justify-end">
                                            <Lock size={9}/>{fmt(d.lockedAmount)}
                                          </p>
                                        )}
                                        {d.fullyUnlocked && (
                                          <p className="text-gray-400 flex items-center gap-1 justify-end">
                                            <Unlock size={9}/>Đã unlock
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {/* Action: chỉ khi cần verify */}
                                {needVerify && (
                                  <button
                                    onClick={() => openVerifyModal(d.id, c.id)}
                                    disabled={processing === d.id}
                                    className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 disabled:opacity-60"
                                  >
                                    <ShieldCheck size={13}/>
                                    {processing === d.id ? 'Đang xử lý...' : 'Xác nhận hợp lệ'}
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Expanded */}
                  {isExp && (
                    <div className="border-t border-gray-100">
                      {/* Terms editor */}
                      <div className="p-5 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                            <FileText size={13}/> Điều khoản hợp đồng
                          </p>
                          <div className="flex gap-2">
                            {!isEditingThis ? (
                              <button onClick={() => { setEditingTerms(c.id); setTermsValue(c.terms || ''); }}
                                className="text-xs font-medium text-primary flex items-center gap-1 hover:underline">
                                <PenLine size={12}/> Chỉnh sửa
                              </button>
                            ) : (
                              <>
                                <button onClick={() => setEditingTerms(null)}
                                  className="text-xs text-gray-500 flex items-center gap-1 hover:text-gray-800">
                                  <X size={12}/> Hủy
                                </button>
                                <button onClick={() => handleSaveTerms(c.id)} disabled={processing === c.id}
                                  className="text-xs font-bold text-primary flex items-center gap-1 hover:underline disabled:opacity-60">
                                  <Save size={12}/> {processing === c.id ? 'Đang lưu...' : 'Lưu'}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        {isEditingThis ? (
                          <textarea rows={10} value={termsValue} onChange={e => setTermsValue(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl p-3 text-xs font-mono text-gray-700 bg-gray-50 resize-none outline-none focus:border-primary" />
                        ) : (
                          <pre className="text-xs text-gray-700 bg-gray-50 rounded-xl p-4 whitespace-pre-wrap font-sans leading-relaxed max-h-64 overflow-y-auto">
                            {c.terms || 'Chưa có điều khoản'}
                          </pre>
                        )}
                      </div>

                      {/* Stage timeline */}
                      {c.stages?.length > 0 && (
                        <div className="p-5">
                          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-1.5">
                            <Clock size={13}/> Lịch sử
                          </p>
                          <div className="space-y-3">
                            {c.stages.map((s, i) => {
                              const stCfg = STATUS_CONFIG[s.stage] || {};
                              return (
                                <div key={i} className="flex gap-3">
                                  <div className="flex flex-col items-center">
                                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                      stCfg.cls?.includes('green') ? 'bg-green-400'
                                      : stCfg.cls?.includes('amber') ? 'bg-amber-400'
                                      : stCfg.cls?.includes('blue') ? 'bg-blue-400'
                                      : stCfg.cls?.includes('red') ? 'bg-red-400' : 'bg-gray-300'
                                    }`} />
                                    {i < c.stages.length - 1 && <div className="w-px flex-1 bg-gray-200 my-1" />}
                                  </div>
                                  <div className="pb-3 flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className={`badge ${stCfg.cls || 'badge-gray'} text-[10px]`}>{stCfg.label || s.stage}</span>
                                      <span className="text-[10px] text-gray-400">
                                        {new Date(s.createdAt).toLocaleString('vi-VN')}
                                      </span>
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
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Note Modal (approve / reject) ── */}
      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                noteModal.action === 'approve' ? 'bg-green-100'
                : noteModal.action === 'complete' ? 'bg-blue-100'
                : 'bg-red-100'
              }`}>
                {noteModal.action === 'approve' && <CheckCircle size={20} className="text-green-600"/>}
                {noteModal.action === 'complete' && <CheckCircle size={20} className="text-blue-600"/>}
                {noteModal.action === 'reject'  && <XCircle size={20} className="text-red-500"/>}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  {noteModal.action === 'approve' ? 'Phê duyệt hợp đồng'
                   : noteModal.action === 'complete' ? '✅ Xác nhận hoàn công'
                   : 'Từ chối hợp đồng'}
                </h3>
                {noteModal.action === 'complete' && (
                  <p className="text-xs text-gray-500 mt-0.5">95% giải ngân ngay · 5% giữ bảo hành 6 tháng</p>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {noteModal.action === 'approve'
                ? 'Hợp đồng sẽ được gửi đến hai bên để ký kết.'
                : noteModal.action === 'complete'
                ? 'Sau khi xác nhận, hệ thống sẽ tự động giải ngân 95% cho nhà thầu và giữ 5% bảo hành trong 6 tháng.'
                : 'Vui lòng nhập lý do từ chối để thông báo các bên.'}
            </p>
            <textarea rows={3} value={noteValue} onChange={e => setNoteValue(e.target.value)}
              placeholder={
                noteModal.action === 'approve' ? 'Ghi chú thêm (không bắt buộc)...'
                : noteModal.action === 'complete' ? 'Ghi chú hoàn công (không bắt buộc)...'
                : 'Lý do từ chối... *'
              }
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-primary resize-none mb-4"/>
            <div className="flex gap-3">
              <button onClick={() => { setNoteModal(null); setNoteValue(''); }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">
                Hủy
              </button>
              <button
                onClick={
                  noteModal.action === 'approve' ? handleApprove
                  : noteModal.action === 'complete' ? handleComplete
                  : handleReject
                }
                disabled={processing === noteModal.id}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60 transition-colors ${
                  noteModal.action === 'approve' ? 'bg-primary hover:bg-primary-light'
                  : noteModal.action === 'complete' ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {processing === noteModal.id ? 'Đang xử lý...'
                  : noteModal.action === 'approve' ? 'Xác nhận duyệt'
                  : noteModal.action === 'complete' ? 'Xác nhận hoàn công'
                  : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Admin xác nhận yêu cầu giải ngân ── */}
      {verifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <ShieldCheck size={20} className="text-amber-600"/>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Xác nhận yêu cầu giải ngân</h3>
                <p className="text-xs text-gray-500 mt-0.5">Sau xác nhận, thông báo gửi đến khách hàng để duyệt.</p>
              </div>
            </div>
            <textarea rows={3} value={verifyNote} onChange={e => setVerifyNote(e.target.value)}
              placeholder="Ghi chú xác nhận (không bắt buộc)..."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-primary resize-none mb-4"/>
            <div className="flex gap-3">
              <button onClick={() => setVerifyModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">
                Hủy
              </button>
              <button onClick={confirmAdminVerify} disabled={processing === verifyModal.disbId}
                className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 disabled:opacity-60">
                {processing === verifyModal.disbId ? 'Đang xử lý...' : '✅ Xác nhận hợp lệ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
