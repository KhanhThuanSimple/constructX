import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  Search, 
  MapPin, 
  Clock, 
  MoreVertical, 
  ExternalLink,
  Plus
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const ProjectListPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const fetchMyProjects = async () => {
    try {
      const response = await api.get('/projects/my');
      setProjects(response.data.data);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách dự án');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN': return <span className="badge badge-blue">Đang tuyển</span>;
      case 'IN_PROGRESS': return <span className="badge badge-amber">Đang thi công</span>;
      case 'COMPLETED': return <span className="badge badge-green">Hoàn thành</span>;
      default: return <span className="badge badge-gray">{status}</span>;
    }
  };

  return (
    <Layout title="Dự án của tôi">
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm dự án..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm"
          />
        </div>
        <Link to="/projects/new" className="btn btn-primary flex items-center gap-2">
          <Plus size={18} /> Đăng dự án mới
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold">Dự án</th>
              <th className="p-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold">Hạng mục</th>
              <th className="p-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold">Địa chỉ</th>
              <th className="p-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold">Trạng thái</th>
              <th className="p-4 text-[10px] uppercase tracking-widest text-gray-400 font-bold text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="p-10 text-center text-gray-400">Đang tải...</td></tr>
            ) : projects.length === 0 ? (
              <tr><td colSpan="5" className="p-10 text-center text-gray-400">Bạn chưa có dự án nào.</td></tr>
            ) : (
              projects.map((project) => (
                <tr key={project.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <p className="text-sm font-bold text-gray-800">{project.name}</p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock size={10} /> Đã đăng: {new Date(project.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </td>
                  <td className="p-4">
                    <span className="text-xs text-gray-600">{project.category}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <MapPin size={14} className="text-gray-400" /> {project.address || '---'}
                    </span>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(project.status)}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link 
                        to={`/projects/${project.id}`}
                        className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-primary transition-all border border-transparent hover:border-gray-200"
                      >
                        <ExternalLink size={18} />
                      </Link>
                      <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-gray-600 transition-all border border-transparent hover:border-gray-200">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default ProjectListPage;
