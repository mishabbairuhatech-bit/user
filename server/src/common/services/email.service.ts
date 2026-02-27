import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { AppConfigService } from '../../config/config.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: AppConfigService) {
    try {
      this.transporter = nodemailer.createTransport({
        host: this.configService.smtpHost,
        port: this.configService.smtpPort,
        secure: this.configService.smtpPort === 465,
        auth: {
          user: this.configService.smtpUser,
          pass: this.configService.smtpPass,
        },
      });
    } catch (error) {
      console.error('EmailService constructor error:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(to: string, userName: string, resetToken: string): Promise<void> {
    try {
      const resetUrl = `${this.configService.frontendUrl}/reset-password?token=${resetToken}`;

      await this.transporter.sendMail({
        from: this.configService.smtpFrom,
        to,
        subject: 'Password Reset Request',
        html: `
          <h2>Password Reset</h2>
          <p>Hello ${userName},</p>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <p><a href="${resetUrl}">Reset Password</a></p>
          <p>This link will expire in ${this.configService.passwordResetTokenExpiresMinutes} minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        `,
      });
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      console.error('EmailService.sendPasswordResetEmail error:', error);
      this.logger.error(`Failed to send password reset email to ${to}`, error);
    }
  }

  async sendMfaCode(to: string, userName: string, code: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.smtpFrom,
        to,
        subject: 'Your Login Verification Code',
        html: `
          <h2>Verification Code</h2>
          <p>Hello ${userName},</p>
          <p>Your verification code is:</p>
          <h1 style="letter-spacing: 5px; font-size: 32px; text-align: center;">${code}</h1>
          <p>This code will expire in 5 minutes.</p>
          <p>If you did not attempt to log in, please secure your account immediately.</p>
        `,
      });
      this.logger.log(`MFA code sent to ${to}`);
    } catch (error) {
      console.error('EmailService.sendMfaCode error:', error);
      this.logger.error(`Failed to send MFA code to ${to}`, error);
    }
  }
}
