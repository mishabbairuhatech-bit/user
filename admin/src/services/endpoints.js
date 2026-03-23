const API = {
  // Auth
  LOGIN: "auth/login",
  LOGOUT: "auth/logout",
  LOGOUT_ALL: "auth/logout-all",
  GET_ME: "auth/me",
  REFRESH_TOKEN: "auth/refresh",
  FORGOT_PASSWORD: "auth/forgot-password",
  RESET_PASSWORD: "auth/reset-password",
  CHANGE_PASSWORD: "auth/change-password",

  // Auth - MFA
  MFA_VERIFY: "auth/mfa/verify",

  // Auth - Google OAuth
  GOOGLE_AUTH: "auth/google",
  GOOGLE_CALLBACK: "auth/google/callback",
  GOOGLE_ONE_TAP: "auth/google/one-tap",

  // MFA
  MFA_EMAIL_SETUP: "mfa/email/setup",
  MFA_EMAIL_VERIFY: "mfa/email/verify",
  MFA_EMAIL_DISABLE: "mfa/email/disable",
  MFA_TOTP_SETUP: "mfa/totp/setup",
  MFA_TOTP_VERIFY: "mfa/totp/verify",
  MFA_TOTP_DISABLE: "mfa/totp/disable",
  MFA_DISABLE: "mfa/disable",
  MFA_RECOVERY_CODES: "mfa/recovery-codes",

  // Sessions
  SESSIONS_LIST: "sessions",
  SESSION_DELETE: "sessions", // append /:id

  // Passkey
  PASSKEY_VERIFY_PASSWORD: "passkey/verify-password",
  PASSKEY_REGISTER_OPTIONS: "passkey/register/options",
  PASSKEY_REGISTER_VERIFY: "passkey/register/verify",
  PASSKEY_AUTH_OPTIONS: "passkey/auth/options",
  PASSKEY_AUTH_VERIFY: "passkey/auth/verify",
  PASSKEY_LIST: "passkey/list",
  PASSKEY_DELETE: "passkey", // append /:id

  // Users
  USERS_LIST: "users",
  USERS_CREATE: "users",
  USERS_DETAIL: "users", // append /:id
  USERS_ME: "users/me",
  USERS_ME_UPDATE: "users/me",
  USERS_ASSIGN_ROLE: "users", // append /:id/role

  // Roles & Permissions
  ROLES_LIST: "roles",
  ROLES_CREATE: "roles",
  ROLES_DETAIL: "roles", // append /:id
  ROLES_UPDATE: "roles", // append /:id
  ROLES_DELETE: "roles", // append /:id
  PERMISSIONS_ALL: "roles/permissions/all",
  PERMISSIONS_GROUPED: "roles/permissions/grouped",

  // Accounting
  ACCOUNT_GROUPS: "accounting/account-groups",
  LEDGER_ACCOUNTS: "accounting/ledger-accounts",
  JOURNAL_ENTRIES: "accounting/journal-entries",
  FINANCIAL_YEARS: "accounting/financial-years",
  TRIAL_BALANCE: "accounting/reports/trial-balance",
  PROFIT_AND_LOSS: "accounting/reports/profit-and-loss",
  BALANCE_SHEET: "accounting/reports/balance-sheet",

  // Tax
  TAX_RATES: "tax/rates",
  BUSINESS_SETTINGS: "tax/business-settings",
  GST_SUMMARY: "tax/gst-summary",
  GSTR1: "tax/gstr1",
  GSTR3B: "tax/gstr3b",

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

  // Banking
  BANK_ACCOUNTS: "banking/accounts",
  PAYMENTS: "banking/payments",
  RECEIPTS: "banking/receipts",
  PAYMENT_RECEIPTS: "banking/payment-receipts",
  BANK_TRANSFER: "banking/transfer",
  BANK_RECONCILIATION: "banking/reconciliation",

  // Reports & Exports
  DASHBOARD_SUMMARY: "reports/dashboard",
  EXPORT_SALES_INVOICES: "reports/export/sales-invoices",
  EXPORT_PURCHASE_BILLS: "reports/export/purchase-bills",
  EXPORT_PRODUCTS: "reports/export/products",
  EXPORT_PARTIES: "reports/export/parties",
};

export default API;
