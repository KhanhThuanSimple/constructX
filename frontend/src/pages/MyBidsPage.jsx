import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  Gavel, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp,
  FileText, DollarSign, CalendarDays, Star, ArrowRight, Search
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const fmt = (n) =>
  n == null ? '0đ' :
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n).replace('₫', 'đ');

const STATUS_CFG = {
  PENDING:   { label: 'Chờ kết quả',     cls: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-400 animate-pulse', icon: <Clock size={12}/> },
  ACCEPTED:  { label: 'Đã được chọn',    cls: 'bg-green-100 text-green-700',   dot: 'bg-green-500',               icon: <CheckCircle size={12}/> },
  REJECTED:  { label: 'Không được chọn', cls: 'bg-gray-100 text-gray-500',     dot: 'bg-gray-400',                icon: <XCircle size={12}/> },
  CANCELLED: { label: 'Đã hủy',          cls: 'bg-red-100 text-red-600',       dot: 'bg-red-400',                 icon: <XCircle size={12}/> },
  WITHDRAWN: { label: 'Đã rút lui',      cls: 'bg-gray-100 text-gray-400',     dot: 'bg-gray-300',                icon: <XCircle size={12}/> },
};

export default function MyBidsPage() {
  const navigate = useNavigate();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { fetchBids(); }, []);

  const fetchBids = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bids/my');
      setBids(res.data.data || []);
    } catch {
      toast.error('Không thể tải danh sách báo giá');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (bidId) => {
    if (!window.confirm('Rút báo giá này?')) return;
    try {
      await api.post(`/bids/${bidId}/withdraw`);
      toast.success('Đã rút báo giá');
      fetchBids();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Không thể rút báo giá');
    }
  };

  const filtered = bids
    .filter(b => filter === 'all' || b.status === filter)
    .filter(b =>
      !search ||
      b.projectName?.toLowerCase().includes(search.toLowerCase())
    );

  const counts = {
    all: bids.length,
    PENDING: bids.filter(b => b.status === 'PENDING').length,
    ACCEPTED: bids.filter(b => b.status === 'ACCEPTED').length,
    REJECTED: bids.filter(b => b.status === 'REJECTED').length,
  };

  return (
    <Layout title="Báo giá dự án của tôi">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { key: 'all',      label: 'Tất cả',           cls: 'text-gray-900' },
            { key: 'PENDING',  label: 'Đang chờ',          cls: 'text-amber-600' },
            { key: 'ACCEPTED', label: 'Được chọn',         cls: 'text-green-600' },
            { key: 'REJECTED', label: 'Không được chọn',   cls: 'text-gray-400' },
          ].map(s => (
            <button key={s.key} onClick={() => setFilter(s.key)}
              className={`bg-white rounded-2xl border p-4 text-center transition-all ${
                filter === s.key ? 'border-primary shadow-md' : 'border-gray-100 shadow-sm hover:border-gray-200'
              }`}>
              <p className={`text-2xl font-bold ${s.cls}`}>{counts[s.key] ?? bids.filter(b => b.status === s.key).length}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={15}/>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên dự án..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary"/>
        </div>

        {/* Bids list */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <Gavel size={40} className="mx-auto text-gray-200 mb-3"/>
            <p className="text-gray-400 font-medium">Chưa có báo giá nào</p>
            <button onClick={() => navigate('/projects/browse')}
              className="mt-4 btn btn-primary text-sm px-6 py-2.5 flex items-center gap-2 mx-auto">
              Tìm dự án <ArrowRight size={15}/>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(bid => {
              const st = STATUS_CFG[bid.status] || STATUS_CFG.PENDING;
              const isExp = expanded === bid.id;
              return (
                <div key={bid.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${st.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}/>
                            {st.icon} {st.label}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-base">{bid.projectName}</h3>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <CalendarDays size={11}/>
                          Gửi lúc {new Date(bid.submittedAt || bid.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Báo giá của bạn</p>
                        <p className="text-xl font-bold text-primary">{fmt(bid.totalPrice)}</p>
                        {bid.estimatedDays && (
                          <p className="text-xs text-gray-400">{bid.estimatedDays} ngày thi công</p>
                        )}
                      </div>
                    </div>

                    {/* Accepted alert */}
                    {bid.status === 'ACCEPTED' && (
                      <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 text-xs text-green-800 mb-3">
                        <CheckCircle size={14} className="mt-0.5 shrink-0"/>
                        <span>🎉 <strong>Chúc mừng!</strong> Khách hàng đã chọn báo giá của bạn. Hợp đồng đang được xử lý. Kiểm tra mục <strong>Hợp đồng</strong> để tiếp tục.</span>
                      </div>
                    )}

                    {/* Message preview */}
                    {bid.message && (
                      <p className={`text-xs text-gray-600 bg-gray-50 rounded-xl p-3 mb-3 ${!isExp ? 'line-clamp-2' : 'whitespace-pre-wrap'}`}>
                        {bid.message}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <button onClick={() => setExpanded(isExp ? null : bid.id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800">
                        {isExp ? <><ChevronUp size={14}/> Ẩn bớt</> : <><ChevronDown size={14}/> Chi tiết</>}
                      </button>
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/projects/${bid.projectId}`)}
                          className="flex items-center gap-1.5 text-xs font-medium border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50">
                          <FileText size={13}/> Xem dự án
                        </button>
                        {bid.status === 'PENDING' && (
                          <button onClick={() => handleWithdraw(bid.id)}
                            className="flex items-center gap-1.5 text-xs font-bold text-red-500 border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-50">
                            <XCircle size={13}/> Rút báo giá
                          </button>
                        )}
                        {bid.status === 'ACCEPTED' && (
                          <button onClick={() => navigate('/contracts')}
                            className="flex items-center gap-1.5 text-xs font-bold bg-primary text-white px-3 py-1.5 rounded-xl hover:bg-primary-light">
                            <ArrowRight size={13}/> Xem hợp đồng
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExp && (
                    <div className="border-t border-gray-100 p-5 bg-gray-50/50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        {bid.projectCategory && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Danh mục</p>
                            <p className="text-gray-700">{bid.projectCategory}</p>
                          </div>
                        )}
                        {bid.projectBudgetMin != null && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Ngân sách dự án</p>
                            <p className="text-gray-700">{fmt(bid.projectBudgetMin)} – {fmt(bid.projectBudgetMax)}</p>
                          </div>
                        )}
                        {bid.warrantyMonths > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Bảo hành</p>
                            <p className="text-gray-700">{bid.warrantyMonths} tháng</p>
                          </div>
                        )}
                        {bid.paymentTerms && (
                          <div className="sm:col-span-2">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Điều khoản thanh toán</p>
                            <p className="text-gray-700 text-xs">{bid.paymentTerms}</p>
                          </div>
                        )}
                        {bid.designImage && (
                          <div className="sm:col-span-2">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Ảnh thiết kế</p>
                            <img src={bid.designImage} alt="Thiết kế" className="rounded-xl max-h-48 object-cover border border-gray-100"/>
                          </div>
                        )}
                        {bid.reviewedAt && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Xét duyệt lúc</p>
                            <p className="text-gray-700 text-xs">{new Date(bid.reviewedAt).toLocaleString('vi-VN')}</p>
                          </div>
                        )}
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
  );
}
