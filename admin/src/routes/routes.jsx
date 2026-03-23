import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '@layouts';
import { LoginPage, ChangePasswordPage, CreatePasskeyPage, ForgotPasswordPage, ResetPasswordPage } from '@pages/auth';
import {
  DashboardPage, UIComponentsPage, UsersPage, UserDetailPage, UserCreatePage, SettingsPage,
  RolesPage, RoleFormPage, RoleCreatePage, RoleDetailPage,
  ChartOfAccountsPage, JournalEntriesPage, JournalEntryDetailPage, TrialBalancePage, ProfitAndLossPage, BalanceSheetPage,
  TaxRatesPage, TaxRateDetailPage,
  ProductsPage, ProductForm, ProductDetailPage, CategoriesPage, UnitsPage, UnitCreatePage, UnitDetailPage, StockAdjustmentsPage, StockAdjustmentCreatePage, StockAdjustmentDetailPage,
  CustomersPage, CustomerDetailPage, VendorsPage, VendorDetailPage,
  BankAccountsPage, BankAccountDetailPage, PaymentsPage, PaymentDetailPage, ReceiptsPage, ReceiptDetailPage,
  BillsPage, PurchaseBillForm, PurchaseBillDetailPage, DebitNotesPage, PurchaseOrdersPage,
  InvoicesPage, InvoiceForm, InvoiceDetailPage, CreditNotesPage, QuotationsPage,
  GSTSummaryPage, GSTR1Page, GSTR3BPage,
} from '@/pages/admin';
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

        {/* Sales */}
        <Route path="sales/invoices" element={
          <PermissionGate permission="sales:read" fallback={<AccessDeniedPage />}><InvoicesPage /></PermissionGate>
        } />
        <Route path="sales/invoices/new" element={
          <PermissionGate permission="sales:create" fallback={<AccessDeniedPage />}><InvoiceForm /></PermissionGate>
        } />
        <Route path="sales/invoices/:id" element={
          <PermissionGate permission="sales:read" fallback={<AccessDeniedPage />}><InvoiceDetailPage /></PermissionGate>
        } />
        <Route path="sales/customers" element={
          <PermissionGate permission="sales:read" fallback={<AccessDeniedPage />}><CustomersPage /></PermissionGate>
        } />
        <Route path="sales/customers/:id" element={
          <PermissionGate permission="sales:read" fallback={<AccessDeniedPage />}><CustomerDetailPage /></PermissionGate>
        } />
        <Route path="sales/credit-notes" element={
          <PermissionGate permission="sales:read" fallback={<AccessDeniedPage />}><CreditNotesPage /></PermissionGate>
        } />
        <Route path="sales/quotations" element={
          <PermissionGate permission="sales:read" fallback={<AccessDeniedPage />}><QuotationsPage /></PermissionGate>
        } />

        {/* Purchases */}
        <Route path="purchases/bills" element={
          <PermissionGate permission="purchases:read" fallback={<AccessDeniedPage />}><BillsPage /></PermissionGate>
        } />
        <Route path="purchases/bills/new" element={
          <PermissionGate permission="purchases:create" fallback={<AccessDeniedPage />}><PurchaseBillForm /></PermissionGate>
        } />
        <Route path="purchases/bills/:id" element={
          <PermissionGate permission="purchases:read" fallback={<AccessDeniedPage />}><PurchaseBillDetailPage /></PermissionGate>
        } />
        <Route path="purchases/vendors" element={
          <PermissionGate permission="purchases:read" fallback={<AccessDeniedPage />}><VendorsPage /></PermissionGate>
        } />
        <Route path="purchases/vendors/:id" element={
          <PermissionGate permission="purchases:read" fallback={<AccessDeniedPage />}><VendorDetailPage /></PermissionGate>
        } />
        <Route path="purchases/debit-notes" element={
          <PermissionGate permission="purchases:read" fallback={<AccessDeniedPage />}><DebitNotesPage /></PermissionGate>
        } />
        <Route path="purchases/orders" element={
          <PermissionGate permission="purchases:read" fallback={<AccessDeniedPage />}><PurchaseOrdersPage /></PermissionGate>
        } />

        {/* Banking */}
        <Route path="banking/accounts" element={
          <PermissionGate permission="banking:read" fallback={<AccessDeniedPage />}><BankAccountsPage /></PermissionGate>
        } />
        <Route path="banking/accounts/:id" element={
          <PermissionGate permission="banking:read" fallback={<AccessDeniedPage />}><BankAccountDetailPage /></PermissionGate>
        } />
        <Route path="banking/payments" element={
          <PermissionGate permission="banking:create" fallback={<AccessDeniedPage />}><PaymentsPage /></PermissionGate>
        } />
        <Route path="banking/payments/:id" element={
          <PermissionGate permission="banking:read" fallback={<AccessDeniedPage />}><PaymentDetailPage /></PermissionGate>
        } />
        <Route path="banking/receipts" element={
          <PermissionGate permission="banking:create" fallback={<AccessDeniedPage />}><ReceiptsPage /></PermissionGate>
        } />
        <Route path="banking/receipts/:id" element={
          <PermissionGate permission="banking:read" fallback={<AccessDeniedPage />}><ReceiptDetailPage /></PermissionGate>
        } />

        {/* Inventory */}
        <Route path="inventory/products" element={
          <PermissionGate permission="inventory:read" fallback={<AccessDeniedPage />}><ProductsPage /></PermissionGate>
        } />
        <Route path="inventory/products/new" element={
          <PermissionGate permission="inventory:create" fallback={<AccessDeniedPage />}><ProductForm /></PermissionGate>
        } />
        <Route path="inventory/products/:id" element={
          <PermissionGate permission="inventory:read" fallback={<AccessDeniedPage />}><ProductDetailPage /></PermissionGate>
        } />
        <Route path="inventory/products/:id/edit" element={
          <PermissionGate permission="inventory:update" fallback={<AccessDeniedPage />}><ProductForm /></PermissionGate>
        } />
        <Route path="inventory/categories" element={
          <PermissionGate permission="inventory:read" fallback={<AccessDeniedPage />}><CategoriesPage /></PermissionGate>
        } />
        <Route path="inventory/units" element={
          <PermissionGate permission="inventory:read" fallback={<AccessDeniedPage />}><UnitsPage /></PermissionGate>
        } />
        <Route path="inventory/units/new" element={
          <PermissionGate permission="inventory:create" fallback={<AccessDeniedPage />}><UnitCreatePage /></PermissionGate>
        } />
        <Route path="inventory/units/:id" element={
          <PermissionGate permission="inventory:read" fallback={<AccessDeniedPage />}><UnitDetailPage /></PermissionGate>
        } />
        <Route path="inventory/stock-adjustments" element={
          <PermissionGate permission="inventory:create" fallback={<AccessDeniedPage />}><StockAdjustmentsPage /></PermissionGate>
        } />
        <Route path="inventory/stock-adjustments/new" element={
          <PermissionGate permission="inventory:create" fallback={<AccessDeniedPage />}><StockAdjustmentCreatePage /></PermissionGate>
        } />
        <Route path="inventory/stock-adjustments/:id" element={
          <PermissionGate permission="inventory:read" fallback={<AccessDeniedPage />}><StockAdjustmentDetailPage /></PermissionGate>
        } />

        {/* Accounting */}
        <Route path="accounting/chart-of-accounts" element={
          <PermissionGate permission="accounting:read" fallback={<AccessDeniedPage />}>
            <ChartOfAccountsPage />
          </PermissionGate>
        } />
        <Route path="accounting/journal-entries" element={
          <PermissionGate permission="accounting:read" fallback={<AccessDeniedPage />}>
            <JournalEntriesPage />
          </PermissionGate>
        } />
        <Route path="accounting/journal-entries/:id" element={
          <PermissionGate permission="accounting:read" fallback={<AccessDeniedPage />}><JournalEntryDetailPage /></PermissionGate>
        } />
        <Route path="accounting/trial-balance" element={
          <PermissionGate permission="accounting:read" fallback={<AccessDeniedPage />}>
            <TrialBalancePage />
          </PermissionGate>
        } />
        <Route path="accounting/profit-and-loss" element={
          <PermissionGate permission="accounting:read" fallback={<AccessDeniedPage />}>
            <ProfitAndLossPage />
          </PermissionGate>
        } />
        <Route path="accounting/balance-sheet" element={
          <PermissionGate permission="accounting:read" fallback={<AccessDeniedPage />}>
            <BalanceSheetPage />
          </PermissionGate>
        } />

        {/* Tax / GST */}
        <Route path="tax/rates" element={
          <PermissionGate permission="tax:read" fallback={<AccessDeniedPage />}><TaxRatesPage /></PermissionGate>
        } />
        <Route path="tax/rates/:id" element={
          <PermissionGate permission="tax:read" fallback={<AccessDeniedPage />}><TaxRateDetailPage /></PermissionGate>
        } />
        <Route path="tax/gst-summary" element={
          <PermissionGate permission="tax:read" fallback={<AccessDeniedPage />}><GSTSummaryPage /></PermissionGate>
        } />
        <Route path="tax/gstr1" element={
          <PermissionGate permission="tax:read" fallback={<AccessDeniedPage />}><GSTR1Page /></PermissionGate>
        } />
        <Route path="tax/gstr3b" element={
          <PermissionGate permission="tax:read" fallback={<AccessDeniedPage />}><GSTR3BPage /></PermissionGate>
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
