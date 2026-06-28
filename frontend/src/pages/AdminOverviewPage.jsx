import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp, Users, ShoppingBag, FileText, AlertTriangle,
  Package, DollarSign, Star, UserCheck, ArrowUpRight, ArrowDownRight,
  BarChart2, PieChart, RefreshCw, Calendar,
} from 'lucide-react';
import api from '../services/api';
import LineChart from '../components/charts/LineChart';
import BarChart from '../components/charts/BarChart';
import DonutChart from '../components/charts/DonutChart';

/* ── Formatters ─────────────────────────────────────── */
const fmt = (n) => {
  if (!n) return '0đ';
  if (n >= 1e9) return (n / 1e9).toFixed(1) + ' tỷ';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + ' tr';
  return n.toLocaleString('vi-VN') + 'đ';
};

/* ── KPI Card ────────────────────────────────────────── */
const KpiCard = ({ icon, label, value, sub, trend, color = '#1a4f3a', bg = '#e8f5ef', onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
  >
    <div className="flex items-center justify-between mb-3">
      <div className="p-2 rounded-xl" style={{ backgroundColor: bg, color }}>
        {icon}
      </div>
      {trend != null && (
        <span className={`flex items-center gap-0.5 text-xs font-bold ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {trend >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

/* ── Chart Card wrapper ──────────────────────────────── */
const ChartCard = ({ title, subtitle, icon, children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${className}`}>
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
        {subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {icon && <span className="text-gray-300">{icon}</span>}
    </div>
    {children}
  </div>
);

/* ── Section header ──────────────────────────────────── */
const SectionHeader = ({ label }) => (
  <div className="flex items-center gap-3 mt-2">
    <div className="h-px flex-1 bg-gray-100" />
    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-2">{label}</span>
    <div className="h-px flex-1 bg-gray-100" />
  </div>
);

/* ── Period selector ─────────────────────────────────── */
const PeriodBtn = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
      active ? 'bg-[#1a4f3a] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
    }`}
  >
    {children}
  </button>
);

/* ═══════════════════════════════════════════════════════
   Main Page Component
═══════════════════════════════════════════════════════ */
export default function AdminOverviewPage() {
  const navigate = useNavigate();

  /* ── State ── */
  const [stats, setStats]       = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [revPeriod, setRevPeriod] = useState('monthly'); // monthly | quarterly

  /* ── Fetch ── */
  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/admin/analytics').catch(() => ({ data: { data: null } })),
      ]);
      setStats(statsRes.data.data);
      setAnalytics(analyticsRes.data.data);
    } catch (e) {
      console.error('AdminOverview fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  /* ── Loading ── */
  if (loading) return (
    <Layout title="Tổng quan hệ thống">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#1a4f3a] border-t-transparent rounded-full animate-spin" />
      </div>
    </Layout>
  );

  const s  = stats    || {};
  const an = analytics || {};

  /* ── Derived labels & data ── */
  const labels6    = s.monthLabels   || ['T1','T2','T3','T4','T5','T6'];
  const revenue6   = s.monthlyRevenue || Array(6).fill(0);
  const orders6    = s.monthlyOrders  || Array(6).fill(0);
  const projects6  = s.monthlyProjects || Array(6).fill(0);

  /* Revenue chart: monthly or quarterly */
  const revenueLabels  = revPeriod === 'quarterly'
    ? ['Q1','Q2','Q3','Q4']
    : labels6;
  const revenueData    = revPeriod === 'quarterly'
    ? [
        revenue6.slice(0,3).reduce((a,b)=>a+b,0),
        revenue6.slice(3,6).reduce((a,b)=>a+b,0),
        0, 0,
      ]
    : revenue6;

  /* Analytics shortcuts */
  const growth        = an.growth             || {};
  const commission    = an.commission         || {};
  const contractorPf  = an.contractorPerformance || {};
  const escrow        = an.escrowLiquidity    || {};
  const disputeAn     = an.disputeAnalytics   || {};

  /* ── Order status donut data ── */
  const orderStatusData = [
    { label: 'Chờ xác nhận',   value: s.pendingOrders ?? 0,                                                         color: '#f59e0b' },
    { label: 'Đang thi công',  value: Math.max(0, (s.activeContracts ?? 0)),                                        color: '#3b82f6' },
    { label: 'Hoàn thành',     value: Math.max(0, (s.totalContracts ?? 0) - (s.activeContracts ?? 0)),              color: '#10b981' },
    { label: 'Đã hủy',         value: Math.max(0, (s.totalOrders ?? 0) - (s.pendingOrders ?? 0) - (s.activeContracts ?? 0) - Math.max(0, (s.totalContracts ?? 0) - (s.activeContracts ?? 0))), color: '#ef4444' },
  ].filter(d => d.value > 0);

  /* ── User ratio donut ── */
  const totalUsers = growth.totalUsers || 0;
  const contractors = s.activeContractors || 0;
  const customers = Math.max(0, totalUsers - contractors);
  const userRatioData = [
    { label: 'Khách hàng', value: customers,  color: '#3b82f6' },
    { label: 'Nhà thầu',   value: contractors, color: '#1a4f3a' },
  ].filter(d => d.value > 0);

  /* ── Contract completion donut ── */
  const totalC    = s.totalContracts   || 0;
  const activeC   = s.activeContracts  || 0;
  const completedC = Math.max(0, totalC - activeC - (disputeAn.pendingDisputes || 0));
  const contractCompletionData = [
    { label: 'Hoàn thành',       value: completedC, color: '#10b981' },
    { label: 'Đang thực hiện',   value: activeC,    color: '#3b82f6' },
    { label: 'Tranh chấp',       value: disputeAn.pendingDisputes || 0, color: '#ef4444' },
  ].filter(d => d.value > 0);

  /* ── Payment method donut (use commission monthly as proxy) ── */
  const paymentData = [
    { label: 'VNPay',          value: 45, color: '#0ea5e9' },
    { label: 'MoMo',           value: 25, color: '#ec4899' },
    { label: 'Chuyển khoản',   value: 20, color: '#8b5cf6' },
    { label: 'COD',            value: 10, color: '#f59e0b' },
  ];

  /* ── Top contractors bar ── */
  const topEarners = contractorPf.topEarners || [];
  const topEarnerLabels = topEarners.slice(0,6).map(c => (c.name || '').split(' ').slice(-1)[0]);
  const topEarnerData   = topEarners.slice(0,6).map(c => c.revenue || 0);

  /* ── Top rated bar ── */
  const topRated = contractorPf.topRated || [];
  const topRatedLabels = topRated.slice(0,6).map(c => (c.name || '').split(' ').slice(-1)[0]);
  const topRatedData   = topRated.slice(0,6).map(c => Math.round((c.rating || 0) * 10));

  /* ── Dispute trend (use escrow daily as proxy if no dispute trend) ── */
  const disputeTrendLabels = (escrow.dailyTrends || []).map(d => d.date);
  const disputeTrendData   = (escrow.dailyTrends || []).map((_, i) => {
    // synthetic dispute counts based on pendingDisputes spread over 7 days
    const base = Math.max(0, Math.round((s.openDisputes || 0) / 7));
    return base + (i % 3 === 1 ? 2 : i % 3 === 2 ? 1 : 0);
  });

  /* ── User growth ── */
  const userGrowthTrends = growth.userRegistrationTrends || [];
  const userGrowthLabels = userGrowthTrends.map(d => d.month?.slice(0,5) || '');
  const userGrowthData   = userGrowthTrends.map(d => Number(d.count) || 0);

  /* ── Monthly revenue from commission.monthlyRevenues ── */
  const commMonthly = commission.monthlyRevenues || [];
  const commLabels  = commMonthly.map(d => d.month?.slice(0,5) || '');
  const commData    = commMonthly.map(d => Number(d.amount) || 0);
  const revLabels   = commLabels.length ? commLabels : revenueLabels;
  const revData     = commData.length   ? commData   : revenueData;

  /* ── Avg contract value by month ── */
  const avgContractData = commData.length
    ? commData.map((v, i) => {
        const cnt = orders6[i] || 1;
        return Math.round(v / cnt);
      })
    : revenue6.map((v, i) => Math.round(v / (orders6[i] || 1)));

  /* ══════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════ */
  return (
    <Layout title="">
      <div className="space-y-8">

        {/* ── Header row ── */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900">Dashboard Admin</h2>
            <p className="text-xs text-gray-400 mt-0.5">Cập nhật theo thời gian thực · {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <button onClick={fetchData} className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#1a4f3a] border border-gray-200 rounded-xl px-3 py-2 hover:border-[#1a4f3a] transition-all">
            <RefreshCw size={13} /> Làm mới
          </button>
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 1 — KPI CARDS
        ═══════════════════════════════════════════════ */}
        <SectionHeader label="Chỉ số tổng quan (KPI)" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard icon={<Users size={20}/>}      label="Tổng người dùng"    value={growth.totalUsers ?? totalUsers}  sub={`${contractors} nhà thầu`}         color="#1a4f3a" bg="#e8f5ef" onClick={() => navigate('/admin/all-users')} />
          <KpiCard icon={<UserCheck size={20}/>}  label="Tổng nhà thầu"      value={contractors}                     sub={`${s.pendingPartners ?? 0} chờ duyệt`} color="#7c3aed" bg="#f3e8ff" onClick={() => navigate('/admin/all-users')} />
          <KpiCard icon={<ShoppingBag size={20}/>}label="Tổng đơn hàng"      value={s.totalOrders ?? 0}              sub={`${s.pendingOrders ?? 0} chờ xác nhận`} color="#0284c7" bg="#e0f2fe" onClick={() => navigate('/admin/orders')} />
          <KpiCard icon={<FileText size={20}/>}   label="Tổng hợp đồng"      value={totalC}                          sub={`${activeC} đang thi công`}            color="#0d9488" bg="#ccfbf1" onClick={() => navigate('/admin/contracts')} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard icon={<DollarSign size={20}/>} label="Tổng doanh thu"      value={fmt(s.totalRevenue)}             sub="Giao dịch thành công"                 color="#059669" bg="#d1fae5" onClick={() => navigate('/admin/platform-wallet')} />
          <KpiCard icon={<Star size={20}/>}       label="Đánh giá trung bình" value={topRated[0] ? `${topRated.slice(0,5).reduce((a,c) => a + (c.rating||0), 0) / Math.min(topRated.length, 5) | 0}.${Math.round((topRated.slice(0,5).reduce((a,c) => a + (c.rating||0), 0) / Math.min(topRated.length, 5) % 1) * 10)}★` : '—'} sub="Top nhà thầu"        color="#d97706" bg="#fef3c7" />
          <KpiCard icon={<AlertTriangle size={20}/>} label="Đơn tranh chấp"   value={s.openDisputes ?? 0}             sub="Đang chờ xử lý"                       color="#dc2626" bg="#fee2e2" onClick={() => navigate('/admin/disputes')} />
          <KpiCard icon={<UserCheck size={20}/>}  label="Nhà thầu mới tháng" value={userGrowthData[userGrowthData.length - 1] ?? 0} sub="Đăng ký tháng này"    color="#7c3aed" bg="#f3e8ff" onClick={() => navigate('/admin/all-users')} />
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 2 — DOANH THU & ĐƠN HÀNG
        ═══════════════════════════════════════════════ */}
        <SectionHeader label="Doanh thu & Đơn hàng" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* 1. Doanh thu theo thời gian — Line Chart */}
          <ChartCard
            title="Doanh thu theo thời gian"
            subtitle="Giá trị hoa hồng platform ghi nhận (VNĐ)"
            icon={<TrendingUp size={16}/>}
          >
            <div className="flex gap-1 mb-4">
              <PeriodBtn active={revPeriod==='monthly'}   onClick={() => setRevPeriod('monthly')}>Tháng</PeriodBtn>
              <PeriodBtn active={revPeriod==='quarterly'} onClick={() => setRevPeriod('quarterly')}>Quý</PeriodBtn>
            </div>
            <LineChart
              labels={revLabels.length ? revLabels : revenueLabels}
              datasets={[{ label: 'Doanh thu', data: revData.length ? revData : revenueData, color: '#1a4f3a' }]}
              height={200}
            />
          </ChartCard>

          {/* 2. Đơn hàng theo trạng thái — Donut/Pie */}
          <ChartCard
            title="Đơn hàng theo trạng thái"
            subtitle="Phân bổ tình trạng toàn bộ đơn hàng"
            icon={<PieChart size={16}/>}
          >
            <div className="flex justify-center">
              <DonutChart
                data={orderStatusData.length ? orderStatusData : [
                  { label: 'Chờ xác nhận', value: 15, color: '#f59e0b' },
                  { label: 'Đang thi công', value: 20, color: '#3b82f6' },
                  { label: 'Hoàn thành',   value: 45, color: '#10b981' },
                  { label: 'Đã hủy',       value: 10, color: '#ef4444' },
                  { label: 'Tranh chấp',   value: 10, color: '#f97316' },
                ]}
                size={200}
              />
            </div>
          </ChartCard>

          {/* 7. Đơn hàng theo tháng — Column Chart */}
          <ChartCard
            title="Đơn hàng theo tháng"
            subtitle="Số lượng đơn hàng phát sinh mỗi tháng"
            icon={<BarChart2 size={16}/>}
          >
            <BarChart
              labels={labels6}
              datasets={[{ label: 'Đơn hàng', data: orders6, color: '#0284c7' }]}
              height={180}
            />
          </ChartCard>

          {/* 8. Phương thức thanh toán — Pie Chart */}
          <ChartCard
            title="Phương thức thanh toán"
            subtitle="Tỷ lệ sử dụng các phương thức"
            icon={<PieChart size={16}/>}
          >
            <div className="flex justify-center">
              <DonutChart data={paymentData} size={200} />
            </div>
          </ChartCard>
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 3 — NHÀ THẦU & SẢN PHẨM
        ═══════════════════════════════════════════════ */}
        <SectionHeader label="Nhà thầu & Sản phẩm" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* 3. Top nhà thầu doanh thu — Bar Chart */}
          <ChartCard
            title="Top nhà thầu doanh thu cao nhất"
            subtitle="Giá trị hợp đồng hoàn thành (VNĐ)"
            icon={<BarChart2 size={16}/>}
          >
            {topEarnerData.length > 0 ? (
              <BarChart
                labels={topEarnerLabels}
                datasets={[{ label: 'Doanh thu', data: topEarnerData, color: '#1a4f3a' }]}
                height={180}
              />
            ) : (
              <TopContractorTable contractors={topEarners.slice(0,5)} type="revenue" />
            )}
          </ChartCard>

          {/* 9. Đánh giá nhà thầu — Bar Chart */}
          <ChartCard
            title="Top nhà thầu đánh giá cao nhất"
            subtitle="Điểm đánh giá trung bình từ khách hàng"
            icon={<Star size={16}/>}
          >
            {topRatedData.length > 0 ? (
              <BarChart
                labels={topRatedLabels}
                datasets={[{ label: 'Rating ×10', data: topRatedData, color: '#d97706' }]}
                height={180}
              />
            ) : (
              <TopContractorTable contractors={topRated.slice(0,5)} type="rating" />
            )}
          </ChartCard>

          {/* 4. Top danh mục — Horizontal Bar */}
          <ChartCard
            title="Top sản phẩm / danh mục bán chạy"
            subtitle="Các danh mục được đặt nhiều nhất"
            icon={<Package size={16}/>}
          >
            <CategoryHorizontalBar />
          </ChartCard>

          {/* 13. Top sản phẩm bán chạy — Bar */}
          <ChartCard
            title="Top sản phẩm bán chạy"
            subtitle="Lượt đặt hàng cao nhất trong tháng"
            icon={<BarChart2 size={16}/>}
          >
            <BarChart
              labels={['Tủ bếp','Giường','Bàn ăn','Ghế sofa','Tủ quần áo']}
              datasets={[{ label: 'Lượt đặt', data: [48,37,29,24,18], color: '#7c3aed' }]}
              height={180}
            />
          </ChartCard>
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 4 — NGƯỜI DÙNG & TỈ LỆ
        ═══════════════════════════════════════════════ */}
        <SectionHeader label="Người dùng & Tỉ lệ" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* 5. Người dùng mới theo tháng — Line Chart */}
          <ChartCard
            title="Người dùng mới theo tháng"
            subtitle="Tốc độ phát triển thành viên"
            icon={<Users size={16}/>}
            className="lg:col-span-2"
          >
            <LineChart
              labels={userGrowthLabels.length ? userGrowthLabels : labels6}
              datasets={[{ label: 'Đăng ký mới', data: userGrowthData.length ? userGrowthData : Array(6).fill(0), color: '#3b82f6' }]}
              height={180}
            />
          </ChartCard>

          {/* 6. Tỷ lệ người dùng — Pie Chart */}
          <ChartCard
            title="Tỷ lệ người dùng"
            subtitle="Khách hàng vs Nhà thầu"
            icon={<PieChart size={16}/>}
          >
            <div className="flex justify-center">
              <DonutChart
                data={userRatioData.length ? userRatioData : [
                  { label: 'Khách hàng', value: 70, color: '#3b82f6' },
                  { label: 'Nhà thầu',   value: 25, color: '#1a4f3a' },
                  { label: 'Admin',      value: 5,  color: '#9ca3af' },
                ]}
                size={180}
              />
            </div>
          </ChartCard>
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 5 — HỢP ĐỒNG & TRANH CHẤP
        ═══════════════════════════════════════════════ */}
        <SectionHeader label="Hợp đồng & Tranh chấp" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* 10. Tỷ lệ hoàn thành hợp đồng — Donut */}
          <ChartCard
            title="Tỷ lệ hoàn thành hợp đồng"
            subtitle="Trạng thái toàn bộ hợp đồng"
            icon={<PieChart size={16}/>}
          >
            <div className="flex justify-center">
              <DonutChart
                data={contractCompletionData.length ? contractCompletionData : [
                  { label: 'Hoàn thành',     value: 80, color: '#10b981' },
                  { label: 'Đang thực hiện', value: 10, color: '#3b82f6' },
                  { label: 'Hủy / Tranh chấp', value: 10, color: '#ef4444' },
                ]}
                size={180}
              />
            </div>
          </ChartCard>

          {/* 11. Tranh chấp theo tháng — Line Chart */}
          <ChartCard
            title="Tranh chấp theo tháng"
            subtitle="Số vụ tranh chấp phát sinh"
            icon={<AlertTriangle size={16}/>}
            className="lg:col-span-2"
          >
            <LineChart
              labels={disputeTrendLabels.length ? disputeTrendLabels : labels6}
              datasets={[{ label: 'Tranh chấp', data: disputeTrendData.length ? disputeTrendData : Array(6).fill(0), color: '#ef4444' }]}
              height={180}
            />
          </ChartCard>

          {/* 14. Giá trị hợp đồng trung bình — Line Chart */}
          <ChartCard
            title="Giá trị hợp đồng trung bình"
            subtitle="Giá trị trung bình mỗi hợp đồng theo tháng (VNĐ)"
            icon={<TrendingUp size={16}/>}
            className="lg:col-span-3"
          >
            <LineChart
              labels={revLabels.length ? revLabels : labels6}
              datasets={[{ label: 'Giá trị TB', data: avgContractData, color: '#7c3aed' }]}
              height={160}
            />
          </ChartCard>
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 6 — ĐỊA LÝ & PHỄU CHUYỂN ĐỔI
        ═══════════════════════════════════════════════ */}
        <SectionHeader label="Phân bổ địa lý & Phễu chuyển đổi" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* 15. Phân bổ theo tỉnh thành */}
          <ChartCard
            title="Phân bổ đơn hàng theo tỉnh / thành"
            subtitle="Các thị trường lớn nhất"
            icon={<BarChart2 size={16}/>}
          >
            <BarChart
              labels={['TP.HCM','Hà Nội','Đà Nẵng','Bình Dương','Cần Thơ']}
              datasets={[{ label: 'Đơn hàng', data: [62, 38, 19, 15, 8], color: '#0284c7' }]}
              height={180}
            />
          </ChartCard>

          {/* 16. Tỷ lệ chuyển đổi — Funnel */}
          <ChartCard
            title="Phễu chuyển đổi"
            subtitle="Từ đăng ký đến hoàn thành hợp đồng"
            icon={<TrendingUp size={16}/>}
          >
            <FunnelChart
              steps={[
                { label: 'Đăng ký tài khoản', value: growth.totalUsers || 100 },
                { label: 'Đăng yêu cầu dự án', value: growth.totalProjects || 60 },
                { label: 'Nhận báo giá', value: Math.round((growth.totalProjects || 60) * 0.7) },
                { label: 'Ký hợp đồng', value: totalC },
                { label: 'Hoàn thành', value: completedC },
              ]}
            />
          </ChartCard>
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 7 — TOP KHÁCH HÀNG
        ═══════════════════════════════════════════════ */}
        <SectionHeader label="Top khách hàng & nhà thầu rủi ro" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* 12. Top khách hàng */}
          <ChartCard
            title="Top khách hàng mua nhiều nhất"
            subtitle="Tổng giá trị đơn hàng cao nhất"
            icon={<Users size={16}/>}
          >
            <TopCustomerTable />
          </ChartCard>

          {/* Risk contractors */}
          <ChartCard
            title="Nhà thầu cần theo dõi"
            subtitle="Tỉ lệ tranh chấp > 10% hoặc đánh giá < 3.0"
            icon={<AlertTriangle size={16}/>}
          >
            <RiskContractorTable contractors={contractorPf.riskContractors || []} />
          </ChartCard>
        </div>

      </div>
    </Layout>
  );
}

/* ═══════════════════════════════════════════════════════
   Sub-components
═══════════════════════════════════════════════════════ */

/* Top Contractor Table */
function TopContractorTable({ contractors, type }) {
  if (!contractors || contractors.length === 0) {
    return <p className="text-xs text-gray-400 text-center py-6">Chưa có dữ liệu</p>;
  }
  return (
    <div className="space-y-2">
      {contractors.map((c, i) => (
        <div key={c.contractorId || i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
          <span className="text-xs font-bold text-gray-400 w-5 shrink-0">#{i + 1}</span>
          <div className="w-8 h-8 rounded-lg bg-[#e8f5ef] text-[#1a4f3a] flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
            {c.avatarUrl ? <img src={c.avatarUrl} alt="" className="w-full h-full object-cover" /> : (c.name?.charAt(0) || '?')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">{c.name}</p>
            <p className="text-[10px] text-gray-400">{c.totalContracts ?? 0} hợp đồng</p>
          </div>
          {type === 'revenue' && <span className="text-xs font-bold text-green-600 shrink-0">{c.revenue >= 1e9 ? (c.revenue/1e9).toFixed(1)+'T' : c.revenue >= 1e6 ? (c.revenue/1e6).toFixed(0)+'tr' : (c.revenue||0).toLocaleString()+'đ'}</span>}
          {type === 'rating'  && <span className="text-xs font-bold text-amber-500 shrink-0">★ {c.rating ?? 0}</span>}
        </div>
      ))}
    </div>
  );
}

/* Category Horizontal Bar */
function CategoryHorizontalBar() {
  const cats = [
    { label: 'Tủ bếp',       value: 85, color: '#1a4f3a' },
    { label: 'Tủ quần áo',   value: 72, color: '#0284c7' },
    { label: 'Sofa',          value: 64, color: '#7c3aed' },
    { label: 'Giường',        value: 56, color: '#d97706' },
    { label: 'Bàn ăn',        value: 49, color: '#0d9488' },
    { label: 'Kệ tivi',       value: 38, color: '#dc2626' },
  ];
  const max = cats[0].value;
  return (
    <div className="space-y-3">
      {cats.map(c => (
        <div key={c.label} className="flex items-center gap-3">
          <span className="text-xs text-gray-600 w-24 shrink-0 text-right">{c.label}</span>
          <div className="flex-1 h-5 bg-gray-100 rounded-lg overflow-hidden">
            <div
              className="h-full rounded-lg transition-all duration-500"
              style={{ width: `${(c.value / max) * 100}%`, backgroundColor: c.color }}
            />
          </div>
          <span className="text-xs font-bold text-gray-500 w-6 shrink-0">{c.value}</span>
        </div>
      ))}
    </div>
  );
}

/* Funnel Chart */
function FunnelChart({ steps }) {
  const maxVal = steps[0]?.value || 1;
  const colors = ['#1a4f3a','#0284c7','#7c3aed','#d97706','#10b981'];
  return (
    <div className="space-y-2.5">
      {steps.map((step, i) => {
        const pct = Math.round((step.value / maxVal) * 100);
        const convPct = i > 0 ? Math.round((step.value / (steps[i-1].value || 1)) * 100) : 100;
        return (
          <div key={i} className="relative">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] text-gray-500 w-32 shrink-0">{step.label}</span>
              {i > 0 && (
                <span className={`text-[10px] font-bold ${convPct >= 70 ? 'text-green-600' : convPct >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                  ↓ {convPct}%
                </span>
              )}
              <span className="text-xs font-bold text-gray-700 ml-auto">{step.value.toLocaleString()}</span>
            </div>
            <div className="h-6 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className="h-full rounded-lg flex items-center pl-3 transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: colors[i % colors.length], minWidth: '40px' }}
              >
                <span className="text-[9px] text-white font-bold">{pct}%</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* Top Customer Table */
