import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  FileText, DollarSign, Clock, CheckCircle2, Wallet,
  Shield, Gavel, TrendingUp, Lock, BadgeCheck,
  ChevronRight, Loader2, AlertCircle, Info,
  Hammer, Star, Users, Award, ArrowRight,
  ShieldCheck, Percent, CalendarClock, HandCoins
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const fmt = (n) =>
  n == null ? '—' :
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
    .format(n).replace('₫', 'đ');

const STATUS_CONTRACT = {
  PENDING_REVIEW:    { label: 'Chờ Admin duyệt', cls: 'bg-amber-100 text-amber-700' },
  WAITING_SIGNATURE: { label: 'Chờ ký kết',       cls: 'bg-blue-100 text-blue-700'  },
  ACTIVE:            { label: 'Đang thi công',     cls: 'bg-green-100 text-green-700' },
  COMPLETED:         { label: 'Hoàn thành',        cls: 'bg-gray-100 text-gray-600'   },
  CANCELLED:         { label: 'Đã hủy',            cls: 'bg-red-100 text-red-600'     },
};

// ─── Chính sách nền tảng ──────────────────────────────────────────
const POLICIES = [
  {
    icon: <ShieldCheck size={22} className="text-primary"/>,
    title: 'Escrow 100% bảo vệ bạn',
    desc: 'Khách hàng phải lock 100% giá trị hợp đồng trước khi thi công. Tiền luôn được giữ an toàn, không có rủi ro bùng tiền.',
    color: 'bg-green-50 border-green-200',
  },
  {
    icon: <Percent size={22} className="text-amber-600"/>,
    title: 'Ký quỹ 5% đảm bảo cam kết',
    desc: 'Nhà thầu lock 5% ký quỹ khi ký hợp đồng. Ký quỹ được hoàn trả 100% khi hoàn công thành công.',
    color: 'bg-amber-50 border-amber-200',
  },
  {
    icon: <HandCoins size={22} className="text-blue-600"/>,
    title: 'Giải ngân theo milestone',
    desc: 'Giải ngân theo 4 mốc: 20% / 50% / 80% / 100%. Mỗi đợt: Admin xác nhận → Khách duyệt → 30% nhận ngay, 70% locked đến mốc tiếp theo.',
    color: 'bg-blue-50 border-blue-200',
  },
  {
    icon: <CalendarClock size={22} className="text-purple-600"/>,
    title: '5% bảo hành giữ 6 tháng',
    desc: 'Sau hoàn công, 95% giải ngân ngay. 5% còn lại (warranty hold) được giữ 6 tháng, sau đó Admin giải ngân toàn bộ.',
    color: 'bg-purple-50 border-purple-200',
  },
  {
    icon: <Shield size={22} className="text-red-500"/>,
    title: 'Quy tắc hủy hợp đồng',
    desc: 'Nếu bạn hủy khi HĐ đang ACTIVE: mất ký quỹ 5% + trừ 20 điểm uy tín. Nếu khách hủy: bạn nhận 70% tiền cọc của khách như bồi thường.',
    color: 'bg-red-50 border-red-200',
  },
  {
    icon: <Star size={22} className="text-amber-500"/>,
    title: 'Hệ thống uy tín',
    desc: 'Mỗi hợp đồng hoàn thành tốt tăng điểm uy tín. Điểm cao giúp bạn được ưu tiên hiển thị và nhận nhiều đơn hàng hơn.',
    color: 'bg-amber-50 border-amber-200',
  },
];

const DISBURSEMENT_FLOW = [
  { step: '01', label: 'Nhà thầu gửi yêu cầu', desc: 'Chọn giai đoạn & số tiền cần giải ngân' },
  { step: '02', label: 'Admin xác nhận', desc: 'Admin kiểm tra và xác nhận hợp lệ' },
  { step: '03', label: 'Khách hàng duyệt', desc: 'Khách hàng phê duyệt và tiền được chuyển' },
  { step: '04', label: '30% nhận ngay', desc: '70% còn lại locked đến mốc tiến độ tiếp theo' },
];

