import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Star, Heart, ShoppingBag, Truck, Shield,
  RefreshCw, Share2, CheckCircle, Package, ChevronRight,
  Phone, Minus, Plus, Sparkles,
} from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';

const fmt = (n) =>
  n == null
    ? ''
    : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
        .format(n)
        .replace('₫', 'đ');

const CATEGORIES = {
  SOFA: 'Ghế sofa', TABLE: 'Bàn', CHAIR: 'Ghế',
  BED: 'Giường ngủ', CABINET: 'Tủ kệ', DECOR: 'Trang trí',
};

export default function ShopProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('desc');
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    fetchProduct();
    window.scrollTo({ top: 0 });
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/public/products/${id}`);
      const p = res.data.data;
      setProduct(p);
      // fetch related (same category)
      if (p?.category) {
        const relRes = await api.get(`/public/products?category=${p.category}`);
        setRelated((relRes.data.data || []).filter(r => r.id !== p.id).slice(0, 4));
      }
    } catch {
      navigate('/shop');
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = () => {
    if (!token) {
      navigate('/login', { state: { redirect: '/projects/new', prefillProduct: product } });
    } else {
      navigate('/projects/new', { state: { prefillProduct: product } });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-[#1a4f3a] border-t-transparent animate-spin" />
          <p className="text-gray-400 text-sm">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const disc = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Navbar mini ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/shop')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft size={16} /> Quay lại Shop
            </button>
            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
              <Link to="/shop" className="hover:text-[#1a4f3a]">Shop</Link>
              <ChevronRight size={12} />
              {product.category && (
                <>
                  <span className="hover:text-[#1a4f3a] cursor-pointer" onClick={() => navigate(`/shop?category=${product.category}`)}>
                    {CATEGORIES[product.category] || product.category}
                  </span>
                  <ChevronRight size={12} />
                </>
              )}
              <span className="text-gray-600 line-clamp-1 max-w-[160px]">{product.name}</span>
            </div>
          </div>
          <Link to="/shop" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#1a4f3a] flex items-center justify-center">
              <ShoppingBag size={14} className="text-white" />
            </div>
            <span className="font-display font-bold text-base text-gray-900 hidden sm:block">
              Construct<span className="text-[#1a4f3a]">X</span> Shop
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* ── Product block ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-16">
          {/* Left: Image */}
          <div className="relative">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-50 shadow-lg">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  onLoad={() => setImgLoaded(true)}
                  className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <ShoppingBag size={80} className="text-gray-300" />
                </div>
              )}
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.featured && (
                  <span className="bg-[#1a4f3a] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow">
                    <Sparkles size={11} /> Bán chạy
                  </span>
                )}
              </div>
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-3xl">
                  <span className="bg-white text-gray-800 font-bold px-5 py-2 rounded-full text-sm">Hết hàng</span>
                </div>
              )}
            </div>
            {/* Wishlist */}
            <button
              onClick={() => setWishlisted(!wishlisted)}
              className={`absolute top-4 right-4 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all ${
                wishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Right: Info */}
          <div className="flex flex-col">
            {/* Category tag */}
            {product.category && (
              <span className="inline-flex items-center gap-1.5 bg-[#e8f5ee] text-[#1a4f3a] text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full w-fit mb-3">
                {CATEGORIES[product.category] || product.category}
              </span>
            )}

            <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 leading-tight mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            {product.rating > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16}
                      className={i < Math.round(product.rating) ? 'text-amber-400' : 'text-gray-200'}
                      fill={i < Math.round(product.rating) ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-900">{product.rating.toFixed(1)}</span>
                <span className="text-sm text-gray-400">({product.reviewCount} đánh giá)</span>
              </div>
            )}

            {/* Specs mini */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-2xl mb-6 text-sm">
              {product.brand && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Thương hiệu</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{product.brand}</p>
                </div>
              )}
              {product.material && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Chất liệu</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{product.material}</p>
                </div>
              )}
              {product.dimensions && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Kích thước</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{product.dimensions}</p>
                </div>
              )}
              {product.color && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Màu sắc</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{product.color}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Kho hàng</p>
                <p className={`font-semibold mt-0.5 flex items-center gap-1 ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {product.stock > 0
                    ? <><CheckCircle size={13} /> Còn {product.stock} sản phẩm</>
                    : 'Hết hàng'}
                </p>
              </div>
            </div>

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium text-gray-700">Số lượng:</span>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-3 py-2 hover:bg-gray-100 transition-colors"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="px-4 py-2 text-sm font-bold min-w-[40px] text-center">{qty}</span>
                  <button
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="px-3 py-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleOrder}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-[#1a4f3a] text-white font-bold py-3.5 rounded-xl hover:bg-[#2d7a5a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#1a4f3a]/25 active:scale-[0.98]"
              >
                <ShoppingBag size={18} />
                {product.stock === 0 ? 'Hết hàng' : 'Tạo dự án ngay'}
              </button>
              <button
                onClick={() => setWishlisted(!wishlisted)}
                className={`px-4 rounded-xl border-2 transition-all active:scale-95 ${
                  wishlisted ? 'border-red-500 bg-red-50 text-red-500' : 'border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-400'
                }`}
              >
                <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
              <button className="px-4 rounded-xl border-2 border-gray-200 text-gray-500 hover:border-gray-300 transition-colors active:scale-95">
                <Share2 size={20} />
              </button>
            </div>

            {/* Notice nếu chưa đăng nhập */}
            {!token && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800 mb-4">
                <Package size={16} className="mt-0.5 shrink-0" />
                <span>
                  Bạn cần <Link to="/login" className="font-bold underline">đăng nhập</Link> để đặt hàng hoặc liên hệ nhà thầu thi công.
                </span>
              </div>
            )}

            {/* Mini policies */}
            <div className="space-y-2.5">
              {[
                { icon: <Truck size={15} className="text-[#1a4f3a]" />, text: 'Miễn phí vận chuyển đơn từ 5 triệu' },
                { icon: <Shield size={15} className="text-[#1a4f3a]" />, text: 'Bảo hành chính hãng 12 – 24 tháng' },
                { icon: <RefreshCw size={15} className="text-[#1a4f3a]" />, text: 'Đổi trả trong 30 ngày nếu lỗi nhà sản xuất' },
                { icon: <Phone size={15} className="text-[#1a4f3a]" />, text: 'Hotline: 1800 6060 (8h – 22h)' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-xs text-gray-500">
                  {item.icon} {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs: Mô tả / Thông số ──────────────────────────────── */}
        <div className="mb-16">
          <div className="flex border-b border-gray-200 mb-6 gap-6">
            {[
              { key: 'desc', label: 'Mô tả sản phẩm' },
              { key: 'spec', label: 'Thông số kỹ thuật' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-[#1a4f3a] text-[#1a4f3a]'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {activeTab === 'desc' ? (
            <div className="max-w-3xl">
              {product.description ? (
                <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">{product.description}</p>
              ) : (
                <p className="text-gray-400 text-sm italic">Chưa có mô tả chi tiết cho sản phẩm này.</p>
              )}
            </div>
          ) : (
            <div className="max-w-2xl">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ['Tên sản phẩm', product.name],
                    ['Danh mục', CATEGORIES[product.category] || product.category],
                    ['Thương hiệu', product.brand],
                    ['Chất liệu', product.material],
                    ['Kích thước', product.dimensions],
                    ['Màu sắc', product.color],
                    ['Tồn kho', product.stock != null ? `${product.stock} sản phẩm` : null],
                  ].filter(([, val]) => val).map(([label, val]) => (
                    <tr key={label} className="border-b border-gray-100">
                      <td className="py-3 pr-8 text-gray-500 font-medium w-1/3">{label}</td>
                      <td className="py-3 text-gray-900">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Related products ──────────────────────────────────────── */}
        {related.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold text-gray-900">Sản phẩm cùng loại</h2>
              <button onClick={() => navigate('/shop')} className="text-sm font-semibold text-[#1a4f3a] flex items-center gap-1 hover:gap-2 transition-all">
                Xem thêm <ChevronRight size={15} />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {related.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/shop/products/${p.id}`)}
                  className="group cursor-pointer bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden"
                >
                  <div className="aspect-square bg-gray-50 overflow-hidden">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={30} className="text-gray-200" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold text-gray-800 line-clamp-2 mb-1">{p.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CTA bottom ────────────────────────────────────────────── */}
        <div className="mt-16 bg-gradient-to-r from-[#1a4f3a] to-[#1a3a5c] rounded-3xl p-8 text-center text-white">
          <h2 className="text-xl font-display font-bold mb-2">Cần tư vấn hay thi công sản phẩm này?</h2>
          <p className="text-white/70 text-sm mb-5">
            ConstructX có hàng trăm nhà thầu chuyên lắp đặt nội thất — kết nối ngay, miễn phí.
          </p>
          <Link
            to={token ? '/' : '/register'}
            className="inline-flex items-center gap-2 bg-white text-[#1a4f3a] font-bold px-7 py-3 rounded-full hover:bg-green-50 transition-colors shadow-lg"
          >
            {token ? 'Vào sàn thi công' : 'Đăng ký ngay'} <ChevronRight size={15} />
          </Link>
        </div>
      </main>

      {/* ── Footer mini ──────────────────────────────────────────────── */}
      <footer className="bg-[#0d1f16] text-white/40 text-center py-6 text-xs mt-10">
        © {new Date().getFullYear()} ConstructX. Tất cả quyền được bảo lưu. &nbsp;
        <Link to="/shop" className="underline hover:text-white/70 transition-colors">← Quay lại Shop</Link>
      </footer>
    </div>
  );
}
