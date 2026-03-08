import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '@layouts';
import { LoginPage } from '@pages/auth';
import { DashboardPage, UIComponentsPage, UsersPage, UserDetailPage, UserCreatePage, SettingsPage } from '@/pages/admin';
import CookiePolicyPage from '@pages/CookiePolicyPage';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import RootRedirect from './RootRedirect';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Cookie Policy - Public */}
      <Route path="/cookie-policy" element={<CookiePolicyPage />} />

      {/* Protected Routes */}
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="ui-components" element={<UIComponentsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="users/create" element={<UserCreatePage />} />
        <Route path="users/:id" element={<UserDetailPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Redirect root to dashboard if authenticated, otherwise to login */}
      <Route path="/" element={<RootRedirect />} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
