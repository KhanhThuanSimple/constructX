import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import {
  Gavel, Search, ChevronDown, ChevronUp, Plus, X,
  Send, Clock, Package, CheckCircle, AlertCircle,
  FileText, Truck, BadgeCheck, ClipboardList,
  Camera, MapPin, DollarSign, Calendar, Building,
  RefreshCw, Loader2, Award,
  Hammer, ShoppingBag, ArrowUpRight, Phone,
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) =>
  n == null ? '—' :
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n).replace('₫', 'đ');
const fmtBudget = (n) =>
  n == null ? 'Thỏa thuận' :
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n).replace('₫', 'đ');
const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 60000);
  if (diff < 1) return 'Vừa đăng';
  if (diff < 60) return `${diff} phút trước`;
  if (diff < 1440) return `${Math.floor(diff / 60)} giờ trước`;
  return `${Math.floor(diff / 1440)} ngày trước`;
};

const EMPTY_ITEM = { itemName: '', unit: 'cái', quantity: 1, unitPrice: '', description: '', sampleImageUrl: '' };

// ── Status configs ────────────────────────────────────────────────────────────
const BID_STATUS = {
  PENDING:  { label: 'Chờ kết quả', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400 animate-pulse' },
  ACCEPTED: { label: 'Được chọn',   color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  REJECTED: { label: 'Không được chọn', color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400' },
};
const ORDER_STATUS = {
  BIDDING_CLOSED: { label: 'Đã chọn thầu',  color: 'bg-purple-100 text-purple-700', icon: <BadgeCheck size={12}/> },
  PROCESSING:     { label: 'Đang thi công',  color: 'bg-indigo-100 text-indigo-700', icon: <Hammer size={12}/> },
  SHIPPED:        { label: 'Đang giao hàng', color: 'bg-cyan-100 text-cyan-700',     icon: <Truck size={12}/> },
  DELIVERED:      { label: 'Hoàn thành',     color: 'bg-green-100 text-green-700',   icon: <CheckCircle size={12}/> },
  CANCELLED:      { label: 'Đã hủy',         color: 'bg-red-100 text-red-600',       icon: <X size={12}/> },
};

// ── Shared badge components ───────────────────────────────────────────────────
function StatusDot({ cfg }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}/>
      {cfg.label}
    </span>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, bg }) {
  return (
    <div className={`${bg} rounded-2xl p-4 flex items-center gap-4`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} bg-white/60 shrink-0`}>
        {icon}
      </div>
      <div>
        <p className={`text-2xl font-black ${color}`}>{value}</p>
        <p className="text-xs font-bold text-gray-700">{label}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Tab Button ────────────────────────────────────────────────────────────────
function TabBtn({ active, onClick, icon, label, badge, color = 'primary' }) {
  const activeColors = {
    primary: 'bg-[#1a4f3a] text-white shadow-sm',
    amber:   'bg-amber-500 text-white shadow-sm',
    blue:    'bg-blue-600 text-white shadow-sm',
    indigo:  'bg-indigo-600 text-white shadow-sm',
  };
  return (
    <button onClick={onClick}
      className={`relative flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-bold transition-all ${
        active ? activeColors[color] : 'text-gray-500 hover:bg-gray-50'
      }`}>
      {icon}{label}
      {badge != null && badge > 0 && (
        <span className={`absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black flex items-center justify-center ${
          active ? 'bg-white/30 text-white' : 'bg-red-500 text-white'
        }`}>{badge > 9 ? '9+' : badge}</span>
      )}
    </button>
  );
}

// ── ORDER CARD (đơn hàng mở đấu giá) ─────────────────────────────────────────
function OpenOrderCard({ order, alreadyBid, onBid, expanded, onToggle }) {
  return (
    <div className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all ${
      alreadyBid ? 'border-green-200' : 'border-gray-100 hover:border-[#1a4f3a]/30'
    }`}>
      {/* Top accent */}
      <div className={`h-1 w-full ${alreadyBid ? 'bg-green-400' : 'bg-gradient-to-r from-blue-400 to-indigo-500'}`}/>
      <div className="p-5">
        {/* Header row */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-black px-2.5 py-1 rounded-full">
                <Gavel size={9}/> Đang mở đấu giá
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                order.type === 'CUSTOM' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-sky-50 text-sky-600 border border-sky-200'
              }`}>
                {order.type === 'CUSTOM' ? '🎨 Tùy chỉnh' : '🛍️ Có sẵn'}
              </span>
              {alreadyBid && (
                <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  <CheckCircle size={9}/> Đã gửi báo giá
                </span>
              )}
            </div>
            <p className="font-black text-gray-800 font-mono text-sm">{order.orderCode}</p>
            <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
              <Clock size={10}/> {timeAgo(order.createdAt)}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Khu vực</p>
            <p className="text-sm font-semibold text-gray-700 max-w-[140px] text-right">{order.deliveryAddress || '—'}</p>
          </div>
        </div>

        {/* Custom requirements preview */}
        {order.customRequirements && (
          <div className={`bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 ${!expanded ? 'line-clamp-2' : ''}`}>
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Yêu cầu của khách hàng</p>
            <p className="text-xs text-amber-900 whitespace-pre-wrap leading-relaxed">{order.customRequirements}</p>
          </div>
        )}

        {/* Items pills */}
        {order.items?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {order.items.slice(0, 4).map((it, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-xl px-2.5 py-1.5">
                {it.imageUrl
                  ? <img src={it.imageUrl} alt="" className="w-6 h-6 rounded-lg object-cover"/>
                  : <Package size={12} className="text-gray-300"/>}
                <span className="text-[11px] font-medium text-gray-700">{it.itemName}</span>
                <span className="text-[10px] text-gray-400">×{it.quantity}</span>
              </div>
            ))}
            {order.items.length > 4 && (
              <span className="flex items-center text-[11px] text-gray-400 px-2">+{order.items.length - 4} mục</span>
            )}
          </div>
        )}

        {/* Expanded: reference image */}
        {expanded && order.referenceImageUrl && (
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Ảnh tham khảo</p>
            <img src={order.referenceImageUrl} alt="tham khảo" className="rounded-xl max-h-52 object-cover border border-gray-100 w-full"/>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <button onClick={onToggle}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors">
            {expanded ? <><ChevronUp size={14}/> Ẩn bớt</> : <><ChevronDown size={14}/> Xem thêm</>}
          </button>
          {!alreadyBid ? (
            <button onClick={() => onBid(order)}
              className="flex items-center gap-2 bg-[#1a4f3a] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[#2d7a5a] transition-colors shadow-sm shadow-[#1a4f3a]/20">
              <Send size={13}/> Gửi báo giá
            </button>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-4 py-2 rounded-xl border border-green-200">
              <CheckCircle size={13}/> Đã gửi báo giá
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── PROJECT CARD (dự án mở đấu thầu) ─────────────────────────────────────────
function OpenProjectCard({ project, onView }) {
  const fmtB = (min, max) => {
    if (!min && !max) return 'Thỏa thuận';
    if (!min) return `≤ ${fmtBudget(max)}`;
    if (!max) return `≥ ${fmtBudget(min)}`;
    return `${fmtBudget(min)} – ${fmtBudget(max)}`;
  };
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 hover:border-[#1a4f3a]/30 shadow-sm overflow-hidden transition-all group">
      <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-teal-500"/>
      {project.imageUrls?.[0] && (
        <div className="h-40 w-full overflow-hidden bg-gray-100">
          <img src={project.imageUrls[0]} alt={project.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
        </div>
      )}
      <div className="p-5">
        {/* Category + time */}
        <div className="flex items-center justify-between mb-2">
          {project.category && (
            <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-full">
              {project.category}
            </span>
          )}
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
            <Clock size={9}/> {timeAgo(project.createdAt)}
          </span>
        </div>

        <h3 className="font-black text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-[#1a4f3a] transition-colors">
          {project.name}
        </h3>

        {/* Meta */}
        <div className="space-y-1.5 mb-4">
          {project.address && (
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <MapPin size={10} className="text-gray-400 shrink-0"/>
              <span className="truncate">{project.address}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <DollarSign size={10} className="text-emerald-500 shrink-0"/>
            <span className="font-semibold text-gray-700">{fmtB(project.budgetMin, project.budgetMax)}</span>
          </div>
          {project.area && (
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <Building size={10} className="text-gray-400 shrink-0"/>
              <span>Diện tích: <strong>{project.area} m²</strong></span>
            </div>
          )}
        </div>

        {/* Description preview */}
        {project.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-4 bg-gray-50 rounded-xl px-3 py-2">
            {project.description}
          </p>
        )}

        {/* Style tags */}
        {project.style && (
          <div className="flex flex-wrap gap-1 mb-4">
            <span className="bg-purple-50 text-purple-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-100">
              {project.style}
            </span>
            {project.bidType && (
              <span className="bg-gray-50 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-200">
                {project.bidType === 'FIXED_PRICE' ? '💰 Giá cố định' : '🤝 Thương lượng'}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1a4f3a] to-[#2d7a5a] text-white flex items-center justify-center text-[10px] font-black">
              {project.user?.fullName?.charAt(0) || project.customerName?.charAt(0) || 'K'}
            </div>
            <span className="text-[11px] font-medium text-gray-600">
              {project.user?.fullName || project.customerName || 'Khách hàng'}
            </span>
          </div>
          <button onClick={() => onView(project.id)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#1a4f3a] hover:gap-2.5 transition-all bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 hover:bg-emerald-100">
            Xem dự án <ArrowUpRight size={13}/>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MY BID CARD ───────────────────────────────────────────────────────────────
function MyBidCard({ bid }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = BID_STATUS[bid.status] || BID_STATUS.PENDING;
  return (
    <div className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden ${
      bid.status === 'ACCEPTED' ? 'border-green-300' :
      bid.status === 'REJECTED' ? 'border-gray-200' : 'border-amber-200'
    }`}>
      <div className={`h-1 w-full ${
        bid.status === 'ACCEPTED' ? 'bg-green-400' :
        bid.status === 'REJECTED' ? 'bg-gray-300' : 'bg-amber-400'
      }`}/>
      <div className="p-5">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <StatusDot cfg={cfg}/>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                bid.orderType === 'CUSTOM' ? 'bg-amber-50 text-amber-600' : 'bg-sky-50 text-sky-600'
              }`}>
                {bid.orderType === 'CUSTOM' ? '🎨 Tùy chỉnh' : '🛍️ Có sẵn'}
              </span>
            </div>
            <p className="font-mono font-bold text-gray-800 text-sm">{bid.orderCode}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{timeAgo(bid.createdAt)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Báo giá của tôi</p>
            <p className="text-xl font-black text-[#1a4f3a]">{bid.quotedPrice ? fmt(bid.quotedPrice) : '—'}</p>
            {bid.estimatedDays && (
              <p className="text-[11px] text-gray-400 flex items-center justify-end gap-1">
                <Calendar size={9}/> {bid.estimatedDays} ngày
              </p>
            )}
          </div>
        </div>

        {/* Accepted alert */}
        {bid.status === 'ACCEPTED' && (
          <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl p-3 mb-3 text-xs text-green-800">
            <CheckCircle size={14} className="mt-0.5 text-green-600 shrink-0"/>
            <span><strong>🎉 Chúc mừng!</strong> Khách hàng đã chọn báo giá của bạn. Kiểm tra tab <strong>Đơn được giao</strong> để tiếp tục.</span>
          </div>
        )}
        {bid.status === 'REJECTED' && (
          <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3 mb-3 text-xs text-gray-500">
            <AlertCircle size={14} className="mt-0.5 shrink-0"/>
            <span>Không được chọn lần này. Tiếp tục tham gia các đơn khác để nâng cao cơ hội!</span>
          </div>
        )}

        {/* Proposal */}
        {bid.proposal && (
          <div className={`bg-gray-50 rounded-xl px-3 py-2.5 mb-3 ${!expanded ? 'line-clamp-2' : ''}`}>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Giải pháp đề xuất</p>
            <p className="text-xs text-gray-700 leading-relaxed">{bid.proposal}</p>
          </div>
        )}

        {/* Items table */}
        {expanded && bid.items?.length > 0 && (
          <div className="overflow-x-auto mb-3 rounded-xl border border-gray-100">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold text-gray-500">Hạng mục</th>
                  <th className="text-center px-2 py-2 font-semibold text-gray-500">SL</th>
                  <th className="text-right px-2 py-2 font-semibold text-gray-500">Đơn giá</th>
                  <th className="text-right px-3 py-2 font-semibold text-gray-500">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bid.items.map((it, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-gray-800">{it.itemName}</td>
                    <td className="px-2 py-2 text-center text-gray-500">{it.quantity} {it.unit}</td>
                    <td className="px-2 py-2 text-right text-gray-600">{fmt(it.unitPrice)}</td>
                    <td className="px-3 py-2 text-right font-bold text-[#1a4f3a]">{fmt(it.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#1a4f3a]/5">
                <tr>
                  <td colSpan={3} className="px-3 py-2 text-right font-bold text-gray-700">Tổng:</td>
                  <td className="px-3 py-2 text-right font-black text-[#1a4f3a]">{fmt(bid.quotedPrice)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <button onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors">
          {expanded ? <><ChevronUp size={13}/> Ẩn chi tiết</> : <><ChevronDown size={13}/> Xem chi tiết báo giá</>}
        </button>
      </div>
    </div>
  );
}

// ── ASSIGNED ORDER CARD ───────────────────────────────────────────────────────
function AssignedOrderCard({ order, onMarkDone }) {
  const [expanded, setExpanded] = useState(false);
  const stCfg = ORDER_STATUS[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-600', icon: null };
  const canMarkDone = order.status === 'PROCESSING' && !order.contractorMarkedDone;

  return (
    <div className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden ${
      order.status === 'PROCESSING' ? 'border-indigo-200' :
      order.status === 'DELIVERED'  ? 'border-green-200'  : 'border-gray-100'
    }`}>
      <div className={`h-1 w-full ${
        order.status === 'PROCESSING' ? 'bg-indigo-500' :
        order.status === 'DELIVERED'  ? 'bg-green-500'  :
        order.status === 'SHIPPED'    ? 'bg-cyan-500'   : 'bg-gray-300'
      }`}/>
      <div className="p-5">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${stCfg.color}`}>
                {stCfg.icon} {stCfg.label}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                order.type === 'CUSTOM' ? 'bg-amber-50 text-amber-600' : 'bg-sky-50 text-sky-600'
              }`}>
                {order.type === 'CUSTOM' ? '🎨 Tùy chỉnh' : '🛍️ Có sẵn'}
              </span>
            </div>
            <p className="font-mono font-bold text-gray-800 text-sm">{order.orderCode}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{timeAgo(order.createdAt)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Giá trị đơn</p>
            <p className="text-xl font-black text-[#1a4f3a]">{fmt(order.totalAmount)}</p>
            {order.depositAmount && (
              <p className="text-[11px] text-gray-400">Cọc: {fmt(order.depositAmount)}</p>
            )}
          </div>
        </div>

        {/* Status messages */}
        {order.status === 'BIDDING_CLOSED' && (
          <div className="flex items-start gap-2 bg-purple-50 border border-purple-200 rounded-xl p-3 mb-3 text-xs text-purple-800">
            <BadgeCheck size={14} className="mt-0.5 text-purple-600 shrink-0"/>
            <span><strong>Bạn đã được chọn!</strong> Chờ khách đặt cọc và hợp đồng được kích hoạt trước khi bắt đầu sản xuất.</span>
          </div>
        )}
        {order.status === 'PROCESSING' && (
          <div className="flex items-start gap-2 bg-indigo-50 border border-indigo-200 rounded-xl p-3 mb-3 text-xs text-indigo-800">
            <Hammer size={14} className="mt-0.5 text-indigo-500 shrink-0"/>
            <span>Đang thi công. Khi hoàn thiện, nhấn <strong>"Báo hoàn thành"</strong> và upload ảnh sản phẩm thực tế.</span>
          </div>
        )}
        {order.contractorMarkedDone && order.status === 'SHIPPED' && (
          <div className="flex items-start gap-2 bg-cyan-50 border border-cyan-200 rounded-xl p-3 mb-3 text-xs text-cyan-800">
            <Truck size={14} className="mt-0.5 text-cyan-500 shrink-0"/>
            <span>Đã báo hoàn thành lúc <strong>{order.contractorDoneAt ? new Date(order.contractorDoneAt).toLocaleString('vi-VN') : '—'}</strong>. Chờ khách xác nhận (tự động sau 24h).</span>
          </div>
        )}
        {order.status === 'DELIVERED' && (
          <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl p-3 mb-3 text-xs text-green-800">
            <CheckCircle size={14} className="mt-0.5 text-green-600 shrink-0"/>
            <span><strong>🎉 Hoàn thành!</strong> Thanh toán đã được giải ngân vào ví của bạn.</span>
          </div>
        )}

        {/* Completion image */}
        {order.completionImageUrl && (
          <div className="mb-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Ảnh sản phẩm hoàn thiện</p>
            <img src={order.completionImageUrl} alt="hoàn thiện" className="rounded-xl max-h-44 object-cover border border-gray-100 w-full"/>
          </div>
        )}

        {/* Items preview */}
        {order.items?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {order.items.slice(0, 3).map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-2.5 py-1.5">
                {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-6 h-6 rounded-lg object-cover"/> : <Package size={12} className="text-gray-300"/>}
                <span className="text-[11px] font-medium text-gray-700 max-w-[80px] truncate">{item.itemName}</span>
                <span className="text-[10px] text-gray-400">×{item.quantity}</span>
              </div>
            ))}
            {order.items.length > 3 && <span className="text-[11px] text-gray-400 self-center">+{order.items.length-3}</span>}
          </div>
        )}

        {/* Expanded details */}
        {expanded && (
          <div className="border-t border-gray-100 mt-3 pt-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {order.deliveryAddress && (
                <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Giao đến</p>
                  <p className="text-xs text-gray-700 flex items-start gap-1">
                    <MapPin size={10} className="mt-0.5 text-gray-400 shrink-0"/>{order.deliveryAddress}
                  </p>
                </div>
              )}
              {order.contactPhone && (
                <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Liên hệ</p>
                  <p className="text-xs text-gray-700 flex items-center gap-1">
                    <Phone size={10} className="text-gray-400"/>{order.contactPhone}
                  </p>
                </div>
              )}
            </div>
            {order.customRequirements && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Yêu cầu tùy chỉnh</p>
                <p className="text-xs text-amber-900 whitespace-pre-wrap">{order.customRequirements}</p>
              </div>
            )}
            {/* Full items table */}
            {order.items?.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold text-gray-500">Sản phẩm</th>
                      <th className="text-center px-2 py-2 font-semibold text-gray-500">SL</th>
                      <th className="text-right px-3 py-2 font-semibold text-gray-500">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {order.items.map((item, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0"/> : <Package size={14} className="text-gray-200 shrink-0"/>}
                            <div>
                              <p className="font-medium text-gray-800">{item.itemName}</p>
                              {item.customNote && <p className="text-gray-400 text-[10px]">{item.customNote}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2.5 text-center text-gray-600">{item.quantity}</td>
                        <td className="px-3 py-2.5 text-right font-bold text-[#1a4f3a]">{fmt(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#1a4f3a]/5">
                    <tr>
                      <td colSpan={2} className="px-3 py-2 text-right font-bold text-gray-700">Tổng:</td>
                      <td className="px-3 py-2 text-right font-black text-[#1a4f3a]">{fmt(order.totalAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <button onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors">
            {expanded ? <><ChevronUp size={13}/> Ẩn</> : <><ChevronDown size={13}/> Chi tiết đơn hàng</>}
          </button>
          {canMarkDone && (
            <button onClick={() => onMarkDone(order)}
              className="flex items-center gap-2 bg-[#1a4f3a] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[#2d7a5a] transition-colors shadow-sm shadow-[#1a4f3a]/20">
              <Camera size={13}/> Báo hoàn thành
            </button>
          )}
          {order.status === 'DELIVERED' && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
              <Award size={13}/> Hoàn thành & đã thanh toán
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── BID FORM MODAL ────────────────────────────────────────────────────────────
function BidFormModal({ order, onClose, onSuccess }) {
  const [form, setForm] = useState({
    quotedPrice: '', estimatedDays: '', proposal: '',
    portfolioImageUrl: '', items: [{ ...EMPTY_ITEM }]
  });
  const [submitting, setSubmitting] = useState(false);

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }));
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, j) => j !== i) }));
  const updateItem = (i, field, val) => setForm(f => ({
    ...f, items: f.items.map((it, j) => j === i ? { ...it, [field]: val } : it)
  }));
  const totalBid = form.items.reduce((s, it) => s + (Number(it.unitPrice)||0)*(Number(it.quantity)||0), 0);

  const handleSubmit = async () => {
    if (!form.estimatedDays) { toast.error('Vui lòng nhập số ngày dự kiến'); return; }
    if (!form.proposal?.trim()) { toast.error('Vui lòng nhập mô tả giải pháp'); return; }
    for (const it of form.items) {
      if (!it.itemName?.trim()) { toast.error('Vui lòng nhập tên hạng mục'); return; }
    }
    setSubmitting(true);
    try {
      await api.post(`/order-bids/${order.id}`, {
        quotedPrice: totalBid > 0 ? totalBid : (Number(form.quotedPrice) || null),
        estimatedDays: Number(form.estimatedDays),
        proposal: form.proposal,
        portfolioImageUrl: form.portfolioImageUrl,
        items: form.items.map(it => ({
          itemName: it.itemName, unit: it.unit,
          quantity: Number(it.quantity), unitPrice: Number(it.unitPrice),
          description: it.description, sampleImageUrl: it.sampleImageUrl,
        })),
      });
      toast.success('🎉 Đã gửi báo giá thành công!');
      onSuccess();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gửi báo giá thất bại');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto p-4 flex items-start justify-center">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl my-6">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-black text-gray-900">Gửi báo giá</h2>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">{order.orderCode}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
            <X size={16}/>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order info recap */}
          {order.customRequirements && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">📋 Yêu cầu của khách hàng</p>
              <p className="text-sm text-amber-900 leading-relaxed">{order.customRequirements}</p>
            </div>
          )}

          {/* Time + proposal */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Số ngày thực hiện *</label>
              <input type="number" min="1" value={form.estimatedDays}
                onChange={e => setForm(f => ({ ...f, estimatedDays: e.target.value }))}
                placeholder="VD: 30"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a4f3a]"/>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Ảnh portfolio (URL)</label>
              <input type="text" value={form.portfolioImageUrl}
                onChange={e => setForm(f => ({ ...f, portfolioImageUrl: e.target.value }))}
                placeholder="https://..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a4f3a]"/>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Mô tả giải pháp / Năng lực thi công *</label>
            <textarea rows={4} value={form.proposal}
              onChange={e => setForm(f => ({ ...f, proposal: e.target.value }))}
              placeholder="Mô tả kinh nghiệm, phương án thi công, vật liệu sử dụng..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a4f3a] resize-none"/>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-gray-700">Bảng hạng mục báo giá *</label>
              <button onClick={addItem} className="flex items-center gap-1 text-xs font-bold text-[#1a4f3a] hover:underline">
                <Plus size={12}/> Thêm hạng mục
              </button>
            </div>
            <div className="space-y-2.5">
              {form.items.map((it, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-start bg-gray-50 rounded-xl p-3">
                  <div className="col-span-4">
                    <input value={it.itemName} onChange={e => updateItem(i, 'itemName', e.target.value)}
                      placeholder="Tên hạng mục *"
                      className="w-full border border-gray-200 bg-white rounded-lg px-2.5 py-2 text-xs outline-none focus:border-[#1a4f3a]"/>
                  </div>
                  <div className="col-span-2">
                    <input value={it.unit} onChange={e => updateItem(i, 'unit', e.target.value)}
                      placeholder="Đơn vị"
                      className="w-full border border-gray-200 bg-white rounded-lg px-2.5 py-2 text-xs outline-none focus:border-[#1a4f3a]"/>
                  </div>
                  <div className="col-span-2">
                    <input type="number" min="1" value={it.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)}
                      placeholder="SL"
                      className="w-full border border-gray-200 bg-white rounded-lg px-2.5 py-2 text-xs outline-none focus:border-[#1a4f3a]"/>
                  </div>
                  <div className="col-span-3">
                    <input type="number" min="0" value={it.unitPrice} onChange={e => updateItem(i, 'unitPrice', e.target.value)}
                      placeholder="Đơn giá (đ)"
                      className="w-full border border-gray-200 bg-white rounded-lg px-2.5 py-2 text-xs outline-none focus:border-[#1a4f3a]"/>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {form.items.length > 1 && (
                      <button onClick={() => removeItem(i)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 transition-colors">
                        <X size={12}/>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {totalBid > 0 && (
              <div className="flex justify-end mt-3">
                <div className="bg-[#1a4f3a]/5 border border-[#1a4f3a]/20 rounded-xl px-5 py-3 text-right">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Tổng báo giá</p>
                  <p className="text-xl font-black text-[#1a4f3a]">{fmt(totalBid)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">
              Hủy
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-[#1a4f3a] text-white text-sm font-bold hover:bg-[#2d7a5a] disabled:opacity-60 flex items-center justify-center gap-2 transition-colors shadow-sm shadow-[#1a4f3a]/20">
              {submitting ? <><Loader2 size={15} className="animate-spin"/>Đang gửi...</> : <><Send size={15}/>Gửi báo giá</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MARK DONE MODAL ───────────────────────────────────────────────────────────
function MarkDoneModal({ order, onClose, onSuccess }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!url.trim()) { toast.error('Vui lòng nhập URL ảnh hoàn thiện'); return; }
    setLoading(true);
    try {
      await api.post(`/orders/${order.id}/mark-done`, { completionImageUrl: url });
      toast.success('✅ Đã báo hoàn thành! Khách hàng sẽ xác nhận trong 24h.');
      onSuccess();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Thao tác thất bại');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-full bg-[#1a4f3a]/10 flex items-center justify-center">
            <Camera size={22} className="text-[#1a4f3a]"/>
          </div>
          <div>
            <h3 className="font-black text-gray-900 text-lg">Báo hoàn thành</h3>
            <p className="text-xs text-gray-400">{order.orderCode}</p>
          </div>
        </div>
        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-3 mb-5 text-xs text-cyan-800">
          <Truck size={12} className="inline mr-1.5"/>
          Sau khi báo hoàn thành, khách hàng có <strong>24 giờ</strong> để xác nhận. Hệ thống tự giải ngân sau 24h nếu không có phản hồi.
        </div>
        <div className="mb-5">
          <label className="block text-sm font-bold text-gray-700 mb-2">URL ảnh sản phẩm hoàn thiện *</label>
          <input type="text" value={url} onChange={e => setUrl(e.target.value)}
            placeholder="https://..."
            className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm outline-none focus:border-[#1a4f3a]"/>
          {url && (
            <img src={url} alt="preview" className="mt-3 w-full max-h-40 object-cover rounded-xl border border-gray-100"/>
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50">Hủy</button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-3 rounded-xl bg-[#1a4f3a] text-white text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={14} className="animate-spin"/> : <Camera size={14}/>}
            {loading ? 'Đang gửi...' : 'Xác nhận hoàn thành'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function OrderBiddingPage() {
  const { user, refreshUser } = useAuthStore();
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('open');   // open | projects | mybids | assigned | history
  const [openOrders, setOpenOrders] = useState([]);
  const [openProjects, setOpenProjects] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [selectedHistoryOrder, setSelectedHistoryOrder] = useState(null);

  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingBids, setLoadingBids] = useState(true);
  const [loadingAssigned, setLoadingAssigned] = useState(false);

  const [search, setSearch] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Modals
  const [bidModal, setBidModal] = useState(null);
  const [markDoneModal, setMarkDoneModal] = useState(null);

  // ── Fetch helpers ──────────────────────────────────────────────
  const fetchOpenOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await api.get('/order-bids/open');
      setOpenOrders(res.data.data || []);
    } catch { toast.error('Không thể tải đơn hàng mở'); }
    finally { setLoadingOrders(false); }
  }, []);

  const fetchOpenProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const res = await api.get('/projects/open');
      setOpenProjects(res.data.data || []);
    } catch { toast.error('Không thể tải dự án mở'); }
    finally { setLoadingProjects(false); }
  }, []);

  const fetchMyBids = useCallback(async () => {
    setLoadingBids(true);
    try {
      const res = await api.get('/order-bids/my');
      setMyBids(res.data.data || []);
    } catch { /* silent */ }
    finally { setLoadingBids(false); }
  }, []);

  const fetchAssignedOrders = useCallback(async () => {
    setLoadingAssigned(true);
    try {
      const res = await api.get('/order-bids/assigned');
      setAssignedOrders(res.data.data || []);
    } catch { toast.error('Không thể tải đơn được giao'); }
    finally { setLoadingAssigned(false); }
  }, []);

  const fetchCompletedOrders = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/orders/contractor-history');
      setCompletedOrders(res.data.data || []);
    } catch { /* silent */ }
    finally { setLoadingHistory(false); }
  }, []);

  useEffect(() => {
    refreshUser();
    fetchOpenOrders();
    fetchOpenProjects();
    fetchMyBids();
    fetchAssignedOrders();
    fetchCompletedOrders();
  }, []);

  // ── Derived ────────────────────────────────────────────────────
  const hasBid = (orderId) => myBids.some(b => b.orderId === orderId);
  const activeAssigned = assignedOrders.filter(o => !['DELIVERED','CANCELLED'].includes(o.status));
  const needAction = assignedOrders.filter(o => o.status === 'PROCESSING' && !o.contractorMarkedDone).length;
  const acceptedBids = myBids.filter(b => b.status === 'ACCEPTED').length;

  const filteredOrders = openOrders.filter(o =>
    o.orderCode?.toLowerCase().includes(search.toLowerCase()) ||
    o.customRequirements?.toLowerCase().includes(search.toLowerCase()) ||
    o.deliveryAddress?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredProjects = openProjects.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase()) ||
    p.address?.toLowerCase().includes(search.toLowerCase())
  );

  const openBidForm = (order) => {
    if (user?.approvalStatus !== 'APPROVED') {
      toast.error('Tài khoản chưa được duyệt. Vui lòng chờ admin phê duyệt.');
      return;
    }
    setBidModal(order);
  };

  const handleBidSuccess = () => {
    setBidModal(null);
    fetchMyBids();
    fetchOpenOrders();
  };

  const handleMarkDoneSuccess = () => {
    setMarkDoneModal(null);
    fetchAssignedOrders();
  };

  const tabs = [
    { key: 'open',     label: 'Đơn hàng',  icon: <ShoppingBag size={15}/>,   badge: filteredOrders.length,    color: 'primary' },
    { key: 'projects', label: 'Dự án',      icon: <Hammer size={15}/>,         badge: filteredProjects.length,  color: 'primary' },
    { key: 'mybids',   label: 'Báo giá',    icon: <FileText size={15}/>,       badge: myBids.filter(b=>b.status==='PENDING').length, color: 'amber' },
    { key: 'assigned', label: 'Được giao',  icon: <ClipboardList size={15}/>,  badge: needAction,               color: 'indigo' },
    { key: 'history',  label: 'Lịch sử',    icon: <Award size={15}/>,          badge: 0,                        color: 'primary' },
  ];

  return (
    <Layout title="Đấu thầu & Dự án">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* ── HERO STATS ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={<Gavel size={20}/>}      label="Đơn đang mở"   value={openOrders.length}    sub="chờ báo giá"       color="text-blue-600"    bg="bg-blue-50 border border-blue-100"/>
          <StatCard icon={<Hammer size={20}/>}     label="Dự án mở"      value={openProjects.length}  sub="chờ nhà thầu"      color="text-emerald-600" bg="bg-emerald-50 border border-emerald-100"/>
          <StatCard icon={<Send size={20}/>}        label="Đã gửi báo giá" value={myBids.length}       sub={`${acceptedBids} được chọn`} color="text-amber-600" bg="bg-amber-50 border border-amber-100"/>
          <StatCard icon={<ClipboardList size={20}/>} label="Đang thi công" value={activeAssigned.length} sub={needAction > 0 ? `${needAction} cần báo xong` : 'đang xử lý'} color="text-indigo-600" bg={needAction > 0 ? "bg-red-50 border border-red-200" : "bg-indigo-50 border border-indigo-100"}/>
        </div>

        {/* ── NOT APPROVED WARNING ────────────────────────────────── */}
        {user?.approvalStatus !== 'APPROVED' && (
          <div className="flex items-start gap-3 bg-amber-50 border-2 border-amber-300 rounded-2xl px-5 py-4">
            <AlertCircle size={20} className="text-amber-500 mt-0.5 shrink-0"/>
            <div>
              <p className="font-bold text-amber-800 text-sm">Tài khoản chưa được duyệt</p>
              <p className="text-xs text-amber-700 mt-0.5">Bạn có thể xem các đơn hàng và dự án đang mở, nhưng chưa thể gửi báo giá. Hãy hoàn thiện hồ sơ và chờ admin phê duyệt.</p>
            </div>
          </div>
        )}

        {/* ── SEARCH BAR ──────────────────────────────────────────── */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={16}/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm đơn hàng, dự án, mã đơn, địa chỉ..."
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm outline-none focus:border-[#1a4f3a] shadow-sm transition-all"/>
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600">
              <X size={16}/>
            </button>
          )}
        </div>

        {/* ── TABS ────────────────────────────────────────────────── */}
        <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 p-1.5 shadow-sm overflow-x-auto">
          {tabs.map(t => (
            <TabBtn key={t.key}
              active={activeTab === t.key}
              onClick={() => setActiveTab(t.key)}
              icon={t.icon} label={t.label}
              badge={t.badge} color={t.color}/>
          ))}
        </div>

        {/* ── TAB: OPEN ORDERS ────────────────────────────────────── */}
        {activeTab === 'open' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-gray-700">
                {filteredOrders.length} đơn hàng{search ? ` khớp "${search}"` : ' đang mở đấu giá'}
              </p>
              <button onClick={fetchOpenOrders} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary transition-colors">
                <RefreshCw size={13}/> Làm mới
              </button>
            </div>

            {loadingOrders ? (
              <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-[#1a4f3a]"/></div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gavel size={28} className="text-blue-300"/>
                </div>
                <p className="font-bold text-gray-500 text-sm">
                  {search ? 'Không tìm thấy đơn hàng phù hợp' : 'Hiện chưa có đơn hàng nào đang mở đấu giá'}
                </p>
                <p className="text-xs text-gray-400 mt-1">Hệ thống sẽ thông báo ngay khi có đơn mới</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map(o => (
                  <OpenOrderCard key={o.id} order={o}
                    alreadyBid={hasBid(o.id)}
                    onBid={openBidForm}
                    expanded={expandedOrder === o.id}
                    onToggle={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}/>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: OPEN PROJECTS ──────────────────────────────────── */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-gray-700">
                {filteredProjects.length} dự án{search ? ` khớp "${search}"` : ' đang tuyển nhà thầu'}
              </p>
              <button onClick={fetchOpenProjects} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary transition-colors">
                <RefreshCw size={13}/> Làm mới
              </button>
            </div>

            {loadingProjects ? (
              <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-[#1a4f3a]"/></div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Hammer size={28} className="text-emerald-300"/>
                </div>
                <p className="font-bold text-gray-500 text-sm">
                  {search ? 'Không tìm thấy dự án phù hợp' : 'Hiện chưa có dự án nào đang mở tuyển'}
                </p>
                <p className="text-xs text-gray-400 mt-1">Quay lại sau để xem các cơ hội mới</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProjects.map(p => (
                  <OpenProjectCard key={p.id} project={p} onView={(id) => navigate(`/projects/${id}`)}/>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: MY BIDS ────────────────────────────────────────── */}
        {activeTab === 'mybids' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-gray-700">{myBids.length} báo giá đã gửi</p>
              <button onClick={fetchMyBids} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary transition-colors">
                <RefreshCw size={13}/> Làm mới
              </button>
            </div>

            {loadingBids ? (
              <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-[#1a4f3a]"/></div>
            ) : myBids.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText size={28} className="text-amber-300"/>
                </div>
                <p className="font-bold text-gray-500 text-sm">Bạn chưa gửi báo giá nào</p>
                <p className="text-xs text-gray-400 mt-1">Hãy xem tab <strong>Đơn hàng</strong> để bắt đầu đấu thầu</p>
                <button onClick={() => setActiveTab('open')}
                  className="mt-4 px-5 py-2.5 bg-[#1a4f3a] text-white text-xs font-bold rounded-xl hover:bg-[#2d7a5a]">
                  Xem đơn hàng mở
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary pills */}
                <div className="flex flex-wrap gap-2">
                  {['PENDING','ACCEPTED','REJECTED'].map(s => {
                    const count = myBids.filter(b => b.status === s).length;
                    if (!count) return null;
                    const cfg = BID_STATUS[s];
                    return (
                      <span key={s} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}/>
                        {cfg.label}: {count}
                      </span>
                    );
                  })}
                </div>
                {myBids.map(b => <MyBidCard key={b.id} bid={b}/>)}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: ASSIGNED ───────────────────────────────────────── */}
        {activeTab === 'assigned' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-gray-700">{assignedOrders.length} đơn được giao</p>
              <button onClick={fetchAssignedOrders} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary transition-colors">
                <RefreshCw size={13}/> Làm mới
              </button>
            </div>

            {loadingAssigned ? (
              <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-[#1a4f3a]"/></div>
            ) : assignedOrders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClipboardList size={28} className="text-indigo-300"/>
                </div>
                <p className="font-bold text-gray-500 text-sm">Chưa có đơn nào được giao</p>
                <p className="text-xs text-gray-400 mt-1">Khi khách hàng chọn báo giá của bạn, đơn sẽ xuất hiện ở đây</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Status summary */}
                {needAction > 0 && (
                  <div className="flex items-start gap-3 bg-orange-50 border-2 border-orange-300 rounded-2xl px-5 py-4">
                    <AlertCircle size={18} className="text-orange-500 mt-0.5 shrink-0"/>
                    <p className="text-sm font-bold text-orange-800">
                      {needAction} đơn đang ở trạng thái <strong>Đang thi công</strong> — Hãy báo hoàn thành khi sản phẩm sẵn sàng!
                    </p>
                  </div>
                )}
                {assignedOrders.map(o => (
                  <AssignedOrderCard key={o.id} order={o} onMarkDone={setMarkDoneModal}/>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: HISTORY ────────────────────────────────────────── */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {/* Tổng quan */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: 'Tổng đã thực hiện', value: completedOrders.length, color: 'text-gray-800', bg: 'bg-white border-gray-100' },
                { label: 'Hoàn thành', value: completedOrders.filter(o => o.status === 'DELIVERED').length, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-100' },
                { label: 'Tổng thu nhập', value: new Intl.NumberFormat('vi-VN').format(completedOrders.filter(o => o.status === 'DELIVERED').reduce((s,o) => s + (Number(o.totalAmount)||0), 0)) + 'đ', color: 'text-primary', bg: 'bg-primary/5 border-primary/10', small: true },
              ].map(s => (
                <div key={s.label} className={`border rounded-2xl p-4 text-center ${s.bg}`}>
                  <p className={`${s.small ? 'text-base' : 'text-2xl'} font-black ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-gray-500 font-medium mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Search + Refresh */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={13}/>
                <input value={historySearch} onChange={e => setHistorySearch(e.target.value)}
                  placeholder="Tìm mã đơn, địa chỉ..."
                  className="w-full pl-8 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-primary"/>
              </div>
              <button onClick={fetchCompletedOrders} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 shrink-0"><RefreshCw size={14}/></button>
            </div>

            {/* Nếu đang xem chi tiết */}
            {selectedHistoryOrder ? (
              <div className="space-y-4">
                <button onClick={() => setSelectedHistoryOrder(null)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary group">
                  <ArrowUpRight size={14} className="rotate-180 group-hover:-translate-x-0.5 transition-transform"/> Quay lại lịch sử
                </button>

                {/* Hero */}
                <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${selectedHistoryOrder.status === 'DELIVERED' ? 'border-teal-200' : 'border-red-200'}`}>
                  <div className={`h-1.5 w-full ${selectedHistoryOrder.status === 'DELIVERED' ? 'bg-teal-400' : 'bg-red-400'}`}/>
                  <div className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${selectedHistoryOrder.status === 'DELIVERED' ? 'bg-teal-100 text-teal-700 border-teal-200' : 'bg-red-100 text-red-600 border-red-200'}`}>
                            {selectedHistoryOrder.status === 'DELIVERED' ? <CheckCircle size={10}/> : <X size={10}/>}
                            {selectedHistoryOrder.status === 'DELIVERED' ? 'Đã hoàn thành' : 'Đã hủy'}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-gray-400">{selectedHistoryOrder.orderCode}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${selectedHistoryOrder.type === 'CUSTOM' ? 'bg-amber-50 text-amber-600' : 'bg-sky-50 text-sky-600'}`}>
                            {selectedHistoryOrder.type === 'CUSTOM' ? '🎨 Tùy chỉnh' : '🛍️ Có sẵn'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Clock size={10}/> Nhận: {new Date(selectedHistoryOrder.createdAt).toLocaleDateString('vi-VN')}</span>
                          {selectedHistoryOrder.deliveredAt && <span className="flex items-center gap-1 text-teal-500 font-medium"><CheckCircle size={10}/> Giao: {new Date(selectedHistoryOrder.deliveredAt).toLocaleDateString('vi-VN')}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Giá trị đơn</p>
                        <p className="text-2xl font-black text-primary">{fmt(selectedHistoryOrder.totalAmount)}</p>
                        {selectedHistoryOrder.fullyPaid && <p className="text-[10px] text-teal-600 font-bold flex items-center justify-end gap-1 mt-0.5"><CheckCircle size={9}/>Đã thanh toán</p>}
                      </div>
                    </div>

                    {selectedHistoryOrder.deliveryAddress && (
                      <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 mb-3 text-xs text-gray-600">
                        <MapPin size={11} className="text-gray-400 shrink-0"/>
                        <span>{selectedHistoryOrder.deliveryAddress}</span>
                      </div>
                    )}
                    {selectedHistoryOrder.completionImageUrl && (
                      <div className="mb-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Ảnh sản phẩm hoàn thiện</p>
                        <img src={selectedHistoryOrder.completionImageUrl} alt="completion" className="rounded-xl max-h-52 object-cover border border-gray-100 w-full"/>
                      </div>
                    )}
                    {selectedHistoryOrder.customRequirements && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
                        <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mb-1">Yêu cầu thiết kế</p>
                        <p className="text-xs text-amber-900 whitespace-pre-wrap">{selectedHistoryOrder.customRequirements}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bảng sản phẩm */}
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                    <Package size={14} className="text-primary"/>
                    <h3 className="font-bold text-gray-900 text-sm">Sản phẩm đã thực hiện ({selectedHistoryOrder.items?.length || 0})</h3>
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
                      {selectedHistoryOrder.items?.map((item, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0"/> : <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><Package size={14} className="text-gray-300"/></div>}
                              <div>
                                <p className="font-semibold text-gray-900 text-xs">{item.itemName}</p>
                                {item.customNote && <p className="text-[10px] text-amber-600">{item.customNote}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center font-bold text-gray-700 text-xs">{item.quantity}</td>
                          <td className="px-4 py-3 text-right font-black text-primary text-xs">{fmt(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t border-gray-100">
                      <tr>
                        <td colSpan={2} className="px-4 py-3 text-right text-xs font-bold text-gray-700">Tổng cộng:</td>
                        <td className="px-4 py-3 text-right font-black text-primary text-sm">{fmt(selectedHistoryOrder.totalAmount)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ) : loadingHistory ? (
              <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-primary"/></div>
            ) : completedOrders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                <Award size={36} className="mx-auto text-gray-200 mb-3"/>
                <p className="text-gray-400 text-sm font-medium">Chưa có đơn hàng nào hoàn thành</p>
                <p className="text-xs text-gray-300 mt-1">Các đơn hàng đã giao thành công sẽ hiển thị ở đây</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {completedOrders
                  .filter(o => !historySearch.trim() || o.orderCode?.toLowerCase().includes(historySearch.toLowerCase()) || o.deliveryAddress?.toLowerCase().includes(historySearch.toLowerCase()))
                  .map(o => (
                    <button key={o.id} onClick={() => setSelectedHistoryOrder(o)}
                      className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-left hover:border-primary hover:shadow-sm transition-all group">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${o.status === 'DELIVERED' ? 'bg-teal-100 text-teal-700 border-teal-200' : 'bg-red-100 text-red-600 border-red-200'}`}>
                              {o.status === 'DELIVERED' ? <CheckCircle size={9}/> : <X size={9}/>}
                              {o.status === 'DELIVERED' ? 'Hoàn thành' : 'Đã hủy'}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-gray-400">{o.orderCode}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${o.type === 'CUSTOM' ? 'bg-amber-50 text-amber-600' : 'bg-sky-50 text-sky-600'}`}>
                              {o.type === 'CUSTOM' ? '🎨 Tùy chỉnh' : '🛍️ Có sẵn'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-gray-400">
                            <span className="flex items-center gap-1"><Clock size={10}/>{new Date(o.createdAt).toLocaleDateString('vi-VN')}</span>
                            {o.deliveredAt && <span className="flex items-center gap-1 text-teal-500 font-medium"><CheckCircle size={9}/>Xong: {new Date(o.deliveredAt).toLocaleDateString('vi-VN')}</span>}
                            {o.deliveryAddress && <span className="flex items-center gap-1 truncate max-w-[140px]"><MapPin size={9}/>{o.deliveryAddress}</span>}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-black text-primary text-sm">{fmt(o.totalAmount)}</p>
                          <p className="text-[10px] text-gray-400">{o.items?.length || 0} sp</p>
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
                  ))
                }
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── MODALS ────────────────────────────────────────────────── */}
      {bidModal && (
        <BidFormModal order={bidModal} onClose={() => setBidModal(null)} onSuccess={handleBidSuccess}/>
      )}
      {markDoneModal && (
        <MarkDoneModal order={markDoneModal} onClose={() => setMarkDoneModal(null)} onSuccess={handleMarkDoneSuccess}/>
      )}
    </Layout>
  );
}
