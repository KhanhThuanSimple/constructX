import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  Search, Users, Shield, UserCheck, UserX, Ban, RefreshCw,
  ChevronDown, ChevronUp, User as UserIcon, Gavel
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const ROLE_CFG = {
  CUSTOMER:   { label: 'Khách hàng',   cls: 'bg-blue-100 text-blue-700' },
  CONTRACTOR: { label: 'Nhà thầu',     cls: 'bg-green-100 text-green-700' },
  ADMIN:      { label: 'Admin',         cls: 'bg-purple-100 text-purple-700' },
};

const STATUS_CFG = {
  APPROVED: { label: 'Đã duyệt',  cls: 'bg-green-100 text-green-700' },
  PENDING:  { label: 'Chờ duyệt', cls: 'bg-amber-100 text-amber-700' },
  REJECTED: { label: 'Từ chối',   cls: 'bg-red-100 text-red-600' },
};

export default function AdminAllUsersPage() {
  const [users, setUsers]       = useState([]);
  const [stats, setStats]       = useState({});
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [processing, setProcessing] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); // { user, action }

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/users?role=${roleFilter}`);
      setUsers(res.data.data || []);
    } catch { toast.error('Không thể tải danh sách người dùng'); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/users/stats');
      setStats(res.data.data || {});
    } catch {}
  };

  const handleBan = async (userId) => {
    setProcessing(userId);
    try {
      await api.post(`/admin/users/${userId}/ban`);
      toast.success('Đã khóa tài khoản');
      fetchUsers(); fetchStats();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi khóa tài khoản'); }
    finally { setProcessing(null); setConfirmModal(null); }
  };

  const handleUnban = async (userId) => {
    setProcessing(userId);
    try {
      await api.post(`/admin/users/${userId}/unban`);
      toast.success('Đã mở khóa tài khoản');
      fetchUsers(); fetchStats();
    } catch (e) { toast.error(e.response?.data?.message || 'Lỗi mở khóa'); }
    finally { setProcessing(null); setConfirmModal(null); }
  };

  const filtered = users.filter(u =>
    !search ||
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phoneNumber?.includes(search)
  );

  return (
    <Layout title="Quản lý người dùng">
      <div className="space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.totalCustomers ?? '—'}</p>
            <p className="text-xs text-gray-500 mt-0.5">Khách hàng</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.totalContractors ?? '—'}</p>
            <p className="text-xs text-gray-500 mt-0.5">Nhà thầu</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{stats.pendingContractors ?? '—'}</p>
            <p className="text-xs text-gray-500 mt-0.5">Chờ duyệt</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.bannedUsers ?? '—'}</p>
            <p className="text-xs text-gray-500 mt-0.5">Bị khóa</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={15}/>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm tên, email, SĐT..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary"/>
          </div>
          <div className="flex gap-2">
            {[
              { key: 'all',        label: 'Tất cả' },
              { key: 'CUSTOMER',   label: 'Khách hàng' },
              { key: 'CONTRACTOR', label: 'Nhà thầu' },
            ].map(r => (
              <button key={r.key} onClick={() => setRoleFilter(r.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  roleFilter === r.key ? 'bg-primary text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>
                {r.label}
              </button>
            ))}
          </div>
          <button onClick={() => { fetchUsers(); fetchStats(); }}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500">
            <RefreshCw size={16}/>
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Đang tải...</div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Người dùng</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Role</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Trạng thái</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Đăng ký</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-600">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-400">Không tìm thấy người dùng</td></tr>
                  ) : filtered.map(u => {
                    const roleCfg = ROLE_CFG[u.role] || { label: u.role, cls: 'bg-gray-100 text-gray-600' };
                    const approvalCfg = STATUS_CFG[u.approvalStatus];
                    const isBanned = !u.active;
                    return (
                      <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${isBanned ? 'opacity-60' : ''}`}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                              isBanned ? 'bg-red-100 text-red-500' : 'bg-primary-bg text-primary'
                            }`}>
                              {u.fullName?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{u.fullName || '—'}</p>
                              <p className="text-xs text-gray-400">{u.phoneNumber || 'Chưa có SĐT'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 text-xs">{u.email}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${roleCfg.cls}`}>
                            {u.role === 'CONTRACTOR' ? <Gavel size={10}/> : u.role === 'ADMIN' ? <Shield size={10}/> : <UserIcon size={10}/>}
                            {roleCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col gap-1">
                            {isBanned ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600">
                                <Ban size={10}/> Bị khóa
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-600">
                                <UserCheck size={10}/> Hoạt động
                              </span>
                            )}
                            {u.role === 'CONTRACTOR' && approvalCfg && (
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${approvalCfg.cls}`}>
                                {approvalCfg.label}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-400">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—'}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {u.role !== 'ADMIN' && (
                            isBanned ? (
                              <button
                                onClick={() => setConfirmModal({ user: u, action: 'unban' })}
                                disabled={processing === u.id}
                                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 disabled:opacity-50">
                                <UserCheck size={13}/> Mở khóa
                              </button>
                            ) : (
                              <button
                                onClick={() => setConfirmModal({ user: u, action: 'ban' })}
                                disabled={processing === u.id}
                                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-50">
                                <Ban size={13}/> Khóa tài khoản
                              </button>
                            )
                          )}
                          {u.role === 'ADMIN' && (
                            <span className="text-xs text-gray-400 italic">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Confirm modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
              confirmModal.action === 'ban' ? 'bg-red-50' : 'bg-green-50'
            }`}>
              {confirmModal.action === 'ban'
                ? <Ban size={24} className="text-red-500"/>
                : <UserCheck size={24} className="text-green-500"/>}
            </div>
            <h3 className="font-bold text-gray-900 text-center mb-1">
              {confirmModal.action === 'ban' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
            </h3>
            <p className="text-sm text-gray-500 text-center mb-5">
              {confirmModal.action === 'ban'
                ? `Khóa tài khoản của "${confirmModal.user.fullName}"? Người dùng sẽ không thể đăng nhập.`
                : `Mở khóa tài khoản của "${confirmModal.user.fullName}"?`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">
                Hủy
              </button>
              <button
                onClick={() => confirmModal.action === 'ban'
                  ? handleBan(confirmModal.user.id)
                  : handleUnban(confirmModal.user.id)}
                disabled={processing === confirmModal.user.id}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60 ${
                  confirmModal.action === 'ban' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'
                }`}>
                {processing === confirmModal.user.id ? 'Đang xử lý...'
                  : confirmModal.action === 'ban' ? 'Khóa' : 'Mở khóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
