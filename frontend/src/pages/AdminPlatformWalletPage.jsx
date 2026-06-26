import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import {
  Wallet,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  HelpCircle,
  FileText
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const AdminPlatformWalletPage = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDescription, setWithdrawDescription] = useState('');
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);

  useEffect(() => {
    fetchPlatformWalletData();
  }, []);

  const fetchPlatformWalletData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/wallet/admin/platform-wallet');
      if (response.data.success) {
        setWallet(response.data.wallet);
        setTransactions(response.data.transactions || []);
      } else {
        toast.error('Không thể tải dữ liệu ví nền tảng');
      }
    } catch (error) {
      console.error('Error fetching platform wallet:', error);
      toast.error('Lỗi kết nối hệ thống ví');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    
    if (!amount || amount <= 0) {
      toast.error('Vui lòng nhập số tiền rút hợp lệ');
      return;
    }
    if (amount > (wallet?.balance || 0)) {
      toast.error('Số dư ví nền tảng không đủ để thực hiện giao dịch này');
      return;
    }

    setSubmittingWithdraw(true);
    try {
      const response = await api.post('/wallet/admin/platform-wallet/withdraw', {
        amount,
        description: withdrawDescription.trim(),
      });
      
      if (response.data.success) {
        toast.success(response.data.message || 'Rút tiền lợi tức thành công!');
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        setWithdrawDescription('');
        // Reload data
        fetchPlatformWalletData();
      } else {
        toast.error(response.data.message || 'Rút tiền thất bại');
      }
    } catch (error) {
      console.error('Error executing platform withdraw:', error);
      const errMsg = error.response?.data?.message || 'Lỗi hệ thống khi rút tiền';
      toast.error(errMsg);
    } finally {
      setSubmittingWithdraw(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount == null) return '0đ';
    return `${amount.toLocaleString('vi-VN')}đ`;
  };

  // Tính toán nhanh số liệu thống kê từ danh sách transactions
  const stats = {
    totalCommission: transactions
      .filter((t) => t.type === 'COMMISSION')
      .reduce((sum, t) => sum + (t.amount || 0), 0),
    totalWithdrawn: transactions
      .filter((t) => t.type === 'WITHDRAW')
      .reduce((sum, t) => sum + (t.amount || 0), 0),
    commissionCount: transactions.filter((t) => t.type === 'COMMISSION').length,
    withdrawCount: transactions.filter((t) => t.type === 'WITHDRAW').length,
  };

  return (
    <Layout title="Ví Nền Tảng & Quản Lý Lợi Tức">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        
        {/* HEADER SUMMARY CARD */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#11382b] to-[#1a4f3a] p-8 text-white shadow-lg border border-emerald-800/30">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3">
              <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                <Wallet className="text-emerald-400" size={32} />
                Quản Trị Ví Lợi Tức Hệ Thống
              </h2>
              <p className="text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
                Nơi quản lý tập trung toàn bộ dòng tiền thu nhập của sàn ConstructX. Tiền tích lũy tự động từ 5% phí hoa hồng của mỗi dự án hoàn thành, cho phép đối soát thời gian thực và rút lợi tức minh bạch.
              </p>
            </div>

            {/* Quick Actions / Button */}
            <div className="shrink-0 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowWithdrawModal(true)}
                disabled={loading || (wallet?.balance || 0) <= 0}
                className="w-full sm:w-auto px-6 py-3.5 bg-yellow-400 hover:bg-yellow-500 disabled:bg-slate-600 disabled:text-slate-400 text-[#11382b] rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-md transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Rút tiền lợi tức
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-6 border border-slate-100 h-36 animate-pulse space-y-3">
                <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                <div className="h-8 bg-slate-100 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* KPI STATS ROW */}
            <div className="grid gap-6 md:grid-cols-3">
              
              {/* CURRENT BALANCE */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs relative overflow-hidden group hover:border-[#1a4f3a]/30 transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-300">
                  <Wallet size={80} className="text-[#1a4f3a]" />
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#1a4f3a] flex items-center justify-center">
                    <DollarSign size={16} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider">Số dư lợi tức khả dụng</span>
                </div>
                <div className="mt-4 space-y-1">
                  <p className="text-3xl font-black text-slate-800 tracking-tight">
                    {formatCurrency(wallet?.balance)}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    <TrendingUp size={12} /> Số dư sẵn sàng rút về tài khoản
                  </p>
                </div>
              </div>

              {/* TOTAL COMMISSIONS */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs relative overflow-hidden group hover:border-[#1a4f3a]/30 transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-300">
                  <ArrowUpRight size={80} className="text-indigo-600" />
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <ArrowUpRight size={16} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider">Tổng hoa hồng thu tích lũy</span>
                </div>
                <div className="mt-4 space-y-1">
                  <p className="text-3xl font-black text-slate-800 tracking-tight">
                    {formatCurrency(stats.totalCommission)}
                  </p>
                  <p className="text-[11px] text-slate-400 font-semibold">
                    Được đóng góp từ <strong className="text-slate-700">{stats.commissionCount}</strong> đợt hoàn công hợp đồng
                  </p>
                </div>
              </div>

              {/* TOTAL WITHDRAWALS */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-xs relative overflow-hidden group hover:border-[#1a4f3a]/30 transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-300">
                  <ArrowDownRight size={80} className="text-rose-600" />
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <ArrowDownRight size={16} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-wider">Tổng lợi tức đã rút</span>
                </div>
                <div className="mt-4 space-y-1">
                  <p className="text-3xl font-black text-slate-800 tracking-tight">
                    {formatCurrency(stats.totalWithdrawn)}
                  </p>
                  <p className="text-[11px] text-slate-400 font-semibold">
                    Được thực thi qua <strong className="text-slate-700">{stats.withdrawCount}</strong> lệnh rút của Ban Quản Trị
                  </p>
                </div>
              </div>

            </div>

            {/* TRANSACTION LOGS TABLE */}
            <div className="bg-white rounded-3xl border border-slate-200/70 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    <Activity className="text-slate-500" size={20} />
                    Lịch Sử Biến Động Số Dư
                  </h3>
                  <p className="text-xs text-slate-400">
                    Chi tiết các giao dịch hoa hồng nền tảng và các lệnh rút lợi tức của Admin.
                  </p>
                </div>
                <span className="self-start sm:self-center text-xs font-black text-[#1a4f3a] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  {transactions.length} giao dịch
                </span>
              </div>

              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 bg-slate-50/30 rounded-2xl border border-dashed border-slate-200 mt-6">
                  <Wallet size={40} className="text-slate-300 mb-2" />
                  <p className="text-sm font-bold">Chưa phát sinh giao dịch nào</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Khi các hợp đồng thi công trên ConstructX hoàn thành, phí hoa hồng 5% tự động tích lũy vào đây.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto mt-6 -mx-6 sm:mx-0">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-3.5 px-6">Mã giao dịch</th>
                        <th className="py-3.5 px-4">Loại biến động</th>
                        <th className="py-3.5 px-4 text-right">Số tiền (VND)</th>
                        <th className="py-3.5 px-4">Tham chiếu</th>
                        <th className="py-3.5 px-4">Mô tả chi tiết</th>
                        <th className="py-3.5 px-6">Thời gian giao dịch</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions.map((tx) => {
                        const isCommission = tx.type === 'COMMISSION';
                        const isWithdraw = tx.type === 'WITHDRAW';
                        
                        return (
                          <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 px-6 font-bold text-slate-700">
                              #{tx.id}
                            </td>
                            <td className="py-4 px-4">
                              {isCommission ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700 border border-emerald-100">
                                  <ArrowUpRight size={10} /> Hoa hồng 5%
                                </span>
                              ) : isWithdraw ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-black text-rose-700 border border-rose-100">
                                  <ArrowDownRight size={10} /> Admin rút tiền
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-black text-slate-700 border border-slate-100">
                                  Khác
                                </span>
                              )}
                            </td>
                            <td className={`py-4 px-4 text-right font-black text-sm ${
                              isCommission ? 'text-emerald-600' : 'text-rose-600'
                            }`}>
                              {isCommission ? '+' : '-'}{formatCurrency(tx.amount)}
                            </td>
                            <td className="py-4 px-4">
                              {tx.referenceId ? (
                                <span className="inline-flex items-center gap-1 font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                                  <FileText size={10} /> {tx.referenceId}
                                </span>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-slate-600 max-w-xs truncate" title={tx.description}>
                              {tx.description}
                            </td>
                            <td className="py-4 px-6 text-slate-400 font-semibold">
                              {new Date(tx.createdAt).toLocaleString('vi-VN')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* PLATFORM WITHDRAWAL MODAL */}
        {showWithdrawModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300 animate-fade-in">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl border border-slate-200/50 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 shrink-0">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded uppercase tracking-wider border border-yellow-100">
                    Rút tiền lợi tức sàn
                  </span>
                  <h2 className="text-lg font-black text-slate-800">
                    Yêu Cầu Rút Tiền Lợi Tức
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-all"
                >
                  Đóng
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleWithdraw} className="flex-1 overflow-y-auto py-5 space-y-4 pr-1 -mr-1">
                
                {/* Current Balance Card */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Lợi tức hiện tại khả dụng</span>
                  <span className="text-base font-black text-slate-800">{formatCurrency(wallet?.balance)}</span>
                </div>

                {/* Amount input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wide">
                    Số tiền cần rút (VND)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={wallet?.balance || 0}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Ví dụ: 10000000"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-800 font-black outline-none focus:border-[#1a4f3a] focus:ring-2 focus:ring-[#1a4f3a]/15 transition-all"
                  />
                  {withdrawAmount && (
                    <p className="text-[10px] text-slate-500 font-semibold px-1">
                      Thành chữ: <strong className="text-[#1a4f3a]">{formatCurrency(Number(withdrawAmount))}</strong>
                    </p>
                  )}
                </div>

                {/* Description decree */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wide">
                    Ghi chú / Nội dung rút tiền
                  </label>
                  <textarea
                    value={withdrawDescription}
                    onChange={(e) => setWithdrawDescription(e.target.value)}
                    rows={3}
                    placeholder="Ghi chú mục đích rút tiền lợi tức (ví dụ: Chuyển khoản lợi tức tháng 6 về tài khoản công ty)..."
                    className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-800 leading-relaxed outline-none focus:border-[#1a4f3a] focus:ring-2 focus:ring-[#1a4f3a]/15 transition-all"
                  />
                </div>

                {/* Warning message */}
                <div className="rounded-xl bg-amber-50 border border-amber-150 p-3.5 flex items-start gap-2.5 text-[11px] text-amber-800 leading-relaxed">
                  <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={14} />
                  <div>
                    <strong>Lưu ý quan trọng:</strong> Hành động này sẽ trừ trực tiếp số dư khả dụng trên hệ thống ví lợi tức ConstructX. Vui lòng đảm bảo các giao dịch ngân hàng thực tế đã được lập lệnh tương ứng.
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowWithdrawModal(false)}
                    className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={submittingWithdraw || !withdrawAmount}
                    className="rounded-full bg-[#1a4f3a] hover:bg-[#163b2d] disabled:bg-slate-400 px-6 py-2.5 text-xs font-bold text-white transition hover:shadow-md"
                  >
                    {submittingWithdraw ? 'Đang thực thi rút...' : 'Xác nhận rút lợi tức'}
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default AdminPlatformWalletPage;
