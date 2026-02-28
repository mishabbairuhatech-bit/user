import { Injectable, Logger } from '@nestjs/common';
import * as geoip from 'geoip-lite';

export interface GeoLocation {
  city: string | null;
  region: string | null;
  country: string | null;
  country_code: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
}

@Injectable()
export class GeolocationService {
  private readonly logger = new Logger(GeolocationService.name);

  lookup(ip: string): GeoLocation {
    const emptyResult: GeoLocation = {
      city: null,
      region: null,
      country: null,
      country_code: null,
      latitude: null,
      longitude: null,
      timezone: null,
    };

    if (!ip) {
      this.logger.debug('No IP address provided for geolocation lookup');
      return emptyResult;
    }

    // Strip IPv6 prefix for IPv4-mapped addresses
    const cleanIp = ip.replace(/^::ffff:/, '');

    // Check if private/localhost IP
    const isPrivateIp =
      cleanIp === '127.0.0.1' ||
      cleanIp === '::1' ||
      cleanIp.startsWith('192.168.') ||
      cleanIp.startsWith('10.') ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(cleanIp);

    if (isPrivateIp) {
      this.logger.debug(`Private/localhost IP detected: ${cleanIp} - returning null geolocation data`);
      // For development: Return mock data (optional - can be removed in production)
      if (process.env.NODE_ENV === 'development') {
        return {
          city: 'Local',
          region: 'Development',
          country: 'Local Network',
          country_code: 'DEV',
          latitude: 0,
          longitude: 0,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
      }
      return emptyResult;
    }

    try {
      const geo = geoip.lookup(cleanIp);

      if (!geo) {
        this.logger.debug(`No geolocation data found for IP: ${cleanIp}`);
        return emptyResult;
      }

      const result = {
        city: geo.city || null,
        region: geo.region || null,
        country: geo.country || null,
        country_code: geo.country || null,
        latitude: geo.ll?.[0] ?? null,
        longitude: geo.ll?.[1] ?? null,
        timezone: geo.timezone || null,
      };

      this.logger.debug(`Geolocation lookup successful for IP: ${cleanIp}`, result);
      return result;
    } catch (error) {
      this.logger.error(`GeolocationService.lookup error for IP ${cleanIp}:`, error);
      return emptyResult;
    }
  }
}
