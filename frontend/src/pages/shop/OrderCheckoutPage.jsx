import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ShoppingBag, MapPin, Phone, StickyNote, ChevronRight,
  Trash2, Plus, Minus, ArrowLeft, CheckCircle, Package,
  Pencil, X, Image as ImageIcon, AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';
import { toast } from 'react-hot-toast';

const fmt = (n) =>
  n == null ? '0đ' :
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n).replace('₫', 'đ');

const CATEGORY_MAP = {
  SOFA: 'Ghế sofa', TABLE: 'Bàn', CHAIR: 'Ghế',
  BED: 'Giường ngủ', CABINET: 'Tủ kệ', DECOR: 'Trang trí',
};

/* ── Giỏ hàng local (session state) ─────────────────────────────── */
const useCart = (initialItems = []) => {
  const [items, setItems] = useState(initialItems);

  const updateQty = (idx, delta) =>
    setItems(prev => prev.map((it, i) =>
      i === idx ? { ...it, quantity: Math.max(1, it.quantity + delta) } : it
    ));

  const remove = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const updateNote = (idx, note) =>
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, customNote: note } : it));

  const totalAmount = items.reduce((s, it) => s + (it.unitPrice * it.quantity), 0);

  return { items, setItems, updateQty, remove, updateNote, totalAmount };
};

/* ─────────────────────────────────────────────────────────────────── */

