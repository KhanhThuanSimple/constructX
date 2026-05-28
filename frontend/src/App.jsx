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

// Temporary components until I create them
// const Notifications = () => <div className="p-8">Notifications (Coming soon)</div>;
const MyBids = () => <div className="p-8">My Bids (Coming soon)</div>;

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, user } = useAuthStore();

  if (!token) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" />;
  }

  return children;
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
            <HomePage />
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

        <Route path="/bids" element={
          <ProtectedRoute allowedRoles={['CONTRACTOR']}>
            <MyBids />
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
