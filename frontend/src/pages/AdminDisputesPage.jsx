import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import {
  AlertCircle,
  MessageSquare,
  CheckCircle2,
  Clock,
  User,
  Search,
  Filter,
  ArrowRight,
  Unlock,
  Scale,
  Building2,
  Calendar,
  ChevronRight,
  ShieldAlert,
  Image as ImageIcon,
  Info,
  TrendingUp,
  FileText
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả tranh chấp' },
  { value: 'pending', label: 'Chờ giải quyết' },
  { value: 'resolved', label: 'Đã giải quyết' },
];

const RESOLUTION_OPTIONS = [
  { value: 'refund_customer', label: 'Hoàn trả Khách hàng 100%' },
  { value: 'keep_contractor', label: 'Thanh toán Nhà thầu 100%' },
  { value: 'split', label: 'Phân chia theo tỷ lệ tùy chọn' },
];

const AdminDisputesPage = () => {
  const [disputes, setDisputes] = useState([]);
  const [filteredDisputes, setFilteredDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedDispute, setSelectedDispute] = useState(null);
  
  // Resolution states
  const [resolutionType, setResolutionType] = useState('');
  const [resolutionText, setResolutionText] = useState('');
  const [customerPercent, setCustomerPercent] = useState(50);
  const [contractorPercent, setContractorPercent] = useState(50);
  const [showResolvePanel, setShowResolvePanel] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Chat state
  const [messageText, setMessageText] = useState('');
  
  // Logs state
  const [constructionLogs, setConstructionLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [activeLogsTab, setActiveLogsTab] = useState(false); // Toggle to show/hide construction logs inside detail view

  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchDisputes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [disputes, searchTerm, filter]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedDispute?.messages]);

  useEffect(() => {
    if (selectedDispute?.contractId) {
      fetchConstructionLogs(selectedDispute.contractId);
    } else {
      setConstructionLogs([]);
    }
    // Reset resolution states when dispute changes
    setShowResolvePanel(false);
    setResolutionType('');
    setResolutionText('');
    setCustomerPercent(50);
    setContractorPercent(50);
  }, [selectedDispute?.id]);

  const fetchConstructionLogs = async (contractId) => {
    setLoadingLogs(true);
    try {
      const response = await api.get(`/contracts/${contractId}/construction-logs`);
      setConstructionLogs(response.data.data || []);
    } catch (error) {
      console.error('Error fetching construction logs:', error);
      setConstructionLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/disputes');
      const data = response.data.data || [];
      setDisputes(data);
      if (data.length > 0 && !selectedDispute) {
        setSelectedDispute(data[0]);
      }
    } catch (error) {
      toast.error('Không thể tải danh sách tranh chấp');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = disputes || [];

    if (filter === 'pending') {
      result = result.filter((d) => d.status === 'PENDING');
    }
    if (filter === 'resolved') {
      result = result.filter((d) => d.status === 'RESOLVED');
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (d) =>
          (d.projectName && d.projectName.toLowerCase().includes(term)) ||
          `${d.id}`.includes(term) ||
          (d.customerName && d.customerName.toLowerCase().includes(term)) ||
          (d.contractorName && d.contractorName.toLowerCase().includes(term))
      );
    }

    setFilteredDisputes(result);
  };

  const handleUnfreezeContract = async () => {
    if (!selectedDispute) return;
    
    if (!window.confirm(`Bạn có chắc chắn muốn gỡ bỏ trạng thái phong tỏa cho Hợp đồng của tranh chấp này?`)) {
      return;
    }

    try {
      const response = await api.post(`/admin/disputes/${selectedDispute.id}/unfreeze`);
      toast.success('Hợp đồng đã được gỡ bỏ phong tỏa thành công!');
      const updated = response.data.data;
      setSelectedDispute(updated);
      setDisputes((prev) => prev.map((d) => (d.id === selectedDispute.id ? updated : d)));
    } catch (error) {
      console.error('Error unfreezing contract:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi bỏ phong tỏa hợp đồng');
    }
  };

  const handleResolveDispute = async () => {
    if (!resolutionText.trim()) {
      toast.error('Vui lòng nhập văn bản phán quyết phân xử');
      return;
    }
    if (!resolutionType) {
      toast.error('Vui lòng chọn loại phán quyết');
      return;
    }
    if (!selectedDispute) return;

    setSubmitting(true);
    try {
      const response = await api.post(`/admin/disputes/${selectedDispute.id}/resolve`, {
        resolution: resolutionText.trim(),
        resolutionType,
        customerPercent: resolutionType === 'split' ? customerPercent : (resolutionType === 'refund_customer' ? 100 : 0),
        contractorPercent: resolutionType === 'split' ? contractorPercent : (resolutionType === 'keep_contractor' ? 100 : 0),
      });
      
      toast.success('⚖️ Phán quyết phân xử tranh chấp đã được thực thi!');
      const updated = response.data.data;
      setSelectedDispute(updated);
      setDisputes((prev) => prev.map((d) => (d.id === selectedDispute.id ? updated : d)));
      setShowResolvePanel(false);
    } catch (error) {
      console.error('Error resolving dispute:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi thực thi phán quyết');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedDispute) {
      toast.error('Nội dung tin nhắn không được để trống');
      return;
    }

    try {
      const response = await api.post(`/admin/disputes/${selectedDispute.id}/messages`, {
        content: messageText.trim(),
      });
      const updated = response.data.data;
      setSelectedDispute(updated);
      setDisputes((prev) => prev.map((d) => (d.id === selectedDispute.id ? updated : d)));
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Không thể gửi tin nhắn đối chất');
    }
  };

  const formatCurrency = (amount) => {
    if (amount == null) return '0đ';
    return `${amount.toLocaleString('vi-VN')}đ`;
  };

  const getStatusBadge = (status) => {
    if (status === 'PENDING') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded-full text-xs font-bold">
          <Clock size={12} className="animate-spin-slow" />
          Chờ giải quyết
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-bold">
        <CheckCircle2 size={12} />
        Đã giải quyết
      </span>
    );
  };

  // Tự động điều chỉnh tỷ lệ khi chọn preset
  const handlePercentPreset = (cust, cont) => {
    setCustomerPercent(cust);
    setContractorPercent(cont);
  };

  const handleApplyProgressSplit = () => {
    if (constructionLogs.length === 0) {
      toast.error('Không tìm thấy nhật ký thi công nào để đối chiếu tiến độ');
      return;
    }
    const maxProg = Math.max(...constructionLogs.map((l) => l.progressPercent));
    setContractorPercent(maxProg);
    setCustomerPercent(100 - maxProg);
    toast.success(`Đã tự động chia theo tiến độ thi công đạt được: ${maxProg}%`);
  };

  const activeDisputePool = selectedDispute 
    ? (selectedDispute.disputePool || selectedDispute.amount || 0) 
    : 0;

  return (
    <Layout title="Giải quyết Tranh chấp & Khiếu nại">
      <div className="space-y-6">
        
        {/* TOP SUMMARY STATS WIDGET */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative overflow-hidden rounded-3xl border border-gray-150 bg-white p-5 shadow-xs transition hover:shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full flex items-center justify-center shrink-0">
              <Scale className="text-primary opacity-30 -mr-6 -mt-6" size={40} />
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tổng số vụ việc</p>
            <p className="mt-3 text-3xl font-black text-slate-800">{disputes.length}</p>
            <p className="mt-2 text-[10px] text-gray-400">Tranh chấp được ghi nhận trên nền tảng.</p>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-rose-100 bg-rose-50/10 p-5 shadow-xs transition hover:shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full flex items-center justify-center shrink-0">
              <Clock className="text-rose-500 opacity-20 -mr-6 -mt-6" size={40} />
            </div>
            <p className="text-xs font-semibold text-rose-500 uppercase tracking-wider">Đang chờ xử lý</p>
            <p className="mt-3 text-3xl font-black text-rose-655">{disputes.filter(d => d.status === 'PENDING').length}</p>
            <p className="mt-2 text-[10px] text-rose-400 font-medium">Yêu cầu phán quyết khẩn cấp từ Trọng tài.</p>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-emerald-50/10 p-5 shadow-xs transition hover:shadow-sm">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full flex items-center justify-center shrink-0">
              <Unlock className="text-emerald-505 opacity-20 -mr-6 -mt-6" size={40} />
            </div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Đã gỡ phong tỏa</p>
            <p className="mt-3 text-3xl font-black text-emerald-700">
              {disputes.filter(d => d.status === 'RESOLVED' || !d.isDisputed).length}
            </p>
            <p className="mt-2 text-[10px] text-emerald-500 font-medium">Hợp đồng đã được mở khóa/giải phóng.</p>
          </div>
        </div>

        {/* TWO-COLUMN WORKSPACE PANEL */}
        <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          
          {/* LEFT COLUMN: DISPUTE LISTING */}
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-gray-150 p-4 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800 text-sm">Hồ sơ tranh chấp</h3>
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px] font-black">{filteredDisputes.length} hồ sơ</span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="relative w-full">
                  <Search className="absolute left-3.5 top-3 text-gray-400" size={14} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm mã, dự án, tên khách..."
                    className="w-full rounded-full border border-gray-150 bg-gray-50 py-2.5 pl-9 pr-4 text-xs text-gray-855 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-2.5 py-1.5 border border-gray-150">
                  <Filter className="text-gray-400 shrink-0" size={12} />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full bg-transparent text-xs text-gray-700 outline-none font-bold cursor-pointer"
                  >
                    {FILTER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* List View Container */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredDisputes.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-center text-xs text-gray-400">
                  Không tìm thấy tranh chấp phù hợp bộ lọc.
                </div>
              ) : (
                filteredDisputes.map((dispute) => {
                  const isSelected = selectedDispute?.id === dispute.id;
                  return (
                    <button
                      key={dispute.id}
                      type="button"
                      onClick={() => setSelectedDispute(dispute)}
                      className={`w-full rounded-2xl border p-4 text-left transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/[0.03] shadow-sm ring-1 ring-primary/30' 
                          : 'border-gray-150 bg-white hover:border-gray-355'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h4 className="font-bold text-gray-900 text-xs line-clamp-1">
                            {dispute.projectName || "Đơn hàng tùy chỉnh"}
                          </h4>
                          <p className="text-[10px] text-gray-400">Mã tranh chấp: <strong>#{dispute.id}</strong></p>
                        </div>
                        <span className={`shrink-0 rounded-md px-2 py-0.5 text-[9px] font-black ${
                          dispute.status === 'PENDING' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {dispute.status === 'PENDING' ? 'ĐANG CHỜ' : 'ĐÃ PHÁN QUYẾT'}
                        </span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500">
                        <span className="truncate max-w-[150px]">Khách: <strong>{dispute.customerName || "N/A"}</strong></span>
                        <span className="font-black text-slate-800">{formatCurrency(dispute.amount)}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: WORKSPACE */}
          <div className="bg-white rounded-3xl border border-gray-150 shadow-xs overflow-hidden flex flex-col min-h-[700px]">
            {!selectedDispute ? (
              <div className="flex flex-col items-center justify-center flex-1 p-8 text-center text-gray-400 space-y-3">
                <Scale size={48} className="text-gray-300 opacity-60 animate-bounce-slow" />
                <p className="text-sm">Vui lòng chọn một hồ sơ tranh chấp ở danh sách bên trái để bắt đầu phân xử.</p>
              </div>
            ) : (
              <div className="flex flex-col flex-1">
                
                {/* 1. Header chi tiết */}
                <div className="bg-slate-50/50 border-b border-gray-150 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[10px] font-black">
                        Hồ sơ tranh chấp #{selectedDispute.id}
                      </span>
                      {getStatusBadge(selectedDispute.status)}
                      {selectedDispute.isDisputed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-full text-[10px] font-black">
                          🔒 Đang đóng băng dòng tiền
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-black">
                          🔓 Đã giải phóng hợp đồng
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-black text-gray-900 leading-snug">
                      {selectedDispute.projectName || "Đơn hàng tùy chỉnh"}
                    </h2>
                    <p className="text-[10px] text-gray-400">Số hợp đồng: <strong className="text-gray-655">{selectedDispute.contractNumber || "N/A"}</strong></p>
                  </div>

                  {/* Unfreeze action toggle */}
                  {selectedDispute.status === 'PENDING' && selectedDispute.isDisputed && (
                    <button
                      type="button"
                      onClick={handleUnfreezeContract}
                      className="inline-flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2.5 text-xs shadow-xs transition-colors shrink-0"
                    >
                      <Unlock size={14} /> Gỡ phong tỏa hợp đồng
                    </button>
                  )}
                </div>

                {/* 2. Scrollable Workspace Content */}
                <div className="p-6 flex-1 overflow-y-auto space-y-6 max-h-[550px]">
                  
                  {/* Đối tác tham gia */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-650 flex items-center justify-center shrink-0 font-bold text-sm">A</div>
                      <div className="min-w-0">
                        <p className="text-[9px] text-gray-400 uppercase font-black">Khách hàng (Bên A)</p>
                        <p className="text-xs font-bold text-gray-800 truncate">{selectedDispute.customerName || "Chưa cập nhật"}</p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-650 flex items-center justify-center shrink-0 font-bold text-sm">B</div>
                      <div className="min-w-0">
                        <p className="text-[9px] text-gray-400 uppercase font-black">Nhà thầu (Bên B)</p>
                        <p className="text-xs font-bold text-gray-800 truncate">{selectedDispute.contractorName || "Chưa cập nhật"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Lý do khiếu nại gốc */}
                  <div className="rounded-2xl border border-red-100 bg-rose-500/[0.02] p-4 space-y-2">
                    <h4 className="text-[10px] font-black text-rose-700 uppercase tracking-widest flex items-center gap-1.5">
                      <ShieldAlert size={14} /> Nội dung khiếu nại gốc
                    </h4>
                    <p className="text-xs text-gray-700 leading-relaxed bg-white border border-rose-100/50 p-3 rounded-xl italic">
                      "{selectedDispute.reason || "Không có lý do chi tiết được cung cấp"}"
                    </p>
                  </div>

                  {/* Chi tiết sổ cái ký quỹ */}
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/[0.02] p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-emerald-100/50 pb-2.5">
                      <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">
                        Sổ cái ký quỹ & Quỹ tranh chấp thực tế (D_Pool)
                      </h4>
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/30 px-2 py-0.5 rounded">
                        Tổng hợp đồng: {formatCurrency(selectedDispute.amount)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-white rounded-xl p-2.5 border border-slate-100 shadow-xxs">
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Ký quỹ còn lại</p>
                        <p className="text-xs font-black text-[#11382b] mt-1">
                          {formatCurrency(selectedDispute.customerRemainingEscrow || 0)}
                        </p>
                      </div>
                      <div className="bg-white rounded-xl p-2.5 border border-slate-100 shadow-xxs">
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Bảo lãnh khóa</p>
                        <p className="text-xs font-black text-amber-700 mt-1">
                          {formatCurrency(selectedDispute.contractorLockedEscrow || 0)}
                        </p>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2.5">
                        <p className="text-[9px] text-emerald-800 font-black uppercase">Quỹ tranh chấp</p>
                        <p className="text-xs font-black text-emerald-700 mt-1">
                          {formatCurrency(activeDisputePool)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Toggle tab xem tài liệu nhật ký thi công đối chiếu */}
                  <div className="border border-gray-155 rounded-2xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setActiveLogsTab(!activeLogsTab)}
                      className="w-full bg-gray-50/50 px-4 py-3 flex items-center justify-between text-xs font-bold text-gray-700 border-b border-gray-150 hover:bg-gray-55 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <FileText size={14} className="text-primary" />
                        Nhật ký thi công thực tế đạt được ({constructionLogs.length} ghi nhận)
                      </span>
                      <ChevronRight size={14} className={`text-gray-400 transition-transform ${activeLogsTab ? 'rotate-90' : ''}`} />
                    </button>
                    {activeLogsTab && (
                      <div className="p-4 bg-white space-y-4 max-h-[300px] overflow-y-auto">
                        {loadingLogs ? (
                          <div className="text-center py-4 text-xs text-gray-405">Đang tải nhật ký...</div>
                        ) : constructionLogs.length === 0 ? (
                          <div className="text-center py-6 text-xs text-gray-400 flex flex-col items-center gap-1">
                            <Info size={18} className="opacity-60" />
                            <span>Chưa có nhật ký thi công nào được ghi nhận cho hợp đồng này.</span>
                          </div>
                        ) : (
                          constructionLogs.map((log, idx) => (
                            <div key={log.id} className="border border-gray-100 rounded-xl p-3 space-y-2.5 bg-slate-50/30">
                              <div className="flex items-center justify-between text-[10px] border-b border-gray-100 pb-1.5">
                                <span className="font-bold text-gray-505">Bản cập nhật #{idx + 1}</span>
                                <span className="bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">
                                  Tiến độ: {log.progressPercent}%
                                </span>
                              </div>
                              <p className="text-xs text-gray-700 leading-relaxed">{log.description}</p>
                              {log.imageUrls && log.imageUrls.length > 0 && (
                                <div className="grid grid-cols-4 gap-2 pt-1.5">
                                  {log.imageUrls.map((url, i) => (
                                    <a key={i} href={url} target="_blank" rel="noreferrer" className="block h-14 rounded-lg overflow-hidden border border-gray-100 group">
                                      <img src={url} alt="Bằng chứng thi công" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Chat đối chất trực tuyến 3 bên */}
                  <div className="space-y-3.5">
                    <h4 className="text-xs font-bold text-gray-800 flex items-center gap-2">
                      <MessageSquare size={14} className="text-primary" />
                      Phòng chat đối chất trọng tài 3 bên
                    </h4>
                    <div className="border border-gray-150 rounded-2xl bg-gray-50/30 p-4 space-y-3 max-h-[300px] overflow-y-auto">
                      {selectedDispute.messages && selectedDispute.messages.length > 0 ? (
                        selectedDispute.messages.map((message) => {
                          const isAdmin = message.author.includes("Admin") || message.author.includes("admin") || message.author === "SYSTEM";
                          return (
                            <div
                              key={message.id}
                              className={`flex flex-col max-w-[85%] rounded-2xl p-3.5 shadow-xxs ${
                                isAdmin 
                                  ? 'bg-slate-800 text-white self-center' 
                                  : 'bg-white text-gray-800 border border-gray-100'
                              }`}
                              style={{ alignSelf: isAdmin ? 'center' : (message.author.includes("Chủ") ? 'flex-start' : 'flex-end') }}
                            >
                              <span className={`text-[9px] font-bold ${isAdmin ? 'text-emerald-400' : 'text-gray-400'}`}>
                                {message.author}
                              </span>
                              <p className="text-xs leading-relaxed mt-1.5 whitespace-pre-wrap">{message.content}</p>
                              <span className="text-[9px] text-gray-405 text-right mt-2 block">
                                {new Date(message.createdAt).toLocaleString('vi-VN')}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-12 text-xs text-gray-400">
                          Chưa có lịch sử nhắn tin. Admin, Khách hàng và Nhà thầu có thể trao đổi trực tiếp tại đây.
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input */}
                    <div className="flex gap-2">
                      <textarea
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Soạn phản hồi của Trọng tài..."
                        rows={2}
                        className="w-full border border-gray-150 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary resize-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={handleSendMessage}
                        className="bg-primary hover:bg-primary-light text-white font-bold rounded-xl px-4 flex items-center justify-center shadow-xs transition-colors shrink-0 text-xs"
                      >
                        Gửi
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Panel Xử lý phán quyết phân xử dưới bottom */}
                <div className="border-t border-gray-150 p-6 bg-slate-50/50 space-y-4">
                  {!showResolvePanel ? (
                    selectedDispute.status === 'PENDING' ? (
                      <button
                        type="button"
                        onClick={() => setShowResolvePanel(true)}
                        className="w-full py-3.5 bg-primary hover:bg-primary-light text-white font-bold rounded-2xl shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                      >
                        <Scale size={16} /> Đưa ra phán quyết phân xử
                      </button>
                    ) : (
                      <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 space-y-2">
                        <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest flex items-center gap-1.5">
                          ⚖️ Phán quyết đã thực thi
                        </h4>
                        <p className="text-xs text-emerald-900">
                          Quyết định: <strong>{selectedDispute.resolutionType === 'refund_customer' ? 'Hoàn 100% Khách hàng' : (selectedDispute.resolutionType === 'keep_contractor' ? 'Trả 100% Nhà thầu' : 'Chia theo tỷ lệ')}</strong>
                        </p>
                        <p className="text-xs text-emerald-900 border-t border-emerald-100/30 pt-1.5 mt-1.5 italic">
                          "{selectedDispute.resolution}"
                        </p>
                        {selectedDispute.refundAmount != null && (
                          <p className="text-[10px] text-emerald-600 font-bold">Số tiền hoàn trả khách: {formatCurrency(selectedDispute.refundAmount)}</p>
                        )}
                      </div>
                    )
                  ) : (
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <h4 className="text-xs font-black text-gray-800 uppercase flex items-center gap-1.5">
                          <Scale size={14} className="text-primary" />
                          Thiết lập phán quyết trọng tài
                        </h4>
                        <button
                          type="button"
                          onClick={() => setShowResolvePanel(false)}
                          className="text-xs text-gray-400 hover:text-gray-600 font-bold"
                        >
                          Hủy bỏ
                        </button>
                      </div>

                      {/* Loại quyết định */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-450 uppercase">Chọn hướng phán quyết</label>
                        <select
                          value={resolutionType}
                          onChange={(e) => setResolutionType(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary cursor-pointer font-bold"
                        >
                          <option value="">-- Chọn hướng phân chia tiền --</option>
                          {RESOLUTION_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Phân chia chi tiết bằng thanh trượt */}
                      {resolutionType === 'split' && (
                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tỷ lệ phân chia chi tiết</span>
                            <div className="flex gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={handleApplyProgressSplit}
                                className="px-2 py-0.5 bg-primary/10 hover:bg-primary/20 text-[9px] font-black text-primary rounded transition-all flex items-center gap-1"
                              >
                                <TrendingUp size={10} /> Theo tiến độ thi công
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePercentPreset(70, 30)}
                                className="px-2 py-0.5 bg-white border border-gray-200 hover:bg-gray-55 text-[9px] font-black text-gray-600 rounded transition-all"
                              >
                                70 Khách / 30 Thầu
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePercentPreset(50, 50)}
                                className="px-2 py-0.5 bg-white border border-gray-200 hover:bg-gray-55 text-[9px] font-black text-gray-600 rounded transition-all"
                              >
                                50/50
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePercentPreset(30, 70)}
                                className="px-2 py-0.5 bg-white border border-gray-200 hover:bg-gray-55 text-[9px] font-black text-gray-600 rounded transition-all"
                              >
                                30 Khách / 70 Thầu
                              </button>
                            </div>
                          </div>

                          {/* Visual Progress Split bar */}
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-250 rounded-full overflow-hidden flex shadow-inner">
                              <div
                                style={{ width: `${customerPercent}%` }}
                                className="bg-indigo-500 transition-all duration-300 ease-out"
                              ></div>
                              <div
                                style={{ width: `${contractorPercent}%` }}
                                className="bg-emerald-500 transition-all duration-300 ease-out"
                              ></div>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={contractorPercent}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setContractorPercent(val);
                                setCustomerPercent(100 - val);
                              }}
                              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                          </div>

                          {/* Detail input forms */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-indigo-500 rounded-xs"></span>
                                Khách hàng nhận
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={customerPercent}
                                  onChange={(e) => {
                                    const val = Math.min(100, Math.max(0, Number(e.target.value)));
                                    setCustomerPercent(val);
                                    setContractorPercent(100 - val);
                                  }}
                                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-black text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                                <span className="absolute right-3 top-2.5 text-[10px] text-gray-400 font-bold">%</span>
                              </div>
                              <p className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50/50 p-1.5 rounded-lg border border-indigo-100/30 truncate mt-1">
                                {formatCurrency(Math.round(activeDisputePool * customerPercent / 100))}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-gray-400 uppercase flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-emerald-500 rounded-xs"></span>
                                Nhà thầu nhận
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={contractorPercent}
                                  onChange={(e) => {
                                    const val = Math.min(100, Math.max(0, Number(e.target.value)));
                                    setContractorPercent(val);
                                    setCustomerPercent(100 - val);
                                  }}
                                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-black text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                />
                                <span className="absolute right-3 top-2.5 text-[10px] text-gray-400 font-bold">%</span>
                              </div>
                              <p className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50/50 p-1.5 rounded-lg border border-emerald-100/30 truncate mt-1">
                                {formatCurrency(Math.round(activeDisputePool * contractorPercent / 100))}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Mô tả quyết định */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-450 uppercase">Văn bản phán quyết pháp lý</label>
                        <textarea
                          value={resolutionText}
                          onChange={(e) => setResolutionText(e.target.value)}
                          placeholder="Mô tả chi tiết lý do phân chia và căn cứ đưa ra phán quyết..."
                          rows={3}
                          className="w-full border border-gray-150 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary resize-none transition-colors"
                        />
                      </div>

                      <button
                        type="button"
                        disabled={submitting}
                        onClick={handleResolveDispute}
                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                      >
                        {submitting ? 'Đang thực thi phán quyết...' : 'Xác nhận và Giải ngân phán quyết'}
                      </button>
                    </div>
                  )}
                </div>
                
              </div>
            )}
          </div>
          
        </div>

      </div>
    </Layout>
  );
};

export default AdminDisputesPage;
