import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  Plus, Star, MapPin, Calendar, ExternalLink, Edit2, Trash2,
  X, Save, DollarSign, Image as ImageIcon, Loader2
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';

const fmt = (n) =>
  n == null ? '' :
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n).replace('₫', 'đ');

const EMPTY_FORM = {
  title: '', description: '', category: '', imageUrl: '',
  projectValue: '', completionYear: '', clientName: '', location: ''
};

const CATEGORIES = [
  'Phòng khách', 'Phòng bếp', 'Phòng ngủ', 'Phòng tắm',
  'Văn phòng', 'Toàn nhà', 'Ngoại thất', 'Khác'
];

const PortfolioPage = () => {
  const { user } = useAuthStore();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => { fetchPortfolio(); }, []);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const res = await api.get('/portfolio/my');
      setWorks(res.data.data || []);
    } catch { toast.error('Không thể tải hồ sơ năng lực'); }
    finally { setLoading(false); }
  };

  const openAddForm = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(true);
  };

  const openEditForm = (work) => {
    setForm({
      title: work.title || '',
      description: work.description || '',
      category: work.category || '',
      imageUrl: work.imageUrl || '',
      projectValue: work.projectValue || '',
      completionYear: work.completionYear || '',
      clientName: work.clientName || '',
      location: work.location || '',
    });
    setEditId(work.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Tiêu đề không được để trống'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        projectValue: form.projectValue ? Number(form.projectValue) : null,
      };
      if (editId) {
        await api.put(`/portfolio/${editId}`, payload);
        toast.success('Đã cập nhật công trình!');
      } else {
        await api.post('/portfolio', payload);
        toast.success('Đã thêm công trình mới!');
      }
      setShowForm(false);
      fetchPortfolio();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi khi lưu');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa công trình này?')) return;
    setDeleting(id);
    try {
      await api.delete(`/portfolio/${id}`);
      toast.success('Đã xóa công trình');
      fetchPortfolio();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Không thể xóa');
    } finally { setDeleting(null); }
  };

  return (
    <Layout title="Hồ sơ năng lực (Portfolio)">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header card */}
        <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-[#1a4f3a] flex items-center justify-center text-3xl text-white font-bold shadow-lg">
              {user?.fullName?.charAt(0) || 'C'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{user?.fullName || 'Nhà thầu'}</h2>
              <div className="flex items-center gap-4 mt-1.5">
                <span className="flex items-center gap-1 text-sm text-amber-500 font-bold">
                  <Star size={16} fill="currentColor" /> Hồ sơ năng lực
                </span>
                <span className="text-sm text-gray-400">{works.length} công trình</span>
              </div>
            </div>
          </div>
          <button onClick={openAddForm}
            className="btn btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl shadow-lg shadow-[#1a4f3a]/20">
            <Plus size={20} /> Thêm công trình
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <Loader2 size={32} className="animate-spin mx-auto mb-3"/>
            Đang tải...
          </div>
        ) : works.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <ImageIcon size={44} className="mx-auto text-gray-200 mb-3"/>
            <p className="text-gray-400 font-medium">Chưa có công trình nào</p>
            <p className="text-gray-300 text-sm mt-1">Thêm công trình đã thực hiện để tăng uy tín với khách hàng</p>
            <button onClick={openAddForm}
              className="mt-5 btn btn-primary text-sm px-6 py-2.5 flex items-center gap-2 mx-auto">
              <Plus size={15}/> Thêm công trình đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {works.map((work) => (
              <div key={work.id}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                {/* Image */}
                <div className="h-44 bg-gray-50 overflow-hidden relative">
                  {work.imageUrl ? (
                    <img src={work.imageUrl} alt={work.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                      {work.category === 'Phòng bếp' ? '🍳' :
                       work.category === 'Phòng ngủ' ? '🛏️' :
                       work.category === 'Phòng tắm' ? '🚿' :
                       work.category === 'Văn phòng' ? '🏢' :
                       work.category === 'Toàn nhà'  ? '🏠' : '🛋️'}
                    </div>
                  )}
                  {/* Edit/Delete overlay */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditForm(work)}
                      className="w-7 h-7 bg-white rounded-lg shadow flex items-center justify-center text-gray-600 hover:text-primary">
                      <Edit2 size={13}/>
                    </button>
                    <button onClick={() => handleDelete(work.id)} disabled={deleting === work.id}
                      className="w-7 h-7 bg-white rounded-lg shadow flex items-center justify-center text-gray-600 hover:text-red-500 disabled:opacity-50">
                      {deleting === work.id ? <Loader2 size={13} className="animate-spin"/> : <Trash2 size={13}/>}
                    </button>
                  </div>
                </div>

                <div className="p-5">
                  {work.category && (
                    <span className="text-[10px] font-bold text-[#1a4f3a] uppercase tracking-widest bg-[#e8f5ee] px-2 py-1 rounded-md mb-2 inline-block">
                      {work.category}
                    </span>
                  )}
                  <h3 className="text-base font-bold text-gray-800 mt-1.5 mb-1 line-clamp-1">{work.title}</h3>
                  {work.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{work.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    {work.completionYear && (
                      <span className="flex items-center gap-1">
                        <Calendar size={12}/> {work.completionYear}
                      </span>
                    )}
                    {work.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12}/> {work.location}
                      </span>
                    )}
                    {work.projectValue && (
                      <span className="font-bold text-[#1a4f3a]">{fmt(work.projectValue)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 overflow-y-auto p-4">
          <div className="max-w-xl mx-auto bg-white rounded-3xl mt-8 mb-8 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editId ? 'Chỉnh sửa công trình' : 'Thêm công trình mới'}
              </h2>
              <button onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400">
                <X size={16}/>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  placeholder="VD: Phòng khách Vinhomes Grand Park"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary"/>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Danh mục</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary bg-white">
                    <option value="">Chọn danh mục</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Năm hoàn thành</label>
                  <input type="text" value={form.completionYear} onChange={e => setForm({...form, completionYear: e.target.value})}
                    placeholder="VD: 2024"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Giá trị công trình (đ)</label>
                  <input type="number" value={form.projectValue} onChange={e => setForm({...form, projectValue: e.target.value})}
                    placeholder="VD: 95000000"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Khu vực</label>
                  <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                    placeholder="VD: TP. Hồ Chí Minh"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary"/>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">URL ảnh công trình</label>
                <input type="text" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary"/>
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="preview" onError={e => e.target.style.display='none'}
                    className="mt-2 rounded-xl max-h-32 object-cover border border-gray-100"/>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Mô tả</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Mô tả về công trình, chất liệu, phong cách..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary resize-none"/>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Tên khách hàng (tùy chọn)</label>
                <input type="text" value={form.clientName} onChange={e => setForm({...form, clientName: e.target.value})}
                  placeholder="VD: Anh Nguyễn Văn A"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-primary"/>
              </div>
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">
                Hủy
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-light disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? <Loader2 size={15} className="animate-spin"/> : <Save size={15}/>}
                {saving ? 'Đang lưu...' : 'Lưu công trình'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PortfolioPage;
