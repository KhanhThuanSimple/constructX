import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import {
  Search, CheckCircle, XCircle, Eye, Calendar, DollarSign,
  MapPin, User as UserIcon, Clock, AlertCircle, ChevronRight,
  ArrowLeft, Loader2, RefreshCw, Hammer, Building,
  FileText, ThumbsUp, ThumbsDown, ShoppingCart, Package,
  Phone, Layers,
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const fmtBudget = (n) =>
  n == null ? 'Thỏa thuận' :
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n).replace('₫', 'đ');

// ── Config ────────────────────────────────────────────────────────────────────
const APPROVAL_CFG = {
  PENDING:  { label: 'Chờ duyệt', color: 'bg-amber-100 text-amber-700 border-amber-200',  dot: 'bg-amber-400 animate-pulse' },
  APPROVED: { label: 'Đã duyệt',  color: 'bg-green-100 text-green-700 border-green-200',  dot: 'bg-green-400'               },
  REJECTED: { label: 'Từ chối',   color: 'bg-red-100 text-red-600 border-red-200',         dot: 'bg-red-400'                 },
};

const STATUS_CFG = {
  DRAFT:       { label: 'Nháp',          color: 'bg-gray-100 text-gray-500 border-gray-200'    },
  OPEN:        { label: 'Đang tuyển',    color: 'bg-blue-100 text-blue-700 border-blue-200'    },
  IN_PROGRESS: { label: 'Đang thi công', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  COMPLETED:   { label: 'Hoàn thành',   color: 'bg-teal-100 text-teal-700 border-teal-200'    },
  CLOSED:      { label: 'Đã đóng',       color: 'bg-gray-100 text-gray-500 border-gray-200'    },
  CANCELLED:   { label: 'Đã hủy',        color: 'bg-red-100 text-red-600 border-red-200'       },
};

function ApprovalBadge({ status }) {
  const cfg = APPROVAL_CFG[status] || APPROVAL_CFG.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}/>
      {cfg.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.DRAFT;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

// ── Order config ──────────────────────────────────────────────────────────────
const ORDER_STATUS_CFG = {
  PENDING:        { label: 'Chờ duyệt',       color: 'bg-amber-100 text-amber-700 border-amber-200',  dot: 'bg-amber-400 animate-pulse' },
  CONFIRMED:      { label: 'Đã xác nhận',      color: 'bg-blue-100 text-blue-700 border-blue-200',    dot: 'bg-blue-400'                },
  DEPOSIT_PAID:   { label: 'Đã đặt cọc',       color: 'bg-indigo-100 text-indigo-700 border-indigo-200', dot: 'bg-indigo-400'           },
  OPEN_BIDDING:   { label: 'Đang đấu thầu',    color: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-400'          },
  BIDDING_CLOSED: { label: 'Đã chọn thầu',     color: 'bg-teal-100 text-teal-700 border-teal-200',    dot: 'bg-teal-400'              },
  PROCESSING:     { label: 'Đang sản xuất',    color: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-400'         },
  SHIPPED:        { label: 'Đang giao',         color: 'bg-cyan-100 text-cyan-700 border-cyan-200',    dot: 'bg-cyan-400'              },
  DELIVERED:      { label: 'Đã giao',           color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-400'             },
  CANCELLED:      { label: 'Đã hủy',            color: 'bg-red-100 text-red-600 border-red-200',       dot: 'bg-red-400'               },
};

const ORDER_TYPE_CFG = {
  CATALOG: { label: 'Có sẵn',   color: 'bg-sky-50 text-sky-700 border-sky-200'      },
  CUSTOM:  { label: 'Tùy chỉnh', color: 'bg-violet-50 text-violet-700 border-violet-200' },
};

const fmtMoney = (n) =>
  n == null ? '—' :
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n).replace('₫', 'đ');

function OrderStatusBadge({ status }) {
  const cfg = ORDER_STATUS_CFG[status] || ORDER_STATUS_CFG.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}/>
      {cfg.label}
    </span>
  );
}

function OrderTypeBadge({ type }) {
  const cfg = ORDER_TYPE_CFG[type] || ORDER_TYPE_CFG.CATALOG;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

// ── PendingOrdersView ─────────────────────────────────────────────────────────
function PendingOrdersView({ customerId, customerName }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/orders?status=PENDING');
      const all = res.data.data || [];
      // Lọc đơn của khách hàng này
      setOrders(all.filter(o => o.customerId === customerId));
    } catch {
      toast.error('Không thể tải đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleApprove = async (order) => {
    setProcessing(order.id);
    try {
      await api.put(`/admin/orders/${order.id}/status`, { status: 'OPEN_BIDDING', note: 'Admin đã duyệt, mở đấu thầu' });
      toast.success('✅ Đã duyệt đơn hàng!');
      fetchOrders();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi duyệt đơn'); }
    finally { setProcessing(null); }
  };

  const handleReject = async (order) => {
    const reason = window.prompt(`Lý do từ chối đơn hàng "${order.orderCode}"?`);
    if (reason === null) return; // user cancelled
    if (!reason.trim()) { toast.error('Vui lòng nhập lý do từ chối'); return; }
    setProcessing(order.id);
    try {
      await api.put(`/admin/orders/${order.id}/status`, { status: 'CANCELLED', note: reason.trim() });
      toast.success('Đã từ chối đơn hàng');
      fetchOrders();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi từ chối đơn'); }
    finally { setProcessing(null); }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 size={28} className="animate-spin text-primary"/>
    </div>
  );

  if (orders.length === 0) return (
    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
      <ShoppingCart size={36} className="mx-auto text-gray-200 mb-3"/>
      <p className="text-gray-400 font-medium">Không có đơn hàng nào chờ duyệt</p>
      <p className="text-xs text-gray-300 mt-1">{customerName} chưa có đơn hàng nào cần xử lý</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"/>
        <span className="text-sm font-bold text-amber-700">{orders.length} đơn hàng đang chờ duyệt</span>
        <button onClick={fetchOrders} className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-primary">
          <RefreshCw size={12}/> Làm mới
        </button>
      </div>

      {orders.map(order => {
        const isProc = processing === order.id;
        return (
          <div key={order.id} className="bg-white rounded-2xl border-2 border-amber-200 shadow-sm overflow-hidden">
            {/* Top bar */}
            <div className="h-1 w-full bg-amber-400"/>

            <div className="p-5">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <OrderStatusBadge status={order.status}/>
                    <OrderTypeBadge type={order.type}/>
                    <span className="text-[10px] text-gray-400 font-mono font-bold">{order.orderCode}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {order.items?.length || 0} sản phẩm ·{' '}
                    <span className="font-bold text-gray-800">{fmtMoney(order.totalAmount)}</span>
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleReject(order)}
                    disabled={isProc}
                    className="flex items-center gap-1.5 text-xs font-bold border-2 border-red-200 text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 disabled:opacity-60">
                    <XCircle size={13}/>Từ chối
                  </button>
                  <button
                    onClick={() => handleApprove(order)}
                    disabled={isProc}
                    className="flex items-center gap-1.5 text-xs font-bold bg-[#1a4f3a] text-white px-3 py-2 rounded-xl hover:bg-[#2d7a5a] disabled:opacity-60">
                    <CheckCircle size={13}/>{isProc ? 'Đang xử lý...' : 'Duyệt đơn'}
                  </button>
                </div>
              </div>

              {/* Items */}
              {order.items && order.items.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-2">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.itemName}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"/>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                          <Package size={16} className="text-gray-400"/>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{item.itemName}</p>
                        {item.customNote && <p className="text-[10px] text-gray-400 truncate">{item.customNote}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-gray-800">{fmtMoney(item.subtotal)}</p>
                        <p className="text-[10px] text-gray-400">x{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* CUSTOM requirements */}
              {order.type === 'CUSTOM' && order.customRequirements && (
                <div className="bg-violet-50 border border-violet-200 rounded-xl px-3 py-2.5 mb-3">
                  <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wider mb-1">Yêu cầu tùy chỉnh</p>
                  <p className="text-xs text-violet-800">{order.customRequirements}</p>
                  {order.referenceImageUrl && (
                    <img src={order.referenceImageUrl} alt="Ảnh tham khảo"
                      className="mt-2 w-24 h-16 object-cover rounded-lg border border-violet-200"/>
                  )}
                </div>
              )}

              {/* Meta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-500">
                <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-2">
                  <MapPin size={11} className="text-gray-400 shrink-0"/>
                  <span className="truncate">{order.deliveryAddress || '—'}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-2">
                  <Phone size={11} className="text-gray-400 shrink-0"/>
                  <span>{order.contactPhone || '—'}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="text-[10px] text-gray-400">
                  Đặt lúc: {new Date(order.createdAt).toLocaleString('vi-VN')}
                </span>
                {order.customerNote && (
                  <div className="flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                    <FileText size={9}/>
                    <span className="truncate max-w-[180px]">{order.customerNote}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Group projects by customer
function groupByCustomer(projects) {
  const map = {};
  projects.forEach(p => {
    const key = p.customerId;
    if (!map[key]) {
      map[key] = {
        id: key,
        name: p.customerName || 'Không rõ',
        email: p.customerEmail,
        projects: [],
      };
    }
    map[key].projects.push(p);
  });

  return Object.values(map).sort((a, b) => {
    // Ưu tiên người có dự án PENDING lên đầu
    const aPending = a.projects.filter(p => p.approvalStatus === 'PENDING').length;
    const bPending = b.projects.filter(p => p.approvalStatus === 'PENDING').length;
    if (bPending !== aPending) return bPending - aPending;
    return b.projects.length - a.projects.length;
  });
}

// ── View 1: Danh sách khách hàng có dự án ────────────────────────────────────
function CustomerListView({ customers, loading, search, onSearch, onSelect, stats, onRefresh }) {
  const filtered = customers.filter(c =>
    !search.trim() ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Chờ duyệt',     value: stats.pending,   color: 'text-amber-600', bg: 'bg-amber-50',  border: 'border-amber-100' },
          { label: 'Đã duyệt',      value: stats.approved,  color: 'text-green-600', bg: 'bg-green-50',  border: 'border-green-100' },
          { label: 'Từ chối',       value: stats.rejected,  color: 'text-red-600',   bg: 'bg-red-50',    border: 'border-red-100'   },
          { label: 'Tổng dự án',    value: stats.total,     color: 'text-gray-800',  bg: 'bg-white',     border: 'border-gray-100'  },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-4 text-center`}>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={15}/>
          <input value={search} onChange={e => onSearch(e.target.value)}
            placeholder="Tìm theo tên, email khách hàng..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary"/>
        </div>
        <button onClick={onRefresh}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
          <RefreshCw size={14}/> Làm mới
        </button>
        {stats.pending > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium px-4 py-2.5 rounded-xl">
            <AlertCircle size={14} className="text-amber-500"/>
            {stats.pending} dự án đang chờ bạn phê duyệt
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-primary"/></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <Hammer size={36} className="mx-auto text-gray-200 mb-3"/>
          <p className="text-gray-400">Không tìm thấy dữ liệu</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => {
            const pending  = c.projects.filter(p => p.approvalStatus === 'PENDING').length;
            const approved = c.projects.filter(p => p.approvalStatus === 'APPROVED').length;
            const rejected = c.projects.filter(p => p.approvalStatus === 'REJECTED').length;
            const hasPending = pending > 0;

            return (
              <button key={c.id} onClick={() => onSelect(c)}
                className={`relative bg-white rounded-2xl p-5 text-left transition-all group hover:shadow-md ${
                  hasPending
                    ? 'border-2 border-amber-300 hover:border-amber-500 shadow-sm shadow-amber-100'
                    : 'border border-gray-100 hover:border-primary'
                }`}>

                {/* Badge cần duyệt */}
                {hasPending && (
                  <span className="absolute -top-2.5 left-4 bg-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                    <AlertCircle size={10}/>{pending} cần duyệt
                  </span>
                )}

                {/* Avatar + Info */}
                <div className="flex items-center gap-3 mb-4 mt-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg text-white shrink-0 ${
                    hasPending ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-primary to-[#2d7a5a]'
                  }`}>
                    {c.name?.charAt(0) || 'K'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{c.name}</p>
                    {c.email && <p className="text-[11px] text-gray-400 truncate">{c.email}</p>}
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-primary shrink-0"/>
                </div>

                {/* Project count breakdown */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className={`rounded-xl p-2 text-center ${pending > 0 ? 'bg-amber-50' : 'bg-gray-50'}`}>
                    <p className={`text-lg font-black ${pending > 0 ? 'text-amber-600' : 'text-gray-400'}`}>{pending}</p>
                    <p className="text-[9px] text-gray-400 font-medium">Chờ duyệt</p>
                  </div>
                  <div className={`rounded-xl p-2 text-center ${approved > 0 ? 'bg-green-50' : 'bg-gray-50'}`}>
                    <p className={`text-lg font-black ${approved > 0 ? 'text-green-600' : 'text-gray-400'}`}>{approved}</p>
                    <p className="text-[9px] text-gray-400 font-medium">Đã duyệt</p>
                  </div>
                  <div className={`rounded-xl p-2 text-center ${rejected > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                    <p className={`text-lg font-black ${rejected > 0 ? 'text-red-500' : 'text-gray-400'}`}>{rejected}</p>
                    <p className="text-[9px] text-gray-400 font-medium">Từ chối</p>
                  </div>
                </div>

                {/* Dự án mới nhất cần duyệt */}
                {pending > 0 && (() => {
                  const p = c.projects.find(x => x.approvalStatus === 'PENDING');
                  return (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-800">
                      <p className="font-bold truncate">📋 {p.name}</p>
                      {p.address && <p className="text-amber-600 truncate flex items-center gap-1 mt-0.5"><MapPin size={9}/>{p.address}</p>}
                    </div>
                  );
                })()}

                {/* Total */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-[10px] text-gray-400">{c.projects.length} dự án tổng cộng</span>
                  <span className={`text-[10px] font-bold ${hasPending ? 'text-amber-600' : 'text-gray-400'}`}>
                    {hasPending ? '⚡ Cần xử lý' : '✓ Không có việc'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── View 2: Chi tiết dự án của 1 khách hàng ──────────────────────────────────
function CustomerProjectsView({ customer, onBack, onRefresh }) {
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'orders'
  const [filterStatus, setFilterStatus] = useState('PENDING');
  const [modal, setModal] = useState(null); // { project, action: 'approve'|'reject' }
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(null);

  const pending  = customer.projects.filter(p => p.approvalStatus === 'PENDING').length;
  const approved = customer.projects.filter(p => p.approvalStatus === 'APPROVED').length;
  const rejected = customer.projects.filter(p => p.approvalStatus === 'REJECTED').length;

  const filtered = filterStatus === 'all'
    ? customer.projects
    : customer.projects.filter(p => p.approvalStatus === filterStatus);

  const handleReview = async () => {
    if (!modal) return;
    if (modal.action === 'reject' && !reason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối'); return;
    }
    const endpoint = modal.action === 'approve' ? 'approve' : 'reject';
    setProcessing(modal.project.id);
    try {
      await api.post(`/admin/projects/${modal.project.id}/${endpoint}`, { reason: reason.trim() });
      toast.success(modal.action === 'approve' ? '✅ Đã duyệt dự án!' : 'Đã từ chối dự án');
      setModal(null); setReason('');
      onRefresh();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi xử lý'); }
    finally { setProcessing(null); }
  };

  const TABS = [
    { key: 'PENDING',  label: `Chờ duyệt (${pending})` },
    { key: 'APPROVED', label: `Đã duyệt (${approved})` },
    { key: 'REJECTED', label: `Từ chối (${rejected})` },
    { key: 'all',      label: `Tất cả (${customer.projects.length})` },
  ];

  return (
    <div className="space-y-5">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary group">
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform"/>
        Quay lại danh sách
      </button>

      {/* Customer profile */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-[#2d7a5a] text-white flex items-center justify-center font-black text-2xl shrink-0">
            {customer.name?.charAt(0) || 'K'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-gray-900">{customer.name}</h2>
            {customer.email && (
              <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-1">
                <UserIcon size={13}/>{customer.email}
              </p>
            )}
            {pending > 0 && (
              <div className="flex items-center gap-2 mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 w-fit">
                <AlertCircle size={14} className="text-amber-500"/>
                <span className="text-sm font-bold text-amber-700">{pending} dự án đang chờ bạn phê duyệt</span>
              </div>
            )}
          </div>
          {/* Stats */}
          <div className="flex gap-3 shrink-0">
            {[
              { label: 'Chờ duyệt', value: pending,   color: 'text-amber-600', bg: 'bg-amber-50'  },
              { label: 'Đã duyệt',  value: approved,  color: 'text-green-600', bg: 'bg-green-50'  },
              { label: 'Từ chối',   value: rejected,  color: 'text-red-500',   bg: 'bg-red-50'    },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl px-4 py-3 text-center min-w-[72px]`}>
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab switcher: Dự án | Đơn hàng chờ duyệt */}
      <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 p-1.5 shadow-sm w-fit">
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'projects'
              ? 'bg-[#1a4f3a] text-white shadow-sm'
              : 'text-gray-500 hover:bg-gray-50'
          }`}>
          <Hammer size={14}/>
          Dự án
          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
            activeTab === 'projects' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
          }`}>
            {customer.projects.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'orders'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-gray-500 hover:bg-gray-50'
          }`}>
          <ShoppingCart size={14}/>
          Đơn hàng chờ duyệt
          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
            activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-600'
          }`}>
            ●
          </span>
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'orders' ? (
        <PendingOrdersView customerId={customer.id} customerName={customer.name}/>
      ) : (
        <>
      {/* Filter tabs */}
      <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 p-1.5 shadow-sm overflow-x-auto">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setFilterStatus(t.key)}
            className={`flex-1 min-w-fit py-2.5 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterStatus === t.key
                ? t.key === 'PENDING' ? 'bg-amber-500 text-white shadow-sm'
                  : t.key === 'APPROVED' ? 'bg-green-600 text-white shadow-sm'
                  : t.key === 'REJECTED' ? 'bg-red-500 text-white shadow-sm'
                  : 'bg-primary text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Projects list */}
      {filtered.length === 0 ? (
        <div className="text-center py-14 bg-white rounded-2xl border border-dashed border-gray-200">
          <Hammer size={32} className="mx-auto text-gray-200 mb-2"/>
          <p className="text-gray-400 text-sm">Không có dự án nào ở trạng thái này</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(p => {
            const apCfg = APPROVAL_CFG[p.approvalStatus] || APPROVAL_CFG.PENDING;
            const stCfg = STATUS_CFG[p.status] || STATUS_CFG.DRAFT;
            const isProc = processing === p.id;
            return (
              <div key={p.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                p.approvalStatus === 'PENDING' ? 'border-amber-200' : 'border-gray-100'
              }`}>
                {/* Colored top bar */}
                <div className={`h-1 w-full ${
                  p.approvalStatus === 'PENDING' ? 'bg-amber-400' :
                  p.approvalStatus === 'APPROVED' ? 'bg-green-500' : 'bg-red-400'
                }`}/>

                {/* Cover image */}
                {p.imageUrls?.[0] && (
                  <div className="h-44 w-full overflow-hidden bg-gray-100">
                    <img src={p.imageUrls[0]} alt={p.name} className="w-full h-full object-cover"/>
                  </div>
                )}

                <div className="p-6">
                  {/* Header */}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <ApprovalBadge status={p.approvalStatus}/>
                        <StatusBadge status={p.status}/>
                        <span className="text-[10px] text-gray-400 font-mono">#{p.id}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{p.name}</h3>
                    </div>
                    {p.approvalStatus === 'PENDING' && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => { setModal({ project: p, action: 'reject' }); setReason(''); }}
                          disabled={isProc}
                          className="flex items-center gap-1.5 text-xs font-bold border-2 border-red-200 text-red-600 px-4 py-2.5 rounded-xl hover:bg-red-50 disabled:opacity-60">
                          <ThumbsDown size={13}/>Từ chối
                        </button>
                        <button
                          onClick={() => { setModal({ project: p, action: 'approve' }); setReason(''); }}
                          disabled={isProc}
                          className="flex items-center gap-1.5 text-xs font-bold bg-[#1a4f3a] text-white px-4 py-2.5 rounded-xl hover:bg-[#2d7a5a] disabled:opacity-60">
                          <ThumbsUp size={13}/>{isProc ? 'Đang xử lý...' : 'Duyệt dự án'}
                        </button>
                      </div>
                    )}
                    {p.approvalStatus === 'APPROVED' && (
                      <span className="flex items-center gap-1.5 text-xs text-green-600 font-bold bg-green-50 border border-green-200 px-3 py-2 rounded-xl">
                        <CheckCircle size={13}/>Đã duyệt — Đang mở tuyển
                      </span>
                    )}
                  </div>

                  {/* Meta grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {p.address && (
                      <div className="flex items-start gap-2 bg-gray-50 rounded-xl px-3 py-2.5 text-xs text-gray-600">
                        <MapPin size={13} className="text-gray-400 mt-0.5 shrink-0"/>
                        <span>{p.address}</span>
                      </div>
                    )}
                    {(p.budgetMin || p.budgetMax) && (
                      <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 text-xs text-gray-600">
                        <DollarSign size={13} className="text-primary shrink-0"/>
                        <span className="font-semibold">{fmtBudget(p.budgetMin)} – {fmtBudget(p.budgetMax)}</span>
                      </div>
                    )}
                    {p.area && (
                      <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 text-xs text-gray-600">
                        <Building size={13} className="text-gray-400 shrink-0"/>
                        <span>Diện tích: <strong>{p.area} m²</strong></span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 text-xs text-gray-600">
                      <Calendar size={13} className="text-gray-400 shrink-0"/>
                      <span>Tạo ngày: <strong>{new Date(p.createdAt).toLocaleDateString('vi-VN')}</strong></span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {p.category && <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold px-2.5 py-1 rounded-full">{p.category}</span>}
                    {p.style && <span className="bg-purple-50 text-purple-600 border border-purple-100 text-[10px] font-bold px-2.5 py-1 rounded-full">{p.style}</span>}
                    {p.bidType && <span className="bg-gray-50 text-gray-500 border border-gray-200 text-[10px] font-bold px-2.5 py-1 rounded-full">
                      {p.bidType === 'FIXED_PRICE' ? 'Giá cố định' : 'Thương lượng'}
                    </span>}
                  </div>

                  {/* Description */}
                  {p.description && (
                    <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Mô tả dự án</p>
                      <p className="text-sm text-gray-700 line-clamp-3">{p.description}</p>
                    </div>
                  )}

                  {/* Admin note */}
                  {p.adminNote && (
                    <div className={`flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs mb-4 ${
                      p.approvalStatus === 'REJECTED' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-blue-50 border border-blue-200 text-blue-700'
                    }`}>
                      <FileText size={12} className="mt-0.5 shrink-0"/>
                      <span><strong>Ghi chú admin:</strong> {p.adminNote}</span>
                    </div>
                  )}

                  {/* Footer actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-[10px] text-gray-400">
                      {p.approvedAt ? `Duyệt lúc: ${new Date(p.approvedAt).toLocaleString('vi-VN')}` : `Tạo: ${new Date(p.createdAt).toLocaleString('vi-VN')}`}
                    </span>
                    <Link to={`/projects/${p.id}`}
                      className="flex items-center gap-1.5 text-xs font-bold border border-gray-200 px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-primary hover:text-primary transition-all">
                      <Eye size={13}/>Xem dự án
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </> /* end projects tab */
      )} {/* end activeTab === 'orders' ternary */}

      {/* Modal duyệt/từ chối */}
      {activeTab === 'projects' && modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${modal.action === 'approve' ? 'bg-green-50' : 'bg-red-50'}`}>
                {modal.action === 'approve'
                  ? <ThumbsUp size={22} className="text-green-600"/>
                  : <ThumbsDown size={22} className="text-red-500"/>}
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-lg">
                  {modal.action === 'approve' ? 'Duyệt dự án' : 'Từ chối dự án'}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">{modal.project.name}</p>
              </div>
            </div>

            {modal.action === 'approve' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-xs text-green-800">
                <CheckCircle size={12} className="inline mr-1.5"/>
                Dự án sẽ chuyển sang <strong>Đang tuyển thầu</strong> và hiển thị trên marketplace.
                Khách hàng sẽ nhận được thông báo ngay.
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {modal.action === 'approve' ? 'Ghi chú (không bắt buộc)' : 'Lý do từ chối *'}
              </label>
              <textarea rows={4} value={reason} onChange={e => setReason(e.target.value)}
                placeholder={modal.action === 'approve'
                  ? 'VD: Hồ sơ hợp lệ, được phép mở thầu...'
                  : 'VD: Thiếu thông tin ngân sách, mô tả chưa đủ rõ...'}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-primary resize-none"/>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setModal(null); setReason(''); }}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50">
                Hủy
              </button>
              <button onClick={handleReview} disabled={!!processing}
                className={`flex-1 py-3 rounded-xl text-white text-sm font-bold disabled:opacity-60 transition-colors ${
                  modal.action === 'approve' ? 'bg-[#1a4f3a] hover:bg-[#2d7a5a]' : 'bg-red-500 hover:bg-red-600'
                }`}>
                {processing ? 'Đang xử lý...' : modal.action === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Root Page ─────────────────────────────────────────────────────────────────
export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/projects?status=all');
      setProjects(res.data.data || []);
    } catch {
      toast.error('Không thể tải danh sách dự án');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const customers = React.useMemo(() => groupByCustomer(projects), [projects]);

  // Cập nhật customer đang xem sau khi refresh
  useEffect(() => {
    if (selectedCustomer) {
      const updated = customers.find(c => c.id === selectedCustomer.id);
      if (updated) setSelectedCustomer(updated);
    }
  }, [customers]);

  const stats = {
    pending:  projects.filter(p => p.approvalStatus === 'PENDING').length,
    approved: projects.filter(p => p.approvalStatus === 'APPROVED').length,
    rejected: projects.filter(p => p.approvalStatus === 'REJECTED').length,
    total:    projects.length,
  };

  return (
    <Layout title={selectedCustomer ? `Dự án của ${selectedCustomer.name}` : 'Duyệt dự án'}>
      <div className="space-y-4">

        {/* Breadcrumb */}
        {selectedCustomer && (
          <nav className="flex items-center gap-2 text-xs text-gray-400">
            <button onClick={() => setSelectedCustomer(null)} className="hover:text-primary font-medium transition-colors">
              Tất cả khách hàng
            </button>
            <ChevronRight size={12}/>
            <span className="text-primary font-bold">{selectedCustomer.name}</span>
          </nav>
        )}

        {!selectedCustomer ? (
          <CustomerListView
            customers={customers}
            loading={loading}
            search={search}
            onSearch={setSearch}
            onSelect={setSelectedCustomer}
            stats={stats}
            onRefresh={fetchProjects}
          />
        ) : (
          <CustomerProjectsView
            customer={selectedCustomer}
            onBack={() => setSelectedCustomer(null)}
            onRefresh={fetchProjects}
          />
        )}
      </div>
    </Layout>
  );
}
