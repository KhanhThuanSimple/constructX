import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  Search, Users, Shield, UserCheck, UserX, Ban, RefreshCw,
  User as UserIcon, Gavel, CheckCircle2, XCircle, Filter
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
  const [activeTab, setActiveTab] = useState('all-users'); // 'all-users' | 'approve-partners'

  // --- State for Tab 1: All Users ---
  const [users, setUsers]       = useState([]);
  const [stats, setStats]       = useState({});
  const [loadingUsers, setLoadingUsers]   = useState(true);
  const [searchUsers, setSearchUsers]     = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [processingUser, setProcessingUser] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); // { user, action }

  // --- State for Tab 2: Approve Partners ---
  const [partners, setPartners] = useState([]);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [searchPartners, setSearchPartners] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [partnerModal, setPartnerModal] = useState(null); // { partner, action } // action: 'approve' | 'reject'
  const [detailModal, setDetailModal] = useState(null); // partner object to view profile

  useEffect(() => {
    if (activeTab === 'all-users') {
      fetchUsers();
      fetchStats();
    } else {
      fetchPartners();
    }
  }, [activeTab, roleFilter, statusFilter]);

  // --- Functions for Tab 1 ---
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get(`/admin/users?role=${roleFilter}`);
      setUsers(res.data.data || []);
    } catch { 
      toast.error('Không thể tải danh sách người dùng'); 
    } finally { 
      setLoadingUsers(false); 
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/users/stats');
      setStats(res.data.data || {});
    } catch {}
  };

  const handleBan = async (userId) => {
    setProcessingUser(userId);
    try {
      await api.post(`/admin/users/${userId}/ban`);
      toast.success('Đã khóa tài khoản');
      fetchUsers(); 
      fetchStats();
    } catch (e) { 
      toast.error(e.response?.data?.message || 'Lỗi khóa tài khoản'); 
    } finally { 
      setProcessingUser(null); 
      setConfirmModal(null); 
    }
  };

  const handleUnban = async (userId) => {
    setProcessingUser(userId);
    try {
      await api.post(`/admin/users/${userId}/unban`);
      toast.success('Đã mở khóa tài khoản');
      fetchUsers(); 
      fetchStats();
    } catch (e) { 
      toast.error(e.response?.data?.message || 'Lỗi mở khóa'); 
    } finally { 
      setProcessingUser(null); 
      setConfirmModal(null); 
    }
  };

  // --- Functions for Tab 2 ---
  const fetchPartners = async () => {
    setLoadingPartners(true);
    try {
      const res = await api.get(`/admin/partners?status=${statusFilter}`);
      setPartners(res.data.data || []);
    } catch (error) {
      toast.error('Không thể tải danh sách đối tác chờ duyệt');
    } finally {
      setLoadingPartners(false);
    }
  };

  const handlePartnerApproval = async () => {
    if (!selectedPartner || !partnerModal) return;
    const action = partnerModal.action;
    try {
      const endpoint = action === 'approve' ? 'approve' : 'reject';
      await api.post(`/admin/partners/${selectedPartner.id}/${endpoint}`);
      toast.success(action === 'approve' ? 'Đã duyệt đối tác thành công' : 'Đã từ chối đối tác');
      setPartnerModal(null);
      setSelectedPartner(null);
      fetchPartners();
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái đối tác');
    }
  };

  // --- Filtering ---
  const filteredUsers = users.filter(u =>
    !searchUsers ||
    u.fullName?.toLowerCase().includes(searchUsers.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchUsers.toLowerCase()) ||
    u.phoneNumber?.includes(searchUsers)
  );

  const filteredPartners = partners.filter(p =>
    !searchPartners ||
    p.fullName?.toLowerCase().includes(searchPartners.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchPartners.toLowerCase()) ||
    p.phoneNumber?.includes(searchPartners)
  );

  return (
    <Layout title="Quản trị Thành viên & Đối tác">
      <div className="space-y-6">

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 font-display">
          <button
            onClick={() => setActiveTab('all-users')}
            className={`flex items-center gap-2 px-6 py-3 font-bold text-sm transition-all border-b-2 ${
              activeTab === 'all-users'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users size={16} />
            Quản lý Thành viên
          </button>
          <button
            onClick={() => setActiveTab('approve-partners')}
            className={`flex items-center gap-2 px-6 py-3 font-bold text-sm transition-all border-b-2 ${
              activeTab === 'approve-partners'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <UserCheck size={16} />
            Phê duyệt Đối tác
            {stats.pendingContractors > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1 animate-pulse">
                {stats.pendingContractors}
              </span>
            )}
          </button>
        </div>

        {/* ==================== TAB 1: ALL USERS ==================== */}
        {activeTab === 'all-users' && (
          <div className="space-y-5">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.totalCustomers ?? '—'}</p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">Khách hàng</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{stats.totalContractors ?? '—'}</p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">Nhà thầu</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">{stats.pendingContractors ?? '—'}</p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">Chờ duyệt</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{stats.bannedUsers ?? '—'}</p>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">Bị khóa</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={15}/>
                <input
                  type="text"
                  value={searchUsers}
                  onChange={e => setSearchUsers(e.target.value)}
                  placeholder="Tìm tên, email, SĐT..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="flex gap-2">
                {[
                  { key: 'all',        label: 'Tất cả' },
                  { key: 'CUSTOMER',   label: 'Khách hàng' },
                  { key: 'CONTRACTOR', label: 'Nhà thầu' },
                ].map(r => (
                  <button
                    key={r.key}
                    onClick={() => setRoleFilter(r.key)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      roleFilter === r.key
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => { fetchUsers(); fetchStats(); }}
                className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500"
              >
                <RefreshCw size={16}/>
              </button>
            </div>

            {/* Table */}
            {loadingUsers ? (
              <div className="text-center py-16 text-gray-400">Đang tải thành viên...</div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">Người dùng</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Vai trò</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Trạng thái</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Đăng ký</th>
                        <th className="text-right px-5 py-3 font-semibold text-gray-600">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-gray-400">Không tìm thấy thành viên phù hợp</td>
                        </tr>
                      ) : (
                        filteredUsers.map(u => {
                          const roleCfg = ROLE_CFG[u.role] || { label: u.role, cls: 'bg-gray-100 text-gray-600' };
                          const approvalCfg = STATUS_CFG[u.approvalStatus];
                          const isBanned = !u.active;
                          return (
                            <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${isBanned ? 'opacity-60' : ''}`}>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                                    isBanned ? 'bg-red-100 text-red-500' : 'bg-[#e8f5ee] text-[#1a4f3a]'
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
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600 w-fit">
                                      <Ban size={10}/> Bị khóa
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-600 w-fit">
                                      <UserCheck size={10}/> Hoạt động
                                    </span>
                                  )}
                                  {u.role === 'CONTRACTOR' && approvalCfg && (
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium w-fit ${approvalCfg.cls}`}>
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
                                      disabled={processingUser === u.id}
                                      className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 disabled:opacity-50"
                                    >
                                      <UserCheck size={13}/> Mở khóa
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => setConfirmModal({ user: u, action: 'ban' })}
                                      disabled={processingUser === u.id}
                                      className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-50"
                                    >
                                      <Ban size={13}/> Khóa
                                    </button>
                                  )
                                )}
                                {u.role === 'ADMIN' && (
                                  <span className="text-xs text-gray-400 italic">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 2: PARTNER APPROVALS ==================== */}
        {activeTab === 'approve-partners' && (
          <div className="space-y-5">
            {/* Search & Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={15}/>
                <input
                  type="text"
                  value={searchPartners}
                  onChange={e => setSearchPartners(e.target.value)}
                  placeholder="Tìm tên hoặc email đối tác..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'Tất cả' },
                  { value: 'PENDING', label: 'Chờ duyệt' },
                  { value: 'APPROVED', label: 'Đã duyệt' },
                  { value: 'REJECTED', label: 'Từ chối' },
                ].map(button => (
                  <button
                    key={button.value}
                    onClick={() => setStatusFilter(button.value)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      statusFilter === button.value
                        ? 'bg-[#1a4f3a] text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {button.label}
                  </button>
                ))}
              </div>
              <button
                onClick={fetchPartners}
                className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500"
              >
                <RefreshCw size={16}/>
              </button>
            </div>

            {/* Table */}
            {loadingPartners ? (
              <div className="text-center py-16 text-gray-400">Đang tải danh sách đối tác...</div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">Nhà thầu</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Số điện thoại</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Trạng thái</th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-600">Đăng ký</th>
                        <th className="text-right px-5 py-3 font-semibold text-gray-600">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredPartners.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-gray-400">Không tìm thấy đối tác nào</td>
                        </tr>
                      ) : (
                        filteredPartners.map(partner => (
                          <tr key={partner.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-3.5">
                              <div>
                                <p className="font-semibold text-gray-900">{partner.fullName}</p>
                                <p className="text-xs text-gray-400">{partner.address || 'Chưa có địa chỉ'}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-gray-600 text-xs">{partner.email}</td>
                            <td className="px-4 py-3.5 text-gray-600 text-xs">{partner.phoneNumber || '—'}</td>
                            <td className="px-4 py-3.5">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                partner.approvalStatus === 'PENDING'
                                  ? 'bg-amber-100 text-amber-700'
                                  : partner.approvalStatus === 'APPROVED'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                              }`}>
                                {partner.approvalStatus === 'PENDING'
                                  ? 'Chờ duyệt'
                                  : partner.approvalStatus === 'APPROVED'
                                    ? 'Đã duyệt'
                                    : 'Từ chối'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-xs text-gray-400">
                              {partner.createdAt ? new Date(partner.createdAt).toLocaleDateString('vi-VN') : '—'}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => setDetailModal(partner)}
                                  className="px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 text-xs font-bold transition shadow-sm"
                                >
                                  Xem hồ sơ
                                </button>
                                {partner.approvalStatus !== 'APPROVED' && (
                                  <button
                                    onClick={() => { setSelectedPartner(partner); setPartnerModal({ action: 'approve' }); }}
                                    className="px-2.5 py-1.5 rounded-xl bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 text-xs font-bold transition"
                                  >
                                    Duyệt
                                  </button>
                                )}
                                {partner.approvalStatus !== 'REJECTED' && (
                                  <button
                                    onClick={() => { setSelectedPartner(partner); setPartnerModal({ action: 'reject' }); }}
                                    className="px-2.5 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 text-xs font-bold transition"
                                  >
                                    Từ chối
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- CONFIRM BAN/UNBAN MODAL (Tab 1) --- */}
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
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={() => confirmModal.action === 'ban'
                  ? handleBan(confirmModal.user.id)
                  : handleUnban(confirmModal.user.id)}
                disabled={processingUser === confirmModal.user.id}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-60 ${
                  confirmModal.action === 'ban' ? 'bg-red-500 hover:bg-red-600' : 'bg-[#1a4f3a] hover:bg-[#153f2e]'
                }`}
              >
                {processingUser === confirmModal.user.id
                  ? 'Đang xử lý...'
                  : confirmModal.action === 'ban' ? 'Khóa' : 'Mở khóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CONFIRM PARTNER APPROVAL/REJECTION MODAL (Tab 2) --- */}
      {partnerModal && selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
              partnerModal.action === 'approve' ? 'bg-green-50' : 'bg-red-50'
            }`}>
              {partnerModal.action === 'approve'
                ? <CheckCircle2 size={24} className="text-green-500"/>
                : <XCircle size={24} className="text-red-500"/>}
            </div>
            <h3 className="font-bold text-gray-900 text-center mb-1">
              {partnerModal.action === 'approve' ? 'Duyệt đối tác' : 'Từ chối đối tác'}
            </h3>
            <p className="text-sm text-gray-500 text-center mb-5">
              {partnerModal.action === 'approve'
                ? `Bạn chắc chắn muốn phê duyệt hồ sơ của nhà thầu "${selectedPartner.fullName}" để hoạt động trên sàn?`
                : `Từ chối hồ sơ đăng ký của nhà thầu "${selectedPartner.fullName}"?`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setPartnerModal(null); setSelectedPartner(null); }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handlePartnerApproval}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold ${
                  partnerModal.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CONTRACTOR PROFILE DETAIL MODAL (Admin Review) --- */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                {detailModal.profile?.logoUrl ? (
                  <img src={detailModal.profile.logoUrl} alt="Logo" className="w-12 h-12 rounded-xl object-cover border border-gray-150" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-green-50 text-green-700 flex items-center justify-center font-bold text-lg">
                    {detailModal.fullName?.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">{detailModal.profile?.companyName || detailModal.fullName}</h3>
                  <p className="text-xs text-gray-400">Năm thành lập: {detailModal.profile?.yearEstablished || '2020'}</p>
                </div>
              </div>
              <button onClick={() => setDetailModal(null)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                ✕
              </button>
            </div>

            {/* Basic & Contact Info */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div>
                <span className="text-gray-400 block mb-0.5">SỐ ĐIỆN THOẠI</span>
                <span className="font-bold text-gray-800">{detailModal.profile?.phoneNumber || detailModal.phoneNumber || '—'}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5">EMAIL</span>
                <span className="font-bold text-gray-800">{detailModal.profile?.email || detailModal.email || '—'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400 block mb-0.5">ĐỊA CHỈ THI CÔNG</span>
                <span className="font-bold text-gray-800">{detailModal.profile?.address || detailModal.address || '—'}</span>
              </div>
            </div>

            {/* Giới thiệu ngắn */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Giới thiệu ngắn</span>
              <p className="text-sm text-gray-700 leading-relaxed font-semibold italic bg-green-50/50 p-4 rounded-xl border border-green-100">
                "{detailModal.profile?.shortIntro || 'Chưa cập nhật giới thiệu.'}"
              </p>
            </div>

            {/* Lĩnh vực & Chính sách */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Lĩnh vực hoạt động</span>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={detailModal.profile?.designInterior ? 'text-green-600 font-bold' : 'text-gray-300'}>
                      {detailModal.profile?.designInterior ? '☑' : '☐'} Thiết kế nội thất
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={detailModal.profile?.constructInterior ? 'text-green-600 font-bold' : 'text-gray-300'}>
                      {detailModal.profile?.constructInterior ? '☑' : '☐'} Thi công nội thất
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={detailModal.profile?.produceWood ? 'text-green-600 font-bold' : 'text-gray-300'}>
                      {detailModal.profile?.produceWood ? '☑' : '☐'} Sản xuất đồ gỗ
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={detailModal.profile?.renovateHouse ? 'text-green-600 font-bold' : 'text-gray-300'}>
                      {detailModal.profile?.renovateHouse ? '☑' : '☐'} Cải tạo nhà ở
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Chính sách cam kết</span>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={detailModal.profile?.warranty24Months ? 'text-blue-600 font-bold' : 'text-gray-300'}>
                      {detailModal.profile?.warranty24Months ? '✔' : '☐'} Bảo hành 24 tháng
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={detailModal.profile?.freeQuote ? 'text-blue-600 font-bold' : 'text-gray-300'}>
                      {detailModal.profile?.freeQuote ? '✔' : '☐'} Báo giá miễn phí
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={detailModal.profile?.onTimeProgress ? 'text-blue-600 font-bold' : 'text-gray-300'}>
                      {detailModal.profile?.onTimeProgress ? '✔' : '☐'} Thi công đúng tiến độ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Thống kê năng lực */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Thống kê năng lực</span>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Kinh nghiệm</p>
                  <p className="font-extrabold text-sm text-gray-900 mt-1">{detailModal.profile?.experienceYears || '0'} năm</p>
                </div>
                <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Dự án thầu</p>
                  <p className="font-extrabold text-sm text-gray-900 mt-1">{detailModal.profile?.completedProjectsCount || '0'}</p>
                </div>
                <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Khách hàng</p>
                  <p className="font-extrabold text-sm text-gray-900 mt-1">{detailModal.profile?.customerCount || '0+'}</p>
                </div>
                <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl">
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Đánh giá sàn</p>
                  <p className="font-extrabold text-sm text-amber-500 mt-1">★ {detailModal.profile?.rating?.toFixed(1) || '5.0'}</p>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-6 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setDetailModal(null)} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-50">
                Đóng
              </button>
              {detailModal.approvalStatus === 'PENDING' && (
                <>
                  <button onClick={() => { setSelectedPartner(detailModal); setPartnerModal({ action: 'reject' }); setDetailModal(null); }}
                    className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-xl font-bold text-xs">
                    Từ chối
                  </button>
                  <button onClick={() => { setSelectedPartner(detailModal); setPartnerModal({ action: 'approve' }); setDetailModal(null); }}
                    className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs shadow-md">
                    Phê duyệt đối tác 🚀
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}

    </Layout>
  );
}
