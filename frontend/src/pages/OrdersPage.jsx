import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShoppingBag, Package, CheckCircle, XCircle, Clock,
  Plus, Gavel, Star, ArrowRight, Hammer,
  ShieldCheck, FileText, Loader2, Phone,
  MapPin, ChevronRight, ArrowLeft, Users, RefreshCw, Search,
  DollarSign, AlertCircle, Eye, Calendar, Building, History,
  TrendingUp, Award, Filter,
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';

const fmt = (n) =>
  n == null ? '0đ' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n).replace('₫', 'đ');
const fmtBudget = (n) =>
  n == null ? 'Thỏa thuận' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n).replace('₫', 'đ');

// ── Order status ──────────────────────────────────────────────────────────────
const ORDER_STATUS = {
  PENDING:        { label: 'Chờ Admin duyệt',  color: 'bg-amber-100 text-amber-700 border-amber-200',    dot: 'bg-amber-400 animate-pulse' },
  OPEN_BIDDING:   { label: 'Đang đấu giá',     color: 'bg-blue-100 text-blue-700 border-blue-200',      dot: 'bg-blue-400 animate-pulse'  },
  SHIPPED:        { label: 'Đang giao hàng',   color: 'bg-cyan-100 text-cyan-700 border-cyan-200',       dot: 'bg-cyan-400 animate-pulse'  },
  CANCELLED:      { label: 'Đã hủy',           color: 'bg-red-100 text-red-600 border-red-200',          dot: 'bg-red-400'                 },
};
const ORDER_STEPS = ['PENDING', 'OPEN_BIDDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

// ── Project status ────────────────────────────────────────────────────────────
const PROJECT_STATUS = {
  DRAFT:       { label: 'Nháp',          color: 'bg-gray-100 text-gray-500 border-gray-200',    dot: 'bg-gray-400'   },
  OPEN:        { label: 'Đang tuyển',    color: 'bg-blue-100 text-blue-700 border-blue-200',    dot: 'bg-blue-400 animate-pulse'   },
  CLOSED:      { label: 'Đã đóng',       color: 'bg-gray-100 text-gray-500 border-gray-200',    dot: 'bg-gray-300'   },
  CANCELLED:   { label: 'Đã hủy',        color: 'bg-red-100 text-red-600 border-red-200',       dot: 'bg-red-400'    },
};
const APPROVAL_STATUS = {
  PENDING:  { label: 'Chờ duyệt', color: 'bg-amber-50 text-amber-600 border-amber-200', icon: <AlertCircle size={10}/> },
  APPROVED: { label: 'Đã duyệt',  color: 'bg-green-50 text-green-600 border-green-200', icon: <CheckCircle size={10}/> },
  REJECTED: { label: 'Từ chối',   color: 'bg-red-50 text-red-600 border-red-200',       icon: <XCircle size={10}/> },
};

// ── Shared ────────────────────────────────────────────────────────────────────
function Badge({ label, color }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${color}`}>
      {label}
    </span>
  );
}

function OrderStatusBadge({ status }) {
  const cfg = ORDER_STATUS[status] || { label: status, color: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function Stepper({ currentStatus }) {
  if (currentStatus === 'CANCELLED') return null;
  const steps = ORDER_STEPS.filter(s => currentStatus === 'PENDING' ? true : s !== 'PENDING');
  const cur = steps.indexOf(currentStatus);
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
      {steps.map((s, i) => {
        const done = i <= cur; const active = i === cur;
        return (
          <React.Fragment key={s}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0
              ${done ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}
              ${active ? 'ring-2 ring-primary ring-offset-1' : ''}`}>
              {done && i < cur ? '✓' : i + 1}
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 min-w-[8px] ${i < cur ? 'bg-primary' : 'bg-gray-200'}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Tab: Đơn hàng — danh sách ────────────────────────────────────────────────
function OrderList({ orders, contracts, loading, onSelect, onRefresh }) {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const counts = Object.fromEntries(Object.keys(ORDER_STATUS).map(k => [k, orders.filter(o => o.status === k).length]));
  const filtered = orders.filter(o => {
    const ms = statusFilter === 'all' || o.status === statusFilter;
    const mq = !search.trim() || o.orderCode?.toLowerCase().includes(search.toLowerCase()) || o.deliveryAddress?.toLowerCase().includes(search.toLowerCase());
    return ms && mq;
  });
  const needAction = orders.filter(o => ['PENDING','OPEN_BIDDING','SHIPPED'].includes(o.status)).length;

  return (
    <div className="space-y-4">
      {/* Mini stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Tổng đơn',    value: orders.length,                                        color: 'text-gray-800',   bg: 'bg-white'      },
          { label: 'Cần xử lý',  value: needAction,                                            color: needAction > 0 ? 'text-red-600' : 'text-gray-400',   bg: needAction > 0 ? 'bg-red-50' : 'bg-gray-50'  },
          { label: 'Thi công',   value: orders.filter(o => o.status === 'PROCESSING').length,  color: 'text-indigo-600', bg: 'bg-indigo-50'  },
          { label: 'Hoàn thành', value: orders.filter(o => o.status === 'DELIVERED').length,   color: 'text-teal-600',   bg: 'bg-teal-50'    },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border border-gray-100 rounded-xl p-3 text-center`}>
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={13}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm mã đơn, địa chỉ..."
            className="w-full pl-8 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-primary"/>
        </div>
        <button onClick={onRefresh} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 shrink-0"><RefreshCw size={14}/></button>
        <button onClick={() => navigate('/shop/order')} className="flex items-center gap-1.5 bg-primary text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-primary/90 shrink-0">
          <Plus size={13}/> Đặt hàng
        </button>
      </div>

      {/* Status chips */}
      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => setStatusFilter('all')} className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${statusFilter === 'all' ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-500 hover:border-primary'}`}>
          Tất cả ({orders.length})
        </button>
        {Object.entries(ORDER_STATUS).map(([k, v]) => counts[k] > 0 && (
          <button key={k} onClick={() => setStatusFilter(k)} className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${statusFilter === k ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-500 hover:border-primary'}`}>
            {v.label} ({counts[k]})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-primary"/></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <ShoppingBag size={36} className="mx-auto text-gray-200 mb-3"/>
          <p className="text-gray-400 text-sm font-medium">Chưa có đơn hàng nào</p>
          <button onClick={() => navigate('/shop')} className="mt-4 px-5 py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary/90">Khám phá Shop</button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(o => {
            const lc = contracts.find(c => c.orderId === o.id);
            const hint = o.status === 'OPEN_BIDDING' ? '👥 Chờ bạn chọn nhà thầu'
              : o.status === 'PENDING' ? '⏳ Chờ Admin phê duyệt'
              : o.status === 'SHIPPED' ? '📦 Xác nhận khi nhận hàng'
              : lc?.status === 'WAITING_SIGNATURE' ? '✍️ Hợp đồng chờ ký'
              : null;
            return (
              <button key={o.id} onClick={() => onSelect(o)}
                className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-left hover:border-primary hover:shadow-sm transition-all group">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <OrderStatusBadge status={o.status}/>
                      <span className="text-[10px] font-mono font-bold text-gray-400">{o.orderCode}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${o.type === 'CUSTOM' ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-400'}`}>
                        {o.type === 'CUSTOM' ? '🎨 Thiết kế riêng' : '🛍️ Mua sẵn'}
                      </span>
                    </div>
                    {hint && <p className="text-[11px] font-semibold text-primary mt-0.5">{hint}</p>}
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <Clock size={10}/> {new Date(o.createdAt).toLocaleDateString('vi-VN')}
                      {o.deliveryAddress && <><span className="mx-1">·</span><MapPin size={10}/><span className="truncate max-w-[140px]">{o.deliveryAddress}</span></>}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-primary text-sm">
                      {['PENDING','OPEN_BIDDING'].includes(o.status) && o.type === 'CUSTOM' ? 'Đang báo giá' : fmt(o.totalAmount)}
                    </p>
                    <p className="text-[10px] text-gray-400">{o.items?.length || 0} sp</p>
                  </div>
                </div>
                <Stepper currentStatus={o.status}/>
                {o.items?.length > 0 && (
                  <div className="flex gap-1.5 mt-2 overflow-x-auto">
                    {o.items.slice(0,3).map((item, i) => (
                      <div key={i} className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1 shrink-0">
                        {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-5 h-5 rounded object-cover"/> : <Package size={12} className="text-gray-300"/>}
                        <span className="text-[10px] text-gray-500 max-w-[60px] truncate">{item.itemName}</span>
                      </div>
                    ))}
                    {o.items.length > 3 && <span className="text-[10px] text-gray-400 self-center">+{o.items.length-3}</span>}
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

// ── Tab: Dự án — danh sách ────────────────────────────────────────────────────
function ProjectList({ projects, loading, onSelect, onRefresh, isContractor }) {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const counts = Object.fromEntries(Object.keys(PROJECT_STATUS).map(k => [k, projects.filter(p => p.status === k).length]));
  const filtered = projects.filter(p => {
    const ms = statusFilter === 'all' || p.status === statusFilter;
    const mq = !search.trim() || p.name?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase());
    return ms && mq;
  });
  const pending = projects.filter(p => p.approvalStatus === 'PENDING').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Tổng dự án',  value: projects.length,        color: 'text-gray-800',   bg: 'bg-white'     },
          { label: 'Chờ duyệt',   value: pending,                 color: pending > 0 ? 'text-amber-600' : 'text-gray-400', bg: pending > 0 ? 'bg-amber-50' : 'bg-gray-50' },
          { label: 'Đang tuyển',  value: counts.OPEN || 0,        color: 'text-blue-600',   bg: 'bg-blue-50'   },
          { label: 'Thi công',    value: counts.IN_PROGRESS || 0, color: 'text-amber-600',  bg: 'bg-amber-50'  },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border border-gray-100 rounded-xl p-3 text-center`}>
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={13}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tên, hạng mục..."
            className="w-full pl-8 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-primary"/>
        </div>
        <button onClick={onRefresh} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 shrink-0"><RefreshCw size={14}/></button>
        {!isContractor ? (
          <button onClick={() => navigate('/projects/new')} className="flex items-center gap-1.5 bg-[#1a4f3a] text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#2d7a5a] shrink-0">
            <Plus size={13}/> Đăng dự án
          </button>
        ) : (
          <button onClick={() => navigate('/projects/browse')} className="flex items-center gap-1.5 bg-[#1a4f3a] text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#2d7a5a] shrink-0">
            <Search size={13}/> Tìm dự án
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => setStatusFilter('all')} className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${statusFilter === 'all' ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-500 hover:border-primary'}`}>
          Tất cả ({projects.length})
        </button>
        {Object.entries(PROJECT_STATUS).map(([k, v]) => counts[k] > 0 && (
          <button key={k} onClick={() => setStatusFilter(k)} className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${statusFilter === k ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-500 hover:border-primary'}`}>
            {v.label} ({counts[k]})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-primary"/></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="text-4xl mb-3">🏗️</div>
          <p className="text-gray-400 text-sm font-medium">Chưa có dự án nào</p>
          {!isContractor && (
            <button onClick={() => navigate('/projects/new')} className="mt-4 px-5 py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary/90">
              Tạo dự án đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(p => {
            const stCfg = PROJECT_STATUS[p.status] || PROJECT_STATUS.DRAFT;
            const apCfg = APPROVAL_STATUS[p.approvalStatus] || APPROVAL_STATUS.PENDING;
            return (
              <button key={p.id} onClick={() => onSelect(p)}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden text-left hover:border-primary hover:shadow-sm transition-all group">
                {p.imageUrls?.[0] && (
                  <div className="h-32 w-full bg-gray-100 overflow-hidden">
                    <img src={p.imageUrls[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <Badge label={stCfg.label} color={stCfg.color}/>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${apCfg.color}`}>
                      {apCfg.icon}{apCfg.label}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1.5 line-clamp-2">{p.name}</h3>
                  <div className="flex flex-wrap gap-2 text-[10px] text-gray-400 mb-2">
                    {p.address && <span className="flex items-center gap-0.5"><MapPin size={9}/>{p.address}</span>}
                    {p.category && <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">{p.category}</span>}
                    <span className="flex items-center gap-0.5"><Clock size={9}/>{new Date(p.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  {(p.budgetMin || p.budgetMax) && (
                    <div className="flex items-center gap-1 text-[10px] text-gray-600 bg-gray-50 rounded-lg px-2 py-1 w-fit mb-2">
                      <DollarSign size={10} className="text-primary"/>
                      <span className="font-semibold">{fmtBudget(p.budgetMin)} – {fmtBudget(p.budgetMax)}</span>
                    </div>
                  )}
                  {p.approvalStatus === 'REJECTED' && p.adminNote && (
                    <div className="flex items-start gap-1 bg-red-50 border border-red-200 rounded-lg px-2 py-1.5 text-[10px] text-red-700">
                      <XCircle size={10} className="mt-0.5 shrink-0"/><span><strong>Lý do:</strong> {p.adminNote}</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Chi tiết đơn hàng ─────────────────────────────────────────────────────────
function OrderDetail({ order: initialOrder, contracts, onBack, onRefresh }) {
  const navigate = useNavigate();
  const [order, setOrder] = useState(initialOrder);
  const [bids, setBids] = useState([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [accepting, setAccepting] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [confirmingDelivery, setConfirmingDelivery] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const [profileModal, setProfileModal] = useState(null); // contractorId
  const [profileData, setProfileData] = useState(null);
  const [profileWorks, setProfileWorks] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const handleOpenProfile = async (contractorId) => {
    setProfileModal(contractorId);
    setLoadingProfile(true);
    setProfileData(null);
    setProfileWorks([]);
    try {
      const profileRes = await api.get(`/public/contractor-profile/${contractorId}`);
      setProfileData(profileRes.data.data);
      const worksRes = await api.get(`/portfolio/contractor/${contractorId}`);
      setProfileWorks(worksRes.data.data || []);
    } catch {
      toast.error('Không thể tải hồ sơ năng lực nhà thầu');
    } finally {
      setLoadingProfile(false);
    }
  };

  const isProfileContractorAccepted = () => {
    if (!profileData) return false;
    const bid = bids.find(b => b.contractorId === profileData.id);
    return bid ? bid.status === 'ACCEPTED' : false;
  };

  const isCustom = order.type === 'CUSTOM';
  const linkedContract = contracts.find(c => c.orderId === order.id);
  const st = ORDER_STATUS[order.status] || {};
  const defaultTab = order.status === 'OPEN_BIDDING' ? 'bids' : linkedContract ? 'contract' : 'items';
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    if (['OPEN_BIDDING','BIDDING_CLOSED','PROCESSING','DELIVERED'].includes(order.status)) {
      setLoadingBids(true);
      api.get(`/order-bids/order/${order.id}`).then(r => setBids(r.data.data || [])).catch(() => {}).finally(() => setLoadingBids(false));
    }
    if (order.status === 'DELIVERED' && order.assignedContractorId) {
      api.get(`/reviews/check?referenceType=ORDER&referenceId=${order.id}`).then(r => setHasReviewed(r.data.data)).catch(() => {});
    }
  }, [order.id]);

  const handleCancel = async () => {
    if (!window.confirm('Xác nhận hủy đơn hàng này?')) return;
    setCancelling(true);
    try { await api.post(`/orders/${order.id}/cancel`); toast.success('Đã hủy đơn'); onRefresh(); onBack(); }
    catch (e) { toast.error(e.response?.data?.message || 'Không thể hủy'); } finally { setCancelling(false); }
  };

  const handleConfirmDelivery = async () => {
    if (!window.confirm('Xác nhận đã nhận hàng?')) return;
    setConfirmingDelivery(true);
    try { await api.post(`/orders/${order.id}/confirm-delivery`); toast.success('🎉 Đã xác nhận!'); onRefresh(); onBack(); }
    catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); } finally { setConfirmingDelivery(false); }
  };

  const handleAcceptBid = async (bidId) => {
    setAccepting(bidId);
    try { await api.post(`/order-bids/order/${order.id}/accept/${bidId}`); toast.success('🎉 Hợp đồng có hiệu lực!'); setConfirmModal(null); onRefresh(); onBack(); }
    catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); } finally { setAccepting(null); }
  };

  const tabs = [
    { key: 'items',    label: `Sản phẩm (${order.items?.length || 0})`, icon: <Package size={12}/> },
    ...(order.status === 'OPEN_BIDDING' || bids.length > 0 ? [{ key: 'bids', label: `Báo giá (${bids.length})`, icon: <Users size={12}/> }] : []),
    ...(linkedContract ? [{ key: 'contract', label: 'Hợp đồng', icon: <FileText size={12}/> }] : []),
  ];

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary group">
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform"/> Quay lại
      </button>

      {/* Hero */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-stretch">
          <div className={`w-1 shrink-0 ${(st.dot||'bg-gray-200').replace(' animate-pulse','')}`}/>
          <div className="flex-1 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <OrderStatusBadge status={order.status}/>
                  <span className="text-[10px] font-mono font-bold text-gray-400">{order.orderCode}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isCustom ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-400'}`}>
                    {isCustom ? '🎨 Thiết kế riêng' : '🛍️ Mua sẵn'}
                  </span>
                </div>
                <p className="text-xs text-gray-400"><Clock size={10} className="inline mr-1"/>{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wide text-[10px]">Tổng thanh toán</p>
                <p className="text-xl font-black text-primary">{isCustom && ['PENDING','OPEN_BIDDING'].includes(order.status) ? 'Đang báo giá...' : fmt(order.totalAmount)}</p>
              </div>
            </div>
            <div className="mt-3"><Stepper currentStatus={order.status}/></div>
            {order.deliveryAddress && (
              <p className="text-xs text-gray-500 flex items-start gap-1 mt-3"><MapPin size={11} className="mt-0.5 text-gray-400 shrink-0"/>{order.deliveryAddress}</p>
            )}
            {order.customRequirements && (
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mb-1">Yêu cầu thiết kế</p>
                <p className="text-xs text-amber-900 whitespace-pre-wrap">{order.customRequirements}</p>
              </div>
            )}
            {order.status === 'OPEN_BIDDING' && (
              <button
                type="button"
                onClick={() => setActiveTab('bids')}
                className="w-full text-left flex items-start gap-2 bg-[#e8f5ee] hover:bg-[#dcede3] border border-green-200 rounded-xl px-3 py-2.5 mt-3 text-xs text-[#1a4f3a] transition-all cursor-pointer"
              >
                <Gavel size={12} className="mt-0.5 shrink-0 text-[#1a4f3a]"/>
                <span className="flex-1">
                  {activeTab === 'bids' ? (
                    <><strong>Đang đấu giá!</strong> Xem danh sách báo giá thầu bên dưới, click <strong>"Xem hồ sơ thầu"</strong> để kiểm tra hồ sơ năng lực trước khi bấm <strong>"Chọn nhà thầu này"</strong>.</>
                  ) : (
                    <><strong>Đang đấu giá!</strong> Click tại đây hoặc chọn tab <strong>Báo giá ({bids.length})</strong> bên dưới để xem danh sách báo giá và chọn nhà thầu.</>
                  )}
                </span>
              </button>
            )}
            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
              {['PENDING','OPEN_BIDDING'].includes(order.status) && (
                <button onClick={handleCancel} disabled={cancelling} className="flex items-center gap-1 text-xs font-bold border-2 border-red-300 text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 disabled:opacity-60">
                  <XCircle size={12}/>{cancelling ? 'Đang hủy...' : 'Hủy đơn'}
                </button>
              )}
              {order.status === 'SHIPPED' && (
                <button onClick={handleConfirmDelivery} disabled={confirmingDelivery} className="flex items-center gap-1 text-xs font-bold bg-teal-600 text-white px-4 py-2 rounded-xl hover:bg-teal-700 disabled:opacity-60">
                  <CheckCircle size={12}/>{confirmingDelivery ? 'Đang xử lý...' : 'Xác nhận nhận hàng'}
                </button>
              )}
              {order.status === 'DELIVERED' && order.assignedContractorId && !linkedContract && (
                hasReviewed
                  ? <span className="flex items-center gap-1 px-3 py-2 bg-amber-50 text-amber-600 text-xs font-bold rounded-xl border border-amber-200"><Star size={11} fill="currentColor"/>Đã đánh giá</span>
                  : <button onClick={() => setReviewModal(true)} className="flex items-center gap-1 text-xs font-bold bg-amber-500 text-white px-4 py-2 rounded-xl hover:bg-amber-600"><Star size={12}/>Đánh giá</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1 flex-1 justify-center py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === t.key ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Tab: Items */}
      {activeTab === 'items' && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Sản phẩm</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500">SL</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {order.items?.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0"/> : <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><Package size={14} className="text-gray-300"/></div>}
                      <div><p className="font-semibold text-gray-900 text-xs">{item.itemName}</p>{item.customNote && <p className="text-[10px] text-amber-600">{item.customNote}</p>}</div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-gray-700 text-xs">{item.quantity}</td>
                  <td className="px-4 py-3 text-right font-black text-primary text-xs">{isCustom && ['PENDING','OPEN_BIDDING'].includes(order.status) ? '—' : fmt(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
            {!(['PENDING','OPEN_BIDDING'].includes(order.status) && isCustom) && (
              <tfoot className="bg-gray-50 border-t border-gray-100">
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-right text-xs font-bold text-gray-700">Tổng cộng:</td>
                  <td className="px-4 py-3 text-right font-black text-primary text-sm">{fmt(order.totalAmount)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {/* Tab: Bids */}
      {activeTab === 'bids' && (
        <div className="space-y-3">
          {loadingBids ? (
            <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-primary"/></div>
          ) : bids.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
              <Gavel size={28} className="mx-auto text-gray-200 mb-2"/>
              <p className="text-gray-400 text-sm">Chưa có báo giá nào</p>
            </div>
          ) : bids.map(b => (
            <div key={b.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${b.status === 'ACCEPTED' ? 'border-green-300' : 'border-gray-100'}`}>
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${b.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {b.status === 'ACCEPTED' ? <><CheckCircle size={9}/>Đã chọn</> : 'Đang chờ'}
                    </span>
                  </div>
                  <p className="font-bold text-gray-900 text-sm">{b.contractorName}</p>
                  <button
                    type="button"
                    onClick={() => handleOpenProfile(b.contractorId)}
                    className="text-[11px] text-blue-600 font-bold hover:underline mt-1.5 flex items-center gap-1"
                  >
                    🔍 Xem hồ sơ thầu
                  </button>
                  {b.contractorPhone && (
                    <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-1">
                      <Phone size={9}/>
                      {b.status === 'ACCEPTED' ? b.contractorPhone : '******** (Hiện sau khi chọn)'}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-primary">{fmt(b.quotedPrice)}</p>
                  {b.estimatedDays && <p className="text-[11px] text-gray-400">{b.estimatedDays} ngày</p>}
                </div>
              </div>
              {b.proposal && <p className="text-xs text-gray-600 bg-gray-50 rounded-xl p-3 mb-3 line-clamp-3">{b.proposal}</p>}
              {order.status === 'OPEN_BIDDING' && b.status !== 'ACCEPTED' && (
                <button onClick={() => setConfirmModal(b)}
                  className="w-full py-2.5 text-white text-xs font-bold rounded-xl bg-[#1a4f3a] hover:bg-[#2d7a5a] flex items-center justify-center gap-1.5">
                  <CheckCircle size={12}/>Chọn nhà thầu này
                </button>
              )}
              {b.status === 'ACCEPTED' && linkedContract && (
                <button onClick={() => navigate('/contracts')}
                  className="w-full py-2.5 text-white text-xs font-bold rounded-xl bg-green-600 hover:bg-green-700 flex items-center justify-center gap-1.5">
                  <ArrowRight size={12}/>Xem tiến độ thi công
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab: Contract */}
      {activeTab === 'contract' && linkedContract && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={16} className="text-primary"/>
            <h3 className="font-bold text-gray-900">Hợp đồng #{linkedContract.id}</h3>
            <span className={`ml-auto px-2.5 py-1 rounded-full text-[10px] font-bold ${linkedContract.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {linkedContract.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {linkedContract.contractorName && <div className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400 text-[10px] font-bold mb-1">NHÀ THẦU</p><p className="font-bold">{linkedContract.contractorName}</p></div>}
            {linkedContract.totalValue && <div className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400 text-[10px] font-bold mb-1">GIÁ TRỊ HĐ</p><p className="font-black text-primary">{fmt(linkedContract.totalValue)}</p></div>}
          </div>
          <button onClick={() => navigate('/contracts')}
            className="w-full py-2.5 text-white text-xs font-bold rounded-xl bg-primary hover:bg-primary/90 flex items-center justify-center gap-1.5">
            <Eye size={12}/>Xem hợp đồng đầy đủ
          </button>
        </div>
      )}

      {/* Modal chọn thầu */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-black text-gray-900 text-lg flex items-center gap-2"><CheckCircle size={20} className="text-green-500"/>Xác nhận chọn nhà thầu</h3>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <p className="font-black text-gray-900">{confirmModal.contractorName}</p>
              <div className="flex gap-4 mt-2 text-sm">
                <div><p className="text-[10px] text-gray-400">Giá trị HĐ</p><p className="font-black text-primary">{fmt(confirmModal.quotedPrice)}</p></div>
                {confirmModal.estimatedDays && <div><p className="text-[10px] text-gray-400">Thời gian</p><p className="font-bold text-gray-800">{confirmModal.estimatedDays} ngày</p></div>}
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
              <ShieldCheck size={12} className="inline mr-1.5"/>Hợp đồng tạo ngay, nhà thầu bắt đầu thi công, tiền escrow được khóa bảo đảm.
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal(null)} disabled={!!accepting} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50">Xem lại</button>
              <button onClick={() => handleAcceptBid(confirmModal.id)} disabled={accepting === confirmModal.id} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2">
                {accepting === confirmModal.id ? <><Loader2 size={14} className="animate-spin"/>Đang tạo...</> : <><CheckCircle size={14}/>Xác nhận</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal đánh giá */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2"><Star size={16} className="text-amber-500"/>Đánh giá nhà thầu</h3>
            <div className="flex gap-1 mb-4">
              {[1,2,3,4,5].map(s => <button key={s} onClick={() => setReviewData(d => ({...d, rating: s}))} className={`text-2xl ${s <= reviewData.rating ? 'text-amber-400' : 'text-gray-200'}`}>★</button>)}
              <span className="ml-2 text-sm font-black text-amber-600 self-center">{reviewData.rating}/5</span>
            </div>
            <textarea rows={4} value={reviewData.comment} onChange={e => setReviewData(d => ({...d, comment: e.target.value}))} placeholder="Nhận xét về tay nghề, chất lượng..." className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-primary resize-none mb-4"/>
            <div className="flex gap-3">
              <button onClick={() => setReviewModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium">Hủy</button>
              <button onClick={async () => {
                if (!reviewData.comment.trim()) return toast.error('Nhập nhận xét');
                setSubmittingReview(true);
                try {
                  await api.post('/reviews', { rating: reviewData.rating, comment: reviewData.comment, referenceType: 'ORDER', referenceId: order.id, revieweeId: order.assignedContractorId });
                  toast.success('Đã đánh giá!'); setHasReviewed(true); setReviewModal(false);
                } catch(e) { toast.error('Lỗi'); } finally { setSubmittingReview(false); }
              }} disabled={submittingReview} className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-1.5">
                {submittingReview ? <Loader2 size={13} className="animate-spin"/> : <Star size={13}/>}Gửi đánh giá
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Contractor Profile Modal */}
      {profileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            {loadingProfile ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Loader2 size={32} className="animate-spin text-primary mb-2" />
                <p className="text-xs">Đang tải hồ sơ nhà thầu...</p>
              </div>
            ) : profileData ? (
              <>
                {/* Header */}
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    {profileData.logoUrl ? (
                      <img src={profileData.logoUrl} alt="Logo" className="w-12 h-12 rounded-xl object-cover border border-gray-150" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[#e8f5ee] text-[#1a4f3a] flex items-center justify-center font-bold text-lg">
                        {profileData.companyName?.charAt(0) || 'C'}
                      </div>
                    )}
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-base">{profileData.companyName}</h3>
                      <p className="text-xs text-gray-400">Năm thành lập: {profileData.yearEstablished || '2020'}</p>
                    </div>
                  </div>
                  <button onClick={() => setProfileModal(null)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-250 flex items-center justify-center text-gray-500 font-bold">
                    ✕
                  </button>
                </div>

                {/* Info Card */}
                <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div>
                    <span className="text-gray-400 block mb-0.5">SỐ ĐIỆN THOẠI</span>
                    <span className="font-bold text-gray-800">
                      {isProfileContractorAccepted() ? (profileData.phoneNumber || '—') : '******** (Hiện sau khi chọn)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5">EMAIL</span>
                    <span className="font-bold text-gray-800">
                      {isProfileContractorAccepted() ? (profileData.email || '—') : '******** (Hiện sau khi chọn)'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400 block mb-0.5">ĐỊA CHỈ THI CÔNG</span>
                    <span className="font-bold text-gray-800">
                      {isProfileContractorAccepted() ? (profileData.address || '—') : '******** (Hiện sau khi chọn)'}
                    </span>
                  </div>
                </div>

                {/* Giới thiệu */}
                <div className="space-y-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Giới thiệu ngắn</span>
                  <p className="text-sm text-gray-700 leading-relaxed font-semibold italic bg-green-50/50 p-4 rounded-xl border border-green-100">
                    "{profileData.shortIntro || 'Chuyên thiết kế và thi công nội thất nhà ở, căn hộ, văn phòng.'}"
                  </p>
                </div>

                {/* Lĩnh vực & Cam kết */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Lĩnh vực hoạt động</span>
                    <div className="space-y-1 text-xs">
                      {profileData.designInterior && <p className="text-[#1a4f3a] font-semibold">☑ Thiết kế nội thất</p>}
                      {profileData.constructInterior && <p className="text-[#1a4f3a] font-semibold">☑ Thi công nội thất</p>}
                      {profileData.produceWood && <p className="text-[#1a4f3a] font-semibold">☑ Sản xuất đồ gỗ</p>}
                      {profileData.renovateHouse && <p className="text-[#1a4f3a] font-semibold">☑ Cải tạo nhà ở</p>}
                      {!profileData.designInterior && !profileData.constructInterior && !profileData.produceWood && !profileData.renovateHouse && (
                        <p className="text-gray-400 italic">Chưa cập nhật lĩnh vực</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Chính sách cam kết</span>
                    <div className="space-y-1 text-xs">
                      {profileData.warranty24Months && <p className="text-blue-700 font-semibold">✔ Bảo hành 24 tháng</p>}
                      {profileData.freeQuote && <p className="text-blue-700 font-semibold">✔ Báo giá miễn phí</p>}
                      {profileData.onTimeProgress && <p className="text-blue-700 font-semibold">✔ Thi công đúng tiến độ</p>}
                      {!profileData.warranty24Months && !profileData.freeQuote && !profileData.onTimeProgress && (
                        <p className="text-gray-400 italic">Chưa cập nhật chính sách</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Thống kê năng lực */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Thống kê năng lực</span>
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Kinh nghiệm</p>
                      <p className="font-extrabold text-sm text-gray-800 mt-1">{profileData.experienceYears || '0'} năm</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Dự án thầu</p>
                      <p className="font-extrabold text-sm text-gray-800 mt-1">{profileData.completedProjectsCount || '0'}</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Khách hàng</p>
                      <p className="font-extrabold text-sm text-gray-800 mt-1">{profileData.customerCount || '0+'}</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Đánh giá</p>
                      <p className="font-extrabold text-sm text-amber-500 mt-1">★ {profileData.rating?.toFixed(1) || '5.0'}</p>
                    </div>
                  </div>
                </div>

                {/* 3-5 Dự án tiêu biểu */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Công trình tiêu biểu đã hoàn thành</span>
                  {profileWorks && profileWorks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profileWorks.slice(0, 4).map(w => (
                        <div key={w.id} className="bg-gray-50 border border-gray-150 rounded-2xl p-4 flex flex-col justify-between">
                          <div>
                            <span className="text-[9px] font-bold text-[#1a4f3a] uppercase tracking-wider bg-[#e8f5ee] px-2 py-0.5 rounded">
                              {w.category || 'Công trình'}
                            </span>
                            <h4 className="font-bold text-gray-900 text-xs mt-1.5 line-clamp-1">{w.title}</h4>
                            {w.description && <p className="text-[11px] text-gray-500 line-clamp-2 mt-1">{w.description}</p>}
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-gray-400 mt-3 pt-2 border-t border-gray-100">
                            <span>📅 {w.completionYear || '2024'}</span>
                            <span className="font-bold text-[#1a4f3a]">{fmt(w.projectValue)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">Chưa cập nhật công trình tiêu biểu nào.</p>
                  )}
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button onClick={() => setProfileModal(null)} className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-light">
                    Đóng
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-400 text-xs">Không tìm thấy thông tin hồ sơ nhà thầu.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: Lịch sử đơn hàng (CUSTOMER) ────────────────────────────────────────
function OrderHistoryList({ loading, onRefresh }) {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loadingH, setLoadingH] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedDetail, setSelectedDetail] = useState(null);

  useEffect(() => {
    setLoadingH(true);
    api.get('/orders/history')
      .then(r => setHistory(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoadingH(false));
  }, []);

  const delivered = history.filter(o => o.status === 'DELIVERED');
  const cancelled = history.filter(o => o.status === 'CANCELLED');
  const totalSpent = delivered.reduce((s, o) => s + (o.totalAmount || 0), 0);

  const filtered = history.filter(o => {
    const ms = typeFilter === 'all' || o.status === typeFilter;
    const mq = !search.trim() || o.orderCode?.toLowerCase().includes(search.toLowerCase())
      || o.deliveryAddress?.toLowerCase().includes(search.toLowerCase());
    return ms && mq;
  });

  if (selectedDetail) {
    return (
      <div className="space-y-4">
        <button onClick={() => setSelectedDetail(null)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary group">
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform"/> Quay lại lịch sử
        </button>

        {/* Order Detail - Readonly history view */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-stretch">
            <div className={`w-1 shrink-0 ${selectedDetail.status === 'DELIVERED' ? 'bg-teal-400' : 'bg-red-400'}`}/>
            <div className="flex-1 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                      selectedDetail.status === 'DELIVERED'
                        ? 'bg-teal-100 text-teal-700 border-teal-200'
                        : 'bg-red-100 text-red-600 border-red-200'
                    }`}>
                      {selectedDetail.status === 'DELIVERED' ? <CheckCircle size={10}/> : <XCircle size={10}/>}
                      {selectedDetail.status === 'DELIVERED' ? 'Đã hoàn thành' : 'Đã hủy'}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-gray-400">{selectedDetail.orderCode}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${selectedDetail.type === 'CUSTOM' ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-400'}`}>
                      {selectedDetail.type === 'CUSTOM' ? '🎨 Thiết kế riêng' : '🛍️ Mua sẵn'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Clock size={10}/> Đặt: {new Date(selectedDetail.createdAt).toLocaleDateString('vi-VN')}</span>
                    {selectedDetail.deliveredAt && (
                      <span className="flex items-center gap-1"><CheckCircle size={10} className="text-teal-500"/> Hoàn thành: {new Date(selectedDetail.deliveredAt).toLocaleDateString('vi-VN')}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase tracking-wide text-[10px]">Tổng thanh toán</p>
                  <p className="text-2xl font-black text-primary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedDetail.totalAmount || 0).replace('₫','đ')}</p>
                  {selectedDetail.fullyPaid && <p className="text-[10px] text-teal-600 font-bold flex items-center justify-end gap-1 mt-0.5"><CheckCircle size={9}/>Đã thanh toán</p>}
                </div>
              </div>

              {/* Địa chỉ giao hàng */}
              {selectedDetail.deliveryAddress && (
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 mb-3 text-xs text-gray-600">
                  <MapPin size={11} className="text-gray-400 shrink-0"/>
                  <span>{selectedDetail.deliveryAddress}</span>
                </div>
              )}

              {/* Nhà thầu */}
              {selectedDetail.assignedContractorName && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-green-200 text-green-700 flex items-center justify-center font-bold text-sm shrink-0">
                    {selectedDetail.assignedContractorName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[10px] text-green-600 font-bold uppercase tracking-wide">Nhà thầu thực hiện</p>
                    <p className="text-sm font-bold text-green-900">{selectedDetail.assignedContractorName}</p>
                  </div>
                </div>
              )}

              {/* Completion image */}
              {selectedDetail.completionImageUrl && (
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Ảnh sản phẩm hoàn thiện</p>
                  <img src={selectedDetail.completionImageUrl} alt="hoàn thiện" className="rounded-xl max-h-52 object-cover border border-gray-100 w-full"/>
                </div>
              )}

              {/* Yêu cầu tùy chỉnh */}
              {selectedDetail.customRequirements && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                  <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mb-1">Yêu cầu thiết kế</p>
                  <p className="text-xs text-amber-900 whitespace-pre-wrap">{selectedDetail.customRequirements}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bảng sản phẩm */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
            <Package size={14} className="text-primary"/>
            <h3 className="font-bold text-gray-900 text-sm">Chi tiết sản phẩm ({selectedDetail.items?.length || 0})</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Sản phẩm</th>
                <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500">SL</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {selectedDetail.items?.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {item.imageUrl
                        ? <img src={item.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0"/>
                        : <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><Package size={14} className="text-gray-300"/></div>}
                      <div>
                        <p className="font-semibold text-gray-900 text-xs">{item.itemName}</p>
                        {item.customNote && <p className="text-[10px] text-amber-600">{item.customNote}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-gray-700 text-xs">{item.quantity}</td>
                  <td className="px-4 py-3 text-right font-black text-primary text-xs">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.subtotal || 0).replace('₫','đ')}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-100">
              <tr>
                <td colSpan={2} className="px-4 py-3 text-right text-xs font-bold text-gray-700">Tổng cộng:</td>
                <td className="px-4 py-3 text-right font-black text-primary text-sm">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedDetail.totalAmount || 0).replace('₫','đ')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Ghi chú xử lý */}
        {selectedDetail.processingNote && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 text-xs text-blue-800">
            <p className="font-bold mb-1 flex items-center gap-1.5"><FileText size={11}/>Ghi chú từ Admin</p>
            <p>{selectedDetail.processingNote}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tổng quan */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Tổng đơn', value: history.length, color: 'text-gray-800', bg: 'bg-white border-gray-100' },
          { label: 'Hoàn thành', value: delivered.length, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-100' },
          { label: 'Đã hủy', value: cancelled.length, color: 'text-red-500', bg: 'bg-red-50 border-red-100' },
          { label: 'Tổng chi tiêu', value: new Intl.NumberFormat('vi-VN').format(totalSpent) + 'đ', color: 'text-primary', bg: 'bg-primary/5 border-primary/10', small: true },
        ].map(s => (
          <div key={s.label} className={`border rounded-2xl p-4 text-center ${s.bg}`}>
            <p className={`${s.small ? 'text-base' : 'text-2xl'} font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-500 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={13}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm mã đơn, địa chỉ..."
            className="w-full pl-8 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-primary"/>
        </div>
        <button onClick={() => {
          setLoadingH(true);
          api.get('/orders/history').then(r => setHistory(r.data.data || [])).catch(() => {}).finally(() => setLoadingH(false));
        }} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 shrink-0"><RefreshCw size={14}/></button>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { key: 'all', label: `Tất cả (${history.length})` },
          { key: 'DELIVERED', label: `Hoàn thành (${delivered.length})` },
          { key: 'CANCELLED', label: `Đã hủy (${cancelled.length})` },
        ].map(f => (
          <button key={f.key} onClick={() => setTypeFilter(f.key)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
              typeFilter === f.key ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-500 hover:border-primary'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {loadingH ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-primary"/></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <History size={36} className="mx-auto text-gray-200 mb-3"/>
          <p className="text-gray-400 text-sm font-medium">Chưa có lịch sử đơn hàng nào</p>
          <button onClick={() => navigate('/shop')} className="mt-4 px-5 py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary/90">Khám phá Shop</button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(o => (
            <button key={o.id} onClick={() => setSelectedDetail(o)}
              className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-left hover:border-primary hover:shadow-sm transition-all group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      o.status === 'DELIVERED'
                        ? 'bg-teal-100 text-teal-700 border-teal-200'
                        : 'bg-red-100 text-red-600 border-red-200'
                    }`}>
                      {o.status === 'DELIVERED' ? <CheckCircle size={9}/> : <XCircle size={9}/>}
                      {o.status === 'DELIVERED' ? 'Hoàn thành' : 'Đã hủy'}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-gray-400">{o.orderCode}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${o.type === 'CUSTOM' ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-400'}`}>
                      {o.type === 'CUSTOM' ? '🎨 Thiết kế riêng' : '🛍️ Mua sẵn'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1"><Clock size={9}/>{new Date(o.createdAt).toLocaleDateString('vi-VN')}</span>
                    {o.deliveredAt && <span className="flex items-center gap-1 text-teal-500 font-medium"><CheckCircle size={9}/>Xong: {new Date(o.deliveredAt).toLocaleDateString('vi-VN')}</span>}
                    {o.deliveryAddress && <span className="flex items-center gap-1 truncate max-w-[160px]"><MapPin size={9}/>{o.deliveryAddress}</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black text-primary text-sm">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(o.totalAmount || 0).replace('₫','đ')}</p>
                  <p className="text-[10px] text-gray-400">{o.items?.length || 0} sản phẩm</p>
                </div>
              </div>
              {o.items?.length > 0 && (
                <div className="flex gap-1.5 mt-2.5 overflow-x-auto">
                  {o.items.slice(0,3).map((item, i) => (
                    <div key={i} className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1 shrink-0">
                      {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-5 h-5 rounded object-cover"/> : <Package size={12} className="text-gray-300"/>}
                      <span className="text-[10px] text-gray-500 max-w-[60px] truncate">{item.itemName}</span>
                    </div>
                  ))}
                  {o.items.length > 3 && <span className="text-[10px] text-gray-400 self-center">+{o.items.length-3}</span>}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Root Page ─────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeMainTab = searchParams.get('tab') || 'orders';
  const setMainTab = (tab) => setSearchParams({ tab });

  const isContractor = user?.role === 'CONTRACTOR';

  const [orders, setOrders] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const [ordRes, ctrRes] = await Promise.all([
        api.get('/orders/my'),
        api.get('/contracts/my').catch(() => ({ data: { data: [] } })),
      ]);
      setOrders(ordRes.data.data || []);
      setContracts(ctrRes.data.data || []);
    } catch { toast.error('Không thể tải đơn hàng'); }
    finally { setLoadingOrders(false); }
  }, []);

  const fetchProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const res = await api.get('/projects/my');
      setProjects(res.data.data || []);
    } catch { toast.error('Không thể tải dự án'); }
    finally { setLoadingProjects(false); }
  }, []);

  useEffect(() => { fetchOrders(); fetchProjects(); }, [fetchOrders, fetchProjects]);

  // Contractor dùng trang riêng — redirect sau khi hooks đã được khai báo
  useEffect(() => {
    if (isContractor) navigate('/order-bidding', { replace: true });
  }, [isContractor, navigate]);

  const orderNeedAction   = orders.filter(o => ['PENDING','OPEN_BIDDING','SHIPPED'].includes(o.status)).length;
  const projectNeedAction = projects.filter(p => p.approvalStatus === 'PENDING' || p.status === 'OPEN').length;
  const deliveredCount    = orders.filter(o => o.status === 'DELIVERED').length;

  if (selectedOrder) {
    return (
      <Layout title={selectedOrder.orderCode}>
        <div className="max-w-3xl mx-auto">
          <OrderDetail order={selectedOrder} contracts={contracts} onBack={() => setSelectedOrder(null)} onRefresh={fetchOrders}/>
        </div>
      </Layout>
    );
  }

  if (selectedProject) {
    navigate(`/projects/${selectedProject.id}`);
    return null;
  }

  return (
    <Layout title="Hoạt động của tôi">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Header */}
        {/*  */}

        {/* Main tabs */}
        <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 p-1.5 shadow-sm">
          {[
            { key: 'orders',   icon: <ShoppingBag size={15}/>, label: 'Đơn hàng',                               badge: orderNeedAction   },
            { key: 'projects', icon: <Hammer size={15}/>,       label: isContractor ? 'Dự án tham gia' : 'Dự án của tôi', badge: projectNeedAction },
            { key: 'history',  icon: <History size={15}/>,      label: 'Lịch sử',                               badge: 0                 },
          ].map(t => (
            <button key={t.key} onClick={() => setMainTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all relative ${
                activeMainTab === t.key ? 'bg-primary text-white shadow-sm shadow-primary/30' : 'text-gray-500 hover:bg-gray-50'
              }`}>
              {t.icon}{t.label}
              {t.badge > 0 && (
                <span className={`absolute top-1.5 right-2 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${activeMainTab === t.key ? 'bg-white text-primary' : 'bg-red-500 text-white'}`}>
                  {t.badge > 9 ? '9+' : t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeMainTab === 'orders' && (
          <OrderList orders={orders.filter(o => !['DELIVERED','CANCELLED'].includes(o.status))} contracts={contracts} loading={loadingOrders} onSelect={setSelectedOrder} onRefresh={fetchOrders}/>
        )}
        {activeMainTab === 'projects' && (
          <ProjectList projects={projects} loading={loadingProjects} onSelect={setSelectedProject} onRefresh={fetchProjects} isContractor={isContractor}/>
        )}
        {activeMainTab === 'history' && (
          <OrderHistoryList loading={loadingOrders} onRefresh={fetchOrders}/>
        )}
      </div>
    </Layout>
  );
}
