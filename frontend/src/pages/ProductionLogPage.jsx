import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Camera, Clock, MessageCircle, ThumbsUp, MoreHorizontal } from 'lucide-react';

const ProductionLogPage = () => {
  const [logs] = useState([
    {
      id: 1,
      date: 'Hôm nay, 14:22',
      title: 'Hoàn thiện lớp sơn lót tường',
      desc: 'Đã hoàn thành toàn bộ lớp lót. Khô hoàn toàn sau 4h. Chuẩn bị sơn màu chính vào sáng mai.',
      images: ['🖌️', '🏗️', '📸'],
      reactions: 2,
      viewed: true
    },
    {
      id: 2,
      date: 'Hôm qua, 09:15',
      title: 'Lắp đặt khung xương kệ TV',
      desc: 'Khung gỗ sồi đã được định vị và bắt vít. Kiểm tra cân bằng đạt chuẩn. Chờ ráp mặt gỗ.',
      images: ['🔨', '📐', '📸'],
      reactions: 1,
      viewed: true
    },
    {
      id: 3,
      date: '12/06, 16:40',
      title: 'Nhận vật tư & kiểm kho',
      desc: 'Toàn bộ gỗ sồi Mỹ 47 tấm, 2 bộ phụ kiện inox đã được nhận và kiểm tra chất lượng. Đạt 100%.',
      images: ['📦', '✅', '📸'],
      reactions: 3,
      viewed: true
    }
  ]);

  return (
    <Layout title="Nhật ký sản xuất">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Dự án hiện tại</h2>
            <p className="text-lg font-bold text-gray-800">Phòng khách Vila Q2</p>
          </div>
          <button className="btn btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl shadow-lg shadow-[#1a4f3a]/20">
            <Camera size={20} /> Đăng tiến độ mới
          </button>
        </div>

        <div className="space-y-6">
          {logs.map((log) => (
            <div key={log.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock size={14} /> {log.date}
                  </div>
                  <button className="text-gray-300 hover:text-gray-600">
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {log.images.map((img, idx) => (
                    <div 
                      key={idx} 
                      className={`h-40 rounded-2xl flex items-center justify-center text-4xl border border-gray-50 shadow-inner ${
                        idx === 0 ? 'bg-[#e8f5ee]' : idx === 1 ? 'bg-[#eaf0fc]' : 'bg-[#fff8e6]'
                      }`}
                    >
                      {img}
                    </div>
                  ))}
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-2">{log.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">{log.desc}</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Khách hàng đã xem</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 text-xs font-bold hover:bg-gray-100 transition-colors">
                      <ThumbsUp size={14} /> {log.reactions}
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 text-xs font-bold hover:bg-gray-100 transition-colors">
                      <MessageCircle size={14} /> Phản hồi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default ProductionLogPage;
