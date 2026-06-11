import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp, Wallet, ClipboardList, CheckCircle2, ChevronRight,
  MessageSquare, Users, AlertTriangle, ShoppingBag, FileText,
  Package, Clock, ArrowUpRight, ArrowDownRight, Activity,
  BarChart2, PieChart, DollarSign
} from 'lucide-react';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import LineChart from '../components/charts/LineChart';
import BarChart from '../components/charts/BarChart';
import DonutChart from '../components/charts/DonutChart';

/* ── helpers ── */
const fmt = (n) => {
  if (!n) return '0đ';
  if (n >= 1e9) return (n / 1e9).toFixed(1) + ' tỷ';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'tr';
  return n.toLocaleString('vi-VN') + 'đ';
};

const StatCard = ({ icon, label, value, sub, trend, color = 'primary', onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
  >
    <div className="flex items-center justify-between mb-3">
      <div className={`p-2 rounded-xl bg-${color}-bg text-${color}`}>{icon}</div>
      {trend != null && (
        <span className={`flex items-center gap-0.5 text-xs font-bold ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {trend >= 0 ? <ArrowUpRight size={13}/> : <ArrowDownRight size={13}/>}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-2xl font-bold font-display text-gray-900">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

/* ════════════════════════════════════════════════════════════════ */

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [projects, setProjects] = useState([]);
  const [orders, setOrders] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, [user?.role]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      if (user?.role === 'ADMIN') {
        const [statsRes, notifRes] = await Promise.all([
          api.get('/admin/dashboard/stats'),
          api.get('/notifications'),
        ]);
        setStats(statsRes.data.data);
        setNotifications(notifRes.data.data || []);
      } else if (user?.role === 'CUSTOMER') {
        const [projRes, walletRes, orderRes, contractRes, notifRes] = await Promise.all([
          api.get('/projects/my'),
          api.get('/wallet'),
          api.get('/orders/my').catch(() => ({ data: { data: [] } })),
          api.get('/contracts/my').catch(() => ({ data: { data: [] } })),
          api.get('/notifications'),
        ]);
        setProjects(projRes.data.data || []);
        setWallet(walletRes.data.data);
        setOrders(orderRes.data.data || []);
        setContracts(contractRes.data.data || []);
        setNotifications(notifRes.data.data || []);
      } else {
        // CONTRACTOR
        const [projRes, walletRes, contractRes, notifRes] = await Promise.all([
          api.get('/projects/my').catch(() => ({ data: { data: [] } })),
          api.get('/wallet'),
          api.get('/contracts/my').catch(() => ({ data: { data: [] } })),
          api.get('/notifications'),
        ]);
        setProjects(projRes.data.data || []);
        setWallet(walletRes.data.data);
        setContracts(contractRes.data.data || []);
        setNotifications(notifRes.data.data || []);
      }
    } catch (e) {
      console.error('Dashboard fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Layout title="Tổng quan">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </Layout>
  );

  /* ── ADMIN DASHBOARD ── */
  if (user?.role === 'ADMIN') {
    const s = stats || {};
    const labels = s.monthLabels || ['T1','T2','T3','T4','T5','T6'];
    const revenue = s.monthlyRevenue || Array(6).fill(0);
    const projCounts = s.monthlyProjects || Array(6).fill(0);
    const orderCounts = s.monthlyOrders || Array(6).fill(0);

    return (
      <Layout title="Tổng quan hệ thống">
        <div className="space-y-6">

          {/* KPI row 1 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<DollarSign size={20}/>} label="Tổng doanh thu"
              value={fmt(s.totalRevenue)} sub="Giao dịch thành công" color="primary"
              onClick={() => navigate('/wallet')} />
            <StatCard icon={<Activity size={20}/>} label="Escrow đang giữ"
              value={fmt(s.totalEscrow)} sub="Chờ giải ngân" color="accent" />
            <StatCard icon={<ShoppingBag size={20}/>} label="Đơn hàng"
              value={s.totalOrders ?? 0} sub={`${s.pendingOrders ?? 0} chờ duyệt`} color="info"
              onClick={() => navigate('/admin/orders')} />
            <StatCard icon={<FileText size={20}/>} label="Hợp đồng"
              value={s.totalContracts ?? 0} sub={`${s.activeContracts ?? 0} đang thi công`} color="primary"
              onClick={() => navigate('/admin/contracts')} />
          </div>

          {/* KPI row 2 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<ClipboardList size={20}/>} label="Tổng dự án"
              value={s.newProjectsCount ?? 0} sub={`${s.pendingProjects ?? 0} chờ duyệt`} color="info"
              onClick={() => navigate('/admin/projects')} />
            <StatCard icon={<Users size={20}/>} label="Nhà thầu active"
              value={s.activeContractors ?? 0} sub={`${s.pendingPartners ?? 0} chờ duyệt`} color="primary"
              onClick={() => navigate('/admin/users')} />
            <StatCard icon={<AlertTriangle size={20}/>} label="Tranh chấp mở"
              value={s.openDisputes ?? 0} sub="Cần xử lý" color="danger"
              onClick={() => navigate('/admin/disputes')} />
            <StatCard icon={<Package size={20}/>} label="Sản phẩm Shop"
              value="—" sub="Quản lý catalog" color="info"
              onClick={() => navigate('/admin/products')} />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Line: Doanh thu 6 tháng */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">Doanh thu 6 tháng gần nhất</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Tổng giá trị giao dịch thành công (VNĐ)</p>
                </div>
                <TrendingUp size={18} className="text-primary" />
              </div>
              <LineChart
                labels={labels}
                datasets={[{ label: 'Doanh thu', data: revenue, color: '#1a4f3a' }]}
                height={180}
              />
            </div>

            {/* Bar: Dự án & Đơn hàng */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">Hoạt động 6 tháng</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Số dự án và đơn hàng mỗi tháng</p>
                </div>
                <BarChart2 size={18} className="text-primary" />
              </div>
              <BarChart
                labels={labels}
                datasets={[
                  { label: 'Dự án', data: projCounts, color: '#1a4f3a' },
                  { label: 'Đơn hàng', data: orderCounts, color: '#e8a020' },
                ]}
                height={180}
              />
            </div>

            {/* Donut: Trạng thái dự án */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">Phân bổ dự án</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Theo trạng thái hiện tại</p>
                </div>
                <PieChart size={18} className="text-primary" />
              </div>
              <div className="flex justify-center">
                <DonutChart
                  data={[
                    { label: 'Chờ duyệt',  value: s.pendingProjects ?? 0, color: '#f59e0b' },
                    { label: 'Đang mở',    value: Math.max(0, (s.newProjectsCount ?? 0) - (s.pendingProjects ?? 0) - (s.activeContracts ?? 0)), color: '#3b82f6' },
                    { label: 'Thi công',   value: s.activeContracts ?? 0, color: '#1a4f3a' },
                    { label: 'Hoàn thành', value: Math.max(0, (s.totalContracts ?? 0) - (s.activeContracts ?? 0)), color: '#10b981' },
                  ]}
                  size={180}
                />
              </div>
            </div>

            {/* Donut: Đơn hàng */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">Phân bổ đơn hàng</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Catalog vs. Tùy chỉnh vs. Chờ duyệt</p>
                </div>
                <PieChart size={18} className="text-accent" />
              </div>
              <div className="flex justify-center">
                <DonutChart
                  data={[
                    { label: 'Chờ xác nhận', value: s.pendingOrders ?? 0, color: '#f59e0b' },
                    { label: 'Đang xử lý',   value: Math.max(0, (s.totalOrders ?? 0) - (s.pendingOrders ?? 0)), color: '#1a4f3a' },
                  ]}
                  size={180}
                />
              </div>
            </div>
          </div>

          {/* Quick action cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { to: '/admin/projects', label: 'Duyệt dự án', count: s.pendingProjects, cls: 'yellow' },
              { to: '/admin/users',    label: 'Duyệt đối tác', count: s.pendingPartners, cls: 'green' },
              { to: '/admin/disputes', label: 'Tranh chấp',    count: s.openDisputes,    cls: 'red' },
            ].map(item => (
              <Link key={item.to} to={item.to}
                className={`rounded-2xl border border-${item.cls}-100 bg-${item.cls}-50 p-5 hover:shadow-md transition-shadow`}>
                <p className={`text-sm text-${item.cls}-700 font-medium`}>Cần xử lý: {item.label}</p>
                <p className={`text-3xl font-bold text-${item.cls}-800 mt-2`}>{item.count ?? 0}</p>
                <p className={`text-xs text-${item.cls}-600 mt-2`}>Mở trang → </p>
              </Link>
            ))}
          </div>

          {/* Recent projects + notifications */}
          <RecentProjectsAndNotifs projects={s.myProjects || []} notifications={notifications} role="ADMIN" />
        </div>
      </Layout>
    );
  }

  /* ── CUSTOMER DASHBOARD ── */
  if (user?.role === 'CUSTOMER') {
    const activeP = projects.filter(p => p.status === 'OPEN' || p.status === 'IN_PROGRESS').length;
    const doneP   = projects.filter(p => p.status === 'COMPLETED').length;
    const activeC = contracts.filter(c => c.status === 'ACTIVE' || c.status === 'WAITING_SIGNATURE').length;
    const pendingO = orders.filter(o => o.status === 'PENDING' || o.status === 'CONFIRMED').length;

    const orderByStatus = [
      { label: 'Chờ xác nhận', value: orders.filter(o => o.status === 'PENDING').length, color: '#f59e0b' },
      { label: 'Đang xử lý',   value: orders.filter(o => ['CONFIRMED','PROCESSING','SHIPPED'].includes(o.status)).length, color: '#3b82f6' },
      { label: 'Đã giao',      value: orders.filter(o => o.status === 'DELIVERED').length, color: '#1a4f3a' },
      { label: 'Đã hủy',       value: orders.filter(o => o.status === 'CANCELLED').length, color: '#ef4444' },
    ].filter(d => d.value > 0);

    return (
      <Layout title="Tổng quan của bạn">
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<ClipboardList size={20}/>} label="Dự án của tôi" value={projects.length}
              sub={`${activeP} đang hoạt động`} onClick={() => navigate('/projects')} />
            <StatCard icon={<Wallet size={20}/>} label="Số dư ví" value={fmt(wallet?.balance)}
              sub={`Khóa: ${fmt(wallet?.lockedAmount)}`} onClick={() => navigate('/wallet')} />
            <StatCard icon={<ShoppingBag size={20}/>} label="Đơn hàng" value={orders.length}
              sub={`${pendingO} đang chờ`} onClick={() => navigate('/orders')} />
            <StatCard icon={<FileText size={20}/>} label="Hợp đồng" value={contracts.length}
              sub={`${activeC} đang thực hiện`} onClick={() => navigate('/contracts')} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Donut đơn hàng */}
            {orders.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-4">Trạng thái đơn hàng</h3>
                <DonutChart data={orderByStatus.length ? orderByStatus : [{ label: 'Chưa có', value: 1, color: '#e5e7eb' }]} size={160} />
              </div>
            )}

            {/* Project status bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:col-span-2">
              <h3 className="font-bold text-gray-900 mb-4">Tiến độ dự án</h3>
              <BarChart
                labels={['Nháp', 'Chờ duyệt', 'Đang mở', 'Thi công', 'Hoàn thành']}
                datasets={[{
                  label: 'Số dự án',
                  data: [
                    projects.filter(p => p.status === 'DRAFT').length,
                    projects.filter(p => p.approvalStatus === 'PENDING').length,
                    projects.filter(p => p.status === 'OPEN').length,
                    projects.filter(p => p.status === 'IN_PROGRESS').length,
                    projects.filter(p => p.status === 'COMPLETED').length,
                  ],
                  color: '#1a4f3a'
                }]}
                height={160}
              />
            </div>
          </div>

          <RecentProjectsAndNotifs projects={projects} notifications={notifications} role="CUSTOMER" />
        </div>
      </Layout>
    );
  }

  /* ── CONTRACTOR DASHBOARD ── */
  const activeC = contracts.filter(c => c.status === 'ACTIVE').length;
  const pendingC = contracts.filter(c => c.status === 'WAITING_SIGNATURE').length;
  const doneC   = contracts.filter(c => c.status === 'COMPLETED').length;
  const totalEarned = contracts
    .filter(c => c.status === 'COMPLETED')
    .reduce((s, c) => s + (c.agreedPrice || 0), 0);

  return (
    <Layout title="Bảng điều khiển nhà thầu">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Wallet size={20}/>} label="Số dư ví" value={fmt(wallet?.balance)}
            sub={`Khóa: ${fmt(wallet?.lockedAmount)}`} onClick={() => navigate('/wallet')} />
          <StatCard icon={<FileText size={20}/>} label="Hợp đồng active" value={activeC}
            sub={`${pendingC} chờ ký`} onClick={() => navigate('/contracts')} />
          <StatCard icon={<CheckCircle2 size={20}/>} label="Đã hoàn thành" value={doneC}
            sub="Hợp đồng" />
          <StatCard icon={<TrendingUp size={20}/>} label="Tổng đã nhận" value={fmt(wallet?.balance)}
            sub="Từ ví hiện tại" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4">Phân bổ hợp đồng</h3>
            <div className="flex justify-center">
              <DonutChart
                data={[
                  { label: 'Đang thi công', value: activeC, color: '#1a4f3a' },
                  { label: 'Chờ ký',        value: pendingC, color: '#3b82f6' },
                  { label: 'Hoàn thành',    value: doneC,    color: '#10b981' },
                  { label: 'Khác',          value: Math.max(0, contracts.length - activeC - pendingC - doneC), color: '#d1d5db' },
                ].filter(d => d.value > 0)}
                size={180}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-4">Hợp đồng gần đây</h3>
            {contracts.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">Chưa có hợp đồng nào</div>
            ) : (
              <div className="space-y-2">
                {contracts.slice(0, 5).map(c => (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800 line-clamp-1">{c.projectName}</p>
                      <p className="text-xs text-gray-400">{c.contractNumber}</p>
                    </div>
                    <span className={`badge text-[10px] ${
                      c.status === 'ACTIVE' ? 'badge-green'
                      : c.status === 'WAITING_SIGNATURE' ? 'badge-blue'
                      : c.status === 'COMPLETED' ? 'badge-blue'
                      : 'badge-gray'
                    }`}>{c.status === 'ACTIVE' ? 'Thi công' : c.status === 'WAITING_SIGNATURE' ? 'Chờ ký' : c.status === 'COMPLETED' ? 'Xong' : c.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <RecentProjectsAndNotifs projects={[]} notifications={notifications} role="CONTRACTOR" />
      </div>
    </Layout>
  );
}

/* ── Shared: Recent projects + Notifications ── */
function RecentProjectsAndNotifs({ projects, notifications, role }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm">
            {role === 'ADMIN' ? 'Dự án gần đây' : role === 'CONTRACTOR' ? 'Dự án mở' : 'Dự án của bạn'}
          </h3>
          <Link to={role === 'ADMIN' ? '/admin/projects' : '/projects'}
            className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
            Xem tất cả <ChevronRight size={13}/>
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {projects.slice(0, 5).length === 0 ? (
            <p className="p-6 text-center text-gray-400 text-sm">Chưa có dự án nào.</p>
          ) : projects.slice(0, 5).map(p => (
            <Link key={p.id} to={`/projects/${p.id}`}
              className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary-bg flex items-center justify-center text-xl shrink-0">🏗️</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                <p className="text-xs text-gray-400">{p.category || '—'} {p.area ? `· ${p.area}m²` : ''}</p>
              </div>
              <span className={`badge text-[10px] shrink-0 ${
                p.approvalStatus === 'PENDING' ? 'badge-amber'
                : p.status === 'OPEN' ? 'badge-blue'
                : p.status === 'IN_PROGRESS' ? 'badge-amber'
                : p.status === 'COMPLETED' ? 'badge-green' : 'badge-gray'
              }`}>
                {p.approvalStatus === 'PENDING' ? 'Chờ duyệt'
                  : p.status === 'OPEN' ? 'Đang mở'
                  : p.status === 'IN_PROGRESS' ? 'Thi công'
                  : p.status === 'COMPLETED' ? 'Xong' : p.status}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm">Thông báo gần đây</h3>
          <Link to="/notifications" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
            Xem tất cả <ChevronRight size={13}/>
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {notifications.slice(0, 5).length === 0 ? (
            <p className="p-6 text-center text-gray-400 text-sm">Không có thông báo mới.</p>
          ) : notifications.slice(0, 5).map(n => (
            <div key={n.id} className="flex gap-3 px-5 py-3">
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm ${
                n.type === 'BID_RECEIVED' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
              }`}>
                <MessageSquare size={15}/>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-700 leading-snug">{n.content}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
