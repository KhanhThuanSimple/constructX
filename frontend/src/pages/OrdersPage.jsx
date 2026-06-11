import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Package, CheckCircle, Truck, XCircle, Clock,
  ChevronDown, ChevronUp, AlertCircle, Plus, Gavel,
  Users, EyeOff, Eye, Send, Star
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const fmt = (n) =>
  n == null ? '0đ' :
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n).replace('₫', 'đ');

const STATUS_CFG = {
  PENDING:        { label: 'Chờ Admin duyệt',  cls: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-400 animate-pulse', icon: <Clock size={12}/> },
  CONFIRMED:      { label: 'Đã xác nhận',      cls: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-400',               icon: <CheckCircle size={12}/> },
  OPEN_BIDDING:   { label: 'Đang đấu giá',     cls: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-400 animate-pulse', icon: <Gavel size={12}/> },
  BIDDING_CLOSED: { label: 'Đã chọn nhà thầu', cls: 'bg-purple-100 text-purple-700',dot: 'bg-purple-400',             icon: <CheckCircle size={12}/> },
  PROCESSING:     { label: 'Đang sản xuất',    cls: 'bg-indigo-100 text-indigo-700',dot: 'bg-indigo-400',             icon: <Package size={12}/> },
  SHIPPED:        { label: 'Đang giao',         cls: 'bg-cyan-100 text-cyan-700',    dot: 'bg-cyan-400',               icon: <Truck size={12}/> },
  DELIVERED:      { label: 'Đã hoàn thành',    cls: 'bg-green-100 text-green-700',  dot: 'bg-green-500',              icon: <CheckCircle size={12}/> },
  CANCELLED:      { label: 'Đã hủy',            cls: 'bg-red-100 text-red-600',      dot: 'bg-red-400',                icon: <XCircle size={12}/> },
};

const STEPS_CATALOG   = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED'];
const STEPS_CUSTOM    = ['PENDING','OPEN_BIDDING','BIDDING_CLOSED','PROCESSING','DELIVERED'];

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  // Bids panel per order
  const [bidsPanel, setBidsPanel] = useState(null);
  const [bids, setBids] = useState([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [accepting, setAccepting] = useState(null);

  // Review modal
  const [reviewModal, setReviewModal] = useState(null); // { order }
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedOrders, setReviewedOrders] = useState(new Set());

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my');
      const data = res.data.data || [];
      setOrders(data);
      // Kiểm tra các đơn DELIVERED đã review chưa
      const deliveredIds = data.filter(o => o.status === 'DELIVERED').map(o => o.id);
      if (deliveredIds.length > 0) {
        Promise.all(deliveredIds.map(id =>
          api.get(`/reviews/check?referenceType=ORDER&referenceId=${id}`)
            .then(r => r.data.data ? id : null).catch(() => null)
        )).then(results => {
          setReviewedOrders(new Set(results.filter(Boolean)));
        });
      }
    } catch { toast.error('Không thể tải đơn hàng'); }
    finally { setLoading(false); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Hủy đơn hàng này?')) return;
    setCancelling(id);
    try {
      await api.post(`/orders/${id}/cancel`);
      toast.success('Đã hủy đơn hàng');
      fetchOrders();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Không thể hủy đơn');
    } finally { setCancelling(null); }
  };

  const toggleBids = async (orderId) => {
    if (bidsPanel === orderId) { setBidsPanel(null); return; }
    setBidsPanel(orderId);
    setLoadingBids(true);
    try {
      const res = await api.get(`/order-bids/order/${orderId}`);
      setBids(res.data.data || []);
    } catch { toast.error('Không thể tải báo giá'); }
    finally { setLoadingBids(false); }
  };

  const handleAcceptBid = async (orderId, bidId) => {
    if (!window.confirm('Chọn nhà thầu này? Các báo giá khác sẽ bị từ chối.')) return;
    setAccepting(bidId);
    try {
      await api.post(`/order-bids/order/${orderId}/accept/${bidId}`);
      toast.success('🎉 Đã chọn nhà thầu! Admin sẽ tiến hành ký kết hợp đồng.');
      fetchOrders();
      setBidsPanel(null);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi chọn nhà thầu');
    } finally { setAccepting(null); }
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
      toast.success('🌟 Cảm ơn bạn đã đánh giá!');
      setReviewedOrders(prev => new Set([...prev, reviewModal.id]));
      setReviewModal(null);
      setReviewData({ rating: 5, comment: '' });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi gửi đánh giá');
    } finally { setSubmittingReview(false); }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const counts = Object.fromEntries(Object.keys(STATUS_CFG).map(k => [k, orders.filter(o => o.status === k).length]));

  return (
    <>
    <Layout title="Đơn hàng của tôi">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Filter tabs */}
        <div className="flex flex-wrap justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${filter === 'all' ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary'}`}>
              Tất cả ({orders.length})
            </button>
            {Object.entries(STATUS_CFG).map(([k, v]) => counts[k] > 0 && (
              <button key={k} onClick={() => setFilter(k)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${filter === k ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary'}`}>
                {v.label} ({counts[k]})
              </button>
            ))}
          </div>
          <button onClick={() => navigate('/shop/order')}
            className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-light">
            <Plus size={15}/> Đặt hàng mới
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <ShoppingBag size={40} className="mx-auto text-gray-200 mb-3"/>
            <p className="text-gray-400 font-medium">Chưa có đơn hàng nào</p>
            <button onClick={() => navigate('/shop')} className="mt-4 btn btn-primary text-sm px-6 py-2.5">
              Khám phá Shop
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(o => {
              const st = STATUS_CFG[o.status] || STATUS_CFG.PENDING;
              const isCustom = o.type === 'CUSTOM';
              const steps = isCustom ? STEPS_CUSTOM : STEPS_CATALOG;
              const curStep = steps.indexOf(o.status);
              const isExp = expanded === o.id;
              const showBidsBtn = isCustom && ['OPEN_BIDDING','BIDDING_CLOSED'].includes(o.status);

              return (
                <div key={o.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${st.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}/>
                            {st.icon} {st.label}
                          </span>
                          {isCustom && (
                            <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Gavel size={10}/> Đấu giá tùy chỉnh
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-sm font-bold text-gray-700">{o.orderCode}</p>
                        <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleString('vi-VN')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Tổng tiền</p>
                        <p className="text-xl font-bold text-primary">
                          {isCustom && o.status === 'PENDING' ? 'Chờ báo giá' : fmt(o.totalAmount)}
                        </p>
                      </div>
                    </div>

                    {/* Progress stepper */}
                    {o.status !== 'CANCELLED' && (
                      <div className="flex items-center mb-4">
                        {steps.map((step, i) => {
                          const done = i <= curStep;
                          const active = i === curStep;
                          const stCfg = STATUS_CFG[step];
                          return (
                            <React.Fragment key={step}>
                              <div className="flex flex-col items-center gap-1">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                  done ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                                } ${active ? 'ring-2 ring-primary ring-offset-1' : ''}`}>
                                  {done && i < curStep ? '✓' : i + 1}
                                </div>
                                <span className={`text-[9px] font-medium hidden sm:block ${done ? 'text-primary' : 'text-gray-400'}`}>
                                  {stCfg?.label?.split(' ')[0]}
                                </span>
                              </div>
                              {i < steps.length - 1 && (
                                <div className={`flex-1 h-0.5 mx-0.5 transition-all ${i < curStep ? 'bg-primary' : 'bg-gray-200'}`}/>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    )}

                    {/* Alert: đang đấu giá */}
                    {o.status === 'OPEN_BIDDING' && (
                      <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5 text-xs text-blue-800 mb-3">
                        <Gavel size={14} className="mt-0.5 shrink-0"/>
                        <div>
                          <strong>Đơn đang mở đấu giá!</strong> Các nhà thầu đang gửi báo giá.
                          Nhấn "Xem báo giá" để xem chi tiết và chọn nhà thầu phù hợp.
                        </div>
                      </div>
                    )}

                    {/* Note */}
                    {o.processingNote && (
                      <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-xs text-blue-800 mb-3">
                        <AlertCircle size={12} className="mt-0.5 shrink-0"/><span>{o.processingNote}</span>
                      </div>
                    )}

                    {/* Items preview */}
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                      {o.items?.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 shrink-0">
                          {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-7 h-7 rounded-lg object-cover"/> : <Package size={15} className="text-gray-300"/>}
                          <div>
                            <p className="text-xs font-medium text-gray-700 max-w-[90px] truncate">{item.itemName}</p>
                            <p className="text-[10px] text-gray-400">×{item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <button onClick={() => setExpanded(isExp ? null : o.id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800">
                        {isExp ? <><ChevronUp size={14}/> Ẩn</> : <><ChevronDown size={14}/> Chi tiết</>}
                      </button>
                      <div className="flex gap-2 flex-wrap justify-end">
                        {showBidsBtn && (
                          <button onClick={() => toggleBids(o.id)}
                            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${
                              bidsPanel === o.id ? 'bg-primary text-white' : 'border border-primary text-primary hover:bg-primary-bg'
                            }`}>
                            {bidsPanel === o.id ? <EyeOff size={13}/> : <Eye size={13}/>}
                            {bidsPanel === o.id ? 'Ẩn báo giá' : 'Xem báo giá'}
                          </button>
                        )}
                        {o.status === 'DELIVERED' && o.assignedContractorId && (
                          reviewedOrders.has(o.id) ? (
                            <span className="flex items-center gap-1.5 text-xs text-amber-500 font-bold px-3 py-1.5 bg-amber-50 rounded-xl">
                              <Star size={13} fill="currentColor"/> Đã đánh giá
                            </span>
                          ) : (
                            <button onClick={() => { setReviewModal(o); setReviewData({ rating: 5, comment: '' }); }}
                              className="flex items-center gap-1.5 text-xs font-bold bg-amber-500 text-white px-3 py-1.5 rounded-xl hover:bg-amber-600">
                              <Star size={13}/> Đánh giá nhà thầu
                            </button>
                          )
                        )}
                        {o.status === 'PENDING' && (
                          <button onClick={() => handleCancel(o.id)} disabled={cancelling === o.id}
                            className="flex items-center gap-1.5 text-xs font-bold text-red-500 border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-50 disabled:opacity-50">
                            <XCircle size={13}/> {cancelling === o.id ? 'Đang hủy...' : 'Hủy đơn'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bids panel — BLIND BIDDING */}
                  {bidsPanel === o.id && (
                    <div className="border-t border-gray-100 p-5 bg-gray-50/50">
                      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-800 mb-4">
                        <EyeOff size={13} className="shrink-0"/>
                        <span><strong>Đấu giá bảo mật:</strong> Nhà thầu không thể xem báo giá của nhau. Chỉ bạn thấy danh sách này.</span>
                      </div>
                      {loadingBids ? (
                        <div className="text-center py-6 text-gray-400 text-sm">Đang tải báo giá...</div>
                      ) : bids.length === 0 ? (
                        <div className="text-center py-6 text-gray-400 text-sm">
                          Chưa có báo giá nào. Nhà thầu đang chuẩn bị hồ sơ.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {bids.map(bid => (
                            <div key={bid.id} className={`rounded-xl border p-4 bg-white ${
                              bid.status === 'ACCEPTED' ? 'border-green-300' : 'border-gray-200'
                            }`}>
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-primary-bg text-primary flex items-center justify-center font-bold text-sm shrink-0">
                                    {bid.contractorName?.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900 text-sm">{bid.contractorName}</p>
                                    <p className="text-xs text-gray-500">{bid.contractorPhone}</p>
                                  </div>
                                  {bid.status === 'ACCEPTED' && <span className="badge badge-green text-[10px]">✓ Đã chọn</span>}
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="font-bold text-primary text-lg">{fmt(bid.quotedPrice)}</p>
                                  <p className="text-xs text-gray-400">{bid.estimatedDays} ngày</p>
                                </div>
                              </div>

                              {bid.proposal && (
                                <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 mb-3 line-clamp-3">{bid.proposal}</p>
                              )}

                              {/* Bid items table */}
                              {bid.items?.length > 0 && (
                                <div className="overflow-x-auto mb-3">
                                  <table className="w-full text-xs border border-gray-100 rounded-lg overflow-hidden">
                                    <thead className="bg-gray-50"><tr>
                                      <th className="text-left px-3 py-1.5 text-gray-500 font-semibold">Hạng mục</th>
                                      <th className="text-center px-2 py-1.5 text-gray-500 font-semibold">SL</th>
                                      <th className="text-right px-2 py-1.5 text-gray-500 font-semibold">Đơn giá</th>
                                      <th className="text-right px-3 py-1.5 text-gray-500 font-semibold">Thành tiền</th>
                                    </tr></thead>
                                    <tbody>{bid.items.map((it, i) => (
                                      <tr key={i} className="border-t border-gray-50">
                                        <td className="px-3 py-1.5 text-gray-800 font-medium">{it.itemName}</td>
                                        <td className="px-2 py-1.5 text-center text-gray-500">{it.quantity} {it.unit}</td>
                                        <td className="px-2 py-1.5 text-right text-gray-600">{fmt(it.unitPrice)}</td>
                                        <td className="px-3 py-1.5 text-right font-bold text-primary">{fmt(it.totalPrice)}</td>
                                      </tr>
                                    ))}</tbody>
                                    <tfoot className="bg-primary-bg">
                                      <tr><td colSpan={3} className="px-3 py-1.5 text-right font-bold text-gray-700">Tổng:</td>
                                      <td className="px-3 py-1.5 text-right font-bold text-primary">{fmt(bid.quotedPrice)}</td></tr>
                                    </tfoot>
                                  </table>
                                </div>
                              )}

                              {bid.status === 'PENDING' && o.status === 'OPEN_BIDDING' && (
                                <button onClick={() => handleAcceptBid(o.id, bid.id)} disabled={accepting === bid.id}
                                  className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-primary-light disabled:opacity-60">
                                  <CheckCircle size={13}/>
                                  {accepting === bid.id ? 'Đang xử lý...' : 'Chọn nhà thầu này'}
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Expanded detail */}
                  {isExp && (
                    <div className="border-t border-gray-100 p-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Giao đến</p>
                          <p className="text-gray-700">{o.deliveryAddress}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Liên hệ</p>
                          <p className="text-gray-700">{o.contactPhone}</p>
                        </div>
                        {o.customRequirements && (
                          <div className="sm:col-span-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">Yêu cầu tùy chỉnh</p>
                            <p className="text-amber-800 text-xs whitespace-pre-wrap">{o.customRequirements}</p>
                          </div>
                        )}
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-50"><tr>
                            <th className="text-left px-4 py-2 font-semibold text-gray-500">Sản phẩm</th>
                            <th className="text-center px-3 py-2 font-semibold text-gray-500">SL</th>
                            <th className="text-right px-4 py-2 font-semibold text-gray-500">Thành tiền</th>
                          </tr></thead>
                          <tbody className="divide-y divide-gray-50">
                            {o.items?.map((item, i) => (
                              <tr key={i}>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    {item.imageUrl && <img src={item.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0"/>}
                                    <div>
                                      <p className="font-medium text-gray-800">{item.itemName}</p>
                                      {item.customNote && <p className="text-gray-400">{item.customNote}</p>}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-3 text-center text-gray-600">{item.quantity}</td>
                                <td className="px-4 py-3 text-right font-bold text-primary">{fmt(item.subtotal)}</td>
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

    {/* Review Modal */}
    {reviewModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Star size={18} className="text-amber-500"/> Đánh giá nhà thầu
          </h3>
          <p className="text-sm text-gray-500 mb-5">Đơn hàng: <span className="font-mono font-bold">{reviewModal.orderCode}</span></p>

          {/* Star rating */}
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Điểm đánh giá</p>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setReviewData(d => ({...d, rating: s}))}
                  className={`text-3xl transition-all hover:scale-110 ${s <= reviewData.rating ? 'text-amber-400' : 'text-gray-200'}`}>
                  ★
                </button>
              ))}
              <span className="ml-2 text-sm font-bold text-amber-600 self-center">{reviewData.rating}/5</span>
            </div>
          </div>

          {/* Comment */}
          <div className="mb-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Nhận xét</p>
            <textarea rows={4} value={reviewData.comment}
              onChange={e => setReviewData(d => ({...d, comment: e.target.value}))}
              placeholder="Nhà thầu thi công như thế nào? Chất lượng, thái độ, tiến độ..."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-primary resize-none"/>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setReviewModal(null)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">
              Hủy
            </button>
            <button onClick={handleSubmitReview} disabled={submittingReview}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 disabled:opacity-60 flex items-center justify-center gap-2">
              {submittingReview ? 'Đang gửi...' : <><Star size={14}/> Gửi đánh giá</>}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}