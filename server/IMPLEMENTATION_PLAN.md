# NestJS Server - User Module Implementation Plan

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture & Standards](#2-architecture--standards)
3. [Folder Structure](#3-folder-structure)
4. [Database Schema](#4-database-schema)
5. [Module Breakdown](#5-module-breakdown)
6. [Authentication Flows](#6-authentication-flows)
7. [Security Features](#7-security-features)
8. [API Endpoints](#8-api-endpoints)
9. [Error Handling](#9-error-handling)
10. [Environment Configuration](#10-environment-configuration)
11. [Dependencies](#11-dependencies)
12. [Implementation Order](#12-implementation-order)

---

## 1. Project Overview

Build a NestJS server with a fully-featured **User module** supporting:

- Email/password login (no signup via this route — admin-created users only)
- Google OAuth login (login only, no signup)
- Two-Factor Authentication (2FA) via Email OTP and TOTP (Authenticator App)
- Passkey authentication (WebAuthn / FIDO2)
- JWT Access Token + Refresh Token rotation
- Account lockout after 5 failed attempts (10-minute block)
- Password history enforcement (last 3 passwords cannot be reused)
- Session management (active sessions, terminate session, logout all)
- Password reset / forgot password flow

> **Note:** This project does NOT follow the FSM codebase architecture. It follows NestJS official best practices and international coding standards (lowercase kebab-case folders, barrel exports, clear separation of concerns, single-responsibility principle).

---

## 2. Architecture & Standards

### Design Principles

| Principle | Implementation |
|---|---|
| **Single Responsibility** | Each service handles one domain concern |
| **Dependency Injection** | NestJS IoC container, constructor injection |
| **DTO Validation** | `class-validator` + `class-transformer` on all inputs |
| **Guard-based Auth** | Passport strategies + custom guards |
| **Consistent Error Handling** | Global exception filter with standardized error response format |
| **Environment Separation** | `@nestjs/config` with `.env` validation via Joi |
| **Database Migrations** | Sequelize CLI migrations (no `sync` in production) |
| **Security Headers** | `helmet` middleware |
| **Rate Limiting** | `@nestjs/throttler` on auth endpoints |
| **CORS** | Configurable allowed origins |
| **Logging** | NestJS built-in Logger + structured logging |

### Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Folders | lowercase kebab-case | `auth/`, `users/`, `common/` |
| Files | lowercase kebab-case + suffix | `users.service.ts`, `auth.controller.ts` |
| Classes | PascalCase | `UsersService`, `AuthController` |
| DB Tables | snake_case plural | `users`, `password_histories` |
| DB Columns | snake_case | `failed_login_attempts`, `locked_until` |
| Env Variables | SCREAMING_SNAKE_CASE | `JWT_SECRET`, `GOOGLE_CLIENT_ID` |
| DTOs | PascalCase + Dto suffix | `LoginDto`, `ChangePasswordDto` |

---

## 3. Folder Structure

```
server/
├── src/
│   ├── main.ts                          # Bootstrap, global pipes, filters, helmet, cors
│   ├── app.module.ts                    # Root module
│   │
│   ├── config/                          # Environment configuration
│   │   ├── config.module.ts
│   │   ├── config.service.ts            # Typed config accessor
│   │   └── config.validation.ts         # Joi schema for .env validation
│   │
│   ├── database/                        # Database connection
│   │   ├── database.module.ts           # SequelizeModule.forRootAsync
│   │   └── database.providers.ts        # Model repository providers
│   │
│   ├── common/                          # Shared utilities
│   │   ├── constants/
│   │   │   ├── error-messages.ts        # Centralized error message strings
│   │   │   └── app.constants.ts         # App-wide constants
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts    # @CurrentUser() param decorator
│   │   │   └── public.decorator.ts          # @Public() to skip auth
│   │   ├── filters/
│   │   │   └── global-exception.filter.ts   # Standardized error response
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts            # JWT access token guard
│   │   │   ├── jwt-refresh.guard.ts         # Refresh token guard
│   │   │   ├── google-auth.guard.ts         # Google OAuth guard
│   │   │   └── throttle.guard.ts            # Rate limiting guard
│   │   ├── interceptors/
│   │   │   └── response-transform.interceptor.ts  # Wrap responses in standard format
│   │   ├── interfaces/
│   │   │   └── jwt-payload.interface.ts     # JWT payload type
│   │   └── pipes/
│   │       └── validation.pipe.ts           # Global validation pipe config
│   │
│   ├── auth/                            # Authentication module
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts              # Passport JWT strategy
│   │   │   ├── jwt-refresh.strategy.ts      # Refresh token strategy
│   │   │   ├── local.strategy.ts            # Email/password strategy
│   │   │   └── google.strategy.ts           # Google OAuth strategy
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       ├── refresh-token.dto.ts
│   │       ├── forgot-password.dto.ts
│   │       ├── reset-password.dto.ts
│   │       ├── change-password.dto.ts
│   │       └── verify-mfa.dto.ts
│   │
│   ├── users/                           # Users module
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.provider.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   └── dto/
│   │       └── update-user.dto.ts
│   │
│   ├── mfa/                             # Multi-Factor Authentication module
│   │   ├── mfa.module.ts
│   │   ├── mfa.controller.ts
│   │   ├── mfa.service.ts
│   │   └── dto/
│   │       ├── enable-totp.dto.ts
│   │       ├── verify-totp.dto.ts
│   │       └── enable-email-mfa.dto.ts
│   │
│   ├── passkey/                         # WebAuthn / Passkey module
│   │   ├── passkey.module.ts
│   │   ├── passkey.controller.ts
│   │   ├── passkey.service.ts
│   │   ├── entities/
│   │   │   └── passkey.entity.ts
│   │   ├── passkey.provider.ts
│   │   └── dto/
│   │       ├── register-passkey.dto.ts
│   │       └── authenticate-passkey.dto.ts
│   │
│   ├── sessions/                        # Login session management
│   │   ├── sessions.module.ts
│   │   ├── sessions.service.ts
│   │   ├── entities/
│   │   │   └── login-session.entity.ts
│   │   └── sessions.provider.ts
│   │
│   └── password-history/                # Password history tracking
│       ├── password-history.module.ts
│       ├── password-history.service.ts
│       ├── entities/
│       │   └── password-history.entity.ts
│       └── password-history.provider.ts
│
├── .env.example                         # Environment template
├── .eslintrc.js
├── .prettierrc
├── nest-cli.json
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── README.md
```

---

## 4. Database Schema

### 4.1 `users` Table

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, default UUIDV4 | Unique user identifier |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | User email address |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `first_name` | VARCHAR(100) | NOT NULL | User first name |
| `last_name` | VARCHAR(100) | NOT NULL | User last name |
| `phone` | VARCHAR(20) | NULLABLE | Phone number |
| `avatar_url` | VARCHAR(500) | NULLABLE | Profile picture URL |
| `timezone` | VARCHAR(50) | DEFAULT 'UTC' | User timezone |
| `language` | VARCHAR(10) | DEFAULT 'en' | Preferred language |
| `email_verified` | BOOLEAN | DEFAULT false | Email verification status |
| `is_active` | BOOLEAN | DEFAULT true | Account active flag |
| `is_deleted` | BOOLEAN | DEFAULT false | Soft delete flag |
| `last_login_at` | TIMESTAMP | NULLABLE | Last successful login |
| `password_changed_at` | TIMESTAMP | NULLABLE | Last password change |
| `failed_login_attempts` | INTEGER | DEFAULT 0 | Consecutive failed logins |
| `locked_until` | TIMESTAMP | NULLABLE | Account lockout expiry |
| `password_reset_token` | VARCHAR(255) | NULLABLE | Hashed reset token |
| `password_reset_expires` | TIMESTAMP | NULLABLE | Reset token expiry |
| `mfa_enabled` | BOOLEAN | DEFAULT false | MFA enabled flag |
| `mfa_method` | VARCHAR(10) | NULLABLE | 'email' or 'totp' |
| `mfa_code` | VARCHAR(6) | NULLABLE | Email OTP code |
| `mfa_code_expires` | TIMESTAMP | NULLABLE | Email OTP expiry |
| `totp_secret` | VARCHAR(255) | NULLABLE | TOTP secret (encrypted) |
| `recovery_codes` | JSONB | NULLABLE | MFA recovery codes |
| `google_id` | VARCHAR(255) | NULLABLE, UNIQUE | Google OAuth subject ID |
| `auth_provider` | VARCHAR(20) | DEFAULT 'local' | 'local' or 'google' |
| `created_at` | TIMESTAMP | auto | Record creation time |
| `updated_at` | TIMESTAMP | auto | Record update time |

### 4.2 `password_histories` Table

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, default UUIDV4 | Unique identifier |
| `user_id` | UUID | FK → users.id, NOT NULL | Associated user |
| `password_hash` | VARCHAR(255) | NOT NULL | Historical password hash |
| `created_at` | TIMESTAMP | auto | When password was set |

> Stores the last 3 password hashes per user. When a new password is set, the oldest entry (beyond 3) is deleted. On password change/reset, the new password is compared against all stored hashes.

### 4.3 `passkeys` Table (WebAuthn)

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, default UUIDV4 | Unique identifier |
| `user_id` | UUID | FK → users.id, NOT NULL | Associated user |
| `credential_id` | TEXT | NOT NULL, UNIQUE | WebAuthn credential ID (base64url) |
| `public_key` | TEXT | NOT NULL | COSE public key (base64url) |
| `counter` | BIGINT | DEFAULT 0 | Signature counter for clone detection |
| `device_name` | VARCHAR(255) | NULLABLE | User-assigned name for the passkey |
| `transports` | JSONB | NULLABLE | Supported transports (usb, ble, nfc, internal) |
| `backed_up` | BOOLEAN | DEFAULT false | Whether credential is multi-device |
| `last_used_at` | TIMESTAMP | NULLABLE | Last authentication time |
| `created_at` | TIMESTAMP | auto | Registration time |

### 4.4 `login_sessions` Table

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, default UUIDV4 | Session identifier |
| `user_id` | UUID | FK → users.id, NOT NULL | Associated user |
| `refresh_token_hash` | VARCHAR(255) | NOT NULL | Bcrypt hash of refresh token |
| `device_name` | VARCHAR(255) | NULLABLE | Device name |
| `device_type` | VARCHAR(50) | DEFAULT 'web' | web / mobile / desktop |
| `ip_address` | VARCHAR(45) | NULLABLE | Client IP address |
| `user_agent` | TEXT | NULLABLE | Full user agent string |
| `os` | VARCHAR(50) | NULLABLE | Detected operating system |
| `browser` | VARCHAR(50) | NULLABLE | Detected browser |
| `is_active` | BOOLEAN | DEFAULT true | Session active flag |
| `last_activity_at` | TIMESTAMP | NULLABLE | Last token refresh time |
| `expires_at` | TIMESTAMP | NOT NULL | Session expiry time |
| `created_at` | TIMESTAMP | auto | Session creation time |

---

## 5. Module Breakdown

### 5.1 ConfigModule (`config/`)

- Loads `.env` using `@nestjs/config`
- Validates all required env variables via Joi schema at startup
- Provides typed `AppConfigService` for accessing config values
- **Config Keys:** `DATABASE_*`, `JWT_*`, `GOOGLE_*`, `WEBAUTHN_*`, `SMTP_*`, `APP_*`

### 5.2 DatabaseModule (`database/`)

- Registers `SequelizeModule.forRootAsync` with PostgreSQL
- Provides model repositories via custom providers
- Models registered: `User`, `PasswordHistory`, `Passkey`, `LoginSession`
- **No `sync: true` in production** — uses migrations only

### 5.3 UsersModule (`users/`)

- **Entity:** `User` (Sequelize model matching schema above)
- **Service:** CRUD operations, find by email/id/google_id, account locking, failed attempt management
- **Controller:** `GET /users/me`, `PATCH /users/me` (self-update profile)
- **Provider:** `USERS_REPOSITORY` token

### 5.4 AuthModule (`auth/`)

The core authentication module. Orchestrates all login flows.

**Strategies:**
| Strategy | Purpose |
|---|---|
| `LocalStrategy` | Validates email + password, checks lockout |
| `JwtStrategy` | Validates access token on protected routes |
| `JwtRefreshStrategy` | Validates refresh token for token rotation |
| `GoogleStrategy` | Google OAuth2 login (no signup) |

**Service Methods:**
| Method | Description |
|---|---|
| `login()` | Email/password login → returns tokens or MFA challenge |
| `verifyMfaLogin()` | Verify MFA code/TOTP during login |
| `googleLogin()` | Handle Google OAuth callback → returns tokens |
| `refreshTokens()` | Rotate access + refresh tokens |
| `forgotPassword()` | Generate + send password reset email |
| `resetPassword()` | Validate reset token + update password (with history check) |
| `changePassword()` | Authenticated password change (with history check) |
| `logout()` | Terminate current session |
| `logoutAll()` | Terminate all user sessions |
| `getMe()` | Return authenticated user profile |

### 5.5 MfaModule (`mfa/`)

Handles enabling/disabling and verifying MFA.

**Service Methods:**
| Method | Description |
|---|---|
| `enableEmailMfa()` | Enable email-based OTP MFA |
| `enableTotp()` | Generate TOTP secret + QR code |
| `verifyAndActivateTotp()` | Verify initial TOTP code to activate |
| `disableMfa()` | Disable MFA (requires password) |
| `generateMfaCode()` | Generate 6-digit email OTP (5 min expiry) |
| `verifyMfaCode()` | Verify email OTP |
| `verifyTotp()` | Verify TOTP code |
| `generateRecoveryCodes()` | Generate 8 recovery codes |
| `verifyRecoveryCode()` | Use one-time recovery code |

### 5.6 PasskeyModule (`passkey/`)

WebAuthn / FIDO2 passkey registration and authentication.

**Dependencies:** `@simplewebauthn/server`

**Service Methods:**
| Method | Description |
|---|---|
| `generateRegistrationOptions()` | Create WebAuthn registration challenge |
| `verifyRegistration()` | Verify and store new passkey credential |
| `generateAuthenticationOptions()` | Create WebAuthn authentication challenge |
| `verifyAuthentication()` | Verify passkey assertion → return tokens |
| `listPasskeys()` | List user's registered passkeys |
| `deletePasskey()` | Remove a passkey |

**Challenge Storage:** Temporary challenges stored in-memory (Map) with TTL. For production, use Redis.

### 5.7 SessionsModule (`sessions/`)

Login session tracking and management.

**Service Methods:**
| Method | Description |
|---|---|
| `createSession()` | Create new login session with hashed refresh token |
| `findActiveSession()` | Find session by ID and user |
| `getActiveSessions()` | List all active sessions for a user |
| `terminateSession()` | Deactivate a specific session |
| `terminateAllSessions()` | Deactivate all user sessions |
| `rotateRefreshToken()` | Update session with new refresh token hash |

### 5.8 PasswordHistoryModule (`password-history/`)

Tracks password history and enforces reuse prevention.

**Service Methods:**
| Method | Description |
|---|---|
| `addEntry()` | Store a new password hash in history |
| `isPasswordReused()` | Compare new password against last 3 hashes |
| `pruneOldEntries()` | Keep only the last 3 entries per user |

---

## 6. Authentication Flows

### 6.1 Email/Password Login

```
Client                        Server
  │                              │
  │  POST /auth/login            │
  │  { email, password }         │
  │─────────────────────────────►│
  │                              │── Check if account is locked
  │                              │── Validate credentials (bcrypt)
  │                              │── If invalid: increment failed_login_attempts
  │                              │   If attempts >= 5: lock account for 10 min
  │                              │── If valid: reset failed_login_attempts
  │                              │── Check if MFA is enabled
  │                              │
  │  IF MFA DISABLED:            │
  │  ◄───────────────────────────│── Return { access_token, refresh_token, user }
  │                              │
  │  IF MFA ENABLED (email):     │
  │  ◄───────────────────────────│── Generate OTP, send email
  │  { mfa_required, mfa_token } │── Return MFA challenge token
  │                              │
  │  POST /auth/mfa/verify       │
  │  { mfa_token, code }         │
  │─────────────────────────────►│
  │  ◄───────────────────────────│── Return { access_token, refresh_token, user }
  │                              │
  │  IF MFA ENABLED (totp):      │
  │  ◄───────────────────────────│── Return MFA challenge token (no email sent)
  │  { mfa_required, mfa_token } │
  │                              │
  │  POST /auth/mfa/verify       │
  │  { mfa_token, code }         │
  │─────────────────────────────►│── Verify TOTP from authenticator app
  │  ◄───────────────────────────│── Return { access_token, refresh_token, user }
```

### 6.2 Google OAuth Login

```
Client                        Server                     Google
  │                              │                          │
  │  GET /auth/google            │                          │
  │─────────────────────────────►│                          │
  │  ◄───── 302 Redirect ───────│                          │
  │──────────────────────────────────────────────────────► │
  │              Google consent screen                      │
  │  ◄──────────────────────── Callback ───────────────── │
  │                              │                          │
  │  GET /auth/google/callback   │                          │
  │─────────────────────────────►│                          │
  │                              │── Extract google_id from profile
  │                              │── Find user by google_id
  │                              │── If NOT found: Return 401 "No account linked"
  │                              │   (No signup — admin must create account first)
  │                              │── If found: Check is_active, generate tokens
  │  ◄───────────────────────────│
  │  Redirect to frontend with   │
  │  tokens in query/fragment    │
```

> **Important:** Google auth is login-only. If no user exists with the matching `google_id`, the request is rejected with a clear error. An admin must first create the user and link their Google account.

### 6.3 Passkey (WebAuthn) Login

```
Client                        Server
  │                              │
  │  POST /passkey/auth/options  │
  │  { email }                   │
  │─────────────────────────────►│── Find user by email
  │                              │── Load user's registered passkeys
  │                              │── Generate authentication challenge
  │  ◄───────────────────────────│── Return { options, challenge_id }
  │                              │
  │  [Browser WebAuthn prompt]   │
  │  User verifies with biometric│
  │                              │
  │  POST /passkey/auth/verify   │
  │  { challenge_id, response }  │
  │─────────────────────────────►│── Verify assertion signature
  │                              │── Update counter (clone detection)
  │                              │── Generate tokens
  │  ◄───────────────────────────│── Return { access_token, refresh_token, user }
```

### 6.4 Token Refresh

```
Client                        Server
  │                              │
  │  POST /auth/refresh          │
  │  { refresh_token }           │
  │─────────────────────────────►│── Verify refresh JWT
  │                              │── Find active session
  │                              │── Verify refresh token hash (bcrypt)
  │                              │── If mismatch: terminate session (reuse detection)
  │                              │── Rotate: generate new refresh token
  │                              │── Update session with new hash
  │  ◄───────────────────────────│── Return { access_token, refresh_token }
```

### 6.5 Password Change (with History Check)

```
Client                        Server
  │                              │
  │  POST /auth/change-password  │
  │  { old_password, new_pass }  │
  │─────────────────────────────►│── Verify old password
  │                              │── Check new password != last 3 passwords
  │                              │   (bcrypt.compare against password_histories)
  │                              │── If reused: 400 "Password was recently used"
  │                              │── Hash new password
  │                              │── Save to password_histories
  │                              │── Update user.password_hash
  │                              │── Prune history (keep last 3)
  │                              │── Terminate all sessions (force re-login)
  │  ◄───────────────────────────│── Return success message
```

---

## 7. Security Features

### 7.1 Account Lockout

| Setting | Value |
|---|---|
| Max failed login attempts | **5** |
| Lockout duration | **10 minutes** |
| Counter reset on | Successful login |

**Implementation:**
- On failed login: `failed_login_attempts += 1`
- When `failed_login_attempts >= 5`: set `locked_until = NOW + 10 minutes`
- On next login attempt: if `locked_until > NOW`, reject with `"Account is temporarily locked. Please try again after 10 minutes."`
- On successful login: reset `failed_login_attempts = 0`, clear `locked_until`

### 7.2 Password History Enforcement

| Setting | Value |
|---|---|
| Passwords to remember | **3** |
| Check on | Password change, password reset |

**Implementation:**
- `password_histories` table stores the last 3 bcrypt hashes per user
- On password change/reset, iterate through stored hashes: `bcrypt.compare(newPlaintext, storedHash)`
- If any match, reject with: `"New password must not match any of your last 3 passwords."`
- After successful update, insert new hash and delete oldest if count > 3

### 7.3 JWT Token Strategy

| Token | Expiry | Storage | Purpose |
|---|---|---|---|
| Access Token | 15 minutes | Memory / HTTP-only cookie | API authorization |
| Refresh Token | 7 days | HTTP-only cookie | Silent token renewal |
| MFA Token | 10 minutes | Client memory | Temporary MFA challenge |

**Refresh Token Rotation:** Every refresh generates a new refresh token. The old one is invalidated. If a previously-used refresh token is presented (replay attack), the entire session is terminated.

### 7.4 Rate Limiting

| Endpoint | Limit |
|---|---|
| `POST /auth/login` | 10 requests / minute per IP |
| `POST /auth/forgot-password` | 3 requests / minute per IP |
| `POST /auth/mfa/verify` | 5 requests / minute per IP |
| `POST /passkey/auth/verify` | 10 requests / minute per IP |
| All other endpoints | 100 requests / minute per IP |

### 7.5 Passkey Security (WebAuthn)

- **Signature counter verification:** Detects credential cloning
- **Origin validation:** Only allows requests from configured RP origin
- **Challenge expiry:** 5-minute TTL on challenges
- **Attestation:** `'none'` for privacy (can be upgraded to `'direct'` if needed)
- **User verification:** Required (`'required'`) — enforces biometric/PIN

### 7.6 Google OAuth Security

- State parameter validation (CSRF protection via Passport)
- Login-only mode — if no user record exists with the Google ID, reject
- ID token verification via Google's libraries
- No user data stored from Google beyond the `google_id` link

### 7.7 Password Requirements

| Rule | Value |
|---|---|
| Minimum length | 8 characters |
| Require uppercase | At least 1 |
| Require lowercase | At least 1 |
| Require digit | At least 1 |
| Require special character | At least 1 (`!@#$%^&*()_+-=[]{};\|:'"<>,.?/~`) |

---

## 8. API Endpoints

### 8.1 Auth Endpoints (`/auth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/login` | Public | Email/password login |
| `POST` | `/auth/mfa/verify` | Public | Verify MFA code during login |
| `POST` | `/auth/refresh` | Public | Refresh access token |
| `POST` | `/auth/forgot-password` | Public | Request password reset email |
| `POST` | `/auth/reset-password` | Public | Reset password with token |
| `POST` | `/auth/change-password` | JWT | Change password (authenticated) |
| `POST` | `/auth/logout` | JWT | Terminate current session |
| `POST` | `/auth/logout-all` | JWT | Terminate all sessions |
| `GET` | `/auth/me` | JWT | Get authenticated user profile |
| `PATCH` | `/auth/me` | JWT | Update user profile |
| `GET` | `/auth/google` | Public | Redirect to Google OAuth |
| `GET` | `/auth/google/callback` | Public | Google OAuth callback |

### 8.2 MFA Endpoints (`/mfa`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/mfa/email/enable` | JWT | Enable email-based MFA |
| `POST` | `/mfa/totp/setup` | JWT | Generate TOTP secret + QR code |
| `POST` | `/mfa/totp/verify` | JWT | Verify TOTP to activate |
| `POST` | `/mfa/disable` | JWT | Disable MFA (requires password) |
| `POST` | `/mfa/recovery-codes` | JWT | Generate new recovery codes |

### 8.3 Passkey Endpoints (`/passkey`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/passkey/register/options` | JWT | Get WebAuthn registration options |
| `POST` | `/passkey/register/verify` | JWT | Verify and store new passkey |
| `POST` | `/passkey/auth/options` | Public | Get WebAuthn authentication options |
| `POST` | `/passkey/auth/verify` | Public | Verify passkey and return tokens |
| `GET` | `/passkey/list` | JWT | List user's registered passkeys |
| `DELETE` | `/passkey/:id` | JWT | Remove a passkey |

### 8.4 Session Endpoints (`/sessions`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/sessions` | JWT | List active sessions |
| `DELETE` | `/sessions/:id` | JWT | Terminate specific session |

---

## 9. Error Handling

### 9.1 Standard Error Response Format

All errors follow this format:

```json
{
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Account is temporarily locked. Please try again after 10 minutes.",
  "timestamp": "2026-02-27T10:30:00.000Z",
  "path": "/auth/login"
}
```

### 9.2 Error Messages Catalog

| Scenario | HTTP Status | Message |
|---|---|---|
| **Invalid credentials** | 401 | `"Invalid email or password."` |
| **Account locked** | 401 | `"Account is temporarily locked due to too many failed login attempts. Please try again after 10 minutes."` |
| **Account deactivated** | 401 | `"Your account has been deactivated. Please contact your administrator."` |
| **Account deleted** | 401 | `"Account not found."` |
| **Email not verified** | 403 | `"Please verify your email address before logging in."` |
| **MFA code invalid** | 400 | `"Invalid verification code. Please try again."` |
| **MFA code expired** | 400 | `"Verification code has expired. Please request a new one."` |
| **MFA token invalid** | 401 | `"MFA session has expired. Please login again."` |
| **Recovery code invalid** | 400 | `"Invalid recovery code."` |
| **Recovery code used** | 400 | `"This recovery code has already been used."` |
| **Password too weak** | 400 | `"Password must be at least 8 characters and include uppercase, lowercase, number, and special character."` |
| **Password reused** | 400 | `"New password must not match any of your last 3 passwords."` |
| **Old password wrong** | 400 | `"Current password is incorrect."` |
| **Reset token invalid** | 400 | `"Invalid or expired password reset link."` |
| **Reset token expired** | 400 | `"Password reset link has expired. Please request a new one."` |
| **Refresh token invalid** | 401 | `"Invalid or expired refresh token."` |
| **Refresh token reuse** | 401 | `"Refresh token reuse detected. Session terminated for security."` |
| **Session not found** | 404 | `"Session not found."` |
| **Session expired** | 401 | `"Session has expired. Please login again."` |
| **Google no account** | 401 | `"No account is linked to this Google account. Please contact your administrator."` |
| **Passkey not found** | 404 | `"No passkeys registered for this account."` |
| **Passkey verify fail** | 401 | `"Passkey verification failed. Please try again."` |
| **Passkey clone detected** | 401 | `"Credential appears to be cloned. Passkey has been disabled for security."` |
| **Rate limited** | 429 | `"Too many requests. Please try again later."` |
| **Token expired** | 401 | `"Access token has expired."` |
| **Token invalid** | 401 | `"Invalid access token."` |

---

## 10. Environment Configuration

### `.env.example`

```env
# ─── Application ─────────────────────────────────
APP_PORT=3000
APP_ENV=development
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# ─── Database (PostgreSQL) ───────────────────────
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=main_db

# ─── JWT ─────────────────────────────────────────
JWT_SECRET=your-jwt-secret-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
JWT_REFRESH_EXPIRES_IN=7d

# ─── Google OAuth ────────────────────────────────
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# ─── WebAuthn / Passkeys ────────────────────────
WEBAUTHN_RP_NAME=MyApp
WEBAUTHN_RP_ID=localhost
WEBAUTHN_ORIGIN=http://localhost:5173

# ─── Security ───────────────────────────────────
MAX_FAILED_LOGIN_ATTEMPTS=5
ACCOUNT_LOCK_DURATION_MINUTES=10
PASSWORD_RESET_TOKEN_EXPIRES_MINUTES=60
PASSWORD_HISTORY_COUNT=3
BCRYPT_SALT_ROUNDS=12

# ─── Rate Limiting ──────────────────────────────
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# ─── SMTP (for MFA & password reset emails) ─────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourapp.com
```

---

## 11. Dependencies

### Production Dependencies

```json
{
  "@nestjs/common": "^10.x",
  "@nestjs/core": "^10.x",
  "@nestjs/config": "^3.x",
  "@nestjs/jwt": "^10.x",
  "@nestjs/passport": "^10.x",
  "@nestjs/platform-express": "^10.x",
  "@nestjs/sequelize": "^10.x",
  "@nestjs/throttler": "^5.x",
  "passport": "^0.7.x",
  "passport-jwt": "^4.x",
  "passport-local": "^1.x",
  "passport-google-oauth20": "^2.x",
  "sequelize": "^6.x",
  "sequelize-typescript": "^2.x",
  "pg": "^8.x",
  "pg-hstore": "^2.x",
  "bcrypt": "^5.x",
  "class-validator": "^0.14.x",
  "class-transformer": "^0.5.x",
  "helmet": "^7.x",
  "uuid": "^9.x",
  "otplib": "^12.x",
  "qrcode": "^1.x",
  "@simplewebauthn/server": "^10.x",
  "joi": "^17.x",
  "nodemailer": "^6.x",
  "rxjs": "^7.x",
  "reflect-metadata": "^0.2.x"
}
```

### Dev Dependencies

```json
{
  "@nestjs/cli": "^10.x",
  "@nestjs/schematics": "^10.x",
  "@nestjs/testing": "^10.x",
  "@types/bcrypt": "^5.x",
  "@types/express": "^4.x",
  "@types/node": "^20.x",
  "@types/passport-jwt": "^4.x",
  "@types/passport-local": "^1.x",
  "@types/passport-google-oauth20": "^2.x",
  "@types/uuid": "^9.x",
  "@types/nodemailer": "^6.x",
  "@types/qrcode": "^1.x",
  "typescript": "^5.x",
  "ts-node": "^10.x",
  "eslint": "^8.x",
  "prettier": "^3.x",
  "@typescript-eslint/eslint-plugin": "^6.x",
  "@typescript-eslint/parser": "^6.x"
}
```

---

## 12. Implementation Order

The following is the recommended order of implementation, ensuring each step builds on the previous one:

### Phase 1: Project Scaffold & Core Infrastructure

| Step | Task | Description |
|---|---|---|
| 1.1 | Initialize NestJS project | `nest new server`, configure `tsconfig.json`, `nest-cli.json` |
| 1.2 | Config module | Create `AppConfigService` with Joi validation for all env vars |
| 1.3 | Database module | Configure Sequelize + PostgreSQL connection |
| 1.4 | Global setup in `main.ts` | Validation pipe, exception filter, helmet, CORS, response interceptor |
| 1.5 | Common utilities | Error messages constants, decorators (`@CurrentUser`, `@Public`), guards, interfaces |

### Phase 2: User Entity & Basic Auth

| Step | Task | Description |
|---|---|---|
| 2.1 | User entity | Create `User` model with all columns |
| 2.2 | Users module | Service with find/create/update methods, provider |
| 2.3 | Local strategy | Passport local strategy (email + password) |
| 2.4 | JWT strategy | Passport JWT strategy for access tokens |
| 2.5 | Auth service — login | Login flow, failed attempt tracking, lockout |
| 2.6 | Auth controller | `/auth/login`, `/auth/me` endpoints |
| 2.7 | JWT refresh strategy | Refresh token strategy + rotation |
| 2.8 | Auth controller — refresh | `/auth/refresh` endpoint |

### Phase 3: Session Management

| Step | Task | Description |
|---|---|---|
| 3.1 | LoginSession entity | Create `LoginSession` model |
| 3.2 | Sessions module | Service for session CRUD, provider |
| 3.3 | Integrate sessions into auth | Update login/refresh/logout to manage sessions |
| 3.4 | Session endpoints | `GET /sessions`, `DELETE /sessions/:id` |

### Phase 4: Password Management

| Step | Task | Description |
|---|---|---|
| 4.1 | PasswordHistory entity | Create `PasswordHistory` model |
| 4.2 | Password history module | Service for history tracking, comparison |
| 4.3 | Change password endpoint | `POST /auth/change-password` with history check |
| 4.4 | Forgot/reset password | `POST /auth/forgot-password`, `POST /auth/reset-password` with history check |
| 4.5 | Email service | Nodemailer integration for password reset and MFA emails |

### Phase 5: Multi-Factor Authentication

| Step | Task | Description |
|---|---|---|
| 5.1 | MFA service — email OTP | Generate, send, verify 6-digit codes |
| 5.2 | MFA service — TOTP | Setup secret, generate QR, verify codes via `otplib` |
| 5.3 | Recovery codes | Generate, store, verify one-time recovery codes |
| 5.4 | MFA login flow | Update auth login to handle MFA challenge/verify |
| 5.5 | MFA endpoints | Enable/disable MFA, setup TOTP, regenerate recovery codes |

### Phase 6: Google OAuth

| Step | Task | Description |
|---|---|---|
| 6.1 | Google strategy | Passport Google OAuth2 strategy |
| 6.2 | Google auth flow | Login-only: find user by `google_id`, reject if not found |
| 6.3 | Google endpoints | `GET /auth/google`, `GET /auth/google/callback` |
| 6.4 | Link Google account | Admin/user can link Google ID to existing account |

### Phase 7: Passkey (WebAuthn)

| Step | Task | Description |
|---|---|---|
| 7.1 | Passkey entity | Create `Passkey` model |
| 7.2 | Passkey service | Registration options/verify, authentication options/verify |
| 7.3 | Challenge store | In-memory Map with TTL for WebAuthn challenges |
| 7.4 | Passkey endpoints | Registration + authentication endpoints |

### Phase 8: Security Hardening

| Step | Task | Description |
|---|---|---|
| 8.1 | Rate limiting | Configure `@nestjs/throttler` per endpoint |
| 8.2 | Security headers | Ensure `helmet` is properly configured |
| 8.3 | CORS | Restrict origins to `FRONTEND_URL` |
| 8.4 | Input sanitization | Ensure all DTOs have proper validation rules |
| 8.5 | Sensitive data exclusion | Never return `password_hash`, `totp_secret`, etc. in API responses |

---

## Summary

This plan delivers a production-grade User authentication module with:

- **5 login methods:** Email/password, Google OAuth, Passkey, MFA (email OTP), MFA (TOTP)
- **Layered security:** Account lockout (5 attempts / 10 min), password history (last 3), refresh token rotation with reuse detection, rate limiting
- **Session management:** Multi-device session tracking, individual/bulk session termination
- **Standards compliance:** NestJS best practices, proper separation of concerns, DTO validation, Passport strategies, global error handling
- **No FSM architecture:** Clean kebab-case structure, no uppercase folder names, proper module encapsulation

Total estimated endpoints: **25**
Total database tables: **4** (users, login_sessions, password_histories, passkeys)
