import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
  DollarSign,
  MapPin,
  User,
  Clock
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const FILTERS = [
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Từ chối' },
  { value: 'all', label: 'Tất cả' },
];

const AdminProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('PENDING');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [action, setAction] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [filter]);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/projects?status=${filter}`);
      const data = response.data.data || response.data || [];
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error(error.response?.data?.message || 'Không thể tải danh sách dự án');
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let result = projects || [];

    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();

      result = result.filter((project) =>
        project.name?.toLowerCase().includes(term) ||
        project.customerName?.toLowerCase().includes(term) ||
        project.customerEmail?.toLowerCase().includes(term) ||
        `${project.id}`.includes(term)
      );
    }

    setFilteredProjects(result);
  };

  const openReviewModal = (project, reviewAction) => {
    setSelectedProject(project);
    setAction(reviewAction);
    setReason('');
    setShowModal(true);
  };

  const handleReview = async () => {
    if (!selectedProject) return;

    if (!reason.trim()) {
      toast.error('Vui lòng nhập ghi chú xử lý');
      return;
    }

    const endpoint = action === 'approve' ? 'approve' : 'reject';

    try {
      await api.post(`/admin/projects/${selectedProject.id}/${endpoint}`, {
        reason: reason.trim(),
      });

      toast.success(action === 'approve' ? 'Dự án đã được duyệt' : 'Dự án đã bị từ chối');
      setShowModal(false);
      fetchProjects();
    } catch (error) {
      console.error('Error reviewing project:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi xử lý dự án');
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Thỏa thuận';
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  const getApprovalLabel = (status) => {
    if (status === 'PENDING') return 'Chờ duyệt';
    if (status === 'APPROVED') return 'Đã duyệt';
    if (status === 'REJECTED') return 'Từ chối';
    return status || 'Không rõ';
  };

  const getApprovalBadge = (status) => {
    if (status === 'PENDING') return 'bg-yellow-100 text-yellow-700';
    if (status === 'APPROVED') return 'bg-green-100 text-green-700';
    if (status === 'REJECTED') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  const summary = {
    pending: projects.filter((p) => p.approvalStatus === 'PENDING').length,
    approved: projects.filter((p) => p.approvalStatus === 'APPROVED').length,
    rejected: projects.filter((p) => p.approvalStatus === 'REJECTED').length,
  };

  if (loading) {
    return (
      <Layout title="Phê duyệt dự án">
        <div className="text-center py-12">Đang tải...</div>
      </Layout>
    );
  }

  return (
    <Layout title="Phê duyệt dự án">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-gray-500">Chờ duyệt</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {filter === 'PENDING' ? projects.length : summary.pending}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-gray-500">Đang hiển thị trên sàn</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {filter === 'APPROVED' ? projects.length : summary.approved}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-gray-500">Đã từ chối</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {filter === 'REJECTED' ? projects.length : summary.rejected}
            </p>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-end justify-between">
          <div className="relative w-full xl:w-96">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />

            <input
              type="text"
              placeholder="Tìm theo tên dự án, khách hàng, email..."
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

        <div className="space-y-3">
          {filteredProjects.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 p-10 text-center">
              <p className="text-gray-500">Không tìm thấy dự án phù hợp</p>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition"
              >
                <div className="flex flex-col 2xl:flex-row 2xl:items-center 2xl:justify-between gap-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h3 className="text-lg font-bold text-gray-900">
                        #{project.id} · {project.name}
                      </h3>

                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getApprovalBadge(project.approvalStatus)}`}>
                        {getApprovalLabel(project.approvalStatus)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <User size={16} />
                        {project.customerName || 'Không rõ khách hàng'} · {project.customerEmail || '-'}
                      </p>

                      <p className="flex items-center gap-2">
                        <MapPin size={16} />
                        {project.address || 'Chưa có địa chỉ'}
                      </p>

                      <p className="flex items-center gap-2">
                        <DollarSign size={16} />
                        Ngân sách: {formatCurrency(project.budgetMin)} - {formatCurrency(project.budgetMax)}
                      </p>

                      <p className="flex items-center gap-2">
                        <Calendar size={16} />
                        Tạo ngày: {project.createdAt ? new Date(project.createdAt).toLocaleDateString('vi-VN') : '—'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {project.category && <span className="badge badge-blue">{project.category}</span>}
                      {project.style && <span className="badge badge-gray">{project.style}</span>}
                      {project.area && <span className="badge badge-amber">{project.area}m²</span>}
                      <span className="badge badge-gray">
                        {project.bidType === 'DIRECT' ? 'Đấu thầu đóng' : 'Đấu thầu mở'}
                      </span>
                    </div>

                    {project.description && (
                      <p className="text-sm text-gray-700 mt-3 line-clamp-2">
                        {project.description}
                      </p>
                    )}

                    {project.adminNote && (
                      <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
                        <Clock size={14} />
                        Ghi chú admin: {project.adminNote}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 2xl:justify-end">
                    {project.approvalStatus !== 'APPROVED' && (
                      <button
                        onClick={() => openReviewModal(project, 'approve')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 font-medium transition"
                      >
                        <CheckCircle2 size={18} />
                        Duyệt
                      </button>
                    )}

                    {project.approvalStatus !== 'REJECTED' && (
                      <button
                        onClick={() => openReviewModal(project, 'reject')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-medium transition"
                      >
                        <XCircle size={18} />
                        Từ chối
                      </button>
                    )}

                    <Link
                      to={`/projects/${project.id}`}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium transition"
                    >
                      <Eye size={18} />
                      Xem
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              {action === 'approve' ? 'Duyệt dự án' : 'Từ chối dự án'}
            </h2>

            <p className="text-gray-600 text-sm">{selectedProject.name}</p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {action === 'approve' ? 'Ghi chú duyệt' : 'Lý do từ chối'}
              </label>

              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  action === 'approve'
                    ? 'Ví dụ: Hồ sơ hợp lệ, được phép mở thầu...'
                    : 'Ví dụ: Thiếu thông tin ngân sách hoặc mô tả chưa rõ...'
                }
                rows="4"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition"
              >
                Hủy
              </button>

              <button
                onClick={handleReview}
                className={`px-4 py-2 rounded-lg text-white font-medium transition ${
                  action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {action === 'approve' ? 'Duyệt' : 'Từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminProjectsPage;