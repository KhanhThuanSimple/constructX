import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  Search,
  MapPin,
  Clock,
  ChevronRight,
  Star,
  Shield,
  Zap,
  Users,
  Hammer,
  Package,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Award,
  HeadphonesIcon,
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

/* ------------------------------------------------------------------ */
/*  Dữ liệu tĩnh để trang vẫn có nội dung kể cả khi chưa có dữ liệu  */
/* ------------------------------------------------------------------ */
const PLATFORM_STATS = [
  { label: 'Nhà thầu uy tín', value: '500+', icon: <Users size={22} /> },
  { label: 'Dự án hoàn thành', value: '1.200+', icon: <CheckCircle size={22} /> },
  { label: 'Khách hàng hài lòng', value: '98%', icon: <Star size={22} /> },
  { label: 'Năm hoạt động', value: '5+', icon: <Award size={22} /> },
];

const PLATFORM_FEATURES = [
  {
    icon: <Shield size={28} className="text-[#1a4f3a]" />,
    title: 'Thanh toán an toàn',
    desc: 'Tiền được giữ trong hệ thống escrow, chỉ giải ngân khi bạn nghiệm thu xong công trình.',
  },
  {
    icon: <Zap size={28} className="text-[#1a4f3a]" />,
    title: 'Nhận báo giá nhanh',
    desc: 'Đăng dự án và nhận báo giá từ nhiều nhà thầu trong vòng 24 giờ.',
  },
  {
    icon: <Star size={28} className="text-[#1a4f3a]" />,
    title: 'Nhà thầu đã xét duyệt',
    desc: 'Chỉ những nhà thầu vượt qua kiểm duyệt của ConstructX mới được hoạt động trên sàn.',
  },
  {
    icon: <HeadphonesIcon size={28} className="text-[#1a4f3a]" />,
    title: 'Hỗ trợ toàn trình',
    desc: 'Đội ngũ hỗ trợ luôn sẵn sàng giải quyết mọi vấn đề phát sinh trong dự án của bạn.',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Đăng dự án', desc: 'Mô tả yêu cầu, diện tích và ngân sách của bạn. Hoàn toàn miễn phí.' },
  { step: '02', title: 'Nhận báo giá', desc: 'Các nhà thầu uy tín gửi báo giá chi tiết. Bạn so sánh và lựa chọn.' },
  { step: '03', title: 'Ký hợp đồng', desc: 'Hợp đồng điện tử được tạo tự động, minh bạch và có giá trị pháp lý.' },
  { step: '04', title: 'Nghiệm thu & Thanh toán', desc: 'Theo dõi tiến độ, nghiệm thu từng hạng mục và thanh toán an toàn.' },
];

/* ------------------------------------------------------------------ */

const CustomerHomePage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [openProjects, setOpenProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMaterials();
    fetchOpenProjects();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await api.get('/public/materials');
      setMaterials(res.data.data || []);
    } catch {
      // không hiển thị lỗi — danh mục vật liệu chỉ là thông tin bổ sung
    }
  };

  const fetchOpenProjects = async () => {
    try {
      const res = await api.get('/projects/open');
      setOpenProjects(res.data.data || []);
    } catch {
      toast.error('Không thể tải danh sách dự án');
    } finally {
      setLoadingProjects(false);
    }
  };

  const filteredProjects = openProjects
    .filter((p) =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 4); // chỉ hiển thị 4 dự án nổi bật trên trang chủ

  const formatCurrency = (amount) => {
    if (!amount) return 'Thỏa thuận';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(amount)
      .replace('₫', 'đ');
  };

  return (
    <Layout title="Trang chủ ConstructX">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* ── Hero ── */}
        <section className="relative bg-gradient-to-br from-[#1a4f3a] to-[#2d7a5a] rounded-3xl overflow-hidden p-8 md:p-12 text-white">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
          />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-xs font-medium mb-4">
                <Hammer size={14} /> Sàn thi công nội thất #1 Việt Nam
              </div>
              <h1 className="text-3xl md:text-4xl font-bold font-display leading-tight mb-4">
                Xin chào, {user?.fullName?.split(' ').pop() || 'bạn'}! 👋<br />
                Hôm nay bạn muốn<br className="hidden md:block" /> thi công gì?
              </h1>
              <p className="text-white/80 text-sm md:text-base mb-6 max-w-md">
                ConstructX kết nối bạn với hàng trăm nhà thầu uy tín đã qua kiểm duyệt.
                Đăng dự án miễn phí, nhận báo giá trong 24 giờ.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/projects/new')}
                  className="flex items-center gap-2 bg-white text-[#1a4f3a] font-bold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors shadow-lg"
                >
                  <Package size={18} /> Đăng dự án ngay
                </button>
                <button
                  onClick={() => navigate('/projects/browse')}
                  className="flex items-center gap-2 bg-white/15 text-white font-medium px-6 py-3 rounded-xl hover:bg-white/25 transition-colors border border-white/30"
                >
                  Xem dự án của tôi <ArrowRight size={16} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 shrink-0">
              {PLATFORM_STATS.map((s) => (
                <div key={s.label} className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center min-w-[110px]">
                  <div className="flex justify-center mb-1 opacity-80">{s.icon}</div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-[11px] text-white/70 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Danh mục vật liệu ── */}
        {materials.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold font-display text-gray-900">Danh mục vật liệu</h2>
                <p className="text-sm text-gray-500">Các loại vật liệu chúng tôi hỗ trợ thi công</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {materials.map((m) => (
                <span
                  key={m.id}
                  className="inline-flex items-center gap-1.5 bg-[#e8f5ee] text-[#1a4f3a] font-medium text-sm px-4 py-2 rounded-full border border-[#b7dfc8] hover:bg-[#d1eedd] transition-colors cursor-default"
                >
                  <Hammer size={13} /> {m.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ── Cách hoạt động ── */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold font-display text-gray-900">Quy trình 4 bước đơn giản</h2>
            <p className="text-sm text-gray-500 mt-1">Từ lúc đăng dự án đến khi nghiệm thu, ConstructX đồng hành cùng bạn</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={item.step} className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-4 z-10 text-gray-300">
                    <ArrowRight size={20} />
                  </div>
                )}
                <span className="text-3xl font-black text-[#e8f5ee] select-none">{item.step}</span>
                <h3 className="font-bold text-gray-900 mt-2 mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Dự án đang mở (quick peek) ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold font-display text-gray-900">Dự án đang tuyển thầu</h2>
              <p className="text-sm text-gray-500">Các dự án mới nhất đang chờ nhà thầu báo giá</p>
            </div>
            <button
              onClick={() => navigate('/projects')}
              className="text-sm font-semibold text-[#1a4f3a] flex items-center gap-1 hover:gap-2 transition-all"
            >
              Xem tất cả <ChevronRight size={16} />
            </button>
          </div>

          {/* Search mini */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm dự án..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#1a4f3a] transition-all"
            />
          </div>

          {loadingProjects ? (
            <div className="text-center py-12 text-gray-400 text-sm">Đang tải dự án...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400 text-sm">
              Chưa có dự án nào đang tuyển thầu.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map((project) => {
                const statusMap = {
                  DRAFT: { label: 'Nháp', cls: 'bg-gray-100 text-gray-500' },
                  OPEN: { label: 'Đang tuyển', cls: 'bg-green-50 text-green-700' },
                  IN_PROGRESS: { label: 'Đang thi công', cls: 'bg-amber-50 text-amber-700' },
                  COMPLETED: { label: 'Hoàn thành', cls: 'bg-blue-50 text-blue-700' },
                  CLOSED: { label: 'Đã đóng', cls: 'bg-gray-100 text-gray-500' },
                  CANCELLED: { label: 'Đã hủy', cls: 'bg-red-50 text-red-600' },
                };
                const st = statusMap[project.status] || statusMap.DRAFT;
                return (
                <div
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden cursor-pointer"
                >
                  {/* Ảnh dự án */}
                  {project.imageUrls && project.imageUrls.length > 0 && (
                    <div className="h-36 w-full bg-gray-100 border-b border-gray-100">
                      <img src={project.imageUrls[0]} alt={project.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${st.cls}`}>
                        {project.status === 'OPEN' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                        {st.label}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={11} /> {new Date(project.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-[#1a4f3a] transition-colors mb-1.5 line-clamp-1">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {project.address || 'Toàn quốc'}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4">{project.description || 'Không có mô tả.'}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Ngân sách</p>
                        <p className="text-sm font-bold text-[#1a4f3a]">
                          {formatCurrency(project.budgetMin)} – {formatCurrency(project.budgetMax)}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-[#1a4f3a] flex items-center gap-1 group-hover:gap-2 transition-all">
                        Xem chi tiết <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Tính năng nền tảng ── */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold font-display text-gray-900">Tại sao chọn ConstructX?</h2>
            <p className="text-sm text-gray-500 mt-1">Nền tảng thi công nội thất minh bạch, an toàn và hiệu quả</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PLATFORM_FEATURES.map((f) => (
              <div key={f.title} className="flex gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-[#e8f5ee] flex items-center justify-center shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-gradient-to-r from-[#1a4f3a] to-[#2d7a5a] rounded-3xl p-8 text-center text-white">
          <TrendingUp size={36} className="mx-auto mb-3 opacity-80" />
          <h2 className="text-2xl font-bold font-display mb-2">Bắt đầu dự án ngay hôm nay</h2>
          <p className="text-white/75 text-sm mb-6 max-w-md mx-auto">
            Đăng dự án miễn phí và nhận báo giá từ các nhà thầu uy tín trong vòng 24 giờ.
          </p>
          <button
            onClick={() => navigate('/projects/new')}
            className="bg-white text-[#1a4f3a] font-bold px-8 py-3 rounded-xl hover:bg-green-50 transition-colors shadow-lg"
          >
            Tạo dự án ngay →
          </button>
        </section>

      </div>
    </Layout>
  );
};

export default CustomerHomePage;
