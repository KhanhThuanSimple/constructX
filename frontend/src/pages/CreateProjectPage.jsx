import React, { useState, useRef } from 'react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { 
  Info, 
  MapPin, 
  Banknote, 
  FileText, 
  ChevronRight, 
  ChevronLeft,
  Upload,
  X,
  File
} from 'lucide-react';

const CreateProjectPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    district: '',
    street: '',
    description: '',
    budgetMin: 50000000,
    budgetMax: 100000000,
    bidType: 'OPEN'
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Lưu ý: Trong thực tế, bạn sẽ dùng FormData để upload cả file
      // Ở đây tôi đang gửi JSON thông tin dự án trước
      await api.post('/projects', formData);
      toast.success('Đăng dự án thành công!');
      navigate('/projects');
    } catch (error) {
      toast.error('Lỗi khi tạo dự án');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, label: 'Thông tin cơ bản', icon: <Info size={16} /> },
    { id: 2, label: 'Ngân sách & Đấu giá', icon: <Banknote size={16} /> },
    { id: 3, label: 'Chi tiết & Tài liệu', icon: <FileText size={16} /> },
  ];

  return (
    <Layout title="Tạo dự án mới">
      <div className="max-w-3xl mx-auto">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 px-4">
          {steps.map((s, index) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  step >= s.id ? 'bg-[#1a4f3a] border-[#1a4f3a] text-white' : 'bg-white border-gray-200 text-gray-300'
                }`}>
                  {s.icon}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${
                  step >= s.id ? 'text-[#1a4f3a]' : 'text-gray-300'
                }`}>{s.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${step > s.id ? 'bg-[#1a4f3a]' : 'bg-gray-200'}`}></div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Tên dự án</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ví dụ: Nội thất phòng khách chung cư Vinhomes"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#1a4f3a] focus:bg-white transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Tỉnh / Thành phố</label>
                  <input 
                    type="text" 
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    placeholder="Ví dụ: TP. Hồ Chí Minh"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Quận / Huyện</label>
                  <input 
                    type="text" 
                    value={formData.district}
                    onChange={(e) => setFormData({...formData, district: e.target.value})}
                    placeholder="Ví dụ: Quận 1"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Địa chỉ chi tiết (Số nhà, Tên đường...)</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-400"><MapPin size={18} /></span>
                  <input 
                    type="text" 
                    value={formData.street}
                    onChange={(e) => setFormData({...formData, street: e.target.value})}
                    placeholder="Ví dụ: 123 Đường Lê Lợi, Phường Bến Thành"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Ngân sách tối thiểu (VNĐ)</label>
                  <input 
                    type="number" 
                    value={formData.budgetMin}
                    onChange={(e) => setFormData({...formData, budgetMin: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-primary focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Ngân sách tối đa (VNĐ)</label>
                  <input 
                    type="number" 
                    value={formData.budgetMax}
                    onChange={(e) => setFormData({...formData, budgetMax: Number(e.target.value)})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-primary focus:bg-white"
                  />
                </div>
              </div>
              <p className="text-[10px] text-gray-400 italic">* Lưu ý: Dự án của bạn sẽ được công khai để tất cả nhà thầu có thể gửi báo giá cạnh tranh.</p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Mô tả chi tiết yêu cầu</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="5"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#1a4f3a] focus:bg-white transition-all resize-none"
                  placeholder="Mô tả về vật liệu, phong cách, thời gian mong muốn..."
                ></textarea>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Tải lên mặt bằng / Ảnh mẫu</label>
                
                {/* File Input Ẩn */}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg"
                />

                <div 
                  onClick={() => fileInputRef.current.click()}
                  className="border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center gap-2 bg-gray-50 hover:bg-gray-100 hover:border-[#1a4f3a]/30 transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400">
                    <Upload size={24} />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Nhấn để chọn hoặc kéo thả file</p>
                  <p className="text-[10px] text-gray-400">PDF, PNG, JPG lên đến 10MB</p>
                </div>

                {/* Danh sách file đã chọn */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg text-primary"><File size={16} /></div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                            <p className="text-[10px] text-gray-400">{(file.size / 1024).toFixed(0)} KB</p>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                          className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-4">
          <button 
            onClick={() => setStep(s => s - 1)}
            disabled={step === 1}
            className={`flex items-center gap-2 text-sm font-bold ${step === 1 ? 'text-gray-300' : 'text-gray-500 hover:text-gray-800'}`}
          >
            <ChevronLeft size={18} /> Quay lại
          </button>
          
          {step < 3 ? (
            <button 
              onClick={() => setStep(s => s + 1)}
              className="btn btn-primary px-8 py-3 flex items-center gap-2 shadow-lg shadow-[#1a4f3a]/20"
            >
              Tiếp theo <ChevronRight size={18} />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="btn btn-primary px-10 py-3 shadow-lg shadow-[#1a4f3a]/20"
            >
              {loading ? 'Đang đăng bài...' : 'Đăng dự án ngay'}
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CreateProjectPage;
