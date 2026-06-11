import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/useAuthStore';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import WalletPage from './pages/WalletPage';
import CreateProjectPage from './pages/CreateProjectPage';
import HomePage from './pages/HomePage';
import CustomerHomePage from './pages/CustomerHomePage';
import ContractorHomePage from './pages/ContractorHomePage';
import ShopPage from './pages/shop/ShopPage';
import ShopProductDetailPage from './pages/shop/ShopProductDetailPage';
import AdminProductsPage from './pages/AdminProductsPage';
import ProjectListPage from './pages/ProjectListPage';
import ProfilePage from './pages/ProfilePage';
import ProjectMarketplacePage from './pages/ProjectMarketplacePage';
import ProductionLogPage from './pages/ProductionLogPage';
import PortfolioPage from './pages/PortfolioPage';
import AdminProjectsPage from './pages/AdminProjectsPage';
import AdminDisputesPage from './pages/AdminDisputesPage';
import AdminWithdrawalsPage from './pages/AdminWithdrawalsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProjectDetailPageV2 from './pages/ProjectDetailPageV2';
import DashboardContractorPage from './pages/DashboardContractorPage';
import ProductionLogDetailPage from './pages/ProductionLogDetailPage';
import NotificationsPage from './pages/NotificationsPage';
import ChatPage from './pages/ChatPage';
import { ChatMonitoring } from './pages/ChatMonitoring';
import ContractsPage from './pages/ContractsPage';
import AdminContractsPage from './pages/AdminContractsPage';
import OrderCheckoutPage from './pages/shop/OrderCheckoutPage';
import OrdersPage from './pages/OrdersPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import FurnitureDesignerPage from './pages/shop/FurnitureDesignerPage';
import OrderBiddingPage from './pages/OrderBiddingPage';
import MyBidsPage from './pages/MyBidsPage';
import AdminAllUsersPage from './pages/AdminAllUsersPage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, user } = useAuthStore();

  if (!token) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

// Trang chủ thông minh: phân luồng theo role
const SmartHomePage = () => {
  const { user } = useAuthStore();
  if (user?.role === 'CUSTOMER') return <CustomerHomePage />;
  if (user?.role === 'CONTRACTOR') return <ContractorHomePage />;
  // ADMIN vẫn dùng HomePage cũ (marketplace dự án)
  return <HomePage />;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/" element={
          <ProtectedRoute allowedRoles={['CUSTOMER', 'CONTRACTOR', 'ADMIN']}>
            <SmartHomePage />
          </ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/projects" element={
          <ProtectedRoute allowedRoles={['CUSTOMER', 'CONTRACTOR']}>
            <ProjectListPage />
          </ProtectedRoute>
        } />

        <Route path="/projects/new" element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <CreateProjectPage />
          </ProtectedRoute>
        } />

        <Route path="/projects/:id" element={
          <ProtectedRoute allowedRoles={['CUSTOMER', 'CONTRACTOR', 'ADMIN']}>
            <ProjectDetailPage />
          </ProtectedRoute>
        } />

        <Route path="/projects/browse" element={
          <ProtectedRoute allowedRoles={['CONTRACTOR']}>
            <ProjectMarketplacePage />
          </ProtectedRoute>
        } />

        <Route path="/production-log" element={
          <ProtectedRoute allowedRoles={['CONTRACTOR']}>
            <ProductionLogPage />
          </ProtectedRoute>
        } />

        <Route path="/portfolio" element={
          <ProtectedRoute allowedRoles={['CONTRACTOR']}>
            <PortfolioPage />
          </ProtectedRoute>
        } />
 <Route path="/shop" element={<ShopPage />} />
        <Route path="/shop/products/:id" element={<ShopProductDetailPage />} />
        <Route path="/shop/order" element={
          <ProtectedRoute allowedRoles={['CUSTOMER', 'CONTRACTOR', 'ADMIN']}>
            <OrderCheckoutPage />
          </ProtectedRoute>
        } />
        <Route path="/shop/designer" element={<FurnitureDesignerPage />} />
        <Route path="/orders" element={
          <ProtectedRoute allowedRoles={['CUSTOMER', 'CONTRACTOR', 'ADMIN']}>
            <OrdersPage />
          </ProtectedRoute>
        } />
        <Route path="/order-bidding" element={
          <ProtectedRoute allowedRoles={['CONTRACTOR']}>
            <OrderBiddingPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/orders" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminOrdersPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/products" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminProductsPage />
          </ProtectedRoute>
        } />

        <Route path="/bids" element={
          <ProtectedRoute allowedRoles={['CONTRACTOR']}>
            <MyBidsPage />
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute allowedRoles={['CUSTOMER', 'CONTRACTOR', 'ADMIN']}>
            <ChatPage />
          </ProtectedRoute>
        } />
        <Route path="/chat/:roomId" element={
  <ProtectedRoute allowedRoles={['CUSTOMER', 'CONTRACTOR', 'ADMIN']}>
    <ChatPage />
  </ProtectedRoute>
} />

        <Route path="/admin/projects" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminProjectsPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/disputes" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDisputesPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminUsersPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/all-users" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminAllUsersPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/AdminWithdrawalsPage" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminWithdrawalsPage />
          </ProtectedRoute>
        } />


        <Route path="/admin/settings" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminSettingsPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/chat" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ChatMonitoring />
          </ProtectedRoute>
        } />

        <Route path="/contracts" element={
          <ProtectedRoute allowedRoles={['CUSTOMER', 'CONTRACTOR']}>
            <ContractsPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/contracts" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminContractsPage />
          </ProtectedRoute>
        } />

        <Route path="/wallet" element={
          <ProtectedRoute allowedRoles={['CUSTOMER', 'CONTRACTOR', 'ADMIN']}>
            <WalletPage />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={['CUSTOMER', 'CONTRACTOR', 'ADMIN']}>
            <ProfilePage />
          </ProtectedRoute>
        } />

        <Route path="/notifications" element={
          <ProtectedRoute allowedRoles={['CUSTOMER', 'CONTRACTOR', 'ADMIN']}>
            <NotificationsPage />
          </ProtectedRoute>
        } />
        {/* contractor only */}
        <Route path="/projectsv2/:id" element={
          <ProtectedRoute allowedRoles={['CONTRACTOR']}>
            <ProjectDetailPageV2 />
          </ProtectedRoute>
        } />

        <Route path="/contractor/dashboard" element={
          <ProtectedRoute allowedRoles={['CONTRACTOR']}>
            <DashboardContractorPage />
          </ProtectedRoute>
        } />

        <Route path="/production-log/:jobId" element={
          <ProtectedRoute allowedRoles={['CONTRACTOR']}>
            <ProductionLogDetailPage />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