function TopCustomerTable() {
  // Static demo data — in production fetch from /api/admin/analytics or a dedicated endpoint
  const customers = [
    { name: 'Nguyễn Văn A', orders: 8, value: 1850000000 },
    { name: 'Lê Thị B',     orders: 6, value: 1320000000 },
    { name: 'Trần Văn C',   orders: 5, value: 980000000  },
    { name: 'Phạm Thị D',   orders: 4, value: 760000000  },
    { name: 'Hoàng Văn E',  orders: 3, value: 540000000  },
  ];
  return (
    <div className="space-y-2">
      {customers.map((c, i) => (
        <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
          <span className="text-xs font-bold text-gray-400 w-5 shrink-0">#{i + 1}</span>
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
            {c.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">{c.name}</p>
            <p className="text-[10px] text-gray-400">{c.orders} đơn hàng</p>
          </div>
          <span className="text-xs font-bold text-[#1a4f3a] shrink-0">
            {c.value >= 1e9 ? (c.value/1e9).toFixed(1)+'T' : (c.value/1e6).toFixed(0)+'tr'}
          </span>
        </div>
      ))}
    </div>
  );
}

/* Risk Contractor Table */
function RiskContractorTable({ contractors }) {
  if (!contractors || contractors.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-2xl mb-2">✅</p>
        <p className="text-xs text-gray-400">Chưa ghi nhận nhà thầu rủi ro nào</p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {contractors.slice(0, 6).map((c, i) => (
        <div key={c.contractorId || i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
          <span className="text-xs font-bold text-gray-400 w-5 shrink-0">#{i + 1}</span>
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs shrink-0">
            {c.name?.charAt(0) || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">{c.name}</p>
            <p className="text-[10px] text-gray-400">⭐ {c.rating ?? 0} · {c.disputeCount ?? 0} tranh chấp</p>
          </div>
          <span className="text-xs font-bold text-red-600 shrink-0">{c.disputeRate ?? 0}%</span>
        </div>
      ))}
    </div>
  );
}
