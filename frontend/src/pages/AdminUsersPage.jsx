import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  Search,
  CheckCircle2,
  XCircle,
  Filter
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const STATUS_BUTTONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Từ chối' },
];

const AdminUsersPage = () => {
  const [partners, setPartners] = useState([]);
  const [allPartners, setAllPartners] = useState([]);
  const [filteredPartners, setFilteredPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    fetchPartners();
    fetchAllPartners();
  }, [statusFilter]);

  useEffect(() => {
    filterPartners();
  }, [partners, searchTerm]);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/partners?status=${statusFilter}`);
      setPartners(response.data.data || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
      toast.error('Không thể tải danh sách đối tác');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPartners = async () => {
    try {
      const response = await api.get('/admin/partners?status=all');
      setAllPartners(response.data.data || []);
    } catch (error) {
      console.error('Error fetching all partners:', error);
    }
  };

  const filterPartners = () => {
    let result = partners;
    if (searchTerm) {
      result = result.filter((partner) =>
        partner.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredPartners(result);
  };

  const openActionModal = (partner, type) => {
    setSelectedPartner(partner);
    setActionType(type);
    setShowModal(true);
  };

  const handleApproval = async () => {
    if (!selectedPartner) return;
    try {
      const endpoint = actionType === 'approve' ? 'approve' : 'reject';
      await api.post(`/admin/partners/${selectedPartner.id}/${endpoint}`);
      toast.success(actionType === 'approve' ? 'Đã duyệt đối tác' : 'Đã từ chối đối tác');
      setShowModal(false);
      fetchPartners();
      fetchAllPartners();
    } catch (error) {
      console.error('Error updating partner status:', error);
      toast.error('Lỗi khi cập nhật trạng thái đối tác');
    }
  };

  const getStatusLabel = (status) => {
    if (status === 'PENDING') return 'Chờ duyệt';
    if (status === 'APPROVED') return 'Đã duyệt';
    if (status === 'REJECTED') return 'Từ chối';
    return status;
  };

  const getStatusBadge = (status) => {
    if (status === 'PENDING') return 'bg-yellow-100 text-yellow-700';
    if (status === 'APPROVED') return 'bg-green-100 text-green-700';
    if (status === 'REJECTED') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  const countByStatus = (status) => {
    const list = allPartners.length ? allPartners : partners;
    return list.filter((partner) => partner.approvalStatus === status).length;
  };

  if (loading) {
    return <Layout title="Phê duyệt đối tác"><div className="text-center py-12">Đang tải...</div></Layout>;
  }

  return (
    <Layout title="Phê duyệt đối tác">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_BUTTONS.map((button) => (
            <button
              key={button.value}
              onClick={() => setStatusFilter(button.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                statusFilter === button.value
                  ? 'bg-[#1a4f3a] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {button.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tên đối tác</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Số điện thoại</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Đăng ký</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredPartners.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      Không tìm thấy đối tác phù hợp
                    </td>
                  </tr>
                ) : (
                  filteredPartners.map((partner) => (
                    <tr key={partner.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{partner.fullName}</p>
                          <p className="text-sm text-gray-600">{partner.address || 'Chưa có địa chỉ'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{partner.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{partner.phoneNumber || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(partner.approvalStatus)}`}>
                          {getStatusLabel(partner.approvalStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(partner.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {partner.approvalStatus !== 'APPROVED' && (
                            <button
                              onClick={() => openActionModal(partner, 'approve')}
                              className="px-3 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 text-sm font-medium transition"
                            >
                              Duyệt
                            </button>
                          )}
                          {partner.approvalStatus !== 'REJECTED' && (
                            <button
                              onClick={() => openActionModal(partner, 'reject')}
                              className="px-3 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 text-sm font-medium transition"
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-sm text-gray-600">Tổng đối tác</p>
            <p className="text-2xl font-bold text-gray-900">{partners.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-sm text-gray-600">Chờ duyệt</p>
            <p className="text-2xl font-bold text-yellow-600">{countByStatus('PENDING')}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-sm text-gray-600">Đã duyệt</p>
            <p className="text-2xl font-bold text-green-600">{countByStatus('APPROVED')}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-sm text-gray-600">Từ chối</p>
            <p className="text-2xl font-bold text-red-600">{countByStatus('REJECTED')}</p>
          </div>
        </div>
      </div>

      {showModal && selectedPartner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              {actionType === 'approve' ? 'Duyệt đối tác' : 'Từ chối đối tác'}
            </h2>
            <p className="text-gray-600 text-sm">
              {actionType === 'approve'
                ? `Bạn chắc chắn muốn duyệt đối tác ${selectedPartner.fullName}?`
                : `Bạn chắc chắn muốn từ chối đối tác ${selectedPartner.fullName}?`}
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition"
              >
                Hủy
              </button>
              <button
                onClick={handleApproval}
                className={`px-4 py-2 rounded-lg text-white font-medium transition ${
                  actionType === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {actionType === 'approve' ? 'Duyệt' : 'Từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminUsersPage;
