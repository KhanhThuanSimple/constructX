import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Camera, DollarSign, Star, AlertTriangle,
  FileText, ShieldAlert, User, UserCheck, ShieldCheck
} from 'lucide-react';

const fmt = (n) =>
  n == null ? '—' :
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n).replace('₫', 'đ');

export default function ContractHeader({
  contract,
  progress = 0,
  totalDisbursed = 0,
  totalLocked = 0,
  activeTab = 'progress'
}) {
  const navigate = useNavigate();
  if (!contract) return null;

  const isDisputed = contract.isDisputed;
  const contractId = contract.id;

  const tabs = [
    { key: 'progress',      label: 'Nhật ký thi công', icon: <Camera size={15} />, path: `/contracts/${contractId}/progress` },
    { key: 'disbursements', label: 'Giải ngân & Escrow', icon: <DollarSign size={15} />, path: `/contracts/${contractId}/disbursements` },
    { key: 'review',        label: 'Nghiệm thu & Đánh giá', icon: <Star size={15} />, path: `/contracts/${contractId}/review` },
    { key: 'dispute',       label: 'Tranh chấp', icon: <AlertTriangle size={15} />, path: `/contracts/${contractId}/dispute` }
  ];

  return (
    <div className="space-y-4">
      {/* Quay lại danh sách hợp đồng */}
      <button
        onClick={() => navigate('/contracts')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors group"
      >
        <ChevronLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
        Quay lại danh sách hợp đồng
      </button>

      {/* Card Thông tin chung */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden">
        {/* Background Decorative Accent */}
        <div className="absolute top-0 left-0 w-2 h-full bg-primary" />

        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="space-y-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Hợp đồng thi công</p>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                {contract.projectName || contract.orderCode || contract.contractNumber}
                {contract.status === 'COMPLETED' && (
                  <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    ✓ Hoàn thành
                  </span>
                )}
                {contract.status === 'CANCELLED' && (
                  <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    Đã hủy
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-400 font-mono mt-0.5">Mã HĐ: {contract.contractNumber}</p>
            </div>

            {/* Các bên ký kết */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-600 font-medium">
              <span className="flex items-center gap-1">
                <User size={12} className="text-gray-400" />
                Khách hàng: <strong className="text-gray-800">{contract.clientName}</strong>
              </span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1">
                <UserCheck size={12} className="text-gray-400" />
                Nhà thầu: <strong className="text-gray-800">{contract.contractorName}</strong>
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Tổng giá trị HĐ</p>
            <p className="text-2xl font-extrabold text-primary">{fmt(contract.agreedPrice)}</p>

            <div className="text-xs text-gray-400 mt-1 space-y-0.5">
              <p>Đã giải ngân: <strong className="text-green-600 font-semibold">{fmt(totalDisbursed)} ({Math.round((totalDisbursed / (contract.agreedPrice || 1)) * 100)}%)</strong></p>
              {totalLocked > 0 && (
                <p className="text-amber-600 flex items-center gap-1 justify-end font-semibold">
                  🔒 Đang đóng băng: {fmt(totalLocked)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Banner Cảnh báo Tranh chấp (Đóng băng tài chính) */}
      {isDisputed && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-800 shadow-sm animate-pulse">
          <ShieldAlert size={18} className="mt-0.5 shrink-0 text-red-500" />
          <div>
            <p className="font-bold text-red-955">⚠️ Hợp đồng đang phát sinh khiếu nại & ĐÓNG BĂNG tài chính</p>
            <p className="text-xs mt-1 text-red-700 leading-relaxed">
              Mọi hành động báo cáo tiến độ, yêu cầu giải ngân hoặc nghiệm thu hoàn công hiện đang bị tạm khóa. 
              Vui lòng truy cập tab <strong className="underline cursor-pointer" onClick={() => navigate(`/contracts/${contractId}/dispute`)}>Tranh chấp</strong> để xem phòng đối chất 3 bên do Admin giám sát.
            </p>
          </div>
        </div>
      )}

      {/* Thanh Tab Điều hướng Hợp đồng độc lập */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 shadow-inner w-full overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => navigate(tab.path)}
              className={`flex items-center gap-2 justify-center py-3 px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 flex-1 ${
                isActive
                  ? 'bg-white text-primary shadow-sm ring-1 ring-black/5'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.key === 'dispute' && isDisputed && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
