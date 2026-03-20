export const ERROR_MESSAGES = {
  // Auth
  INVALID_CREDENTIALS: 'Invalid email or password.',
  INVALID_EMAIL: 'No account found with this email address.',
  INVALID_PASSWORD: 'Incorrect password.',
  ACCOUNT_LOCKED:
    'Account is temporarily locked due to too many failed login attempts. Please try again after 10 minutes.',
  ACCOUNT_DEACTIVATED: 'Your account has been deactivated. Please contact your administrator.',
  ACCOUNT_NOT_FOUND: 'Account not found.',
  EMAIL_NOT_VERIFIED: 'Please verify your email address before logging in.',

  // MFA
  MFA_CODE_INVALID: 'Invalid verification code. Please try again.',
  MFA_CODE_EXPIRED: 'Verification code has expired. Please request a new one.',
  MFA_TOKEN_INVALID: 'MFA session has expired. Please login again.',
  MFA_ALREADY_ENABLED: 'MFA is already enabled for this account.',
  MFA_NOT_ENABLED: 'MFA is not enabled for this account.',
  RECOVERY_CODE_INVALID: 'Invalid recovery code.',
  RECOVERY_CODE_USED: 'This recovery code has already been used.',

  // Password
  PASSWORD_TOO_WEAK:
    'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.',
  PASSWORD_REUSED: 'New password must not match any of your last 3 passwords.',
  OLD_PASSWORD_INCORRECT: 'Current password is incorrect.',
  RESET_TOKEN_INVALID: 'Invalid or expired password reset link.',
  RESET_TOKEN_EXPIRED: 'Password reset link has expired. Please request a new one.',

  // Tokens
  REFRESH_TOKEN_INVALID: 'Invalid or expired refresh token.',
  REFRESH_TOKEN_REUSE: 'Refresh token reuse detected. Session terminated for security.',
  ACCESS_TOKEN_EXPIRED: 'Access token has expired.',
  ACCESS_TOKEN_INVALID: 'Invalid access token.',

  // Sessions
  SESSION_NOT_FOUND: 'Session not found.',
  SESSION_EXPIRED: 'Session has expired. Please login again.',

  // Google
  GOOGLE_NO_ACCOUNT:
    'No account is linked to this Google account. Please contact your administrator.',

  // Passkey
  PASSKEY_NOT_FOUND: 'No passkeys registered for this account.',
  PASSKEY_VERIFY_FAILED: 'Passkey verification failed. Please try again.',
  PASSKEY_CLONE_DETECTED:
    'Credential appears to be cloned. Passkey has been disabled for security.',
  PASSKEY_CHALLENGE_EXPIRED: 'Passkey challenge has expired. Please try again.',

  // Face Auth
  FACE_NOT_FOUND: 'Face data not found.',
  FACE_NOT_REGISTERED: 'No face data registered for this account. Please register your face in Settings first.',
  FACE_NO_MATCH: 'Face does not match. Please try again.',
  FACE_INVALID_DESCRIPTOR: 'Invalid face data. Please try scanning your face again.',

  // Rate Limiting
  RATE_LIMITED: 'Too many requests. Please try again later.',

  // General
  USER_NOT_FOUND: 'User not found.',
  FORBIDDEN: 'You do not have permission to perform this action.',
} as const;
