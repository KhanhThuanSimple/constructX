import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Wallet, 
  Bell, 
  MessageCircle, 
  History, 
  LogOut, 
  Construction,
  Image,
  Shield,
  User as UserIcon,
  Camera
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const Sidebar = () => {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const customerNav = [
    { id: 'home', label: 'Trang chủ', icon: <Construction size={20} />, path: '/' },
    { id: 'dashboard', label: 'Tổng quan', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { id: 'create-project', label: 'Tạo dự án', icon: <PlusCircle size={20} />, path: '/projects/new' },
    { id: 'projects', label: 'Dự án của tôi', icon: <Construction size={20} />, path: '/projects' },
    { id: 'wallet', label: 'Ví & Thanh toán', icon: <Wallet size={20} />, path: '/wallet' },
    { id: 'notifications', label: 'Thông báo', icon: <Bell size={20} />, path: '/notifications' },
    { id: 'profile', label: 'Cài đặt tài khoản', icon: <UserIcon size={20} />, path: '/profile' },
  ];

  const contractorNav = [
    { id: 'home', label: 'Trang chủ', icon: <Construction size={20} />, path: '/' },
    { id: 'dashboard', label: 'Bảng điều khiển', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { id: 'marketplace', label: 'Tìm việc mới', icon: <PlusCircle size={20} />, path: '/projects/browse' },
    { id: 'my-bids', label: 'Đấu thầu của tôi', icon: <History size={20} />, path: '/bids' },
    { id: 'production-log', label: 'Nhật ký thi công', icon: <Camera size={20} />, path: '/production-log' },
    { id: 'portfolio', label: 'Hồ sơ năng lực', icon: <Image size={20} />, path: '/portfolio' },
    { id: 'wallet', label: 'Ví & Thu nhập', icon: <Wallet size={20} />, path: '/wallet' },
    { id: 'profile', label: 'Cài đặt tài khoản', icon: <UserIcon size={20} />, path: '/profile' },
  ];

  const adminNav = [
    { id: 'admin-dashboard', label: 'Quản trị hệ thống', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { id: 'user-management', label: 'Quản lý người dùng', icon: <UserIcon size={20} />, path: '/admin/users' },
    { id: 'disputes', label: 'Tranh chấp', icon: <Shield size={20} />, path: '/admin/disputes' },
    { id: 'profile', label: 'Cài đặt tài khoản', icon: <UserIcon size={20} />, path: '/profile' },
  ];

  const navItems = user?.role === 'ADMIN' ? adminNav : (user?.role === 'CONTRACTOR' ? contractorNav : customerNav);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-[#1a4f3a] text-white flex flex-col h-screen shrink-0">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold tracking-tight font-display">ConstructX</h1>
        <p className="text-[10px] uppercase tracking-widest text-white/50 mt-1">Sàn thi công nội thất</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <p className="text-[10px] uppercase tracking-widest text-white/30 px-3 py-2">
          {user?.role === 'ADMIN' ? 'Quản trị viên' : (user?.role === 'CONTRACTOR' ? 'Nhà thầu' : 'Khách hàng')}
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                isActive ? 'bg-white/15 text-white font-medium' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 group relative">
          <Link to="/profile" className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-white/30 transition-colors">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate group-hover:text-white transition-colors">{user?.fullName || 'Người dùng'}</p>
              <p className="text-[10px] text-white/50 truncate">
                {user?.role === 'CUSTOMER' ? 'Khách hàng' : user?.role === 'CONTRACTOR' ? 'Nhà thầu' : 'Quản trị viên'}
              </p>
            </div>
          </Link>
          <button onClick={handleLogout} className="text-white/40 hover:text-white transition-colors ml-2">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Topbar = ({ title }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  return (
    <div className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between sticky top-0 z-10">
      <h2 className="text-lg font-semibold text-gray-800 font-display">{title}</h2>
      <div className="flex items-center gap-4">
        {user?.role === 'CUSTOMER' && (
          <button className="btn btn-primary text-xs py-1.5 px-4" onClick={() => navigate('/projects/new')}>
            + Tạo dự án
          </button>
        )}
      </div>
    </div>
  );
};

const Layout = ({ children, title }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50 overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
