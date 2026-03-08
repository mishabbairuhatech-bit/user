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
      this.logger.error(`Failed to send password reset email to ${to}`, error);
      throw new Error('Failed to send password reset email. Please try again later.');
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
      this.logger.error(`Failed to send MFA code to ${to}`, error);
      throw new Error('Failed to send verification code. Please try again later.');
    }
  }

  async sendMfaVerificationEmail(to: string, userName: string, code: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.smtpFrom,
        to,
        subject: 'Verify Your Email for MFA Setup',
        html: `
          <h2>Email Verification</h2>
          <p>Hello ${userName},</p>
          <p>You are setting up email-based multi-factor authentication (MFA).</p>
          <p>To verify your email address and complete the setup, please use this code:</p>
          <h1 style="letter-spacing: 5px; font-size: 32px; text-align: center; background: #f3f4f6; padding: 20px; border-radius: 8px;">${code}</h1>
          <p>This code will expire in 5 minutes.</p>
          <p>If you did not request this, please ignore this email or contact support if you're concerned about your account security.</p>
          <br>
          <p style="color: #666; font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
        `,
      });
      this.logger.log(`MFA verification email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send MFA verification email to ${to}`, error);
      throw new Error('Failed to send verification email. Please try again later.');
    }
  }
}
