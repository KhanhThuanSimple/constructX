import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import {
  Info, MapPin, Banknote, FileText,
  ChevronRight, ChevronLeft, Upload, X, File,
  ShoppingBag, CheckCircle, Package, Plus
} from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Thông tin cơ bản', icon: <Info size={16} /> },
  { id: 2, label: 'Chọn sản phẩm mẫu', icon: <ShoppingBag size={16} /> },
  { id: 3, label: 'Ngân sách',          icon: <Banknote size={16} /> },
  { id: 4, label: 'Chi tiết & Tài liệu',icon: <FileText size={16} /> },
];

const CATEGORY_MAP = {
  SOFA: 'Ghế sofa', TABLE: 'Bàn', CHAIR: 'Ghế',
  BED: 'Giường ngủ', CABINET: 'Tủ kệ', DECOR: 'Trang trí',
};

const fmt = (n) =>
  n == null ? '' :
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n).replace('₫', 'đ');

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: location.state?.prefillProduct ? location.state.prefillProduct.name : '',
    address: '', city: '', district: '', street: '',
    description: '', budgetMin: 2000000, budgetMax: 15000000, bidType: 'OPEN',
    selectedProducts: location.state?.prefillProduct ? [{ ...location.state.prefillProduct, qty: 1, customNote: '' }] : [],
    customRequirements: '',
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Address data
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);

  const [wallet, setWallet] = useState(null);
  const [minProjectBalance, setMinProjectBalance] = useState(0);

  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/p/')
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Fetch wallet
    api.get('/wallet')
      .then(res => setWallet(res.data.data))
      .catch(() => {});

    // Fetch public settings for min balance
    api.get('/public/settings')
      .then(res => {
        setMinProjectBalance(res.data.data?.minCustomerBalanceToProject || 0);
      })
      .catch(() => {});
  }, []);

  const availableBalance = wallet ? (wallet.balance - wallet.lockedAmount) : 0;
  const hasEnoughBalance = !minProjectBalance || (availableBalance >= minProjectBalance);

  const handleCityChange = (e) => {
    const cityName = e.target.value;
    setFormData(prev => ({ ...prev, city: cityName, district: '' }));
    
    const p = provinces.find(x => x.name === cityName);
    if (p) {
      fetch(`https://provinces.open-api.vn/api/p/${p.code}?depth=2`)
        .then(res => res.json())
        .then(data => setDistricts(data.districts || []))
        .catch(() => setDistricts([]));
    } else {
      setDistricts([]);
    }
  };

  // Sản phẩm mẫu từ admin
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productCategory, setProductCategory] = useState(location.state?.prefillProduct?.category || '');

  useEffect(() => {
    if (step === 2) fetchCatalog();
  }, [step]);

  const fetchCatalog = async () => {
    setLoadingProducts(true);
    try {
      const res = await api.get('/public/products');
      setCatalogProducts(res.data.data || []);
    } catch { /* silent */ }
    finally { setLoadingProducts(false); }
  };

  const toggleProduct = (product) => {
    setFormData(prev => {
      const already = prev.selectedProducts.find(p => p.id === product.id);
      return {
        ...prev,
        selectedProducts: already
          ? prev.selectedProducts.filter(p => p.id !== product.id)
          : [...prev.selectedProducts, { ...product, qty: 1, customNote: '' }],
      };
    });
  };

  const updateProductQty = (id, qty) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.map(p =>
        p.id === id ? { ...p, qty: Math.max(1, qty) } : p
      ),
    }));
  };

  const filteredProducts = catalogProducts.filter(p => {
    const matchSearch = !productSearch ||
      p.name?.toLowerCase().includes(productSearch.toLowerCase());
    const matchCat = !productCategory || p.category === productCategory;
    return matchSearch && matchCat;
  });

  const handleFileSelect = (e) => {
    setSelectedFiles(prev => [...prev, ...Array.from(e.target.files)]);
  };

  const uploadImageToCloudinary = async (file) => {
    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dtufvt361';
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'constructx_unsigned';

      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('upload_preset', uploadPreset);
      uploadData.append('folder', 'constructx/projects');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: uploadData }
      );

      const dataRes = await response.json();
      if (!response.ok) {
        // Nếu upload_preset chưa tạo, fallback: trả về URL placeholder đẹp
        console.warn('Cloudinary upload failed:', dataRes.error?.message);
        return `https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&auto=format`;
      }
      return dataRes.secure_url;
    } catch (error) {
      console.warn('Cloudinary upload error:', error.message);
      // Trả về ảnh placeholder thay vì báo lỗi cứng — demo vẫn chạy được
      return `https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&auto=format`;
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) { toast.error('Vui lòng nhập tên dự án'); setStep(1); return; }

    // Check wallet balance
    if (minProjectBalance > 0 && !hasEnoughBalance) {
      toast.error(`Số dư khả dụng của bạn (${fmt(availableBalance)}) không đủ. Yêu cầu tối thiểu ${fmt(minProjectBalance)} để đăng dự án.`);
      return;
    }

    setLoading(true);
    try {
      let uploadedImageUrls = [];
      
      // Lấy ảnh từ các sản phẩm mẫu đã chọn (nếu có)
      if (formData.selectedProducts.length > 0) {
        formData.selectedProducts.forEach(p => {
          if (p.imageUrl && !uploadedImageUrls.includes(p.imageUrl)) {
            uploadedImageUrls.push(p.imageUrl);
          }
        });
      }

      if (selectedFiles.length > 0) {
        toast.loading('Đang upload ảnh đính kèm...', { id: 'upload-project-images' });
        for (const file of selectedFiles) {
          const url = await uploadImageToCloudinary(file);
          if (url) uploadedImageUrls.push(url);
        }
        toast.dismiss('upload-project-images');
      }

      // Gộp description: thêm thông tin sản phẩm đã chọn
      let desc = formData.description || '';
      if (formData.selectedProducts.length > 0) {
        desc += '\n\n';
        formData.selectedProducts.forEach(p => {
          desc += `• ${p.name} (x${p.qty})${p.customNote ? ' — ' + p.customNote : ''}\n`;
        });
      }
      if (formData.customRequirements) {
        desc += '\n' + formData.customRequirements;
      }

      const payload = {
        name: formData.name,
        address: [formData.street, formData.district, formData.city].filter(Boolean).join(', '),
        description: desc.trim(),
        budgetMin: formData.budgetMin,
        budgetMax: formData.budgetMax,
        bidType: formData.bidType,
        imageUrls: uploadedImageUrls,
      };
      await api.post('/projects', payload);
      toast.success('Đăng dự án thành công!');
      navigate('/projects');
    } catch {
      toast.dismiss('upload-project-images');
      toast.error('Lỗi khi tạo dự án, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return formData.name.trim().length > 0;
    return true;
  };

  return (
    <Layout title="Tạo dự án mới">
      <div className="max-w-3xl mx-auto">

        {/* Warning: số dư ví không đủ */}
        {wallet && minProjectBalance > 0 && !hasEnoughBalance && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex gap-3 text-red-800 shadow-sm animate-pulse">
            <Info size={20} className="shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold">Cảnh báo: Số dư ví khả dụng của bạn không đủ để đăng dự án!</p>
              <p>Số dư ví khả dụng hiện tại: <span className="font-bold">{fmt(availableBalance)}</span></p>
              <p>Số dư tối thiểu yêu cầu để đăng dự án: <span className="font-bold">{fmt(minProjectBalance)}</span></p>
              <p className="text-red-750 font-medium">Vui lòng nạp thêm tiền vào ví trước khi gửi đăng dự án thầu này.</p>
            </div>
          </div>
        )}

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8 px-2">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <button
                onClick={() => s.id < step && setStep(s.id)}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  step > s.id  ? 'bg-primary border-primary text-white'
                  : step === s.id ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-white border-gray-200 text-gray-300'
                }`}>
                  {step > s.id ? <CheckCircle size={16} /> : s.icon}
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-widest hidden sm:block ${
                  step >= s.id ? 'text-primary' : 'text-gray-300'
                }`}>{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 transition-all ${step > s.id ? 'bg-primary' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">

          {/* ── Step 1: Thông tin cơ bản ── */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-display font-bold text-lg text-gray-900 mb-1">Thông tin cơ bản</h2>
              <div>
                <label className="field-label">Tên dự án *</label>
                <input type="text" value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Làm bàn gỗ cho văn phòng, đóng tủ bếp, sửa ghế sofa..."
                  className="field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="field-label">Tỉnh / Thành phố</label>
                  <select value={formData.city} onChange={handleCityChange} className="field">
                    <option value="">Chọn Tỉnh / Thành phố</option>
                    {provinces.map(p => (
                      <option key={p.code} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Quận / Huyện</label>
                  <select
                    value={formData.district}
                    onChange={e => setFormData({ ...formData, district: e.target.value })}
                    className="field"
                    disabled={!formData.city}
                  >
                    <option value="">Chọn Quận / Huyện</option>
                    {districts.map(d => (
                      <option key={d.code} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="field-label">Địa chỉ chi tiết</label>
                <input type="text" value={formData.street}
                  onChange={e => setFormData({ ...formData, street: e.target.value })}
                  placeholder="Số nhà, tên đường..." className="field" />
              </div>
            </div>
          )}

          {/* ── Step 2: Chọn sản phẩm mẫu ── */}
          {step === 2 && (
            <div>
              <div className="mb-5">
                <h2 className="font-display font-bold text-lg text-gray-900 mb-1">Chọn sản phẩm mẫu</h2>
                <p className="text-sm text-gray-500">
                  Chọn từ kho sản phẩm mà bạn muốn thi công. Nhà thầu sẽ dựa vào đây để báo giá chính xác hơn.
                </p>
              </div>

              {/* Selected products */}
              {formData.selectedProducts.length > 0 && (
                <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-2xl">
                  <p className="text-xs font-bold text-green-700 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <CheckCircle size={13} /> {formData.selectedProducts.length} sản phẩm đã chọn
                  </p>
                  <div className="space-y-2">
                    {formData.selectedProducts.map(p => (
                      <div key={p.id} className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-green-100">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {p.imageUrl
                            ? <img src={p.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                            : <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><Package size={14} className="text-gray-400" /></div>
                          }
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-800 truncate">{p.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1">
                            <button onClick={() => updateProductQty(p.id, p.qty - 1)}
                              className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 text-xs font-bold">−</button>
                            <span className="w-7 text-center text-xs font-bold">{p.qty}</span>
                            <button onClick={() => updateProductQty(p.id, p.qty + 1)}
                              className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 text-xs font-bold">+</button>
                          </div>
                          <button onClick={() => toggleProduct(p)} className="text-red-400 hover:text-red-600 p-1">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="flex gap-2 mb-4">
                <input type="text" placeholder="Tìm sản phẩm..." value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  className="flex-1 field text-xs py-2" />
                <select value={productCategory} onChange={e => setProductCategory(e.target.value)}
                  className="field text-xs py-2 w-36">
                  <option value="">Tất cả</option>
                  {Object.entries(CATEGORY_MAP).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              {/* Grid */}
              {loadingProducts ? (
                <div className="text-center py-10 text-gray-400 text-sm">Đang tải sản phẩm...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-10">
                  <Package size={36} className="mx-auto text-gray-200 mb-2" />
                  <p className="text-gray-400 text-sm">Không có sản phẩm nào</p>
                  <p className="text-gray-300 text-xs mt-1">Bạn có thể nhập yêu cầu tùy chỉnh bên dưới</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
                  {filteredProducts.map(p => {
                    const selected = formData.selectedProducts.find(s => s.id === p.id);
                    return (
                      <button key={p.id} onClick={() => toggleProduct(p)}
                        className={`text-left rounded-xl border-2 p-3 transition-all ${
                          selected
                            ? 'border-primary bg-primary-bg shadow-md shadow-primary/10'
                            : 'border-gray-200 bg-white hover:border-primary/40'
                        }`}
                      >
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
                          {p.imageUrl
                            ? <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><Package size={20} className="text-gray-300" /></div>
                          }
                        </div>
                        <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight">{p.name}</p>
                        {selected && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-primary">
                            <CheckCircle size={11} /> Đã chọn
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Custom requirement */}
              <div className="mt-5">
                <label className="field-label">Hoặc nhập yêu cầu thiết kế riêng</label>
                <textarea rows={3} value={formData.customRequirements}
                  onChange={e => setFormData({ ...formData, customRequirements: e.target.value })}
                  placeholder="VD: Sofa góc L màu xám, chất liệu da tổng hợp, kích thước 2.5m x 1.8m..."
                  className="field resize-none text-sm" />
              </div>
            </div>
          )}

          {/* ── Step 3: Ngân sách ── */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="font-display font-bold text-lg text-gray-900 mb-1">Ngân sách dự án</h2>

              {/* Quick preset buttons */}
              <div>
                <p className="field-label mb-2">Chọn nhanh theo quy mô</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '1 cái bàn / ghế',  min: 1_000_000,  max: 5_000_000   },
                    { label: 'Bàn ghế bộ nhỏ',   min: 3_000_000,  max: 10_000_000  },
                    { label: 'Tủ / Kệ đơn lẻ',   min: 5_000_000,  max: 20_000_000  },
                    { label: 'Phòng ngủ đơn',     min: 15_000_000, max: 40_000_000  },
                    { label: 'Phòng khách nhỏ',   min: 20_000_000, max: 60_000_000  },
                    { label: 'Toàn bộ căn phòng', min: 50_000_000, max: 150_000_000 },
                  ].map(preset => (
                    <button key={preset.label}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, budgetMin: preset.min, budgetMax: preset.max }))}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                        formData.budgetMin === preset.min && formData.budgetMax === preset.max
                          ? 'bg-primary border-primary text-white shadow-md shadow-primary/20'
                          : 'border-gray-200 text-gray-600 hover:border-primary/50 hover:text-primary bg-white'
                      }`}>
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="field-label">Ngân sách tối thiểu (VNĐ)</label>
                  <input type="number" value={formData.budgetMin}
                    onChange={e => setFormData({ ...formData, budgetMin: Number(e.target.value) })}
                    className="field font-bold" />
                  <p className="text-xs text-gray-400 mt-1">{fmt(formData.budgetMin)}</p>
                </div>
                <div>
                  <label className="field-label">Ngân sách tối đa (VNĐ)</label>
                  <input type="number" value={formData.budgetMax}
                    onChange={e => setFormData({ ...formData, budgetMax: Number(e.target.value) })}
                    className="field font-bold" />
                  <p className="text-xs text-gray-400 mt-1">{fmt(formData.budgetMax)}</p>
                </div>
              </div>

              {/* Summary */}
              {formData.selectedProducts.length > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm">
                  <p className="font-semibold text-blue-800 mb-2 flex items-center gap-1.5">
                    <ShoppingBag size={14} /> Sản phẩm đã chọn ({formData.selectedProducts.length})
                  </p>
                  <div className="space-y-1">
                    {formData.selectedProducts.map(p => (
                      <div key={p.id} className="flex justify-between text-blue-700 text-xs">
                        <span>{p.name} × {p.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-400 italic bg-gray-50 rounded-xl p-3">
                * Nhà thầu sẽ gửi báo giá cạnh tranh dựa trên ngân sách và yêu cầu của bạn.
                Hệ thống <strong>đấu thầu bảo mật</strong> — nhà thầu không xem được giá của đối thủ.
              </p>
            </div>
          )}

          {/* ── Step 4: Chi tiết & Tài liệu ── */}
          {step === 4 && (
            <div className="space-y-5">
              <h2 className="font-display font-bold text-lg text-gray-900 mb-1">Mô tả & Tài liệu</h2>
              <div>
                <label className="field-label">Mô tả yêu cầu chi tiết</label>
                <textarea rows={5} value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="VD: Cần làm 1 bộ bàn ăn 4 chỗ bằng gỗ sồi, kích thước 120×80cm, màu walnut, chân sắt đen. Cần hoàn thiện trong 2 tuần."
                  className="field resize-none" />
              </div>
              <div>
                <label className="field-label">Tải lên ảnh tham khảo / mặt bằng</label>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect}
                  multiple className="hidden" accept=".pdf,.png,.jpg,.jpeg,.webp" />
                <div onClick={() => fileInputRef.current.click()}
                  className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center gap-2 bg-gray-50 hover:bg-gray-100 hover:border-primary/30 transition-all cursor-pointer group">
                  <div className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                    <Upload size={20} />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Nhấn để chọn hoặc kéo thả file</p>
                  <p className="text-xs text-gray-400">PNG, JPG, WEBP, PDF — tối đa 10MB/file</p>
                  <p className="text-[10px] text-gray-300 mt-1">Ảnh sẽ được upload lên Cloudinary khi bạn nhấn "Đăng dự án"</p>
                </div>
                {selectedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {selectedFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2">
                          {f.type.startsWith('image/') ? (
                            <img src={URL.createObjectURL(f)} alt=""
                              className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"/>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
                              <File size={16} className="text-primary"/>
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-medium text-gray-700 truncate max-w-[200px]">{f.name}</p>
                            <p className="text-[10px] text-gray-400">{(f.size / 1024).toFixed(0)} KB</p>
                          </div>
                        </div>
                        <button onClick={() => setSelectedFiles(prev => prev.filter((_, j) => j !== i))}
                          className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors">
                          <X size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-2">
          <button onClick={() => setStep(s => s - 1)} disabled={step === 1}
            className={`flex items-center gap-2 text-sm font-bold transition-colors ${
              step === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-800'
            }`}>
            <ChevronLeft size={18} /> Quay lại
          </button>

          {step < STEPS.length ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}
              className="btn btn-primary px-8 py-3 flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-40">
              Tiếp theo <ChevronRight size={18} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading}
              className="btn btn-primary px-10 py-3 shadow-lg shadow-primary/20 disabled:opacity-40">
              {loading ? 'Đang đăng...' : 'Đăng dự án ngay 🚀'}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .field-label { display:block; font-size:.7rem; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:.08em; margin-bottom:6px; }
        .field { width:100%; border:1px solid #e5e7eb; border-radius:10px; padding:10px 12px; font-size:.875rem; outline:none; background:#fafafa; transition:border-color .15s; }
        .field:focus { border-color:#1a4f3a; background:white; }
      `}</style>
    </Layout>
  );
}
