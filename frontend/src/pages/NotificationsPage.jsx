import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import {
  Bell,
  CheckCheck,
  Search,
  CreditCard,
  FileText,
  AlertTriangle,
  MessageSquare,
  Settings,
  CheckCircle2
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'unread', label: 'Chưa đọc' },
  { value: 'SYSTEM', label: 'Hệ thống' },
  { value: 'PAYMENT_SUCCESS', label: 'Thanh toán' },
  { value: 'DISPUTE', label: 'Tranh chấp' },
];

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);

    try {
      const [notificationsRes, unreadRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/notifications/unread-count'),
      ]);

      setNotifications(notificationsRes.data.data || []);
      setUnreadCount(unreadRes.data.data || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error(error.response?.data?.message || 'Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
        }))
      );

      setUnreadCount(0);
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      toast.error(error.response?.data?.message || 'Không thể cập nhật thông báo');
    }
  };

  const isUnread = (notification) => {
    return notification.isRead === false;
  };

  const filteredNotifications = useMemo(() => {
    let result = notifications || [];

    if (filter === 'unread') {
      result = result.filter((item) => isUnread(item));
    } else if (filter !== 'all') {
      result = result.filter((item) => item.type === filter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();

      result = result.filter((item) =>
        item.content?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [notifications, filter, searchTerm]);

  const getNotificationMeta = (type) => {
    switch (type) {
      case 'PAYMENT_SUCCESS':
        return {
          icon: <CreditCard size={18} />,
          bg: 'bg-green-50',
          text: 'text-green-700',
          label: 'Thanh toán',
        };

      case 'PAYMENT_FAILED':
        return {
          icon: <AlertTriangle size={18} />,
          bg: 'bg-red-50',
          text: 'text-red-700',
          label: 'Thanh toán lỗi',
        };

      case 'DISPUTE':
        return {
          icon: <AlertTriangle size={18} />,
          bg: 'bg-red-50',
          text: 'text-red-700',
          label: 'Tranh chấp',
        };

      case 'BID_RECEIVED':
        return {
          icon: <FileText size={18} />,
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          label: 'Báo giá',
        };

      case 'DESIGN_UPDATED':
        return {
          icon: <MessageSquare size={18} />,
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          label: 'Thiết kế',
        };

      case 'MILESTONE_REQUEST':
        return {
          icon: <CheckCircle2 size={18} />,
          bg: 'bg-yellow-50',
          text: 'text-yellow-700',
          label: 'Tiến độ',
        };

      default:
        return {
          icon: <Settings size={18} />,
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          label: 'Hệ thống',
        };
    }
  };

  const formatTime = (createdAt) => {
    if (!createdAt) return '';

    return new Date(createdAt).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Layout title="Thông báo">
        <div className="text-center py-12">Đang tải...</div>
      </Layout>
    );
  }

  return (
    <Layout title="Thông báo">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-gray-500">Tổng thông báo</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {notifications.length}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-gray-500">Chưa đọc</p>
            <p className="text-3xl font-bold text-[#1a4f3a] mt-2">
              {unreadCount}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Thao tác nhanh</p>
              <p className="text-base font-semibold text-gray-900 mt-2">
                Đánh dấu đã đọc
              </p>
            </div>

            <button
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className="px-4 py-2 rounded-lg bg-[#1a4f3a] text-white hover:bg-[#2d7a5a] disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <CheckCheck size={18} />
              Đã đọc
            </button>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
          <div className="relative w-full xl:w-96">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />

            <input
              type="text"
              placeholder="Tìm kiếm thông báo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => (
              <button
                key={item.value}
                onClick={() => setFilter(item.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  filter === item.value
                    ? 'bg-[#1a4f3a] text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="py-16 text-center">
              <Bell className="mx-auto text-gray-300 mb-3" size={42} />
              <p className="text-gray-500">
                Không có thông báo phù hợp.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const meta = getNotificationMeta(notification.type);
              const unread = isUnread(notification);

              return (
                <div
                  key={notification.id}
                  className={`p-5 border-b border-gray-100 last:border-b-0 flex gap-4 ${
                    unread ? 'bg-[#f4fbf7]' : 'bg-white'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${meta.bg} ${meta.text}`}
                  >
                    {meta.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${meta.bg} ${meta.text}`}
                      >
                        {meta.label}
                      </span>

                      {unread && (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[#1a4f3a] text-white">
                          Mới
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-800 leading-relaxed">
                      {notification.content}
                    </p>

                    <p className="text-xs text-gray-400 mt-2">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NotificationsPage;