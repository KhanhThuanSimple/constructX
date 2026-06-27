import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  Search,
  MapPin,
  Clock,
  ArrowUpRight,
  Filter,
  DollarSign
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ProjectMarketplacePage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOpenProjects();
  }, []);

  const fetchOpenProjects = async () => {
    try {
      const response = await api.get('/projects/open');
      setProjects(response.data.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách dự án');
    } finally {
      setLoading(false);
    }
  };
  console.log('Open projects:', projects);

  const GoToProjectDetail = (projectId) => {
    console.log('chạy vào đây r:', projectId);
    navigate(`/projects/${projectId}`);
  };

  return (
    <Layout title="Tìm dự án mới">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm theo tên dự án, hạng mục..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm shadow-sm focus:border-[#1a4f3a] transition-all outline-none"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium hover:bg-gray-50 transition-all">
            <Filter size={18} /> Lọc
          </button>
          <button className="flex-1 md:flex-none px-6 py-3 bg-[#1a4f3a] text-white rounded-2xl text-sm font-bold shadow-lg shadow-[#1a4f3a]/20 hover:bg-[#153f2e] transition-all">
            Tìm kiếm
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a4f3a]"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Không tìm thấy dự án</h3>
          <p className="text-gray-500 text-sm mt-1">Hiện tại không có dự án nào đang tuyển nhà thầu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group cursor-pointer"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-[#e8f5ee] text-[#1a4f3a] text-[10px] font-bold uppercase rounded-full">
                    {project.category}
                  </span>
                  <div className="flex items-center gap-1 text-gray-400 text-[10px]">
                    <Clock size={12} /> {new Date(project.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#1a4f3a] transition-colors">
                  {project.name}
                </h3>

                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                    <MapPin size={14} className="text-gray-400" />
                    {project.address || 'Toàn quốc'}
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                    <DollarSign size={14} className="text-gray-400" />
                    Ngân sách: Thỏa thuận
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                      {project.customerName?.charAt(0) || 'C'}
                    </div>
                    <span className="text-xs font-medium text-gray-600">{project.customerName || 'Khách hàng'}</span>
                  </div>
                  <button className="flex items-center gap-2 text-sm font-bold text-[#1a4f3a] hover:gap-3 transition-all"
                    onClick={() => { GoToProjectDetail(project.id) }}
                  >
                    Xem chi tiết <ArrowUpRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default ProjectMarketplacePage;
