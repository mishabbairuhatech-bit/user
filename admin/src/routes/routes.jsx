import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '@layouts';
import { LoginPage, ChangePasswordPage, CreatePasskeyPage, ForgotPasswordPage, ResetPasswordPage } from '@pages/auth';
import { DashboardPage, UIComponentsPage, UsersPage, UserDetailPage, UserCreatePage, SettingsPage } from '@/pages/admin';
import { POSPage } from '@/pages/pos';
import { TablePOSPage } from '@/pages/pos/table-view';
import { MailPage } from '@/pages/mail-portal';
import { useSettings } from '@/context/SettingsContext';
import CookiePolicyPage from '@pages/CookiePolicyPage';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import RootRedirect from './RootRedirect';

// Redirects to the user's preferred POS view
const POSRedirect = () => {
  const { settings } = useSettings();
  if (settings.posViewType === 'table') {
    return <Navigate to="/pos/table" replace />;
  }
  return <POSPage />;
};

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

      {/* Forgot Password - Public */}
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        }
      />

      {/* Reset Password - Public */}
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        }
      />

      {/* Cookie Policy - Public */}
      <Route path="/cookie-policy" element={<CookiePolicyPage />} />

      {/* Change Password - Protected but uses AuthLayout */}
      <Route
        path="/change-password"
        element={
          <PrivateRoute>
            <ChangePasswordPage />
          </PrivateRoute>
        }
      />

      {/* Create Passkey - Protected but uses AuthLayout */}
      <Route
        path="/create-passkey"
        element={
          <PrivateRoute>
            <CreatePasskeyPage />
          </PrivateRoute>
        }
      />

      {/* POS - Protected, full screen (redirects based on saved view preference) */}
      <Route
        path="/pos"
        element={
          <PrivateRoute>
            <POSRedirect />
          </PrivateRoute>
        }
      />

      {/* POS Table View - Protected, full screen */}
      <Route
        path="/pos/table"
        element={
          <PrivateRoute>
            <TablePOSPage />
          </PrivateRoute>
        }
      />

      {/* Mail Portal - Protected, full screen */}
      <Route
        path="/mail"
        element={
          <PrivateRoute>
            <MailPage />
          </PrivateRoute>
        }
      />

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
