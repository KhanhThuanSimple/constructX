import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  Search, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Filter,
  Construction
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects/open');
      setProjects(response.data.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách dự án');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Thỏa thuận';
    return (amount / 1000000) + 'tr';
  };

  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (project.category && project.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Layout title="Sàn dự án ConstructX">
      <div className="max-w-6xl mx-auto">
        {/* Search & Filter Header */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm dự án (ví dụ: Phòng khách, Biệt thự...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium">
              <option>Tất cả khu vực</option>
              <option>Hà Nội</option>
              <option>TP. HCM</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors">
              <Filter size={18} /> Bộ lọc
            </button>
          </div>
        </div>

        {/* Project List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 text-center py-20 text-gray-400">Đang tải dự án...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="col-span-2 text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">
              {searchQuery ? `Không tìm thấy dự án nào khớp với "${searchQuery}"` : 'Chưa có dự án nào đang đăng tuyển.'}
            </div>
          ) : (
            filteredProjects.map((project) => (
              <div 
                key={project.id} 
                onClick={() => handleProjectClick(project.id)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className="badge badge-green text-[10px]">Đang tuyển</span>
                    <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                      <Clock size={12} /> {new Date(project.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold font-display group-hover:text-primary transition-colors mb-2">
                    {project.name}
                  </h3>
                  
                  <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><MapPin size={14} /> {project.address || 'Toàn quốc'}</span>
                    <span className="flex items-center gap-1"><Construction size={14} /> {project.area}m²</span>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-6">
                    {project.description || 'Không có mô tả chi tiết.'}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Ngân sách</p>
                      <p className="text-sm font-bold text-primary">
                        {formatCurrency(project.budgetMin)} - {formatCurrency(project.budgetMax)}
                      </p>
                    </div>
                    {user?.role === 'CONTRACTOR' ? (
                      <button className="btn btn-primary text-xs py-2 px-6 flex items-center gap-2">
                        Gửi báo giá <ChevronRight size={14} />
                      </button>
                    ) : (
                      <button className="text-xs font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all">
                        Xem chi tiết <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
