import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  FileText, CheckCircle, Clock, XCircle, AlertCircle,
  ChevronDown, ChevronUp, User as UserIcon, Calendar,
  ArrowRight, PenLine, Printer, Building2, Phone, Wallet,
  Camera, ClipboardCheck, Shield, Lock, Unlock, MessageSquare, TrendingUp,
  Loader2
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';

const fmt = (n) =>
  n == null ? '—' :
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n).replace('₫', 'đ');

const STATUS_CONFIG = {
  PENDING_REVIEW:    { label: 'Chờ Admin duyệt',  icon: <Clock size={13}/>,        cls: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-400 animate-pulse' },
  WAITING_SIGNATURE: { label: 'Chờ ký kết',        icon: <PenLine size={13}/>,      cls: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-400' },
  ACTIVE:            { label: 'Đang thi công',      icon: <CheckCircle size={13}/>,  cls: 'bg-green-100 text-green-700',  dot: 'bg-green-500' },
  COMPLETED:         { label: 'Hoàn thành',         icon: <CheckCircle size={13}/>,  cls: 'bg-primary-bg text-primary',   dot: 'bg-primary' },
  CANCELLED:         { label: 'Đã hủy',             icon: <XCircle size={13}/>,      cls: 'bg-red-100 text-red-600',      dot: 'bg-red-400' },
};

/* ── In hợp đồng văn bản pháp lý ── */
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
  const [searchParams] = useSearchParams();
  
  // view: 'progress' (Nhật ký), 'disbursements' (Giải ngân), 'reviews' (Nghiệm thu), 'disputes' (Tranh chấp), 'all' (Tất cả)
  const currentView = searchParams.get('view') || 'all';

  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [signing, setSigning] = useState(null);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/contracts/my');
      setContracts(res.data.data || []);
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
      toast.success('✅ Ký hợp đồng thành công! Hợp đồng chính thức bắt đầu thi công.');
      fetchContracts();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi khi ký hợp đồng');
    } finally {
      setSigning(null);
    }
  };

  // 1. Phân loại hợp đồng theo chức năng tùy thuộc vào tham số `view` từ URL
  const getFilteredContracts = () => {
    if (currentView === 'progress') {
      // Chỉ hiện hợp đồng đang thi công hoặc đã hoàn thành và KHÔNG bị tranh chấp
      return contracts.filter(c => (c.status === 'ACTIVE' || c.status === 'COMPLETED') && !c.isDisputed);
    }
    if (currentView === 'disbursements') {
      // Chỉ hiện hợp đồng đang hoạt động hoặc hoàn thành và KHÔNG bị tranh chấp
      return contracts.filter(c => (c.status === 'ACTIVE' || c.status === 'COMPLETED') && !c.isDisputed);
    }
    if (currentView === 'reviews') {
      // Hiện các hợp đồng đã hoàn thành hoặc hợp đồng đang thi công và KHÔNG bị tranh chấp
      return contracts.filter(c => (c.status === 'COMPLETED' || c.status === 'ACTIVE') && !c.isDisputed);
    }
    if (currentView === 'disputes') {
      // Chỉ hiện các hợp đồng đang bị khiếu nại / tranh chấp
      return contracts.filter(c => c.isDisputed === true);
    }
    return contracts; // Mặc định hiển thị tất cả
  };

  const filteredContracts = getFilteredContracts();

  // Tính số lượng cho thống kê tổng quan (chỉ hiện ở view = all)
  const counts = Object.fromEntries(
    Object.keys(STATUS_CONFIG).map(k => [k, contracts.filter(c => c.status === k).length])
  );

  // 2. Thiết lập tiêu đề và mô tả động cho từng Phân hệ chức năng
  const VIEW_META_MAP = {
    progress: {
      title: 'Nhật ký & Tiến độ thi công',
      desc: 'Giám sát tiến độ phần trăm công việc và hình ảnh báo cáo nhật ký thi công thực tế từ công trình.',
      icon: <Camera className="text-primary" size={24} />,
      empty: 'Hiện chưa có hợp đồng nào trong giai đoạn thi công tiến độ.',
    },
    disbursements: {
      title: 'Quản lý Giải ngân & Ví Escrow',
      desc: 'Yêu cầu thanh toán các cột mốc hoàn thành và kiểm soát phê duyệt giải ngân dòng tiền ký quỹ an toàn.',
      icon: <Wallet className="text-primary" size={24} />,
      empty: 'Hiện chưa có hợp đồng nào phát sinh giao dịch giải ngân.',
    },
    reviews: {
      title: 'Nghiệm thu & Đánh giá chất lượng',
      desc: 'Xác nhận hoàn công công trình đạt 100%, theo dõi thời hạn bảo hành và đánh giá nhà thầu đa tiêu chí.',
      icon: <ClipboardCheck className="text-primary" size={24} />,
      empty: 'Hiện chưa có hợp đồng nào hoàn thành chờ nghiệm thu.',
    },
    disputes: {
      title: 'Giải quyết Tranh chấp & Khiếu nại',
      desc: 'Danh sách các hợp đồng đang phát sinh tranh chấp hoặc khiếu nại tài chính đang được Admin phân xử.',
      icon: <Shield className="text-red-600 animate-pulse" size={24} />,
      empty: 'Tuyệt vời! Không có hợp đồng nào đang xảy ra tranh chấp.',
    },
    all: {
      title: 'Hợp đồng của tôi',
      desc: 'Quản lý và giám sát toàn diện các hợp đồng thi công của bạn trên hệ thống ConstructX.',
      icon: <FileText className="text-primary" size={24} />,
      empty: 'Bạn chưa có hợp đồng nào được thiết lập trên hệ thống.',
    }
  };

  const viewMeta = VIEW_META_MAP[currentView] || VIEW_META_MAP.all;

  return (
    <Layout title={viewMeta.title}>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Banner giới thiệu phân hệ động */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-primary-bg rounded-xl shrink-0">
            {viewMeta.icon}
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">{viewMeta.title}</h2>
            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{viewMeta.desc}</p>
          </div>
        </div>

        {/* Chỉ hiển thị Thẻ thống kê số lượng khi ở tab Tổng quan (view === 'all') */}
        {currentView === 'all' && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <div key={k} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm text-center">
                <p className="text-[10px] text-gray-400 mb-1 truncate font-semibold uppercase tracking-wider">{v.label}</p>
                <p className="text-2xl font-black text-gray-900">{counts[k] || 0}</p>
              </div>
            ))}
          </div>
        )}

        {/* Danh sách Hợp đồng */}
        {loading ? (
          <div className="text-center py-16 text-gray-400 flex items-center justify-center gap-2">
            <Loader2 className="animate-spin text-primary" size={18} />
            Đang tải dữ liệu hợp đồng...
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <FileText size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 font-semibold text-sm">{viewMeta.empty}</p>
            {currentView === 'all' && (
              <p className="text-xs text-gray-350 mt-1">
                {user?.role === 'CUSTOMER'
                  ? 'Tạo dự án hoặc đặt đơn hàng và chọn nhà thầu để tạo hợp đồng tự động.'
                  : 'Gửi báo giá cho dự án hoặc đơn hàng và được khách hàng chọn để có hợp đồng.'}
              </p>
            )}
            
            {currentView === 'all' && user?.role === 'CUSTOMER' && (
              <div className="flex gap-3 justify-center mt-5">
                <button onClick={() => navigate('/projects/new')} className="px-5 py-2.5 bg-primary hover:bg-primary-light text-white text-xs font-bold rounded-xl shadow transition-colors">
                  Tạo dự án mới
                </button>
                <button onClick={() => navigate('/shop/order')} className="px-5 py-2.5 border border-gray-200 text-gray-650 text-xs font-bold rounded-xl hover:bg-gray-50 bg-white transition-colors">
                  Đặt đơn hàng mới
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredContracts.map(c => {
              const st = STATUS_CONFIG[c.status] || STATUS_CONFIG.PENDING_REVIEW;
              const isExpanded = expanded === c.id;

              return (
                <div 
                  key={c.id} 
                  className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                    c.isDisputed ? 'border-red-200 ring-2 ring-red-50/50' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="p-5">
                    {/* Header Thẻ */}
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${st.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                            {st.icon} {st.label}
                          </span>
                          {c.isDisputed && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-bold border border-red-200">
                              <AlertCircle size={10}/> Tranh chấp
                            </span>
                          )}
                        </div>
                        
                        <h3 className="font-bold text-gray-900 text-base">
                          {c.projectName || c.orderCode || c.contractNumber}
                        </h3>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-mono">Số hợp đồng: {c.contractNumber}</p>
                        {c.orderCode && !c.projectName && (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 text-[9px] font-bold mt-1.5">
                            📦 Từ đơn hàng {c.orderCode}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-right shrink-0">
                        <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Giá trị HĐ</p>
                        <p className="text-xl font-black text-primary">{fmt(c.agreedPrice)}</p>
                        {c.estimatedDays && (
                          <p className="text-[10px] text-gray-400 font-medium">{c.estimatedDays} ngày thi công</p>
                        )}
                      </div>
                    </div>

                    {/* Đối tác 3 bên */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
                      {[
                        { icon: <UserIcon size={12} className="text-gray-450"/>, label: 'Bên A — Khách hàng', name: c.clientName },
                        { icon: <Building2 size={12} className="text-gray-450"/>, label: 'Bên B — Nhà thầu', name: c.contractorName, sub: c.contractorPhone, link: `/contractor/${c.contractorId}` },
                        { icon: <Shield size={12} className="text-gray-450"/>, label: 'Bên C — ConstructX', name: 'Đại diện giám sát' },
                      ].map((party, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100/50">
                          <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold mb-1 flex items-center gap-1">
                            {party.icon} {party.label}
                          </p>
                          {party.link ? (
                            <p onClick={() => navigate(party.link)} className="text-xs font-bold text-primary cursor-pointer hover:underline">
                              {party.name}
                            </p>
                          ) : (
                            <p className="text-xs font-bold text-gray-800">{party.name}</p>
                          )}
                          {party.sub && <p className="text-[10px] text-gray-450 mt-0.5 flex items-center gap-1"><Phone size={9}/> {party.sub}</p>}
                        </div>
                      ))}
                    </div>

                    {/* ── HIỂN THỊ CHI TIẾT TÙY BIẾN THEO CHỨC NĂNG (DYNAMIC VIEW DETAILS) ── */}
                    
                    {/* View 1: Nhật ký thi công (Hiển thị thanh tiến độ ngang ngay trên thẻ) */}
                    {currentView === 'progress' && (
                      <div className="mb-4 bg-gray-50 rounded-xl p-3 border border-gray-150/50">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-gray-500 font-semibold">Tiến độ thi công hiện tại</span>
                          <span className="font-extrabold text-primary">Đang ở mốc: {c.status === 'COMPLETED' ? '100' : '—'}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: c.status === 'COMPLETED' ? '100%' : '30%' }}/>
                        </div>
                      </div>
                    )}

                    {/* View 2: Giải ngân (Hiển thị các chỉ số tài chính thô) */}
                    {currentView === 'disbursements' && (
                      <div className="mb-4 grid grid-cols-2 gap-2 bg-amber-50/20 border border-amber-100 rounded-xl p-3 text-xs">
                        <div>
                          <p className="text-gray-400 font-medium">Tiền cọc khách hàng (Locked):</p>
                          <p className="font-bold text-gray-700">{fmt(c.customerDepositAmount)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-medium">Ký quỹ nhà thầu (Locked):</p>
                          <p className="font-bold text-gray-700">{fmt(c.contractorDepositAmount)}</p>
                        </div>
                      </div>
                    )}

                    {/* View 3: Nghiệm thu & Bảo hành (Hiển thị thông tin bảo hành) */}
                    {currentView === 'reviews' && c.status === 'COMPLETED' && (
                      <div className="mb-4 text-xs bg-green-50/50 border border-green-100 rounded-xl p-3 flex items-center gap-2 text-green-800">
                        <span>🛡️</span>
                        <div>
                          <p className="font-bold">Đang trong thời hạn bảo hành 6 tháng</p>
                          <p className="text-[10px] text-green-600 mt-0.5">Khoản cọc bảo hành 5% trị giá {fmt(c.warrantyHoldAmount)} được giữ an toàn.</p>
                        </div>
                      </div>
                    )}

                    {/* View 4: Tranh chấp (Hiển thị chi tiết cảnh báo đỏ) */}
                    {currentView === 'disputes' && (
                      <div className="mb-4 text-xs bg-red-50 border border-red-200 rounded-xl p-3 text-red-800 space-y-1">
                        <p className="font-bold flex items-center gap-1"><AlertCircle size={12}/> Hợp đồng đang đóng băng tranh chấp tài chính</p>
                        {c.cancelReason && <p className="text-[10px] text-red-600">Lý do khiếu nại: "{c.cancelReason}"</p>}
                      </div>
                    )}

                    {/* HÀNH ĐỘNG DƯỚI CHÂN THẺ */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-50 pt-4">
                      
                      {/* Nút Xem chi tiết nội dung điều khoản (Chỉ hiện ở view = all) */}
                      {currentView === 'all' ? (
                        <button
                          onClick={() => setExpanded(isExpanded ? null : c.id)}
                          className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors"
                        >
                          {isExpanded ? <><ChevronUp size={13}/> Ẩn điều khoản</> : <><ChevronDown size={13}/> Xem điều khoản & timeline</>}
                        </button>
                      ) : (
                        <div /> // Giữ khoảng cách justify-between
                      )}

                      <div className="flex gap-1.5 flex-wrap">
                        {/* 1. Nút Xuất/In PDF pháp lý (Hiện ở mọi view) */}
                        <button
                          onClick={() => printContract(c)}
                          className="flex items-center gap-1 px-3 py-1.5 border border-gray-255/60 bg-white hover:bg-gray-50 text-gray-600 text-[10px] font-bold rounded-xl transition-all"
                        >
                          <Printer size={12}/> Xuất / In
                        </button>

                        {/* 2. Nút Ký Hợp đồng (Chỉ hiện khi WAITING_SIGNATURE và ở các view phù hợp) */}
                        {c.status === 'WAITING_SIGNATURE' && (
                          <button
                            onClick={() => handleSign(c.id)}
                            disabled={signing === c.id}
                            className="flex items-center gap-1 px-4 py-1.5 bg-primary hover:bg-primary-light text-white text-[10px] font-bold rounded-xl transition-all disabled:opacity-50"
                          >
                            <PenLine size={12}/>
                            {signing === c.id ? 'Đang ký...' : 'Ký hợp đồng'}
                          </button>
                        )}

                        {/* 3. ĐIỀU HƯỚNG THEO VIEW CHUYÊN BIỆT */}
                        
                        {/* Nút xem Nhật ký thi công (view = progress hoặc HĐ đang thi công ACTIVE) */}
                        {(currentView === 'progress' || (currentView === 'all' && c.status === 'ACTIVE' && !c.isDisputed)) && (
                          <button 
                            onClick={() => navigate(`/contracts/${c.id}/progress`)}
                            className="flex items-center gap-1 px-4 py-1.5 bg-primary hover:bg-primary-light text-white text-[10px] font-bold rounded-xl transition-all shadow-sm shadow-primary/10"
                          >
                            <Camera size={12}/> Xem Nhật ký & Tiến độ
                          </button>
                        )}

                        {/* Nút quản lý Giải ngân (view = disbursements) */}
                        {currentView === 'disbursements' && (
                          <button 
                            onClick={() => navigate(`/contracts/${c.id}/disbursements`)}
                            className="flex items-center gap-1 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded-xl transition-all shadow-sm shadow-amber-500/15"
                          >
                            <Wallet size={12}/> Quản lý Giải ngân
                          </button>
                        )}

                        {/* Nút Nghiệm thu & Đánh giá (view = reviews hoặc HĐ completed) */}
                        {(currentView === 'reviews' || (currentView === 'all' && c.status === 'COMPLETED' && !c.isDisputed)) && (
                          <button 
                            onClick={() => navigate(`/contracts/${c.id}/review`)}
                            className="flex items-center gap-1 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold rounded-xl transition-all shadow-sm"
                          >
                            <ClipboardCheck size={12}/> Nghiệm thu & Đánh giá
                          </button>
                        )}

                        {/* Nút Giải quyết Tranh chấp (view = disputes hoặc HĐ đang có dispute) */}
                        {(currentView === 'disputes' || (currentView === 'all' && c.isDisputed)) && (
                          <button 
                            onClick={() => navigate(`/contracts/${c.id}/dispute`)}
                            className="flex items-center gap-1 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-xl transition-all shadow-sm shadow-red-600/15 animate-pulse"
                          >
                            <Shield size={12}/> Giải quyết Tranh chấp
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Phần mở rộng xem Điều khoản & Timeline (Chỉ hiện ở view = all) */}
                  {isExpanded && currentView === 'all' && (
                    <div className="border-t border-gray-100 bg-gray-50/20">
                      {/* Điều khoản */}
                      <div className="p-5 border-b border-gray-100">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
                          <FileText size={11}/> Điều khoản thỏa thuận hợp đồng
                        </p>
                        <pre className="text-xs text-gray-600 bg-gray-50 rounded-xl p-4 whitespace-pre-wrap font-sans leading-relaxed max-h-60 overflow-y-auto border border-gray-100">
                          {c.terms || 'Theo thỏa thuận của các bên.'}
                        </pre>
                      </div>

                      {/* Lịch sử trạng thái */}
                      {c.stages?.length > 0 && (
                        <div className="p-5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1">
                            <Clock size={11}/> Nhật ký thay đổi trạng thái
                          </p>
                          <div className="space-y-3">
                            {c.stages.map((s, i) => {
                              const stCfg = STATUS_CONFIG[s.stage] || {};
                              return (
                                <div key={s.id || i} className="flex gap-3">
                                  <div className="flex flex-col items-center">
                                    <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${stCfg.dot || 'bg-gray-300'}`} />
                                    {i < c.stages.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                                  </div>
                                  <div className="pb-1.5 flex-1 text-xs">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${stCfg.cls || 'bg-gray-100 text-gray-600'}`}>
                                        {stCfg.label || s.stage}
                                      </span>
                                      <span className="text-[9px] text-gray-400">
                                        {new Date(s.createdAt).toLocaleString('vi-VN')}
                                      </span>
                                    </div>
                                    {s.note && <p className="text-gray-600 mt-0.5">{s.note}</p>}
                                    {s.performedBy && (
                                      <p className="text-[9px] text-gray-400">Thực hiện bởi: {s.performedBy}</p>
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
  );
}
