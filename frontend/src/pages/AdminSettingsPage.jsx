import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  Save,
  AlertCircle,
  Plus,
  Trash2,
  Settings as SettingsIcon,
  RotateCcw
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const DEFAULT_SETTINGS = {
  customerFee: 0,
  contractorFee: 0,
  platformFee: 0,
  managementFee: 0,
  materials: [],
};

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newMaterial, setNewMaterial] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const normalizeSettings = (data) => ({
    customerFee: Number(data?.customerFee ?? 0),
    contractorFee: Number(data?.contractorFee ?? 0),
    platformFee: Number(data?.platformFee ?? 0),
    managementFee: Number(data?.managementFee ?? 0),
    materials: Array.isArray(data?.materials) ? data.materials : [],
  });

  const fetchSettings = async () => {
    setLoading(true);

    try {
      const response = await api.get('/admin/settings');
      setSettings(normalizeSettings(response.data.data));
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error(error.response?.data?.message || 'Không thể tải cấu hình hệ thống');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (field, value) => {
    const numberValue = Number.isNaN(value) ? 0 : value;

    setSettings((prev) => ({
      ...prev,
      [field]: numberValue,
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);

    try {
      const payload = {
        ...settings,
        materials: settings.materials.map((material) => ({
          id: typeof material.id === 'number' ? material.id : null,
          name: material.name,
        })),
      };

      const response = await api.post('/admin/settings', payload);

      setSettings(normalizeSettings(response.data.data));
      toast.success('Cấu hình đã được lưu thành công');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMaterial = () => {
    const name = newMaterial.trim();

    if (!name) {
      toast.error('Vui lòng nhập tên vật liệu');
      return;
    }

    const existed = settings.materials.some(
      (material) => material.name.toLowerCase() === name.toLowerCase()
    );

    if (existed) {
      toast.error('Vật liệu này đã tồn tại');
      return;
    }

    setSettings((prev) => ({
      ...prev,
      materials: [
        ...prev.materials,
        {
          id: `new-${Date.now()}`,
          name,
        },
      ],
    }));

    setNewMaterial('');
    toast.success('Đã thêm vật liệu, nhớ bấm Lưu cấu hình');
  };

  const handleDeleteMaterial = (id) => {
    setSettings((prev) => ({
      ...prev,
      materials: prev.materials.filter((material) => material.id !== id),
    }));
  };

  const totalFee =
    settings.customerFee +
    settings.contractorFee +
    settings.platformFee +
    settings.managementFee;

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-gray-500">Tổng phí cấu hình</p>
            <p className="text-3xl font-bold text-[#1a4f3a] mt-2">
              {totalFee.toFixed(2)}%
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-gray-500">Phí khách hàng</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {settings.customerFee.toFixed(2)}%
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-gray-500">Phí nhà thầu</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {settings.contractorFee.toFixed(2)}%
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-gray-500">Danh mục vật liệu</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {settings.materials.length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#e8f5ee] text-[#1a4f3a] flex items-center justify-center">
              <SettingsIcon size={20} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Cấu hình phí sử dụng
              </h2>
              <p className="text-sm text-gray-500">
                Các giá trị này phục vụ tính phí sàn, dashboard và báo cáo doanh thu.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeeInput
              label="Phí dịch vụ khách hàng (%)"
              description="Phí thu từ khách hàng khi tạo hoặc thanh toán dự án"
              value={settings.customerFee}
              onChange={(value) => handleSettingChange('customerFee', value)}
            />

            <FeeInput
              label="Phí dịch vụ nhà thầu (%)"
              description="Phí trích từ thu nhập nhà thầu sau khi giải ngân"
              value={settings.contractorFee}
              onChange={(value) => handleSettingChange('contractorFee', value)}
            />

            <FeeInput
              label="Phí quản lý nền tảng (%)"
              description="Phí quản lý chung cho hoạt động của sàn"
              value={settings.platformFee}
              onChange={(value) => handleSettingChange('platformFee', value)}
            />

            <FeeInput
              label="Phí quản lý đội ngũ (%)"
              description="Phí nhân sự, vận hành, hỗ trợ xử lý giao dịch"
              value={settings.managementFee}
              onChange={(value) => handleSettingChange('managementFee', value)}
            />
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
              <AlertCircle size={18} />
              Tóm tắt cấu hình
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-blue-700">Tổng phí</p>
                <p className="text-lg font-bold text-blue-900">
                  {totalFee.toFixed(2)}%
                </p>
              </div>

              <div>
                <p className="text-blue-700">Phí khách</p>
                <p className="text-lg font-bold text-blue-900">
                  {settings.customerFee.toFixed(2)}%
                </p>
              </div>

              <div>
                <p className="text-blue-700">Phí nhà thầu</p>
                <p className="text-lg font-bold text-blue-900">
                  {settings.contractorFee.toFixed(2)}%
                </p>
              </div>

              <div>
                <p className="text-blue-700">Phí nền tảng</p>
                <p className="text-lg font-bold text-blue-900">
                  {(settings.platformFee + settings.managementFee).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Quản lý vật liệu
          </h2>

          <p className="text-sm text-gray-500 mb-6">
            Danh mục này dùng để khách hàng chọn vật liệu và nhà thầu lọc dự án phù hợp.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              type="text"
              placeholder="Nhập tên vật liệu..."
              value={newMaterial}
              onChange={(e) => setNewMaterial(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddMaterial();
                }
              }}
              className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent"
            />

            <button
              onClick={handleAddMaterial}
              className="px-4 py-3 rounded-lg bg-[#1a4f3a] text-white hover:bg-[#2d7a5a] font-medium transition flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Thêm
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {settings.materials.length > 0 ? (
              settings.materials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <span className="font-medium text-gray-900">
                    {material.name}
                  </span>

                  <button
                    onClick={() => handleDeleteMaterial(material.id)}
                    className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition"
                    title="Xóa vật liệu"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4 md:col-span-2">
                Chưa có vật liệu nào
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={fetchSettings}
            className="px-6 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition flex items-center gap-2"
          >
            <RotateCcw size={18} />
            Hủy thay đổi
          </button>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-6 py-3 rounded-lg bg-[#1a4f3a] text-white hover:bg-[#2d7a5a] font-medium transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
          </button>
        </div>
      </div>
    </Layout>
  );
};

const FeeInput = ({ label, description, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>

    <div className="flex items-center gap-2">
      <input
        type="number"
        min="0"
        max="100"
        step="0.1"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-transparent"
      />

      <span className="text-gray-600 font-medium">%</span>
    </div>

    <p className="text-xs text-gray-500 mt-1">
      {description}
    </p>
  </div>
);

export default AdminSettingsPage;