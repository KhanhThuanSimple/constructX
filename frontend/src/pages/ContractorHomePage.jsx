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
  Hammer,
  Package,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Award,
  Wallet,
  Briefcase,
  BarChart2,
  FileText,
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

/* ------------------------------------------------------------------ */
const PLATFORM_STATS = [
  { label: 'Dự án đang mở', value: '50+', icon: <Briefcase size={22} /> },
  { label: 'Giá trị trung bình', value: '80tr+', icon: <BarChart2 size={22} /> },
  { label: 'Tỷ lệ hoàn thành', value: '96%', icon: <CheckCircle size={22} /> },
  { label: 'Đối tác nhà thầu', value: '500+', icon: <Award size={22} /> },
];

const CONTRACTOR_FEATURES = [
  {
    icon: <Wallet size={28} className="text-[#1a4f3a]" />,
    title: 'Thu nhập minh bạch',
    desc: 'Tiền được giải ngân ngay khi milestone được nghiệm thu. Không chờ đợi, không rủi ro.',
  },
  {
    icon: <Zap size={28} className="text-[#1a4f3a]" />,
    title: 'Cơ hội việc làm liên tục',
    desc: 'Hàng chục dự án mới mỗi tuần. Tìm việc phù hợp chuyên môn và khu vực của bạn.',
  },
  {
    icon: <Shield size={28} className="text-[#1a4f3a]" />,
    title: 'Bảo vệ quyền lợi nhà thầu',
    desc: 'Hệ thống hợp đồng điện tử và cơ chế giải quyết tranh chấp bảo vệ bạn mọi tình huống.',
  },
  {
    icon: <Star size={28} className="text-[#1a4f3a]" />,
    title: 'Xây dựng danh tiếng',
    desc: 'Hồ sơ năng lực số và đánh giá của khách hàng giúp bạn nổi bật và nhận nhiều dự án hơn.',
  },
];

const HOW_IT_WORKS_CONTRACTOR = [
  { step: '01', title: 'Hoàn thiện hồ sơ', desc: 'Cập nhật năng lực, portfolio và khu vực hoạt động để tăng khả năng được chọn.' },
  { step: '02', title: 'Duyệt & Chọn dự án', desc: 'Lọc dự án theo khu vực, ngân sách và chuyên môn. Chọn những gì phù hợp nhất.' },
  { step: '03', title: 'Gửi báo giá', desc: 'Gửi báo giá chi tiết và minh bạch. Thắng thầu dựa trên năng lực thực sự.' },
  { step: '04', title: 'Thi công & Thu tiền', desc: 'Thực hiện theo milestone, nhật ký thi công, và nhận thanh toán từng giai đoạn.' },
];

/* ------------------------------------------------------------------ */

