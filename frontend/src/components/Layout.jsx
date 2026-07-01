import React from 'react';
import { NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, Wallet, Bell, MessageCircle,
  History, LogOut, Construction, Image, Shield, User as UserIcon,
  Camera, Settings, ClipboardCheck, FileText, ShoppingBag,
  Package, Ruler, ShoppingCart, Gavel, Users, AlertCircle, CheckCircle,
  FolderOpen, Star
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { ChatFloatingButton } from './chat/ChatFloatingButton';

const Sidebar = () => {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  // Nav dạng nhóm: mỗi phần tử có { group, items[] }
  const customerNavGroups = [
    {
      group: 'Khám phá & Lên ý tưởng',
      items: [
        { id: 'home',     label: 'Trang chủ',         icon: <Construction size={20} />, path: '/' },
        { id: 'shop',     label: 'Cửa hàng nội thất', icon: <ShoppingBag size={20} />,  path: '/shop' },
        { id: 'designer', label: 'Thiết kế 2D',       icon: <Ruler size={20} />,        path: '/shop/designer' },
      ],
    },
    {
      group: 'Quản lý Thi công',
      items: [
        { id: 'orders',    label: 'Đơn hàng & Dự án',        icon: <FolderOpen size={20} />, path: '/orders' },
        { id: 'contracts', label: 'Hợp đồng & Thi công',     icon: <FileText size={20} />,  path: '/contracts' },
        { id: 'reviews',   label: 'Nghiệm thu & Đánh giá',   icon: <Star size={20} />,      path: '/reviews' },
      ],
    },
    {
      group: 'Tương tác & Cá nhân',
      items: [
        { id: 'chat',          label: 'Tin nhắn',          icon: <MessageCircle size={20} />, path: '/chat' },
        { id: 'notifications', label: 'Thông báo',         icon: <Bell size={20} />,          path: '/notifications' },
        { id: 'wallet',        label: 'Ví & Thanh toán',   icon: <Wallet size={20} />,        path: '/wallet' },
        { id: 'profile',       label: 'Cài đặt tài khoản', icon: <UserIcon size={20} />,      path: '/profile' },
      ],
    },
  ];

  const contractorNavGroups = [
    {
      group: 'Tổng quan',
      items: [
        { id: 'overview', label: 'Tổng quan', icon: <LayoutDashboard size={20} />, path: '/' },
      ],
    },
    {
      group: 'Công việc & Dự án',
      items: [
        { id: 'order-bidding',     label: 'Đấu thầu & Tìm việc',      icon: <Gavel size={20} />,      path: '/order-bidding' },
        { id: 'contractor-progress', label: 'Báo cáo tiến độ',         icon: <Camera size={20} />,     path: '/contractor/progress' },
        { id: 'contracts',           label: 'Hợp đồng',                icon: <FileText size={20} />,   path: '/contracts' },
        { id: 'reviews',             label: 'Nghiệm thu & Đánh giá',   icon: <Star size={20} />,       path: '/reviews' },
      ],
    },
    {
      group: 'Quản lý',
      items: [
        { id: 'portfolio', label: 'Hồ sơ năng lực', icon: <Image size={20} />,  path: '/portfolio' },
        { id: 'wallet',    label: 'Ví & Thu nhập',   icon: <Wallet size={20} />, path: '/wallet' },
      ],
    },
    {
      group: 'Cá nhân',
      items: [
        { id: 'chat',    label: 'Tin nhắn',          icon: <MessageCircle size={20} />, path: '/chat' },
        { id: 'profile', label: 'Cài đặt tài khoản', icon: <UserIcon size={20} />,      path: '/profile' },
      ],
    },
  ];

  const adminNavGroups = [
    {
      group: 'Tổng quan & Báo cáo',
      items: [
        { id: 'admin-overview',  label: 'Tổng quan hệ thống', icon: <LayoutDashboard size={20} />, path: '/admin/overview' },
      ],
    },
    {
      group: 'Quản lý Kinh doanh & Vận hành',
      items: [
        { id: 'admin-projects',  label: 'Duyệt dự án',       icon: <ClipboardCheck size={20} />, path: '/admin/projects' },
        { id: 'admin-contracts', label: 'Quản lý hợp đồng',  icon: <FileText size={20} />,       path: '/admin/contracts' },
        { id: 'admin-orders',    label: 'Quản lý đơn hàng',  icon: <ShoppingCart size={20} />,   path: '/admin/orders' },
        { id: 'admin-products',  label: 'Sản phẩm Shop',     icon: <Package size={20} />,        path: '/admin/products' },
      ],
    },
    {
      group: 'Quản lý Người dùng & Đối tác',
      items: [
        { id: 'all-users',       label: 'Quản lý người dùng và đối tác', icon: <Users size={20} />,    path: '/admin/all-users' },
      ],
    },
    {
      group: 'Hỗ trợ & Kiểm soát',
      items: [
        { id: 'disputes',     label: 'Tranh chấp',    icon: <Shield size={20} />,        path: '/admin/disputes' },
        { id: 'allowances',   label: 'Duyệt tiền',    icon: <Wallet size={20} />,        path: '/admin/AdminWithdrawalsPage' },
        { id: 'platform-wallet', label: 'Ví nền tảng', icon: <Wallet size={20} />,       path: '/admin/platform-wallet' },
        { id: 'chat-monitor', label: 'Giám sát chat', icon: <MessageCircle size={20} />, path: '/admin/chat' },
      ],
    },
    {
      group: 'Cài đặt & Hệ thống',
      items: [
        { id: 'settings',      label: 'Cấu hình hệ thống',  icon: <Settings size={20} />,  path: '/admin/settings' },
        { id: 'notifications', label: 'Thông báo',          icon: <Bell size={20} />,      path: '/notifications' },
        { id: 'profile',       label: 'Cài đặt tài khoản',  icon: <UserIcon size={20} />,  path: '/profile' },
      ],
    },
  ];

  const navGroups =
    user?.role === 'ADMIN'
      ? adminNavGroups
      : user?.role === 'CONTRACTOR'
        ? contractorNavGroups
        : customerNavGroups;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-[#1a4f3a] text-white flex flex-col h-screen shrink-0">
     <Link
  to="/shop"
  className="block p-6 border-b border-white/10 hover:bg-white/5 transition-colors"
>
  <h1 className="text-xl font-bold tracking-tight font-display">
    ConstructX
  </h1>
  <p className="text-[10px] uppercase tracking-widest text-white/50 mt-1">
    Sàn thi công nội thất
  </p>
</Link>

      <nav className="flex-1 overflow-y-auto p-4 space-y-4">
        <p className="text-[10px] uppercase tracking-widest text-white/30 px-3 py-1">
          {user?.role === 'ADMIN'
            ? 'Quản trị viên'
            : user?.role === 'CONTRACTOR'
              ? 'Nhà thầu'
              : 'Khách hàng'}
        </p>

        {navGroups.map((section) => (
          <div key={section.group}>
            <p className="text-[9px] uppercase tracking-widest text-white/25 px-3 pt-2 pb-1 font-semibold">
              {section.group}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? 'bg-white/15 text-white font-medium'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 group relative">
          <Link to="/profile" className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-white/30 transition-colors">
              {user?.fullName?.charAt(0) || 'U'}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate group-hover:text-white transition-colors">
                {user?.fullName || 'Người dùng'}
              </p>
              <p className="text-[10px] text-white/50 truncate">
                {user?.role === 'CUSTOMER'
                  ? 'Khách hàng'
                  : user?.role === 'CONTRACTOR'
                    ? 'Nhà thầu'
                    : 'Quản trị viên'}
              </p>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="text-white/40 hover:text-white transition-colors ml-2"
          >
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
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    let interval;
    const fetchUnread = async () => {
      try {
        const res = await import('../services/api').then(m => m.default.get('/notifications/unread-count'));
        setUnreadCount(res.data?.data || 0);
      } catch { /* silent */ }
    };
    fetchUnread();
    interval = setInterval(fetchUnread, 30000); // poll mỗi 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between sticky top-0 z-10">
      <h2 className="text-lg font-semibold text-gray-800 font-display">{title}</h2>

      <div className="flex items-center gap-3">
        {user?.role === 'CUSTOMER' && (
          <button
            className="btn btn-primary text-xs py-1.5 px-4"
            onClick={() => navigate('/projects/new')}
          >
            + Tạo dự án
          </button>
        )}

        {user?.role === 'ADMIN' && (
          <button
            className="btn btn-primary text-xs py-1.5 px-4"
            onClick={() => navigate('/admin/settings')}
          >
            Cấu hình
          </button>
        )}

        {/* Bell icon với unread badge */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800"
          title="Thông báo"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

const Layout = ({ children, title }) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const isOnChatPage = location.pathname.startsWith('/chat');

  const showPendingBanner = user?.role === 'CONTRACTOR' && user?.approvalStatus === 'PENDING';
  const showRejectedBanner = user?.role === 'CONTRACTOR' && user?.approvalStatus === 'REJECTED';

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 bg-gray-50 overflow-hidden">
        <Topbar title={title} />

        {/* Banner trạng thái tài khoản contractor */}
        {showPendingBanner && (
          <div className="flex items-center gap-3 bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-sm text-amber-800">
            <AlertCircle size={16} className="shrink-0 text-amber-500"/>
            <span>
              <strong>Tài khoản đang chờ phê duyệt.</strong> Bạn có thể xem dự án và chuẩn bị hồ sơ, nhưng chưa thể gửi báo giá cho đến khi Admin duyệt.
            </span>
          </div>
        )}
        {showRejectedBanner && (
          <div className="flex items-center gap-3 bg-red-50 border-b border-red-200 px-6 py-2.5 text-sm text-red-700">
            <AlertCircle size={16} className="shrink-0 text-red-500"/>
            <span>
              <strong>Tài khoản đã bị từ chối.</strong> Vui lòng liên hệ Admin qua chat để được hỗ trợ.
            </span>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-6 min-h-0">
          {children}
        </main>
      </div>

      {/* Floating AI Chatbot — ẩn khi đang ở trang Chat để tránh trùng */}
      {!isOnChatPage && <ChatFloatingButton />}
    </div>
  );
};

export default Layout;