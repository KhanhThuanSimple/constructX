import React from 'react';
import Layout from '../components/Layout';
import { ShieldAlert } from 'lucide-react';

const AdminDashboardPage = () => {
  return (
    <Layout title="Quản trị hệ thống">
      <div className="flex flex-col items-center justify-center h-[60vh] bg-white rounded-3xl border border-dashed border-gray-200">
        <div className="w-20 h-20 bg-primary-bg rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="text-primary" size={40} />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 font-display mb-2">Welcome Admin</h1>
        <p className="text-gray-500">Hệ thống quản trị ConstructX đang được phát triển.</p>
      </div>
    </Layout>
  );
};

export default AdminDashboardPage;
