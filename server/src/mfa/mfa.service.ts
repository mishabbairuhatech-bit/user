import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { AppConfigService } from '../config/config.service';
import { ERROR_MESSAGES } from '../common/constants/error-messages';
import { MFA_METHOD } from '../common/constants/app.constants';

@Injectable()
export class MfaService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: AppConfigService,
  ) {}

  async enableEmailMfa(userId: string) {
    try {
      const user = await this.usersService.findByIdWithPassword(userId);
      if (!user) {
        throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      if (user.mfa_enabled) {
        throw new BadRequestException(ERROR_MESSAGES.MFA_ALREADY_ENABLED);
      }

      await this.usersService.updateMfaSettings(userId, {
        mfa_enabled: true,
        mfa_method: MFA_METHOD.EMAIL,
      });

      // Generate recovery codes
      const recoveryCodes = await this.generateRecoveryCodes(userId);

      return {
        message: 'Email-based MFA has been enabled.',
        recovery_codes: recoveryCodes,
      };
    } catch (error) {
      console.error('MfaService.enableEmailMfa error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to enable email MFA.');
    }
  }

  async setupTotp(userId: string) {
    try {
      const user = await this.usersService.findByIdWithPassword(userId);
      if (!user) {
        throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      if (user.mfa_enabled) {
        throw new BadRequestException(ERROR_MESSAGES.MFA_ALREADY_ENABLED);
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
        mfa_method: MFA_METHOD.TOTP,
      });

      // Generate recovery codes
      const recoveryCodes = await this.generateRecoveryCodes(userId);

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
        mfa_method: null as any,
        mfa_code: null as any,
        mfa_code_expires: null as any,
        totp_secret: null as any,
        recovery_codes: null,
      });

      return { message: 'MFA has been disabled.' };
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