export default function OrderCheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  // location.state truyền từ ShopPage/ShopProductDetailPage
  const { product, quantity: initQty = 1, type = 'CATALOG' } = location.state || {};

  const { items, setItems, updateQty, remove, updateNote, totalAmount } = useCart(
    product ? [{
      productId: type === 'CATALOG' ? product.id : null,
      customItemName: type === 'CUSTOM' ? product.name || '' : null,
      customImageUrl: type === 'CUSTOM' ? product.imageUrl : null,
      itemName: product.name || '',
      imageUrl: product.imageUrl || '',
      unitPrice: product.price || 0,
      quantity: initQty,
      customNote: '',
      isCustom: type === 'CUSTOM',
    }] : []
  );

  const [form, setForm] = useState({
    deliveryAddress: user?.address || '',
    contactPhone: user?.phoneNumber || '',
    customerNote: '',
    customRequirements: '',
    referenceImageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  // Nếu vào trang mà không có state và không phải CUSTOM → lấy catalog
  const [catalog, setCatalog] = useState([]);
  const [showCatalog, setShowCatalog] = useState(false);

  useEffect(() => {
    if (!product && items.length === 0) fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      const res = await api.get('/public/products');
      setCatalog(res.data.data || []);
    } catch { /* silent */ }
  };

  const addFromCatalog = (p) => {
    setItems(prev => {
      const exists = prev.find(it => it.productId === p.id);
      if (exists) return prev.map(it => it.productId === p.id ? { ...it, quantity: it.quantity + 1 } : it);
      return [...prev, {
        productId: p.id,
        itemName: p.name,
        imageUrl: p.imageUrl || '',
        unitPrice: Number(p.price),
        quantity: 1,
        customNote: '',
        isCustom: false,
      }];
    });
    setShowCatalog(false);
    toast.success(`Đã thêm ${p.name}`);
  };

  const addCustomItem = () => {
    setItems(prev => [...prev, {
      productId: null,
      customItemName: '',
      itemName: '',
      imageUrl: '',
      unitPrice: 0,
      quantity: 1,
      customNote: '',
      isCustom: true,
    }]);
  };

  const updateCustomField = (idx, field, value) =>
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));

  const handleSubmit = async () => {
    if (items.length === 0) { toast.error('Giỏ hàng trống'); return; }
    if (!form.deliveryAddress.trim()) { toast.error('Vui lòng nhập địa chỉ giao hàng'); return; }
    if (!form.contactPhone.trim()) { toast.error('Vui lòng nhập số điện thoại'); return; }

    for (const it of items) {
      if (it.isCustom && !it.customItemName?.trim() && !it.itemName?.trim()) {
        toast.error('Vui lòng nhập tên sản phẩm tùy chỉnh'); return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        type: items.some(it => it.isCustom) ? 'CUSTOM' : 'CATALOG',
        deliveryAddress: form.deliveryAddress,
        contactPhone: form.contactPhone,
        customerNote: form.customerNote,
        customRequirements: form.customRequirements,
        referenceImageUrl: form.referenceImageUrl,
        items: items.map(it => ({
          productId: it.isCustom ? null : it.productId,
          customItemName: it.isCustom ? (it.customItemName || it.itemName) : null,
          customImageUrl: it.isCustom ? it.imageUrl : null,
          quantity: it.quantity,
          unitPrice: it.isCustom ? it.unitPrice : null,
          customNote: it.customNote,
        })),
      };
      const res = await api.post('/orders', payload);
      setSuccess(res.data.data);
      toast.success('Đặt hàng thành công!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Lỗi khi đặt hàng');
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={36} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">Đặt hàng thành công!</h1>
          <p className="text-gray-500 text-sm mb-1">Mã đơn hàng của bạn:</p>
          <p className="text-xl font-mono font-bold text-[#1a4f3a] mb-4">{success.orderCode}</p>
          <div className="bg-gray-50 rounded-2xl p-4 text-left text-sm mb-6 space-y-2">
            <div className="flex justify-between"><span className="text-gray-500">Tổng tiền:</span> <span className="font-bold text-[#1a4f3a]">{fmt(success.totalAmount)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Giao đến:</span> <span className="font-medium text-gray-800 text-right max-w-[180px]">{success.deliveryAddress}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Trạng thái:</span> <span className="badge badge-amber">{success.statusLabel}</span></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/orders')}
              className="flex-1 bg-[#1a4f3a] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#2d7a5a] transition-colors">
              Xem đơn hàng
            </button>
            <button onClick={() => navigate('/shop')}
              className="flex-1 border border-gray-200 py-3 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors">
              Tiếp tục mua
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCustomOrder = items.some(it => it.isCustom);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
            <ArrowLeft size={16} /> Quay lại
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#1a4f3a] flex items-center justify-center">
              <ShoppingBag size={14} className="text-white" />
            </div>
            <span className="font-display font-bold text-base text-gray-900">Thanh toán đơn hàng</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── LEFT: Giỏ hàng ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag size={18} className="text-[#1a4f3a]" /> Sản phẩm đặt hàng
              </h2>
              <div className="flex gap-2">
                <button onClick={() => { fetchCatalog(); setShowCatalog(true); }}
                  className="flex items-center gap-1.5 text-xs font-medium border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <Plus size={13}/> Thêm SP có sẵn
                </button>
                <button onClick={addCustomItem}
                  className="flex items-center gap-1.5 text-xs font-medium border border-[#1a4f3a] text-[#1a4f3a] px-3 py-1.5 rounded-xl hover:bg-primary-bg transition-colors">
                  <Pencil size={13}/> Thêm SP tùy chỉnh
                </button>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <Package size={40} className="mx-auto text-gray-200 mb-3" />
                <p className="text-sm">Giỏ hàng trống. Thêm sản phẩm để tiếp tục.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {items.map((it, idx) => (
                  <div key={idx} className="p-4">
                    <div className="flex gap-3">
                      {/* Image */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        {it.imageUrl
                          ? <img src={it.imageUrl} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center"><Package size={20} className="text-gray-300" /></div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        {it.isCustom ? (
                          <div className="flex flex-wrap gap-2 mb-2">
                            <input
                              value={it.customItemName || it.itemName}
                              onChange={e => updateCustomField(idx, 'customItemName', e.target.value)}
                              placeholder="Tên sản phẩm tùy chỉnh *"
                              className="flex-1 min-w-[140px] border border-amber-300 rounded-lg px-2 py-1 text-sm font-semibold text-gray-800 outline-none focus:border-[#1a4f3a] bg-amber-50"
                            />
                            <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-1 rounded-full self-start">Tùy chỉnh</span>
                          </div>
                        ) : (
                          <p className="font-semibold text-gray-800 text-sm mb-1 line-clamp-1">{it.itemName}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-3">
                          {it.isCustom ? (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-500">Đơn giá:</span>
                              <input type="number" min="0"
                                value={it.unitPrice}
                                onChange={e => updateCustomField(idx, 'unitPrice', Number(e.target.value))}
                                className="border border-gray-200 rounded-lg px-2 py-0.5 text-xs w-28 outline-none focus:border-[#1a4f3a]"
                              />
                              <span className="text-xs text-gray-500">đ</span>
                            </div>
                          ) : (
                            <span className="text-sm font-bold text-[#1a4f3a]">{fmt(it.unitPrice)}</span>
                          )}
                          {/* Quantity */}
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                            <button onClick={() => updateQty(idx, -1)} className="px-2 py-1 hover:bg-gray-100 text-gray-600"><Minus size={12}/></button>
                            <span className="px-3 text-sm font-bold min-w-[30px] text-center">{it.quantity}</span>
                            <button onClick={() => updateQty(idx, 1)} className="px-2 py-1 hover:bg-gray-100 text-gray-600"><Plus size={12}/></button>
                          </div>
                          <span className="text-sm font-bold text-gray-800">{fmt(it.unitPrice * it.quantity)}</span>
                          <button onClick={() => remove(idx)} className="ml-auto text-gray-400 hover:text-red-500 p-1">
                            <Trash2 size={15}/>
                          </button>
                        </div>

                        {/* Custom note per item */}
                        <input
                          value={it.customNote}
                          onChange={e => updateNote(idx, e.target.value)}
                          placeholder="Ghi chú: màu sắc, kích thước, vật liệu..."
                          className="mt-2 w-full border border-gray-100 rounded-lg px-3 py-1.5 text-xs text-gray-600 outline-none focus:border-[#1a4f3a] bg-gray-50"
                        />
                      </div>
                    </div>

                    {/* Custom item: image URL */}
                    {it.isCustom && (
                      <div className="mt-2 flex items-center gap-2">
                        <ImageIcon size={13} className="text-gray-400 shrink-0" />
                        <input
                          value={it.imageUrl}
                          onChange={e => updateCustomField(idx, 'imageUrl', e.target.value)}
                          placeholder="URL ảnh tham khảo (không bắt buộc)"
                          className="flex-1 border border-gray-100 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#1a4f3a] bg-gray-50"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Yêu cầu tùy chỉnh (khi có custom item) */}
          {isCustomOrder && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <h3 className="font-bold text-amber-800 text-sm mb-3 flex items-center gap-2">
                <AlertCircle size={15}/> Yêu cầu thiết kế / sản xuất riêng
              </h3>
              <textarea rows={3} value={form.customRequirements}
                onChange={e => setForm({...form, customRequirements: e.target.value})}
                placeholder="Mô tả chi tiết yêu cầu: phong cách, kích thước chính xác, vật liệu, màu sắc..."
                className="w-full border border-amber-300 rounded-xl p-3 text-sm outline-none focus:border-[#1a4f3a] bg-white resize-none"
              />
              <div className="mt-2">
                <input value={form.referenceImageUrl}
                  onChange={e => setForm({...form, referenceImageUrl: e.target.value})}
                  placeholder="URL ảnh tham khảo thiết kế (không bắt buộc)"
                  className="w-full border border-amber-300 rounded-xl p-2.5 text-xs outline-none focus:border-[#1a4f3a] bg-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Thông tin giao hàng + Tổng ── */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-[#1a4f3a]" /> Thông tin giao hàng
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Địa chỉ giao hàng *</label>
                <textarea rows={2} value={form.deliveryAddress}
                  onChange={e => setForm({...form, deliveryAddress: e.target.value})}
                  placeholder="Số nhà, đường, quận, thành phố..."
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-[#1a4f3a] resize-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Số điện thoại *</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-3 text-gray-400" />
                  <input value={form.contactPhone}
                    onChange={e => setForm({...form, contactPhone: e.target.value})}
                    placeholder="0901 234 567"
                    className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#1a4f3a]"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Ghi chú cho đơn hàng</label>
                <textarea rows={2} value={form.customerNote}
                  onChange={e => setForm({...form, customerNote: e.target.value})}
                  placeholder="Giao giờ hành chính, gọi trước 30 phút..."
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-[#1a4f3a] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Tóm tắt đơn */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-4">Tóm tắt đơn hàng</h2>
            <div className="space-y-2 text-sm mb-4">
              {items.map((it, i) => (
                <div key={i} className="flex justify-between text-gray-600">
                  <span className="line-clamp-1 flex-1 mr-2">{it.isCustom ? (it.customItemName || 'SP tùy chỉnh') : it.itemName} × {it.quantity}</span>
                  <span className="font-medium shrink-0">{fmt(it.unitPrice * it.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between font-bold text-gray-900">
                <span>Tổng cộng</span>
                <span className="text-[#1a4f3a] text-lg">{fmt(totalAmount)}</span>
              </div>
              {isCustomOrder && (
                <p className="text-xs text-amber-600 mt-2 flex items-start gap-1">
                  <AlertCircle size={12} className="mt-0.5 shrink-0"/> Đơn tùy chỉnh: Giá cuối sẽ được nhà thầu xác nhận sau khi xem xét yêu cầu.
                </p>
              )}
            </div>

            <button onClick={handleSubmit} disabled={loading || items.length === 0}
              className="w-full bg-[#1a4f3a] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#2d7a5a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#1a4f3a]/20 flex items-center justify-center gap-2">
              {loading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Đang xử lý...</>
                : <><ShoppingBag size={16}/> Xác nhận đặt hàng</>}
            </button>

            <p className="text-center text-xs text-gray-400 mt-3">
              Bằng cách đặt hàng, bạn đồng ý với <span className="underline cursor-pointer">điều khoản dịch vụ</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── Catalog picker modal ── */}
      {showCatalog && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Chọn sản phẩm từ catalog</h3>
              <button onClick={() => setShowCatalog(false)} className="p-2 rounded-lg hover:bg-gray-100"><X size={18}/></button>
            </div>
            <div className="overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {catalog.filter(p => p.stock > 0 && p.active).map(p => (
                <button key={p.id} onClick={() => addFromCatalog(p)}
                  className="text-left rounded-xl border border-gray-200 p-3 hover:border-[#1a4f3a] hover:shadow-md transition-all">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
                    {p.imageUrl ? <img src={p.imageUrl} alt="" className="w-full h-full object-cover" /> : <Package size={20} className="mx-auto mt-4 text-gray-200" />}
                  </div>
                  <p className="text-xs font-semibold text-gray-800 line-clamp-2">{p.name}</p>
                  <p className="text-xs font-bold text-[#1a4f3a] mt-1">{fmt(p.price)}</p>
                  <p className="text-[10px] text-gray-400">Còn {p.stock} cái</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
