import { Injectable, Logger } from '@nestjs/common';
import * as geoip from 'geoip-lite';
import { AppConfigService } from '../../config/config.service';

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

  constructor(private readonly configService: AppConfigService) {}

  /**
   * Reverse geocode lat/long to get city, region, country using Google Geocoding API
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<GeoLocation> {
    const baseResult: GeoLocation = {
      city: null,
      region: null,
      country: null,
      country_code: null,
      latitude,
      longitude,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    const apiKey = this.configService.googleMapsApiKey;

    if (!apiKey) {
      this.logger.warn('Google Maps API key not configured, skipping reverse geocoding');
      return baseResult;
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&language=en`;

      this.logger.debug(`Calling Google Geocoding API for (${latitude}, ${longitude})`);

      const response = await fetch(url);

      if (!response.ok) {
        this.logger.warn(`Google Geocoding API failed with status: ${response.status}`);
        return baseResult;
      }

      const data = await response.json();

      if (data.status !== 'OK' || !data.results || data.results.length === 0) {
        this.logger.debug(`No results from Google Geocoding API: ${data.status}`);
        return baseResult;
      }

      // Parse address components from the first result
      const addressComponents = data.results[0].address_components || [];

      let city: string | null = null;
      let region: string | null = null;
      let country: string | null = null;
      let countryCode: string | null = null;

      for (const component of addressComponents) {
        const types = component.types || [];

        if (types.includes('locality')) {
          city = component.long_name;
        } else if (types.includes('administrative_area_level_2') && !city) {
          city = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          region = component.long_name;
        } else if (types.includes('country')) {
          country = component.long_name;
          countryCode = component.short_name;
        }
      }

      const result: GeoLocation = {
        city,
        region,
        country,
        country_code: countryCode,
        latitude,
        longitude,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      this.logger.debug(`Google reverse geocoding successful:`, result);
      return result;
    } catch (error) {
      this.logger.error(`Google reverse geocoding error for (${latitude}, ${longitude}):`, error);
      return baseResult;
    }
  }

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
      this.logger.debug(`Private/localhost IP detected: ${cleanIp}`);
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
