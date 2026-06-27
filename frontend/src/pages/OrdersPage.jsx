import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Package, CheckCircle, XCircle, Clock,
  ChevronDown, ChevronUp, AlertCircle, Plus, Gavel,
  EyeOff, Eye, Star, Users, ArrowRight, Wallet,
  Truck, ShieldCheck, FileText, BadgeCheck, Loader2
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const fmt = (n) =>
  n == null ? '0đ' :
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n).replace('₫', 'đ');

const CUSTOM_STATUS_CFG = {
  PENDING:        { label: 'Chờ Admin duyệt',  cls: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-400 animate-pulse', icon: <Clock size={12}/> },
  OPEN_BIDDING:   { label: 'Đang đấu giá',     cls: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-400 animate-pulse', icon: <Gavel size={12}/> },
  BIDDING_CLOSED: { label: 'Đã chọn nhà thầu', cls: 'bg-purple-100 text-purple-700',dot: 'bg-purple-400',             icon: <CheckCircle size={12}/> },
  PROCESSING:     { label: 'Đang thi công',    cls: 'bg-indigo-100 text-indigo-700',dot: 'bg-indigo-400',             icon: <Package size={12}/> },
  DELIVERED:      { label: 'Đã hoàn thành',    cls: 'bg-green-100 text-green-700',  dot: 'bg-green-500',              icon: <CheckCircle size={12}/> },
  CANCELLED:      { label: 'Đã hủy',            cls: 'bg-red-100 text-red-600',      dot: 'bg-red-400',                icon: <XCircle size={12}/> },
};

const CATALOG_STATUS_CFG = {
  PENDING:        { label: 'Chờ Admin duyệt',  cls: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-400 animate-pulse', icon: <Clock size={12}/> },
  CONFIRMED:      { label: 'Đã xác nhận',      cls: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-400',               icon: <CheckCircle size={12}/> },
  DEPOSIT_PAID:   { label: 'Đã đặt cọc (60%)', cls: 'bg-indigo-100 text-indigo-700',dot: 'bg-indigo-400 animate-pulse',icon: <Wallet size={12}/> },
  PROCESSING:     { label: 'Đang sản xuất',    cls: 'bg-orange-100 text-orange-700',dot: 'bg-orange-400',             icon: <Package size={12}/> },
  SHIPPED:        { label: 'Đang giao hàng',    cls: 'bg-cyan-100 text-cyan-700',    dot: 'bg-cyan-400 animate-pulse', icon: <Truck size={12}/> },
  DELIVERED:      { label: 'Đã hoàn thành',    cls: 'bg-green-100 text-green-700',  dot: 'bg-green-500',              icon: <CheckCircle size={12}/> },
  CANCELLED:      { label: 'Đã hủy',            cls: 'bg-red-100 text-red-600',      dot: 'bg-red-400',                icon: <XCircle size={12}/> },
};

const STEPS_CUSTOM = ['PENDING', 'OPEN_BIDDING', 'BIDDING_CLOSED', 'PROCESSING', 'DELIVERED'];
const STEPS_CATALOG = ['PENDING', 'CONFIRMED', 'DEPOSIT_PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Tab phân luồng: 'custom' (Đơn hàng riêng) hoặc 'catalog' (Đơn hàng mua sẵn)
  const [activeTab, setActiveTab] = useState('custom');
  const [filter, setFilter] = useState('all');
  
  const [expanded, setExpanded] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [confirmingDelivery, setConfirmingDelivery] = useState(null);

  // Bids panel (đấu giá bảo mật)
  const [bidsPanel, setBidsPanel] = useState(null);
  const [bids, setBids] = useState([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [accepting, setAccepting] = useState(null);

  // Review modal (Đơn custom đánh giá qua đơn)
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedOrders, setReviewedOrders] = useState(new Set());

  useEffect(() => {
    fetchOrdersAndContracts();
  }, []);

  const fetchOrdersAndContracts = async () => {
    setLoading(true);
    try {
      const [ordersRes, contractsRes] = await Promise.all([
        api.get('/orders/my'),
        api.get('/contracts/my').catch(() => ({ data: { data: [] } }))
      ]);
      const orderList = ordersRes.data.data || [];
      setOrders(orderList);
      setContracts(contractsRes.data.data || []);

      // Check reviewed custom orders
      const deliveredCustom = orderList.filter(o => o.status === 'DELIVERED' && o.type === 'CUSTOM').map(o => o.id);
      if (deliveredCustom.length > 0) {
        Promise.all(deliveredCustom.map(id =>
          api.get(`/reviews/check?referenceType=ORDER&referenceId=${id}`)
            .then(r => r.data.data ? id : null).catch(() => null)
        )).then(results => {
          setReviewedOrders(new Set(results.filter(Boolean)));
        });
      }
    } catch {
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Xác nhận hủy đơn hàng này?')) return;
    setCancelling(id);
    try {
      await api.post(`/orders/${id}/cancel`);
      toast.success('Đã hủy đơn hàng');
      fetchOrdersAndContracts();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Không thể hủy đơn');
    } finally {
      setCancelling(null);
    }
  };

  // Xác nhận đã nhận hàng (Catalog order)
  const handleConfirmDelivery = async (id) => {
    if (!window.confirm('Xác nhận bạn đã nhận được hàng đầy đủ và đúng chất lượng?')) return;
    setConfirmingDelivery(id);
    try {
      await api.post(`/api/orders/${id}/confirm-delivery`);
      toast.success('🎉 Xác nhận nhận hàng thành công! Đơn hàng hoàn tất.');
      fetchOrdersAndContracts();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setConfirmingDelivery(null);
    }
  };

  const toggleBids = async (orderId) => {
    if (bidsPanel === orderId) { setBidsPanel(null); return; }
    setBidsPanel(orderId);
    setLoadingBids(true);
    try {
      const res = await api.get(`/order-bids/order/${orderId}`);
      setBids(res.data.data || []);
    } catch {
      toast.error('Không thể tải báo giá');
    } finally {
      setLoadingBids(false);
    }
  };

  const handleAcceptBid = async (orderId, bidId) => {
    if (!window.confirm('Chọn nhà thầu này? Các báo giá khác sẽ bị từ chối và Hợp đồng sẽ được tự động thiết lập.')) return;
    setAccepting(bidId);
    try {
      await api.post(`/order-bids/order/${orderId}/accept/${bidId}`);
      toast.success('🎉 Đã chọn nhà thầu thành công! Hợp đồng đã được lập và đang chờ Admin duyệt.');
      fetchOrdersAndContracts();
      setBidsPanel(null);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi chọn nhà thầu');
    } finally {
      setAccepting(null);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewModal) return;
    if (!reviewData.comment.trim()) { toast.error('Vui lòng nhập nhận xét'); return; }
    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        rating: reviewData.rating,
        comment: reviewData.comment,
        referenceType: 'ORDER',
        referenceId: reviewModal.id,
        revieweeId: reviewModal.assignedContractorId,
      });
      toast.success('🌟 Cảm ơn bạn đã đánh giá nhà thầu!');
      setReviewedOrders(prev => new Set([...prev, reviewModal.id]));
      setReviewModal(null);
      setReviewData({ rating: 5, comment: '' });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Phân loại danh sách
  const customOrders = orders.filter(o => o.type === 'CUSTOM');
  const catalogOrders = orders.filter(o => o.type === 'CATALOG');
  const activeOrders = activeTab === 'custom' ? customOrders : catalogOrders;

  // Bộ lọc theo trạng thái
  const filtered = filter === 'all' ? activeOrders : activeOrders.filter(o => o.status === filter);
  
  const statusCfg = activeTab === 'custom' ? CUSTOM_STATUS_CFG : CATALOG_STATUS_CFG;
  const counts = Object.fromEntries(Object.keys(statusCfg).map(k => [k, activeOrders.filter(o => o.status === k).length]));

  return (
    <>
    <Layout title="Đơn hàng của tôi">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* PHÂN LUỒNG TABS CHÍNH (Custom vs Catalog) */}
        <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-150 pb-2">
          <div className="flex gap-2 bg-gray-100 rounded-xl p-1 shadow-inner">
            <button
              onClick={() => { setActiveTab('custom'); setFilter('all'); setBidsPanel(null); }}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'custom'
                  ? 'bg-white text-primary shadow'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Gavel size={15} />
              Đơn hàng Thiết kế riêng ({customOrders.length})
            </button>
            <button
              onClick={() => { setActiveTab('catalog'); setFilter('all'); setBidsPanel(null); }}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'catalog'
                  ? 'bg-white text-primary shadow'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <ShoppingBag size={15} />
              Đơn hàng Mua sẵn ({catalogOrders.length})
            </button>
          </div>

          <button
            onClick={() => navigate('/shop/order')}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-light text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-colors"
          >
            <Plus size={15}/> Đặt hàng mới
          </button>
        </div>

        {/* Tóm tắt số lượng bộ lọc trạng thái */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
              filter === 'all'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white border border-gray-250/60 text-gray-650 hover:border-primary'
            }`}
          >
            Tất cả ({activeOrders.length})
          </button>
          {Object.entries(statusCfg).map(([k, v]) => counts[k] > 0 && (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                filter === k
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white border border-gray-250/60 text-gray-650 hover:border-primary'
              }`}
            >
              {v.label} ({counts[k]})
            </button>
          ))}
        </div>

        {/* Nội dung danh sách */}
        {loading ? (
          <div className="text-center py-20 text-gray-400 flex items-center justify-center gap-2">
            <Loader2 className="animate-spin text-primary" size={20} />
            Đang tải dữ liệu đơn hàng...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
            <ShoppingBag size={44} className="mx-auto text-gray-200 mb-3"/>
            <p className="text-gray-400 font-semibold text-sm">
              Không có đơn hàng nào thuộc bộ lọc này
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="mt-4 px-5 py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary-light transition-colors"
            >
              Khám phá Shop ngay
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(o => {
              const st = statusCfg[o.status] || statusCfg.PENDING;
              const steps = activeTab === 'custom' ? STEPS_CUSTOM : STEPS_CATALOG;
              const curStep = steps.indexOf(o.status);
              const isExp = expanded === o.id;

              // Đối chiếu Hợp đồng liên kết (Smart Contract Bridge)
              const linkedContract = activeTab === 'custom'
                ? contracts.find(c => c.orderId === o.id)
                : null;

              return (
                <div key={o.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:border-gray-200 transition-all">
                  
                  {/* Phần hiển thị chính */}
                  <div className="p-5">
                    
                    {/* Header Thẻ */}
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${st.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}/>
                            {st.icon} {st.label}
                          </span>
                          
                          {activeTab === 'custom' ? (
                            <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Gavel size={10}/> Đặt gia công riêng
                            </span>
                          ) : (
                            <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Mua catalog có sẵn
                            </span>
                          )}
                        </div>
                        
                        <p className="font-mono text-xs font-bold text-gray-800">Mã đơn: {o.orderCode}</p>
                        <p className="text-[10px] text-gray-450">{new Date(o.createdAt).toLocaleString('vi-VN')}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Tổng thanh toán</p>
                        <p className="text-xl font-black text-primary mt-0.5">
                          {activeTab === 'custom' && (o.status === 'PENDING' || o.status === 'OPEN_BIDDING')
                            ? 'Đang báo giá...'
                            : fmt(o.totalAmount)}
                        </p>
                      </div>
                    </div>

                    {/* Stepper Tiến trình ngang */}
                    {o.status !== 'CANCELLED' && (
                      <div className="flex items-center mb-5 overflow-x-auto pb-1 gap-1">
                        {steps.map((step, i) => {
                          const done = i <= curStep;
                          const active = i === curStep;
                          const label = statusCfg[step]?.label?.split(' ')[0];
                          return (
                            <React.Fragment key={step}>
                              <div className="flex flex-col items-center gap-1 shrink-0">
                                <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                  done ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                                } ${active ? 'ring-2 ring-primary ring-offset-1 font-extrabold' : ''}`}>
                                  {done && i < curStep ? '✓' : i + 1}
                                </div>
                                <span className={`text-[9px] font-semibold hidden sm:block ${done ? 'text-primary' : 'text-gray-400'}`}>
                                  {label}
                                </span>
                              </div>
                              {i < steps.length - 1 && (
                                <div className={`flex-1 h-0.5 min-w-[20px] transition-all ${i < curStep ? 'bg-primary' : 'bg-gray-200'}`}/>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    )}

                    {/* ── SMART CONTRACT BRIDGE: BANNER HỢP ĐỒNG LIÊN KẾT ── */}
                    {linkedContract && (
                      <div className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4 mb-4 border ${
                        linkedContract.status === 'WAITING_SIGNATURE' ? 'bg-blue-50/50 border-blue-200 text-blue-800' :
                        linkedContract.status === 'ACTIVE' ? 'bg-gradient-to-r from-primary/5 to-blue-50/50 border-primary/20 text-primary' :
                        'bg-green-50/50 border-green-200 text-green-855 text-green-800'
                      }`}>
                        <div className="flex items-start gap-2 text-xs flex-1">
                          <FileText size={16} className="mt-0.5 shrink-0" />
                          <div>
                            <p className="font-bold">Hợp đồng liên kết: {linkedContract.contractNumber}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">
                              {linkedContract.status === 'WAITING_SIGNATURE' && 'Hợp đồng đã được duyệt! Vui lòng đọc điều khoản và ký hợp đồng để tiến hành đặt cọc và thi công.'}
                              {linkedContract.status === 'ACTIVE' && 'Công việc đang được nhà thầu thi công. Theo dõi nhật ký tiến độ thực tế hàng ngày và phê duyệt giải ngân Escrow tại đây.'}
                              {linkedContract.status === 'COMPLETED' && 'Công trình đã được nghiệm thu hoàn tất và đang được bảo hành 6 tháng.'}
                            </p>
                          </div>
                        </div>

                        {/* Nút bấm liên kết trực tiếp */}
                        <div className="shrink-0">
                          {linkedContract.status === 'WAITING_SIGNATURE' && (
                            <button
                              onClick={() => navigate('/contracts')}
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg transition-colors"
                            >
                              Ký hợp đồng ngay
                              <ArrowRight size={10} />
                            </button>
                          )}
                          {linkedContract.status === 'ACTIVE' && (
                            <button
                              onClick={() => navigate(`/contracts/${linkedContract.id}/progress`)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-primary hover:bg-primary-light text-white text-[10px] font-bold rounded-lg transition-colors"
                            >
                              Theo dõi Tiến độ & Giải ngân
                              <ArrowRight size={10} />
                            </button>
                          )}
                          {linkedContract.status === 'COMPLETED' && (
                            <button
                              onClick={() => navigate(`/contracts/${linkedContract.id}/review`)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold rounded-lg transition-colors"
                            >
                              Xem Nghiệm thu & Bảo hành
                              <ArrowRight size={10} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Hướng dẫn khi đang đấu giá tự do */}
                    {o.status === 'OPEN_BIDDING' && activeTab === 'custom' && (
                      <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-2xl px-3.5 py-3 text-xs text-blue-800 mb-4">
                        <Gavel size={14} className="mt-0.5 shrink-0 text-blue-500" />
                        <div>
                          <strong>Đơn hàng đang mở đấu giá bảo mật!</strong> Các nhà thầu uy tín đang chuẩn bị hồ sơ hạng mục và gửi báo giá. 
                          Hãy bấm nút <strong>"Xem danh sách báo giá"</strong> bên dưới để chọn nhà thầu phù hợp nhất.
                        </div>
                      </div>
                    )}

                    {/* Hiển thị tóm tắt một số hạng mục */}
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                      {o.items?.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 shrink-0 border border-gray-100/50">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover border border-gray-200"/>
                          ) : (
                            <Package size={15} className="text-gray-300"/>
                          )}
                          <div>
                            <p className="text-xs font-semibold text-gray-700 max-w-[100px] truncate">{item.itemName}</p>
                            <p className="text-[10px] text-gray-400 font-bold">SL: ×{item.quantity}</p>
                          </div>
                        </div>
                      ))}
                      {o.items?.length > 3 && (
                        <div className="bg-gray-50 rounded-xl px-3 py-2 shrink-0 border border-gray-100/50 flex items-center justify-center text-[10px] font-bold text-gray-550">
                          +{o.items.length - 3} sản phẩm khác
                        </div>
                      )}
                    </div>

                    {/* Chân thẻ đơn hàng - các nút bấm hành động */}
                    <div className="flex items-center justify-between gap-4 border-t border-gray-50 pt-4 flex-wrap">
                      <button
                        onClick={() => setExpanded(isExp ? null : o.id)}
                        className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
                      >
                        {isExp ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                        {isExp ? 'Ẩn chi tiết đơn hàng' : 'Xem chi tiết đơn hàng'}
                      </button>

                      <div className="flex gap-1.5 flex-wrap">
                        {/* Nút đấu giá riêng cho đơn Custom */}
                        {activeTab === 'custom' && ['OPEN_BIDDING', 'BIDDING_CLOSED'].includes(o.status) && (
                          <button
                            onClick={() => toggleBids(o.id)}
                            className={`flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 rounded-xl transition-all ${
                              bidsPanel === o.id
                                ? 'bg-primary text-white shadow'
                                : 'border border-primary text-primary hover:bg-primary-bg'
                            }`}
                          >
                            {bidsPanel === o.id ? <EyeOff size={13}/> : <Eye size={13}/>}
                            {bidsPanel === o.id ? 'Ẩn báo giá' : 'Xem báo giá từ nhà thầu'}
                          </button>
                        )}

                        {/* Thanh toán cọc cho Catalog order */}
                        {activeTab === 'catalog' && o.status === 'CONFIRMED' && (
                          <button
                            onClick={() => navigate('/wallet')}
                            className="flex items-center gap-1 bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-primary-light transition-colors shadow-sm"
                          >
                            <Wallet size={13}/>
                            Thanh toán cọc 60%
                          </button>
                        )}

                        {/* Xác nhận nhận hàng cho Catalog order */}
                        {activeTab === 'catalog' && o.status === 'SHIPPED' && (
                          <button
                            onClick={() => handleConfirmDelivery(o.id)}
                            disabled={confirmingDelivery === o.id}
                            className="flex items-center gap-1 bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle size={13}/>
                            {confirmingDelivery === o.id ? 'Đang xử lý...' : 'Xác nhận nhận hàng'}
                          </button>
                        )}

                        {/* Đánh giá nhà thầu qua đơn (nếu DELIVERED và không có contract) */}
                        {o.status === 'DELIVERED' && o.assignedContractorId && !linkedContract && (
                          <div className="flex gap-2">
                            {reviewedOrders.has(o.id) ? (
                              <span className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-500 rounded-xl text-xs font-bold border border-amber-200">
                                <Star size={12} fill="currentColor"/> Đã đánh giá
                              </span>
                            ) : (
                              <button
                                onClick={() => { setReviewModal(o); setReviewData({ rating: 5, comment: '' }); }}
                                className="flex items-center gap-1 bg-amber-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl hover:bg-amber-600 transition-colors"
                              >
                                <Star size={12}/>
                                Đánh giá nhà thầu
                              </button>
                            )}
                          </div>
                        )}

                        {/* Nút hủy đơn hàng */}
                        {o.status === 'PENDING' && (
                          <button
                            onClick={() => handleCancel(o.id)}
                            disabled={cancelling === o.id}
                            className="flex items-center gap-1 text-xs font-bold text-red-500 border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            <XCircle size={13}/>
                            {cancelling === o.id ? 'Đang hủy...' : 'Hủy đơn hàng'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── BẢNG BÁO GIÁ ĐẤU THẦU BẢO MẬT (BLIND BIDDING DRAWER) ── */}
                  {bidsPanel === o.id && activeTab === 'custom' && (
                    <div className="border-t border-gray-100 p-5 bg-gray-50/50 space-y-4">
                      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-3 py-2.5 text-xs text-amber-800">
                        <EyeOff size={13} className="shrink-0 mt-0.5 text-amber-500" />
                        <span><strong>Cơ chế đấu giá bảo mật:</strong> Nhà thầu hoàn toàn không thể thấy báo giá của nhau. Chỉ duy nhất bạn thấy danh sách báo giá chi tiết này để bảo đảm tính khách quan nhất.</span>
                      </div>
                      
                      {loadingBids ? (
                        <div className="text-center py-8 text-gray-400 text-xs flex items-center justify-center gap-2">
                          <Loader2 className="animate-spin text-primary" size={15} />
                          Đang tải danh sách báo giá...
                        </div>
                      ) : bids.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-xs">
                          Hiện chưa nhận được báo giá nào. Các nhà thầu đang thẩm định hồ sơ kỹ thuật và bóc tách khối lượng.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {bids.map(bid => (
                            <div
                              key={bid.id}
                              className={`rounded-2xl border p-4 bg-white transition-all ${
                                bid.status === 'ACCEPTED' ? 'border-green-300 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-primary-bg text-primary flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                                    {bid.contractorName?.charAt(0)}
                                  </div>
                                  <div>
                                    <p
                                      onClick={() => navigate(`/contractor/${bid.contractorId}`)}
                                      className="font-bold text-gray-900 text-sm cursor-pointer hover:underline hover:text-primary"
                                    >
                                      {bid.contractorName}
                                    </p>
                                    <p className="text-xs text-gray-400">SĐT: {bid.contractorPhone}</p>
                                  </div>
                                  {bid.status === 'ACCEPTED' && (
                                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                      ✓ Đã chọn
                                    </span>
                                  )}
                                </div>
                                
                                <div className="text-right shrink-0">
                                  <p className="font-extrabold text-primary text-base sm:text-lg">{fmt(bid.quotedPrice)}</p>
                                  <p className="text-xs text-gray-400 font-semibold">{bid.estimatedDays} ngày sản xuất</p>
                                </div>
                              </div>

                              {bid.proposal && (
                                <p className="text-xs text-gray-500 bg-gray-50/50 rounded-xl p-3 mb-3 leading-relaxed border border-gray-100/50">
                                  <strong>Giải pháp thi công:</strong> "{bid.proposal}"
                                </p>
                              )}

                              {/* Bảng chi tiết hạng mục báo thầu */}
                              {bid.items?.length > 0 && (
                                <div className="overflow-x-auto rounded-xl border border-gray-100 mb-3 shadow-sm">
                                  <table className="w-full text-xs">
                                    <thead className="bg-gray-50 text-gray-500 font-bold">
                                      <tr>
                                        <th className="text-left px-3 py-2">Hạng mục sản xuất</th>
                                        <th className="text-center px-2 py-2">Số lượng</th>
                                        <th className="text-right px-2 py-2">Đơn giá</th>
                                        <th className="text-right px-3 py-2">Thành tiền</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 text-gray-700">
                                      {bid.items.map((it, i) => (
                                        <tr key={i} className="hover:bg-gray-50/50">
                                          <td className="px-3 py-2 font-medium">{it.itemName}</td>
                                          <td className="px-2 py-2 text-center text-gray-500 font-semibold">{it.quantity} {it.unit}</td>
                                          <td className="px-2 py-2 text-right text-gray-500">{fmt(it.unitPrice)}</td>
                                          <td className="px-3 py-2 text-right font-bold text-primary">{fmt(it.totalPrice)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                    <tfoot className="bg-primary-bg font-bold">
                                      <tr>
                                        <td colSpan={3} className="px-3 py-2 text-right text-gray-700">Tổng cộng giá thầu:</td>
                                        <td className="px-3 py-2 text-right text-primary font-black text-xs sm:text-sm">{fmt(bid.quotedPrice)}</td>
                                      </tr>
                                    </tfoot>
                                  </table>
                                </div>
                              )}

                              {/* Hành động chấp nhận thầu */}
                              {bid.status === 'PENDING' && o.status === 'OPEN_BIDDING' && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleAcceptBid(o.id, bid.id)}
                                    disabled={accepting === bid.id}
                                    className="flex items-center gap-1.5 bg-primary hover:bg-primary-light text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm disabled:opacity-50"
                                  >
                                    <CheckCircle size={13}/>
                                    {accepting === bid.id ? 'Đang lập HĐ...' : 'Chọn nhà thầu & Ký kết'}
                                  </button>
                                  <button
                                    onClick={() => navigate(`/contractor/${bid.contractorId}`)}
                                    className="flex items-center gap-1.5 border border-gray-200 text-gray-700 text-xs font-bold bg-white px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                                  >
                                    Xem hồ sơ năng lực
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── CHI TIẾT ĐƠN HÀNG MỞ RỘNG (EXPANDED DETAIL) ── */}
                  {isExp && (
                    <div className="border-t border-gray-100 p-5 bg-gray-50/20">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-xs sm:text-sm text-gray-600">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Địa chỉ giao nhận hàng</p>
                          <p className="text-gray-800 font-medium">{o.deliveryAddress}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Số điện thoại liên hệ</p>
                          <p className="text-gray-800 font-medium">{o.contactPhone}</p>
                        </div>
                        
                        {o.customRequirements && (
                          <div className="sm:col-span-2 bg-amber-50/50 border border-amber-100 rounded-xl p-3.5 mt-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1 flex items-center gap-1">
                              <Info size={11} /> Yêu cầu kỹ thuật & Thiết kế riêng
                            </p>
                            <p className="text-amber-900 text-xs whitespace-pre-wrap font-medium leading-relaxed">{o.customRequirements}</p>
                          </div>
                        )}
                      </div>

                      {/* Bảng kê sản phẩm chi tiết trong đơn */}
                      <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm bg-white">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-50 text-gray-500 font-bold">
                            <tr>
                              <th className="text-left px-4 py-2">Sản phẩm nội thất</th>
                              <th className="text-center px-3 py-2">Số lượng</th>
                              <th className="text-right px-4 py-2">Tổng giá trị</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 text-gray-700">
                            {o.items?.map((item, i) => (
                              <tr key={i} className="hover:bg-gray-50/30">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    {item.imageUrl && (
                                      <img src={item.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover border border-gray-150 shrink-0"/>
                                    )}
                                    <div>
                                      <p className="font-semibold text-gray-850">{item.itemName}</p>
                                      {item.customNote && <p className="text-gray-400 text-[10px] mt-0.5">📝 Ghi chú: {item.customNote}</p>}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-3 text-center text-gray-550 font-bold">{item.quantity}</td>
                                <td className="px-4 py-3 text-right font-black text-primary">
                                  {activeTab === 'custom' && (o.status === 'PENDING' || o.status === 'OPEN_BIDDING')
                                    ? 'Chờ báo giá'
                                    : fmt(item.subtotal)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>

    {/* MODAL: Đánh giá nhà thầu của đơn Custom (nếu không có Contract) */}
    {reviewModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
          <h3 className="font-bold text-gray-950 text-lg mb-1 flex items-center gap-2">
            <Star size={18} className="text-amber-500"/> Đánh giá nhà thầu
          </h3>
          <p className="text-xs text-gray-500 mb-5">Đơn đặt hàng thiết kế riêng: <span className="font-mono font-bold text-gray-700">{reviewModal.orderCode}</span></p>

          {/* Star rating */}
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Số sao đánh giá chung</p>
            <div className="flex gap-1.5">
              {[1,2,3,4,5].map(s => (
                <button
                  key={s}
                  onClick={() => setReviewData(d => ({...d, rating: s}))}
                  className={`text-3xl transition-transform hover:scale-110 ${s <= reviewData.rating ? 'text-amber-400' : 'text-gray-200'}`}
                >
                  ★
                </button>
              ))}
              <span className="ml-3 text-sm font-extrabold text-amber-600 self-center">{reviewData.rating}/5 sao</span>
            </div>
          </div>

          {/* Comment */}
          <div className="mb-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Nhận xét chi tiết</p>
            <textarea
              rows={4}
              value={reviewData.comment}
              onChange={e => setReviewData(d => ({...d, comment: e.target.value}))}
              placeholder="Chia sẻ nhận xét thực tế về tay nghề, chất lượng gỗ, mức độ hoàn thiện sản phẩm..."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-primary resize-none transition-all focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setReviewModal(null)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-650 text-xs font-bold hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmitReview}
              disabled={submittingReview}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
            >
              {submittingReview ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Star size={13}/> Gửi đánh giá
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}