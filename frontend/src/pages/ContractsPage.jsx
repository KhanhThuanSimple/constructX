import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import {
  FileText, CheckCircle, Clock, XCircle, AlertCircle,
  ChevronDown, ChevronUp, User as UserIcon, Calendar,
  ArrowRight, PenLine, Printer, Download, Building2,
  Phone, Mail, DollarSign, Shield, TrendingUp, Star
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';

const fmt = (n) =>
  n == null ? '—' :
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n).replace('₫', 'đ');

const STATUS_CONFIG = {
  PENDING_REVIEW:    { label: 'Chờ Admin duyệt',  icon: <Clock size={14}/>,        cls: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-400 animate-pulse' },
  WAITING_SIGNATURE: { label: 'Chờ ký kết',        icon: <PenLine size={14}/>,      cls: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-400' },
  ACTIVE:            { label: 'Đang thi công',      icon: <CheckCircle size={14}/>,  cls: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  COMPLETED:         { label: 'Hoàn thành',         icon: <CheckCircle size={14}/>,  cls: 'bg-primary-bg text-primary',   dot: 'bg-primary' },
  CANCELLED:         { label: 'Đã hủy',             icon: <XCircle size={14}/>,      cls: 'bg-red-100 text-red-600',      dot: 'bg-red-400' },
};

/* ── In hợp đồng ── */
function printContract(c) {
  const win = window.open('', '_blank');
  const today = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  win.document.write(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8"/>
  <title>Hợp đồng ${c.contractNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; color: #000; padding: 30px 50px; line-height: 1.6; }
    h1 { text-align: center; font-size: 20pt; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 1px; }
    .subtitle { text-align: center; font-size: 12pt; margin-bottom: 8px; color: #444; }
    .meta { text-align: center; margin-bottom: 30px; font-size: 11pt; color: #555; border-bottom: 2px solid #1a4f3a; padding-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th, td { border: 1px solid #999; padding: 8px 12px; text-align: left; font-size: 11pt; }
    th { background: #f0f0f0; font-weight: bold; width: 35%; }
    h2 { font-size: 13pt; margin: 24px 0 8px; text-transform: uppercase; color: #1a4f3a; border-left: 4px solid #1a4f3a; padding-left: 10px; }
    p { margin-bottom: 8px; line-height: 1.7; }
    .parties { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin: 16px 0; }
    .party { border: 1px solid #ccc; padding: 14px; border-radius: 4px; }
    .party h3 { font-size: 11pt; margin-bottom: 10px; color: #1a4f3a; border-bottom: 1px solid #eee; padding-bottom: 6px; font-weight: bold; }
    .party p { font-size: 10.5pt; margin-bottom: 4px; }
    .party .name { font-weight: bold; font-size: 12pt; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 60px; text-align: center; }
    .sig-box { border-top: 2px solid #000; padding-top: 12px; font-size: 11pt; min-height: 90px; }
    .sig-box .role { font-style: italic; color: #555; font-size: 10pt; margin-bottom: 4px; }
    .sig-box .name { font-weight: bold; margin-top: 40px; display: block; }
    .seal { text-align: center; margin: 30px 0 10px; font-style: italic; color: #555; font-size: 11pt; }
    .terms-pre { white-space: pre-wrap; font-family: inherit; font-size: 11pt; line-height: 1.8; background: #fafafa; border: 1px solid #eee; padding: 16px; border-radius: 4px; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 10pt; font-weight: bold; background: #e8f5ee; color: #1a4f3a; }
    .highlight { color: #1a4f3a; font-weight: bold; font-size: 14pt; }
    .info-row { display: flex; gap: 30px; flex-wrap: wrap; margin: 8px 0; }
    .info-item { flex: 1; min-width: 180px; }
    .info-label { font-size: 9pt; color: #777; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-value { font-size: 12pt; font-weight: bold; color: #333; }
    @media print {
      body { padding: 15px 30px; }
    }
  </style>
</head>
<body>
  <h1>Hợp đồng thi công / cung ứng nội thất</h1>
  <div class="subtitle">Nền tảng ConstructX — Sàn thi công & mua bán nội thất uy tín</div>
  <div class="meta">
    Số hợp đồng: <strong>${c.contractNumber}</strong>
    &nbsp;|&nbsp; Ngày tạo: ${c.createdAt ? new Date(c.createdAt).toLocaleDateString('vi-VN') : today}
    &nbsp;|&nbsp; Trạng thái: <span class="badge">${STATUS_CONFIG[c.status]?.label || c.status}</span>
    ${c.orderCode ? `&nbsp;|&nbsp; Đơn hàng: <strong>${c.orderCode}</strong>` : ''}
  </div>

  <h2>I. Thông tin hợp đồng</h2>
  <div class="info-row">
    <div class="info-item">
      <div class="info-label">Tên dự án / Sản phẩm</div>
      <div class="info-value">${c.projectName || c.orderCode || '—'}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Giá trị hợp đồng</div>
      <div class="info-value highlight">${fmt(c.agreedPrice)}</div>
    </div>
    <div class="info-item">
      <div class="info-label">Thời gian thực hiện</div>
      <div class="info-value">${c.estimatedDays ? c.estimatedDays + ' ngày' : 'Theo thỏa thuận'}</div>
    </div>
    ${c.approvedAt ? `<div class="info-item"><div class="info-label">Ngày Admin duyệt</div><div class="info-value">${new Date(c.approvedAt).toLocaleDateString('vi-VN')}</div></div>` : ''}
  </div>

  <h2>II. Các bên tham gia hợp đồng</h2>
  <div class="parties">
    <div class="party">
      <h3>🏠 Bên A — Khách hàng</h3>
      <p class="name">${c.clientName || '—'}</p>
      ${c.clientPhone ? `<p>📞 ${c.clientPhone}</p>` : ''}
      ${c.clientEmail ? `<p>✉ ${c.clientEmail}</p>` : ''}
      ${c.clientSignedAt ? `<p style="color:#1a4f3a;font-size:10pt;">✅ Đã ký: ${new Date(c.clientSignedAt).toLocaleDateString('vi-VN')}</p>` : '<p style="color:#e67e22;font-size:10pt;">⏳ Chưa ký</p>'}
    </div>
    <div class="party">
      <h3>🔨 Bên B — Nhà thầu thi công</h3>
      <p class="name">${c.contractorName || '—'}</p>
      ${c.contractorPhone ? `<p>📞 ${c.contractorPhone}</p>` : ''}
      ${c.contractorEmail ? `<p>✉ ${c.contractorEmail}</p>` : ''}
      ${c.contractorAddress ? `<p>📍 ${c.contractorAddress}</p>` : ''}
      ${c.contractorSignedAt ? `<p style="color:#1a4f3a;font-size:10pt;">✅ Đã ký: ${new Date(c.contractorSignedAt).toLocaleDateString('vi-VN')}</p>` : '<p style="color:#e67e22;font-size:10pt;">⏳ Chưa ký</p>'}
    </div>
    <div class="party">
      <h3>🏛 Bên C — Nền tảng ConstructX</h3>
      <p class="name">${c.adminName || 'ConstructX Platform'}</p>
      ${c.adminEmail ? `<p>✉ ${c.adminEmail}</p>` : ''}
      <p>Người chứng thực & Giám sát giao dịch</p>
      <p style="font-size:10pt;color:#555;">Đại diện bảo vệ quyền lợi các bên theo quy định của nền tảng</p>
      ${c.adminNote ? `<p style="font-size:10pt;color:#1a4f3a;margin-top:6px;">Ghi chú: ${c.adminNote}</p>` : ''}
    </div>
  </div>

  <h2>III. Điều khoản hợp đồng</h2>
  <pre class="terms-pre">${c.terms || 'Theo thỏa thuận của các bên.'}</pre>

  <h2>IV. Thông tin ký quỹ & đặt cọc</h2>
  <table>
    <tr><th>Tiền cọc Bên A (Khách hàng)</th><td>${fmt(c.customerDepositAmount)} ${c.customerDepositLocked ? '— <span style="color:green">Đã lock</span>' : '— Chưa lock'}</td></tr>
    <tr><th>Ký quỹ Bên B (Nhà thầu)</th><td>${fmt(c.contractorDepositAmount)} ${c.contractorDepositLocked ? '— <span style="color:green">Đã lock</span>' : '— Chưa lock'}</td></tr>
  </table>

  ${c.stages?.length > 0 ? `
  <h2>V. Lịch sử trạng thái</h2>
  <table>
    <thead><tr><th>Trạng thái</th><th>Người thực hiện</th><th>Ghi chú</th><th>Thời gian</th></tr></thead>
    <tbody>
      ${c.stages.map(s => `
        <tr>
          <td>${STATUS_CONFIG[s.stage]?.label || s.stage}</td>
          <td>${s.performedBy || '—'}</td>
          <td>${s.note || '—'}</td>
          <td style="white-space:nowrap">${s.createdAt ? new Date(s.createdAt).toLocaleString('vi-VN') : '—'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>` : ''}

  <div class="seal">
    — Hợp đồng này có hiệu lực kể từ ngày cả hai bên hoàn tất ký kết —<br/>
    — Được xác thực và giám sát bởi Nền tảng ConstructX theo quy định của pháp luật Việt Nam —
  </div>

  <div class="signatures">
    <div class="sig-box">
      <div class="role">Bên A — Khách hàng</div>
      <div style="font-size:10pt;color:#555;margin-top:4px;">(Ký, ghi rõ họ tên)</div>
      <span class="name">${c.clientName || ''}</span>
    </div>
    <div class="sig-box">
      <div class="role">Bên B — Nhà thầu thi công</div>
      <div style="font-size:10pt;color:#555;margin-top:4px;">(Ký, ghi rõ họ tên)</div>
      <span class="name">${c.contractorName || ''}</span>
    </div>
    <div class="sig-box">
      <div class="role">Bên C — Đại diện ConstructX</div>
      <div style="font-size:10pt;color:#555;margin-top:4px;">(Người chứng thực)</div>
      <span class="name">${c.adminName || 'Admin ConstructX'}</span>
    </div>
  </div>

  <p style="margin-top:40px;text-align:center;font-size:9pt;color:#aaa;border-top:1px solid #eee;padding-top:12px;">
    Tài liệu được tạo tự động bởi ConstructX Platform — ${today}<br/>
    Số hợp đồng: ${c.contractNumber}
  </p>
  <script>window.onload = () => window.print();</script>
</body>
</html>`);
  win.document.close();
}

export default function ContractsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [signing, setSigning] = useState(null);

  // Review states
  const [reviewedItems, setReviewedItems] = useState(new Set());
  const [reviewModal, setReviewModal] = useState(null); // { contract }
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => { fetchContracts(); }, []);

  const fetchContracts = async () => {
    try {
      const res = await api.get('/contracts/my');
      const data = res.data.data || [];
      setContracts(data);

      // Check which completed contracts are already reviewed
      const completedContracts = data.filter(c => c.status === 'COMPLETED');
      if (completedContracts.length > 0) {
        Promise.all(completedContracts.map(c => {
          const refType = c.projectId ? 'PROJECT' : 'ORDER';
          const refId = c.projectId || c.orderId;
          if (!refId) return Promise.resolve(null);
          return api.get(`/reviews/check?referenceType=${refType}&referenceId=${refId}`)
            .then(r => r.data.data ? `${refType}_${refId}` : null)
            .catch(() => null);
        })).then(results => {
          setReviewedItems(new Set(results.filter(Boolean)));
        });
      }
    } catch {
      toast.error('Không thể tải danh sách hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async (contractId) => {
    if (!window.confirm('Xác nhận ký hợp đồng này? Dự án sẽ chính thức bắt đầu thi công.')) return;
    setSigning(contractId);
    try {
      await api.post(`/contracts/${contractId}/sign`);
      toast.success('✅ Ký hợp đồng thành công! Dự án chính thức bắt đầu thi công.');
      fetchContracts();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi khi ký hợp đồng');
    } finally {
      setSigning(null);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewModal) return;
    if (!reviewData.comment.trim()) { toast.error('Vui lòng nhập nhận xét'); return; }
    setSubmittingReview(true);
    try {
      const refType = reviewModal.projectId ? 'PROJECT' : 'ORDER';
      const refId = reviewModal.projectId || reviewModal.orderId;
      await api.post('/reviews', {
        rating: reviewData.rating,
        comment: reviewData.comment,
        referenceType: refType,
        referenceId: refId,
        revieweeId: reviewModal.contractorId,
      });
      toast.success('🌟 Cảm ơn bạn đã đánh giá!');
      setReviewedItems(prev => new Set([...prev, `${refType}_${refId}`]));
      setReviewModal(null);
      setReviewData({ rating: 5, comment: '' });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi gửi đánh giá');
    } finally { setSubmittingReview(false); }
  };

  const counts = Object.fromEntries(
    Object.keys(STATUS_CONFIG).map(k => [k, contracts.filter(c => c.status === k).length])
  );

  return (
    <>
    <Layout title="Hợp đồng của tôi">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <div key={k} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm text-center">
              <p className="text-[10px] text-gray-500 mb-1 truncate">{v.label}</p>
              <p className="text-2xl font-bold text-gray-900">{counts[k] || 0}</p>
            </div>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Đang tải hợp đồng...</div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <FileText size={44} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 font-medium">Chưa có hợp đồng nào</p>
            <p className="text-gray-300 text-sm mt-1">
              {user?.role === 'CUSTOMER'
                ? 'Tạo dự án hoặc đặt đơn hàng và chọn nhà thầu để tạo hợp đồng tự động.'
                : 'Gửi báo giá cho dự án hoặc đơn hàng và được khách hàng chọn để có hợp đồng.'}
            </p>
            {user?.role === 'CUSTOMER' && (
              <div className="flex gap-3 justify-center mt-4">
                <button onClick={() => navigate('/projects/new')}
                  className="btn btn-primary text-sm px-5 py-2">
                  Tạo dự án
                </button>
                <button onClick={() => navigate('/shop/order')}
                  className="btn btn-outline text-sm px-5 py-2">
                  Đặt đơn hàng
                </button>
              </div>
            )}
            {user?.role === 'CONTRACTOR' && (
              <div className="flex gap-3 justify-center mt-4">
                <button onClick={() => navigate('/projects/browse')}
                  className="btn btn-primary text-sm px-5 py-2">
                  Tìm dự án
                </button>
                <button onClick={() => navigate('/order-bidding')}
                  className="btn btn-outline text-sm px-5 py-2">
                  Đấu thầu đơn hàng
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {contracts.map(c => {
              const st = STATUS_CONFIG[c.status] || STATUS_CONFIG.PENDING_REVIEW;
              const isExpanded = expanded === c.id;

              return (
                <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${st.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                            {st.icon} {st.label}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-base">
                          {c.projectName || c.orderCode || c.contractNumber}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">📄 {c.contractNumber}</p>
                        {c.orderCode && !c.projectName && (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 text-[10px] font-bold mt-1">
                            📦 Từ đơn hàng {c.orderCode}
                          </span>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Giá trị HĐ</p>
                        <p className="text-2xl font-bold text-primary">{fmt(c.agreedPrice)}</p>
                        {c.estimatedDays && (
                          <p className="text-xs text-gray-400">{c.estimatedDays} ngày thi công</p>
                        )}
                      </div>
                    </div>

                    {/* Parties — 3 bên */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
                      {[
                        { icon: <UserIcon size={13}/>, label: 'Bên A — Khách hàng', name: c.clientName },
                        { icon: <Building2 size={13}/>, label: 'Bên B — Nhà thầu', name: c.contractorName, sub: c.contractorPhone, link: `/contractor/${c.contractorId}` },
                        { icon: <Shield size={13}/>, label: 'Bên C — ConstructX', name: 'Người chứng thực' },
                      ].map((party, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-3">
                          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1.5 flex items-center gap-1">
                            {party.icon} {party.label}
                          </p>
                          {party.link ? (
                            <p onClick={() => navigate(party.link)} className="text-sm font-semibold text-primary cursor-pointer hover:underline">
                              {party.name}
                            </p>
                          ) : (
                            <p className="text-sm font-semibold text-gray-800">{party.name}</p>
                          )}
                          {party.sub && <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><Phone size={10}/> {party.sub}</p>}
                        </div>
                      ))}
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-4">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} /> Tạo: {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                      {c.approvedAt && (
                        <span className="flex items-center gap-1.5">
                          <CheckCircle size={12} className="text-green-500" />
                          Admin duyệt: {new Date(c.approvedAt).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>

                    {/* Admin note */}
                    {c.adminNote && (
                      <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-xs text-blue-800">
                        <AlertCircle size={13} className="mt-0.5 shrink-0" />
                        <span><strong>Ghi chú Admin:</strong> {c.adminNote}</span>
                      </div>
                    )}

                    {/* PENDING: hướng dẫn */}
                    {c.status === 'PENDING_REVIEW' && (
                      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-800">
                        <Clock size={13} className="mt-0.5 shrink-0" />
                        <span>Hợp đồng đang chờ Admin kiểm duyệt điều khoản. Bạn sẽ nhận thông báo khi Admin phê duyệt.</span>
                      </div>
                    )}

                    {/* WAITING_SIGNATURE: hướng dẫn */}
                    {c.status === 'WAITING_SIGNATURE' && (
                      <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-xs text-blue-800">
                        <PenLine size={13} className="mt-0.5 shrink-0" />
                        <span>Hợp đồng đã được duyệt! Vui lòng <strong>đọc kỹ điều khoản</strong> (nhấn "Xem chi tiết") rồi ký xác nhận.</span>
                      </div>
                    )}

                    {/* COMPLETED: warranty hold info */}
                    {c.status === 'COMPLETED' && c.warrantyHoldAmount > 0 && (
                      <div className={`flex items-start gap-2 rounded-xl p-3 mb-4 text-xs border ${
                        c.warrantyReleased
                          ? 'bg-green-50 border-green-200 text-green-800'
                          : 'bg-amber-50 border-amber-200 text-amber-800'
                      }`}>
                        <span className="text-base shrink-0">{c.warrantyReleased ? '✅' : '🔒'}</span>
                        <div>
                          {c.warrantyReleased ? (
                            <span><strong>Bảo hành đã kết thúc.</strong> Toàn bộ {fmt(c.warrantyHoldAmount)} đã được giải ngân cho nhà thầu.</span>
                          ) : (
                            <>
                              <strong>Đang trong thời hạn bảo hành.</strong>
                              <span className="ml-1">{fmt(c.warrantyHoldAmount)} (5%) được giữ đến <strong>{c.warrantyEndDate ? new Date(c.warrantyEndDate).toLocaleDateString('vi-VN') : '—'}</strong></span>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <button
                        onClick={() => setExpanded(isExpanded ? null : c.id)}
                        className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
                      >
                        {isExpanded ? <><ChevronUp size={15}/> Ẩn chi tiết</> : <><ChevronDown size={15}/> Xem điều khoản & lịch sử</>}
                      </button>

                      <div className="flex gap-2 flex-wrap">
                        {/* Xuất hợp đồng */}
                        <button
                          onClick={() => printContract(c)}
                          className="flex items-center gap-1.5 text-xs font-medium border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors text-gray-600"
                        >
                          <Printer size={14}/> Xuất / In
                        </button>

                        {/* Xem dự án (chỉ hiện khi hợp đồng từ Project) */}
                        {c.projectId && (
                          <button onClick={() => navigate(`/projects/${c.projectId}`)}
                            className="flex items-center gap-1.5 text-xs font-medium border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                            <ArrowRight size={13}/> Xem dự án
                          </button>
                        )}
                        {/* Xem đơn hàng (chỉ hiện khi hợp đồng từ Order) */}
                        {c.orderId && !c.projectId && (
                          <button onClick={() => navigate(`/orders`)}
                            className="flex items-center gap-1.5 text-xs font-medium border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                            <ArrowRight size={13}/> Xem đơn hàng
                          </button>
                        )}

                        {/* Ký hợp đồng */}
                        {c.status === 'WAITING_SIGNATURE' && (
                          <button
                            onClick={() => handleSign(c.id)}
                            disabled={signing === c.id}
                            className="flex items-center gap-1.5 text-xs font-bold bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary-light transition-colors disabled:opacity-60"
                          >
                            <PenLine size={13}/> {signing === c.id ? 'Đang ký...' : 'Ký hợp đồng'}
                          </button>
                        )}

                        {/* Xem tiến độ thi công (ACTIVE) */}
                        {c.status === 'ACTIVE' && (
                          <button onClick={() => navigate(`/contracts/${c.id}/progress`)}
                            className="flex items-center gap-1.5 text-xs font-bold bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors">
                            <TrendingUp size={13}/> Tiến độ & Giải ngân
                          </button>
                        )}

                        {/* Đánh giá nhà thầu (COMPLETED) */}
                        {c.status === 'COMPLETED' && user?.role === 'CUSTOMER' && (
                          (() => {
                            const refType = c.projectId ? 'PROJECT' : 'ORDER';
                            const refId = c.projectId || c.orderId;
                            const key = `${refType}_${refId}`;
                            const isReviewed = reviewedItems.has(key);
                            return isReviewed ? (
                              <span className="flex items-center gap-1.5 text-xs text-amber-500 font-bold px-3 py-2 bg-amber-50 rounded-xl border border-amber-200">
                                <Star size={13} fill="currentColor"/> Đã đánh giá
                              </span>
                            ) : (
                              <button
                                onClick={() => { setReviewModal(c); setReviewData({ rating: 5, comment: '' }); }}
                                className="flex items-center gap-1.5 text-xs font-bold bg-amber-500 text-white px-4 py-2 rounded-xl hover:bg-amber-600 transition-colors"
                              >
                                <Star size={13}/> Đánh giá nhà thầu
                              </button>
                            );
                          })()
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded: Terms + Stages */}
                  {isExpanded && (
                    <div className="border-t border-gray-100">
                      {/* Terms */}
                      <div className="p-5 border-b border-gray-100">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
                          <FileText size={13}/> Điều khoản hợp đồng
                        </p>
                        <pre className="text-xs text-gray-700 bg-gray-50 rounded-xl p-4 whitespace-pre-wrap font-sans leading-relaxed max-h-80 overflow-y-auto">
                          {c.terms || 'Theo thỏa thuận của các bên.'}
                        </pre>
                      </div>

                      {/* Stage timeline */}
                      {c.stages?.length > 0 && (
                        <div className="p-5">
                          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-1.5">
                            <Clock size={13}/> Lịch sử trạng thái
                          </p>
                          <div className="space-y-3">
                            {c.stages.map((s, i) => {
                              const stCfg = STATUS_CONFIG[s.stage] || {};
                              return (
                                <div key={s.id || i} className="flex gap-3">
                                  <div className="flex flex-col items-center">
                                    <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${stCfg.dot || 'bg-gray-300'}`} />
                                    {i < c.stages.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                                  </div>
                                  <div className="pb-3 flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${stCfg.cls || 'bg-gray-100 text-gray-600'}`}>
                                        {stCfg.label || s.stage}
                                      </span>
                                      <span className="text-[10px] text-gray-400">
                                        {new Date(s.createdAt).toLocaleString('vi-VN')}
                                      </span>
                                    </div>
                                    {s.note && <p className="text-xs text-gray-600">{s.note}</p>}
                                    {s.performedBy && (
                                      <p className="text-[10px] text-gray-400 mt-0.5">Thực hiện bởi: {s.performedBy}</p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform scale-100 transition-all duration-300">
          <h3 className="font-bold text-gray-900 text-lg mb-1 flex items-center gap-2">
            <Star size={18} className="text-amber-500"/> Đánh giá nhà thầu
          </h3>
          <p className="text-sm text-gray-500 mb-5">
            Dự án: <span className="font-bold text-gray-700">{reviewModal.projectName || reviewModal.orderCode || reviewModal.contractNumber}</span>
          </p>

          {/* Star rating */}
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Điểm đánh giá</p>
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
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Nhận xét</p>
            <textarea rows={4} value={reviewData.comment}
              onChange={e => setReviewData(d => ({...d, comment: e.target.value}))}
              placeholder="Nhà thầu thi công như thế nào? Chất lượng, thái độ, tiến độ..."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-primary resize-none transition-all focus:ring-2 focus:ring-primary/20"/>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setReviewModal(null)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
              Hủy
            </button>
            <button onClick={handleSubmitReview} disabled={submittingReview}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors">
              {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
