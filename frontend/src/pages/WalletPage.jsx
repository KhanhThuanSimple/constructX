import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { 
  Wallet, 
  ArrowUpRight, 
  History, 
  CreditCard,
  AlertCircle,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';

const WalletPage = () => {
  const { user } = useAuthStore();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDepositing, setIsDepositing] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWalletData();
    checkPaymentResult();
  }, [location]);

  const fetchWalletData = async () => {
    try {
      const [walletRes, transRes] = await Promise.all([
        api.get('/wallet'),
        api.get('/wallet/transactions')
      ]);
      setWallet(walletRes.data.data);
      setTransactions(transRes.data.data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentResult = async () => {
    const queryParams = new URLSearchParams(location.search);
    const responseCode = queryParams.get('vnp_ResponseCode');
    
    if (responseCode) {
      if (responseCode === '00') {
        const loadingToast = toast.loading('Đang xác thực giao dịch...');
        // Gọi backend để xác nhận callback
        try {
            const callbackUrl = `/wallet/deposit/vnpay-callback${location.search}`;
            const response = await api.get(callbackUrl);
            
            toast.success(response.data.message || 'Nạp tiền thành công!', { id: loadingToast });
            // Chờ một chút rồi load lại số dư
            setTimeout(() => {
              fetchWalletData();
            }, 500);
        } catch (err) {
            console.error('Callback error:', err);
            const errorMsg = err.response?.data?.error || 'Lỗi xác thực giao dịch';
            toast.error(errorMsg, { id: loadingToast });
            fetchWalletData();
        }
      } else {
        toast.error('Giao dịch không thành công hoặc đã bị hủy.');
      }
      // Xóa các tham số trên URL để tránh bị gọi lại khi F5
      navigate('/wallet', { replace: true });
    }
  };

  const handleDeposit = async () => {
    if (!amount || amount < 10000) {
      toast.error('Số tiền tối thiểu là 10.000đ');
      return;
    }

    setIsDepositing(true);
    try {
      const response = await api.post('/wallet/deposit/vnpay', { amount: parseInt(amount) });
      
      if (response.data.data && response.data.data.paymentUrl) {
        // Lưu số tiền vừa nạp để hiển thị sau khi quay lại
        sessionStorage.setItem('lastDepositAmount', amount);
        window.location.href = response.data.data.paymentUrl;
      } else {
        toast.error('Không nhận được liên kết thanh toán từ VNPay');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Lỗi khi khởi tạo giao dịch VNPay';
      toast.error(errorMsg);
      console.error('Deposit error:', error);
    } finally {
      setIsDepositing(false);
    }
  };

  const formatCurrency = (val) => {
    return (val || 0).toLocaleString('vi-VN') + 'đ';
  };

  return (
    <Layout title={user?.role === 'CONTRACTOR' ? "Ví & Thu nhập" : "Ví & Thanh toán"}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Wallet Info & Deposit */}
        <div className="lg:col-span-1 space-y-6">
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-[#1a4f3a] to-[#2d7a5a] p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-10">
              <Wallet size={160} />
            </div>
            <p className="text-xs uppercase tracking-widest font-medium opacity-80 mb-2">Số dư khả dụng</p>
            <h2 className="text-4xl font-bold font-display mb-8">{formatCurrency(wallet?.balance)}</h2>
            
            <div className="flex gap-4 pt-4 border-t border-white/10">
              <div>
                <p className="text-[10px] opacity-60 uppercase font-bold">Đang tạm giữ</p>
                <p className="text-sm font-bold">{formatCurrency(wallet?.lockedAmount)}</p>
              </div>
              <div className="ml-auto flex items-center gap-1 text-[10px] bg-white/20 px-2 py-1 rounded-full">
                <CheckCircle2 size={12} /> Đã xác thực
              </div>
            </div>
          </div>

          {/* Deposit Form */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold font-display mb-4 flex items-center gap-2">
              <ArrowUpRight className="text-primary" size={20} /> Nạp tiền vào ví
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Số tiền (VNĐ)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Nhập số tiền..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold focus:border-primary transition-all"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {[50000, 100000, 500000].map(val => (
                  <button 
                    key={val}
                    onClick={() => setAmount(val.toString())}
                    className="py-2 text-xs font-bold bg-gray-50 hover:bg-primary-bg hover:text-primary rounded-lg transition-colors border border-gray-100"
                  >
                    +{val/1000}k
                  </button>
                ))}
              </div>

              <div className="p-3 bg-accent-bg rounded-xl flex gap-3">
                <AlertCircle size={18} className="text-accent shrink-0" />
                <p className="text-[10px] text-accent font-medium leading-relaxed">
                  {user?.role === 'CONTRACTOR' 
                    ? 'Tiền thu nhập sẽ được cộng vào ví sau khi chủ dự án phê duyệt hoàn thành giai đoạn hoặc toàn bộ dự án.'
                    : 'Tiền nạp sẽ được tạm giữ bởi ConstructX và chỉ thanh toán cho nhà thầu khi bạn phê duyệt giai đoạn dự án.'}
                </p>
              </div>

              <button 
                onClick={handleDeposit}
                disabled={isDepositing}
                className="w-full btn btn-primary py-4 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                {isDepositing ? 'Đang xử lý...' : (
                  <>
                    <img src="https://vnpay.vn/s/img/logo.svg" alt="VNPay" className="h-5 mr-2" />
                    Nạp qua VNPay
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Transaction History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold font-display flex items-center gap-2">
                <History className="text-gray-400" size={20} /> Lịch sử giao dịch
              </h3>
              <button className="text-xs text-primary font-bold flex items-center gap-1">
                Tất cả <ChevronRight size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-2">
              {loading ? (
                <div className="p-20 text-center text-gray-400">Đang tải lịch sử...</div>
              ) : !transactions || transactions.length === 0 ? (
                <div className="p-20 text-center text-gray-400">Chưa có giao dịch nào phát sinh.</div>
              ) : (
                <table className="w-full text-left">
                  <thead className="text-[10px] uppercase text-gray-400 font-bold">
                    <tr>
                      <th className="p-4">Ngày</th>
                      <th className="p-4">Nội dung</th>
                      <th className="p-4">Số tiền</th>
                      <th className="p-4">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-xs text-gray-500">
                          {new Date(t.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="p-4">
                          <p className="text-sm font-bold text-gray-800">{t.description}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest">{t.type}</p>
                        </td>
                        <td className="p-4">
                          <span className={`text-sm font-bold ${t.type === 'DEPOSIT' || t.type === 'REFUND' ? 'text-green-600' : 'text-red-600'}`}>
                            {t.type === 'DEPOSIT' || t.type === 'REFUND' ? '+' : '-'}{formatCurrency(t.amount)}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`badge ${t.status === 'SUCCESS' ? 'badge-green' : t.status === 'PENDING' ? 'badge-amber' : 'badge-red'} text-[10px]`}>
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default WalletPage;
