import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { 
  MapPin, 
  Clock, 
  Construction, 
  DollarSign, 
  ArrowLeft,
  Calendar,
  Tag,
  User as UserIcon,
  MessageSquare
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectDetail();
  }, [id]);

  const fetchProjectDetail = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data.data);
    } catch (error) {
      toast.error('Lỗi khi tải thông tin dự án');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Thỏa thuận';
    return (amount / 1000000) + 'tr VNĐ';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN': return <span className="badge badge-green">Đang tuyển nhà thầu</span>;
      case 'IN_PROGRESS': return <span className="badge badge-amber">Đang thi công</span>;
      case 'COMPLETED': return <span className="badge badge-blue">Hoàn thành</span>;
      default: return <span className="badge badge-gray">{status}</span>;
    }
  };

  if (loading) {
    return (
      <Layout title="Chi tiết dự án">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={project?.name || "Chi tiết dự án"}>
      <div className="max-w-4xl mx-auto pb-20">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={18} /> Quay lại
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header Section */}
          <div className="p-8 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  {getStatusBadge(project.status)}
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={14} /> Đăng ngày {new Date(project.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <h1 className="text-3xl font-bold font-display text-gray-900 mb-2">{project.name}</h1>
                <div className="flex items-center gap-2 text-gray-500">
                  <UserIcon size={16} />
                  <span className="text-sm font-medium">Chủ dự án: {project.user?.fullName || "Khách hàng"}</span>
                </div>
              </div>
              
              {user?.role === 'CONTRACTOR' && project.status === 'OPEN' && (
                <button className="btn btn-primary py-3 px-8 flex items-center gap-2 shadow-lg shadow-primary/20">
                  Gửi báo giá ngay <MessageSquare size={18} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Ngân sách tối thiểu</p>
                <div className="flex items-center gap-1.5 text-primary">
                  <DollarSign size={16} />
                  <span className="font-bold">{formatCurrency(project.budgetMin)}</span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Ngân sách tối đa</p>
                <div className="flex items-center gap-1.5 text-primary">
                  <DollarSign size={16} />
                  <span className="font-bold">{formatCurrency(project.budgetMax)}</span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Diện tích</p>
                <div className="flex items-center gap-1.5 text-gray-700">
                  <Construction size={16} className="text-gray-400" />
                  <span className="font-bold">{project.area} m²</span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Địa điểm</p>
                <div className="flex items-center gap-1.5 text-gray-700">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="font-bold">{project.address || "Toàn quốc"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-8">
            <div className="mb-10">
              <h2 className="text-lg font-bold font-display text-gray-900 mb-4 flex items-center gap-2">
                <Tag size={20} className="text-primary" /> Thông tin hạng mục
              </h2>
              <div className="inline-block px-4 py-2 bg-primary-bg text-primary rounded-xl font-bold text-sm">
                {project.category}
              </div>
            </div>

            <div className="mb-10">
              <h2 className="text-lg font-bold font-display text-gray-900 mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-primary" /> Mô tả dự án
              </h2>
              <div className="bg-gray-50 p-6 rounded-2xl text-gray-700 leading-relaxed whitespace-pre-wrap">
                {project.description || "Không có mô tả chi tiết cho dự án này."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectDetailPage;
