import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  TrendingUp, 
  Wallet, 
  ClipboardList, 
  CheckCircle2, 
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';

const StatCard = ({ icon, label, value, change, changeType }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-lg bg-gray-50 text-gray-600">
        {icon}
      </div>
      <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">{label}</span>
    </div>
    <div className="flex items-end justify-between">
      <h3 className="text-2xl font-bold font-display">{value}</h3>
      {change && (
        <span className={`text-xs font-medium ${changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </span>
      )}
    </div>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [projRes, walletRes, notifRes] = await Promise.all([
        api.get('/projects/my'),
        api.get('/wallet'),
        api.get('/notifications')
      ]);
      setProjects(projRes.data.data);
      setWallet(walletRes.data.data);
      setNotifications(notifRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0đ';
    if (amount >= 1000000) return (amount / 1000000).toFixed(1) + 'tr';
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  const activeProjectsCount = projects.filter(p => p.status === 'OPEN' || p.status === 'IN_PROGRESS').length;
  const completedProjectsCount = projects.filter(p => p.status === 'COMPLETED').length;

  if (loading) return <Layout title="Tổng quan"><div>Đang tải dữ liệu...</div></Layout>;

  return (
    <Layout title="Tổng quan">
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
              change="Từ 2 dự án" 
              changeType="up" 
            />
            <StatCard 
              icon={<CheckCircle2 size={20} />} 
              label="Dự án hoàn thành" 
              value={completedProjectsCount} 
            />
          </>
        ) : (
          <>
            <StatCard 
              icon={<TrendingUp size={20} />} 
              label="Dự án đang chạy" 
              value={activeProjectsCount} 
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold font-display text-sm">
              {user?.role === 'CONTRACTOR' ? "Công việc của bạn" : "Dự án của bạn"}
            </h3>
            <button className="text-xs font-medium text-[#1a4f3a] hover:underline flex items-center gap-1">
              Xem tất cả <ChevronRight size={14} />
            </button>
          </div>
          <div className="p-2">
            {projects.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">Bạn chưa có dự án nào.</div>
            ) : (
              projects.slice(0, 4).map((project) => (
                <div key={project.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
                  <div className="w-12 h-12 rounded-lg bg-[#e8f5ee] flex items-center justify-center text-2xl shrink-0">
                    🏗️
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-bold truncate">{project.name}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${
                        project.status === 'OPEN' ? 'badge-blue' : 
                        project.status === 'IN_PROGRESS' ? 'badge-amber' : 
                        project.status === 'COMPLETED' ? 'badge-green' : 'badge-gray'
                      } text-[10px]`}>
                        {project.status}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {project.category} • {project.area}m²
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold font-display text-sm">Thông báo gần đây</h3>
            <button className="text-xs font-medium text-[#1a4f3a] hover:underline flex items-center gap-1">
              Xem tất cả <ChevronRight size={14} />
            </button>
          </div>
          <div className="p-4 space-y-4">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">Không có thông báo mới.</div>
            ) : (
              notifications.slice(0, 5).map((notif) => (
                <div key={notif.id} className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-sm ${
                    notif.type === 'BID_RECEIVED' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 leading-snug">{notif.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notif.createdAt).toLocaleTimeString('vi-VN')}
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
