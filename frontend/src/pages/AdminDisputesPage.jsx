import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  AlertCircle,
  MessageSquare,
  CheckCircle2,
  Clock,
  User,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ giải quyết' },
  { value: 'resolved', label: 'Đã giải quyết' },
];

const RESOLUTION_OPTIONS = [
  { value: 'refund_customer', label: 'Hoàn tiền cho khách hàng' },
  { value: 'keep_contractor', label: 'Giữ tiền cho nhà thầu' },
  { value: 'split', label: 'Chia đôi' },
];

const AdminDisputesPage = () => {
  const [disputes, setDisputes] = useState([]);
  const [filteredDisputes, setFilteredDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [resolutionType, setResolutionType] = useState('');
  const [resolutionText, setResolutionText] = useState('');
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    fetchDisputes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [disputes, searchTerm, filter]);

  const fetchDisputes = async () => {
    setLoading(true);

    try {
      const response = await api.get('/admin/disputes');
      setDisputes(response.data.data || []);
      if (!selectedDispute) {
        setSelectedDispute(response.data.data?.[0] || null);
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
          d.projectName.toLowerCase().includes(term) ||
          `${d.id}`.includes(term) ||
          d.customerName.toLowerCase().includes(term) ||
          d.contractorName.toLowerCase().includes(term)
      );
    }

    setFilteredDisputes(result);

    if (result.length && !result.some((d) => selectedDispute?.id === d.id)) {
      setSelectedDispute(result[0]);
    }
  };

  const handleResolveClick = (dispute) => {
    setSelectedDispute(dispute);
    setResolutionType('');
    setResolutionText('');
    setShowModal(true);
  };

  const handleResolveDispute = async () => {
    if (!resolutionText.trim()) {
      toast.error('Vui lòng nhập quyết định');
      return;
    }
    if (!resolutionType) {
      toast.error('Vui lòng chọn loại quyết định');
      return;
    }
    if (!selectedDispute) return;

    try {
      await api.post(`/admin/disputes/${selectedDispute.id}/resolve`, {
        resolution: resolutionText,
        resolutionType,
        refundAmount: selectedDispute.amount,
      });
      toast.success('Tranh chấp đã được giải quyết');
      setShowModal(false);
      setResolutionText('');
      setResolutionType('');
      fetchDisputes();
    } catch (error) {
      console.error('Error resolving dispute:', error);
      toast.error('Lỗi khi giải quyết tranh chấp');
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedDispute) {
      toast.error('Vui lòng nhập nội dung tin nhắn');
      return;
    }

    try {
      const response = await api.post(`/admin/disputes/${selectedDispute.id}/messages`, {
        content: messageText.trim(),
      });
      setSelectedDispute(response.data.data);
      setDisputes((prev) => prev.map((d) => (d.id === selectedDispute.id ? response.data.data : d)));
      setMessageText('');
      toast.success('Tin nhắn được gửi');
    } catch (error) {
      console.error('Error sending dispute message:', error);
      toast.error('Không thể gửi tin nhắn');
    }
  };

  const getStatusLabel = (status) => {
    if (status === 'PENDING') return 'Chờ giải quyết';
    if (status === 'RESOLVED') return 'Đã giải quyết';
    return 'Khác';
  };

  const formatCurrency = (amount) => {
    if (amount == null) return '0đ';
    return `${amount.toLocaleString('vi-VN')}đ`;
  };

  const statusClasses = (status) => {
    if (status === 'PENDING') return 'bg-red-100 text-red-700';
    if (status === 'RESOLVED') return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
  };

  const summary = {
    total: disputes.length,
    pending: disputes.filter((d) => d.status === 'PENDING').length,
    resolved: disputes.filter((d) => d.status === 'RESOLVED').length,
    amount: disputes.reduce((sum, d) => sum + (d.amount || 0), 0),
  };

  if (loading) {
    return (
      <Layout title="Trung tâm tranh chấp">
        <div className="text-center py-12">Đang tải...</div>
      </Layout>
    );
  }

  return (
    <Layout title="Trung tâm tranh chấp">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Tổng số tranh chấp</p>
            <p className="mt-4 text-3xl font-semibold text-gray-900">{summary.total}</p>
            <p className="mt-2 text-sm text-gray-500">Tất cả tranh chấp đang chờ xử lý và đã giải quyết.</p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Chờ giải quyết</p>
            <p className="mt-4 text-3xl font-semibold text-red-600">{summary.pending}</p>
            <p className="mt-2 text-sm text-gray-500">Các tranh chấp vẫn cần phản hồi từ quản trị viên.</p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Tổng giá trị</p>
            <p className="mt-4 text-3xl font-semibold text-gray-900">{formatCurrency(summary.amount)}</p>
            <p className="mt-2 text-sm text-gray-500">Tổng số tiền tranh chấp của tất cả vụ.</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Danh sách tranh chấp</h3>
                <p className="text-sm text-gray-500">Chọn một tranh chấp để xem nội dung và xử lý.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm..."
                    className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex items-center rounded-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
                  <Filter className="mr-2" size={16} />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="rounded-full bg-transparent text-sm text-gray-900 outline-none"
                  >
                    {FILTER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {filteredDisputes.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
                  Không tìm thấy tranh chấp phù hợp.
                </div>
              ) : (
                filteredDisputes.map((dispute) => (
                  <button
                    key={dispute.id}
                    type="button"
                    onClick={() => setSelectedDispute(dispute)}
                    className={`w-full rounded-3xl border p-4 text-left transition ${
                      selectedDispute?.id === dispute.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{dispute.projectName}</p>
                        <p className="mt-1 text-xs text-gray-500">#{dispute.id} • {dispute.customerName} • {dispute.contractorName}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(dispute.status)}`}>
                        {getStatusLabel(dispute.status)}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={16} />
                        <span>{dispute.reason}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>{new Date(dispute.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            {!selectedDispute ? (
              <div className="text-center text-gray-500">Chưa có tranh chấp nào được chọn.</div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Tranh chấp #{selectedDispute.id}</p>
                    <h3 className="mt-2 text-2xl font-semibold text-gray-900">{selectedDispute.projectName}</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                        <User size={16} /> {selectedDispute.customerName}
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                        <User size={16} /> {selectedDispute.contractorName}
                      </span>
                    </div>
                  </div>
                  <span className={`rounded-full px-4 py-2 text-sm font-semibold ${statusClasses(selectedDispute.status)}`}>
                    {getStatusLabel(selectedDispute.status)}
                  </span>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Số tiền tranh chấp</p>
                    <p className="mt-2 text-xl font-semibold text-gray-900">{formatCurrency(selectedDispute.amount)}</p>
                  </div>
                  <div className="rounded-3xl bg-gray-50 p-4">
                    <p className="text-sm text-gray-500">Ngày báo cáo</p>
                    <p className="mt-2 text-xl font-semibold text-gray-900">{new Date(selectedDispute.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-3xl bg-white p-4 shadow-sm border border-gray-200">
                    <p className="text-sm font-semibold text-gray-700">Lý do tranh chấp</p>
                    <p className="mt-3 text-sm text-gray-600 whitespace-pre-line">{selectedDispute.reason}</p>
                  </div>

                  {selectedDispute.resolution && (
                    <div className="rounded-3xl bg-green-50 p-4 border border-green-200">
                      <div className="flex items-center gap-2 text-green-700 font-semibold">
                        <CheckCircle2 size={18} /> Giải pháp đã chọn
                      </div>
                      <p className="mt-3 text-sm text-green-900">
                        {selectedDispute.resolutionType} • {selectedDispute.resolution}
                      </p>
                      {selectedDispute.refundAmount != null && (
                        <p className="mt-2 text-sm text-green-900">Hoàn tiền: {formatCurrency(selectedDispute.refundAmount)}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Cuộc trò chuyện</p>
                      <p className="text-sm text-gray-500">Xem lịch sử tin nhắn tranh chấp.</p>
                    </div>
                    {selectedDispute.status === 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => handleResolveClick(selectedDispute)}
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark"
                      >
                        <ArrowRight size={16} /> Giải quyết tranh chấp
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 space-y-3 overflow-y-auto rounded-3xl border border-gray-200 bg-gray-50 p-4">
                    {selectedDispute.messages && selectedDispute.messages.length > 0 ? (
                      selectedDispute.messages.map((message) => (
                        <div key={message.id} className="rounded-3xl bg-white p-4 shadow-sm">
                          <p className="text-xs text-gray-500">{message.author}</p>
                          <p className="mt-2 text-sm text-gray-700">{message.content}</p>
                          <p className="mt-3 text-xs text-gray-400">{new Date(message.createdAt).toLocaleString('vi-VN')}</p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
                        Chưa có tin nhắn cho tranh chấp này.
                      </div>
                    )}
                  </div>

                  <div className="rounded-3xl border border-gray-200 bg-white p-4">
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      rows={3}
                      placeholder="Nhập tin nhắn mới..."
                      className="w-full resize-none rounded-3xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={handleSendMessage}
                        className="inline-flex items-center gap-2 rounded-full bg-[#1a4f3a] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#163b2d]"
                      >
                        <MessageSquare size={16} /> Gửi tin nhắn
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {showModal && selectedDispute && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">Giải quyết tranh chấp</p>
                  <h2 className="text-2xl font-semibold text-gray-900">{selectedDispute.projectName}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 transition hover:text-gray-900"
                >
                  Đóng
                </button>
              </div>

              <div className="mt-6 space-y-5">
                <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">Số tiền tranh chấp</p>
                  <p className="mt-2 text-xl font-semibold text-gray-900">{formatCurrency(selectedDispute.amount)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Loại quyết định</label>
                  <select
                    value={resolutionType}
                    onChange={(e) => setResolutionType(e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Chọn loại quyết định</option>
                    {RESOLUTION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Mô tả quyết định</label>
                  <textarea
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    rows={4}
                    placeholder="Mô tả lý do giải quyết..."
                    className="mt-2 w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex flex-wrap gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleResolveDispute}
                    className="rounded-full bg-[#1a4f3a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#163b2d]"
                  >
                    Xác nhận giải quyết
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDisputesPage;
