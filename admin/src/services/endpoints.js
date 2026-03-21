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
};

export default API;
