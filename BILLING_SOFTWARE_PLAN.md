# Billing Software — Implementation Plan

> **Project:** Billing & Accounting Software
> **Tech Stack:** React 18 + Vite (Frontend) | NestJS + Sequelize + PostgreSQL (Backend)
> **Date:** 2026-03-21
> **Status:** Planning

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture & Design Principles](#2-architecture--design-principles)
3. [Database Schema](#3-database-schema)
4. [Module 1 — Accounting Core (Ledgers & Double-Entry)](#4-module-1--accounting-core-ledgers--double-entry)
5. [Module 2 — Inventory Management](#5-module-2--inventory-management)
6. [Module 3 — Purchase Management](#6-module-3--purchase-management)
7. [Module 4 — Sales Management](#7-module-4--sales-management)
8. [Module 5 — POS Application](#8-module-5--pos-application)
9. [Module 6 — GST & Tax Management](#9-module-6--gst--tax-management)
10. [Module 7 — Bank & Cash Transactions](#10-module-7--bank--cash-transactions)
11. [API Endpoint Reference](#11-api-endpoint-reference)
12. [Frontend Page Structure](#12-frontend-page-structure)
13. [Implementation Order & Phases](#13-implementation-order--phases)
14. [Testing Strategy](#14-testing-strategy)

---

## 1. Overview

### What This Software Does

A comprehensive billing system that handles:

- **Inventory** — Track products, stock levels, categories, units, HSN/SAC codes, and pricing
- **Sales** — Create sales invoices, manage customers, track receivables
- **Purchases** — Create purchase bills, manage suppliers/vendors, track payables
- **POS** — Fast billing interface for retail with barcode support, held bills, returns
- **GST** — Automatic CGST/SGST/IGST calculation, input/output tax credit tracking, GSTR report data
- **Accounting** — Full double-entry ledger system, journal entries, trial balance, P&L, balance sheet
- **Banking** — Track bank and cash transactions, reconciliation, payment receipts

### What Already Exists

| Area | Status | Location |
|------|--------|----------|
| Auth (JWT, OAuth, Passkey, MFA) | Complete | `server/src/auth/`, `admin/src/pages/auth/` |
| User Management | Complete | `server/src/users/`, `admin/src/pages/admin/USERS/` |
| Roles & Permissions | Complete | `server/src/roles/`, `admin/src/pages/admin/ROLES/` |
| Session Management | Complete | `server/src/sessions/` |
| Password History | Complete | `server/src/password-history/` |
| MFA (Email + TOTP) | Complete | `server/src/mfa/` |
| Passkey (WebAuthn) | Complete | `server/src/passkey/` |
| POS Frontend (Grid + Table) | Partial (mock data, localStorage) | `admin/src/pages/pos/` |
| Mail Portal | Complete (frontend only) | `admin/src/pages/mail-portal/` |
| UI Component Library (30+) | Complete | `admin/src/components/ui/` |
| Dashboard | Skeleton only | `admin/src/pages/admin/DASHBOARD/` |
| Settings | Complete | `admin/src/pages/admin/SETTINGS/` |
| Config Module | Complete | `server/src/config/` |
| Database Module | Complete | `server/src/database/` |
| Common (guards, filters, decorators) | Complete | `server/src/common/` |
| All billing/accounting backend | **Not started** | — |

### Existing Project Conventions

These conventions are already established and must be followed:

**Backend (NestJS — `server/src/`):**
- Each module has: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.provider.ts`
- Entities go in `entities/` subfolder (e.g., `users/entities/user.entity.ts`)
- DTOs go in `dto/` subfolder (e.g., `auth/dto/login.dto.ts`)
- Providers use `REPOSITORY` constants from `common/constants/app.constants.ts`
- Provider pattern: `{ provide: REPOSITORY.XXX, useValue: EntityClass }`
- Global guards: `JwtAuthGuard`, `PermissionsGuard`, `ThrottlerGuard` (in `app.module.ts`)
- `@Public()` decorator to skip auth on specific routes
- `@CurrentUser()` decorator to get current user from request
- `@RequirePermissions()` decorator for role-based access
- Seeds go in `database/seeds/`
- HTTP-only cookies for JWT tokens, Axios with auto-refresh interceptor

**Frontend (React — `admin/src/`):**
- Pages under `pages/admin/MODULE_NAME/` (uppercase folder names like `USERS/`, `SETTINGS/`, `ROLES/`)
- Sub-components inside `components/` subfolder within each page module
- Barrel exports via `index.js` files
- API endpoints defined in `services/endpoints.js` (single flat object `API`)
- Query keys in `services/queryKeys.js` (single flat object `QUERY_KEY`)
- Axios instance in `services/api.js` with auto-refresh interceptor
- Routes in `routes/routes.jsx` using `PermissionGate` for access control
- `AdminLayout` wrapper for sidebar pages (routes under `/admin/*`)
- Full-screen pages (like POS) render outside `AdminLayout`
- Contexts: `AuthContext`, `SettingsContext` in `context/`
- Hooks: `useAuth`, `useSettings`, `usePermission` in `hooks/`
- State management: React Context + TanStack React Query v5
- Sidebar nav items defined in `layouts/Sidebar.jsx`
- UI components from `components/ui/` (custom Tailwind components)

---

## 2. Architecture & Design Principles

### Server — New Modules to Create

Each new module follows the existing pattern (`users/`, `roles/`, `passkey/` etc.)

```
server/src/
├── (existing modules — DO NOT MODIFY unless noted)
│   ├── auth/
│   ├── common/
│   │   ├── constants/
│   │   │   └── app.constants.ts          ← ADD new REPOSITORY constants here
│   │   ├── decorators/
│   │   ├── dto/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── interfaces/
│   │   ├── services/
│   │   └── utils/
│   ├── config/
│   ├── database/
│   │   ├── database.module.ts            ← ADD new entities to models array
│   │   └── seeds/
│   │       ├── seed-data.ts              ← ADD seed data for groups, taxes, units
│   │       ├── seed.ts
│   │       ├── role-permission.seed.ts   ← ADD new permissions for billing modules
│   │       └── run-seed.ts
│   ├── mfa/
│   ├── passkey/
│   ├── password-history/
│   ├── roles/
│   ├── sessions/
│   ├── users/
│   ├── app.module.ts                     ← IMPORT new modules here
│   └── main.ts
│
├── (NEW modules to create)
│
├── accounting/                            # Double-entry ledger engine
│   ├── dto/
│   │   ├── create-account-group.dto.ts
│   │   ├── update-account-group.dto.ts
│   │   ├── create-ledger-account.dto.ts
│   │   ├── update-ledger-account.dto.ts
│   │   ├── create-journal-entry.dto.ts
│   │   ├── create-financial-year.dto.ts
│   │   └── ledger-query.dto.ts
│   ├── entities/
│   │   ├── account-group.entity.ts
│   │   ├── ledger-account.entity.ts
│   │   ├── journal-entry.entity.ts
│   │   ├── journal-entry-line.entity.ts
│   │   ├── financial-year.entity.ts
│   │   └── number-sequence.entity.ts
│   ├── accounting.module.ts
│   ├── accounting.controller.ts
│   ├── accounting.service.ts
│   └── accounting.provider.ts
│
├── inventory/                             # Products, categories, stock
│   ├── dto/
│   │   ├── create-category.dto.ts
│   │   ├── update-category.dto.ts
│   │   ├── create-unit.dto.ts
│   │   ├── create-hsn-code.dto.ts
│   │   ├── create-product.dto.ts
│   │   ├── update-product.dto.ts
│   │   ├── create-stock-adjustment.dto.ts
│   │   └── product-query.dto.ts
│   ├── entities/
│   │   ├── category.entity.ts
│   │   ├── unit.entity.ts
│   │   ├── hsn-code.entity.ts
│   │   ├── product.entity.ts
│   │   ├── stock-movement.entity.ts
│   │   ├── stock-adjustment.entity.ts
│   │   └── stock-adjustment-item.entity.ts
│   ├── inventory.module.ts
│   ├── inventory.controller.ts
│   ├── inventory.service.ts
│   └── inventory.provider.ts
│
├── parties/                               # Customers & vendors (unified)
│   ├── dto/
│   │   ├── create-party.dto.ts
│   │   ├── update-party.dto.ts
│   │   └── party-query.dto.ts
│   ├── entities/
│   │   └── party.entity.ts
│   ├── parties.module.ts
│   ├── parties.controller.ts
│   ├── parties.service.ts
│   └── parties.provider.ts
│
├── sales/                                 # Invoices, credit notes, quotations
│   ├── dto/
│   │   ├── create-sales-invoice.dto.ts
│   │   ├── create-credit-note.dto.ts
│   │   ├── create-quotation.dto.ts
│   │   ├── update-quotation.dto.ts
│   │   └── sales-query.dto.ts
│   ├── entities/
│   │   ├── sales-invoice.entity.ts
│   │   ├── sales-invoice-item.entity.ts
│   │   ├── credit-note.entity.ts
│   │   ├── credit-note-item.entity.ts
│   │   ├── quotation.entity.ts
│   │   └── quotation-item.entity.ts
│   ├── sales.module.ts
│   ├── sales.controller.ts
│   ├── sales.service.ts
│   └── sales.provider.ts
│
├── purchases/                             # Bills, debit notes, purchase orders
│   ├── dto/
│   │   ├── create-purchase-bill.dto.ts
│   │   ├── create-debit-note.dto.ts
│   │   ├── create-purchase-order.dto.ts
│   │   ├── update-purchase-order.dto.ts
│   │   └── purchase-query.dto.ts
│   ├── entities/
│   │   ├── purchase-bill.entity.ts
│   │   ├── purchase-bill-item.entity.ts
│   │   ├── debit-note.entity.ts
│   │   ├── debit-note-item.entity.ts
│   │   ├── purchase-order.entity.ts
│   │   └── purchase-order-item.entity.ts
│   ├── purchases.module.ts
│   ├── purchases.controller.ts
│   ├── purchases.service.ts
│   └── purchases.provider.ts
│
├── pos/                                   # POS sessions, bill finalization
│   ├── dto/
│   │   ├── open-session.dto.ts
│   │   ├── close-session.dto.ts
│   │   ├── finalize-bill.dto.ts
│   │   ├── hold-bill.dto.ts
│   │   └── process-return.dto.ts
│   ├── entities/
│   │   ├── pos-terminal.entity.ts
│   │   ├── pos-session.entity.ts
│   │   └── held-bill.entity.ts
│   ├── pos.module.ts
│   ├── pos.controller.ts
│   ├── pos.service.ts
│   └── pos.provider.ts
│
├── tax/                                   # GST rates, tax computation, GSTR reports
│   ├── dto/
│   │   ├── create-tax-rate.dto.ts
│   │   ├── update-tax-rate.dto.ts
│   │   └── gst-report-query.dto.ts
│   ├── entities/
│   │   ├── tax-rate.entity.ts
│   │   └── business-settings.entity.ts
│   ├── tax.module.ts
│   ├── tax.controller.ts
│   ├── tax.service.ts
│   └── tax.provider.ts
│
├── banking/                               # Bank accounts, payments, receipts, reconciliation
│   ├── dto/
│   │   ├── create-bank-account.dto.ts
│   │   ├── update-bank-account.dto.ts
│   │   ├── create-payment.dto.ts
│   │   ├── create-receipt.dto.ts
│   │   ├── bank-transfer.dto.ts
│   │   └── reconcile.dto.ts
│   ├── entities/
│   │   ├── bank-account.entity.ts
│   │   ├── payment-receipt.entity.ts
│   │   ├── payment-allocation.entity.ts
│   │   └── bank-transaction.entity.ts
│   ├── banking.module.ts
│   ├── banking.controller.ts
│   ├── banking.service.ts
│   └── banking.provider.ts
│
└── reports/                               # Financial statements, GST summaries
    ├── dto/
    │   └── report-query.dto.ts
    ├── reports.module.ts
    ├── reports.controller.ts
    └── reports.service.ts
```

### Admin (Frontend) — New Pages to Create

Following existing patterns: uppercase folder names, `components/` subfolder, barrel `index.js`.

```
admin/src/
├── (existing — DO NOT MODIFY unless noted)
│   ├── components/
│   │   ├── ui/                            # 30+ existing UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── DatePicker.jsx
│   │   │   ├── Tabs.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── Drawer.jsx
│   │   │   ├── ConfirmModal.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Spinner.jsx
│   │   │   ├── Toast.jsx
│   │   │   ├── ... (and more)
│   │   │   └── index.js
│   │   ├── SettingsDrawer.jsx
│   │   ├── PermissionGate.jsx
│   │   └── CookieBanner.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── SettingsContext.jsx
│   │   └── index.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useSettings.js
│   │   ├── usePermission.js
│   │   └── index.js
│   ├── layouts/
│   │   ├── AdminLayout.jsx
│   │   ├── AuthLayout.jsx
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx                   ← ADD new nav sections here
│   │   └── index.js
│   ├── routes/
│   │   ├── routes.jsx                     ← ADD new routes here
│   │   ├── PrivateRoute.jsx
│   │   ├── PublicRoute.jsx
│   │   ├── RootRedirect.jsx
│   │   └── index.js
│   ├── services/
│   │   ├── api.js                         # Axios instance (no changes needed)
│   │   ├── endpoints.js                   ← ADD new API endpoints here
│   │   ├── queryKeys.js                   ← ADD new query keys here
│   │   └── index.js
│   ├── pages/
│   │   ├── auth/                          # Login, ForgotPassword, etc.
│   │   ├── admin/
│   │   │   ├── DASHBOARD/
│   │   │   │   └── DashboardPage.jsx      ← REWRITE with real metrics
│   │   │   ├── USERS/
│   │   │   ├── ROLES/
│   │   │   ├── SETTINGS/
│   │   │   ├── UI/
│   │   │   └── index.js                   ← ADD new page exports here
│   │   ├── pos/
│   │   │   ├── grid-view/
│   │   │   │   ├── POSPage.jsx            ← REFACTOR: replace localStorage with API
│   │   │   │   ├── hooks/
│   │   │   │   │   └── usePOS.js          ← REFACTOR: replace localStorage with API
│   │   │   │   ├── data/
│   │   │   │   │   └── mockData.js        ← REMOVE after backend integration
│   │   │   │   └── components/
│   │   │   ├── table-view/
│   │   │   │   ├── TablePOSPage.jsx       ← REFACTOR: replace localStorage with API
│   │   │   │   └── components/
│   │   │   └── index.js
│   │   ├── mail-portal/
│   │   └── AccessDeniedPage.jsx
│   ├── config/
│   │   └── colors.js
│   ├── App.jsx
│   └── main.jsx
│
├── (NEW pages to create)
│
│   ├── pages/
│   │   ├── admin/
│   │   │   │
│   │   │   ├── INVENTORY/                 # Inventory management pages
│   │   │   │   ├── ProductsPage.jsx           # Product list with filters
│   │   │   │   ├── CategoriesPage.jsx         # Category tree management
│   │   │   │   ├── UnitsPage.jsx              # Units CRUD
│   │   │   │   ├── StockAdjustmentsPage.jsx   # Adjustment list + create
│   │   │   │   ├── LowStockPage.jsx           # Low stock alert view
│   │   │   │   └── components/
│   │   │   │       ├── ProductForm.jsx            # Add/edit product form
│   │   │   │       ├── ProductDetailPage.jsx      # Product detail + stock history
│   │   │   │       ├── CategoryTree.jsx           # Nested category tree
│   │   │   │       ├── StockAdjustmentForm.jsx    # Create adjustment form
│   │   │   │       └── ProductImport.jsx          # CSV import (future)
│   │   │   │
│   │   │   ├── SALES/                     # Sales management pages
│   │   │   │   ├── InvoicesPage.jsx           # Invoice list with filters
│   │   │   │   ├── CustomersPage.jsx          # Customer list
│   │   │   │   ├── CreditNotesPage.jsx        # Credit note list
│   │   │   │   ├── QuotationsPage.jsx         # Quotation list
│   │   │   │   └── components/
│   │   │   │       ├── InvoiceForm.jsx            # Create/edit sales invoice
│   │   │   │       ├── InvoiceDetailPage.jsx      # Invoice detail + print view
│   │   │   │       ├── InvoicePrintView.jsx       # Print-ready layout
│   │   │   │       ├── CustomerForm.jsx           # Add/edit customer
│   │   │   │       ├── CustomerDetailPage.jsx     # Customer detail + statement
│   │   │   │       ├── CreditNoteForm.jsx         # Create credit note
│   │   │   │       ├── QuotationForm.jsx          # Create/edit quotation
│   │   │   │       └── ItemRowEditor.jsx          # Reusable invoice line editor
│   │   │   │
│   │   │   ├── PURCHASES/                # Purchase management pages
│   │   │   │   ├── BillsPage.jsx              # Purchase bill list
│   │   │   │   ├── VendorsPage.jsx            # Vendor list
│   │   │   │   ├── DebitNotesPage.jsx         # Debit note list
│   │   │   │   ├── PurchaseOrdersPage.jsx     # Purchase order list
│   │   │   │   └── components/
│   │   │   │       ├── PurchaseBillForm.jsx       # Create/edit purchase bill
│   │   │   │       ├── PurchaseBillDetailPage.jsx
│   │   │   │       ├── VendorForm.jsx             # Add/edit vendor
│   │   │   │       ├── VendorDetailPage.jsx       # Vendor detail + statement
│   │   │   │       ├── DebitNoteForm.jsx          # Create debit note
│   │   │   │       ├── PurchaseOrderForm.jsx      # Create/edit PO
│   │   │   │       └── ItemRowEditor.jsx          # Reusable bill line editor
│   │   │   │
│   │   │   ├── ACCOUNTING/               # Accounting & ledger pages
│   │   │   │   ├── ChartOfAccountsPage.jsx    # Account group tree + ledgers
│   │   │   │   ├── JournalEntriesPage.jsx     # Journal entry list
│   │   │   │   ├── TrialBalancePage.jsx       # Trial balance report
│   │   │   │   ├── ProfitAndLossPage.jsx      # P&L statement
│   │   │   │   ├── BalanceSheetPage.jsx       # Balance sheet
│   │   │   │   └── components/
│   │   │   │       ├── LedgerAccountForm.jsx      # Create/edit ledger account
│   │   │   │       ├── LedgerStatementPage.jsx    # Ledger statement view
│   │   │   │       ├── JournalEntryForm.jsx       # Create manual journal entry
│   │   │   │       ├── JournalEntryDetail.jsx     # View journal entry
│   │   │   │       ├── AccountGroupTree.jsx       # Nested group tree
│   │   │   │       └── FinancialYearManager.jsx   # FY create/close
│   │   │   │
│   │   │   ├── BANKING/                   # Bank & cash management pages
│   │   │   │   ├── BankAccountsPage.jsx       # Bank account cards
│   │   │   │   ├── PaymentsPage.jsx           # Payment voucher list
│   │   │   │   ├── ReceiptsPage.jsx           # Receipt voucher list
│   │   │   │   ├── ReconciliationPage.jsx     # Bank reconciliation
│   │   │   │   └── components/
│   │   │   │       ├── BankAccountForm.jsx        # Add/edit bank account
│   │   │   │       ├── BankStatementPage.jsx      # Account statement view
│   │   │   │       ├── PaymentForm.jsx            # Create payment to vendor
│   │   │   │       ├── ReceiptForm.jsx            # Create receipt from customer
│   │   │   │       ├── BankTransferForm.jsx       # Transfer between accounts
│   │   │   │       └── CashBookPage.jsx           # Cash book view
│   │   │   │
│   │   │   ├── TAX/                       # GST & tax management pages
│   │   │   │   ├── TaxRatesPage.jsx           # Tax rate CRUD
│   │   │   │   ├── GSTSummaryPage.jsx         # Input vs output credit
│   │   │   │   ├── GSTR1Page.jsx              # GSTR-1 report
│   │   │   │   ├── GSTR3BPage.jsx             # GSTR-3B report
│   │   │   │   └── components/
│   │   │   │       ├── TaxRateForm.jsx
│   │   │   │       ├── BusinessSettingsForm.jsx   # GSTIN, state, address
│   │   │   │       └── GSTCreditBreakdown.jsx     # Detailed credit view
│   │   │   │
│   │   │   └── index.js                   ← ADD all new page exports
```

### Files to Modify (Existing)

| File | What to Change |
|------|---------------|
| `server/src/app.module.ts` | Import all 8 new modules into `imports[]` |
| `server/src/common/constants/app.constants.ts` | Add ~30 new `REPOSITORY` constants |
| `server/src/database/database.module.ts` | Add all new entities to Sequelize `models[]` |
| `server/src/database/seeds/seed-data.ts` | Add seed data: account groups, system ledgers, tax rates, default units |
| `server/src/database/seeds/role-permission.seed.ts` | Add permissions: `inventory:read`, `sales:create`, `accounting:read`, etc. |
| `admin/src/services/endpoints.js` | Add all new API endpoint constants |
| `admin/src/services/queryKeys.js` | Add all new query key constants |
| `admin/src/routes/routes.jsx` | Add routes for all new pages under `/admin/*` |
| `admin/src/layouts/Sidebar.jsx` | Add nav sections: Inventory, Sales, Purchases, Accounting, Banking, Tax |
| `admin/src/pages/admin/index.js` | Export all new page components |
| `admin/src/pages/admin/DASHBOARD/DashboardPage.jsx` | Rewrite with real metrics from API |
| `admin/src/pages/pos/grid-view/hooks/usePOS.js` | Replace localStorage with API calls |
| `admin/src/pages/pos/grid-view/POSPage.jsx` | Add session management, replace mock data |
| `admin/src/pages/pos/table-view/TablePOSPage.jsx` | Same refactor as grid view |

### Core Design Rules

1. **Every financial transaction produces a journal entry** — sales, purchases, payments, receipts all auto-generate double-entry records
2. **Stock movements are atomic** — every stock change (sale, purchase, adjustment, return) creates a `stock_movement` record
3. **Tax is always computed, never hardcoded** — tax rates come from the `tax_rates` table, tied to HSN/SAC codes
4. **All monetary values stored as DECIMAL(15,2)** — no floating point
5. **Soft deletes** — financial records are never hard-deleted; use `is_cancelled` or `is_deleted` flags
6. **Audit trail** — `created_by`, `updated_by`, `created_at`, `updated_at` on every table
7. **Financial year awareness** — all reports and sequences are scoped to the active financial year

---

## 3. Database Schema

### 3.1 Accounting Core Tables

#### `account_groups`
Top-level classification for the chart of accounts.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| name | VARCHAR(100) | e.g., "Current Assets", "Revenue" |
| parent_id | UUID | FK → self (nullable, for sub-groups) |
| nature | ENUM | `assets`, `liabilities`, `income`, `expense`, `equity` |
| is_system | BOOLEAN | `true` for default groups that cannot be deleted |
| sequence | INTEGER | Display order |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Entity:** `server/src/accounting/entities/account-group.entity.ts`

**Default Account Groups (seeded via `server/src/database/seeds/seed-data.ts`):**

```
Assets (nature: assets)
├── Current Assets
│   ├── Cash & Bank
│   ├── Accounts Receivable (Sundry Debtors)
│   ├── Inventory / Stock-in-Hand
│   └── GST Input Credit
├── Fixed Assets
Liabilities (nature: liabilities)
├── Current Liabilities
│   ├── Accounts Payable (Sundry Creditors)
│   ├── GST Output Liability
│   ├── Duties & Taxes
│   └── Other Current Liabilities
├── Long-term Liabilities
Income (nature: income)
├── Direct Income (Sales)
├── Indirect Income
Expenses (nature: expense)
├── Direct Expenses (Purchases / Cost of Goods Sold)
├── Indirect Expenses
Equity (nature: equity)
├── Capital Account
├── Reserves & Surplus
```

#### `ledger_accounts`
Individual ledger accounts (the chart of accounts).

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| name | VARCHAR(150) | e.g., "SBI Current Account", "Cash in Hand" |
| code | VARCHAR(20) | Optional account code, unique |
| group_id | UUID | FK → account_groups |
| opening_balance | DECIMAL(15,2) | Balance at financial year start |
| opening_balance_type | ENUM | `debit`, `credit` |
| description | TEXT | |
| is_system | BOOLEAN | `true` for auto-created accounts (e.g., GST accounts) |
| is_active | BOOLEAN | |
| created_by | UUID | FK → users |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Entity:** `server/src/accounting/entities/ledger-account.entity.ts`

**System Ledger Accounts (auto-created via seed):**

| Account Name | Group | Purpose |
|---|---|---|
| Cash in Hand | Cash & Bank | Default cash account |
| Sales Account | Direct Income | Revenue from sales |
| Purchase Account | Direct Expenses | Cost of purchases |
| CGST Input | GST Input Credit | Central GST paid on purchases |
| SGST Input | GST Input Credit | State GST paid on purchases |
| IGST Input | GST Input Credit | Integrated GST paid on purchases |
| CGST Output | GST Output Liability | Central GST collected on sales |
| SGST Output | GST Output Liability | State GST collected on sales |
| IGST Output | GST Output Liability | Integrated GST collected on sales |
| Discount Allowed | Indirect Expenses | Discounts given to customers |
| Discount Received | Indirect Income | Discounts received from vendors |
| Round Off | Indirect Expenses | Rounding adjustments |
| Stock-in-Hand | Inventory | Inventory value account |

#### `journal_entries`
Header for each journal entry (a single transaction).

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| entry_number | VARCHAR(30) | Auto-generated, e.g., `JE-2026-0001` |
| date | DATE | Transaction date |
| narration | TEXT | Description of the transaction |
| reference_type | ENUM | `sales_invoice`, `purchase_bill`, `payment`, `receipt`, `pos_bill`, `credit_note`, `debit_note`, `manual`, `stock_adjustment` |
| reference_id | UUID | FK → the source document |
| is_auto_generated | BOOLEAN | `true` if system-generated from invoice/payment |
| is_cancelled | BOOLEAN | Default `false` |
| financial_year | VARCHAR(10) | e.g., `2025-26` |
| total_amount | DECIMAL(15,2) | Sum of debit side (= sum of credit side) |
| created_by | UUID | FK → users |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Entity:** `server/src/accounting/entities/journal-entry.entity.ts`

#### `journal_entry_lines`
Individual debit/credit lines within a journal entry.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| journal_entry_id | UUID | FK → journal_entries |
| ledger_account_id | UUID | FK → ledger_accounts |
| debit | DECIMAL(15,2) | Amount debited (0 if credit line) |
| credit | DECIMAL(15,2) | Amount credited (0 if debit line) |
| description | VARCHAR(255) | Optional line-level note |
| created_at | TIMESTAMP | |

**Entity:** `server/src/accounting/entities/journal-entry-line.entity.ts`

**Constraint:** For every `journal_entry_id`, `SUM(debit) = SUM(credit)`. Enforce at application level and with a database trigger.

#### `financial_years`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| name | VARCHAR(10) | e.g., `2025-26` |
| start_date | DATE | e.g., `2025-04-01` |
| end_date | DATE | e.g., `2026-03-31` |
| is_active | BOOLEAN | Only one active at a time |
| is_closed | BOOLEAN | Once closed, no new entries |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Entity:** `server/src/accounting/entities/financial-year.entity.ts`

#### `number_sequences`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| document_type | ENUM | `sales_invoice`, `purchase_bill`, `credit_note`, `debit_note`, `payment`, `receipt`, `journal_entry`, `quotation`, `purchase_order`, `stock_adjustment` |
| prefix | VARCHAR(10) | e.g., "INV", "PB", "CN" |
| financial_year | VARCHAR(10) | e.g., `2025-26` |
| last_number | INTEGER | Current counter |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Entity:** `server/src/accounting/entities/number-sequence.entity.ts`

---

### 3.2 Inventory Tables

#### `categories`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| name | VARCHAR(100) | |
| parent_id | UUID | FK → self (nullable, for sub-categories) |
| description | TEXT | |
| image_url | VARCHAR(500) | |
| is_active | BOOLEAN | Default `true` |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Entity:** `server/src/inventory/entities/category.entity.ts`

#### `units`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| name | VARCHAR(50) | e.g., "Pieces", "Kilograms" |
| short_name | VARCHAR(10) | e.g., "PCS", "KG" |
| is_active | BOOLEAN | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Entity:** `server/src/inventory/entities/unit.entity.ts`

#### `hsn_codes`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| code | VARCHAR(10) | HSN/SAC code, unique |
| description | TEXT | |
| tax_rate_id | UUID | FK → tax_rates (default tax rate for this HSN) |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Entity:** `server/src/inventory/entities/hsn-code.entity.ts`

#### `products`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| name | VARCHAR(200) | |
| sku | VARCHAR(50) | Stock Keeping Unit, unique |
| barcode | VARCHAR(50) | Barcode number, unique, nullable |
| category_id | UUID | FK → categories |
| unit_id | UUID | FK → units |
| hsn_code_id | UUID | FK → hsn_codes (nullable) |
| tax_rate_id | UUID | FK → tax_rates (overrides HSN default if set) |
| purchase_price | DECIMAL(15,2) | Default purchase/cost price |
| selling_price | DECIMAL(15,2) | Default selling / MRP |
| wholesale_price | DECIMAL(15,2) | Nullable |
| minimum_stock | DECIMAL(15,3) | Low stock alert threshold |
| opening_stock | DECIMAL(15,3) | Stock at setup time |
| current_stock | DECIMAL(15,3) | Computed from movements, cached here |
| description | TEXT | |
| image_url | VARCHAR(500) | |
| is_active | BOOLEAN | Default `true` |
| created_by | UUID | FK → users |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Entity:** `server/src/inventory/entities/product.entity.ts`

#### `stock_movements`
Immutable log of every stock change.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| product_id | UUID | FK → products |
| movement_type | ENUM | `purchase`, `sale`, `return_in`, `return_out`, `adjustment_in`, `adjustment_out`, `opening` |
| quantity | DECIMAL(15,3) | Always positive |
| reference_type | ENUM | `sales_invoice_item`, `purchase_bill_item`, `credit_note_item`, `debit_note_item`, `stock_adjustment`, `opening` |
| reference_id | UUID | FK → source document item |
| unit_cost | DECIMAL(15,2) | Cost per unit at time of movement |
| stock_before | DECIMAL(15,3) | Stock level before this movement |
| stock_after | DECIMAL(15,3) | Stock level after this movement |
| notes | TEXT | |
| created_by | UUID | FK → users |
| created_at | TIMESTAMP | |

**Entity:** `server/src/inventory/entities/stock-movement.entity.ts`

#### `stock_adjustments`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| adjustment_number | VARCHAR(30) | Auto-generated, e.g., `ADJ-0001` |
| date | DATE | |
| reason | TEXT | |
| journal_entry_id | UUID | FK → journal_entries (for accounting impact) |
| created_by | UUID | FK → users |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Entity:** `server/src/inventory/entities/stock-adjustment.entity.ts`

#### `stock_adjustment_items`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| stock_adjustment_id | UUID | FK → stock_adjustments |
| product_id | UUID | FK → products |
| adjustment_type | ENUM | `increase`, `decrease` |
| quantity | DECIMAL(15,3) | |
| unit_cost | DECIMAL(15,2) | Value per unit for accounting entry |
| created_at | TIMESTAMP | |

**Entity:** `server/src/inventory/entities/stock-adjustment-item.entity.ts`

---

### 3.3 Party Tables (Customers & Vendors)

#### `parties`
Unified table for both customers and vendors (a party can be both).

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| name | VARCHAR(200) | |
| type | ENUM | `customer`, `vendor`, `both` |
| gstin | VARCHAR(15) | GST Identification Number, nullable |
| pan | VARCHAR(10) | PAN number, nullable |
| phone | VARCHAR(15) | |
| email | VARCHAR(100) | |
| billing_address | JSONB | `{ line1, line2, city, state, state_code, pincode }` |
| shipping_address | JSONB | Same structure, nullable |
| state_code | VARCHAR(2) | 2-digit state code for GST (e.g., "27" for Maharashtra) |
| credit_limit | DECIMAL(15,2) | Nullable |
| credit_period_days | INTEGER | Default payment terms |
| opening_balance | DECIMAL(15,2) | Default 0 |
| opening_balance_type | ENUM | `debit`, `credit` |
| ledger_account_id | UUID | FK → ledger_accounts (auto-created in Sundry Debtors or Creditors) |
| is_active | BOOLEAN | Default `true` |
| created_by | UUID | FK → users |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Entity:** `server/src/parties/entities/party.entity.ts`

**Note:** When a party is created, `parties.service.ts` automatically creates a corresponding `ledger_account` under "Sundry Debtors" (customer) or "Sundry Creditors" (vendor) group.

---

### 3.4 Sales Tables

#### `sales_invoices`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| invoice_number | VARCHAR(30) | Auto-generated, e.g., `INV-2526-0001` |
| date | DATE | Invoice date |
| due_date | DATE | Payment due date |
| party_id | UUID | FK → parties (customer) |
| billing_address | JSONB | Snapshot from party at time of invoice |
| shipping_address | JSONB | |
| place_of_supply | VARCHAR(2) | State code — determines IGST vs CGST+SGST |
| subtotal | DECIMAL(15,2) | Sum of line totals before tax |
| discount_amount | DECIMAL(15,2) | Invoice-level discount |
| taxable_amount | DECIMAL(15,2) | Subtotal − discount |
| cgst_amount | DECIMAL(15,2) | |
| sgst_amount | DECIMAL(15,2) | |
| igst_amount | DECIMAL(15,2) | |
| cess_amount | DECIMAL(15,2) | Default 0 |
| total_tax | DECIMAL(15,2) | CGST + SGST + IGST + Cess |
| round_off | DECIMAL(15,2) | |
| grand_total | DECIMAL(15,2) | Final invoice amount |
| amount_paid | DECIMAL(15,2) | Sum of linked payments |
| balance_due | DECIMAL(15,2) | grand_total − amount_paid |
| payment_status | ENUM | `unpaid`, `partial`, `paid` |
| notes | TEXT | |
| terms | TEXT | Terms & conditions |
| source | ENUM | `sales`, `pos` — origin of the invoice |
| is_cancelled | BOOLEAN | Default `false` |
| journal_entry_id | UUID | FK → journal_entries |
| financial_year | VARCHAR(10) | |
| created_by | UUID | FK → users |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Entity:** `server/src/sales/entities/sales-invoice.entity.ts`

#### `sales_invoice_items`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| sales_invoice_id | UUID | FK → sales_invoices |
| product_id | UUID | FK → products |
| description | VARCHAR(255) | Optional override of product name |
| hsn_code | VARCHAR(10) | Snapshot from product |
| quantity | DECIMAL(15,3) | |
| unit_id | UUID | FK → units |
| unit_price | DECIMAL(15,2) | Price per unit |
| discount_percent | DECIMAL(5,2) | Line-level discount % |
| discount_amount | DECIMAL(15,2) | Computed discount value |
| taxable_amount | DECIMAL(15,2) | (qty × unit_price) − discount |
| tax_rate | DECIMAL(5,2) | GST rate applied (e.g., 18.00) |
| cgst_rate | DECIMAL(5,2) | Half of GST rate for intra-state |
| cgst_amount | DECIMAL(15,2) | |
| sgst_rate | DECIMAL(5,2) | |
| sgst_amount | DECIMAL(15,2) | |
| igst_rate | DECIMAL(5,2) | Full GST rate for inter-state |
| igst_amount | DECIMAL(15,2) | |
| total | DECIMAL(15,2) | taxable + all taxes |
| created_at | TIMESTAMP | |

**Entity:** `server/src/sales/entities/sales-invoice-item.entity.ts`

#### `credit_notes` (Sales Returns)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| credit_note_number | VARCHAR(30) | Auto-generated, e.g., `CN-2526-0001` |
| date | DATE | |
| original_invoice_id | UUID | FK → sales_invoices |
| party_id | UUID | FK → parties |
| reason | TEXT | |
| subtotal | DECIMAL(15,2) | |
| cgst_amount | DECIMAL(15,2) | |
| sgst_amount | DECIMAL(15,2) | |
| igst_amount | DECIMAL(15,2) | |
| total_tax | DECIMAL(15,2) | |
| grand_total | DECIMAL(15,2) | |
| is_cancelled | BOOLEAN | |
| journal_entry_id | UUID | FK → journal_entries |
| financial_year | VARCHAR(10) | |
| created_by | UUID | FK → users |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Entity:** `server/src/sales/entities/credit-note.entity.ts`

#### `credit_note_items`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| credit_note_id | UUID | FK → credit_notes |
| product_id | UUID | FK → products |
| quantity | DECIMAL(15,3) | Quantity returned |
| unit_price | DECIMAL(15,2) | Same as original invoice line |
| taxable_amount | DECIMAL(15,2) | |
| cgst_amount | DECIMAL(15,2) | |
| sgst_amount | DECIMAL(15,2) | |
| igst_amount | DECIMAL(15,2) | |
| total | DECIMAL(15,2) | |
| created_at | TIMESTAMP | |

**Entity:** `server/src/sales/entities/credit-note-item.entity.ts`

#### `quotations`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| quotation_number | VARCHAR(30) | |
| date | DATE | |
| valid_until | DATE | Expiry date |
| party_id | UUID | FK → parties |
| subtotal | DECIMAL(15,2) | |
| total_tax | DECIMAL(15,2) | |
| grand_total | DECIMAL(15,2) | |
| status | ENUM | `draft`, `sent`, `accepted`, `rejected`, `expired`, `converted` |
| converted_to_invoice_id | UUID | FK → sales_invoices, nullable |
| notes | TEXT | |
| terms | TEXT | |
| financial_year | VARCHAR(10) | |
| created_by | UUID | FK → users |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Entity:** `server/src/sales/entities/quotation.entity.ts`

#### `quotation_items`

Same structure as `sales_invoice_items` but with FK to `quotation_id`.

**Entity:** `server/src/sales/entities/quotation-item.entity.ts`

---

### 3.5 Purchase Tables

#### `purchase_bills`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| bill_number | VARCHAR(30) | Auto-generated internal reference, e.g., `PB-2526-0001` |
| vendor_bill_number | VARCHAR(50) | Vendor's own invoice number |
| date | DATE | Bill date |
| due_date | DATE | |
| party_id | UUID | FK → parties (vendor) |
| place_of_supply | VARCHAR(2) | |
| subtotal | DECIMAL(15,2) | |
| discount_amount | DECIMAL(15,2) | |
| taxable_amount | DECIMAL(15,2) | |
| cgst_amount | DECIMAL(15,2) | |
| sgst_amount | DECIMAL(15,2) | |
| igst_amount | DECIMAL(15,2) | |
| cess_amount | DECIMAL(15,2) | |
| total_tax | DECIMAL(15,2) | |
| round_off | DECIMAL(15,2) | |
| grand_total | DECIMAL(15,2) | |
| amount_paid | DECIMAL(15,2) | |
| balance_due | DECIMAL(15,2) | |
| payment_status | ENUM | `unpaid`, `partial`, `paid` |
| notes | TEXT | |
| is_cancelled | BOOLEAN | |
| journal_entry_id | UUID | FK → journal_entries |
| financial_year | VARCHAR(10) | |
| created_by | UUID | FK → users |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Entity:** `server/src/purchases/entities/purchase-bill.entity.ts`

#### `purchase_bill_items`

Same structure as `sales_invoice_items` but with FK to `purchase_bill_id`.

**Entity:** `server/src/purchases/entities/purchase-bill-item.entity.ts`

#### `debit_notes` (Purchase Returns)

Same structure as `credit_notes` but for purchase returns, with FK `original_bill_id` → `purchase_bills`.

**Entity:** `server/src/purchases/entities/debit-note.entity.ts`

#### `debit_note_items`

**Entity:** `server/src/purchases/entities/debit-note-item.entity.ts`

#### `purchase_orders`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| po_number | VARCHAR(30) | |
| date | DATE | |
| expected_date | DATE | Expected delivery |
| party_id | UUID | FK → parties (vendor) |
| subtotal | DECIMAL(15,2) | |
| total_tax | DECIMAL(15,2) | |
| grand_total | DECIMAL(15,2) | |
| status | ENUM | `draft`, `sent`, `partial`, `received`, `cancelled` |
| notes | TEXT | |
| financial_year | VARCHAR(10) | |
| created_by | UUID | FK → users |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Entity:** `server/src/purchases/entities/purchase-order.entity.ts`

#### `purchase_order_items`

**Entity:** `server/src/purchases/entities/purchase-order-item.entity.ts`

---

### 3.6 POS Tables

#### `pos_terminals`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| name | VARCHAR(50) | e.g., "Counter 1" |
| is_active | BOOLEAN | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Entity:** `server/src/pos/entities/pos-terminal.entity.ts`

#### `pos_sessions`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| terminal_id | UUID | FK → pos_terminals |
| user_id | UUID | FK → users |
| opening_cash | DECIMAL(15,2) | Cash in drawer at start |
| closing_cash | DECIMAL(15,2) | Cash in drawer at close |
| expected_cash | DECIMAL(15,2) | Computed expected amount |
| cash_difference | DECIMAL(15,2) | closing − expected |
| status | ENUM | `open`, `closed` |
| opened_at | TIMESTAMP | |
| closed_at | TIMESTAMP | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Entity:** `server/src/pos/entities/pos-session.entity.ts`

#### `held_bills`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| pos_session_id | UUID | FK → pos_sessions |
| customer_name | VARCHAR(200) | Quick reference (not necessarily a party) |
| items | JSONB | Array of `{ product_id, name, qty, price, discount }` |
| notes | TEXT | |
| held_at | TIMESTAMP | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Entity:** `server/src/pos/entities/held-bill.entity.ts`

**Note:** When a POS bill is finalized, `pos.service.ts` creates a `sales_invoice` with `source = 'pos'` and generates corresponding journal entries and stock movements. Held bills remain in `held_bills` until recalled and finalized.

---

### 3.7 Banking & Payment Tables

#### `bank_accounts`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| account_name | VARCHAR(150) | e.g., "SBI Current Account" |
| account_number | VARCHAR(30) | |
| bank_name | VARCHAR(100) | |
| branch | VARCHAR(100) | |
| ifsc_code | VARCHAR(11) | |
| account_type | ENUM | `current`, `savings`, `cash`, `wallet` |
| opening_balance | DECIMAL(15,2) | |
| current_balance | DECIMAL(15,2) | Updated with each transaction |
| ledger_account_id | UUID | FK → ledger_accounts (auto-created in Cash & Bank group) |
| is_default | BOOLEAN | Default account for transactions |
| is_active | BOOLEAN | |
| created_by | UUID | FK → users |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Entity:** `server/src/banking/entities/bank-account.entity.ts`

**Note:** When a bank account is created, `banking.service.ts` auto-creates a `ledger_account` under the "Cash & Bank" group.

#### `payment_receipts`
Records actual money movement (paying a vendor or receiving from a customer).

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| voucher_number | VARCHAR(30) | Auto-generated, e.g., `PMT-2526-0001` or `RCT-2526-0001` |
| type | ENUM | `payment`, `receipt` |
| date | DATE | |
| party_id | UUID | FK → parties |
| bank_account_id | UUID | FK → bank_accounts |
| amount | DECIMAL(15,2) | |
| payment_mode | ENUM | `cash`, `bank_transfer`, `cheque`, `upi`, `card`, `other` |
| cheque_number | VARCHAR(20) | Nullable |
| cheque_date | DATE | Nullable |
| transaction_ref | VARCHAR(50) | UTR/Transaction reference |
| narration | TEXT | |
| journal_entry_id | UUID | FK → journal_entries |
| financial_year | VARCHAR(10) | |
| is_cancelled | BOOLEAN | |
| created_by | UUID | FK → users |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Entity:** `server/src/banking/entities/payment-receipt.entity.ts`

#### `payment_allocations`
Links a payment/receipt to specific invoices/bills.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| payment_receipt_id | UUID | FK → payment_receipts |
| document_type | ENUM | `sales_invoice`, `purchase_bill`, `credit_note`, `debit_note` |
| document_id | UUID | FK → the document |
| amount | DECIMAL(15,2) | Amount allocated to this document |
| created_at | TIMESTAMP | |

**Entity:** `server/src/banking/entities/payment-allocation.entity.ts`

#### `bank_transactions`
All bank/cash account movements.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| bank_account_id | UUID | FK → bank_accounts |
| date | DATE | |
| type | ENUM | `credit`, `debit` |
| amount | DECIMAL(15,2) | |
| balance_after | DECIMAL(15,2) | Running balance |
| reference_type | ENUM | `payment_receipt`, `pos_bill`, `manual`, `transfer`, `opening` |
| reference_id | UUID | |
| description | VARCHAR(255) | |
| is_reconciled | BOOLEAN | For bank reconciliation |
| reconciled_date | DATE | |
| created_at | TIMESTAMP | |

**Entity:** `server/src/banking/entities/bank-transaction.entity.ts`

---

### 3.8 Tax / GST Tables

#### `tax_rates`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| name | VARCHAR(50) | e.g., "GST 18%", "GST 5%", "Exempt" |
| rate | DECIMAL(5,2) | Total GST percentage (e.g., 18.00) |
| cgst_rate | DECIMAL(5,2) | Half of rate (e.g., 9.00) |
| sgst_rate | DECIMAL(5,2) | Half of rate (e.g., 9.00) |
| igst_rate | DECIMAL(5,2) | Same as rate (e.g., 18.00) |
| cess_rate | DECIMAL(5,2) | Additional cess, default 0 |
| is_active | BOOLEAN | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Entity:** `server/src/tax/entities/tax-rate.entity.ts`

**Default Tax Rates (seeded via `server/src/database/seeds/seed-data.ts`):**

| Name | Rate | CGST | SGST | IGST |
|------|------|------|------|------|
| Exempt | 0% | 0 | 0 | 0 |
| GST 5% | 5% | 2.5 | 2.5 | 5 |
| GST 12% | 12% | 6 | 6 | 12 |
| GST 18% | 18% | 9 | 9 | 18 |
| GST 28% | 28% | 14 | 14 | 28 |

#### `business_settings`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| business_name | VARCHAR(200) | |
| gstin | VARCHAR(15) | Business GSTIN |
| pan | VARCHAR(10) | |
| state_code | VARCHAR(2) | Home state code — determines intra vs inter-state |
| address | JSONB | `{ line1, line2, city, state, pincode }` |
| phone | VARCHAR(15) | |
| email | VARCHAR(100) | |
| logo_url | VARCHAR(500) | |
| invoice_prefix | VARCHAR(10) | Default "INV" |
| financial_year_start_month | INTEGER | Default 4 (April) |
| currency_code | VARCHAR(3) | Default "INR" |
| decimal_places | INTEGER | Default 2 |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

**Entity:** `server/src/tax/entities/business-settings.entity.ts`

---

## 4. Module 1 — Accounting Core (Ledgers & Double-Entry)

### Why This Comes First

Every other module (sales, purchases, payments, POS) generates accounting entries. The accounting core must exist before any transaction module can function.

### Backend Implementation

**Files to create:**
- `server/src/accounting/entities/account-group.entity.ts`
- `server/src/accounting/entities/ledger-account.entity.ts`
- `server/src/accounting/entities/journal-entry.entity.ts`
- `server/src/accounting/entities/journal-entry-line.entity.ts`
- `server/src/accounting/entities/financial-year.entity.ts`
- `server/src/accounting/entities/number-sequence.entity.ts`
- `server/src/accounting/dto/create-account-group.dto.ts`
- `server/src/accounting/dto/update-account-group.dto.ts`
- `server/src/accounting/dto/create-ledger-account.dto.ts`
- `server/src/accounting/dto/update-ledger-account.dto.ts`
- `server/src/accounting/dto/create-journal-entry.dto.ts`
- `server/src/accounting/dto/create-financial-year.dto.ts`
- `server/src/accounting/dto/ledger-query.dto.ts`
- `server/src/accounting/accounting.provider.ts`
- `server/src/accounting/accounting.service.ts`
- `server/src/accounting/accounting.controller.ts`
- `server/src/accounting/accounting.module.ts`

**Files to modify:**
- `server/src/common/constants/app.constants.ts` — add `ACCOUNT_GROUPS`, `LEDGER_ACCOUNTS`, `JOURNAL_ENTRIES`, `JOURNAL_ENTRY_LINES`, `FINANCIAL_YEARS`, `NUMBER_SEQUENCES` to `REPOSITORY`
- `server/src/database/database.module.ts` — add entities to `models[]`
- `server/src/app.module.ts` — import `AccountingModule`
- `server/src/database/seeds/seed-data.ts` — add account groups + system ledger data

#### Service: `AccountingService`

```
createAccountGroup(dto)          → Creates an account group
getAccountGroupTree()            → Returns hierarchical group tree
createLedgerAccount(dto)         → Creates a ledger account
getLedgerAccounts(filters)       → List with pagination, search, group filter
getLedgerBalance(id, dateRange)  → Compute balance from journal lines
getLedgerStatement(id, dateRange)→ All journal lines for a ledger, running balance

createJournalEntry(dto)          → Validates debit=credit, creates entry + lines
cancelJournalEntry(id)           → Marks entry as cancelled, creates reversal entry
getJournalEntries(filters)       → List with pagination, date range, type filter

getTrialBalance(asOfDate)        → All ledger balances organized by group
getProfitAndLoss(dateRange)      → Income − Expenses for the period
getBalanceSheet(asOfDate)        → Assets, Liabilities, Equity as of date

// Internal helper — called by sales, purchase, banking modules
createAutoJournalEntry(data: {
  date, narration, referenceType, referenceId,
  lines: { ledgerAccountId, debit, credit }[]
}) → JournalEntry
```

#### Service: `FinancialYearService` (inside accounting module)

```
createFinancialYear(dto)
getActiveFinancialYear()
closeFinancialYear(id)           → Prevents new entries, carries forward balances
getNextNumber(documentType)      → Atomic increment of number_sequences
```

#### Accounting Entry Templates

Every transaction in the system follows a predefined journal entry template:

**Sales Invoice (intra-state):**
```
Dr  Accounts Receivable (Customer)    Grand Total
    Cr  Sales Account                     Taxable Amount
    Cr  CGST Output                       CGST Amount
    Cr  SGST Output                       SGST Amount
```

**Sales Invoice (inter-state):**
```
Dr  Accounts Receivable (Customer)    Grand Total
    Cr  Sales Account                     Taxable Amount
    Cr  IGST Output                       IGST Amount
```

**Purchase Bill (intra-state):**
```
Dr  Purchase Account                  Taxable Amount
Dr  CGST Input                        CGST Amount
Dr  SGST Input                        SGST Amount
    Cr  Accounts Payable (Vendor)         Grand Total
```

**Purchase Bill (inter-state):**
```
Dr  Purchase Account                  Taxable Amount
Dr  IGST Input                        IGST Amount
    Cr  Accounts Payable (Vendor)         Grand Total
```

**Payment to Vendor:**
```
Dr  Accounts Payable (Vendor)         Amount
    Cr  Bank/Cash Account                 Amount
```

**Receipt from Customer:**
```
Dr  Bank/Cash Account                 Amount
    Cr  Accounts Receivable (Customer)    Amount
```

**Credit Note (Sales Return):**
```
Dr  Sales Account                     Taxable Amount
Dr  CGST Output                       CGST Amount
Dr  SGST Output                       SGST Amount
    Cr  Accounts Receivable (Customer)    Grand Total
```

**Debit Note (Purchase Return):**
```
Dr  Accounts Payable (Vendor)         Grand Total
    Cr  Purchase Account                  Taxable Amount
    Cr  CGST Input                        CGST Amount
    Cr  SGST Input                        SGST Amount
```

**Stock Adjustment (Increase):**
```
Dr  Stock-in-Hand                     Value
    Cr  Stock Adjustment Account          Value
```

**Stock Adjustment (Decrease):**
```
Dr  Stock Adjustment Account          Value
    Cr  Stock-in-Hand                     Value
```

**POS Cash Sale:**
```
Dr  Cash in Hand                      Grand Total
    Cr  Sales Account                     Taxable Amount
    Cr  CGST Output                       CGST Amount
    Cr  SGST Output                       SGST Amount
```

**POS Card/UPI Sale:**
```
Dr  Bank Account                      Grand Total
    Cr  Sales Account                     Taxable Amount
    Cr  CGST Output                       CGST Amount
    Cr  SGST Output                       SGST Amount
```

### Database Seeding

File: `server/src/database/seeds/seed-data.ts` — add to existing seed data:

1. Default account groups (the tree listed in section 3.1)
2. System ledger accounts (Cash in Hand, Sales, Purchase, GST accounts, etc.)
3. Default tax rates (Exempt, 5%, 12%, 18%, 28%)
4. Default units (Pieces, Kilograms, Liters, Meters, Box, Pack, Dozen)
5. Number sequences for all document types
6. Business settings template

File: `server/src/database/seeds/role-permission.seed.ts` — add permissions:

```
accounting:read, accounting:create, accounting:update
inventory:read, inventory:create, inventory:update, inventory:delete
sales:read, sales:create, sales:update, sales:cancel
purchases:read, purchases:create, purchases:update, purchases:cancel
pos:access, pos:manage_terminals, pos:view_reports
banking:read, banking:create, banking:reconcile
tax:read, tax:update, tax:reports
reports:read, reports:export
business_settings:read, business_settings:update
```

### Frontend Pages

**Files to create:**
- `admin/src/pages/admin/ACCOUNTING/ChartOfAccountsPage.jsx`
- `admin/src/pages/admin/ACCOUNTING/JournalEntriesPage.jsx`
- `admin/src/pages/admin/ACCOUNTING/TrialBalancePage.jsx`
- `admin/src/pages/admin/ACCOUNTING/ProfitAndLossPage.jsx`
- `admin/src/pages/admin/ACCOUNTING/BalanceSheetPage.jsx`
- `admin/src/pages/admin/ACCOUNTING/components/LedgerAccountForm.jsx`
- `admin/src/pages/admin/ACCOUNTING/components/LedgerStatementPage.jsx`
- `admin/src/pages/admin/ACCOUNTING/components/JournalEntryForm.jsx`
- `admin/src/pages/admin/ACCOUNTING/components/JournalEntryDetail.jsx`
- `admin/src/pages/admin/ACCOUNTING/components/AccountGroupTree.jsx`
- `admin/src/pages/admin/ACCOUNTING/components/FinancialYearManager.jsx`

**Files to modify:**
- `admin/src/services/endpoints.js` — add accounting endpoints
- `admin/src/services/queryKeys.js` — add accounting query keys
- `admin/src/routes/routes.jsx` — add accounting routes under `/admin/*`
- `admin/src/layouts/Sidebar.jsx` — add Accounting nav section
- `admin/src/pages/admin/index.js` — export accounting pages

**Page descriptions:**

- **Chart of Accounts (`/admin/accounting/chart-of-accounts`)** — Tree view of groups + ledgers, search, create/edit accounts
- **Ledger Statement (`/admin/accounting/ledger/:id`)** — Date range, table (Date | Voucher # | Narration | Dr | Cr | Balance), export
- **Journal Entries (`/admin/accounting/journal-entries`)** — List with filters, create manual entry, view detail
- **Trial Balance (`/admin/accounting/trial-balance`)** — As-of date, grouped table, totals
- **Profit & Loss (`/admin/accounting/profit-and-loss`)** — Date range, income vs expenses, net profit/loss
- **Balance Sheet (`/admin/accounting/balance-sheet`)** — As-of date, Assets = Liabilities + Equity

---

## 5. Module 2 — Inventory Management

### Backend Implementation

**Files to create:**
- `server/src/inventory/entities/category.entity.ts`
- `server/src/inventory/entities/unit.entity.ts`
- `server/src/inventory/entities/hsn-code.entity.ts`
- `server/src/inventory/entities/product.entity.ts`
- `server/src/inventory/entities/stock-movement.entity.ts`
- `server/src/inventory/entities/stock-adjustment.entity.ts`
- `server/src/inventory/entities/stock-adjustment-item.entity.ts`
- `server/src/inventory/dto/*.dto.ts` (as listed in section 2)
- `server/src/inventory/inventory.provider.ts`
- `server/src/inventory/inventory.service.ts`
- `server/src/inventory/inventory.controller.ts`
- `server/src/inventory/inventory.module.ts`

**Files to modify:**
- `server/src/common/constants/app.constants.ts` — add `CATEGORIES`, `UNITS`, `HSN_CODES`, `PRODUCTS`, `STOCK_MOVEMENTS`, `STOCK_ADJUSTMENTS`, `STOCK_ADJUSTMENT_ITEMS`
- `server/src/database/database.module.ts` — add entities
- `server/src/app.module.ts` — import `InventoryModule`

#### Service: `InventoryService`

```
// Categories
createCategory(dto), getCategories(filters), updateCategory(id, dto), deleteCategory(id)

// Units
createUnit(dto), getUnits(), updateUnit(id, dto)

// HSN Codes
createHsnCode(dto), getHsnCodes(filters), updateHsnCode(id, dto)

// Products
createProduct(dto)              → Sets opening_stock via stock_movement
getProducts(filters)            → Pagination, search, category, stock status
getProduct(id)                  → Full detail with stock history
updateProduct(id, dto)
deactivateProduct(id)

// Stock
getStockMovements(productId, dateRange)
getCurrentStock(productId)
getLowStockProducts()           → Where current_stock <= minimum_stock
createStockAdjustment(dto)      → Creates movements + journal entry via AccountingService

// Barcode
getProductByBarcode(barcode)    → Fast lookup for POS
```

### Frontend Pages

**Files to create:**
- `admin/src/pages/admin/INVENTORY/ProductsPage.jsx`
- `admin/src/pages/admin/INVENTORY/CategoriesPage.jsx`
- `admin/src/pages/admin/INVENTORY/UnitsPage.jsx`
- `admin/src/pages/admin/INVENTORY/StockAdjustmentsPage.jsx`
- `admin/src/pages/admin/INVENTORY/LowStockPage.jsx`
- `admin/src/pages/admin/INVENTORY/components/ProductForm.jsx`
- `admin/src/pages/admin/INVENTORY/components/ProductDetailPage.jsx`
- `admin/src/pages/admin/INVENTORY/components/CategoryTree.jsx`
- `admin/src/pages/admin/INVENTORY/components/StockAdjustmentForm.jsx`

---

## 6. Module 3 — Purchase Management

### Backend Implementation

**Files to create:**
- `server/src/purchases/entities/*.entity.ts` (6 entities as listed)
- `server/src/purchases/dto/*.dto.ts` (5 DTOs as listed)
- `server/src/purchases/purchases.provider.ts`
- `server/src/purchases/purchases.service.ts`
- `server/src/purchases/purchases.controller.ts`
- `server/src/purchases/purchases.module.ts`

#### Service: `PurchasesService`

```
createPurchaseBill(dto)         → Creates bill + items + stock movements + journal entry
getPurchaseBills(filters)       → Pagination, date range, vendor, payment status
getPurchaseBill(id)             → Full detail with items and payment history
cancelPurchaseBill(id)          → Reverses stock + reverses journal entry

createDebitNote(dto)            → Creates return + stock reversal + journal entry
getDebitNotes(filters)

createPurchaseOrder(dto)
getPurchaseOrders(filters)
convertToBill(poId)             → Creates purchase bill from PO
```

### Key Business Logic

**When a purchase bill is created (`purchases.service.ts`):**
1. Validate all items (product exists, quantities > 0)
2. Determine tax type: compare `business_settings.state_code` with vendor's `state_code`
   - Same state → CGST + SGST (each = rate / 2)
   - Different state → IGST (full rate)
3. Calculate line totals: `taxable = qty × unit_price − discount`, then apply tax rates
4. Sum up invoice totals
5. Create `stock_movement` for each item via `InventoryService` (`movement_type = 'purchase'`)
6. Update `products.current_stock` for each item
7. Create journal entry via `AccountingService.createAutoJournalEntry()` (Purchase Dr, GST Input Dr, Vendor Cr)
8. Generate number via `AccountingService.getNextNumber('purchase_bill')`

### Frontend Pages

**Files to create:**
- `admin/src/pages/admin/PURCHASES/BillsPage.jsx`
- `admin/src/pages/admin/PURCHASES/VendorsPage.jsx`
- `admin/src/pages/admin/PURCHASES/DebitNotesPage.jsx`
- `admin/src/pages/admin/PURCHASES/PurchaseOrdersPage.jsx`
- `admin/src/pages/admin/PURCHASES/components/PurchaseBillForm.jsx`
- `admin/src/pages/admin/PURCHASES/components/PurchaseBillDetailPage.jsx`
- `admin/src/pages/admin/PURCHASES/components/VendorForm.jsx`
- `admin/src/pages/admin/PURCHASES/components/VendorDetailPage.jsx`
- `admin/src/pages/admin/PURCHASES/components/DebitNoteForm.jsx`
- `admin/src/pages/admin/PURCHASES/components/PurchaseOrderForm.jsx`
- `admin/src/pages/admin/PURCHASES/components/ItemRowEditor.jsx`

---

## 7. Module 4 — Sales Management

### Backend Implementation

**Files to create:**
- `server/src/sales/entities/*.entity.ts` (6 entities as listed)
- `server/src/sales/dto/*.dto.ts` (5 DTOs as listed)
- `server/src/sales/sales.provider.ts`
- `server/src/sales/sales.service.ts`
- `server/src/sales/sales.controller.ts`
- `server/src/sales/sales.module.ts`

#### Service: `SalesService`

```
createSalesInvoice(dto)         → Creates invoice + items + stock movements + journal entry
getSalesInvoices(filters)
getSalesInvoice(id)
cancelSalesInvoice(id)
generateInvoicePDF(id)          → Returns PDF buffer

createCreditNote(dto)           → Creates return + stock addition + journal entry
getCreditNotes(filters)

createQuotation(dto)
getQuotations(filters)
convertToInvoice(quotationId)   → Creates sales invoice from quotation
```

### Key Business Logic

**When a sales invoice is created (`sales.service.ts`):**
1. Validate items and stock availability (warn if insufficient, don't block)
2. Determine tax type (intra/inter-state) via `tax.service.ts`
3. Calculate all amounts
4. Create `stock_movement` for each item via `InventoryService` (`movement_type = 'sale'`)
5. Reduce `products.current_stock`
6. Create journal entry via `AccountingService.createAutoJournalEntry()` (Customer Dr, Sales Cr, GST Output Cr)
7. If `source = 'pos'`, also handle payment immediately

### Frontend Pages

**Files to create:**
- `admin/src/pages/admin/SALES/InvoicesPage.jsx`
- `admin/src/pages/admin/SALES/CustomersPage.jsx`
- `admin/src/pages/admin/SALES/CreditNotesPage.jsx`
- `admin/src/pages/admin/SALES/QuotationsPage.jsx`
- `admin/src/pages/admin/SALES/components/InvoiceForm.jsx`
- `admin/src/pages/admin/SALES/components/InvoiceDetailPage.jsx`
- `admin/src/pages/admin/SALES/components/InvoicePrintView.jsx`
- `admin/src/pages/admin/SALES/components/CustomerForm.jsx`
- `admin/src/pages/admin/SALES/components/CustomerDetailPage.jsx`
- `admin/src/pages/admin/SALES/components/CreditNoteForm.jsx`
- `admin/src/pages/admin/SALES/components/QuotationForm.jsx`
- `admin/src/pages/admin/SALES/components/ItemRowEditor.jsx`

---

## 8. Module 5 — POS Application

### Backend Implementation

**Files to create:**
- `server/src/pos/entities/pos-terminal.entity.ts`
- `server/src/pos/entities/pos-session.entity.ts`
- `server/src/pos/entities/held-bill.entity.ts`
- `server/src/pos/dto/*.dto.ts` (5 DTOs as listed)
- `server/src/pos/pos.provider.ts`
- `server/src/pos/pos.service.ts`
- `server/src/pos/pos.controller.ts`
- `server/src/pos/pos.module.ts`

#### Service: `PosService`

```
createTerminal(dto), getTerminals()

openSession(terminalId, openingCash)
closeSession(sessionId, closingCash)
getActiveSession(userId)

finalizeBill(dto)  → Creates sales_invoice (source='pos') via SalesService + bank transaction
holdBill(dto), getHeldBills(sessionId), recallHeldBill(id), deleteHeldBill(id)
processReturn(dto) → Creates credit_note via SalesService

getDailySales(date, terminalId?)
getSessionSummary(sessionId)
```

### Frontend — Refactoring Existing POS Pages

**Files to modify:**
- `admin/src/pages/pos/grid-view/hooks/usePOS.js` — replace all localStorage with API calls
- `admin/src/pages/pos/grid-view/POSPage.jsx` — add session management UI
- `admin/src/pages/pos/grid-view/components/GridProductGrid.jsx` — load from API
- `admin/src/pages/pos/grid-view/components/GridCategoryTabs.jsx` — load from API
- `admin/src/pages/pos/grid-view/components/GridCartPanel.jsx` — finalize via API
- `admin/src/pages/pos/grid-view/components/GridHeldBillsPanel.jsx` — hold/recall via API
- `admin/src/pages/pos/grid-view/components/GridReturnsPanel.jsx` — returns via API
- `admin/src/pages/pos/grid-view/components/GridDailyReportModal.jsx` — report from API
- `admin/src/pages/pos/table-view/TablePOSPage.jsx` — same refactor
- `admin/src/pages/pos/table-view/components/BillingTable.jsx` — products from API
- `admin/src/pages/pos/table-view/components/BarcodeInput.jsx` — barcode lookup via API
- `admin/src/pages/pos/table-view/components/HeldBillsSidebar.jsx` — API integration
- `admin/src/pages/pos/table-view/components/ReturnsSidebar.jsx` — API integration

**Files to delete (after migration):**
- `admin/src/pages/pos/grid-view/data/mockData.js`

**New files to create:**
- `admin/src/pages/pos/grid-view/components/SessionOpenDialog.jsx`
- `admin/src/pages/pos/grid-view/components/SessionCloseDialog.jsx`
- `admin/src/pages/pos/grid-view/components/SplitPaymentModal.jsx`
- `admin/src/pages/pos/grid-view/components/ReceiptPrintView.jsx`

**Key refactoring tasks in `usePOS.js`:**
1. Product list → `GET /api/inventory/products?is_active=true` (via TanStack Query)
2. Categories → `GET /api/inventory/categories`
3. Product search → `GET /api/inventory/products?search=...`
4. Barcode scan → `GET /api/inventory/products/barcode/:code`
5. Bill finalize → `POST /api/pos/finalize`
6. Hold bill → `POST /api/pos/hold`
7. Recall bill → `POST /api/pos/held-bills/:id/recall`
8. Daily report → `GET /api/pos/daily-sales?date=...`
9. Session check → `GET /api/pos/sessions/active`

---

## 9. Module 6 — GST & Tax Management

### Backend Implementation

**Files to create:**
- `server/src/tax/entities/tax-rate.entity.ts`
- `server/src/tax/entities/business-settings.entity.ts`
- `server/src/tax/dto/*.dto.ts` (3 DTOs as listed)
- `server/src/tax/tax.provider.ts`
- `server/src/tax/tax.service.ts`
- `server/src/tax/tax.controller.ts`
- `server/src/tax/tax.module.ts`

#### Service: `TaxService`

```
createTaxRate(dto), getTaxRates(), updateTaxRate(id, dto), deactivateTaxRate(id)

// Internal utility — used by sales, purchases, pos
calculateTax(params: {
  taxableAmount, taxRateId, placeOfSupply, businessStateCode
}) → { cgst, sgst, igst, cess, totalTax }

// GST Reports
getGSTR1Data(period)            → Sales data for GSTR-1 filing
getGSTR3BData(period)           → Summary for GSTR-3B filing
getGSTSummary(dateRange)        → Input vs Output credit summary

getBusinessSettings(), updateBusinessSettings(dto)
```

### GST Credit Handling — Detailed Logic

**On Purchase (Input Tax Credit - ITC):**
- GST paid on purchases → debit CGST/SGST/IGST Input ledgers (asset accounts)

**On Sale (Output Tax Liability):**
- GST collected on sales → credit CGST/SGST/IGST Output ledgers (liability accounts)

**Net GST Payable (monthly):**
```
Net CGST = CGST Output (credit balance) − CGST Input (debit balance)
Net SGST = SGST Output (credit balance) − SGST Input (debit balance)
Net IGST = IGST Output (credit balance) − IGST Input (debit balance)
```

**IGST Cross-Utilization (as per GST law):**
1. IGST Input → against IGST Output → CGST Output → SGST Output
2. CGST Input → against CGST Output → IGST Output (not SGST)
3. SGST Input → against SGST Output → IGST Output (not CGST)

### Frontend Pages

**Files to create:**
- `admin/src/pages/admin/TAX/TaxRatesPage.jsx`
- `admin/src/pages/admin/TAX/GSTSummaryPage.jsx`
- `admin/src/pages/admin/TAX/GSTR1Page.jsx`
- `admin/src/pages/admin/TAX/GSTR3BPage.jsx`
- `admin/src/pages/admin/TAX/components/TaxRateForm.jsx`
- `admin/src/pages/admin/TAX/components/BusinessSettingsForm.jsx`
- `admin/src/pages/admin/TAX/components/GSTCreditBreakdown.jsx`

---

## 10. Module 7 — Bank & Cash Transactions

### Backend Implementation

**Files to create:**
- `server/src/banking/entities/*.entity.ts` (4 entities as listed)
- `server/src/banking/dto/*.dto.ts` (6 DTOs as listed)
- `server/src/banking/banking.provider.ts`
- `server/src/banking/banking.service.ts`
- `server/src/banking/banking.controller.ts`
- `server/src/banking/banking.module.ts`

#### Service: `BankingService`

```
createBankAccount(dto)           → Also creates ledger via AccountingService
getBankAccounts(), getBankAccount(id), updateBankAccount(id, dto)
getBankAccountStatement(id, dateRange)

createPayment(dto)               → Journal entry + bank transaction + update bills
createReceipt(dto)               → Journal entry + bank transaction + update invoices
getPaymentReceipts(filters)
cancelPaymentReceipt(id)

transferBetweenAccounts(dto)     → Two bank_transactions + journal entry
getUnreconciledTransactions(bankAccountId)
reconcileTransactions(transactionIds[], reconciledDate)
```

### Frontend Pages

**Files to create:**
- `admin/src/pages/admin/BANKING/BankAccountsPage.jsx`
- `admin/src/pages/admin/BANKING/PaymentsPage.jsx`
- `admin/src/pages/admin/BANKING/ReceiptsPage.jsx`
- `admin/src/pages/admin/BANKING/ReconciliationPage.jsx`
- `admin/src/pages/admin/BANKING/components/BankAccountForm.jsx`
- `admin/src/pages/admin/BANKING/components/BankStatementPage.jsx`
- `admin/src/pages/admin/BANKING/components/PaymentForm.jsx`
- `admin/src/pages/admin/BANKING/components/ReceiptForm.jsx`
- `admin/src/pages/admin/BANKING/components/BankTransferForm.jsx`
- `admin/src/pages/admin/BANKING/components/CashBookPage.jsx`

---

## 11. API Endpoint Reference

### Accounting (`/api/accounting`)

| Method | Path | Description |
|--------|------|-------------|
| POST | /account-groups | Create account group |
| GET | /account-groups | Get account group tree |
| PUT | /account-groups/:id | Update account group |
| POST | /ledger-accounts | Create ledger account |
| GET | /ledger-accounts | List ledger accounts (paginated) |
| GET | /ledger-accounts/:id | Get ledger account detail |
| PUT | /ledger-accounts/:id | Update ledger account |
| GET | /ledger-accounts/:id/statement | Get ledger statement |
| GET | /ledger-accounts/:id/balance | Get ledger balance |
| POST | /journal-entries | Create manual journal entry |
| GET | /journal-entries | List journal entries (paginated) |
| GET | /journal-entries/:id | Get journal entry detail |
| POST | /journal-entries/:id/cancel | Cancel journal entry |
| GET | /financial-years | List financial years |
| POST | /financial-years | Create financial year |
| PUT | /financial-years/:id | Update financial year |
| POST | /financial-years/:id/close | Close financial year |

### Reports (`/api/reports`)

| Method | Path | Description |
|--------|------|-------------|
| GET | /trial-balance | Get trial balance |
| GET | /profit-and-loss | Get P&L statement |
| GET | /balance-sheet | Get balance sheet |
| GET | /day-book | Get day book |

### Inventory (`/api/inventory`)

| Method | Path | Description |
|--------|------|-------------|
| POST | /categories | Create category |
| GET | /categories | List categories |
| PUT | /categories/:id | Update category |
| DELETE | /categories/:id | Delete category |
| POST | /units | Create unit |
| GET | /units | List units |
| PUT | /units/:id | Update unit |
| POST | /hsn-codes | Create HSN code |
| GET | /hsn-codes | List HSN codes |
| PUT | /hsn-codes/:id | Update HSN code |
| POST | /products | Create product |
| GET | /products | List products (paginated) |
| GET | /products/:id | Get product detail |
| PUT | /products/:id | Update product |
| GET | /products/barcode/:code | Get product by barcode |
| GET | /products/low-stock | Get low stock products |
| GET | /products/:id/stock-movements | Get stock history |
| POST | /stock-adjustments | Create stock adjustment |
| GET | /stock-adjustments | List stock adjustments |
| GET | /stock-adjustments/:id | Get adjustment detail |

### Parties (`/api/parties`)

| Method | Path | Description |
|--------|------|-------------|
| POST | / | Create party |
| GET | / | List parties (filter by type) |
| GET | /:id | Get party detail |
| PUT | /:id | Update party |
| GET | /:id/statement | Get party account statement |
| GET | /:id/outstanding | Get outstanding invoices/bills |

### Sales (`/api/sales`)

| Method | Path | Description |
|--------|------|-------------|
| POST | /invoices | Create sales invoice |
| GET | /invoices | List invoices (paginated) |
| GET | /invoices/:id | Get invoice detail |
| POST | /invoices/:id/cancel | Cancel invoice |
| GET | /invoices/:id/pdf | Download invoice PDF |
| POST | /credit-notes | Create credit note |
| GET | /credit-notes | List credit notes |
| GET | /credit-notes/:id | Get credit note detail |
| POST | /quotations | Create quotation |
| GET | /quotations | List quotations |
| GET | /quotations/:id | Get quotation detail |
| PUT | /quotations/:id | Update quotation |
| POST | /quotations/:id/convert | Convert to invoice |

### Purchases (`/api/purchases`)

| Method | Path | Description |
|--------|------|-------------|
| POST | /bills | Create purchase bill |
| GET | /bills | List bills (paginated) |
| GET | /bills/:id | Get bill detail |
| POST | /bills/:id/cancel | Cancel bill |
| POST | /debit-notes | Create debit note |
| GET | /debit-notes | List debit notes |
| GET | /debit-notes/:id | Get debit note detail |
| POST | /orders | Create purchase order |
| GET | /orders | List purchase orders |
| GET | /orders/:id | Get PO detail |
| PUT | /orders/:id | Update PO |
| POST | /orders/:id/convert | Convert PO to bill |

### POS (`/api/pos`)

| Method | Path | Description |
|--------|------|-------------|
| POST | /terminals | Create terminal |
| GET | /terminals | List terminals |
| POST | /sessions/open | Open POS session |
| POST | /sessions/:id/close | Close POS session |
| GET | /sessions/active | Get active session for current user |
| GET | /sessions/:id/summary | Get session summary |
| POST | /finalize | Finalize and save bill |
| POST | /hold | Hold current bill |
| GET | /held-bills | Get held bills for session |
| POST | /held-bills/:id/recall | Recall held bill |
| DELETE | /held-bills/:id | Delete held bill |
| POST | /return | Process POS return |
| GET | /daily-sales | Get daily sales summary |

### Tax (`/api/tax`)

| Method | Path | Description |
|--------|------|-------------|
| POST | /rates | Create tax rate |
| GET | /rates | List tax rates |
| PUT | /rates/:id | Update tax rate |
| GET | /gst-summary | Get GST credit summary |
| GET | /gstr1 | Get GSTR-1 report data |
| GET | /gstr3b | Get GSTR-3B report data |
| GET | /business-settings | Get business settings |
| PUT | /business-settings | Update business settings |

### Banking (`/api/banking`)

| Method | Path | Description |
|--------|------|-------------|
| POST | /accounts | Create bank account |
| GET | /accounts | List bank accounts |
| GET | /accounts/:id | Get bank account detail |
| PUT | /accounts/:id | Update bank account |
| GET | /accounts/:id/statement | Get account statement |
| POST | /payments | Create payment (to vendor) |
| POST | /receipts | Create receipt (from customer) |
| GET | /payment-receipts | List payments/receipts |
| GET | /payment-receipts/:id | Get detail |
| POST | /payment-receipts/:id/cancel | Cancel payment/receipt |
| POST | /transfer | Transfer between accounts |
| GET | /reconciliation/:accountId | Get unreconciled transactions |
| POST | /reconciliation/reconcile | Mark transactions as reconciled |

---

## 12. Frontend Page Structure

### Changes to `admin/src/services/endpoints.js`

Add to the existing `API` object:

```javascript
// Accounting
ACCOUNT_GROUPS: "accounting/account-groups",
LEDGER_ACCOUNTS: "accounting/ledger-accounts",
JOURNAL_ENTRIES: "accounting/journal-entries",
FINANCIAL_YEARS: "accounting/financial-years",

// Reports
TRIAL_BALANCE: "reports/trial-balance",
PROFIT_AND_LOSS: "reports/profit-and-loss",
BALANCE_SHEET: "reports/balance-sheet",

// Inventory
CATEGORIES: "inventory/categories",
UNITS: "inventory/units",
HSN_CODES: "inventory/hsn-codes",
PRODUCTS: "inventory/products",
PRODUCTS_BARCODE: "inventory/products/barcode",
PRODUCTS_LOW_STOCK: "inventory/products/low-stock",
STOCK_ADJUSTMENTS: "inventory/stock-adjustments",

// Parties
PARTIES: "parties",

// Sales
SALES_INVOICES: "sales/invoices",
CREDIT_NOTES: "sales/credit-notes",
QUOTATIONS: "sales/quotations",

// Purchases
PURCHASE_BILLS: "purchases/bills",
DEBIT_NOTES: "purchases/debit-notes",
PURCHASE_ORDERS: "purchases/orders",

// POS
POS_TERMINALS: "pos/terminals",
POS_SESSIONS: "pos/sessions",
POS_SESSIONS_ACTIVE: "pos/sessions/active",
POS_FINALIZE: "pos/finalize",
POS_HOLD: "pos/hold",
POS_HELD_BILLS: "pos/held-bills",
POS_RETURN: "pos/return",
POS_DAILY_SALES: "pos/daily-sales",

// Tax
TAX_RATES: "tax/rates",
GST_SUMMARY: "tax/gst-summary",
GSTR1: "tax/gstr1",
GSTR3B: "tax/gstr3b",
BUSINESS_SETTINGS: "tax/business-settings",

// Banking
BANK_ACCOUNTS: "banking/accounts",
PAYMENTS: "banking/payments",
RECEIPTS: "banking/receipts",
PAYMENT_RECEIPTS: "banking/payment-receipts",
BANK_TRANSFER: "banking/transfer",
BANK_RECONCILIATION: "banking/reconciliation",
```

### Changes to `admin/src/services/queryKeys.js`

Add to the existing `QUERY_KEY` object:

```javascript
// Accounting
ACCOUNT_GROUPS: "account-groups",
LEDGER_ACCOUNTS: "ledger-accounts",
LEDGER_ACCOUNT_DETAIL: "ledger-account-detail",
LEDGER_STATEMENT: "ledger-statement",
JOURNAL_ENTRIES: "journal-entries",
JOURNAL_ENTRY_DETAIL: "journal-entry-detail",
FINANCIAL_YEARS: "financial-years",
TRIAL_BALANCE: "trial-balance",
PROFIT_AND_LOSS: "profit-and-loss",
BALANCE_SHEET: "balance-sheet",

// Inventory
CATEGORIES: "categories",
UNITS: "units",
HSN_CODES: "hsn-codes",
PRODUCTS: "products-list",
PRODUCT_DETAIL: "product-detail",
LOW_STOCK_PRODUCTS: "low-stock-products",
STOCK_MOVEMENTS: "stock-movements",
STOCK_ADJUSTMENTS: "stock-adjustments",

// Parties
PARTIES: "parties-list",
PARTY_DETAIL: "party-detail",
PARTY_STATEMENT: "party-statement",
PARTY_OUTSTANDING: "party-outstanding",

// Sales
SALES_INVOICES: "sales-invoices",
SALES_INVOICE_DETAIL: "sales-invoice-detail",
CREDIT_NOTES: "credit-notes",
QUOTATIONS: "quotations",
QUOTATION_DETAIL: "quotation-detail",

// Purchases
PURCHASE_BILLS: "purchase-bills",
PURCHASE_BILL_DETAIL: "purchase-bill-detail",
DEBIT_NOTES: "debit-notes",
PURCHASE_ORDERS: "purchase-orders",
PURCHASE_ORDER_DETAIL: "purchase-order-detail",

// POS
POS_TERMINALS: "pos-terminals",
POS_ACTIVE_SESSION: "pos-active-session",
POS_SESSION_SUMMARY: "pos-session-summary",
POS_HELD_BILLS: "pos-held-bills",
POS_DAILY_SALES: "pos-daily-sales",

// Tax
TAX_RATES: "tax-rates",
GST_SUMMARY: "gst-summary",
GSTR1_DATA: "gstr1-data",
GSTR3B_DATA: "gstr3b-data",
BUSINESS_SETTINGS: "business-settings",

// Banking
BANK_ACCOUNTS: "bank-accounts",
BANK_ACCOUNT_DETAIL: "bank-account-detail",
BANK_STATEMENT: "bank-statement",
PAYMENT_RECEIPTS_LIST: "payment-receipts-list",
PAYMENT_RECEIPT_DETAIL: "payment-receipt-detail",
UNRECONCILED_TRANSACTIONS: "unreconciled-transactions",
```

### Navigation Sidebar — Changes to `admin/src/layouts/Sidebar.jsx`

Add these nav section arrays alongside existing `allMenuItems`, `allUserItems`, etc.:

```javascript
const allInventoryItems = [
  { name: 'Products', path: '/admin/inventory/products', icon: Package, permission: 'inventory:read' },
  { name: 'Categories', path: '/admin/inventory/categories', icon: FolderTree, permission: 'inventory:read' },
  { name: 'Stock Adjustments', path: '/admin/inventory/stock-adjustments', icon: ClipboardList, permission: 'inventory:create' },
  { name: 'Units', path: '/admin/inventory/units', icon: Ruler, permission: 'inventory:read' },
];

const allSalesItems = [
  { name: 'Invoices', path: '/admin/sales/invoices', icon: FileText, permission: 'sales:read' },
  { name: 'Customers', path: '/admin/sales/customers', icon: Users, permission: 'sales:read' },
  { name: 'Credit Notes', path: '/admin/sales/credit-notes', icon: RotateCcw, permission: 'sales:read' },
  { name: 'Quotations', path: '/admin/sales/quotations', icon: FileCheck, permission: 'sales:read' },
];

const allPurchaseItems = [
  { name: 'Bills', path: '/admin/purchases/bills', icon: Receipt, permission: 'purchases:read' },
  { name: 'Vendors', path: '/admin/purchases/vendors', icon: Truck, permission: 'purchases:read' },
  { name: 'Debit Notes', path: '/admin/purchases/debit-notes', icon: RotateCw, permission: 'purchases:read' },
  { name: 'Purchase Orders', path: '/admin/purchases/orders', icon: ShoppingCart, permission: 'purchases:read' },
];

const allAccountingItems = [
  { name: 'Chart of Accounts', path: '/admin/accounting/chart-of-accounts', icon: BookOpen, permission: 'accounting:read' },
  { name: 'Journal Entries', path: '/admin/accounting/journal-entries', icon: BookMarked, permission: 'accounting:read' },
  { name: 'Trial Balance', path: '/admin/accounting/trial-balance', icon: Scale, permission: 'reports:read' },
  { name: 'Profit & Loss', path: '/admin/accounting/profit-and-loss', icon: TrendingUp, permission: 'reports:read' },
  { name: 'Balance Sheet', path: '/admin/accounting/balance-sheet', icon: PieChart, permission: 'reports:read' },
];

const allBankingItems = [
  { name: 'Bank Accounts', path: '/admin/banking/accounts', icon: Building2, permission: 'banking:read' },
  { name: 'Payments', path: '/admin/banking/payments', icon: ArrowUpRight, permission: 'banking:create' },
  { name: 'Receipts', path: '/admin/banking/receipts', icon: ArrowDownLeft, permission: 'banking:create' },
  { name: 'Reconciliation', path: '/admin/banking/reconciliation', icon: CheckSquare, permission: 'banking:reconcile' },
];

const allTaxItems = [
  { name: 'Tax Rates', path: '/admin/tax/rates', icon: Percent, permission: 'tax:read' },
  { name: 'GST Summary', path: '/admin/tax/gst-summary', icon: Calculator, permission: 'tax:reports' },
  { name: 'GSTR-1', path: '/admin/tax/gstr1', icon: FileSpreadsheet, permission: 'tax:reports' },
  { name: 'GSTR-3B', path: '/admin/tax/gstr3b', icon: FileSpreadsheet, permission: 'tax:reports' },
];
```

### Routes — Changes to `admin/src/routes/routes.jsx`

Add inside the `/admin` `AdminLayout` route block:

```jsx
{/* Inventory */}
<Route path="inventory/products" element={<PermissionGate permission="inventory:read" fallback={<AccessDeniedPage />}><ProductsPage /></PermissionGate>} />
<Route path="inventory/products/new" element={<PermissionGate permission="inventory:create" fallback={<AccessDeniedPage />}><ProductForm /></PermissionGate>} />
<Route path="inventory/products/:id" element={<PermissionGate permission="inventory:read" fallback={<AccessDeniedPage />}><ProductDetailPage /></PermissionGate>} />
<Route path="inventory/products/:id/edit" element={<PermissionGate permission="inventory:update" fallback={<AccessDeniedPage />}><ProductForm /></PermissionGate>} />
<Route path="inventory/categories" element={<PermissionGate permission="inventory:read" fallback={<AccessDeniedPage />}><CategoriesPage /></PermissionGate>} />
<Route path="inventory/units" element={<PermissionGate permission="inventory:read" fallback={<AccessDeniedPage />}><UnitsPage /></PermissionGate>} />
<Route path="inventory/stock-adjustments" element={<PermissionGate permission="inventory:create" fallback={<AccessDeniedPage />}><StockAdjustmentsPage /></PermissionGate>} />
<Route path="inventory/low-stock" element={<PermissionGate permission="inventory:read" fallback={<AccessDeniedPage />}><LowStockPage /></PermissionGate>} />

{/* Sales */}
<Route path="sales/invoices" element={<PermissionGate permission="sales:read" fallback={<AccessDeniedPage />}><InvoicesPage /></PermissionGate>} />
<Route path="sales/invoices/new" element={<PermissionGate permission="sales:create" fallback={<AccessDeniedPage />}><InvoiceForm /></PermissionGate>} />
<Route path="sales/invoices/:id" element={<PermissionGate permission="sales:read" fallback={<AccessDeniedPage />}><InvoiceDetailPage /></PermissionGate>} />
<Route path="sales/customers" element={<PermissionGate permission="sales:read" fallback={<AccessDeniedPage />}><CustomersPage /></PermissionGate>} />
<Route path="sales/customers/:id" element={<PermissionGate permission="sales:read" fallback={<AccessDeniedPage />}><CustomerDetailPage /></PermissionGate>} />
<Route path="sales/credit-notes" element={<PermissionGate permission="sales:read" fallback={<AccessDeniedPage />}><CreditNotesPage /></PermissionGate>} />
<Route path="sales/quotations" element={<PermissionGate permission="sales:read" fallback={<AccessDeniedPage />}><QuotationsPage /></PermissionGate>} />

{/* Purchases */}
<Route path="purchases/bills" element={<PermissionGate permission="purchases:read" fallback={<AccessDeniedPage />}><BillsPage /></PermissionGate>} />
<Route path="purchases/bills/new" element={<PermissionGate permission="purchases:create" fallback={<AccessDeniedPage />}><PurchaseBillForm /></PermissionGate>} />
<Route path="purchases/bills/:id" element={<PermissionGate permission="purchases:read" fallback={<AccessDeniedPage />}><PurchaseBillDetailPage /></PermissionGate>} />
<Route path="purchases/vendors" element={<PermissionGate permission="purchases:read" fallback={<AccessDeniedPage />}><VendorsPage /></PermissionGate>} />
<Route path="purchases/vendors/:id" element={<PermissionGate permission="purchases:read" fallback={<AccessDeniedPage />}><VendorDetailPage /></PermissionGate>} />
<Route path="purchases/debit-notes" element={<PermissionGate permission="purchases:read" fallback={<AccessDeniedPage />}><DebitNotesPage /></PermissionGate>} />
<Route path="purchases/orders" element={<PermissionGate permission="purchases:read" fallback={<AccessDeniedPage />}><PurchaseOrdersPage /></PermissionGate>} />

{/* Accounting */}
<Route path="accounting/chart-of-accounts" element={<PermissionGate permission="accounting:read" fallback={<AccessDeniedPage />}><ChartOfAccountsPage /></PermissionGate>} />
<Route path="accounting/ledger/:id" element={<PermissionGate permission="accounting:read" fallback={<AccessDeniedPage />}><LedgerStatementPage /></PermissionGate>} />
<Route path="accounting/journal-entries" element={<PermissionGate permission="accounting:read" fallback={<AccessDeniedPage />}><JournalEntriesPage /></PermissionGate>} />
<Route path="accounting/journal-entries/new" element={<PermissionGate permission="accounting:create" fallback={<AccessDeniedPage />}><JournalEntryForm /></PermissionGate>} />
<Route path="accounting/journal-entries/:id" element={<PermissionGate permission="accounting:read" fallback={<AccessDeniedPage />}><JournalEntryDetail /></PermissionGate>} />
<Route path="accounting/trial-balance" element={<PermissionGate permission="reports:read" fallback={<AccessDeniedPage />}><TrialBalancePage /></PermissionGate>} />
<Route path="accounting/profit-and-loss" element={<PermissionGate permission="reports:read" fallback={<AccessDeniedPage />}><ProfitAndLossPage /></PermissionGate>} />
<Route path="accounting/balance-sheet" element={<PermissionGate permission="reports:read" fallback={<AccessDeniedPage />}><BalanceSheetPage /></PermissionGate>} />

{/* Banking */}
<Route path="banking/accounts" element={<PermissionGate permission="banking:read" fallback={<AccessDeniedPage />}><BankAccountsPage /></PermissionGate>} />
<Route path="banking/accounts/:id" element={<PermissionGate permission="banking:read" fallback={<AccessDeniedPage />}><BankStatementPage /></PermissionGate>} />
<Route path="banking/payments" element={<PermissionGate permission="banking:create" fallback={<AccessDeniedPage />}><PaymentsPage /></PermissionGate>} />
<Route path="banking/receipts" element={<PermissionGate permission="banking:create" fallback={<AccessDeniedPage />}><ReceiptsPage /></PermissionGate>} />
<Route path="banking/reconciliation" element={<PermissionGate permission="banking:reconcile" fallback={<AccessDeniedPage />}><ReconciliationPage /></PermissionGate>} />

{/* Tax / GST */}
<Route path="tax/rates" element={<PermissionGate permission="tax:read" fallback={<AccessDeniedPage />}><TaxRatesPage /></PermissionGate>} />
<Route path="tax/gst-summary" element={<PermissionGate permission="tax:reports" fallback={<AccessDeniedPage />}><GSTSummaryPage /></PermissionGate>} />
<Route path="tax/gstr1" element={<PermissionGate permission="tax:reports" fallback={<AccessDeniedPage />}><GSTR1Page /></PermissionGate>} />
<Route path="tax/gstr3b" element={<PermissionGate permission="tax:reports" fallback={<AccessDeniedPage />}><GSTR3BPage /></PermissionGate>} />
```

### Dashboard — Rewrite `admin/src/pages/admin/DASHBOARD/DashboardPage.jsx`

Key metric cards (from API):
- Total Sales (this month) — `GET /api/reports/dashboard-summary`
- Total Purchases (this month)
- Outstanding Receivables
- Outstanding Payables
- Cash Balance
- Bank Balance
- Net GST Payable

Charts:
- Sales vs Purchases trend (last 6 months, bar chart)
- Top 5 products by sales (pie chart)
- Outstanding aging (receivables + payables)

Quick action buttons: New Invoice, New Purchase Bill, Record Payment, Record Receipt, Open POS

Alerts: Low stock products, overdue invoices, overdue bills

---

## 13. Implementation Order & Phases

### Phase 1 — Foundation (Weeks 1-3)

**Goal:** Core infrastructure that everything depends on.

| # | Task | Files | Depends On |
|---|------|-------|------------|
| 1.1 | `BusinessSettings` entity + CRUD | `server/src/tax/entities/business-settings.entity.ts`, `tax.service.ts` | — |
| 1.2 | `FinancialYear` entity + CRUD + active year logic | `server/src/accounting/entities/financial-year.entity.ts` | — |
| 1.3 | `NumberSequence` entity + atomic getNextNumber | `server/src/accounting/entities/number-sequence.entity.ts` | 1.2 |
| 1.4 | `AccountGroup` entity + seed default groups | `server/src/accounting/entities/account-group.entity.ts`, `seed-data.ts` | — |
| 1.5 | `LedgerAccount` entity + CRUD | `server/src/accounting/entities/ledger-account.entity.ts` | 1.4 |
| 1.6 | Seed system ledger accounts | `server/src/database/seeds/seed-data.ts` | 1.4, 1.5 |
| 1.7 | `JournalEntry` + `JournalEntryLine` entities | `server/src/accounting/entities/journal-entry.entity.ts`, `journal-entry-line.entity.ts` | 1.5 |
| 1.8 | `createAutoJournalEntry` internal method | `server/src/accounting/accounting.service.ts` | 1.7 |
| 1.9 | Manual journal entry CRUD | `server/src/accounting/accounting.controller.ts` | 1.7 |
| 1.10 | `TaxRate` entity + seed default rates | `server/src/tax/entities/tax-rate.entity.ts`, `seed-data.ts` | — |
| 1.11 | Tax calculation utility | `server/src/tax/tax.service.ts` | 1.10 |
| 1.12 | Add new permissions to role seed | `server/src/database/seeds/role-permission.seed.ts` | — |
| 1.13 | Register all Phase 1 modules in `app.module.ts` | `server/src/app.module.ts` | 1.1–1.12 |
| 1.14 | Frontend: Business Settings page | `admin/src/pages/admin/TAX/components/BusinessSettingsForm.jsx` | 1.1 |
| 1.15 | Frontend: Chart of Accounts page | `admin/src/pages/admin/ACCOUNTING/ChartOfAccountsPage.jsx` | 1.4, 1.5 |
| 1.16 | Frontend: Journal Entries page | `admin/src/pages/admin/ACCOUNTING/JournalEntriesPage.jsx` | 1.9 |
| 1.17 | Update Sidebar, routes, endpoints, queryKeys | `admin/src/layouts/Sidebar.jsx`, `routes.jsx`, `endpoints.js`, `queryKeys.js` | 1.14–1.16 |

### Phase 2 — Inventory (Weeks 3-5)

| # | Task | Depends On |
|---|------|------------|
| 2.1 | `Category` entity + CRUD | — |
| 2.2 | `Unit` entity + CRUD + seed defaults | — |
| 2.3 | `HsnCode` entity + CRUD | 1.10 |
| 2.4 | `Product` entity + CRUD | 2.1, 2.2, 2.3 |
| 2.5 | `StockMovement` entity + logging service | 2.4 |
| 2.6 | `StockAdjustment` + items entity + service | 2.5, 1.8 |
| 2.7 | Product barcode lookup endpoint | 2.4 |
| 2.8 | Low stock query + alert | 2.4 |
| 2.9 | Frontend: `admin/src/pages/admin/INVENTORY/` pages | 2.4 |

### Phase 3 — Parties & Banking (Weeks 5-7)

| # | Task | Depends On |
|---|------|------------|
| 3.1 | `Party` entity + CRUD (auto-create ledger) | 1.5 |
| 3.2 | `BankAccount` entity + CRUD (auto-create ledger) | 1.5 |
| 3.3 | `BankTransaction` entity + logging service | 3.2 |
| 3.4 | `PaymentReceipt` + `PaymentAllocation` entities | 3.1, 3.2, 1.8 |
| 3.5 | Payment service (to vendor) | 3.4 |
| 3.6 | Receipt service (from customer) | 3.4 |
| 3.7 | Bank transfer service | 3.2, 1.8 |
| 3.8 | Bank reconciliation service | 3.3 |
| 3.9 | Frontend: `admin/src/pages/admin/BANKING/` pages | 3.2–3.8 |
| 3.10 | Add Sidebar sections for Parties + Banking | 3.9 |

### Phase 4 — Purchases (Weeks 7-9)

| # | Task | Depends On |
|---|------|------------|
| 4.1 | `PurchaseBill` + items entities | 2.4, 3.1, 1.8, 2.5, 1.11 |
| 4.2 | Purchase bill create service (stock + journal + tax) | 4.1 |
| 4.3 | Purchase bill cancel service | 4.2 |
| 4.4 | `DebitNote` + items entities | 4.1 |
| 4.5 | Debit note service (stock reversal + journal) | 4.4 |
| 4.6 | `PurchaseOrder` + items entities | 3.1, 2.4 |
| 4.7 | Purchase order service + convert to bill | 4.6, 4.2 |
| 4.8 | Wire up payment allocation to purchase bills | 3.5, 4.1 |
| 4.9 | Frontend: `admin/src/pages/admin/PURCHASES/` pages | 4.2–4.7 |

### Phase 5 — Sales (Weeks 9-11)

| # | Task | Depends On |
|---|------|------------|
| 5.1 | `SalesInvoice` + items entities | 2.4, 3.1, 1.8, 2.5, 1.11 |
| 5.2 | Sales invoice create service (stock + journal + tax) | 5.1 |
| 5.3 | Sales invoice cancel service | 5.2 |
| 5.4 | Invoice PDF generation | 5.1 |
| 5.5 | `CreditNote` + items entities | 5.1 |
| 5.6 | Credit note service (stock reversal + journal) | 5.5 |
| 5.7 | `Quotation` + items entities | 3.1, 2.4 |
| 5.8 | Quotation service + convert to invoice | 5.7, 5.2 |
| 5.9 | Wire up payment allocation to sales invoices | 3.6, 5.1 |
| 5.10 | Frontend: `admin/src/pages/admin/SALES/` pages | 5.2–5.8 |

### Phase 6 — POS Backend Integration (Weeks 11-13)

| # | Task | Depends On |
|---|------|------------|
| 6.1 | `PosTerminal` entity + CRUD | — |
| 6.2 | `PosSession` entity + open/close service | 6.1 |
| 6.3 | `HeldBill` entity + CRUD | 6.2 |
| 6.4 | POS finalize service (creates sales_invoice with source='pos') | 5.2, 6.2, 3.3 |
| 6.5 | POS return service (creates credit note) | 5.6, 6.2 |
| 6.6 | POS daily sales + session summary reports | 6.4 |
| 6.7 | Refactor `admin/src/pages/pos/grid-view/hooks/usePOS.js` | 6.4 |
| 6.8 | Refactor `admin/src/pages/pos/grid-view/POSPage.jsx` + components | 6.7 |
| 6.9 | Refactor `admin/src/pages/pos/table-view/` components | 6.7 |
| 6.10 | Add session open/close dialogs | 6.2 |
| 6.11 | Add split payment + receipt print | 6.4 |
| 6.12 | Delete `admin/src/pages/pos/grid-view/data/mockData.js` | 6.7 |

### Phase 7 — GST Reports & Financial Statements (Weeks 13-15)

| # | Task | Depends On |
|---|------|------------|
| 7.1 | Ledger balance computation service | 1.7 |
| 7.2 | Ledger statement service | 1.7 |
| 7.3 | Trial balance service | 7.1 |
| 7.4 | Profit & Loss service | 7.1 |
| 7.5 | Balance sheet service | 7.1 |
| 7.6 | GST summary service (input vs output credit) | 1.7, 1.10 |
| 7.7 | GSTR-1 report data service | 5.1, 5.5 |
| 7.8 | GSTR-3B report data service | 7.6, 7.7 |
| 7.9 | Reports module (`server/src/reports/`) | 7.3–7.5 |
| 7.10 | Frontend: `admin/src/pages/admin/ACCOUNTING/TrialBalancePage.jsx` | 7.3 |
| 7.11 | Frontend: `admin/src/pages/admin/ACCOUNTING/ProfitAndLossPage.jsx` | 7.4 |
| 7.12 | Frontend: `admin/src/pages/admin/ACCOUNTING/BalanceSheetPage.jsx` | 7.5 |
| 7.13 | Frontend: `admin/src/pages/admin/ACCOUNTING/components/LedgerStatementPage.jsx` | 7.2 |
| 7.14 | Frontend: `admin/src/pages/admin/TAX/GSTSummaryPage.jsx` | 7.6 |
| 7.15 | Frontend: `admin/src/pages/admin/TAX/GSTR1Page.jsx` | 7.7 |
| 7.16 | Frontend: `admin/src/pages/admin/TAX/GSTR3BPage.jsx` | 7.8 |
| 7.17 | Rewrite `admin/src/pages/admin/DASHBOARD/DashboardPage.jsx` | 7.1, 5.1, 4.1, 3.2 |

### Phase 8 — Polish & Production Readiness (Weeks 15-17)

| # | Task |
|---|------|
| 8.1 | Database migrations (replace sync with proper Sequelize migrations) |
| 8.2 | Input validation and error handling audit |
| 8.3 | Add new permissions to role-permission seed and PermissionGate all routes |
| 8.4 | Data export (CSV/Excel) for all list pages |
| 8.5 | Invoice/report PDF generation refinement |
| 8.6 | Bulk operations (bulk payment, bulk status update) |
| 8.7 | Audit log (who did what, when) |
| 8.8 | Performance optimization (indexes, query optimization) |
| 8.9 | End-to-end testing |
| 8.10 | Deployment configuration |

---

## 14. Testing Strategy

### Backend Testing

**Unit Tests** — for each service method:
- Tax calculation accuracy (edge cases: zero rate, cess, rounding)
- Journal entry balance validation (debits = credits)
- Stock movement correctness
- Number sequence atomicity
- GST credit calculation with cross-utilization

**Integration Tests** — for each transaction flow:
- Create purchase bill → verify stock increased, journal entry correct, vendor balance updated
- Create sales invoice → verify stock decreased, journal entry correct, customer balance updated
- Create payment → verify bill marked paid, bank balance reduced, journal entry correct
- Create credit note → verify stock returned, original invoice balance adjusted
- POS flow → session open, hold bill, recall, finalize, close session

**E2E Tests:**
- Full purchase-to-payment cycle
- Full sale-to-receipt cycle
- POS day-end flow
- GST report data accuracy after mixed transactions

### Frontend Testing

- Component unit tests for form validation
- Integration tests for invoice creation flow
- POS workflow tests (add items, apply discount, hold, recall, finalize)

---

## Summary

This plan covers 8 new backend modules and 6 new frontend page groups across 8 phases. The implementation follows a bottom-up dependency order:

```
Accounting Core (ledgers, journal entries) + Tax (GST rates)
    ↓
Inventory (products, stock, categories, units)
    ↓
Parties (customers, vendors) + Banking (bank accounts, transactions)
    ↓
Purchases (bills, returns, orders)
    ↓
Sales (invoices, credit notes, quotations)
    ↓
POS (backend integration for existing frontend at admin/src/pages/pos/)
    ↓
Reports (financial statements, GST reports, dashboard rewrite)
    ↓
Polish (migrations, RBAC, auditing, optimization)
```

Every financial event flows through the double-entry accounting system at `server/src/accounting/`, ensuring the books always balance and providing a complete audit trail.