const ContractorHomePage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [openProjects, setOpenProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  useEffect(() => {
    fetchMaterials();
    fetchOpenProjects();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await api.get('/public/materials');
      setMaterials(res.data.data || []);
    } catch {
      // vật liệu chỉ là bộ lọc, không hiển thị lỗi
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
    .filter((p) => {
      const matchSearch =
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchMaterial = selectedMaterial
        ? p.description?.toLowerCase().includes(selectedMaterial.toLowerCase()) ||
          p.name?.toLowerCase().includes(selectedMaterial.toLowerCase())
        : true;
      return matchSearch && matchMaterial;
    })
    .slice(0, 6);

  const formatCurrency = (amount) => {
    if (!amount) return 'Thỏa thuận';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(amount)
      .replace('₫', 'đ');
  };

  const isApproved = user?.approvalStatus === 'APPROVED';

  return (
    <Layout title="Trang chủ nhà thầu">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* ── Banner chưa duyệt ── */}
        {!isApproved && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 text-sm">
            <Shield size={18} className="mt-0.5 shrink-0 text-amber-500" />
            <div>
              <p className="font-semibold">Tài khoản của bạn đang chờ phê duyệt</p>
              <p className="text-amber-700 mt-0.5">
                Admin đang xem xét hồ sơ của bạn. Sau khi được duyệt, bạn có thể tham gia đấu thầu và nhận dự án.
              </p>
            </div>
          </div>
        )}

        {/* ── Hero ── */}
        <section className="relative bg-gradient-to-br from-[#1a3a5c] to-[#1a4f3a] rounded-3xl overflow-hidden p-8 md:p-12 text-white">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
          />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-xs font-medium mb-4">
                <Hammer size={14} /> Nền tảng dành cho nhà thầu chuyên nghiệp
              </div>
              <h1 className="text-3xl md:text-4xl font-bold font-display leading-tight mb-4">
                Chào mừng trở lại,<br />
                {user?.fullName || 'nhà thầu'} 👷
              </h1>
              <p className="text-white/80 text-sm md:text-base mb-6 max-w-md">
                ConstructX mang đến hàng chục dự án thi công mỗi tuần. Cập nhật hồ sơ, đấu thầu và quản lý công trình ngay trên một nền tảng.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/projects/browse')}
                  className="flex items-center gap-2 bg-white text-[#1a4f3a] font-bold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors shadow-lg"
                >
                  <Search size={18} /> Tìm dự án mới
                </button>
                <button
                  onClick={() => navigate('/portfolio')}
                  className="flex items-center gap-2 bg-white/15 text-white font-medium px-6 py-3 rounded-xl hover:bg-white/25 transition-colors border border-white/30"
                >
                  <FileText size={16} /> Cập nhật hồ sơ
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

        {/* ── Danh mục vật liệu (bộ lọc) ── */}
        {materials.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xl font-bold font-display text-gray-900">Lọc theo vật liệu</h2>
                <p className="text-sm text-gray-500">Tìm dự án theo chuyên môn vật liệu của bạn</p>
              </div>
              {selectedMaterial && (
                <button
                  onClick={() => setSelectedMaterial(null)}
                  className="text-xs text-gray-500 hover:text-gray-800 underline"
                >
                  Bỏ lọc
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {materials.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMaterial(selectedMaterial === m.name ? null : m.name)}
                  className={`inline-flex items-center gap-1.5 font-medium text-sm px-4 py-2 rounded-full border transition-colors ${
                    selectedMaterial === m.name
                      ? 'bg-[#1a4f3a] text-white border-[#1a4f3a]'
                      : 'bg-[#e8f5ee] text-[#1a4f3a] border-[#b7dfc8] hover:bg-[#d1eedd]'
                  }`}
                >
                  <Hammer size={13} /> {m.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── Dự án đang mở ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold font-display text-gray-900">Dự án đang tuyển thầu</h2>
              <p className="text-sm text-gray-500">Gửi báo giá và trúng thầu ngay hôm nay</p>
            </div>
            <button
              onClick={() => navigate('/projects/browse')}
              className="text-sm font-semibold text-[#1a4f3a] flex items-center gap-1 hover:gap-2 transition-all"
            >
              Xem tất cả <ChevronRight size={16} />
            </button>
          </div>

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
              {selectedMaterial
                ? `Không có dự án liên quan đến "${selectedMaterial}".`
                : 'Chưa có dự án nào đang tuyển thầu.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => navigate(`/projectsv2/${project.id}`)}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden cursor-pointer"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Đang tuyển
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
                      {project.area && <span>{project.area} m²</span>}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4">{project.description || 'Không có mô tả.'}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Ngân sách</p>
                        <p className="text-sm font-bold text-[#1a4f3a]">
                          {formatCurrency(project.budgetMin)} – {formatCurrency(project.budgetMax)}
                        </p>
                      </div>
                      {isApproved ? (
                        <button className="flex items-center gap-1 bg-[#1a4f3a] text-white text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-[#2d7a5a] transition-colors">
                          Gửi báo giá <ChevronRight size={13} />
                        </button>
                      ) : (
                        <span className="text-xs text-amber-600 font-medium">Chờ duyệt</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Cách thức hoạt động ── */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold font-display text-gray-900">Từ đăng ký đến nhận tiền</h2>
            <p className="text-sm text-gray-500 mt-1">Quy trình rõ ràng, minh bạch và bảo vệ quyền lợi nhà thầu</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {HOW_IT_WORKS_CONTRACTOR.map((item, i) => (
              <div key={item.step} className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                {i < HOW_IT_WORKS_CONTRACTOR.length - 1 && (
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

        {/* ── Tính năng ── */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold font-display text-gray-900">Tại sao nhà thầu chọn ConstructX?</h2>
            <p className="text-sm text-gray-500 mt-1">Công cụ chuyên nghiệp giúp bạn quản lý, phát triển và tăng doanh thu</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CONTRACTOR_FEATURES.map((f) => (
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
        <section className="bg-gradient-to-r from-[#1a3a5c] to-[#1a4f3a] rounded-3xl p-8 text-center text-white">
          <TrendingUp size={36} className="mx-auto mb-3 opacity-80" />
          <h2 className="text-2xl font-bold font-display mb-2">Tìm dự án phù hợp ngay</h2>
          <p className="text-white/75 text-sm mb-6 max-w-md mx-auto">
            Hàng chục dự án thi công nội thất đang chờ báo giá. Cập nhật hồ sơ để tăng tỷ lệ trúng thầu.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate('/projects/browse')}
              className="bg-white text-[#1a4f3a] font-bold px-8 py-3 rounded-xl hover:bg-green-50 transition-colors shadow-lg"
            >
              Tìm dự án ngay →
            </button>
            <button
              onClick={() => navigate('/portfolio')}
              className="bg-white/15 text-white font-medium px-6 py-3 rounded-xl hover:bg-white/25 transition-colors border border-white/30"
            >
              Cập nhật hồ sơ năng lực
            </button>
          </div>
        </section>

      </div>
    </Layout>
  );
};

export default ContractorHomePage;
