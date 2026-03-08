import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { AppConfigService } from '../../config/config.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(private readonly configService: AppConfigService) {
    const callbackUrl = configService.googleCallbackUrl;
    console.log('===========================================');
    console.log('GOOGLE OAUTH CALLBACK URL:', callbackUrl);
    console.log('Add this EXACT URL to Google Cloud Console:');
    console.log('Authorized redirect URIs:', callbackUrl);
    console.log('===========================================');

    super({
      clientID: configService.googleClientId,
      clientSecret: configService.googleClientSecret,
      callbackURL: callbackUrl,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const { id, emails, name, photos } = profile;

    const googleUser = {
      google_id: id,
      email: emails?.[0]?.value,
      first_name: name?.givenName,
      last_name: name?.familyName,
      avatar_url: photos?.[0]?.value,
    };

    done(null, googleUser);
  }
}
