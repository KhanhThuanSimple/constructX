import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  Package, Search, ChevronDown, ChevronUp, AlertCircle,
  CheckCircle, Truck, XCircle, Clock, Gavel, Users,
  Eye, ExternalLink
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const fmt = (n) =>
  n == null ? '0đ' :
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n).replace('₫', 'đ');

const STATUS_CFG = {
  PENDING:        { label: 'Chờ duyệt',       cls: 'badge-amber', next: 'OPEN_BIDDING',   nextLabel: '✅ Duyệt & Mở đấu giá' },
  CONFIRMED:      { label: 'Đã xác nhận',     cls: 'badge-blue',  next: 'PROCESSING',    nextLabel: 'Bắt đầu sản xuất' },
  OPEN_BIDDING:   { label: 'Đang đấu giá',    cls: 'badge-blue',  next: null,             nextLabel: null },
  BIDDING_CLOSED: { label: 'Đã chọn nhà thầu',cls: 'badge-blue',  next: 'PROCESSING',    nextLabel: 'Bắt đầu sản xuất' },
  PROCESSING:     { label: 'Đang sản xuất',   cls: 'badge-blue',  next: 'SHIPPED',        nextLabel: '🚚 Đánh dấu đang giao' },
  SHIPPED:        { label: 'Đang giao',        cls: 'badge-blue',  next: 'DELIVERED',      nextLabel: '✅ Xác nhận đã giao' },
  DELIVERED:      { label: 'Đã giao',          cls: 'badge-green', next: null,             nextLabel: null },
  CANCELLED:      { label: 'Đã hủy',           cls: 'badge-red',   next: null,             nextLabel: null },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [bidModal, setBidModal] = useState(null); // orderId để xem bids
  const [bids, setBids] = useState([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [noteModal, setNoteModal] = useState(null);
  const [noteValue, setNoteValue] = useState('');
  const [processing, setProcessing] = useState(null);

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/orders?status=${statusFilter}`);
      const data = res.data.data || res.data || [];
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Lỗi tải đơn hàng:', e);
      toast.error('Không thể tải đơn hàng: ' + (e.response?.data?.message || e.message));
    }
    finally { setLoading(false); }
  };

  const openBids = async (orderId) => {
    setLoadingBids(true);
    setBidModal(orderId);
    try {
      const res = await api.get(`/order-bids/order/${orderId}`);
      setBids(res.data.data || []);
    } catch { toast.error('Không thể tải báo giá'); }
    finally { setLoadingBids(false); }
  };

  const handleApproveForBidding = async (orderId) => {
    setProcessing(orderId);
    try {
      await api.post(`/admin/orders/${orderId}/approve-bidding`, { note: noteValue });
      toast.success('✅ Đã duyệt & mở đấu giá! Nhà thầu đã được thông báo.');
      setNoteModal(null); setNoteValue('');
      fetchOrders();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi'); }
    finally { setProcessing(null); }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setProcessing(orderId);
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus, note: noteValue });
      toast.success('Cập nhật thành công');
      setNoteModal(null); setNoteValue('');
      fetchOrders();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi cập nhật'); }
    finally { setProcessing(null); }
  };

  const stats = Object.fromEntries(Object.keys(STATUS_CFG).map(k => [k, orders.filter(o => o.status === k).length]));
  const filtered = orders.filter(o =>
    o.orderCode?.toLowerCase().includes(search.toLowerCase()) ||
    o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    o.contactPhone?.includes(search)
  );

  return (
    <Layout title="Quản lý đơn hàng">
      <div className="space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {Object.entries(STATUS_CFG).map(([k, v]) => (
            <button key={k} onClick={() => setStatusFilter(statusFilter === k ? 'all' : k)}
              className={`bg-white rounded-xl border p-2.5 text-center transition-all ${statusFilter === k ? 'border-primary shadow-md' : 'border-gray-100 shadow-sm hover:border-gray-200'}`}>
              <p className="text-[9px] text-gray-500 mb-0.5 truncate">{v.label}</p>
              <p className={`text-xl font-bold ${statusFilter === k ? 'text-primary' : 'text-gray-900'}`}>{stats[k] || 0}</p>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm mã đơn, tên khách, SĐT..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary"/>
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white outline-none focus:border-primary">
            <option value="all">Tất cả</option>
            {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        {/* Orders */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
            <Package size={36} className="mx-auto text-gray-200 mb-3"/>
            <p className="text-gray-400">Không có đơn hàng nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(o => {
              const st = STATUS_CFG[o.status] || {};
              const isExp = expanded === o.id;
              return (
                <div key={o.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`badge ${st.cls}`}>{st.label}</span>
                          {o.type === 'CUSTOM' && <span className="badge badge-amber text-[10px] flex items-center gap-1"><Gavel size={10}/> Đấu giá</span>}
                          <span className="font-mono text-sm font-bold text-gray-700">{o.orderCode}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-800">{o.customerName} · {o.contactPhone}</p>
                        <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleString('vi-VN')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">{fmt(o.totalAmount)}</p>
                        <p className="text-xs text-gray-400">{o.items?.length} sản phẩm</p>
                      </div>
                    </div>

                    {/* Custom requirements */}
                    {o.customRequirements && (
                      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3 text-xs text-amber-800">
                        <Gavel size={12} className="mt-0.5 shrink-0"/>
                        <p className="line-clamp-2">{o.customRequirements}</p>
                      </div>
                    )}

                    {o.processingNote && (
                      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 text-xs text-blue-800 mb-3">
                        <AlertCircle size={12} className="mt-0.5 shrink-0"/><span>{o.processingNote}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex gap-2">
                        <button onClick={() => setExpanded(isExp ? null : o.id)}
                          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800">
                          {isExp ? <><ChevronUp size={14}/> Ẩn</> : <><ChevronDown size={14}/> Chi tiết</>}
                        </button>
                        {/* Xem báo giá (chỉ với đơn đang/đã đấu giá) */}
                        {['OPEN_BIDDING','BIDDING_CLOSED','PROCESSING','DELIVERED'].includes(o.status) && o.type === 'CUSTOM' && (
                          <button onClick={() => openBids(o.id)}
                            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                            <Users size={13}/> Xem báo giá
                          </button>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {o.status === 'PENDING' && o.type === 'CUSTOM' && (
                          <>
                            <button onClick={() => handleUpdateStatus(o.id, 'CANCELLED')} disabled={processing === o.id}
                              className="text-xs font-bold border-2 border-red-200 text-red-500 px-3 py-1.5 rounded-xl hover:bg-red-50 disabled:opacity-50">
                              Hủy đơn
                            </button>
                            <button onClick={() => setNoteModal({ id: o.id, action: 'approve' })}
                              className="text-xs font-bold bg-primary text-white px-4 py-1.5 rounded-xl hover:bg-primary-light flex items-center gap-1.5">
                              <CheckCircle size={13}/> Duyệt & Mở đấu giá
                            </button>
                          </>
                        )}
                        {o.status === 'PENDING' && o.type !== 'CUSTOM' && (
                          <>
                            <button onClick={() => handleUpdateStatus(o.id, 'CANCELLED')} disabled={processing === o.id}
                              className="text-xs font-bold border-2 border-red-200 text-red-500 px-3 py-1.5 rounded-xl hover:bg-red-50 disabled:opacity-50">
                              Hủy đơn
                            </button>
                            <button onClick={() => setNoteModal({ id: o.id, action: 'confirm' })}
                              className="text-xs font-bold bg-primary text-white px-4 py-1.5 rounded-xl hover:bg-primary-light flex items-center gap-1.5">
                              <CheckCircle size={13}/> Xác nhận đơn
                            </button>
                          </>
                        )}
                        {st.next && o.status !== 'PENDING' && (
                          <button onClick={() => setNoteModal({ id: o.id, action: 'status', nextStatus: st.next })}
                            className="text-xs font-bold bg-primary text-white px-4 py-1.5 rounded-xl hover:bg-primary-light">
                            {st.nextLabel}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded items */}
                  {isExp && (
                    <div className="border-t border-gray-100 p-5">
                      <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                        <div><p className="text-gray-400 font-bold uppercase tracking-wide mb-0.5">Giao đến</p><p className="text-gray-700">{o.deliveryAddress}</p></div>
                        {o.customerNote && <div><p className="text-gray-400 font-bold uppercase tracking-wide mb-0.5">Ghi chú</p><p className="text-gray-700">{o.customerNote}</p></div>}
                        {o.customRequirements && (
                          <div className="col-span-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                            <p className="text-amber-600 font-bold uppercase tracking-wide text-[10px] mb-1">Yêu cầu tùy chỉnh</p>
                            <p className="text-amber-800 whitespace-pre-wrap">{o.customRequirements}</p>
                          </div>
                        )}
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-50"><tr>
                            <th className="text-left px-4 py-2 font-semibold text-gray-500">Sản phẩm</th>
                            <th className="text-center px-3 py-2 font-semibold text-gray-500">SL</th>
                            <th className="text-right px-3 py-2 font-semibold text-gray-500">Đơn giá</th>
                            <th className="text-right px-4 py-2 font-semibold text-gray-500">Thành tiền</th>
                          </tr></thead>
                          <tbody className="divide-y divide-gray-50">
                            {o.items?.map((item, i) => (
                              <tr key={i}>
                                <td className="px-4 py-2.5">
                                  <div className="flex items-center gap-2">
                                    {item.imageUrl && <img src={item.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover"/>}
                                    <div><p className="font-medium text-gray-800">{item.itemName}</p>
                                    {item.customNote && <p className="text-gray-400">{item.customNote}</p>}</div>
                                  </div>
                                </td>
                                <td className="px-3 py-2.5 text-center">{item.quantity}</td>
                                <td className="px-3 py-2.5 text-right">{fmt(item.unitPrice)}</td>
                                <td className="px-4 py-2.5 text-right font-bold text-primary">{fmt(item.subtotal)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-gray-50">
                            <tr><td colSpan={3} className="px-4 py-2.5 text-right font-bold text-gray-700">Tổng:</td>
                            <td className="px-4 py-2.5 text-right font-bold text-primary">{fmt(o.totalAmount)}</td></tr>
                          </tfoot>
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

      {/* Note/Action modal */}
      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-gray-900 mb-1">
              {noteModal.action === 'approve' ? '✅ Duyệt đơn & Mở đấu giá'
               : noteModal.action === 'confirm' ? '✅ Xác nhận đơn hàng'
               : STATUS_CFG[noteModal.nextStatus]?.nextLabel}
            </h3>
            {noteModal.action === 'approve' && (
              <p className="text-sm text-gray-500 mb-3">Toàn bộ nhà thầu đã được phê duyệt sẽ nhận thông báo.</p>
            )}
            {noteModal.action === 'confirm' && (
              <p className="text-sm text-gray-500 mb-3">Xác nhận đơn hàng catalog. Admin sẽ xử lý giao hàng.</p>
            )}
            <textarea rows={3} value={noteValue} onChange={e => setNoteValue(e.target.value)}
              placeholder="Ghi chú cho khách hàng (không bắt buộc)..."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-primary resize-none mb-4"/>
            <div className="flex gap-3">
              <button onClick={() => { setNoteModal(null); setNoteValue(''); }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">Hủy</button>
              <button
                onClick={() => noteModal.action === 'approve'
                  ? handleApproveForBidding(noteModal.id)
                  : handleUpdateStatus(noteModal.id, noteModal.nextStatus)}
                disabled={processing === noteModal.id}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-light disabled:opacity-60">
                {processing === noteModal.id ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bids modal */}
      {bidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 flex items-center gap-2"><Users size={18}/> Báo giá nhận được</h3>
              <button onClick={() => setBidModal(null)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">✕</button>
            </div>
            <div className="overflow-y-auto p-5 space-y-3">
              {loadingBids ? <div className="text-center py-8 text-gray-400">Đang tải...</div>
              : bids.length === 0 ? <div className="text-center py-8 text-gray-400">Chưa có báo giá nào.</div>
              : bids.map(b => (
                <div key={b.id} className={`rounded-xl border p-4 ${b.status === 'ACCEPTED' ? 'border-green-300 bg-green-50' : b.status === 'REJECTED' ? 'border-gray-200 bg-gray-50 opacity-60' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">{b.contractorName}</p>
                      <p className="text-xs text-gray-500">{b.contractorPhone}</p>
                      {b.status === 'ACCEPTED' && <span className="badge badge-green text-[10px] mt-1">✓ Đã chọn</span>}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{b.quotedPrice ? fmt(b.quotedPrice) : 'Chưa xác định'}</p>
                      {b.estimatedDays && <p className="text-xs text-gray-400">{b.estimatedDays} ngày</p>}
                    </div>
                  </div>
                  {b.proposal && <p className="mt-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-2 line-clamp-3">{b.proposal}</p>}
                  {b.items?.length > 0 && (
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full text-xs border border-gray-100 rounded-lg overflow-hidden">
                        <thead className="bg-gray-50"><tr>
                          <th className="text-left px-3 py-1.5 text-gray-500">Hạng mục</th>
                          <th className="text-center px-2 py-1.5 text-gray-500">SL</th>
                          <th className="text-right px-3 py-1.5 text-gray-500">Thành tiền</th>
                        </tr></thead>
                        <tbody>{b.items.map((it, i) => (
                          <tr key={i} className="border-t border-gray-50">
                            <td className="px-3 py-1.5 text-gray-800">{it.itemName}</td>
                            <td className="px-2 py-1.5 text-center text-gray-600">{it.quantity} {it.unit}</td>
                            <td className="px-3 py-1.5 text-right font-bold text-primary">{fmt(it.totalPrice)}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
