import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  Gavel, Search, ChevronDown, ChevronUp, Plus, X,
  Send, Clock, Package, CheckCircle, AlertCircle,
  FileText, Image as ImageIcon, Truck, Star, Eye,
  BadgeCheck, ClipboardList, Camera
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';

const fmt = (n) =>
  n == null ? '0đ' :
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n).replace('₫', 'đ');

const EMPTY_ITEM = { itemName: '', unit: 'cái', quantity: 1, unitPrice: '', description: '', sampleImageUrl: '' };

const ORDER_STATUS_CFG = {
  BIDDING_CLOSED: { label: 'Đã được chọn – Chờ ký hợp đồng', cls: 'bg-purple-100 text-purple-700', icon: <BadgeCheck size={12}/> },
  PROCESSING:     { label: 'Đang sản xuất / thi công',         cls: 'bg-indigo-100 text-indigo-700', icon: <Package size={12}/> },
  SHIPPED:        { label: 'Đang giao hàng',                    cls: 'bg-cyan-100 text-cyan-700',    icon: <Truck size={12}/> },
  DELIVERED:      { label: 'Hoàn thành',                        cls: 'bg-green-100 text-green-700',  icon: <CheckCircle size={12}/> },
  CANCELLED:      { label: 'Đã hủy',                            cls: 'bg-red-100 text-red-600',      icon: <X size={12}/> },
};

