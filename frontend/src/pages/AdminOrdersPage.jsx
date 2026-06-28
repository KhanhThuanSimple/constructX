import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import {
  Package, Search, Gavel, Users, ChevronRight, ArrowLeft,
  Loader2, ShoppingBag, MapPin, Phone, User as UserIcon,
  Calendar, CheckCircle, XCircle, FileText, Tag,
  Hammer, FolderOpen, RefreshCw, Eye, AlertCircle,
  DollarSign, Clock, MoreHorizontal, Building,
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const fmt = (n) =>
  n == null ? '0đ' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n).replace('₫', 'đ');
const fmtBudget = (n) =>
  n == null ? 'Thỏa thuận' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n).replace('₫', 'đ');

// ── Config trạng thái ────────────────────────────────────────────────────────
const ORDER_STATUS = {
  PENDING:        { label: 'Chờ duyệt',     color: 'bg-amber-100 text-amber-700 border-amber-200',    dot: 'bg-amber-400'  },
  OPEN_BIDDING:   { label: 'Đang đấu giá',  color: 'bg-blue-100 text-blue-700 border-blue-200',      dot: 'bg-blue-400'   },
  BIDDING_CLOSED: { label: 'Đã chọn thầu',  color: 'bg-purple-100 text-purple-700 border-purple-200', dot: 'bg-purple-400' },
  PROCESSING:     { label: 'Đang thi công', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', dot: 'bg-indigo-400' },
  DELIVERED:      { label: 'Hoàn thành',    color: 'bg-teal-100 text-teal-700 border-teal-200',      dot: 'bg-teal-400'   },
  SHIPPED:        { label: 'Đang giao',     color: 'bg-cyan-100 text-cyan-700 border-cyan-200',       dot: 'bg-cyan-400'   },
  CANCELLED:      { label: 'Đã hủy',        color: 'bg-red-100 text-red-600 border-red-200',          dot: 'bg-red-400'    },
};

const PROJECT_APPROVAL = {
  PENDING:  { label: 'Chờ duyệt', color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
  APPROVED: { label: 'Đã duyệt',  color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-400' },
  REJECTED: { label: 'Từ chối',   color: 'bg-red-100 text-red-600 border-red-200',       dot: 'bg-red-400'   },
};

const PROJECT_STATUS = {
  DRAFT:       { label: 'Nháp',          color: 'bg-gray-100 text-gray-500 border-gray-200'    },
  OPEN:        { label: 'Đang tuyển',    color: 'bg-blue-100 text-blue-700 border-blue-200'    },
  IN_PROGRESS: { label: 'Đang thi công', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  COMPLETED:   { label: 'Hoàn thành',   color: 'bg-teal-100 text-teal-700 border-teal-200'    },
  CLOSED:      { label: 'Đã đóng',       color: 'bg-gray-100 text-gray-500 border-gray-200'    },
  CANCELLED:   { label: 'Đã hủy',        color: 'bg-red-100 text-red-600 border-red-200'       },
};

function StatusPill({ label, color, dot }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${color}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`}/>}
      {label}
    </span>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function groupByCustomer(orders, projects) {
  const map = {};

  orders.forEach(o => {
    const key = o.customerId;
    if (!map[key]) map[key] = { id: key, name: o.customerName || 'Không rõ', phone: o.contactPhone, email: null, orders: [], projects: [] };
    map[key].orders.push(o);
  });

  projects.forEach(p => {
    const key = p.customerId;
    if (!map[key]) map[key] = { id: key, name: p.customerName || 'Không rõ', phone: null, email: p.customerEmail, orders: [], projects: [] };
    else {
      if (p.customerEmail) map[key].email = p.customerEmail;
    }
    map[key].projects.push(p);
  });

  return Object.values(map).sort((a, b) => (b.orders.length + b.projects.length) - (a.orders.length + a.projects.length));
}

// ── View 1: Danh sách khách hàng ─────────────────────────────────────────────
function CustomerListView({ customers, loading, search, onSearch, onSelect, stats }) {
  const filtered = customers.filter(c =>
    !search.trim() ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Global stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Khách hàng',    value: customers.length,    color: 'text-gray-800',   bg: 'bg-white',     border: 'border-gray-100'   },
          { label: 'Đơn chờ duyệt', value: stats.pendingOrders, color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-100'  },
          { label: 'Dự án chờ duyệt',value: stats.pendingProjects,color:'text-blue-600',  bg: 'bg-blue-50',   border: 'border-blue-100'   },
          { label: 'Đang thi công',  value: stats.processing,    color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
          { label: 'Hoàn thành',     value: stats.delivered,     color: 'text-teal-600',   bg: 'bg-teal-50',   border: 'border-teal-100'   },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-500 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={15}/>
        <input value={search} onChange={e => onSearch(e.target.value)}
          placeholder="Tìm theo tên, SĐT, email..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary"/>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-primary"/></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <Package size={36} className="mx-auto text-gray-200 mb-3"/>
          <p className="text-gray-400 text-sm">Không tìm thấy khách hàng nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => {
            const pendingOrders = c.orders.filter(o => o.status === 'PENDING').length;
            const pendingProjects = c.projects.filter(p => p.approvalStatus === 'PENDING').length;
            const activeItems = c.orders.filter(o => ['OPEN_BIDDING','PROCESSING','SHIPPED'].includes(o.status)).length
              + c.projects.filter(p => ['OPEN','IN_PROGRESS'].includes(p.status)).length;
            const totalValue = c.orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
            const needAction = pendingOrders + pendingProjects;

            return (
              <button key={c.id} onClick={() => onSelect(c)}
                className={`bg-white border rounded-2xl p-5 text-left hover:shadow-md transition-all group relative ${needAction > 0 ? 'border-amber-200 hover:border-amber-400' : 'border-gray-100 hover:border-primary'}`}>
                {needAction > 0 && (
                  <span className="absolute top-3 right-3 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {needAction > 9 ? '9+' : needAction}
                  </span>
                )}

                {/* Avatar + Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-[#2d7a5a] text-white flex items-center justify-center font-black text-lg shrink-0">
                    {c.name?.charAt(0) || 'K'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{c.name}</p>
                    {c.phone && <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5"><Phone size={10}/>{c.phone}</p>}
                    {c.email && <p className="text-[11px] text-gray-400 truncate">{c.email}</p>}
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-primary transition-colors shrink-0"/>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-blue-50 rounded-xl p-2.5 text-center">
                    <p className="flex items-center justify-center gap-1 text-[10px] text-blue-600 font-medium mb-0.5"><ShoppingBag size={10}/>Đơn hàng</p>
                    <p className="text-lg font-black text-blue-700">{c.orders.length}</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-2.5 text-center">
                    <p className="flex items-center justify-center gap-1 text-[10px] text-green-600 font-medium mb-0.5"><Hammer size={10}/>Dự án</p>
                    <p className="text-lg font-black text-green-700">{c.projects.length}</p>
                  </div>
                </div>

                {/* Status indicators */}
                <div className="flex flex-wrap gap-1.5">
                  {pendingOrders > 0 && <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold">{pendingOrders} đơn chờ duyệt</span>}
                  {pendingProjects > 0 && <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold">{pendingProjects} dự án chờ duyệt</span>}
                  {activeItems > 0 && <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-bold">{activeItems} đang hoạt động</span>}
                </div>

                {/* Total value */}
                {totalValue > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-[10px] text-gray-400">Tổng giá trị đơn hàng</p>
                    <p className="font-black text-primary text-sm">{fmt(totalValue)}</p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── View 2: Chi tiết khách hàng ──────────────────────────────────────────────
function CustomerDetailView({ customer, onBack, onRefresh }) {
  const [activeTab, setActiveTab] = useState('orders');
  const [bids, setBids] = useState({});
  const [loadingBids, setLoadingBids] = useState(null);
  const [noteModal, setNoteModal] = useState(null);
  const [noteValue, setNoteValue] = useState('');
  const [processing, setProcessing] = useState(null);
  const [reviewModal, setReviewModal] = useState(null); // project for review

  const pendingOrders = customer.orders.filter(o => o.status === 'PENDING').length;
  const pendingProjects = customer.projects.filter(p => p.approvalStatus === 'PENDING').length;
  const totalValue = customer.orders.reduce((s, o) => s + (o.totalAmount || 0), 0);

  const loadBids = async (orderId) => {
    if (bids[orderId]) return;
    setLoadingBids(orderId);
    try {
      const res = await api.get(`/order-bids/order/${orderId}`);
      setBids(prev => ({ ...prev, [orderId]: res.data.data || [] }));
    } catch { /* silent */ }
    finally { setLoadingBids(null); }
  };

  const handleApproveOrder = async () => {
    setProcessing('approveOrder');
    try {
      await api.post(`/admin/orders/${noteModal.id}/approve-bidding`, { note: noteValue });
      toast.success('✅ Đã duyệt & mở đấu giá!');
      setNoteModal(null); setNoteValue('');
      onRefresh();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
    finally { setProcessing(null); }
  };

  const handleCancelOrder = async () => {
    setProcessing('cancelOrder');
    try {
      await api.put(`/admin/orders/${noteModal.id}/status`, { status: 'CANCELLED', note: noteValue });
      toast.success('Đã hủy đơn hàng');
      setNoteModal(null); setNoteValue('');
      onRefresh();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
    finally { setProcessing(null); }
  };

  const handleApproveProject = async (projectId) => {
    setProcessing(`approveProject-${projectId}`);
    try {
      await api.post(`/admin/projects/${projectId}/approve`, { reason: '' });
      toast.success('✅ Đã duyệt dự án!');
      onRefresh();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
    finally { setProcessing(null); }
  };

  const handleRejectProject = async () => {
    setProcessing(`rejectProject-${reviewModal.id}`);
    try {
      await api.post(`/admin/projects/${reviewModal.id}/reject`, { reason: noteValue });
      toast.success('Đã từ chối dự án');
      setReviewModal(null); setNoteValue('');
      onRefresh();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
    finally { setProcessing(null); }
  };

  const tabs = [
    { key: 'orders',   label: `Đơn hàng (${customer.orders.length})`,  icon: <ShoppingBag size={13}/>,  badge: pendingOrders },
    { key: 'projects', label: `Dự án (${customer.projects.length})`,    icon: <Hammer size={13}/>,       badge: pendingProjects },
  ];

  return (
    <div className="space-y-5">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary group">
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform"/> Quay lại danh sách
      </button>

      {/* Customer profile card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-[#2d7a5a] text-white flex items-center justify-center font-black text-2xl shrink-0">
            {customer.name?.charAt(0) || 'K'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-gray-900">{customer.name}</h2>
            <div className="flex flex-wrap gap-3 mt-1.5 text-sm text-gray-500">
              {customer.phone && <span className="flex items-center gap-1.5"><Phone size={13}/>{customer.phone}</span>}
              {customer.email && <span className="flex items-center gap-1.5"><UserIcon size={13}/>{customer.email}</span>}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {pendingOrders > 0 && <span className="text-[11px] bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-bold border border-amber-200">{pendingOrders} đơn chờ duyệt</span>}
              {pendingProjects > 0 && <span className="text-[11px] bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-bold border border-blue-200">{pendingProjects} dự án chờ duyệt</span>}
            </div>
          </div>
          {/* Summary numbers */}
          <div className="flex gap-4 shrink-0">
            {[
              { label: 'Đơn hàng', value: customer.orders.length, color: 'text-primary' },
              { label: 'Dự án', value: customer.projects.length, color: 'text-[#1a4f3a]' },
              { label: 'Giá trị', value: fmt(totalValue), color: 'text-indigo-600', small: true },
            ].map(s => (
              <div key={s.label} className="text-center bg-gray-50 rounded-xl px-4 py-3 min-w-[80px]">
                <p className={`${s.small ? 'text-base' : 'text-2xl'} font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 p-1.5 shadow-sm">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all relative ${
              activeTab === t.key ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
            }`}>
            {t.icon}{t.label}
            {t.badge > 0 && (
              <span className={`absolute top-1 right-2 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center ${activeTab === t.key ? 'bg-white text-primary' : 'bg-red-500 text-white'}`}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Đơn hàng ── */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          {customer.orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
              <ShoppingBag size={32} className="mx-auto text-gray-200 mb-2"/>
              <p className="text-gray-400 text-sm">Chưa có đơn hàng nào</p>
            </div>
          ) : customer.orders.map(o => {
            const stCfg = ORDER_STATUS[o.status] || { label: o.status, color: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' };
            const orderBids = bids[o.id] || [];
            const acceptedBid = orderBids.find(b => b.status === 'ACCEPTED');
            return (
              <div key={o.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                {/* Order header */}
                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <StatusPill label={stCfg.label} color={stCfg.color} dot={stCfg.dot}/>
                        <span className="font-mono text-xs font-bold text-gray-500">{o.orderCode}</span>
                        {o.type === 'CUSTOM' && <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold">🎨 Thiết kế riêng</span>}
                        {o.type === 'CATALOG' && <span className="text-[10px] bg-gray-50 text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full font-bold">🛍️ Mua sẵn</span>}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Calendar size={10}/>{new Date(o.createdAt).toLocaleString('vi-VN')}</span>
                        {o.deliveryAddress && <span className="flex items-center gap-1"><MapPin size={10}/>{o.deliveryAddress}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-primary">{o.totalAmount ? fmt(o.totalAmount) : '—'}</p>
                      <p className="text-[11px] text-gray-400">{o.items?.length || 0} sản phẩm</p>
                    </div>
                  </div>

                  {/* Accepted bid summary */}
                  {acceptedBid && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between mb-3">
                      <div><p className="text-[10px] text-green-700 font-bold uppercase tracking-wider">Nhà thầu được chọn</p>
                        <p className="font-bold text-green-900 text-sm">{acceptedBid.contractorName}</p></div>
                      <p className="font-black text-green-700">{fmt(acceptedBid.quotedPrice)}</p>
                    </div>
                  )}

                  {/* Items preview */}
                  {o.items?.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mb-3">
                      {o.items.slice(0, 4).map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 text-xs text-gray-600">
                          {item.imageUrl && <img src={item.imageUrl} alt="" className="w-5 h-5 rounded object-cover"/>}
                          <span className="max-w-[80px] truncate">{item.itemName}</span>
                          <span className="text-gray-400">×{item.quantity}</span>
                        </div>
                      ))}
                      {o.items.length > 4 && <span className="text-[10px] text-gray-400 self-center">+{o.items.length - 4}</span>}
                    </div>
                  )}

                  {/* Custom requirements */}
                  {o.customRequirements && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-800 mb-3 flex items-start gap-1.5">
                      <Gavel size={11} className="mt-0.5 shrink-0"/><span className="line-clamp-2">{o.customRequirements}</span>
                    </div>
                  )}

                  {/* Bids section - expandable */}
                  {['OPEN_BIDDING','BIDDING_CLOSED','PROCESSING','DELIVERED'].includes(o.status) && (
                    <button onClick={() => loadBids(o.id)}
                      className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium mb-3">
                      <Users size={12}/>
                      {loadingBids === o.id ? 'Đang tải...' : bids[o.id] ? `${bids[o.id].length} báo giá` : 'Xem báo giá'}
                    </button>
                  )}
                  {bids[o.id]?.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {bids[o.id].slice(0, 3).map(b => (
                        <div key={b.id} className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs border ${b.status === 'ACCEPTED' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${b.status === 'ACCEPTED' ? 'bg-green-500' : b.status === 'REJECTED' ? 'bg-red-400' : 'bg-amber-400'}`}/>
                            <span className="font-medium text-gray-800">{b.contractorName}</span>
                            {b.estimatedDays && <span className="text-gray-400">· {b.estimatedDays} ngày</span>}
                          </div>
                          <span className="font-bold text-primary">{b.quotedPrice ? fmt(b.quotedPrice) : '—'}</span>
                        </div>
                      ))}
                      {bids[o.id].length > 3 && <p className="text-[10px] text-gray-400 pl-2">+{bids[o.id].length - 3} báo giá khác</p>}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                    {o.status === 'PENDING' && (
                      <>
                        <button onClick={() => { setNoteModal({ id: o.id, action: 'cancel', code: o.orderCode }); setNoteValue(''); }}
                          className="flex items-center gap-1.5 text-xs font-bold border-2 border-red-200 text-red-600 px-3 py-2 rounded-xl hover:bg-red-50">
                          <XCircle size={13}/>Hủy đơn
                        </button>
                        <button onClick={() => { setNoteModal({ id: o.id, action: 'approve', code: o.orderCode }); setNoteValue(''); }}
                          className="flex items-center gap-1.5 text-xs font-bold bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary/90">
                          <Gavel size={13}/>Duyệt & Mở đấu giá
                        </button>
                      </>
                    )}
                    {o.status === 'OPEN_BIDDING' && (
                      <span className="text-xs text-blue-600 font-medium flex items-center gap-1.5 bg-blue-50 px-3 py-2 rounded-xl border border-blue-100">
                        <Users size={12}/>Đang mở đấu giá — chờ khách hàng chọn nhà thầu
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Tab: Dự án ── */}
      {activeTab === 'projects' && (
        <div className="space-y-3">
          {customer.projects.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
              <Hammer size={32} className="mx-auto text-gray-200 mb-2"/>
              <p className="text-gray-400 text-sm">Chưa có dự án nào</p>
            </div>
          ) : customer.projects.map(p => {
            const stCfg = PROJECT_STATUS[p.status] || PROJECT_STATUS.DRAFT;
            const apCfg = PROJECT_APPROVAL[p.approvalStatus] || PROJECT_APPROVAL.PENDING;
            const isApproving = processing === `approveProject-${p.id}`;
            return (
              <div key={p.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                {/* Project cover image */}
                {p.imageUrls?.[0] && (
                  <div className="h-36 w-full bg-gray-100 overflow-hidden">
                    <img src={p.imageUrls[0]} alt={p.name} className="w-full h-full object-cover"/>
                  </div>
                )}
                <div className="p-5">
                  {/* Status badges */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    <StatusPill label={stCfg.label} color={stCfg.color}/>
                    <StatusPill label={apCfg.label} color={apCfg.color} dot={apCfg.dot}/>
                  </div>

                  {/* Title + meta */}
                  <h3 className="font-bold text-gray-900 text-base mb-1.5">{p.name}</h3>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
                    {p.address && <span className="flex items-center gap-1"><MapPin size={10}/>{p.address}</span>}
                    {p.category && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">{p.category}</span>}
                    {p.style && <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium">{p.style}</span>}
                    {p.area && <span className="flex items-center gap-1"><Building size={10}/>{p.area}m²</span>}
                    <span className="flex items-center gap-1"><Calendar size={10}/>{new Date(p.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>

                  {/* Budget */}
                  {(p.budgetMin || p.budgetMax) && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 rounded-xl px-3 py-2 w-fit mb-3">
                      <DollarSign size={11} className="text-primary"/>
                      <span className="font-semibold">{fmtBudget(p.budgetMin)} – {fmtBudget(p.budgetMax)}</span>
                    </div>
                  )}

                  {/* Description */}
                  {p.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{p.description}</p>
                  )}

                  {/* Admin note */}
                  {p.approvalStatus === 'REJECTED' && p.adminNote && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-700 mb-3">
                      <XCircle size={12} className="mt-0.5 shrink-0"/>
                      <span><strong>Lý do từ chối:</strong> {p.adminNote}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                    {p.approvalStatus === 'PENDING' && (
                      <>
                        <button onClick={() => { setReviewModal(p); setNoteValue(''); }}
                          className="flex items-center gap-1.5 text-xs font-bold border-2 border-red-200 text-red-600 px-3 py-2 rounded-xl hover:bg-red-50">
                          <XCircle size={13}/>Từ chối
                        </button>
                        <button onClick={() => handleApproveProject(p.id)} disabled={isApproving}
                          className="flex items-center gap-1.5 text-xs font-bold bg-[#1a4f3a] text-white px-4 py-2 rounded-xl hover:bg-[#2d7a5a] disabled:opacity-60">
                          <CheckCircle size={13}/>{isApproving ? 'Đang duyệt...' : 'Duyệt dự án'}
                        </button>
                      </>
                    )}
                    {p.approvalStatus === 'APPROVED' && (
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1.5 bg-green-50 px-3 py-2 rounded-xl border border-green-100">
                        <CheckCircle size={12}/>Đã duyệt — Đang mở tuyển nhà thầu
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal duyệt/hủy đơn hàng */}
      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center ${noteModal.action === 'cancel' ? 'bg-red-50' : 'bg-green-50'}`}>
                {noteModal.action === 'cancel' ? <XCircle size={22} className="text-red-500"/> : <Gavel size={22} className="text-green-500"/>}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{noteModal.action === 'cancel' ? 'Hủy đơn hàng' : 'Duyệt & Mở đấu giá'}</h3>
                <p className="text-xs text-gray-400">{noteModal.code} · {customer.name}</p>
              </div>
            </div>
            {noteModal.action === 'approve' && (
              <p className="text-xs text-gray-500 mb-3 bg-blue-50 rounded-xl p-3 border border-blue-100">
                Đơn sẽ chuyển sang <strong>Đang đấu giá</strong>. Tất cả nhà thầu đã duyệt sẽ nhận thông báo.
              </p>
            )}
            <textarea rows={3} value={noteValue} onChange={e => setNoteValue(e.target.value)}
              placeholder={noteModal.action === 'cancel' ? 'Lý do hủy...' : 'Ghi chú cho khách hàng (không bắt buộc)...'}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-primary resize-none mb-4"/>
            <div className="flex gap-3">
              <button onClick={() => setNoteModal(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium">Hủy</button>
              <button onClick={noteModal.action === 'cancel' ? handleCancelOrder : handleApproveOrder} disabled={!!processing}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60 ${noteModal.action === 'cancel' ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'}`}>
                {processing ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal từ chối dự án */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center"><XCircle size={22} className="text-red-500"/></div>
              <div>
                <h3 className="font-bold text-gray-900">Từ chối dự án</h3>
                <p className="text-xs text-gray-400">{reviewModal.name}</p>
              </div>
            </div>
            <textarea rows={3} value={noteValue} onChange={e => setNoteValue(e.target.value)}
              placeholder="Lý do từ chối (sẽ hiển thị cho khách hàng)..."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-primary resize-none mb-4"/>
            <div className="flex gap-3">
              <button onClick={() => setReviewModal(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium">Hủy</button>
              <button onClick={handleRejectProject} disabled={!!processing}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold disabled:opacity-60">
                {processing ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Root Page ─────────────────────────────────────────────────────────────────
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ordRes, projRes] = await Promise.all([
        api.get('/admin/orders?status=all'),
        api.get('/admin/projects?status=all'),
      ]);
      setOrders(ordRes.data.data || ordRes.data || []);
      setProjects(projRes.data.data || []);
    } catch {
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Khi refresh, cập nhật lại customer đang xem
  const handleRefresh = useCallback(async () => {
    await fetchAll();
    // Sau khi fetch xong, cập nhật selectedCustomer với data mới
  }, [fetchAll]);

  // Build customer list
  const customers = React.useMemo(() => groupByCustomer(orders, projects), [orders, projects]);

  // Cập nhật selectedCustomer sau khi refresh
  useEffect(() => {
    if (selectedCustomer) {
      const updated = customers.find(c => c.id === selectedCustomer.id);
      if (updated) setSelectedCustomer(updated);
    }
  }, [customers]);

  const stats = {
    pendingOrders: orders.filter(o => o.status === 'PENDING').length,
    pendingProjects: projects.filter(p => p.approvalStatus === 'PENDING').length,
    processing: orders.filter(o => o.status === 'PROCESSING').length + projects.filter(p => p.status === 'IN_PROGRESS').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length + projects.filter(p => p.status === 'COMPLETED').length,
  };

  const totalNeedAction = stats.pendingOrders + stats.pendingProjects;

  return (
    <Layout title={selectedCustomer ? `${selectedCustomer.name} — Chi tiết hoạt động` : 'Quản lý Đơn hàng & Dự án'}>
      <div className="space-y-4">
        {/* Breadcrumb */}
        {selectedCustomer && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <button onClick={() => setSelectedCustomer(null)} className="hover:text-primary font-medium">Tất cả khách hàng</button>
            <ChevronRight size={12}/>
            <span className="text-primary font-bold">{selectedCustomer.name}</span>
          </div>
        )}

        {!selectedCustomer ? (
          <>
            {/* Alert banner nếu có việc cần làm */}
            {totalNeedAction > 0 && (
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-sm text-amber-800">
                <AlertCircle size={18} className="shrink-0 text-amber-500"/>
                <span>Có <strong>{totalNeedAction}</strong> mục cần xử lý: {stats.pendingOrders} đơn hàng và {stats.pendingProjects} dự án đang chờ duyệt.</span>
                <button onClick={fetchAll} className="ml-auto flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-900">
                  <RefreshCw size={13}/>Làm mới
                </button>
              </div>
            )}

            <CustomerListView
              customers={customers}
              loading={loading}
              search={search}
              onSearch={setSearch}
              onSelect={setSelectedCustomer}
              stats={stats}
            />
          </>
        ) : (
          <CustomerDetailView
            customer={selectedCustomer}
            onBack={() => setSelectedCustomer(null)}
            onRefresh={handleRefresh}
          />
        )}
      </div>
    </Layout>
  );
}
