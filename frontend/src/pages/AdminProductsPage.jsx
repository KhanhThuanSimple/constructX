import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  Plus, Pencil, Trash2, Eye, Search, Sparkles,
  ToggleLeft, ToggleRight, Package, X, Save,
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const CATEGORIES = [
  { key: 'SOFA', label: 'Ghế sofa' },
  { key: 'TABLE', label: 'Bàn' },
  { key: 'CHAIR', label: 'Ghế' },
  { key: 'BED', label: 'Giường ngủ' },
  { key: 'CABINET', label: 'Tủ kệ' },
  { key: 'DECOR', label: 'Trang trí' },
];

const EMPTY_FORM = {
  name: '', description: '', price: '', originalPrice: '',
  imageUrl: '', category: 'SOFA', brand: '', material: '',
  dimensions: '', color: '', stock: 0, featured: false, active: true,
};

const fmt = (n) =>
  n == null ? '' :
  new Intl.NumberFormat('vi-VN').format(n) + 'đ';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/products');
      setProducts(res.data.data || []);
    } catch {
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name || '',
      description: p.description || '',
      price: p.price || '',
      originalPrice: p.originalPrice || '',
      imageUrl: p.imageUrl || '',
      category: p.category || 'SOFA',
      brand: p.brand || '',
      material: p.material || '',
      dimensions: p.dimensions || '',
      color: p.color || '',
      stock: p.stock ?? 0,
      featured: p.featured ?? false,
      active: p.active ?? true,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) {
      toast.error('Vui lòng điền tên và giá sản phẩm');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        stock: Number(form.stock),
      };
      if (editingId) {
        await api.put(`/admin/products/${editingId}`, payload);
        toast.success('Đã cập nhật sản phẩm');
      } else {
        await api.post('/admin/products', payload);
        toast.success('Đã tạo sản phẩm mới');
      }
      setShowModal(false);
      fetchProducts();
    } catch {
      toast.error('Lưu thất bại, thử lại');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Đã xóa sản phẩm');
      setDeleteConfirm(null);
      fetchProducts();
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  const handleToggleActive = async (p) => {
    try {
      await api.put(`/admin/products/${p.id}`, { active: !p.active });
      toast.success(p.active ? 'Đã ẩn sản phẩm' : 'Đã hiển thị sản phẩm');
      fetchProducts();
    } catch {
      toast.error('Cập nhật thất bại');
    }
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: products.length,
    active: products.filter(p => p.active).length,
    featured: products.filter(p => p.featured).length,
    outOfStock: products.filter(p => p.stock === 0).length,
  };

  return (
    <Layout title="Quản lý sản phẩm Shop">
      <div className="space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Tổng sản phẩm', value: stats.total, color: 'text-gray-900' },
            { label: 'Đang hiển thị', value: stats.active, color: 'text-green-600' },
            { label: 'Nổi bật', value: stats.featured, color: 'text-[#1a4f3a]' },
            { label: 'Hết hàng', value: stats.outOfStock, color: 'text-red-500' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Tìm theo tên, danh mục, thương hiệu..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1a4f3a]"
            />
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-[#1a4f3a] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#2d7a5a] transition-colors shrink-0"
          >
            <Plus size={16} /> Thêm sản phẩm
          </button>
          <a
            href="/shop"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 border border-gray-200 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors shrink-0"
          >
            <Eye size={16} /> Xem Shop
          </a>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-16 text-gray-400">Đang tải...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Package size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-400">{search ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm nào'}</p>
              {!search && (
                <button onClick={openCreate} className="mt-3 text-sm text-[#1a4f3a] underline">
                  Thêm sản phẩm đầu tiên
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide w-12">#</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Sản phẩm</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">Danh mục</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Giá</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden sm:table-cell">Kho</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Trạng thái</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3 text-gray-400 text-xs">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                            {p.imageUrl
                              ? <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-gray-300" /></div>
                            }
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">{p.name}</p>
                            <p className="text-xs text-gray-400">{p.brand || '—'}</p>
                          </div>
                          {p.featured && (
                            <span className="hidden lg:inline-flex items-center gap-0.5 bg-[#e8f5ee] text-[#1a4f3a] text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                              <Sparkles size={9} /> Hot
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                        {CATEGORIES.find(c => c.key === p.category)?.label || p.category || '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[#1a4f3a]">
                        {fmt(p.price)}
                        {p.originalPrice && p.originalPrice > p.price && (
                          <p className="text-xs text-gray-400 line-through font-normal">{fmt(p.originalPrice)}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <span className={`text-xs font-bold ${p.stock === 0 ? 'text-red-500' : 'text-gray-700'}`}>
                          {p.stock ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleActive(p)}
                          title={p.active ? 'Ẩn sản phẩm' : 'Hiện sản phẩm'}
                          className="inline-flex items-center gap-1 text-xs"
                        >
                          {p.active
                            ? <><ToggleRight size={22} className="text-green-500" /><span className="hidden sm:inline text-green-600">Hiện</span></>
                            : <><ToggleLeft size={22} className="text-gray-400" /><span className="hidden sm:inline text-gray-400">Ẩn</span></>
                          }
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(p)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                            title="Xóa"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal: Create / Edit ─────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-display font-bold text-lg text-gray-900">
                {editingId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="label">Tên sản phẩm *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="field" placeholder="VD: Sofa góc L hiện đại 3 chỗ" />
                </div>
                {/* Category */}
                <div>
                  <label className="label">Danh mục *</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="field">
                    {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
                {/* Brand */}
                <div>
                  <label className="label">Thương hiệu</label>
                  <input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})}
                    className="field" placeholder="VD: HomeDecor VN" />
                </div>
                {/* Price */}
                <div>
                  <label className="label">Giá bán (VNĐ) *</label>
                  <input required type="number" min="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                    className="field" placeholder="VD: 5000000" />
                </div>
                {/* Original price */}
                <div>
                  <label className="label">Giá gốc (để tính % giảm)</label>
                  <input type="number" min="0" value={form.originalPrice} onChange={e => setForm({...form, originalPrice: e.target.value})}
                    className="field" placeholder="Để trống nếu không có" />
                </div>
                {/* Material */}
                <div>
                  <label className="label">Chất liệu</label>
                  <input value={form.material} onChange={e => setForm({...form, material: e.target.value})}
                    className="field" placeholder="VD: Gỗ sồi tự nhiên" />
                </div>
                {/* Dimensions */}
                <div>
                  <label className="label">Kích thước</label>
                  <input value={form.dimensions} onChange={e => setForm({...form, dimensions: e.target.value})}
                    className="field" placeholder="VD: 250x90x85 cm" />
                </div>
                {/* Color */}
                <div>
                  <label className="label">Màu sắc</label>
                  <input value={form.color} onChange={e => setForm({...form, color: e.target.value})}
                    className="field" placeholder="VD: Nâu gỗ tự nhiên" />
                </div>
                {/* Stock */}
                <div>
                  <label className="label">Số lượng tồn kho</label>
                  <input type="number" min="0" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})}
                    className="field" />
                </div>
                {/* Image URL */}
                <div className="md:col-span-2">
                  <label className="label">URL ảnh sản phẩm</label>
                  <input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})}
                    className="field" placeholder="https://..." />
                  {form.imageUrl && (
                    <img src={form.imageUrl} alt="preview" className="mt-2 h-20 rounded-lg object-cover border" onError={e => e.target.style.display='none'} />
                  )}
                </div>
                {/* Description */}
                <div className="md:col-span-2">
                  <label className="label">Mô tả sản phẩm</label>
                  <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                    className="field resize-none" placeholder="Mô tả chi tiết về sản phẩm..." />
                </div>
                {/* Toggles */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})}
                      className="w-4 h-4 accent-[#1a4f3a]" />
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Sparkles size={13} className="text-[#1a4f3a]" /> Nổi bật
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})}
                      className="w-4 h-4 accent-[#1a4f3a]" />
                    <span className="text-sm font-medium text-gray-700">Hiển thị công khai</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 mt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">
                  Hủy
                </button>
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1a4f3a] text-white text-sm font-bold hover:bg-[#2d7a5a] disabled:opacity-50 transition-colors">
                  <Save size={15} /> {saving ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Tạo sản phẩm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete confirm ─────────────────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Xóa sản phẩm?</h3>
            <p className="text-sm text-gray-500 mb-5">
              Sản phẩm "<strong>{deleteConfirm.name}</strong>" sẽ bị ẩn khỏi Shop.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">
                Hủy
              </button>
              <button onClick={() => handleDelete(deleteConfirm.id)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600">
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .label { display: block; font-size: 0.75rem; font-weight: 600; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
        .field { width: 100%; border: 1px solid #e5e7eb; border-radius: 10px; padding: 9px 12px; font-size: 0.875rem; outline: none; background: #fafafa; transition: border-color 0.15s; }
        .field:focus { border-color: #1a4f3a; background: white; }
      `}</style>
    </Layout>
  );
}
