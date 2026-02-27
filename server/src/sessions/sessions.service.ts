import { Injectable, Inject, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { REPOSITORY } from '../common/constants/app.constants';
import { ERROR_MESSAGES } from '../common/constants/error-messages';
import { LoginSession } from './entities/login-session.entity';

@Injectable()
export class SessionsService {
  constructor(
    @Inject(REPOSITORY.LOGIN_SESSIONS)
    private readonly sessionRepository: typeof LoginSession,
  ) {}

  async createSession(data: {
    userId: string;
    ip: string;
    userAgent: string;
    deviceName?: string;
    deviceType?: string;
  }): Promise<{ session: LoginSession; refreshToken: string }> {
    try {
      const sessionId = uuidv4();
      const refreshToken = uuidv4();
      const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

      const deviceInfo = this.parseUserAgent(data.userAgent);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const session = await this.sessionRepository.create({
        id: sessionId,
        user_id: data.userId,
        refresh_token_hash: refreshTokenHash,
        device_name: data.deviceName || deviceInfo.browser,
        device_type: data.deviceType || 'web',
        ip_address: data.ip,
        user_agent: data.userAgent,
        os: deviceInfo.os,
        browser: deviceInfo.browser,
        is_active: true,
        last_activity_at: new Date(),
        expires_at: expiresAt,
      });

      return { session, refreshToken };
    } catch (error) {
      console.error('SessionsService.createSession error:', error);
      throw new InternalServerErrorException('Failed to create session.');
    }
  }

  async findActiveSession(sessionId: string, userId: string): Promise<LoginSession | null> {
    try {
      return await this.sessionRepository.findOne({
        where: { id: sessionId, user_id: userId, is_active: true },
      });
    } catch (error) {
      console.error('SessionsService.findActiveSession error:', error);
      throw new InternalServerErrorException('Failed to find active session.');
    }
  }

  async getActiveSessions(userId: string): Promise<LoginSession[]> {
    try {
      return await this.sessionRepository.findAll({
        where: { user_id: userId, is_active: true },
        attributes: [
          'id',
          'device_name',
          'device_type',
          'ip_address',
          'os',
          'browser',
          'last_activity_at',
          'created_at',
        ],
        order: [['last_activity_at', 'DESC']],
      });
    } catch (error) {
      console.error('SessionsService.getActiveSessions error:', error);
      throw new InternalServerErrorException('Failed to get active sessions.');
    }
  }

  async terminateSession(sessionId: string, userId: string): Promise<void> {
    try {
      const session = await this.sessionRepository.findOne({
        where: { id: sessionId, user_id: userId },
      });

      if (!session) {
        throw new NotFoundException(ERROR_MESSAGES.SESSION_NOT_FOUND);
      }

      await session.update({ is_active: false });
    } catch (error) {
      console.error('SessionsService.terminateSession error:', error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to terminate session.');
    }
  }

  async terminateAllSessions(userId: string): Promise<void> {
    try {
      await this.sessionRepository.update(
        { is_active: false },
        { where: { user_id: userId, is_active: true } },
      );
    } catch (error) {
      console.error('SessionsService.terminateAllSessions error:', error);
      throw new InternalServerErrorException('Failed to terminate all sessions.');
    }
  }

  async rotateRefreshToken(sessionId: string): Promise<string> {
    try {
      const newRefreshToken = uuidv4();
      const newHash = await bcrypt.hash(newRefreshToken, 10);

      await this.sessionRepository.update(
        { refresh_token_hash: newHash, last_activity_at: new Date() },
        { where: { id: sessionId } },
      );

      return newRefreshToken;
    } catch (error) {
      console.error('SessionsService.rotateRefreshToken error:', error);
      throw new InternalServerErrorException('Failed to rotate refresh token.');
    }
  }

  async verifyRefreshToken(session: LoginSession, refreshToken: string): Promise<boolean> {
    try {
      return await bcrypt.compare(refreshToken, session.refresh_token_hash);
    } catch (error) {
      console.error('SessionsService.verifyRefreshToken error:', error);
      throw new InternalServerErrorException('Failed to verify refresh token.');
    }
  }

  private parseUserAgent(userAgent: string): { os: string; browser: string } {
    try {
      let os = 'Unknown';
      let browser = 'Unknown';

      if (!userAgent) return { os, browser };

      if (userAgent.includes('Windows')) os = 'Windows';
      else if (userAgent.includes('Mac OS')) os = 'macOS';
      else if (userAgent.includes('Linux')) os = 'Linux';
      else if (userAgent.includes('Android')) os = 'Android';
      else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

      if (userAgent.includes('Firefox')) browser = 'Firefox';
      else if (userAgent.includes('Edg/')) browser = 'Edge';
      else if (userAgent.includes('Chrome')) browser = 'Chrome';
      else if (userAgent.includes('Safari')) browser = 'Safari';
      else if (userAgent.includes('Opera') || userAgent.includes('OPR')) browser = 'Opera';

      return { os, browser };
    } catch (error) {
      console.error('SessionsService.parseUserAgent error:', error);
      return { os: 'Unknown', browser: 'Unknown' };
    }
  }
}
