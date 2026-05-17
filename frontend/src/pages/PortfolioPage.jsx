import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Plus, Star, MapPin, Calendar, ExternalLink } from 'lucide-react';

const PortfolioPage = () => {
  const [works] = useState([
    { id: 1, title: 'Phòng khách Vinhomes', meta: '2024 · 95tr', icon: '🛋️', category: 'Nội thất' },
    { id: 2, title: 'Bếp tối giản Q7', meta: '2024 · 58tr', icon: '🍳', category: 'Phòng bếp' },
    { id: 3, title: 'Phòng ngủ Master', meta: '2024 · 72tr', icon: '🛏️', category: 'Phòng ngủ' },
    { id: 4, title: 'Toàn nhà Bình Dương', meta: '2023 · 320tr', icon: '🏠', category: 'Xây thô' },
    { id: 5, title: 'WC Luxury SPA', meta: '2023 · 45tr', icon: '🚿', category: 'Phòng tắm' },
    { id: 6, title: 'Văn phòng Startup', meta: '2023 · 180tr', icon: '🏢', category: 'Văn phòng' },
  ]);

  return (
    <Layout title="Hồ sơ năng lực (Portfolio)">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-[#1a4f3a] flex items-center justify-center text-3xl text-white font-bold shadow-lg">
              MP
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Xưởng Nội Thất Minh Phú</h2>
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1 text-sm text-amber-500 font-bold">
                  <Star size={16} fill="currentColor" /> 4.9 (87 đánh giá)
                </span>
                <span className="flex items-center gap-1 text-sm text-gray-400">
                  <MapPin size={16} /> TP. Hồ Chí Minh
                </span>
              </div>
            </div>
          </div>
          <button className="btn btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl shadow-lg shadow-[#1a4f3a]/20">
            <Plus size={20} /> Thêm công trình
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {works.map((work) => (
            <div key={work.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
              <div className="h-48 bg-gray-50 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500">
                {work.icon}
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-[#1a4f3a] uppercase tracking-widest bg-[#e8f5ee] px-2 py-1 rounded-md">
                    {work.category}
                  </span>
                  <button className="text-gray-300 hover:text-[#1a4f3a] transition-colors">
                    <ExternalLink size={18} />
                  </button>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">{work.title}</h3>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Calendar size={14} /> {work.meta.split(' · ')[0]}</span>
                  <span className="font-bold text-[#1a4f3a]">{work.meta.split(' · ')[1]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default PortfolioPage;
