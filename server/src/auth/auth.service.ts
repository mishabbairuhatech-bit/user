import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { AppConfigService } from '../config/config.service';
import { UsersService } from '../users/users.service';
import { SessionsService } from '../sessions/sessions.service';
import { PasswordHistoryService } from '../password-history/password-history.service';
import { EmailService } from '../common/services/email.service';
import { ERROR_MESSAGES } from '../common/constants/error-messages';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { VerifyMfaDto } from './dto/verify-mfa.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { GoogleOneTapDto } from './dto/google-one-tap.dto';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: AppConfigService,
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
    private readonly passwordHistoryService: PasswordHistoryService,
    private readonly emailService: EmailService,
  ) { }

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new UnauthorizedException(ERROR_MESSAGES.INVALID_EMAIL);
      }

      // Check if account is soft-deleted
      if (user.is_deleted) {
        throw new UnauthorizedException(ERROR_MESSAGES.ACCOUNT_NOT_FOUND);
      }

      // Check if account is locked
      if (user.locked_until && new Date(user.locked_until) > new Date()) {
        throw new UnauthorizedException(ERROR_MESSAGES.ACCOUNT_LOCKED);
      }

      // Check if account is active
      if (!user.is_active) {
        throw new UnauthorizedException(ERROR_MESSAGES.ACCOUNT_DEACTIVATED);
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        await this.usersService.incrementFailedAttempts(user.id);

        const newAttempts = user.failed_login_attempts + 1;
        if (newAttempts >= this.configService.maxFailedLoginAttempts) {
          await this.usersService.lockAccount(user.id, this.configService.accountLockDurationMinutes);
          throw new UnauthorizedException(ERROR_MESSAGES.ACCOUNT_LOCKED);
        }

        throw new UnauthorizedException(ERROR_MESSAGES.INVALID_PASSWORD);
      }

      // Reset failed attempts on successful password validation
      if (user.failed_login_attempts > 0) {
        await this.usersService.resetFailedAttempts(user.id);
      }

      return user;
    } catch (error) {
      console.error('AuthService.validateUser error:', error);
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException('Failed to validate user.');
    }
  }

  async login(user: User, loginDto: LoginDto, ip: string, userAgent: string) {
    try {
      // Check if MFA is enabled
      if (user.mfa_enabled) {
        const mfaMethod = user.mfa_method || 'email';

        if (mfaMethod === 'email') {
          // Generate and send email OTP
          const code = this.generateOtpCode();
          const expires = new Date();
          expires.setMinutes(expires.getMinutes() + 5);

          await this.usersService.updateMfaSettings(user.id, {
            mfa_code: code,
            mfa_code_expires: expires,
          });

          await this.emailService.sendMfaCode(user.email, user.first_name, code);

          const mfaToken = this.jwtService.sign(
            { sub: user.id, type: 'mfa' },
            { expiresIn: '10m' },
          );

          return {
            mfa_required: true,
            mfa_token: mfaToken,
            mfa_method: mfaMethod,
          };
        }

        // TOTP — no code to send
        const mfaToken = this.jwtService.sign(
          { sub: user.id, type: 'mfa' },
          { expiresIn: '10m' },
        );

        return {
          mfa_required: true,
          mfa_token: mfaToken,
          mfa_method: mfaMethod,
        };
      }

      return await this.completeLogin(user, loginDto, ip, userAgent);
    } catch (error) {
      console.error('AuthService.login error:', error);
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to process login.');
    }
  }

  async verifyMfaLogin(dto: VerifyMfaDto, ip: string, userAgent: string) {
    try {
      // Verify MFA token
      let decoded: { sub: string; type: string };
      try {
        decoded = this.jwtService.verify(dto.mfa_token);
        if (decoded.type !== 'mfa') {
          throw new Error();
        }
      } catch {
        throw new UnauthorizedException(ERROR_MESSAGES.MFA_TOKEN_INVALID);
      }

      const user = await this.usersService.findByIdWithPassword(decoded.sub);
      if (!user) {
        throw new UnauthorizedException(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      // Check if this is a recovery code (format: XXXX-XXXX)
      const isRecoveryCode = /^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/.test(dto.code.trim());

      let valid = false;

      if (isRecoveryCode) {
        valid = await this.verifyRecoveryCode(user, dto.code.trim());
      } else {
        if (user.totp_mfa_enabled) {
          const { authenticator } = await import('otplib');
          valid = authenticator.verify({ token: dto.code, secret: user.totp_secret });
        } else {
          // Email OTP
          if (!user.mfa_code || !user.mfa_code_expires) {
            throw new BadRequestException(ERROR_MESSAGES.MFA_CODE_EXPIRED);
          }
          if (new Date(user.mfa_code_expires) < new Date()) {
            throw new BadRequestException(ERROR_MESSAGES.MFA_CODE_EXPIRED);
          }
          valid = user.mfa_code === dto.code;

          // Clear the code after verification attempt
          if (valid) {
            await this.usersService.updateMfaSettings(user.id, {
              mfa_code: null as any,
              mfa_code_expires: null as any,
            });
          }
        }
      }

      if (!valid) {
        throw new BadRequestException(ERROR_MESSAGES.MFA_CODE_INVALID);
      }

      const loginDto: LoginDto = {
        email: user.email,
        password: '',
        device_name: dto.device_name,
        device_type: dto.device_type,
      };

      return await this.completeLogin(user, loginDto, ip, userAgent);
    } catch (error) {
      console.error('AuthService.verifyMfaLogin error:', error);
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to verify MFA login.');
    }
  }

  async googleLogin(googleUser: any, ip: string, userAgent: string) {
    try {
      // Login only — find user by google_id
      let user = await this.usersService.findByGoogleId(googleUser.google_id);

      if (!user) {
        // Also try to find by email (for linking)
        user = await this.usersService.findByEmail(googleUser.email);
        if (user && !user.google_id) {
          // Link google account to existing user
          await this.usersService.linkGoogleAccount(user.id, googleUser.google_id);
        } else if (!user) {
          throw new UnauthorizedException(ERROR_MESSAGES.GOOGLE_NO_ACCOUNT);
        }
      }

      if (!user.is_active) {
        throw new UnauthorizedException(ERROR_MESSAGES.ACCOUNT_DEACTIVATED);
      }

      const loginDto: LoginDto = {
        email: user.email,
        password: '',
        device_name: 'Google OAuth',
        device_type: 'web',
      };

      return await this.completeLogin(user, loginDto, ip, userAgent);
    } catch (error) {
      console.error('AuthService.googleLogin error:', error);
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException('Failed to process Google login.');
    }
  }

  async googleOneTapLogin(dto: GoogleOneTapDto, ip: string, userAgent: string) {
    try {
      // Verify the Google ID token
      const client = new OAuth2Client(this.configService.googleClientId);

      const ticket = await client.verifyIdToken({
        idToken: dto.credential,
        audience: this.configService.googleClientId,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid Google credential.');
      }

      const { sub: googleId, email, given_name, family_name, picture } = payload;

      if (!email) {
        throw new UnauthorizedException('Email not provided by Google.');
      }

      // Find user by google_id or email
      let user = await this.usersService.findByGoogleId(googleId);

      if (!user) {
        // Try to find by email (for linking)
        user = await this.usersService.findByEmail(email);
        if (user && !user.google_id) {
          // Link google account to existing user
          await this.usersService.linkGoogleAccount(user.id, googleId);
        } else if (!user) {
          throw new UnauthorizedException(ERROR_MESSAGES.GOOGLE_NO_ACCOUNT);
        }
      }

      if (!user.is_active) {
        throw new UnauthorizedException(ERROR_MESSAGES.ACCOUNT_DEACTIVATED);
      }

      // Check if MFA is enabled
      if (user.mfa_enabled) {
        const mfaMethod = user.mfa_method || 'email';

        if (mfaMethod === 'email' || mfaMethod === 'EMAIL') {
          // Generate and send email OTP
          const code = this.generateOtpCode();
          const expires = new Date();
          expires.setMinutes(expires.getMinutes() + 5);

          await this.usersService.updateMfaSettings(user.id, {
            mfa_code: code,
            mfa_code_expires: expires,
          });

          await this.emailService.sendMfaCode(user.email, user.first_name || 'User', code);
        }

        // Generate MFA token
        const mfaToken = this.jwtService.sign(
          { sub: user.id, type: 'mfa' },
          { expiresIn: '10m' },
        );

        return {
          mfa_required: true,
          mfa_token: mfaToken,
          mfa_method: mfaMethod.toUpperCase(),
        };
      }

      const loginDto: LoginDto = {
        email: user.email,
        password: '',
        device_name: dto.device_name || 'Google One Tap',
        device_type: dto.device_type || 'web',
      };

      return await this.completeLogin(user, loginDto, ip, userAgent);
    } catch (error) {
      console.error('AuthService.googleOneTapLogin error:', error);
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException('Failed to process Google One Tap login.');
    }
  }

  async refreshTokens(dto: RefreshTokenDto) {
    try {
      let decoded: { sub: string; session_id: string; refresh_token: string };
      try {
        decoded = this.jwtService.verify(dto.refresh_token, {
          secret: this.configService.jwtRefreshSecret,
        });
      } catch {
        throw new UnauthorizedException(ERROR_MESSAGES.REFRESH_TOKEN_INVALID);
      }

      const session = await this.sessionsService.findActiveSession(decoded.session_id, decoded.sub);
      if (!session) {
        throw new UnauthorizedException(ERROR_MESSAGES.SESSION_NOT_FOUND);
      }

      if (new Date(session.expires_at) < new Date()) {
        await this.sessionsService.terminateSession(session.id, decoded.sub);
        throw new UnauthorizedException(ERROR_MESSAGES.SESSION_EXPIRED);
      }

      // Verify refresh token hash
      const isValid = await this.sessionsService.verifyRefreshToken(session, decoded.refresh_token);
      if (!isValid) {
        // Potential token reuse — terminate session
        await this.sessionsService.terminateSession(session.id, decoded.sub);
        throw new UnauthorizedException(ERROR_MESSAGES.REFRESH_TOKEN_REUSE);
      }

      // Rotate refresh token
      const newRefreshToken = await this.sessionsService.rotateRefreshToken(session.id);

      const user = await this.usersService.findById(decoded.sub);
      if (!user) {
        throw new UnauthorizedException(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        session_id: session.id,
      };

      const accessToken = this.jwtService.sign(payload);
      const refreshJwt = this.jwtService.sign(
        { sub: user.id, session_id: session.id, refresh_token: newRefreshToken },
        {
          secret: this.configService.jwtRefreshSecret,
          expiresIn: this.configService.jwtRefreshExpiresIn,
        },
      );

      return {
        access_token: accessToken,
        refresh_token: refreshJwt,
      };
    } catch (error) {
      console.error('AuthService.refreshTokens error:', error);
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException('Failed to refresh tokens.');
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    try {
      const user = await this.usersService.findByEmail(dto.email);
      if (!user) {
        // Return success even if not found to prevent email enumeration
        return { message: 'If an account exists with this email, a password reset link has been sent.' };
      }

      const resetToken = uuidv4();
      const hashedToken = await bcrypt.hash(resetToken, 10);
      const expires = new Date();
      expires.setMinutes(expires.getMinutes() + this.configService.passwordResetTokenExpiresMinutes);

      await this.usersService.setPasswordResetToken(user.id, hashedToken, expires);
      await this.emailService.sendPasswordResetEmail(user.email, user.first_name, resetToken);

      return { message: 'If an account exists with this email, a password reset link has been sent.' };
    } catch (error) {
      console.error('AuthService.forgotPassword error:', error);
      throw new InternalServerErrorException('Failed to process forgot password request.');
    }
  }

  async resetPassword(dto: ResetPasswordDto) {
    try {
      const users = await this.usersService.findAllWithResetToken();

      let matchedUser: User | null = null;
      for (const user of users) {
        if (user.password_reset_token) {
          const isMatch = await bcrypt.compare(dto.token, user.password_reset_token);
          if (isMatch) {
            if (user.password_reset_expires && new Date(user.password_reset_expires) > new Date()) {
              matchedUser = user;
            }
            break;
          }
        }
      }

      if (!matchedUser) {
        throw new BadRequestException(ERROR_MESSAGES.RESET_TOKEN_INVALID);
      }

      // Check password history
      const isReused = await this.passwordHistoryService.isPasswordReused(
        matchedUser.id,
        dto.new_password,
      );
      if (isReused) {
        throw new BadRequestException(ERROR_MESSAGES.PASSWORD_REUSED);
      }

      // Also check against current password
      const matchesCurrent = await bcrypt.compare(dto.new_password, matchedUser.password_hash);
      if (matchesCurrent) {
        throw new BadRequestException(ERROR_MESSAGES.PASSWORD_REUSED);
      }

      const newHash = await bcrypt.hash(dto.new_password, this.configService.bcryptSaltRounds);
      await this.usersService.updatePassword(matchedUser.id, newHash);
      await this.passwordHistoryService.addEntry(matchedUser.id, newHash);

      // Invalidate all sessions
      await this.sessionsService.terminateAllSessions(matchedUser.id);

      return { message: 'Password reset successfully. Please login with your new password.' };
    } catch (error) {
      console.error('AuthService.resetPassword error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to reset password.');
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    try {
      const user = await this.usersService.findByIdWithPassword(userId);
      if (!user) {
        throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      const isOldPasswordValid = await bcrypt.compare(dto.old_password, user.password_hash);
      if (!isOldPasswordValid) {
        throw new BadRequestException(ERROR_MESSAGES.OLD_PASSWORD_INCORRECT);
      }

      // Check password history
      const isReused = await this.passwordHistoryService.isPasswordReused(userId, dto.new_password);
      if (isReused) {
        throw new BadRequestException(ERROR_MESSAGES.PASSWORD_REUSED);
      }

      // Also check against current password
      const matchesCurrent = await bcrypt.compare(dto.new_password, user.password_hash);
      if (matchesCurrent) {
        throw new BadRequestException(ERROR_MESSAGES.PASSWORD_REUSED);
      }

      const newHash = await bcrypt.hash(dto.new_password, this.configService.bcryptSaltRounds);
      await this.usersService.updatePassword(userId, newHash);
      await this.passwordHistoryService.addEntry(userId, newHash);

      // Terminate all sessions
      await this.sessionsService.terminateAllSessions(userId);

      return { message: 'Password changed successfully. All sessions have been terminated.' };
    } catch (error) {
      console.error('AuthService.changePassword error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to change password.');
    }
  }

  async logout(userId: string, sessionId: string) {
    try {
      await this.sessionsService.terminateSession(sessionId, userId);
      return { message: 'Logged out successfully.' };
    } catch (error) {
      console.error('AuthService.logout error:', error);
      throw new InternalServerErrorException('Failed to logout.');
    }
  }

  async logoutAll(userId: string) {
    try {
      await this.sessionsService.terminateAllSessions(userId);
      return { message: 'All sessions terminated successfully.' };
    } catch (error) {
      console.error('AuthService.logoutAll error:', error);
      throw new InternalServerErrorException('Failed to logout all sessions.');
    }
  }

  async getMe(userId: string) {
    try {
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new UnauthorizedException(ERROR_MESSAGES.USER_NOT_FOUND);
      }
      return user;
    } catch (error) {
      console.error('AuthService.getMe error:', error);
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException('Failed to get user profile.');
    }
  }

  // ── Private helpers ──

  private async completeLogin(user: User, loginDto: LoginDto, ip: string, userAgent: string) {
    try {
      const { session, refreshToken } = await this.sessionsService.createSession({
        userId: user.id,
        ip,
        userAgent,
        deviceName: loginDto.device_name,
        deviceType: loginDto.device_type,
      });

      await this.usersService.updateLastLogin(user.id);

      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        session_id: session.id,
      };

      const accessToken = this.jwtService.sign(payload);
      const refreshJwt = this.jwtService.sign(
        { sub: user.id, session_id: session.id, refresh_token: refreshToken },
        {
          secret: this.configService.jwtRefreshSecret,
          expiresIn: this.configService.jwtRefreshExpiresIn,
        },
      );

      const userData = user.toJSON();
      const {
        password_hash,
        password_reset_token,
        password_reset_expires,
        totp_secret,
        mfa_code,
        mfa_code_expires,
        recovery_codes,
        ...safeUser
      } = userData;

      return {
        access_token: accessToken,
        refresh_token: refreshJwt,
        user: safeUser,
      };
    } catch (error) {
      console.error('AuthService.completeLogin error:', error);
      throw new InternalServerErrorException('Failed to complete login.');
    }
  }

  private generateOtpCode(): string {
    try {
      return Math.floor(100000 + Math.random() * 900000).toString();
    } catch (error) {
      console.error('AuthService.generateOtpCode error:', error);
      return '000000';
    }
  }

  private async verifyRecoveryCode(user: User, code: string): Promise<boolean> {
    try {
      if (!user.recovery_codes || user.recovery_codes.length === 0) {
        return false;
      }

      const codeEntry = user.recovery_codes.find(
        (rc) => rc.code === code.toUpperCase() && !rc.used,
      );

      if (!codeEntry) {
        return false;
      }

      // Mark recovery code as used
      const updatedCodes = user.recovery_codes.map((rc) =>
        rc.code === codeEntry.code ? { ...rc, used: true } : rc,
      );

      await this.usersService.updateMfaSettings(user.id, { recovery_codes: updatedCodes });
      return true;
    } catch (error) {
      console.error('AuthService.verifyRecoveryCode error:', error);
      return false;
    }
  }
}
