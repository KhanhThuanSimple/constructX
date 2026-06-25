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
  Shield,
  Sparkles,
  DollarSign,
  Calendar,
  Scale,
  Send,
  FileText,
  Activity
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả tranh chấp' },
  { value: 'pending', label: 'Chờ giải quyết' },
  { value: 'resolved', label: 'Đã giải quyết' },
];

const RESOLUTION_OPTIONS = [
  { value: 'refund_customer', label: 'Hoàn 100% tiền cho Khách hàng' },
  { value: 'keep_contractor', label: 'Giải ngân 100% cho Nhà thầu' },
  { value: 'split', label: 'Phân chia theo tỷ lệ tự chọn' },
];

const AdminDisputesPage = () => {
  const [disputes, setDisputes] = useState([]);
  const [filteredDisputes, setFilteredDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Resolution form state
  const [resolutionType, setResolutionType] = useState('');
  const [resolutionText, setResolutionText] = useState('');
  const [customerPercent, setCustomerPercent] = useState(50);
  const [contractorPercent, setContractorPercent] = useState(50);
  const [submittingResolution, setSubmittingResolution] = useState(false);

  // Chat and AI state
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Construction logs state
  const [constructionLogs, setConstructionLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchDisputes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [disputes, searchTerm, filter]);

  useEffect(() => {
    // Scroll to bottom of chat when dispute or messages change
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
  }, [selectedDispute?.id]);

  const fetchConstructionLogs = async (contractId) => {
    setLoadingLogs(true);
    try {
      const response = await api.get(`/api/contracts/${contractId}/construction-logs`);
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
      
      // Keep the currently selected dispute updated if it exists, otherwise select the first one
      if (selectedDispute) {
        const updated = data.find(d => d.id === selectedDispute.id);
        if (updated) {
          setSelectedDispute(updated);
        }
      } else if (data.length > 0) {
        setSelectedDispute(data[0]);
      }
    } catch (error) {
      console.error('Error fetching disputes:', error);
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
          (d.contractNumber && d.contractNumber.toLowerCase().includes(term)) ||
          (d.customerName && d.customerName.toLowerCase().includes(term)) ||
          (d.contractorName && d.contractorName.toLowerCase().includes(term))
      );
    }

    setFilteredDisputes(result);
  };

  const handleSelectDispute = (dispute) => {
    setSelectedDispute(dispute);
    setAiSummary('');
  };

  const handleGetAiSummary = async () => {
    if (!selectedDispute) return;
    setLoadingAi(true);
    setAiSummary('');
    try {
      const response = await api.post(`/admin/disputes/${selectedDispute.id}/ai-summary`);
      setAiSummary(response.data.data);
      toast.success('Đã tải tóm tắt phân tích từ AI Grok');
    } catch (error) {
      console.error('Error fetching AI summary:', error);
      toast.error('Không thể lấy tóm tắt phân tích từ AI');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleResolveClick = () => {
    if (!selectedDispute) return;
    setResolutionType('');
    setResolutionText('');
    setCustomerPercent(50);
    setContractorPercent(50);
    setShowModal(true);
  };

  const handleResolveDispute = async () => {
    if (!resolutionType) {
      toast.error('Vui lòng chọn loại quyết định');
      return;
    }
    if (!resolutionText.trim()) {
      toast.error('Vui lòng nhập lý do quyết định phân xử');
      return;
    }
    if (Number(customerPercent) + Number(contractorPercent) !== 100) {
      toast.error('Tổng tỷ lệ phân chia cho hai bên phải bằng 100%');
      return;
    }
    if (!selectedDispute) return;

    setSubmittingResolution(true);
    try {
      await api.post(`/admin/disputes/${selectedDispute.id}/resolve`, {
        resolution: resolutionText.trim(),
        resolutionType,
        customerPercent: Number(customerPercent),
        contractorPercent: Number(contractorPercent),
      });
      toast.success('Giải quyết tranh chấp và phân bổ dòng tiền thành công');
      setShowModal(false);
      fetchDisputes();
    } catch (error) {
      console.error('Error resolving dispute:', error);
      const errorMsg = error.response?.data?.message || 'Lỗi hệ thống khi phân xử dòng tiền';
      toast.error(errorMsg);
    } finally {
      setSubmittingResolution(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedDispute) {
      return;
    }

    setSendingMessage(true);
    try {
      const response = await api.post(`/admin/disputes/${selectedDispute.id}/messages`, {
        content: messageText.trim(),
      });
      
      // Update selected dispute and dispute list with the updated message list
      const updatedDispute = response.data.data;
      setSelectedDispute(updatedDispute);
      setDisputes(prev => prev.map(d => d.id === updatedDispute.id ? updatedDispute : d));
      setMessageText('');
      toast.success('Tin nhắn đã được gửi tới phòng chat 3 bên');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Không thể gửi tin nhắn');
    } finally {
      setSendingMessage(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount == null) return '0đ';
    return `${amount.toLocaleString('vi-VN')}đ`;
  };

  const getStatusBadge = (status) => {
    if (status === 'PENDING') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600 border border-rose-100 animate-pulse">
          <Clock size={12} /> Chờ phân xử
        </span>
      );
    }
    if (status === 'RESOLVED') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600 border border-emerald-100">
          <CheckCircle2 size={12} /> Đã giải quyết
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600 border border-slate-100">
        Khác
      </span>
    );
  };

  const summary = {
    total: disputes.length,
    pending: disputes.filter((d) => d.status === 'PENDING').length,
    resolved: disputes.filter((d) => d.status === 'RESOLVED').length,
    amount: disputes.reduce((sum, d) => sum + (d.amount || 0), 0),
  };

  return (
    <Layout title="Phân Xử Tranh Chấp & Ký Quỹ Escrow">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        
        {/* TOP HEADER SUMMARY */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#11382b] to-[#1a4f3a] p-6 text-white shadow-lg border border-emerald-800/30">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
                <Scale className="text-emerald-400" size={28} />
                Trung Tâm Phân Xử Tranh Chấp
              </h2>
              <p className="text-sm text-emerald-100/80 mt-2 max-w-2xl">
                Giám sát dòng tiền ký quỹ Escrow bảo vệ an toàn cho cả hai bên. Thực thi phán quyết đóng băng, xả băng ví điện tử và phân bổ tỷ lệ dòng tiền tự động bằng công nghệ Smart Arbitration.
              </p>
            </div>
            
            {/* Quick KPIs Grid */}
            <div className="grid grid-cols-3 gap-3 bg-black/15 backdrop-blur-md p-4 rounded-2xl border border-white/5 text-center min-w-[340px]">
              <div>
                <p className="text-[10px] text-emerald-200 uppercase font-bold tracking-widest">Tổng số ca</p>
                <p className="text-2xl font-black mt-1.5">{summary.total}</p>
              </div>
              <div className="border-x border-white/10 px-3">
                <p className="text-[10px] text-rose-300 uppercase font-bold tracking-widest">Cần xử lý</p>
                <p className="text-2xl font-black text-rose-400 mt-1.5">{summary.pending}</p>
              </div>
              <div>
                <p className="text-[10px] text-emerald-200 uppercase font-bold tracking-widest">Tổng giá trị</p>
                <p className="text-lg font-extrabold mt-2 text-yellow-300 truncate">{formatCurrency(summary.amount)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* WORKSPACE COLUMN SPLIT */}
        <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          
          {/* LEFT LIST PANEL */}
          <div className="flex flex-col gap-4 bg-white rounded-3xl border border-slate-200/70 p-5 shadow-sm h-[calc(100vh-280px)] min-h-[500px]">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-lg">Danh sách vụ việc</h3>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                  {filteredDisputes.length} kết quả
                </span>
              </div>
              
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo dự án, hợp đồng, tên..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:border-[#1a4f3a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a4f3a]/15 transition-all"
                />
              </div>

              {/* Status filter tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFilter(opt.value)}
                    className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all ${
                      filter === opt.value
                        ? 'bg-white text-slate-800 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {opt.label.split(' ')[0]} {/* Lấy chữ đầu cho gọn */}
                  </button>
                ))}
              </div>
            </div>

            {/* List container */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1.5 -mr-1.5">
              {filteredDisputes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400 p-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30">
                  <Shield size={32} className="text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">Không tìm thấy tranh chấp nào</p>
                </div>
              ) : (
                filteredDisputes.map((dispute) => {
                  const isSelected = selectedDispute?.id === dispute.id;
                  return (
                    <button
                      key={dispute.id}
                      type="button"
                      onClick={() => handleSelectDispute(dispute)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${
                        isSelected
                          ? 'border-[#1a4f3a] bg-emerald-50/20 shadow-sm ring-1 ring-[#1a4f3a]/20'
                          : 'border-slate-150 bg-white hover:bg-slate-50/50 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1a4f3a]"></div>
                      )}
                      
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 group-hover:text-[#1a4f3a] transition-colors truncate">
                            {dispute.projectName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-1 flex flex-wrap items-center gap-1">
                            <span>#{dispute.id}</span>
                            <span>•</span>
                            <span className="truncate max-w-[80px]">{dispute.customerName}</span>
                            <span>→</span>
                            <span className="truncate max-w-[80px]">{dispute.contractorName}</span>
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs font-black text-slate-800">{formatCurrency(dispute.amount)}</p>
                          <div className="mt-1">{getStatusBadge(dispute.status)}</div>
                        </div>
                      </div>

                      <div className="mt-3.5 bg-slate-50 rounded-xl p-2.5 text-[10px] text-slate-500 flex items-start gap-2 border border-slate-100 group-hover:bg-white transition-all">
                        <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 leading-relaxed">{dispute.reason}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT DETAIL & WORKSPACE PANEL */}
          <div className="bg-white rounded-3xl border border-slate-200/70 p-6 shadow-sm min-h-[500px] flex flex-col justify-between h-[calc(100vh-280px)] overflow-hidden">
            {!selectedDispute ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#1a4f3a] flex items-center justify-center mb-4 shadow-inner">
                  <Scale size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Chưa chọn tranh chấp</h3>
                <p className="text-sm text-slate-400 max-w-sm mt-1">
                  Vui lòng chọn một tranh chấp từ danh sách bên trái để mở không gian làm việc, xem lịch sử đối chất và ra quyết định phân xử dòng tiền.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                
                {/* 1. WORKSPACE HEADER */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-100 shrink-0">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-100/50 px-2 py-0.5 rounded uppercase tracking-wider">
                        Tranh chấp #{selectedDispute.id}
                      </span>
                      {selectedDispute.contractNumber && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <FileText size={10} /> HĐ: {selectedDispute.contractNumber}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mt-2 tracking-tight">
                      {selectedDispute.projectName}
                    </h3>
                    
                    {/* User Profiles Side-by-side */}
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100 text-xs text-slate-600 font-semibold">
                        <User size={12} className="text-indigo-500" />
                        <span>Chủ nhà: <strong>{selectedDispute.customerName}</strong></span>
                      </div>
                      <div className="text-slate-300 text-xs">➔</div>
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100 text-xs text-slate-600 font-semibold">
                        <User size={12} className="text-emerald-500" />
                        <span>Nhà thầu: <strong>{selectedDispute.contractorName}</strong></span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right flex flex-col items-end gap-2 shrink-0">
                    <div>{getStatusBadge(selectedDispute.status)}</div>
                    <div className="text-sm font-bold text-slate-400">
                      Đóng băng: <strong className="text-slate-800 text-base font-black">{formatCurrency(selectedDispute.amount)}</strong>
                    </div>
                  </div>
                </div>

                {/* SCROLLABLE WORKSPACE CONTAINER */}
                <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1.5 -mr-1.5">
                  
                  {/* TWO CARD STATS ROW */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
                        <AlertCircle size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Lý do khiếu nại</p>
                        <p className="text-xs text-slate-700 font-bold mt-1 line-clamp-2 leading-relaxed">
                          {selectedDispute.reason}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Thời gian ghi nhận</p>
                        <p className="text-xs text-slate-800 font-black mt-1">
                          {new Date(selectedDispute.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* NHẬT KÝ THI CÔNG THỰC TẾ SECTION */}
                  {selectedDispute.contractId && (
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                          <Activity size={16} className="text-emerald-600" />
                          Nhật ký thi công thực tế
                        </h4>
                        {constructionLogs.length > 0 && (
                          <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/50">
                            Tiến độ: {Math.max(...constructionLogs.map(l => l.progressPercent))}%
                          </span>
                        )}
                      </div>

                      {loadingLogs ? (
                        <div className="space-y-3 py-2">
                          <div className="h-4 bg-slate-100 rounded-md animate-pulse w-2/3"></div>
                          <div className="h-12 bg-slate-50 rounded-lg animate-pulse"></div>
                        </div>
                      ) : constructionLogs.length === 0 ? (
                        <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl p-5 text-center text-slate-400 text-xs">
                          <Activity className="mx-auto text-slate-300 mb-2" size={20} />
                          Chưa có nhật ký thi công nào được cập nhật cho hợp đồng này.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Visual progress bar */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                              <span>Tiến độ hoàn thành</span>
                              <span>{Math.max(...constructionLogs.map(l => l.progressPercent))}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${Math.max(...constructionLogs.map(l => l.progressPercent))}%` }}
                                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                              ></div>
                            </div>
                          </div>

                          {/* Timeline of logs */}
                          <div className="relative border-l-2 border-slate-100 pl-4 ml-2 space-y-4 max-h-64 overflow-y-auto pr-1">
                            {constructionLogs.map((log) => (
                              <div key={log.id} className="relative space-y-1">
                                {/* Bullet point indicator */}
                                <span className="absolute -left-[23px] top-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-white">
                                  <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                                </span>

                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700 border border-emerald-100">
                                    {log.phaseLabel || 'Cập nhật tiến độ'} ({log.progressPercent}%)
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-semibold">
                                    {new Date(log.createdAt).toLocaleString('vi-VN')}
                                  </span>
                                </div>

                                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50 mt-1">
                                  {log.description}
                                </p>

                                {/* Images grid */}
                                {log.imageUrls && log.imageUrls.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {log.imageUrls.map((img, index) => (
                                      <button
                                        key={index}
                                        type="button"
                                        onClick={() => window.open(img, '_blank')}
                                        className="h-14 w-14 rounded-lg overflow-hidden border border-slate-100 hover:border-[#1a4f3a] transition-all hover:scale-105"
                                        title="Click để phóng to ảnh"
                                      >
                                        <img
                                          src={img}
                                          alt={`Minh chứng ${index + 1}`}
                                          className="h-full w-full object-cover"
                                        />
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PREVIOUS RESOLUTION INFO (IF RESOLVED) */}
                  {selectedDispute.status === 'RESOLVED' && (
                    <div className="rounded-2xl bg-emerald-50/50 p-4 border border-emerald-100 shadow-xs">
                      <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm">
                        <CheckCircle2 size={16} /> Phán Quyết Phân Xử Chính Thức
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2 text-xs text-emerald-900 leading-relaxed bg-white p-3.5 rounded-xl border border-emerald-100">
                        <div>
                          <p className="text-slate-400 font-bold">Loại phán quyết:</p>
                          <p className="font-bold text-slate-800 mt-1 uppercase text-[10px] tracking-wide">{selectedDispute.resolutionType}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-bold">Số tiền hoàn trả Khách hàng:</p>
                          <p className="font-extrabold text-[#1a4f3a] text-sm mt-1">{formatCurrency(selectedDispute.refundAmount)}</p>
                        </div>
                        <div className="sm:col-span-2 border-t border-slate-100 pt-2.5 mt-1">
                          <p className="text-slate-400 font-bold">Văn bản phán quyết:</p>
                          <p className="text-slate-700 mt-1 italic leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">"{selectedDispute.resolution}"</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI GROK ASSISTANT PANEL */}
                  {selectedDispute.status === 'PENDING' && (
                    <div className="rounded-2xl bg-gradient-to-r from-emerald-50/40 via-teal-50/20 to-indigo-50/20 p-4 border border-emerald-100/60 shadow-xs space-y-3 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-xl pointer-events-none"></div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="text-emerald-500 animate-pulse" size={16} />
                          <span className="text-xs font-black text-[#1a4f3a] uppercase tracking-wider">
                            Trí tuệ nhân tạo (AI Grok Assistant)
                          </span>
                        </div>
                        <button
                          onClick={handleGetAiSummary}
                          disabled={loadingAi}
                          className="px-3 py-1 bg-[#1a4f3a] hover:bg-[#163b2d] disabled:bg-slate-400 text-white rounded-full text-[10px] font-bold tracking-wider uppercase transition-all duration-300 shadow-xs"
                        >
                          {loadingAi ? 'Đang tóm tắt...' : aiSummary ? 'Cập nhật phân tích' : 'Tóm tắt & Đề xuất'}
                        </button>
                      </div>
                      
                      {aiSummary ? (
                        <div className="bg-white/90 backdrop-blur-xs rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed border border-emerald-100/60 shadow-inner max-h-60 overflow-y-auto whitespace-pre-line">
                          {aiSummary}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400">
                          AI sẽ tự động đọc lịch sử cuộc trò chuyện đối chất 3 bên bên dưới và đưa ra nhận định, tóm tắt lý lẽ của cả 2 phía kèm theo đề xuất tỷ lệ hoàn tiền tối ưu cho Admin tham khảo.
                        </p>
                      )}
                    </div>
                  )}

                  {/* 3-WAY CHAT ROOM */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <MessageSquare size={16} className="text-slate-400" />
                        Phòng chat đối chất 3 bên
                      </h4>
                      <span className="text-[10px] font-bold text-slate-400 italic">
                        Kết nối trực tiếp Real-time
                      </span>
                    </div>

                    {/* Chat messages box */}
                    <div className="h-64 space-y-3 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50/50 p-4 shadow-inner">
                      {selectedDispute.messages && selectedDispute.messages.length > 0 ? (
                        selectedDispute.messages.map((message) => {
                          // Định dạng hiển thị tin nhắn dựa trên vai trò người gửi
                          const isSystem = message.author.includes('HỆ THỐNG');
                          const isAdminSender = message.author.includes('ADMIN') || message.author.includes('Quản trị');
                          
                          if (isSystem) {
                            return (
                              <div key={message.id} className="flex justify-center my-2">
                                <span className="bg-slate-200/60 text-slate-500 font-bold text-[9px] px-3 py-1 rounded-full border border-slate-300/30 uppercase tracking-wider text-center">
                                  ⚙️ {message.content}
                                </span>
                              </div>
                            );
                          }

                          return (
                            <div key={message.id} className={`flex flex-col ${isAdminSender ? 'items-end' : 'items-start'}`}>
                              <div className={`max-w-[85%] rounded-2xl p-3 shadow-xs border text-xs leading-relaxed ${
                                isAdminSender
                                  ? 'bg-[#1a4f3a] text-white border-emerald-800'
                                  : message.author.includes('CLIENT') || message.author.includes('Khách')
                                    ? 'bg-white text-slate-700 border-slate-200/60'
                                    : 'bg-emerald-50 text-slate-700 border-emerald-100'
                              }`}>
                                <p className={`text-[9px] font-bold mb-1 ${isAdminSender ? 'text-emerald-200' : 'text-slate-400'}`}>
                                  {message.author}
                                </p>
                                <p className="whitespace-pre-wrap">{message.content}</p>
                              </div>
                              <span className="text-[9px] text-slate-400 font-semibold mt-1 px-1">
                                {new Date(message.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 p-4">
                          <MessageSquare size={24} className="text-slate-300 mb-1.5" />
                          <p className="text-[11px] font-bold">Chưa có cuộc trò chuyện đối chất nào</p>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat input box */}
                    {selectedDispute.status === 'PENDING' && (
                      <div className="flex gap-2 items-end">
                        <textarea
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          rows={1}
                          placeholder="Chỉ đạo, hướng dẫn hoặc gửi tin nhắn đối chất..."
                          className="flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#1a4f3a] focus:bg-white focus:ring-2 focus:ring-[#1a4f3a]/15 transition-all max-h-12"
                        />
                        <button
                          type="button"
                          onClick={handleSendMessage}
                          disabled={sendingMessage || !messageText.trim()}
                          className="p-2.5 bg-[#1a4f3a] hover:bg-[#163b2d] text-white rounded-xl transition-all duration-300 shadow-xs disabled:opacity-40"
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                </div>

                {/* 2. ARBITRATION ACTIONS (BOTTOM FIXED) */}
                {selectedDispute.status === 'PENDING' && (
                  <div className="pt-4 border-t border-slate-100 flex justify-end shrink-0">
                    <button
                      type="button"
                      onClick={handleResolveClick}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#1a4f3a] hover:bg-[#163b2d] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <Scale size={16} />
                      Tiến hành phân xử dòng tiền
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>

        {/* ARBITRATION RESOLUTION MODAL */}
        {showModal && selectedDispute && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl border border-slate-200/50 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 shrink-0">
                <div>
                  <span className="text-[10px] font-black text-[#1a4f3a] bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">
                    Hội đồng giải quyết tranh chấp
                  </span>
                  <h2 className="text-lg font-black text-slate-800 mt-1.5 truncate max-w-[360px]">
                    {selectedDispute.projectName}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-all"
                >
                  Đóng
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto py-5 space-y-5 pr-1 -mr-1">
                
                {/* Total amount card */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="text-emerald-600" size={18} />
                    <span className="text-xs font-bold text-slate-500">Quỹ đóng băng Escrow</span>
                  </div>
                  <span className="text-lg font-black text-slate-800">{formatCurrency(selectedDispute.amount)}</span>
                </div>

                {/* Decision Type */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wide">
                    Quyết định phân xử dòng tiền
                  </label>
                  <select
                    value={resolutionType}
                    onChange={(e) => {
                      const val = e.target.value;
                      setResolutionType(val);
                      if (val === 'refund_customer') {
                        setCustomerPercent(100);
                        setContractorPercent(0);
                      } else if (val === 'keep_contractor') {
                        setCustomerPercent(0);
                        setContractorPercent(100);
                      } else if (val === 'split') {
                        setCustomerPercent(50);
                        setContractorPercent(50);
                      }
                    }}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-800 font-semibold outline-none focus:border-[#1a4f3a] focus:ring-2 focus:ring-[#1a4f3a]/15 transition-all"
                  >
                    <option value="">-- Vui lòng chọn loại quyết định --</option>
                    {RESOLUTION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PRESETS SPLIT CONTROLLERS */}
                {resolutionType && (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Tỷ lệ phân chia chi tiết
                      </span>
                      {resolutionType === 'split' && (
                        <div className="flex gap-1.5 flex-wrap">
                          {constructionLogs.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                const maxProg = Math.max(...constructionLogs.map(l => l.progressPercent));
                                setContractorPercent(maxProg);
                                setCustomerPercent(100 - maxProg);
                              }}
                              className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-[9px] font-black text-emerald-700 rounded hover:bg-emerald-100 transition-all mr-1.5"
                              title={`Tự động chia theo tiến độ thi công thực tế đạt ${Math.max(...constructionLogs.map(l => l.progressPercent))}%`}
                            >
                              Theo tiến độ ({Math.max(...constructionLogs.map(l => l.progressPercent))}%)
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => { setCustomerPercent(70); setContractorPercent(30); }}
                            className="px-2 py-0.5 bg-white border border-slate-200 text-[9px] font-black text-slate-600 rounded hover:bg-slate-50 transition-all"
                          >
                            70/30
                          </button>
                          <button
                            type="button"
                            onClick={() => { setCustomerPercent(50); setContractorPercent(50); }}
                            className="px-2 py-0.5 bg-white border border-slate-200 text-[9px] font-black text-slate-600 rounded hover:bg-slate-50 transition-all"
                          >
                            50/50
                          </button>
                          <button
                            type="button"
                            onClick={() => { setCustomerPercent(30); setContractorPercent(70); }}
                            className="px-2 py-0.5 bg-white border border-slate-200 text-[9px] font-black text-slate-600 rounded hover:bg-slate-50 transition-all"
                          >
                            30/70
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Visual Progress/Split Bar */}
                    <div className="h-3.5 bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
                      <div
                        style={{ width: `${customerPercent}%` }}
                        className="bg-indigo-500 transition-all duration-500 ease-out"
                      ></div>
                      <div
                        style={{ width: `${contractorPercent}%` }}
                        className="bg-emerald-500 transition-all duration-500 ease-out"
                      ></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Customer Side */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-indigo-500 rounded-xs inline-block"></span>
                          Khách nhận (%)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          disabled={resolutionType !== 'split'}
                          value={customerPercent}
                          onChange={(e) => {
                            const val = Math.min(100, Math.max(0, Number(e.target.value)));
                            setCustomerPercent(val);
                            setContractorPercent(100 - val);
                          }}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 disabled:bg-slate-100 disabled:text-slate-500 transition-all"
                        />
                        <p className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50/50 p-1.5 rounded-lg border border-indigo-100/30 truncate mt-1">
                          {formatCurrency(Math.round(selectedDispute.amount * customerPercent / 100))}
                        </p>
                      </div>

                      {/* Contractor Side */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs inline-block"></span>
                          Nhà thầu nhận (%)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          disabled={resolutionType !== 'split'}
                          value={contractorPercent}
                          onChange={(e) => {
                            const val = Math.min(100, Math.max(0, Number(e.target.value)));
                            setContractorPercent(val);
                            setCustomerPercent(100 - val);
                          }}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 disabled:bg-slate-100 disabled:text-slate-500 transition-all"
                        />
                        <p className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50/50 p-1.5 rounded-lg border border-emerald-100/30 truncate mt-1">
                          {formatCurrency(Math.round(selectedDispute.amount * contractorPercent / 100))}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Resolution Text Decree */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wide">
                    Văn bản phán quyết phân xử
                  </label>
                  <textarea
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    rows={4}
                    placeholder="Nhập lý do cụ thể, trích lục cơ sở đối chất thực tế từ lịch sử tin nhắn để ra quyết định phán quyết..."
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-800 leading-relaxed outline-none focus:border-[#1a4f3a] focus:ring-2 focus:ring-[#1a4f3a]/15 transition-all"
                  />
                </div>

              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleResolveDispute}
                  disabled={submittingResolution}
                  className="rounded-full bg-[#1a4f3a] hover:bg-[#163b2d] disabled:bg-slate-400 px-6 py-2.5 text-xs font-bold text-white transition hover:shadow-md"
                >
                  {submittingResolution ? 'Đang thực thi dòng tiền...' : 'Thực thi phán quyết'}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default AdminDisputesPage;
