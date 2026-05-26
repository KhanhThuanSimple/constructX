import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  TrendingUp,
  Wallet,
  ClipboardList,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  Users,
  AlertTriangle
} from 'lucide-react';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import { Link } from 'react-router-dom';

const StatCard = ({ icon, label, value, change, changeType }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-lg bg-gray-50 text-gray-600">
        {icon}
      </div>

      <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">
        {label}
      </span>
    </div>

    <div className="flex items-end justify-between">
      <h3 className="text-2xl font-bold font-display">
        {value}
      </h3>

      {change && (
        <span
          className={`text-xs font-medium ${
            changeType === 'up' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {change}
        </span>
      )}
    </div>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuthStore();

  const [projects, setProjects] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);

    try {
      if (user?.role === 'ADMIN') {
        const [statsRes, notifRes] = await Promise.all([
          api.get('/admin/dashboard/stats'),
          api.get('/notifications'),
        ]);

        setDashboardStats(statsRes.data.data);
        setNotifications(notifRes.data.data || []);
      } else {
        const [projRes, walletRes, notifRes] = await Promise.all([
          api.get('/projects/my'),
          api.get('/wallet'),
          api.get('/notifications'),
        ]);

        setProjects(projRes.data.data || []);
        setWallet(walletRes.data.data);
        setNotifications(notifRes.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0đ';

    if (amount >= 1000000000) {
      return (amount / 1000000000).toFixed(1) + ' tỷ';
    }

    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'tr';
    }

    return amount.toLocaleString('vi-VN') + 'đ';
  };

  const getProjectStatusLabel = (project) => {
    if (project.approvalStatus === 'PENDING') return 'Chờ duyệt';
    if (project.approvalStatus === 'REJECTED') return 'Từ chối';

    if (project.status === 'OPEN') return 'Đang mở thầu';
    if (project.status === 'IN_PROGRESS') return 'Đang thi công';
    if (project.status === 'COMPLETED') return 'Hoàn thành';
    if (project.status === 'CANCELLED') return 'Đã hủy';

    return project.status || 'Không rõ';
  };

  const getProjectBadge = (project) => {
    if (project.approvalStatus === 'PENDING') return 'badge-amber';
    if (project.approvalStatus === 'REJECTED') return 'badge-red';

    if (project.status === 'OPEN') return 'badge-blue';
    if (project.status === 'IN_PROGRESS') return 'badge-amber';
    if (project.status === 'COMPLETED') return 'badge-green';

    return 'badge-gray';
  };

  const activeProjectsCount = projects.filter(
    (project) => project.status === 'OPEN' || project.status === 'IN_PROGRESS'
  ).length;

  const completedProjectsCount = projects.filter(
    (project) => project.status === 'COMPLETED'
  ).length;

  const newProjectsCount = projects.length;

  const adminProjects = dashboardStats?.myProjects || [];

  if (loading) {
    return (
      <Layout title="Tổng quan">
        <div>Đang tải dữ liệu...</div>
      </Layout>
    );
  }

  return (
    <Layout title={user?.role === 'ADMIN' ? 'Tổng quan hệ thống' : 'Tổng quan'}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {user?.role === 'CONTRACTOR' ? (
          <>
            <StatCard
              icon={<TrendingUp size={20} />}
              label="Dự án đang thầu"
              value={activeProjectsCount}
            />

            <StatCard
              icon={<Wallet size={20} />}
              label="Thu nhập thực tế"
              value={formatCurrency(wallet?.balance || 0)}
            />

            <StatCard
              icon={<ClipboardList size={20} />}
              label="Chờ giải ngân"
              value={formatCurrency(wallet?.lockedAmount || 0)}
              change="Từ escrow"
              changeType="up"
            />

            <StatCard
              icon={<CheckCircle2 size={20} />}
              label="Dự án hoàn thành"
              value={completedProjectsCount}
            />
          </>
        ) : user?.role === 'ADMIN' ? (
          <>
            <StatCard
              icon={<TrendingUp size={20} />}
              label="Tổng dự án"
              value={dashboardStats?.newProjectsCount ?? 0}
              change={`${dashboardStats?.pendingProjects ?? 0} chờ duyệt`}
              changeType="up"
            />

            <StatCard
              icon={<Users size={20} />}
              label="Nhà thầu active"
              value={dashboardStats?.activeContractors ?? 0}
              change={`${dashboardStats?.pendingPartners ?? 0} chờ duyệt`}
              changeType="up"
            />

            <StatCard
              icon={<Wallet size={20} />}
              label="Dòng tiền thành công"
              value={formatCurrency(dashboardStats?.totalRevenue || 0)}
            />

            <StatCard
              icon={<AlertTriangle size={20} />}
              label="Escrow / Tranh chấp"
              value={formatCurrency(dashboardStats?.totalEscrow || 0)}
              change={`${dashboardStats?.openDisputes ?? 0} vụ`}
              changeType="down"
            />
          </>
        ) : (
          <>
            <StatCard
              icon={<TrendingUp size={20} />}
              label="Dự án của tôi"
              value={newProjectsCount}
            />

            <StatCard
              icon={<Wallet size={20} />}
              label="Số dư ví"
              value={formatCurrency(wallet?.balance || 0)}
              change={`Khóa: ${formatCurrency(wallet?.lockedAmount || 0)}`}
              changeType="up"
            />

            <StatCard
              icon={<ClipboardList size={20} />}
              label="Báo giá nhận được"
              value="0"
              change="Chờ duyệt"
              changeType="up"
            />

            <StatCard
              icon={<CheckCircle2 size={20} />}
              label="Dự án hoàn thành"
              value={completedProjectsCount}
            />
          </>
        )}
      </div>

      {user?.role === 'ADMIN' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            to="/admin/projects"
            className="rounded-xl border border-yellow-100 bg-yellow-50 p-5 hover:shadow-md transition"
          >
            <p className="text-sm text-yellow-700 font-medium">
              Cần duyệt dự án
            </p>

            <p className="text-3xl font-bold text-yellow-800 mt-2">
              {dashboardStats?.pendingProjects ?? 0}
            </p>

            <p className="text-xs text-yellow-700 mt-2">
              Mở trang phê duyệt dự án →
            </p>
          </Link>

          <Link
            to="/admin/users"
            className="rounded-xl border border-green-100 bg-green-50 p-5 hover:shadow-md transition"
          >
            <p className="text-sm text-green-700 font-medium">
              Cần duyệt đối tác
            </p>

            <p className="text-3xl font-bold text-green-800 mt-2">
              {dashboardStats?.pendingPartners ?? 0}
            </p>

            <p className="text-xs text-green-700 mt-2">
              Mở trang phê duyệt đối tác →
            </p>
          </Link>

          <Link
            to="/admin/disputes"
            className="rounded-xl border border-red-100 bg-red-50 p-5 hover:shadow-md transition"
          >
            <p className="text-sm text-red-700 font-medium">
              Tranh chấp mở
            </p>

            <p className="text-3xl font-bold text-red-800 mt-2">
              {dashboardStats?.openDisputes ?? 0}
            </p>

            <p className="text-xs text-red-700 mt-2">
              Mở trung tâm tranh chấp →
            </p>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold font-display text-sm">
              {user?.role === 'ADMIN'
                ? 'Dự án gần đây'
                : user?.role === 'CONTRACTOR'
                  ? 'Công việc của bạn'
                  : 'Dự án của bạn'}
            </h3>

            <Link
              to={user?.role === 'ADMIN' ? '/admin/projects' : '/projects'}
              className="text-xs font-medium text-[#1a4f3a] hover:underline flex items-center gap-1"
            >
              Xem tất cả <ChevronRight size={14} />
            </Link>
          </div>

          <div className="p-2">
            {(user?.role === 'ADMIN' ? adminProjects.length : projects.length) === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                Chưa có dự án nào.
              </div>
            ) : (
              (user?.role === 'ADMIN' ? adminProjects : projects)
                .slice(0, 5)
                .map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0"
                  >
                    <div className="w-12 h-12 rounded-lg bg-[#e8f5ee] flex items-center justify-center text-2xl shrink-0">
                      🏗️
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-bold truncate">
                          {project.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`badge ${getProjectBadge(project)} text-[10px]`}>
                          {getProjectStatusLabel(project)}
                        </span>

                        <span className="text-[10px] text-gray-400">
                          {user?.role === 'ADMIN'
                            ? `${project.customerName || 'Khách hàng'} • `
                            : ''}
                          {project.category || 'Chưa phân loại'}
                          {project.area ? ` • ${project.area}m²` : ''}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold font-display text-sm">
              Thông báo gần đây
            </h3>

            <Link
              to="/notifications"
              className="text-xs font-medium text-[#1a4f3a] hover:underline flex items-center gap-1"
            >
              Xem tất cả <ChevronRight size={14} />
            </Link>
          </div>

          <div className="p-4 space-y-4">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">
                Không có thông báo mới.
              </div>
            ) : (
              notifications.slice(0, 5).map((notif) => (
                <div key={notif.id} className="flex gap-4">
                  <div
                    className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-sm ${
                      notif.type === 'BID_RECEIVED'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    <MessageSquare size={18} />
                  </div>

                  <div>
                    <p className="text-sm text-gray-700 leading-snug">
                      {notif.content}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      {notif.createdAt
                        ? new Date(notif.createdAt).toLocaleTimeString('vi-VN')
                        : ''}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;