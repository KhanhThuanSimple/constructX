import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { ArrowUpRight, ArrowDownRight, CreditCard, History, PlusCircle, RefreshCw, Banknote, Shield, Clock } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const WalletPage = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [savedCards, setSavedCards] = useState([]);
  const [amount, setAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState('deposit'); 
  const [bankAccount, setBankAccount] = useState({
    bankName: '',
    accountNumber: '',
    accountName: ''
  });
  
  const location = useLocation();
  const navigate = useNavigate();

  // Tính toán số dư khả dụng thực tế
  const availableBalance = useMemo(() => {
    if (!wallet) return 0;
    return (wallet.balance || 0) - (wallet.lockedAmount || 0);
  }, [wallet]);

  // ĐÃ SỬA: Tính toán động số tiền tối đa có thể rút thực tế (Luôn giữ lại ít nhất 50.000đ và không âm)
  const maxWithdrawable = useMemo(() => {
    const max = availableBalance - 50000;
    return max > 0 ? max : 0;
  }, [availableBalance]);

  // Tính tổng dòng tiền vào (Chỉ tính giao dịch SUCCESS)
  const totalReceivedAmount = useMemo(() => {
    return transactions
      .filter(trans => trans.status === 'SUCCESS' && (trans.type === 'DEPOSIT' || trans.type === 'TOKEN_PAY' || trans.type === 'RELEASE' || trans.type === 'REVENUE'))
      .reduce((sum, trans) => sum + (trans.amount || 0), 0);
  }, [transactions]);

  // Tính tổng dòng tiền ra (Bao gồm SUCCESS và PENDING để chống số dư âm)
  const totalWithdrawnAmount = useMemo(() => {
    return transactions
      .filter(trans => (trans.status === 'SUCCESS' || trans.status === 'PENDING') && (trans.type === 'WITHDRAW' || trans.type === 'LOCK'))
      .reduce((sum, trans) => sum + (trans.amount || 0), 0);
  }, [transactions]);

  const suggestedAmounts = [50000, 100000, 200000, 500000, 1000000];

useEffect(() => {
  loadWalletComponents();
  verifyDisplayStatus();

  // Đăng ký lắng nghe sự kiện làm mới
  const handleRealtimeRefresh = () => {
    loadWalletComponents();
  };

  window.addEventListener('WALLET_DATA_CHANGED', handleRealtimeRefresh);
  return () => window.removeEventListener('WALLET_DATA_CHANGED', handleRealtimeRefresh);
}, [location.search]);

  useEffect(() => {
    try {
      const savedBankAccount = localStorage.getItem('bankAccount');
      if (savedBankAccount) {
        const parsed = JSON.parse(savedBankAccount);
        if (parsed && typeof parsed === 'object') {
          setBankAccount({
            bankName: parsed.bankName || '',
            accountNumber: parsed.accountNumber || '',
            accountName: parsed.accountName || ''
          });
        }
      }
    } catch (e) {
      console.error("Lỗi parse dữ liệu ngân hàng:", e);
      localStorage.removeItem('bankAccount');
    }
  }, []);

  const loadWalletComponents = async () => {
    setIsLoadingData(true);
    try {
      const [walletRes, transRes, cardsRes] = await Promise.all([
        api.get('/wallet'),
        api.get('/wallet/transactions'),
        api.get('/wallet/saved-cards')
      ]);
      setWallet(walletRes.data.data);
      setTransactions(transRes.data.data || []);
      setSavedCards(cardsRes.data.data || []);
    } catch (err) {
      console.error("Lỗi đồng bộ dữ liệu ví:", err);
      toast.error("Không thể làm mới dữ liệu ví");
    } finally {
      setIsLoadingData(false);
    }
  };

  const pollTransactionStatus = async (orderId, attempt = 1) => {
    const MAX_ATTEMPTS = 4;  
    const DELAY_TIME = 1000;   
    try {
      const response = await api.get(`/wallet/transactions/status/${orderId}`);
      const transStatus = response.data.status;
      if (transStatus === 'SUCCESS') {
        toast.success('Cộng tiền Sandbox vào tài khoản thành công!', { id: 'vnpay-sync' });
        await loadWalletComponents(); 
        return true;
      } 
      if (transStatus === 'PENDING') {
        toast.success('Hệ thống ghi nhận: Giao dịch đang ở trạng thái chờ xử lý.', { id: 'vnpay-sync' });
        await loadWalletComponents();
        return true;
      }
      if (attempt < MAX_ATTEMPTS) {
        setTimeout(() => pollTransactionStatus(orderId, attempt + 1), DELAY_TIME);
      } else {
        toast.dismiss('vnpay-sync');
        await loadWalletComponents();
      }
    } catch (error) {
      console.error("Lỗi pooling trạng thái:", error);
      if (attempt < MAX_ATTEMPTS) {
        setTimeout(() => pollTransactionStatus(orderId, attempt + 1), DELAY_TIME);
      } else {
        toast.dismiss('vnpay-sync');
      }
    }
  };

  const verifyDisplayStatus = async () => {
    const queryParams = new URLSearchParams(location.search);
    const responseCode = queryParams.get('vnp_ResponseCode');
    const orderId = queryParams.get('vnp_TxnRef'); 
    if (responseCode && orderId) {
      try {
        await api.post(`/wallet/verify-sandbox-dispute/${orderId}?responseCode=${responseCode}`);
      } catch (err) {
        console.error("Lỗi kích hoạt xử lý tranh chấp Sandbox:", err);
      }
      navigate('/wallet', { replace: true });
      pollTransactionStatus(orderId, 1);
    }
  };

  const handleDeposit = async () => {
    if (!amount || parseInt(amount) < 10000) {
      toast.error('Số tiền nộp tối thiểu thông qua cổng là 10.000đ');
      return;
    }
    setIsProcessing(true);
    try {
      const response = await api.post('/wallet/deposit?gateway=VNPAY', { amount: parseInt(amount) });
      if (response.data?.data?.paymentUrl) {
        window.location.href = response.data.data.paymentUrl;
      } else {
        toast.error('Máy chủ phản hồi lỗi cấu trúc URL thanh toán.');
      }
    } catch (err) {
      console.error("Lỗi xử lý nộp tiền:", err);
      toast.error(err.response?.data?.error || 'Lỗi kết nối máy chủ ví');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseInt(withdrawAmount) < 50000) {
      toast.error('Số tiền rút tối thiểu về tài khoản ngân hàng là 50.000đ');
      return;
    }

    const withdrawAmountNum = parseInt(withdrawAmount);

    // Kiểm tra chặn số dư âm và ràng buộc giữ lại 50.000đ
    if (availableBalance < 50000) {
      toast.error('Số dư khả dụng hiện tại của bạn không đủ điều kiện tối thiểu để rút (Phải lớn hơn 50.000đ).');
      return;
    }

    if (withdrawAmountNum > maxWithdrawable) {
      toast.error(`Số tiền vượt quá hạn mức. Bạn chỉ được phép rút tối đa ${maxWithdrawable.toLocaleString('vi-VN')}đ để giữ lại số dư duy trì hệ thống.`);
      return;
    }

    if (!bankAccount.bankName || !bankAccount.accountNumber || !bankAccount.accountName) {
      toast.error('Vui lòng nhập đầy đủ thông tin định danh thẻ ngân hàng');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await api.post('/wallet/withdraw', {
        amount: withdrawAmountNum,
        bankAccount: bankAccount
      });

      if (response.data?.success || response.status === 200) {
        toast.success(response.data?.message || 'Yêu cầu rút tiền thành công! Đang chờ Admin duyệt.');
        setWithdrawAmount('');
        await loadWalletComponents(); 
      }
    } catch (err) {
      console.error("Lỗi xử lý rút tiền hệ thống:", err);
      // Hiển thị trực tiếp câu chửi/thông báo lỗi nghiệp vụ từ backend trả về
      toast.error(err.response?.data?.error || 'Lỗi xử lý hệ thống cốt lõi');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveBankAccount = () => {
    if (!bankAccount.bankName || !bankAccount.accountNumber || !bankAccount.accountName) {
      toast.error('Vui lòng điền đủ thông tin trước khi lưu mẫu');
      return;
    }
    localStorage.setItem('bankAccount', JSON.stringify(bankAccount));
    toast.success('Thông tin ngân hàng đã được lưu làm mặc định');
  };

  return (
    <Layout title="Ví điện tử ConstructX">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[calc(100vh-130px)] items-stretch">
         <div className="lg:col-span-5 flex flex-col space-y-4 h-full min-h-0">
           <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-5 rounded-2xl text-white shadow-md relative overflow-hidden flex-shrink-0">
             <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8"></div>
             <div className="flex justify-between items-start relative z-10">
               <div>
                 <p className="text-[11px] uppercase tracking-widest opacity-80 mb-0.5">Số dư khả dụng</p>
                 <h2 className="text-3xl font-bold tracking-tight">{availableBalance.toLocaleString('vi-VN')}đ</h2>
                 {wallet?.lockedAmount > 0 && (
                   <p className="text-[10px] text-amber-200 mt-1 font-medium bg-white/10 px-2 py-0.5 rounded-md w-max">
                     Đang đóng băng: {wallet.lockedAmount.toLocaleString('vi-VN')}đ
                   </p>
                 )}
               </div>
               <button onClick={loadWalletComponents} disabled={isLoadingData} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                 <RefreshCw size={14} className={isLoadingData ? "animate-spin" : ""} />
               </button>
             </div>
             <div className="grid grid-cols-2 gap-2.5 mt-4 pt-3 border-t border-white/10 text-xs">
               <div className="bg-white/10 rounded-lg p-2">
                 <p className="text-[10px] opacity-70 mb-0.5">Tổng dòng tiền nhận</p>
                 <p className="font-bold text-green-300">{totalReceivedAmount.toLocaleString('vi-VN')}đ</p>
               </div>
               <div className="bg-white/10 rounded-lg p-2">
                 <p className="text-[10px] opacity-70 mb-0.5">Tổng dòng tiền ra</p>
                 <p className="font-bold text-amber-300">{totalWithdrawnAmount.toLocaleString('vi-VN')}đ</p>
               </div>
             </div>
           </div>

           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
             <div className="flex border-b flex-shrink-0 bg-gray-50/50">
               <button onClick={() => setActiveTab('deposit')} className={`flex-1 py-3 text-center text-xs font-bold ${activeTab === 'deposit' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500'}`}><ArrowUpRight size={14} /> NỘP TIỀN VIA VNPAY</button>
               <button onClick={() => setActiveTab('withdraw')} className={`flex-1 py-3 text-center text-xs font-bold ${activeTab === 'withdraw' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500'}`}><ArrowDownRight size={14} /> YÊU CẦU RÚT TIỀN</button>
             </div>
             <div className="p-5 flex-1 overflow-y-auto min-h-0 space-y-4">
               {activeTab === 'deposit' && (
                 <>
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Đề xuất nhanh số tiền nộp</label>
                     <div className="grid grid-cols-3 gap-1.5">
                       {suggestedAmounts.map((sAm) => (
                         <button key={sAm} onClick={() => setAmount(sAm.toString())} className={`py-2 px-2 border rounded-lg text-xs font-bold ${amount === sAm.toString() ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200'}`}>{sAm.toLocaleString('vi-VN')}đ</button>
                       ))}
                     </div>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Số tiền cần nộp</label>
                     <div className="relative">
                       <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Nhập số tiền..." className="w-full pl-3 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-base font-bold focus:outline-none focus:border-blue-500" />
                       <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs">VNĐ</span>
                     </div>
                   </div>
                   <button onClick={handleDeposit} disabled={isProcessing} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-xs hover:bg-blue-700 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50">
                     {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <Banknote size={14} />} TIẾN HÀNH NỘP TIỀN
                   </button>
                 </>
               )}

               {/* ĐÃ SỬA: Cải tiến giao diện Rút tiền theo nghiệp vụ mới */}
               {activeTab === 'withdraw' && (
                 <div className="space-y-3">
                   <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 space-y-1">
                     <p className="font-bold flex items-center gap-1">⚠️ Quy định rút tiền hệ thống:</p>
                     <p>• Hạn mức rút tối thiểu: <span className="font-extrabold">50.000đ</span></p>
                     <p>• Số tiền tối đa bạn có thể rút hiện tại: <span className="font-extrabold text-blue-700 text-sm">{maxWithdrawable.toLocaleString('vi-VN')}đ</span></p>
                     <p className="text-[11px] text-amber-700 italic">• Hệ thống bắt buộc giữ lại <span className="font-bold">50.000đ</span> để duy trì tài khoản ví và ngăn số dư khả dụng bị âm.</p>
                   </div>

                   <div className="space-y-1.5">
                     <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Số tiền muốn rút</label>
                     <div className="relative">
                       <input 
                         type="number" 
                         value={withdrawAmount} 
                         onChange={(e) => setWithdrawAmount(e.target.value)} 
                         placeholder="Tối thiểu 50,000đ..." 
                         className="w-full pl-3 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-base font-bold focus:outline-none focus:border-blue-500 focus:bg-white transition-all" 
                       />
                       <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs">VNĐ</span>
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-2">
                     <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Ngân hàng</label>
                       <select value={bankAccount.bankName} onChange={(e) => setBankAccount({...bankAccount, bankName: e.target.value})} className="w-full px-2.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white">
                         <option value="">Chọn...</option><option value="Vietcombank">Vietcombank</option><option value="Techcombank">Techcombank</option><option value="BIDV">BIDV</option><option value="ACB">ACB</option><option value="MB Bank">MB Bank</option>
                       </select>
                     </div>
                     <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Số tài khoản</label>
                       <input type="text" value={bankAccount.accountNumber} onChange={(e) => setBankAccount({...bankAccount, accountNumber: e.target.value})} placeholder="Số TK..." className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white" />
                     </div>
                   </div>
                   <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Tên chủ tài khoản</label>
                     <input type="text" value={bankAccount.accountName} onChange={(e) => setBankAccount({...bankAccount, accountName: e.target.value})} placeholder="NGUYEN VAN A" className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold uppercase tracking-wide focus:outline-none focus:border-blue-500 focus:bg-white" />
                   </div>
                   <div className="grid grid-cols-2 gap-2 pt-1">
                     <button type="button" onClick={handleSaveBankAccount} className="py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-all">Lưu thông tin mẫu</button>
                     <button 
                       onClick={handleWithdraw} 
                       disabled={isProcessing || maxWithdrawable < 50000 || !withdrawAmount} 
                       className="bg-gradient-to-r from-green-600 to-green-700 text-white py-2 rounded-xl text-xs font-bold shadow-sm disabled:opacity-50 hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-1"
                     >
                       {isProcessing ? <RefreshCw size={12} className="animate-spin" /> : null} XÁC NHẬN YÊU CẦU
                     </button>
                   </div>
                 </div>
               )}
             </div>
           </div>
         </div>

         <div className="lg:col-span-7 flex flex-col space-y-4 h-full min-h-0">
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
             <div className="p-4 border-b border-gray-100 flex-shrink-0 bg-gray-50/30">
               <h3 className="font-bold text-gray-800 text-base flex items-center gap-2"><History size={18} className="text-gray-400" /> Nhật ký giao dịch dòng tiền</h3>
             </div>
             <div className="flex-1 overflow-y-auto min-h-0">
               {transactions.length === 0 ? (
                 <div className="py-16 text-center"><History size={48} className="mx-auto text-gray-200 mb-2" /><p className="text-xs text-gray-400">Chưa phát sinh hoạt động giao dịch.</p></div>
               ) : (
                 <div className="divide-y divide-gray-100">
                   {transactions.map((trans) => {
                     const isIncome = trans.type === 'DEPOSIT' || trans.type === 'TOKEN_PAY' || trans.type === 'RELEASE' || trans.type === 'REVENUE';
                     return (
                       <div key={trans.id} className="p-3.5 hover:bg-gray-50/60 transition-all flex items-center justify-between gap-4">
                         <div className="flex items-center gap-3 min-w-0">
                           <div className={`p-2 rounded-full ${isIncome ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{isIncome ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}</div>
                           <div className="min-w-0">
                             <p className="font-bold text-gray-800 text-xs truncate">
                               {trans.type === 'DEPOSIT' && 'Nạp tiền vào tài khoản'}
                               {trans.type === 'WITHDRAW' && 'Yêu cầu rút tiền về NH'}
                               {trans.type === 'LOCK' && 'Hệ thống đóng băng số dư'}
                               {trans.type === 'RELEASE' && 'Hệ thống giải phóng đóng băng'}
                               {trans.type === 'REVENUE' && 'Nhận doanh thu dự án'}
                             </p>
                             <p className="text-[10px] text-gray-400 font-mono mt-0.5">Đơn: {trans.gatewayOrderId || trans.id}</p>
                             <span className="text-[10px] text-gray-400 mt-0.5 block truncate max-w-[280px]">{typeof trans.description === 'object' ? 'Yêu cầu giao dịch' : trans.description}</span>
                           </div>
                         </div>
                         <div className="text-right flex-shrink-0">
                           <p className={`font-mono font-bold text-sm ${trans.status === 'SUCCESS' ? (isIncome ? 'text-green-600' : 'text-red-600') : 'text-gray-400'}`}>{isIncome ? '+' : '-'}{trans.amount?.toLocaleString('vi-VN')}đ</p>
                           <span className={`inline-block px-1.5 py-0.5 rounded-md text-[9px] font-extrabold mt-1 ${trans.status === 'SUCCESS' ? 'bg-green-50 text-green-700' : trans.status === 'PENDING' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>{trans.status === 'SUCCESS' ? 'Thành công' : trans.status === 'PENDING' ? 'Chờ duyệt' : 'Thất bại'}</span>
                         </div>
                       </div>
                     );
                   })}
                 </div>
               )}
             </div>
           </div>
         </div>
      </div>
    </Layout>
  );
};

export default WalletPage;