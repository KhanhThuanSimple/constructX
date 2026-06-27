import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  Search, MapPin, Clock, ExternalLink, Plus, ChevronDown,
  DollarSign, Eye, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const fmt = (n) =>
  n == null ? 'Thỏa thuận' :
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
    .format(n).replace('₫', 'đ');

const STATUS_CFG = {
  DRAFT:       { label: 'Nháp',          cls: 'bg-gray-100 text-gray-500' },
  OPEN:        { label: 'Đang tuyển',    cls: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: 'Đang thi công', cls: 'bg-amber-100 text-amber-700' },
  COMPLETED:   { label: 'Hoàn thành',    cls: 'bg-green-100 text-green-700' },
  CLOSED:      { label: 'Đã đóng',       cls: 'bg-gray-100 text-gray-500' },
  CANCELLED:   { label: 'Đã hủy',        cls: 'bg-red-100 text-red-600' },
};

const APPROVAL_CFG = {
  PENDING:  { label: 'Chờ duyệt', cls: 'bg-amber-50 text-amber-600 border border-amber-200', icon: <AlertCircle size={11}/> },
  APPROVED: { label: 'Đã duyệt',  cls: 'bg-green-50 text-green-600 border border-green-200', icon: <CheckCircle size={11}/> },
  REJECTED: { label: 'Từ chối',   cls: 'bg-red-50 text-red-600 border border-red-200',       icon: <XCircle size={11}/> },
};

const ProjectListPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchMyProjects(); }, []);

  const fetchMyProjects = async () => {
    try {
      const response = await api.get('/projects/my');
      setProjects(response.data.data || []);
    } catch {
      toast.error('Lỗi khi tải danh sách dự án');
    } finally {
      setLoading(false);
    }
  };

  const filtered = projects.filter(p =>
    !search ||
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const isContractor = user?.role === 'CONTRACTOR';

  return (
    <Layout title={isContractor ? 'Dự án đã tham gia' : 'Dự án của tôi'}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={15}/>
            <input type="text" placeholder="Tìm theo tên, hạng mục..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary"/>
          </div>
          {!isContractor && (
            <Link to="/projects/new" className="btn btn-primary flex items-center gap-2 text-sm px-4 py-2.5">
              <Plus size={16}/> Đăng dự án mới
            </Link>
          )}
          {isContractor && (
            <Link to="/projects/browse" className="btn btn-primary flex items-center gap-2 text-sm px-4 py-2.5">
              <Plus size={16}/> Tìm dự án mới
            </Link>
          )}
        </div>

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="text-5xl mb-3">🏗️</div>
            <p className="text-gray-500 font-medium">Chưa có dự án nào</p>
            {!isContractor && (
              <Link to="/projects/new"
                className="mt-4 inline-flex items-center gap-2 btn btn-primary text-sm px-6 py-2.5">
                <Plus size={15}/> Tạo dự án đầu tiên
              </Link>
            )}
          </div>
        )}

        {/* Projects grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(p => {
              const stCfg = STATUS_CFG[p.status] || { label: p.status, cls: 'bg-gray-100 text-gray-500' };
              const apCfg = APPROVAL_CFG[p.approvalStatus] || APPROVAL_CFG.PENDING;
              return (
                <div key={p.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
                  
                  {p.imageUrls && p.imageUrls.length > 0 && (
                    <div className="h-40 w-full bg-gray-100 border-b border-gray-100 shrink-0">
                      <img src={p.imageUrls[0]} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="p-5 flex-1 flex flex-col">
                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${stCfg.cls}`}>
                        {stCfg.label}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${apCfg.cls}`}>
                        {apCfg.icon} {apCfg.label}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-gray-900 text-base mb-1.5 line-clamp-2">{p.name}</h3>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                      {p.address && (
                        <span className="flex items-center gap-1">
                          <MapPin size={11}/> {p.address}
                        </span>
                      )}
                      {p.category && (
                        <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                          {p.category}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock size={11}/> {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    {/* Budget */}
                    {(p.budgetMin || p.budgetMax) && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-3 bg-gray-50 rounded-lg px-3 py-2 w-fit">
                        <DollarSign size={12} className="text-primary"/>
                        <span className="font-semibold">{fmt(p.budgetMin)} – {fmt(p.budgetMax)}</span>
                      </div>
                    )}

                    {/* Description */}
                    {p.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-4">{p.description}</p>
                    )}

                    {/* Admin note nếu bị từ chối */}
                    {p.approvalStatus === 'REJECTED' && p.adminNote && (
                      <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-700 mb-3">
                        <XCircle size={12} className="mt-0.5 shrink-0"/>
                        <span><strong>Lý do:</strong> {p.adminNote}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <span className="text-[10px] text-gray-400">#{p.id}</span>
                      <div className="flex gap-2">
                        {isContractor ? (
                          <button onClick={() => navigate(`/projects/${p.id}`)}
                            className="flex items-center gap-1.5 text-xs font-medium border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50">
                            <Eye size={13}/> Xem chi tiết
                          </button>
                        ) : (
                          <Link to={`/projects/${p.id}`}
                            className="flex items-center gap-1.5 text-xs font-medium border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50">
                            <Eye size={13}/> Xem & Quản lý
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {loading && (
          <div className="text-center py-16 text-gray-400">Đang tải dự án...</div>
        )}
      </div>
    </Layout>
  );
};

export default ProjectListPage;
