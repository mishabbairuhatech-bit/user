import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  // Application
  get appPort(): number {
    return this.configService.get<number>('APP_PORT', 3000);
  }
  get appEnv(): string {
    return this.configService.get<string>('APP_ENV', 'development');
  }
  get appUrl(): string {
    return this.configService.get<string>('APP_URL', 'http://localhost:3000');
  }
  get frontendUrl(): string {
    return this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
  }

  // Database
  get dbHost(): string {
    return this.configService.get<string>('DB_HOST', 'localhost');
  }
  get dbPort(): number {
    return this.configService.get<number>('DB_PORT', 5432);
  }
  get dbUsername(): string {
    return this.configService.get<string>('DB_USERNAME', 'postgres');
  }
  get dbPassword(): string {
    return this.configService.get<string>('DB_PASSWORD', '');
  }
  get dbName(): string {
    return this.configService.get<string>('DB_NAME', 'main_db');
  }
  get dbSsl(): boolean {
    return this.configService.get<boolean>('DB_SSL', false);
  }

  // JWT
  get jwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET', '');
  }
  get jwtExpiresIn(): string {
    return this.configService.get<string>('JWT_EXPIRES_IN', '15m');
  }
  get jwtRefreshSecret(): string {
    return this.configService.get<string>('JWT_REFRESH_SECRET', '');
  }
  get jwtRefreshExpiresIn(): string {
    return this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
  }

  // Google OAuth
  get googleClientId(): string {
    return this.configService.get<string>('GOOGLE_CLIENT_ID', '');
  }
  get googleClientSecret(): string {
    return this.configService.get<string>('GOOGLE_CLIENT_SECRET', '');
  }
  get googleCallbackUrl(): string {
    return this.configService.get<string>(
      'GOOGLE_CALLBACK_URL',
      'http://localhost:3000/api/auth/google/callback',
    );
  }

  // WebAuthn
  get webauthnRpName(): string {
    return this.configService.get<string>('WEBAUTHN_RP_NAME', 'MyApp');
  }
  get webauthnRpId(): string {
    return this.configService.get<string>('WEBAUTHN_RP_ID', 'localhost');
  }
  get webauthnOrigin(): string {
    return this.configService.get<string>('WEBAUTHN_ORIGIN', 'http://localhost:5173');
  }

  // Security
  get maxFailedLoginAttempts(): number {
    return this.configService.get<number>('MAX_FAILED_LOGIN_ATTEMPTS', 5);
  }
  get accountLockDurationMinutes(): number {
    return this.configService.get<number>('ACCOUNT_LOCK_DURATION_MINUTES', 10);
  }
  get passwordResetTokenExpiresMinutes(): number {
    return this.configService.get<number>('PASSWORD_RESET_TOKEN_EXPIRES_MINUTES', 60);
  }
  get passwordHistoryCount(): number {
    return this.configService.get<number>('PASSWORD_HISTORY_COUNT', 3);
  }
  get bcryptSaltRounds(): number {
    return this.configService.get<number>('BCRYPT_SALT_ROUNDS', 12);
  }

  // Rate Limiting
  get throttleTtl(): number {
    return this.configService.get<number>('THROTTLE_TTL', 60);
  }
  get throttleLimit(): number {
    return this.configService.get<number>('THROTTLE_LIMIT', 100);
  }

  // SMTP
  get smtpHost(): string {
    return this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com');
  }
  get smtpPort(): number {
    return this.configService.get<number>('SMTP_PORT', 587);
  }
  get smtpUser(): string {
    return this.configService.get<string>('SMTP_USER', '');
  }
  get smtpPass(): string {
    return this.configService.get<string>('SMTP_PASS', '');
  }
  get smtpFrom(): string {
    return this.configService.get<string>('SMTP_FROM', 'noreply@yourapp.com');
  }
}
