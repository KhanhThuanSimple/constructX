import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import {
  MapPin, Clock, Construction, DollarSign, ArrowLeft,
  Tag, User as UserIcon, MessageSquare, CheckCircle,
  ChevronDown, ChevronUp, AlertCircle, FileText,
  Star, Calendar, Banknote, Eye, EyeOff
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';

const fmt = (n) =>
  n == null ? 'Thỏa thuận'
    : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n).replace('₫', 'đ');

const STATUS_MAP = {
  OPEN:        { label: 'Đang tuyển thầu', cls: 'badge-green' },
  IN_PROGRESS: { label: 'Đang thi công',   cls: 'badge-amber' },
  CLOSED:      { label: 'Đã chốt thầu',    cls: 'badge-blue'  },
  COMPLETED:   { label: 'Hoàn thành',      cls: 'badge-blue'  },
  CANCELLED:   { label: 'Đã hủy',          cls: 'badge-red'   },
  DRAFT:       { label: 'Nháp',            cls: 'badge-gray'  },
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [project, setProject] = useState(null);
  const [bids, setBids] = useState([]);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingBids, setLoadingBids] = useState(false);
  const [showBids, setShowBids] = useState(false);
  const [expandedBid, setExpandedBid] = useState(null);
  const [accepting, setAccepting] = useState(null);

  useEffect(() => { fetchProject(); }, [id]);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data.data);
    } catch {
      toast.error('Không tải được dự án');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async () => {
    if (loadingBids) return;
    setLoadingBids(true);
    try {
      const res = await api.get(`/projects/${id}/bids`);
      setBids(res.data.data || []);
      setShowBids(true);
    } catch {
      toast.error('Không tải được danh sách báo giá');
    } finally {
      setLoadingBids(false);
    }
  };

  const handleAcceptBid = async (bidId) => {
    if (!window.confirm('Chấp nhận báo giá này? Hệ thống sẽ tự động tạo hợp đồng và gửi Admin kiểm duyệt.')) return;
    setAccepting(bidId);
    try {
      const res = await api.post(`/projects/${id}/accept-bid/${bidId}`);
      setContract(res.data.data);
      toast.success('Đã chấp nhận! Hợp đồng đang chờ Admin phê duyệt.');
      fetchProject();
      setBids(prev => prev.map(b => ({
        ...b,
        status: b.id === bidId ? 'ACCEPTED' : 'REJECTED'
      })));
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi khi chấp nhận báo giá');
    } finally {
      setAccepting(null);
    }
  };

  if (loading) return (
    <Layout title="Chi tiết dự án">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </Layout>
  );

  const isOwner = user?.id === project?.user?.id || user?.email === project?.user?.email;
  const isContractor = user?.role === 'CONTRACTOR';
  const isAdmin = user?.role === 'ADMIN';
  const statusInfo = STATUS_MAP[project?.status] || { label: project?.status, cls: 'badge-gray' };

  return (
    <Layout title={project?.name || 'Chi tiết dự án'}>
      <div className="max-w-4xl mx-auto pb-20 space-y-6">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors">
          <ArrowLeft size={18} /> Quay lại
        </button>

        {/* ── Header card ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`badge ${statusInfo.cls}`}>{statusInfo.label}</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={13} /> {new Date(project.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <h1 className="text-2xl font-bold font-display text-gray-900 mb-2">{project.name}</h1>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <UserIcon size={15} />
                  <span>Chủ dự án: {project.user?.fullName || 'Khách hàng'}</span>
                </div>
              </div>

              {/* CTA cho nhà thầu */}
              {isContractor && project.status === 'OPEN' && (
                <button
                  onClick={() => navigate(`/projectsv2/${id}`)}
                  className="btn btn-primary py-2.5 px-6 flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                  <MessageSquare size={16} /> Gửi báo giá
                </button>
              )}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Ngân sách tối thiểu', value: fmt(project.budgetMin), icon: <DollarSign size={15} /> },
                { label: 'Ngân sách tối đa',    value: fmt(project.budgetMax), icon: <DollarSign size={15} /> },
                { label: 'Diện tích',            value: project.area ? `${project.area} m²` : '—', icon: <Construction size={15} /> },
                { label: 'Địa điểm',             value: project.address || 'Toàn quốc', icon: <MapPin size={15} /> },
              ].map(s => (
                <div key={s.label} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">{s.label}</p>
                  <div className="flex items-center gap-1.5 text-primary text-sm font-bold">
                    {s.icon} {s.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="p-8 space-y-6">
            {project.category && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5">
                  <Tag size={13} /> Hạng mục
                </p>
                <span className="inline-block px-4 py-1.5 bg-primary-bg text-primary rounded-xl font-semibold text-sm">
                  {project.category}
                </span>
              </div>
            )}

            {project.description && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5">
                  <Calendar size={13} /> Mô tả
                </p>
                <div className="bg-gray-50 p-5 rounded-2xl text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {project.description}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Contract notice ── */}
        {contract && (
          <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-2xl p-4">
            <CheckCircle size={18} className="text-green-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-green-800">Hợp đồng đã được tạo</p>
              <p className="text-sm text-green-700 mt-0.5">
                Số HĐ: <strong>{contract.contractNumber}</strong> — Đang chờ Admin phê duyệt.
                {' '}<button onClick={() => navigate('/contracts')} className="underline font-medium">Xem hợp đồng →</button>
              </p>
            </div>
          </div>
        )}

        {/* ── Blind bidding panel (chỉ owner + admin) ── */}
        {(isOwner || isAdmin) && (project.status === 'OPEN' || project.status === 'IN_PROGRESS' || project.status === 'CLOSED') && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <button
              onClick={showBids ? () => setShowBids(false) : fetchBids}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-bg text-primary flex items-center justify-center">
                  <Banknote size={18} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Báo giá nhận được</p>
                  <p className="text-xs text-gray-500">
                    {showBids ? `${bids.length} báo giá` : 'Chỉ bạn mới xem được — Nhà thầu không biết đối thủ'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                {loadingBids
                  ? <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  : showBids ? <ChevronUp size={18} /> : <ChevronDown size={18} />
                }
              </div>
            </button>

            {showBids && (
              <div className="border-t border-gray-100">
                {/* Blind bidding notice */}
                <div className="mx-5 mt-4 mb-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-800">
                  <EyeOff size={14} className="shrink-0" />
                  <span><strong>Đấu thầu bảo mật:</strong> Các nhà thầu không thể xem báo giá của nhau. Chỉ bạn và Admin mới thấy danh sách này.</span>
                </div>

                {bids.length === 0 ? (
                  <div className="px-6 py-10 text-center text-gray-400 text-sm">
                    Chưa có báo giá nào được gửi.
                  </div>
                ) : (
                  <div className="p-5 space-y-3">
                    {bids.map(bid => (
                      <div key={bid.id}
                        className={`rounded-2xl border transition-all ${
                          bid.status === 'ACCEPTED' ? 'border-green-300 bg-green-50'
                          : bid.status === 'REJECTED' ? 'border-gray-200 bg-gray-50 opacity-60'
                          : 'border-gray-200 bg-white hover:border-primary/40'
                        }`}
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary-bg text-primary flex items-center justify-center font-bold text-sm shrink-0">
                                {bid.contractorName?.charAt(0) || 'C'}
                              </div>
                              <div>
                                <p onClick={() => navigate(`/contractor/${bid.contractorId}`)}
                                   className="font-semibold text-gray-900 text-sm cursor-pointer hover:underline hover:text-primary">
                                  {bid.contractorName}
                                </p>
                                <p className="text-xs text-gray-500">{bid.contractorPhone || bid.contractorEmail}</p>
                              </div>
                              {bid.status === 'ACCEPTED' && (
                                <span className="badge badge-green text-[10px]">✓ Đã chọn</span>
                              )}
                              {bid.status === 'REJECTED' && (
                                <span className="badge badge-gray text-[10px]">Đã từ chối</span>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-bold text-primary text-lg">{fmt(bid.totalPrice)}</p>
                              <p className="text-xs text-gray-400">{bid.estimatedDays} ngày</p>
                            </div>
                          </div>

                          {bid.message && (
                            <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-xl p-3 line-clamp-2">
                              {bid.message}
                            </p>
                          )}

                          <div className="flex items-center justify-between mt-3">
                            <button
                              onClick={() => setExpandedBid(expandedBid === bid.id ? null : bid.id)}
                              className="text-xs text-primary font-medium flex items-center gap-1 hover:gap-1.5 transition-all"
                            >
                              {expandedBid === bid.id ? <><ChevronUp size={13}/> Ẩn chi tiết</> : <><Eye size={13}/> Xem chi tiết</>}
                            </button>

                            {bid.status === 'PENDING' && isOwner && project.status === 'OPEN' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleAcceptBid(bid.id)}
                                  disabled={accepting === bid.id}
                                  className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-primary-light transition-colors disabled:opacity-60"
                                >
                                  <CheckCircle size={13} />
                                  {accepting === bid.id ? 'Đang xử lý...' : 'Chấp nhận'}
                                </button>
                                <button
                                  onClick={() => navigate(`/contractor/${bid.contractorId}`)}
                                  className="flex items-center gap-1.5 border border-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                  Xem hồ sơ
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Expanded detail */}
                          {expandedBid === bid.id && bid.details?.length > 0 && (
                            <div className="mt-4 border-t border-gray-100 pt-4">
                              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Chi tiết báo giá</p>
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="bg-gray-50">
                                      <th className="text-left py-2 px-3 font-semibold text-gray-500">Hạng mục</th>
                                      <th className="text-center py-2 px-3 font-semibold text-gray-500">SL</th>
                                      <th className="text-right py-2 px-3 font-semibold text-gray-500">Đơn giá</th>
                                      <th className="text-right py-2 px-3 font-semibold text-gray-500">Thành tiền</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {bid.details.map((d, i) => (
                                      <tr key={i} className="border-b border-gray-50">
                                        <td className="py-2 px-3 text-gray-800 font-medium">{d.itemName}</td>
                                        <td className="py-2 px-3 text-center text-gray-500">{d.quantity} {d.unit}</td>
                                        <td className="py-2 px-3 text-right text-gray-600">{fmt(d.unitPrice)}</td>
                                        <td className="py-2 px-3 text-right font-bold text-primary">{fmt(d.totalPrice)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot>
                                    <tr className="bg-primary-bg">
                                      <td colSpan={3} className="py-2 px-3 text-right font-bold text-gray-700">Tổng cộng:</td>
                                      <td className="py-2 px-3 text-right font-bold text-primary text-sm">{fmt(bid.totalPrice)}</td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Info hợp đồng đã có ── */}
        {(isOwner || isAdmin) && project.status !== 'OPEN' && !contract && (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800">
            <FileText size={16} className="shrink-0" />
            <span>
              Dự án đã được chốt thầu.{' '}
              <button onClick={() => navigate('/contracts')} className="underline font-medium">Xem hợp đồng →</button>
            </span>
          </div>
        )}
      </div>
    </Layout>
  );
}