export default function OrderBiddingPage() {
  const { user, refreshUser } = useAuthStore();

  // ── Tab: open | mybids | assigned
  const [activeTab, setActiveTab] = useState('open');

  // ── Open bidding orders (đang mở)
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  // ── My bids (báo giá đã gửi)
  const [myBids, setMyBids] = useState([]);

  // ── Assigned orders (đơn được giao)
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loadingAssigned, setLoadingAssigned] = useState(false);
  const [expandedAssigned, setExpandedAssigned] = useState(null);

  // ── Bid form modal
  const [bidModal, setBidModal] = useState(null);
  const [form, setForm] = useState({
    quotedPrice: '', estimatedDays: '', proposal: '',
    portfolioImageUrl: '', items: [{ ...EMPTY_ITEM }]
  });
  const [submitting, setSubmitting] = useState(false);

  // ── Mark done modal
  const [markDoneModal, setMarkDoneModal] = useState(null);
  const [completionImageUrl, setCompletionImageUrl] = useState('');
  const [markingDone, setMarkingDone] = useState(false);

  useEffect(() => {
    refreshUser(); // Cập nhật approvalStatus mới nhất từ server
    fetchOpenOrders();
    fetchMyBids();
  }, []);

  useEffect(() => {
    if (activeTab === 'assigned' && assignedOrders.length === 0) {
      fetchAssignedOrders();
    }
  }, [activeTab]);

  const fetchOpenOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await api.get('/order-bids/open');
      setOrders(res.data.data || []);
    } catch { toast.error('Không thể tải danh sách đơn hàng'); }
    finally { setLoadingOrders(false); }
  };

  const fetchMyBids = async () => {
    try {
      const res = await api.get('/order-bids/my');
      setMyBids(res.data.data || []);
    } catch { /* silent */ }
  };

  const fetchAssignedOrders = async () => {
    setLoadingAssigned(true);
    try {
      const res = await api.get('/order-bids/assigned');
      setAssignedOrders(res.data.data || []);
    } catch { toast.error('Không thể tải đơn hàng được giao'); }
    finally { setLoadingAssigned(false); }
  };

  const hasBid = (orderId) => myBids.some(b => b.orderId === orderId);

  // ── Bid form helpers
  const openBidForm = (order) => {
    if (user?.approvalStatus !== 'APPROVED') { toast.error('Tài khoản chưa được duyệt'); return; }
    setBidModal(order);
    setForm({ quotedPrice: '', estimatedDays: '', proposal: '', portfolioImageUrl: '', items: [{ ...EMPTY_ITEM }] });
  };
  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }));
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, j) => j !== i) }));
  const updateItem = (i, field, val) => setForm(f => ({
    ...f, items: f.items.map((it, j) => j === i ? { ...it, [field]: val } : it)
  }));
  const totalBid = form.items.reduce((s, it) => s + (Number(it.unitPrice) || 0) * (Number(it.quantity) || 0), 0);

  const handleSubmitBid = async () => {
    if (!form.estimatedDays) { toast.error('Vui lòng nhập số ngày dự kiến'); return; }
    if (!form.proposal?.trim()) { toast.error('Vui lòng nhập mô tả giải pháp'); return; }
    for (const it of form.items) {
      if (!it.itemName?.trim()) { toast.error('Vui lòng nhập tên hạng mục'); return; }
    }
    setSubmitting(true);
    try {
      await api.post(`/order-bids/${bidModal.id}`, {
        quotedPrice: totalBid > 0 ? totalBid : (Number(form.quotedPrice) || null),
        estimatedDays: Number(form.estimatedDays),
        proposal: form.proposal,
        portfolioImageUrl: form.portfolioImageUrl,
        items: form.items.map(it => ({
          itemName: it.itemName,
          unit: it.unit,
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
          description: it.description,
          sampleImageUrl: it.sampleImageUrl,
        })),
      });
      toast.success('🎉 Đã gửi báo giá thành công!');
      setBidModal(null);
      fetchMyBids();
      fetchOpenOrders();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gửi báo giá thất bại');
    } finally { setSubmitting(false); }
  };

  // ── Mark done
  const handleMarkDone = async () => {
    if (!completionImageUrl.trim()) { toast.error('Vui lòng nhập URL ảnh hoàn thiện'); return; }
    setMarkingDone(true);
    try {
      await api.post(`/orders/${markDoneModal.id}/mark-done`, { completionImageUrl });
      toast.success('✅ Đã báo hoàn thành! Khách hàng sẽ xác nhận trong 24h.');
      setMarkDoneModal(null);
      setCompletionImageUrl('');
      fetchAssignedOrders();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Thao tác thất bại');
    } finally { setMarkingDone(false); }
  };

  const filteredOrders = orders.filter(o =>
    o.orderCode?.toLowerCase().includes(search.toLowerCase()) ||
    o.customRequirements?.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { key: 'open',     label: `Đang mở (${orders.length})`,          icon: <Gavel size={14}/> },
    { key: 'mybids',   label: `Báo giá của tôi (${myBids.length})`,  icon: <FileText size={14}/> },
    { key: 'assigned', label: `Đơn được giao (${assignedOrders.length})`, icon: <ClipboardList size={14}/> },
  ];

  return (
    <Layout title="Đấu thầu đơn hàng">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1 shadow-sm w-fit flex-wrap">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === t.key ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB: OPEN BIDDING ─────────────────────────────────────── */}
        {activeTab === 'open' && (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={15}/>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Tìm theo mã đơn, yêu cầu..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary"/>
            </div>

            {loadingOrders ? (
              <div className="text-center py-16 text-gray-400">Đang tải...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <Gavel size={40} className="mx-auto text-gray-200 mb-3"/>
                <p className="text-gray-400 font-medium">Hiện chưa có đơn hàng nào đang mở đấu giá</p>
                <p className="text-gray-300 text-sm mt-1">Hệ thống sẽ thông báo ngay khi có đơn mới</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map(o => {
                  const alreadyBid = hasBid(o.id);
                  const isExp = expanded === o.id;
                  return (
                    <div key={o.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="badge badge-blue flex items-center gap-1"><Gavel size={10}/> Đang mở đấu giá</span>
                              {alreadyBid && <span className="badge badge-green text-[10px]">✓ Đã gửi báo giá</span>}
                            </div>
                            <p className="font-mono text-sm font-bold text-gray-700">{o.orderCode}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                              <Clock size={11}/> {new Date(o.createdAt).toLocaleString('vi-VN')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Khu vực</p>
                            <p className="text-sm font-medium text-gray-700">{o.deliveryAddress || '—'}</p>
                          </div>
                        </div>

                        {o.customRequirements && (
                          <div className={`rounded-xl p-3 mb-3 text-sm bg-amber-50 border border-amber-200 text-amber-800 ${!isExp ? 'line-clamp-3' : ''}`}>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">Yêu cầu của khách hàng</p>
                            <p className="whitespace-pre-wrap text-xs">{o.customRequirements}</p>
                          </div>
                        )}

                        {o.items?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {o.items.slice(0, 3).map((it, i) => (
                              <div key={i} className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5 text-xs">
                                {it.imageUrl && <img src={it.imageUrl} alt="" className="w-6 h-6 rounded object-cover"/>}
                                <span className="text-gray-700 font-medium">{it.itemName}</span>
                                <span className="text-gray-400">×{it.quantity}</span>
                              </div>
                            ))}
                            {o.items.length > 3 && <span className="text-xs text-gray-400 self-center">+{o.items.length - 3} hạng mục</span>}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <button onClick={() => setExpanded(isExp ? null : o.id)}
                            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800">
                            {isExp ? <><ChevronUp size={13}/> Ẩn</> : <><ChevronDown size={13}/> Xem thêm</>}
                          </button>
                          {!alreadyBid ? (
                            <button onClick={() => openBidForm(o)}
                              className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-primary-light transition-colors">
                              <Send size={13}/> Gửi báo giá
                            </button>
                          ) : (
                            <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                              <CheckCircle size={13}/> Đã gửi báo giá
                            </span>
                          )}
                        </div>

                        {/* Expanded: ảnh tham khảo */}
                        {isExp && o.referenceImageUrl && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Ảnh tham khảo</p>
                            <img src={o.referenceImageUrl} alt="tham khảo" className="rounded-xl max-h-48 object-cover"/>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── TAB: MY BIDS ─────────────────────────────────────────── */}
        {activeTab === 'mybids' && (
          <div className="space-y-3">
            {myBids.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <FileText size={40} className="mx-auto text-gray-200 mb-3"/>
                <p className="text-gray-400 font-medium">Bạn chưa gửi báo giá nào</p>
              </div>
            ) : myBids.map(b => (
              <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge ${
                        b.status === 'ACCEPTED' ? 'badge-green' :
                        b.status === 'REJECTED' ? 'badge-red' : 'badge-amber'}`}>
                        {b.status === 'ACCEPTED' ? '✓ Đã được chọn' :
                         b.status === 'REJECTED' ? 'Không được chọn' : '⏳ Chờ kết quả'}
                      </span>
                      <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        Đơn: {b.orderStatus || '—'}
                      </span>
                    </div>
                    <p className="font-mono text-sm font-bold text-gray-700">{b.orderCode}</p>
                    <p className="text-xs text-gray-400">{new Date(b.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{b.quotedPrice ? fmt(b.quotedPrice) : '—'}</p>
                    {b.estimatedDays && <p className="text-xs text-gray-400">{b.estimatedDays} ngày</p>}
                  </div>
                </div>
                {b.proposal && (
                  <p className="text-xs text-gray-600 bg-gray-50 rounded-xl p-3 mb-3 line-clamp-3">{b.proposal}</p>
                )}
                {b.items?.length > 0 && (
                  <div className="overflow-x-auto mb-3">
                    <table className="w-full text-xs border border-gray-100 rounded-lg overflow-hidden">
                      <thead className="bg-gray-50"><tr>
                        <th className="text-left px-3 py-1.5 text-gray-500 font-semibold">Hạng mục</th>
                        <th className="text-center px-2 py-1.5 text-gray-500 font-semibold">SL</th>
                        <th className="text-right px-2 py-1.5 text-gray-500 font-semibold">Đơn giá</th>
                        <th className="text-right px-3 py-1.5 text-gray-500 font-semibold">Thành tiền</th>
                      </tr></thead>
                      <tbody>{b.items.map((it, i) => (
                        <tr key={i} className="border-t border-gray-50">
                          <td className="px-3 py-1.5 text-gray-800 font-medium">{it.itemName}</td>
                          <td className="px-2 py-1.5 text-center text-gray-500">{it.quantity} {it.unit}</td>
                          <td className="px-2 py-1.5 text-right text-gray-600">{fmt(it.unitPrice)}</td>
                          <td className="px-3 py-1.5 text-right font-bold text-primary">{fmt(it.totalPrice)}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}
                {b.status === 'ACCEPTED' && (
                  <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-800">
                    <CheckCircle size={15} className="mt-0.5 shrink-0"/>
                    <span>🎉 Chúc mừng! Khách hàng đã chọn báo giá của bạn. Admin sẽ liên hệ để ký kết hợp đồng. Hãy kiểm tra tab <strong>Đơn được giao</strong>.</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── TAB: ASSIGNED ORDERS ─────────────────────────────────── */}
        {activeTab === 'assigned' && (
          <div className="space-y-3">
            {loadingAssigned ? (
              <div className="text-center py-16 text-gray-400">Đang tải...</div>
            ) : assignedOrders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <ClipboardList size={40} className="mx-auto text-gray-200 mb-3"/>
                <p className="text-gray-400 font-medium">Chưa có đơn hàng nào được giao cho bạn</p>
                <p className="text-gray-300 text-sm mt-1">Khi khách hàng chọn báo giá của bạn, đơn sẽ xuất hiện ở đây</p>
              </div>
            ) : assignedOrders.map(o => {
              const stCfg = ORDER_STATUS_CFG[o.status] || { label: o.status, cls: 'bg-gray-100 text-gray-600', icon: null };
              const isExp = expandedAssigned === o.id;
              const canMarkDone = o.status === 'PROCESSING' && !o.contractorMarkedDone;
              const alreadyMarked = o.contractorMarkedDone;

              return (
                <div key={o.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${stCfg.cls}`}>
                            {stCfg.icon} {stCfg.label}
                          </span>
                          {o.type === 'CUSTOM' && (
                            <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Gavel size={10}/> Đấu giá
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-sm font-bold text-gray-700">{o.orderCode}</p>
                        <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleString('vi-VN')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Giá trị đơn</p>
                        <p className="text-xl font-bold text-primary">{fmt(o.totalAmount)}</p>
                        {o.depositAmount && (
                          <p className="text-xs text-gray-400">Đặt cọc: {fmt(o.depositAmount)}</p>
                        )}
                      </div>
                    </div>

                    {/* Status messages */}
                    {o.status === 'BIDDING_CLOSED' && (
                      <div className="flex items-start gap-2 bg-purple-50 border border-purple-200 rounded-xl px-3 py-2.5 text-xs text-purple-800 mb-3">
                        <BadgeCheck size={14} className="mt-0.5 shrink-0"/>
                        <span><strong>Bạn đã được chọn!</strong> Vui lòng chờ khách hàng đặt cọc và Admin ký hợp đồng trước khi bắt đầu sản xuất.</span>
                      </div>
                    )}
                    {o.status === 'PROCESSING' && (
                      <div className="flex items-start gap-2 bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2.5 text-xs text-indigo-800 mb-3">
                        <Package size={14} className="mt-0.5 shrink-0"/>
                        <span><strong>Đang sản xuất.</strong> Khi hoàn thiện sản phẩm, nhấn "Báo hoàn thành" và upload ảnh để thông báo cho khách hàng.</span>
                      </div>
                    )}
                    {alreadyMarked && o.status === 'SHIPPED' && (
                      <div className="flex items-start gap-2 bg-cyan-50 border border-cyan-200 rounded-xl px-3 py-2.5 text-xs text-cyan-800 mb-3">
                        <Truck size={14} className="mt-0.5 shrink-0"/>
                        <span>Bạn đã báo hoàn thành lúc {o.contractorDoneAt ? new Date(o.contractorDoneAt).toLocaleString('vi-VN') : ''}. Chờ khách hàng xác nhận (tự động sau 24h).</span>
                      </div>
                    )}
                    {o.completionImageUrl && (
                      <div className="mb-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">Ảnh sản phẩm hoàn thiện</p>
                        <img src={o.completionImageUrl} alt="hoàn thiện" className="rounded-xl max-h-40 object-cover border border-gray-100"/>
                      </div>
                    )}
                    {o.processingNote && (
                      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-xs text-blue-800 mb-3">
                        <AlertCircle size={12} className="mt-0.5 shrink-0"/><span>{o.processingNote}</span>
                      </div>
                    )}

                    {/* Items preview */}
                    {o.items?.length > 0 && (
                      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                        {o.items.slice(0, 3).map((item, i) => (
                          <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 shrink-0">
                            {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-7 h-7 rounded-lg object-cover"/> : <Package size={15} className="text-gray-300"/>}
                            <div>
                              <p className="text-xs font-medium text-gray-700 max-w-[90px] truncate">{item.itemName}</p>
                              <p className="text-[10px] text-gray-400">×{item.quantity}</p>
                            </div>
                          </div>
                        ))}
                        {o.items.length > 3 && <span className="text-xs text-gray-400 self-center">+{o.items.length - 3}</span>}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <button onClick={() => setExpandedAssigned(isExp ? null : o.id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800">
                        {isExp ? <><ChevronUp size={14}/> Ẩn</> : <><ChevronDown size={14}/> Chi tiết</>}
                      </button>
                      {canMarkDone && (
                        <button onClick={() => { setMarkDoneModal(o); setCompletionImageUrl(''); }}
                          className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-primary-light">
                          <Camera size={13}/> Báo hoàn thành
                        </button>
                      )}
                      {o.status === 'DELIVERED' && (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                          <CheckCircle size={13}/> Hoàn thành & đã thanh toán
                        </span>
                      )}
                    </div>
                  </div>

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
                        <div className="sm:col-span-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Chi tiết hạng mục</p>
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
                                    <td className="px-4 py-2.5">
                                      <div className="flex items-center gap-2">
                                        {item.imageUrl && <img src={item.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0"/>}
                                        <div>
                                          <p className="font-medium text-gray-800">{item.itemName}</p>
                                          {item.customNote && <p className="text-gray-400">{item.customNote}</p>}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-3 py-2.5 text-center text-gray-600">{item.quantity}</td>
                                    <td className="px-4 py-2.5 text-right font-bold text-primary">{fmt(item.subtotal)}</td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className="bg-gray-50">
                                <tr>
                                  <td colSpan={2} className="px-4 py-2.5 text-right font-bold text-gray-700">Tổng:</td>
                                  <td className="px-4 py-2.5 text-right font-bold text-primary">{fmt(o.totalAmount)}</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── BID FORM MODAL ────────────────────────────────────────── */}
      {bidModal && (
        <div className="fixed inset-0 z-50 bg-black/40 overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto bg-white rounded-3xl mt-6 mb-6 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Gửi báo giá</h2>
                <p className="text-sm text-gray-500 mt-0.5">Đơn: {bidModal.orderCode}</p>
              </div>
              <button onClick={() => setBidModal(null)} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400">
                <X size={18}/>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {bidModal.customRequirements && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-1">Yêu cầu của khách hàng</p>
                  <p className="text-sm text-amber-800 whitespace-pre-wrap">{bidModal.customRequirements}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="field-label">Số ngày dự kiến *</label>
                  <input type="number" min="1" value={form.estimatedDays}
                    onChange={e => setForm(f => ({...f, estimatedDays: e.target.value}))}
                    placeholder="VD: 30" className="field"/>
                </div>
                <div>
                  <label className="field-label">Tổng giá (tự tính từ bảng dưới)</label>
                  <div className="field bg-primary-bg border-primary text-primary font-bold text-base">
                    {fmt(totalBid)}
                  </div>
                </div>
              </div>

              <div>
                <label className="field-label">Mô tả giải pháp / Hồ sơ năng lực *</label>
                <textarea rows={4} value={form.proposal}
                  onChange={e => setForm(f => ({...f, proposal: e.target.value}))}
                  placeholder="Mô tả kinh nghiệm, phương án thi công, vật liệu đề xuất..."
                  className="field resize-none"/>
              </div>

              <div>
                <label className="field-label">Ảnh portfolio (URL)</label>
                <input value={form.portfolioImageUrl}
                  onChange={e => setForm(f => ({...f, portfolioImageUrl: e.target.value}))}
                  placeholder="https://..." className="field"/>
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-gray-900">Chi tiết báo giá (hạng mục)</p>
                  <button onClick={addItem}
                    className="flex items-center gap-1.5 text-xs font-bold bg-primary text-white px-3 py-1.5 rounded-xl hover:bg-primary-light">
                    <Plus size={13}/> Thêm hạng mục
                  </button>
                </div>
                <div className="space-y-3">
                  {form.items.map((it, i) => (
                    <div key={i} className="border border-gray-100 rounded-xl p-4 relative">
                      <button onClick={() => removeItem(i)} disabled={form.items.length === 1}
                        className="absolute top-3 right-3 text-gray-300 hover:text-red-500 disabled:opacity-30">
                        <X size={15}/>
                      </button>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-2">
                          <label className="field-label">Tên hạng mục *</label>
                          <input value={it.itemName} onChange={e => updateItem(i, 'itemName', e.target.value)}
                            placeholder="VD: Sofa góc L..." className="field"/>
                        </div>
                        <div>
                          <label className="field-label">Đơn vị</label>
                          <input value={it.unit} onChange={e => updateItem(i, 'unit', e.target.value)}
                            placeholder="cái / bộ / m²" className="field"/>
                        </div>
                        <div>
                          <label className="field-label">Số lượng</label>
                          <input type="number" min="1" value={it.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)}
                            className="field"/>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="field-label">Đơn giá (VNĐ)</label>
                          <input type="number" min="0" value={it.unitPrice} onChange={e => updateItem(i, 'unitPrice', e.target.value)}
                            placeholder="0" className="field"/>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="field-label">Thành tiền</label>
                          <div className="field bg-gray-50 text-primary font-bold">
                            {fmt((Number(it.unitPrice) || 0) * (Number(it.quantity) || 0))}
                          </div>
                        </div>
                        <div className="sm:col-span-4">
                          <label className="field-label">Mô tả hạng mục</label>
                          <input value={it.description} onChange={e => updateItem(i, 'description', e.target.value)}
                            placeholder="Chất liệu, kích thước, màu sắc..." className="field"/>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-3 p-3 bg-primary-bg rounded-xl">
                  <span className="font-bold text-primary text-lg">Tổng: {fmt(totalBid)}</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setBidModal(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">
                Hủy
              </button>
              <button onClick={handleSubmitBid} disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-light disabled:opacity-50">
                {submitting
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Đang gửi...</>
                  : <><Send size={15}/> Gửi báo giá ({fmt(totalBid)})</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MARK DONE MODAL ──────────────────────────────────────── */}
      {markDoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Báo hoàn thành sản phẩm</h3>
                <p className="text-sm text-gray-500">Đơn: {markDoneModal.orderCode}</p>
              </div>
              <button onClick={() => setMarkDoneModal(null)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"><X size={18}/></button>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 text-xs text-blue-800">
              <strong>Lưu ý:</strong> Sau khi báo hoàn thành, khách hàng có <strong>24 giờ</strong> để xác nhận. Nếu không phản hồi, hệ thống sẽ tự động giải ngân cho bạn.
            </div>

            <label className="field-label">URL ảnh sản phẩm hoàn thiện *</label>
            <input value={completionImageUrl} onChange={e => setCompletionImageUrl(e.target.value)}
              placeholder="https://..." className="field mb-1"/>
            {completionImageUrl && (
              <img src={completionImageUrl} alt="preview" className="mt-2 rounded-xl max-h-40 object-cover w-full mb-4"/>
            )}
            <div className="flex gap-3 mt-4">
              <button onClick={() => setMarkDoneModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">
                Hủy
              </button>
              <button onClick={handleMarkDone} disabled={markingDone}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-light disabled:opacity-60 flex items-center justify-center gap-2">
                {markingDone
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Đang gửi...</>
                  : <><Camera size={15}/> Xác nhận hoàn thành</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .field-label { display:block; font-size:.7rem; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:.08em; margin-bottom:5px; }
        .field { width:100%; border:1px solid #e5e7eb; border-radius:10px; padding:9px 12px; font-size:.875rem; outline:none; background:#fafafa; transition:border-color .15s; }
        .field:focus { border-color:#1a4f3a; background:white; }
      `}</style>
    </Layout>
  );
}
