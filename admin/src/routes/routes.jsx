import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '@layouts';
import { LoginPage, ChangePasswordPage, CreatePasskeyPage, ForgotPasswordPage, ResetPasswordPage } from '@pages/auth';
import { DashboardPage, UIComponentsPage, UsersPage, UserDetailPage, UserCreatePage, SettingsPage, RolesPage, RoleFormPage, RoleCreatePage, RoleDetailPage } from '@/pages/admin';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import PermissionGate from '@/components/PermissionGate';
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

      {/* POS - Protected, full screen */}
      <Route
        path="/pos"
        element={
          <PrivateRoute>
            <PermissionGate permission="pos:access" fallback={<AccessDeniedPage />}>
              <POSRedirect />
            </PermissionGate>
          </PrivateRoute>
        }
      />

      {/* POS Table View - Protected, full screen */}
      <Route
        path="/pos/table"
        element={
          <PrivateRoute>
            <PermissionGate permission="pos:access" fallback={<AccessDeniedPage />}>
              <TablePOSPage />
            </PermissionGate>
          </PrivateRoute>
        }
      />

      {/* Mail Portal - Protected, full screen */}
      <Route
        path="/mail"
        element={
          <PrivateRoute>
            <PermissionGate permission="mail:access" fallback={<AccessDeniedPage />}>
              <MailPage />
            </PermissionGate>
          </PrivateRoute>
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={
          <PermissionGate permission="dashboard:view" fallback={<AccessDeniedPage />}>
            <DashboardPage />
          </PermissionGate>
        } />
        <Route path="ui-components" element={<UIComponentsPage />} />

        {/* Users - permission gated */}
        <Route path="users" element={
          <PermissionGate permission="users:read" fallback={<AccessDeniedPage />}>
            <UsersPage />
          </PermissionGate>
        } />
        <Route path="users/create" element={
          <PermissionGate permission="users:create" fallback={<AccessDeniedPage />}>
            <UserCreatePage />
          </PermissionGate>
        } />
        <Route path="users/:id" element={
          <PermissionGate permission="users:read" fallback={<AccessDeniedPage />}>
            <UserDetailPage />
          </PermissionGate>
        } />

        {/* Settings - permission gated */}
        <Route path="settings" element={
          <PermissionGate permission="settings:read" fallback={<AccessDeniedPage />}>
            <SettingsPage />
          </PermissionGate>
        } />

        {/* Roles - permission gated */}
        <Route path="roles" element={
          <PermissionGate permission="roles:read" fallback={<AccessDeniedPage />}>
            <RolesPage />
          </PermissionGate>
        } />
        <Route path="roles/:id" element={
          <PermissionGate permission="roles:read" fallback={<AccessDeniedPage />}>
            <RoleDetailPage />
          </PermissionGate>
        } />
        <Route path="roles/create" element={
          <PermissionGate permission="roles:create" fallback={<AccessDeniedPage />}>
            <RoleCreatePage />
          </PermissionGate>
        } />
        <Route path="roles/:id/edit" element={
          <PermissionGate permission="roles:update" fallback={<AccessDeniedPage />}>
            <RoleFormPage />
          </PermissionGate>
        } />
      </Route>

      {/* Redirect root to dashboard if authenticated, otherwise to login */}
      <Route path="/" element={<RootRedirect />} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
