import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  Search,
  Filter,
  ArrowRight,
  CreditCard,
  XCircle,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'pending', label: 'Chờ phê duyệt' },
  { value: 'success', label: 'Đã giải ngân' },
  { value: 'failed', label: 'Đã từ chối' },
];

const AdminWithdrawalsPage = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false); // MỚI: Quản lý ẩn hiện modal Approve
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

 useEffect(() => {
  // Lần đầu vào trang thì load dữ liệu luôn
  fetchWithdrawRequests();

  // Đăng ký lắng nghe sự kiện từ file api.js phát ra
  const handleRealtimeRefresh = () => {
    fetchWithdrawRequests(); // Tự động gọi lại hàm lấy dữ liệu mới
  };

  window.addEventListener('WALLET_DATA_CHANGED', handleRealtimeRefresh);
  
  // Hủy lắng nghe khi chuyển trang để tránh rò rỉ bộ nhớ
  return () => window.removeEventListener('WALLET_DATA_CHANGED', handleRealtimeRefresh);
}, [filter, searchTerm]); // Chạy lại nếu bộ lọc thay đổi

  useEffect(() => {
    applyFilters();
  }, [requests, searchTerm, filter]);

  const fetchWithdrawRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get('/wallet/admin/withdraw/all');
      const data = response.data.data || [];
      setRequests(data);
      if (data.length > 0 && !selectedRequest) {
        setSelectedRequest(data[0]);
      }
    } catch (error) {
      console.error('Error fetching withdraws:', error);
      toast.error('Không thể tải danh sách yêu cầu rút tiền');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = requests || [];

    if (filter === 'pending') {
      result = result.filter((r) => r.status === 'PENDING');
    }
    if (filter === 'success') {
      result = result.filter((r) => r.status === 'SUCCESS');
    }
    if (filter === 'failed') {
      result = result.filter((r) => r.status === 'FAILED');
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.gatewayOrderId.toLowerCase().includes(term) ||
          `${r.id}`.includes(term) ||
          (r.description && r.description.toLowerCase().includes(term)) ||
          (r.wallet?.user?.email && r.wallet.user.email.toLowerCase().includes(term))
      );
    }

    setFilteredRequests(result);
    
    if (result.length && !result.some((r) => selectedRequest?.id === r.id)) {
      setSelectedRequest(result[0]);
    }
  };

  // ĐÃ SỬA: Hàm xử lý gửi lệnh duyệt tiền lên Server sau khi Admin bấm xác nhận trên Modal
  const handleApproveWithdraw = async () => {
    if (!selectedRequest) return;
    
    setIsProcessing(true);
    try {
      await api.post(`/wallet/admin/withdraw/approve/${selectedRequest.id}`);
      toast.success('Đã phê duyệt dứt điểm! Khấu trừ tiền quỹ đóng băng thành công.');
      setShowApproveModal(false);
      fetchWithdrawRequests();
    } catch (error) {
      console.error('Approve error:', error);
      toast.error(error.response?.data?.error || 'Lỗi hệ thống phê duyệt');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectWithdraw = async () => {
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối mẫu đơn');
      return;
    }
    
    setIsProcessing(true);
    try {
      await api.post(`/wallet/admin/withdraw/reject/${selectedRequest.id}`, {
        reason: rejectReason.trim()
      });
      toast.success('Đã từ chối lệnh rút! Số dư đóng băng đã được hoàn trả về ví khả dụng.');
      setShowRejectModal(false);
      setRejectReason('');
      fetchWithdrawRequests();
    } catch (error) {
      console.error('Reject error:', error);
      toast.error(error.response?.data?.error || 'Lỗi hệ thống từ chối');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusLabel = (status) => {
    if (status === 'PENDING') return 'Chờ phê duyệt';
    if (status === 'SUCCESS') return 'Đã giải ngân';
    if (status === 'FAILED') return 'Đã từ chối';
    return status;
  };

  const statusClasses = (status) => {
    if (status === 'PENDING') return 'bg-amber-100 text-amber-700';
    if (status === 'SUCCESS') return 'bg-green-100 text-green-700';
    return 'bg-red-100 text-red-700';
  };

  const summary = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'PENDING').length,
    success: requests.filter((r) => r.status === 'SUCCESS').length,
    totalAmount: requests.reduce((sum, r) => sum + (r.amount || 0), 0),
  };

  if (loading) {
    return (
      <Layout title="Quản lý phê duyệt giải ngân">
        <div className="text-center py-12 flex flex-col items-center justify-center gap-2">
          <RefreshCw className="animate-spin text-gray-400" />
          <p className="text-sm text-gray-500">Đang tải danh sách dòng tiền yêu cầu...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Quản lý phê duyệt giải ngân">
      <div className="space-y-6">
        {/* Thẻ Thống Kê Tổng Quan */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Tổng số yêu cầu rút</p>
            <p className="mt-4 text-3xl font-semibold text-gray-900">{summary.total} đơn</p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Đang chờ xử lý</p>
            <p className="mt-4 text-3xl font-semibold text-amber-600">{summary.pending} đơn</p>
          </div>
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Tổng tiền yêu cầu dòng</p>
            <p className="mt-4 text-3xl font-semibold text-blue-600">{summary.totalAmount.toLocaleString('vi-VN')}đ</p>
          </div>
        </div>

        {/* Khung tìm kiếm và bộ lọc */}
        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Danh sách lệnh rút</h3>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-48">
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm mã đơn, Email..."
                    className="w-full rounded-full border border-gray-200 bg-gray-50 py-1.5 pl-9 pr-4 text-xs outline-none"
                  />
                </div>
                <div className="flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-600">
                  <Filter className="mr-1" size={14} />
                  <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-transparent outline-none text-xs">
                    {FILTER_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Render Danh Sách Đơn Ở Cột Trái */}
            <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar">
              {filteredRequests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-xs text-gray-400">
                  Không tìm thấy yêu cầu rút tiền nào phù hợp.
                </div>
              ) : (
                filteredRequests.map((req) => (
                  <button
                    key={req.id}
                    type="button"
                    onClick={() => setSelectedRequest(req)}
                    className={`w-full rounded-2xl border p-4 text-left transition flex flex-col gap-2 ${
                      selectedRequest?.id === req.id ? 'border-blue-600 bg-blue-50/40 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-gray-900">{req.gatewayOrderId}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 font-mono">{req.wallet?.user?.email || 'N/A'}</p>
                      </div>
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold ${statusClasses(req.status)}`}>
                        {getStatusLabel(req.status)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-50 mt-1">
                      <span className="font-bold text-gray-700">{req.amount.toLocaleString('vi-VN')}đ</span>
                      <span className="text-[10px] text-gray-400 font-mono">{new Date(req.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Cột Phải: Xem Chi Tiết Và Bấm Duyệt Lệnh */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm min-h-[450px]">
            {!selectedRequest ? (
              <div className="text-center text-gray-400 py-12 text-sm">Chưa có yêu cầu rút tiền nào được chọn.</div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Chi tiết lệnh rút tiền</p>
                    <h3 className="mt-1 text-xl font-bold text-gray-900 font-mono">{selectedRequest.gatewayOrderId}</h3>
                    <p className="text-xs text-gray-500 mt-1">Người yêu cầu: <span className="font-semibold text-gray-700">{selectedRequest.wallet?.user?.email}</span></p>
                  </div>
                  <span className={`rounded-md px-3 py-1 text-xs font-extrabold ${statusClasses(selectedRequest.status)}`}>
                    {getStatusLabel(selectedRequest.status)}
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-xs font-medium text-gray-400 uppercase">Số tiền yêu cầu rút</p>
                    <p className="mt-1.5 text-2xl font-black text-red-600">{selectedRequest.amount.toLocaleString('vi-VN')}đ</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-xs font-medium text-gray-400 uppercase">Thời gian tạo lệnh</p>
                    <p className="mt-1.5 text-base font-bold text-gray-800">{new Date(selectedRequest.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                </div>

                {/* Khung Trích Xuất Thông Tin Thẻ Ngân Hàng */}
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
                  <p className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wide">
                    <CreditCard size={15} className="text-blue-500" /> Thông tin đích đến giải ngân
                  </p>
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 text-xs space-y-2 font-medium text-gray-700">
                    <p className="text-gray-600 whitespace-pre-line leading-relaxed">{selectedRequest.description}</p>
                  </div>
                </div>

                {/* Các nút bấm hành động giải quyết tiền tệ */}
                {selectedRequest.status === 'PENDING' ? (
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100 justify-end">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => {
                        setRejectReason('');
                        setShowRejectModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-5 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100"
                    >
                      <XCircle size={15} /> TỪ CHỐI & HOÀN VÍ
                    </button>
                    {/* ĐÃ SỬA: Thay thế việc gọi hàm trực tiếp bằng việc mở hộp thoại Modal xác nhận phê duyệt */}
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => setShowApproveModal(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:from-green-700 hover:to-green-800"
                    >
                      <CheckCircle2 size={15} /> XÁC NHẬN ĐÃ CHUYỂN KHOẢN
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-gray-50/80 p-4 text-xs text-gray-500 italic text-center border border-gray-100">
                    Lệnh rút này đã được xử lý xong vào lúc {new Date(selectedRequest.createdAt).toLocaleDateString('vi-VN')}. Không thể thay đổi lịch sử dòng tiền.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ĐÃ SỬA: MỚI BỔ SUNG - Hộp thoại Modal nhập xác nhận Phê duyệt giải ngân giống như Reject */}
        {showApproveModal && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl border border-gray-100 scale-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900">Xác nhận phê duyệt giải ngân</h3>
                <button type="button" onClick={() => setShowApproveModal(false)} className="text-gray-400 hover:text-gray-600 text-xs">Đóng</button>
              </div>

              <div className="mt-4 space-y-4">
                <div className="rounded-xl bg-green-50 border border-green-200 p-3.5 text-xs text-green-800 space-y-2">
                  <p className="font-bold">⚠️ Vui lòng xác nhận thông tin chuyển khoản ủy nhiệm chi:</p>
                  <p>• Số tiền giải ngân: <span className="font-extrabold text-sm">{selectedRequest.amount.toLocaleString('vi-VN')}đ</span></p>
                  <p>• Tài khoản thụ hưởng:</p>
                  <div className="bg-white/60 p-2 rounded-lg font-mono text-[11px] text-gray-700 mt-1 border border-green-100">
                    {selectedRequest.description}
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">
                  Bằng việc bấm nút <span className="font-bold text-green-700">"Xác nhận đã chuyển"</span>, bạn cam kết đã thực hiện lệnh chuyển tiền ngân hàng thành công. Hệ thống sẽ tiến hành xóa khoản tiền đóng băng này ra khỏi số dư tổng của tài khoản khách hàng vĩnh viễn.
                </p>

                <div className="flex gap-2 justify-end pt-3 border-t border-gray-50">
                  <button
                    type="button"
                    onClick={() => setShowApproveModal(false)}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
                  >
                    HỦY BỎ
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleApproveWithdraw}
                    className="rounded-xl bg-green-600 px-5 py-2 text-xs font-bold text-white hover:bg-green-700 transition-all flex items-center gap-1.5"
                  >
                    {isProcessing ? <RefreshCw size={12} className="animate-spin" /> : null}
                    XÁC NHẬN ĐÃ CHUYỂN
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal nhập lý do từ chối rút tiền */}
        {showRejectModal && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900">Từ chối lệnh yêu cầu giải ngân</h3>
                <button type="button" onClick={() => setShowRejectModal(false)} className="text-gray-400 hover:text-gray-600 text-xs">Đóng</button>
              </div>

              <div className="mt-4 space-y-4">
                <div className="rounded-xl bg-red-50 p-3 text-xs text-red-800">
                  Hành động này sẽ giải phóng <span className="font-bold">{selectedRequest.amount.toLocaleString('vi-VN')}đ</span> từ quỹ đóng băng và cộng trả lại ngay lập tức vào số dư ví khả dụng của tài khoản khách hàng.
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase">Lý do từ chối cụ thể</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                    placeholder="Ví dụ: Sai số tài khoản, sai tên chủ thẻ thụ hưởng..."
                    className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-900 outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2 border-t border-gray-50">
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(false)}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
                  >
                    HỦY BỎ
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleRejectWithdraw}
                    className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition-all"
                  >
                    XÁC NHẬN HOÀN TIỀN
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

export default AdminWithdrawalsPage;