import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import {
  FileText, CheckCircle, Clock, XCircle, AlertCircle,
  ChevronDown, ChevronUp, User as UserIcon, Calendar,
  ArrowRight, PenLine, Printer, Download, Building2,
  Phone, Mail, DollarSign, Shield
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
  win.document.write(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8"/>
  <title>Hợp đồng ${c.contractNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 13pt; color: #000; padding: 30px 50px; }
    h1 { text-align: center; font-size: 20pt; text-transform: uppercase; margin-bottom: 4px; }
    .subtitle { text-align: center; font-size: 12pt; margin-bottom: 24px; color: #444; }
    .meta { text-align: center; margin-bottom: 30px; font-size: 11pt; color: #555; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { border: 1px solid #999; padding: 8px 12px; text-align: left; font-size: 11pt; }
    th { background: #f0f0f0; font-weight: bold; }
    h2 { font-size: 13pt; margin: 24px 0 8px; text-transform: uppercase; }
    p { margin-bottom: 8px; line-height: 1.7; }
    .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 20px 0; }
    .party { border: 1px solid #ccc; padding: 16px; border-radius: 4px; }
    .party h3 { font-size: 12pt; margin-bottom: 8px; color: #1a4f3a; }
    .party p { font-size: 11pt; margin-bottom: 4px; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 60px; text-align: center; }
    .sig-box { border-top: 1px solid #000; padding-top: 8px; font-size: 11pt; }
    .seal { text-align: center; margin: 30px 0 10px; font-style: italic; color: #555; font-size: 11pt; }
    .terms-pre { white-space: pre-wrap; font-family: inherit; font-size: 11pt; line-height: 1.8; }
    @media print {
      body { padding: 20px 40px; }
      button { display: none !important; }
    }
  </style>
</head>
<body>
  <h1>Hợp đồng thi công nội thất</h1>
  <div class="subtitle">Nền tảng ConstructX — Sàn thi công nội thất uy tín</div>
  <div class="meta">Số hợp đồng: <strong>${c.contractNumber}</strong> &nbsp;|&nbsp; Ngày tạo: ${c.createdAt ? new Date(c.createdAt).toLocaleDateString('vi-VN') : '—'} &nbsp;|&nbsp; Trạng thái: ${STATUS_CONFIG[c.status]?.label || c.status}</div>

  <h2>I. Thông tin dự án</h2>
  <table>
    <tr><th>Tên dự án</th><td>${c.projectName || '—'}</td></tr>
    <tr><th>Giá trị hợp đồng</th><td><strong style="color:#1a4f3a">${fmt(c.agreedPrice)}</strong></td></tr>
    <tr><th>Thời gian thi công</th><td>${c.estimatedDays ? c.estimatedDays + ' ngày' : '—'}</td></tr>
    ${c.approvedAt ? `<tr><th>Ngày Admin duyệt</th><td>${new Date(c.approvedAt).toLocaleDateString('vi-VN')}</td></tr>` : ''}
  </table>

  <h2>II. Các bên tham gia</h2>
  <div class="parties">
    <div class="party">
      <h3>Bên A — Khách hàng</h3>
      <p><strong>${c.clientName || '—'}</strong></p>
      ${c.clientPhone ? `<p>📞 ${c.clientPhone}</p>` : ''}
      ${c.clientEmail ? `<p>✉ ${c.clientEmail}</p>` : ''}
    </div>
    <div class="party">
      <h3>Bên B — Nhà thầu</h3>
      <p><strong>${c.contractorName || '—'}</strong></p>
      ${c.contractorPhone ? `<p>📞 ${c.contractorPhone}</p>` : ''}
    </div>
    <div class="party">
      <h3>Bên C — Nền tảng ConstructX</h3>
      <p><strong>Công ty ConstructX</strong></p>
      <p>Người chứng thực & Người giám sát</p>
      ${c.adminNote ? `<p>Ghi chú: ${c.adminNote}</p>` : ''}
    </div>
  </div>

  <h2>III. Điều khoản hợp đồng</h2>
  <pre class="terms-pre">${c.terms || 'Theo thỏa thuận của các bên.'}</pre>

  ${c.stages?.length > 0 ? `
  <h2>IV. Lịch sử trạng thái</h2>
  <table>
    <thead><tr><th>Trạng thái</th><th>Người thực hiện</th><th>Ghi chú</th><th>Thời gian</th></tr></thead>
    <tbody>
      ${c.stages.map(s => `
        <tr>
          <td>${STATUS_CONFIG[s.stage]?.label || s.stage}</td>
          <td>${s.performedBy || '—'}</td>
          <td>${s.note || '—'}</td>
          <td>${s.createdAt ? new Date(s.createdAt).toLocaleString('vi-VN') : '—'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>` : ''}

  <div class="seal">
    — Hợp đồng này có giá trị pháp lý theo quy định của pháp luật Việt Nam —
  </div>

  <div class="signatures">
    <div class="sig-box">Bên A<br/><em>Khách hàng</em><br/><br/><strong>${c.clientName || ''}</strong></div>
    <div class="sig-box">Bên B<br/><em>Nhà thầu</em><br/><br/><strong>${c.contractorName || ''}</strong></div>
    <div class="sig-box">Bên C<br/><em>Đại diện ConstructX</em><br/><br/><strong>Admin ConstructX</strong></div>
  </div>

  <p style="margin-top:40px;text-align:center;font-size:10pt;color:#888">
    Được tạo tự động bởi ConstructX Platform — ${new Date().toLocaleString('vi-VN')}
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

  useEffect(() => { fetchContracts(); }, []);

  const fetchContracts = async () => {
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
      toast.success('✅ Ký hợp đồng thành công! Dự án chính thức bắt đầu thi công.');
      fetchContracts();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi khi ký hợp đồng');
    } finally {
      setSigning(null);
    }
  };

  const counts = Object.fromEntries(
    Object.keys(STATUS_CONFIG).map(k => [k, contracts.filter(c => c.status === k).length])
  );

  return (
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
                ? 'Đăng dự án và chấp nhận báo giá để tạo hợp đồng tự động.'
                : 'Gửi báo giá và được khách hàng chấp nhận để có hợp đồng.'}
            </p>
            {user?.role === 'CUSTOMER' && (
              <button onClick={() => navigate('/projects/new')}
                className="mt-4 btn btn-primary text-sm px-6 py-2">
                Tạo dự án ngay
              </button>
            )}
            {user?.role === 'CONTRACTOR' && (
              <button onClick={() => navigate('/projects/browse')}
                className="mt-4 btn btn-primary text-sm px-6 py-2">
                Tìm dự án
              </button>
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
                        <h3 className="font-bold text-gray-900 text-base">{c.projectName}</h3>
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">📄 {c.contractNumber}</p>
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
                        { icon: <Building2 size={13}/>, label: 'Bên B — Nhà thầu', name: c.contractorName, sub: c.contractorPhone },
                        { icon: <Shield size={13}/>, label: 'Bên C — ConstructX', name: 'Người chứng thực' },
                      ].map((party, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-3">
                          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1.5 flex items-center gap-1">
                            {party.icon} {party.label}
                          </p>
                          <p className="text-sm font-semibold text-gray-800">{party.name}</p>
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

                        {/* Xem dự án */}
                        <button onClick={() => navigate(`/projects/${c.projectId}`)}
                          className="flex items-center gap-1.5 text-xs font-medium border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                          <ArrowRight size={13}/> Xem dự án
                        </button>

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
  );
}
