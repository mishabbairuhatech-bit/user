import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AppConfigService } from '../../config/config.service';
import { JwtRefreshPayload } from '../../common/interfaces/jwt-payload.interface';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private readonly configService: AppConfigService) {
    super({
      jwtFromRequest: (req: Request) => req?.cookies?.refresh_token || null,
      ignoreExpiration: false,
      secretOrKey: configService.jwtRefreshSecret,
    });
  }

  async validate(payload: JwtRefreshPayload) {
    return {
      id: payload.sub,
      session_id: payload.session_id,
      refresh_token: payload.refresh_token,
    };
  }
}
