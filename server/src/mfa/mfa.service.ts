import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { AppConfigService } from '../config/config.service';
import { EmailService } from '../common/services/email.service';
import { ERROR_MESSAGES } from '../common/constants/error-messages';
import { MFA_METHOD } from '../common/constants/app.constants';

@Injectable()
export class MfaService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: AppConfigService,
    private readonly emailService: EmailService,
  ) {}

  async setupEmailMfa(userId: string) {
    try {
      const user = await this.usersService.findByIdWithPassword(userId);
      if (!user) {
        throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      if (user.email_mfa_enabled) {
        throw new BadRequestException('Email MFA is already enabled.');
      }

      // Generate and send verification code
      const code = this.generateOtpCode();
      const expires = new Date();
      expires.setMinutes(expires.getMinutes() + 5);

      await this.usersService.updateMfaSettings(userId, {
        mfa_code: code,
        mfa_code_expires: expires,
      });

      // Send verification email
      await this.emailService.sendMfaVerificationEmail(user.email, user.first_name, code);

      return {
        message: 'Verification code sent to your email.',
      };
    } catch (error) {
      console.error('MfaService.setupEmailMfa error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to setup email MFA.');
    }
  }

  async verifyAndActivateEmailMfa(userId: string, code: string) {
    try {
      const user = await this.usersService.findByIdWithPassword(userId);
      if (!user) {
        throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      if (!user.mfa_code || !user.mfa_code_expires) {
        throw new BadRequestException('Email MFA setup has not been initiated. Please call setup first.');
      }

      if (new Date(user.mfa_code_expires) < new Date()) {
        throw new BadRequestException(ERROR_MESSAGES.MFA_CODE_EXPIRED);
      }

      if (user.mfa_code !== code) {
        throw new BadRequestException(ERROR_MESSAGES.MFA_CODE_INVALID);
      }

      // Clear the temporary code and enable email MFA
      await this.usersService.updateMfaSettings(userId, {
        mfa_enabled: true,
        email_mfa_enabled: true,
        mfa_method: user.totp_mfa_enabled ? 'BOTH' : MFA_METHOD.EMAIL,
        mfa_code: null as any,
        mfa_code_expires: null as any,
      });

      // Generate recovery codes if not already generated
      const recoveryCodes = user.recovery_codes && user.recovery_codes.length > 0
        ? null
        : await this.generateRecoveryCodes(userId);

      return {
        message: 'Email-based MFA has been enabled.',
        recovery_codes: recoveryCodes,
      };
    } catch (error) {
      console.error('MfaService.verifyAndActivateEmailMfa error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to verify and activate email MFA.');
    }
  }

  private generateOtpCode(): string {
    try {
      return Math.floor(100000 + Math.random() * 900000).toString();
    } catch (error) {
      console.error('MfaService.generateOtpCode error:', error);
      return '000000';
    }
  }

  async setupTotp(userId: string) {
    try {
      const user = await this.usersService.findByIdWithPassword(userId);
      if (!user) {
        throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      if (user.totp_mfa_enabled) {
        throw new BadRequestException('Authenticator app MFA is already enabled.');
      }

      const secret = authenticator.generateSecret();
      const otpAuthUrl = authenticator.keyuri(
        user.email,
        this.configService.webauthnRpName,
        secret,
      );

      // Store secret temporarily (not yet activated)
      await this.usersService.updateMfaSettings(userId, {
        totp_secret: secret,
      });

      const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

      return {
        secret,
        qr_code: qrCodeDataUrl,
        otpauth_url: otpAuthUrl,
      };
    } catch (error) {
      console.error('MfaService.setupTotp error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to setup TOTP.');
    }
  }

  async verifyAndActivateTotp(userId: string, code: string) {
    try {
      const user = await this.usersService.findByIdWithPassword(userId);
      if (!user) {
        throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      if (!user.totp_secret) {
        throw new BadRequestException('TOTP setup has not been initiated. Please call setup first.');
      }

      const isValid = authenticator.verify({ token: code, secret: user.totp_secret });
      if (!isValid) {
        throw new BadRequestException(ERROR_MESSAGES.MFA_CODE_INVALID);
      }

      await this.usersService.updateMfaSettings(userId, {
        mfa_enabled: true,
        totp_mfa_enabled: true,
        mfa_method: user.email_mfa_enabled ? 'BOTH' : MFA_METHOD.TOTP,
      });

      // Generate recovery codes if not already generated
      const recoveryCodes = user.recovery_codes && user.recovery_codes.length > 0
        ? null
        : await this.generateRecoveryCodes(userId);

      return {
        message: 'TOTP-based MFA has been enabled.',
        recovery_codes: recoveryCodes,
      };
    } catch (error) {
      console.error('MfaService.verifyAndActivateTotp error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to verify and activate TOTP.');
    }
  }

  async disableEmailMfa(userId: string, password: string) {
    try {
      const user = await this.usersService.findByIdWithPassword(userId);
      if (!user) {
        throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      if (!user.email_mfa_enabled) {
        throw new BadRequestException('Email MFA is not enabled.');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        throw new BadRequestException(ERROR_MESSAGES.OLD_PASSWORD_INCORRECT);
      }

      const updates: any = {
        email_mfa_enabled: false,
        mfa_code: null,
        mfa_code_expires: null,
      };

      // If TOTP is still enabled, keep MFA enabled
      if (user.totp_mfa_enabled) {
        updates.mfa_method = MFA_METHOD.TOTP;
      } else {
        updates.mfa_enabled = false;
        updates.mfa_method = null;
        updates.recovery_codes = null;
      }

      await this.usersService.updateMfaSettings(userId, updates);

      return { message: 'Email MFA has been disabled.' };
    } catch (error) {
      console.error('MfaService.disableEmailMfa error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to disable email MFA.');
    }
  }

  async disableTotpMfa(userId: string, password: string) {
    try {
      const user = await this.usersService.findByIdWithPassword(userId);
      if (!user) {
        throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      if (!user.totp_mfa_enabled) {
        throw new BadRequestException('Authenticator app MFA is not enabled.');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        throw new BadRequestException(ERROR_MESSAGES.OLD_PASSWORD_INCORRECT);
      }

      const updates: any = {
        totp_mfa_enabled: false,
        totp_secret: null,
      };

      // If email MFA is still enabled, keep MFA enabled
      if (user.email_mfa_enabled) {
        updates.mfa_method = MFA_METHOD.EMAIL;
      } else {
        updates.mfa_enabled = false;
        updates.mfa_method = null;
        updates.recovery_codes = null;
      }

      await this.usersService.updateMfaSettings(userId, updates);

      return { message: 'Authenticator app MFA has been disabled.' };
    } catch (error) {
      console.error('MfaService.disableTotpMfa error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to disable TOTP MFA.');
    }
  }

  async disableMfa(userId: string, password: string) {
    try {
      const user = await this.usersService.findByIdWithPassword(userId);
      if (!user) {
        throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      if (!user.mfa_enabled) {
        throw new BadRequestException(ERROR_MESSAGES.MFA_NOT_ENABLED);
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        throw new BadRequestException(ERROR_MESSAGES.OLD_PASSWORD_INCORRECT);
      }

      await this.usersService.updateMfaSettings(userId, {
        mfa_enabled: false,
        email_mfa_enabled: false,
        totp_mfa_enabled: false,
        mfa_method: null as any,
        mfa_code: null as any,
        mfa_code_expires: null as any,
        totp_secret: null as any,
        recovery_codes: null,
      });

      return { message: 'All MFA methods have been disabled.' };
    } catch (error) {
      console.error('MfaService.disableMfa error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to disable MFA.');
    }
  }

  async generateRecoveryCodes(userId: string): Promise<string[]> {
    try {
      const codes: Array<{ code: string; used: boolean }> = [];
      const plainCodes: string[] = [];

      for (let i = 0; i < 8; i++) {
        const code = `${crypto.randomBytes(2).toString('hex').toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
        codes.push({ code, used: false });
        plainCodes.push(code);
      }

      await this.usersService.updateMfaSettings(userId, {
        recovery_codes: codes,
      });

      return plainCodes;
    } catch (error) {
      console.error('MfaService.generateRecoveryCodes error:', error);
      throw new InternalServerErrorException('Failed to generate recovery codes.');
    }
  }

  async regenerateRecoveryCodes(userId: string) {
    try {
      const user = await this.usersService.findByIdWithPassword(userId);
      if (!user) {
        throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      if (!user.mfa_enabled) {
        throw new BadRequestException(ERROR_MESSAGES.MFA_NOT_ENABLED);
      }

      const codes = await this.generateRecoveryCodes(userId);
      return { recovery_codes: codes };
    } catch (error) {
      console.error('MfaService.regenerateRecoveryCodes error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to regenerate recovery codes.');
    }
  }
}
