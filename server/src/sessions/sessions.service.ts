import { Injectable, Inject, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { REPOSITORY } from '../common/constants/app.constants';
import { ERROR_MESSAGES } from '../common/constants/error-messages';
import { LoginSession } from './entities/login-session.entity';
import { GeolocationService } from '../common/services/geolocation.service';

@Injectable()
export class SessionsService {
  constructor(
    @Inject(REPOSITORY.LOGIN_SESSIONS)
    private readonly sessionRepository: typeof LoginSession,
    private readonly geolocationService: GeolocationService,
  ) {}

  async createSession(data: {
    userId: string;
    ip: string;
    userAgent: string;
    deviceName?: string;
    deviceType?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<{ session: LoginSession; refreshToken: string }> {
    try {
      console.log('=== CREATE SESSION ===');
      console.log('Received data:', {
        userId: data.userId,
        ip: data.ip,
        deviceName: data.deviceName,
        deviceType: data.deviceType,
        latitude: data.latitude,
        longitude: data.longitude,
        hasLatitude: data.latitude !== undefined && data.latitude !== null,
        hasLongitude: data.longitude !== undefined && data.longitude !== null,
      });

      const sessionId = uuidv4();
      const refreshToken = uuidv4();
      const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

      const deviceInfo = this.parseUserAgent(data.userAgent);
      const now = new Date();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      let city: string | null = null;
      let region: string | null = null;
      let country: string | null = null;
      let countryCode: string | null = null;
      let latitude: number | null = null;
      let longitude: number | null = null;
      let timezone: string | null = null;

      // If client provided lat/long, use reverse geocoding to get location details
      if (data.latitude && data.longitude) {
        const reverseGeoResult = await this.geolocationService.reverseGeocode(
          data.latitude,
          data.longitude,
        );
        city = reverseGeoResult.city;
        region = reverseGeoResult.region;
        country = reverseGeoResult.country;
        countryCode = reverseGeoResult.country_code;
        latitude = data.latitude;
        longitude = data.longitude;
        timezone = reverseGeoResult.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

        console.log('Using reverse geocoding from client coordinates:', {
          clientCoords: { lat: data.latitude, lon: data.longitude },
          result: reverseGeoResult,
        });
      } else {
        // Fall back to IP-based geolocation
        const ipLocation = this.geolocationService.lookup(data.ip);
        city = ipLocation?.city || null;
        region = ipLocation?.region || null;
        country = ipLocation?.country || null;
        countryCode = ipLocation?.country_code || null;
        latitude = ipLocation?.latitude || null;
        longitude = ipLocation?.longitude || null;
        timezone = ipLocation?.timezone || null;

        console.log('Using IP-based geolocation:', {
          ip: data.ip,
          result: ipLocation,
        });
      }

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
        city,
        region,
        country,
        country_code: countryCode,
        latitude,
        longitude,
        timezone,
        is_active: true,
        login_at: now,
        last_activity_at: now,
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
          'city',
          'region',
          'country',
          'country_code',
          'latitude',
          'longitude',
          'timezone',
          'login_at',
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