export default function ContractorHomePage() {
  const { user, refreshUser } = useAuthStore();
  const navigate = useNavigate();
  const isApproved = user?.approvalStatus === 'APPROVED';

  const [contracts, setContracts] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [openOrders, setOpenOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPolicy, setShowPolicy] = useState(false);

  useEffect(() => {
    refreshUser();
    Promise.all([
      api.get('/contracts/my').catch(() => ({ data: { data: [] } })),
      api.get('/wallet/my').catch(() => ({ data: { data: null } })),
      api.get('/order-bids/open').catch(() => ({ data: { data: [] } })),
    ]).then(([cRes, wRes, oRes]) => {
      setContracts(cRes.data.data || []);
      setWallet(wRes.data.data || null);
      setOpenOrders(oRes.data.data || []);
    }).catch(() => toast.error('Không thể tải dữ liệu'))
      .finally(() => setLoading(false));
  }, []);

  const activeContracts    = contracts.filter(c => c.status === 'ACTIVE');
  const pendingContracts   = contracts.filter(c => ['PENDING_REVIEW','WAITING_SIGNATURE'].includes(c.status));
  const completedContracts = contracts.filter(c => c.status === 'COMPLETED');
  const totalRevenue       = completedContracts.reduce((s, c) => s + (c.agreedPrice || 0), 0);

  if (loading) return (
    <Layout title="Tổng quan nhà thầu">
      <div className="flex justify-center py-24"><Loader2 size={36} className="animate-spin text-primary"/></div>
    </Layout>
  );

  return (
    <Layout title="Tổng quan nhà thầu">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Banner chưa duyệt ── */}
        {!isApproved && (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="mt-0.5 shrink-0 text-amber-500" />
              <div>
                <p className="font-bold text-sm">Tài khoản đang chờ phê duyệt</p>
                <p className="text-xs mt-0.5 text-amber-800">
                  Vui lòng cập nhật đầy đủ hồ sơ năng lực nhà thầu (Logo, năm thành lập, giới thiệu, lĩnh vực hoạt động, chính sách...) để Admin có đủ thông tin xem xét duyệt hoạt động cho bạn.
                </p>
              </div>
            </div>
            <button onClick={() => navigate('/profile', { state: { activeTab: 'portfolio' } })}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 shadow-sm">
              Hoàn thiện hồ sơ thầu ⚙️
            </button>
          </div>
        )}

        {/* ── Greeting hero ── */}
        <div className="bg-gradient-to-br from-primary to-[#1a3a5c] rounded-2xl p-6 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-white/60 text-sm">Xin chào,</p>
              <h1 className="text-2xl font-bold mt-0.5">{user?.fullName || 'Nhà thầu'} 👷</h1>
              <div className="flex items-center gap-2 mt-2">
                {isApproved ? (
                  <span className="flex items-center gap-1.5 bg-green-500/20 text-green-300 text-xs font-bold px-3 py-1 rounded-full border border-green-400/30">
                    <BadgeCheck size={13}/> Đã được phê duyệt
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-400/30">
                    <Clock size={13}/> Chờ phê duyệt
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate('/order-bidding')}
                className="flex items-center gap-2 bg-white text-primary font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-green-50 transition-colors shadow-md">
                <Gavel size={16}/> Đấu thầu ngay
              </button>
              <button onClick={() => setShowPolicy(!showPolicy)}
                className="flex items-center gap-2 bg-white/15 text-white font-medium px-4 py-2.5 rounded-xl text-sm hover:bg-white/25 border border-white/20 transition-colors">
                <Info size={16}/> Chính sách
              </button>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Đang thi công',  value: activeContracts.length,    color: 'text-green-600',  icon: <Hammer size={18}/> },
            { label: 'Chờ xử lý',      value: pendingContracts.length,   color: pendingContracts.length > 0 ? 'text-amber-500' : 'text-gray-400', icon: <Clock size={18}/> },
            { label: 'Hoàn thành',     value: completedContracts.length, color: 'text-primary',    icon: <CheckCircle2 size={18}/> },
            { label: 'Tổng doanh thu', value: fmt(totalRevenue),         color: 'text-primary',    icon: <TrendingUp size={18}/> },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className={`${s.color} mb-1.5`}>{s.icon}</div>
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Ví ── */}
        {wallet && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Wallet size={16} className="text-primary"/> Ví của tôi
              </p>
              <button onClick={() => navigate('/wallet')}
                className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                Quản lý <ChevronRight size={13}/>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Tổng số dư</p>
                <p className="font-bold text-gray-900 text-sm">{fmt(wallet.balance)}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Khả dụng</p>
                <p className="font-bold text-green-700 text-sm">{fmt(wallet.availableBalance)}</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1 justify-center">
                  <Lock size={9}/> Đang khóa
                </p>
                <p className="font-bold text-amber-600 text-sm">{fmt(wallet.lockedAmount)}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Hợp đồng gần đây ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <FileText size={16} className="text-primary"/> Hợp đồng của tôi
            </p>
            <button onClick={() => navigate('/contracts')}
              className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
              Xem tất cả <ChevronRight size={13}/>
            </button>
          </div>
          {contracts.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">
              <FileText size={32} className="mx-auto mb-2 opacity-20"/>
              Chưa có hợp đồng nào. Đấu thầu để bắt đầu.
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {contracts.slice(0, 5).map(c => {
                const st = STATUS_CONTRACT[c.status] || {};
                return (
                  <div key={c.id}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate('/contractor/progress')}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${st.cls}`}>{st.label}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {c.projectName || c.orderCode || c.contractNumber}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono">{c.contractNumber}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-sm font-bold text-primary">{fmt(c.agreedPrice)}</p>
                    </div>
                    <ChevronRight size={15} className="text-gray-300 ml-2 shrink-0"/>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Đơn hàng đang mở ── */}
        {openOrders.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Gavel size={16} className="text-primary"/>
                Đơn hàng đang mở đấu giá
                <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {openOrders.length}
                </span>
              </p>
              <button onClick={() => navigate('/order-bidding')}
                className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                Xem tất cả <ChevronRight size={13}/>
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {openOrders.slice(0, 3).map(o => (
                <div key={o.id}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate('/order-bidding')}>
                  <div className="flex-1 min-w-0">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 mb-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"/>
                      Đang mở
                    </span>
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {o.customRequirements
                        ? o.customRequirements.substring(0, 55) + (o.customRequirements.length > 55 ? '…' : '')
                        : o.orderCode}
                    </p>
                  </div>
                  <ChevronRight size={15} className="text-gray-300 ml-3 shrink-0"/>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Chính sách nền tảng (toggle) ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowPolicy(!showPolicy)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
          >
            <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <ShieldCheck size={16} className="text-primary"/> Chính sách & Quy định nền tảng ConstructX
            </p>
            <ChevronRight size={16} className={`text-gray-400 transition-transform ${showPolicy ? 'rotate-90' : ''}`}/>
          </button>

          {showPolicy && (
            <div className="border-t border-gray-50 p-5 space-y-4">
              {/* Grid chính sách */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {POLICIES.map((p, i) => (
                  <div key={i} className={`rounded-xl border p-4 ${p.color}`}>
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">{p.icon}</div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 mb-1">{p.title}</p>
                        <p className="text-xs text-gray-600 leading-relaxed">{p.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quy trình giải ngân */}
              <div className="bg-gradient-to-r from-primary/5 to-blue-50 border border-primary/20 rounded-xl p-4">
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <ArrowRight size={13}/> Quy trình giải ngân từng milestone
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {DISBURSEMENT_FLOW.map((f, i) => (
                    <div key={i} className="bg-white rounded-xl p-3 border border-white/80">
                      <span className="text-2xl font-black text-primary/20">{f.step}</span>
                      <p className="text-xs font-bold text-gray-800 mt-1">{f.label}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bảng tóm tắt tỉ lệ */}
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-bold text-gray-600">Sự kiện</th>
                      <th className="px-4 py-2.5 text-left font-bold text-gray-600">Tỉ lệ</th>
                      <th className="px-4 py-2.5 text-left font-bold text-gray-600">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[
                      ['Escrow khách hàng', '100% agreedPrice', 'Lock khi chấp nhận báo giá'],
                      ['Ký quỹ nhà thầu', '5% agreedPrice', 'Lock khi ký hợp đồng, hoàn trả khi hoàn công'],
                      ['Giải ngân mỗi đợt', '30% ngay / 70% locked', 'Locked mở dần theo tiến độ tiếp theo'],
                      ['Hoàn công 95%+5%', '95% ngay, 5% warranty', '5% giữ 6 tháng bảo hành'],
                      ['Hủy bởi Contractor', 'Mất 5% ký quỹ', 'Trừ 20 điểm uy tín'],
                      ['Hủy bởi Customer', 'Nhận 70% cọc khách', 'Lấy lại 5% ký quỹ'],
                    ].map(([ev, rate, note], i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="px-4 py-2.5 font-semibold text-gray-800">{ev}</td>
                        <td className="px-4 py-2.5 font-bold text-primary">{rate}</td>
                        <td className="px-4 py-2.5 text-gray-500">{note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ── Quick actions ── */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate('/order-bidding')}
            className="flex items-center justify-between bg-primary text-white rounded-xl p-4 hover:bg-primary/90 transition-colors">
            <div className="text-left">
              <p className="font-bold text-sm">Đấu thầu đơn hàng</p>
              <p className="text-[11px] text-white/70 mt-0.5">Gửi báo giá ngay</p>
            </div>
            <Gavel size={22} className="opacity-80"/>
          </button>
          <button onClick={() => navigate('/contractor/progress')}
            className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
            <div className="text-left">
              <p className="font-bold text-sm text-gray-800">Tiến độ & Thi công</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Nhật ký & Giải ngân</p>
            </div>
            <FileText size={22} className="text-gray-400"/>
          </button>
          <button onClick={() => navigate('/portfolio')}
            className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
            <div className="text-left">
              <p className="font-bold text-sm text-gray-800">Hồ sơ năng lực</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Cập nhật portfolio</p>
            </div>
            <BadgeCheck size={22} className="text-gray-400"/>
          </button>
          <button onClick={() => navigate('/wallet')}
            className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
            <div className="text-left">
              <p className="font-bold text-sm text-gray-800">Ví & Thu nhập</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Rút tiền & lịch sử</p>
            </div>
            <Wallet size={22} className="text-gray-400"/>
          </button>
        </div>

      </div>
    </Layout>
  );
}
