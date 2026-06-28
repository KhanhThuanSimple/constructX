import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  Save, AlertCircle, Plus, Trash2, Settings as SettingsIcon,
  RotateCcw, CreditCard, MessageSquare, ToggleLeft, ToggleRight,
  Eye, EyeOff, ShieldCheck, Zap, Wallet,
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const TABS = [
  { key: 'fees',     label: 'Phí dịch vụ',     icon: <SettingsIcon size={16} /> },
  { key: 'vnpay',    label: 'VNPay',            icon: <CreditCard size={16} /> },
  { key: 'features', label: 'Tính năng',        icon: <Zap size={16} /> },
  { key: 'chat',     label: 'Chatbox AI',       icon: <MessageSquare size={16} /> },
  { key: 'materials',label: 'Vật liệu',         icon: <ShieldCheck size={16} /> },
];

const DEFAULT_SETTINGS = {
  customerFee: 0, contractorFee: 0, platformFee: 0, managementFee: 0,
  materials: [],
  vnpayTmnCode: '', vnpayHashSecretNormal: '', vnpayHashSecretToken: '',
  vnpayApiUrl: '', vnpayReturnUrl: '', vnpayCancelUrl: '',
  vnpayUseMock: false, vnpayEnabled: true,
  chatEnabled: true, chatRateLimitMaxMessages: 30, chatRateLimitWindowMinutes: 1,
  projectApprovalRequired: true, disbursementAdminApprovalRequired: true, orderApprovalRequired: true,
  minCustomerBalanceToOrder: 0, minContractorBalanceToBid: 0, minCustomerBalanceToProject: 0,
};

const AdminSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('fees');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newMaterial, setNewMaterial] = useState('');

  useEffect(() => { fetchSettings(); }, []);

  const normalizeSettings = (data) => ({
    customerFee: Number(data?.customerFee ?? 0),
    contractorFee: Number(data?.contractorFee ?? 0),
    platformFee: Number(data?.platformFee ?? 0),
    managementFee: Number(data?.managementFee ?? 0),
    materials: Array.isArray(data?.materials) ? data.materials : [],
    vnpayTmnCode: data?.vnpayTmnCode ?? '',
    vnpayHashSecretNormal: data?.vnpayHashSecretNormal ?? '',
    vnpayHashSecretToken: data?.vnpayHashSecretToken ?? '',
    vnpayApiUrl: data?.vnpayApiUrl ?? '',
    vnpayReturnUrl: data?.vnpayReturnUrl ?? '',
    vnpayCancelUrl: data?.vnpayCancelUrl ?? '',
    vnpayUseMock: Boolean(data?.vnpayUseMock),
    vnpayEnabled: data?.vnpayEnabled !== false,
    chatEnabled: data?.chatEnabled !== false,
    chatRateLimitMaxMessages: Number(data?.chatRateLimitMaxMessages ?? 30),
    chatRateLimitWindowMinutes: Number(data?.chatRateLimitWindowMinutes ?? 1),
    projectApprovalRequired: data?.projectApprovalRequired !== false,
    disbursementAdminApprovalRequired: data?.disbursementAdminApprovalRequired !== false,
    orderApprovalRequired: data?.orderApprovalRequired !== false,
    minCustomerBalanceToOrder: Number(data?.minCustomerBalanceToOrder ?? 0),
    minContractorBalanceToBid: Number(data?.minContractorBalanceToBid ?? 0),
    minCustomerBalanceToProject: Number(data?.minCustomerBalanceToProject ?? 0),
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/settings');
      setSettings(normalizeSettings(response.data.data));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tải cấu hình hệ thống');
    } finally {
      setLoading(false);
    }
  };

  const set = (field, value) => setSettings(prev => ({ ...prev, [field]: value }));

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const payload = {
        ...settings,
        materials: settings.materials.map((m) => ({
          id: typeof m.id === 'number' ? m.id : null,
          name: m.name,
        })),
      };
      const response = await api.post('/admin/settings', payload);
      setSettings(normalizeSettings(response.data.data));
      toast.success('Cấu hình đã được lưu thành công');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMaterial = () => {
    const name = newMaterial.trim();
    if (!name) { toast.error('Vui lòng nhập tên vật liệu'); return; }
    if (settings.materials.some(m => m.name.toLowerCase() === name.toLowerCase())) {
      toast.error('Vật liệu này đã tồn tại'); return;
    }
    set('materials', [...settings.materials, { id: `new-${Date.now()}`, name }]);
    setNewMaterial('');
    toast.success('Đã thêm vật liệu, nhớ bấm Lưu');
  };

  const totalFee = settings.customerFee + settings.contractorFee + settings.platformFee + settings.managementFee;

  if (loading) {
    return (
      <Layout title="Cấu hình hệ thống">
        <div className="text-center py-12">Đang tải...</div>
      </Layout>
    );
  }

  return (
    <Layout title="Cấu hình hệ thống">
      <div className="space-y-6">
        {/* Tab bar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                  ${activeTab === tab.key
                    ? 'border-[#1a4f3a] text-[#1a4f3a]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── TAB: PHÍ DỊCH VỤ ── */}
        {activeTab === 'fees' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard label="Tổng phí cấu hình" value={`${totalFee.toFixed(2)}%`} accent />
              <StatCard label="Phí khách hàng"    value={`${settings.customerFee.toFixed(2)}%`} />
              <StatCard label="Phí nhà thầu"      value={`${settings.contractorFee.toFixed(2)}%`} />
              <StatCard label="Danh mục vật liệu" value={settings.materials.length} />
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <SectionHeader icon={<SettingsIcon size={20} />} title="Cấu hình phí sử dụng"
                subtitle="Các giá trị phục vụ tính phí sàn, dashboard và báo cáo doanh thu." />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <FeeInput label="Phí dịch vụ khách hàng (%)"
                  description="Phí thu từ khách hàng khi tạo hoặc thanh toán dự án"
                  value={settings.customerFee} onChange={(v) => set('customerFee', v)} />
                <FeeInput label="Phí dịch vụ nhà thầu (%)"
                  description="Phí trích từ thu nhập nhà thầu sau khi giải ngân"
                  value={settings.contractorFee} onChange={(v) => set('contractorFee', v)} />
                <FeeInput label="Phí quản lý nền tảng (%)"
                  description="Phí quản lý chung cho hoạt động của sàn"
                  value={settings.platformFee} onChange={(v) => set('platformFee', v)} />
                <FeeInput label="Phí quản lý đội ngũ (%)"
                  description="Phí nhân sự, vận hành, hỗ trợ xử lý giao dịch"
                  value={settings.managementFee} onChange={(v) => set('managementFee', v)} />
              </div>
            </div>
          </>
        )}

        {/* ── TAB: VNPAY ── */}
        {activeTab === 'vnpay' && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-6">
            <SectionHeader icon={<CreditCard size={20} />} title="Cấu hình thanh toán VNPay"
              subtitle="Thông tin kết nối cổng thanh toán VNPay. Thay đổi có hiệu lực ngay sau khi lưu." />

            {/* Toggle bật/tắt VNPay */}
            <ToggleRow
              label="Bật thanh toán VNPay"
              description="Khi tắt, người dùng không thể nạp tiền qua VNPay"
              checked={settings.vnpayEnabled}
              onChange={(v) => set('vnpayEnabled', v)}
              colorOn="bg-[#1a4f3a]"
            />
            <ToggleRow
              label="Chế độ Mock (Sandbox giả lập)"
              description="Bật để test mà không gọi API VNPay thật"
              checked={settings.vnpayUseMock}
              onChange={(v) => set('vnpayUseMock', v)}
              colorOn="bg-amber-500"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <TextInput label="TMN Code (Mã đơn vị)" value={settings.vnpayTmnCode}
                onChange={(v) => set('vnpayTmnCode', v)} placeholder="VD: PV7YIINN" />
              <TextInput label="API URL" value={settings.vnpayApiUrl}
                onChange={(v) => set('vnpayApiUrl', v)}
                placeholder="https://sandbox.vnpayment.vn/paymentv2/vpcpay.html" />
              <SecretInput label="Hash Secret (Normal)" value={settings.vnpayHashSecretNormal}
                onChange={(v) => set('vnpayHashSecretNormal', v)} />
              <SecretInput label="Hash Secret (Token)" value={settings.vnpayHashSecretToken}
                onChange={(v) => set('vnpayHashSecretToken', v)} />
              <TextInput label="Return URL" value={settings.vnpayReturnUrl}
                onChange={(v) => set('vnpayReturnUrl', v)} placeholder="http://localhost:5173/wallet" />
              <TextInput label="Cancel URL" value={settings.vnpayCancelUrl}
                onChange={(v) => set('vnpayCancelUrl', v)} placeholder="http://localhost:5173/wallet" />
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex gap-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>Hash Secret là thông tin bảo mật. Chỉ cập nhật khi VNPay cấp key mới. Không chia sẻ công khai.</span>
            </div>
          </div>
        )}

        {/* ── TAB: TÍNH NĂNG ── */}
        {activeTab === 'features' && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-6">
            <SectionHeader icon={<Zap size={20} />} title="Kiểm soát tính năng hệ thống"
              subtitle="Bật/tắt các chức năng vận hành. Thay đổi có hiệu lực ngay sau khi lưu." />

            <FeatureCard
              title="Admin duyệt dự án trước khi đăng"
              description="Khi BẬT: dự án mới tạo sẽ vào 'Chờ duyệt', admin phê duyệt trước khi hiển thị công khai trên marketplace. Khi TẮT: dự án tự động 'Đang mở' (OPEN) ngay sau khi tạo."
              badge={settings.projectApprovalRequired !== false ? { text: 'Admin duyệt', color: 'blue' } : { text: 'Tự động', color: 'green' }}
              checked={settings.projectApprovalRequired !== false}
              onChange={(v) => set('projectApprovalRequired', v)}
              colorOn="bg-[#1a4f3a]"
              warning={settings.projectApprovalRequired === false
                ? 'Cảnh báo: Dự án sẽ được đăng trực tiếp mà không qua kiểm duyệt. Hãy chắc chắn về nội dung đăng.'
                : null}
            />

            <FeatureCard
              title="Admin quản lý giải ngân"
              description="Khi BẬT: yêu cầu giải ngân từ nhà thầu phải được admin xác nhận trước, sau đó khách hàng mới có thể duyệt (luồng 2 bước). Khi TẮT: khách hàng duyệt thẳng không qua admin."
              badge={settings.disbursementAdminApprovalRequired ? { text: 'Admin kiểm soát', color: 'blue' } : { text: 'Tự động', color: 'amber' }}
              checked={settings.disbursementAdminApprovalRequired}
              onChange={(v) => set('disbursementAdminApprovalRequired', v)}
              colorOn="bg-blue-600"
              warning={!settings.disbursementAdminApprovalRequired
                ? 'Cảnh báo: Nhà thầu có thể yêu cầu giải ngân và được khách hàng chấp nhận mà không cần admin kiểm tra.'
                : null}
            />

            <FeatureCard
              title="Admin duyệt đơn hàng trước khi mở đấu giá"
              description="Khi BẬT: đơn hàng mới vào 'Chờ duyệt', admin phê duyệt trước khi nhà thầu gửi báo giá — 2 bước. Khi TẮT: đơn hàng tự động 'Đang đấu giá' ngay sau khi tạo — 1 luồng thông suốt."
              badge={settings.orderApprovalRequired !== false ? { text: 'Admin duyệt', color: 'blue' } : { text: 'Tự động', color: 'green' }}
              checked={settings.orderApprovalRequired !== false}
              onChange={(v) => set('orderApprovalRequired', v)}
              colorOn="bg-[#1a4f3a]"
              warning={settings.orderApprovalRequired === false
                ? 'Đơn hàng mở đấu giá ngay lập tức. Đảm bảo nhà thầu đã được kiểm duyệt kỹ.'
                : null}
            />

            {/* Cấu hình số dư ví tối thiểu */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Wallet size={18} className="text-[#1a4f3a]" />
                Cấu hình số dư ví tối thiểu
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <CurrencyInput
                  label="Số dư tối thiểu để khách hàng đặt đơn"
                  description="Số dư khả dụng tối thiểu khách hàng cần có trong ví để tạo đơn hàng mới."
                  value={settings.minCustomerBalanceToOrder || 0}
                  onChange={(v) => set('minCustomerBalanceToOrder', v)}
                  placeholder="VD: 50.000"
                />
                <CurrencyInput
                  label="Số dư tối thiểu để khách hàng đăng dự án"
                  description="Số dư khả dụng tối thiểu khách hàng cần có trong ví để đăng dự án thầu mới."
                  value={settings.minCustomerBalanceToProject || 0}
                  onChange={(v) => set('minCustomerBalanceToProject', v)}
                  placeholder="VD: 100.000"
                />
                <CurrencyInput
                  label="Số dư tối thiểu để nhà thầu báo giá"
                  description="Số dư khả dụng tối thiểu nhà thầu cần có trong ví để có thể gửi báo giá thầu."
                  value={settings.minContractorBalanceToBid || 0}
                  onChange={(v) => set('minContractorBalanceToBid', v)}
                  placeholder="VD: 100.000"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: CHATBOX AI ── */}
        {activeTab === 'chat' && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-6">
            <SectionHeader icon={<MessageSquare size={20} />} title="Cấu hình Chatbox AI (Grok)"
              subtitle="Quản lý trạng thái và giới hạn tốc độ của hệ thống trợ lý AI." />

            <ToggleRow
              label="Bật Chatbox AI"
              description="Khi tắt, nút chat sẽ ẩn và người dùng không thể gửi tin nhắn đến AI"
              checked={settings.chatEnabled}
              onChange={(v) => set('chatEnabled', v)}
              colorOn="bg-[#1a4f3a]"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giới hạn tin nhắn tối đa / cửa sổ thời gian
                </label>
                <input type="number" min="1" max="1000" value={settings.chatRateLimitMaxMessages}
                  onChange={(e) => set('chatRateLimitMaxMessages', parseInt(e.target.value) || 30)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#1a4f3a] focus:border-transparent" />
                <p className="text-xs text-gray-500 mt-1">Số tin nhắn tối đa trong một cửa sổ thời gian</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cửa sổ thời gian (phút)
                </label>
                <input type="number" min="1" max="60" value={settings.chatRateLimitWindowMinutes}
                  onChange={(e) => set('chatRateLimitWindowMinutes', parseInt(e.target.value) || 1)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#1a4f3a] focus:border-transparent" />
                <p className="text-xs text-gray-500 mt-1">Ví dụ: 30 tin / 1 phút</p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 flex gap-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>Rate limit ngăn người dùng spam AI. Nếu tắt chatbox, toàn bộ endpoint chat sẽ trả về lỗi 503.</span>
            </div>
          </div>
        )}

        {/* ── TAB: VẬT LIỆU ── */}
        {activeTab === 'materials' && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <SectionHeader icon={<ShieldCheck size={20} />} title="Quản lý vật liệu"
              subtitle="Danh mục để khách hàng chọn vật liệu và nhà thầu lọc dự án phù hợp." />
            <div className="flex flex-col sm:flex-row gap-2 mt-6 mb-4">
              <input type="text" placeholder="Nhập tên vật liệu..."
                value={newMaterial} onChange={(e) => setNewMaterial(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddMaterial(); }}
                className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#1a4f3a] focus:border-transparent" />
              <button onClick={handleAddMaterial}
                className="px-4 py-3 rounded-lg bg-[#1a4f3a] text-white hover:bg-[#2d7a5a] font-medium transition flex items-center justify-center gap-2">
                <Plus size={18} />Thêm
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {settings.materials.length > 0 ? settings.materials.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <span className="font-medium text-gray-900">{m.name}</span>
                  <button onClick={() => set('materials', settings.materials.filter(x => x.id !== m.id))}
                    className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition" title="Xóa vật liệu">
                    <Trash2 size={18} />
                  </button>
                </div>
              )) : (
                <p className="text-center text-gray-500 py-4 md:col-span-2">Chưa có vật liệu nào</p>
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end gap-3 pb-4">
          <button onClick={fetchSettings}
            className="px-6 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition flex items-center gap-2">
            <RotateCcw size={18} />Hủy thay đổi
          </button>
          <button onClick={handleSaveSettings} disabled={saving}
            className="px-6 py-3 rounded-lg bg-[#1a4f3a] text-white hover:bg-[#2d7a5a] font-medium transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <Save size={18} />{saving ? 'Đang lưu...' : 'Lưu cấu hình'}
          </button>
        </div>
      </div>
    </Layout>
  );
};

// ─── Reusable sub-components ─────────────────────────────────────────────────

const StatCard = ({ label, value, accent }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
    <p className="text-sm text-gray-500">{label}</p>
    <p className={`text-3xl font-bold mt-2 ${accent ? 'text-[#1a4f3a]' : 'text-gray-900'}`}>{value}</p>
  </div>
);

const SectionHeader = ({ icon, title, subtitle }) => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-[#e8f5ee] text-[#1a4f3a] flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div>
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  </div>
);

const FeeInput = ({ label, description, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="flex items-center gap-2">
      <input type="number" min="0" max="100" step="0.1" value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#1a4f3a] focus:border-transparent" />
      <span className="text-gray-600 font-medium">%</span>
    </div>
    {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
  </div>
);

const TextInput = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input type="text" value={value} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#1a4f3a] focus:border-transparent" />
  </div>
);

const CurrencyInput = ({ label, description, value, onChange, placeholder }) => {
  const formatValue = (val) => {
    if (val === null || val === undefined || val === '') return '';
    const clean = val.toString().replace(/\D/g, '');
    if (!clean) return '';
    return new Intl.NumberFormat('vi-VN').format(parseInt(clean, 10));
  };

  const handleChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    const num = rawVal ? parseInt(rawVal, 10) : 0;
    onChange(num);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative flex items-center">
        <input
          type="text"
          value={formatValue(value)}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg p-3 pr-12 focus:ring-2 focus:ring-[#1a4f3a] focus:border-transparent font-semibold"
          placeholder={placeholder}
        />
        <span className="absolute right-4 text-gray-400 font-bold text-sm">VND</span>
      </div>
      {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      {value > 0 && (
        <p className="text-xs font-semibold text-green-700 mt-1">
          Quy đổi: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
        </p>
      )}
    </div>
  );
};

const SecretInput = ({ label, value, onChange }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center gap-2">
        <input type={show ? 'text' : 'password'} value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#1a4f3a] focus:border-transparent font-mono text-sm" />
        <button type="button" onClick={() => setShow(!show)}
          className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500">
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
};

const ToggleRow = ({ label, description, checked, onChange, colorOn = 'bg-[#1a4f3a]' }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
    <div className="flex-1 mr-4">
      <p className="font-medium text-gray-900">{label}</p>
      {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${checked ? colorOn : 'bg-gray-300'}`}
      role="switch"
      aria-checked={checked}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

const FeatureCard = ({ title, description, badge, checked, onChange, colorOn, warning }) => (
  <div className={`border-2 rounded-xl p-5 transition-colors ${checked ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}>
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {badge && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium
              ${badge.color === 'green' ? 'bg-green-100 text-green-700'
              : badge.color === 'blue' ? 'bg-blue-100 text-blue-700'
              : badge.color === 'amber' ? 'bg-amber-100 text-amber-700'
              : 'bg-gray-100 text-gray-600'}`}>
              {badge.text}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus:outline-none ${checked ? colorOn : 'bg-gray-300'}`}
        role="switch"
        aria-checked={checked}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
    {warning && (
      <div className="mt-3 flex gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
        <AlertCircle size={16} className="shrink-0 mt-0.5" />
        <span>{warning}</span>
      </div>
    )}
  </div>
);

export default AdminSettingsPage;
