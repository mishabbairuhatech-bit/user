import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PasskeyService } from './passkey.service';
import { PasskeyController } from './passkey.controller';
import { passkeyProviders } from './passkey.provider';
import { UsersModule } from '../users/users.module';
import { SessionsModule } from '../sessions/sessions.module';
import { AppConfigService } from '../config/config.service';

@Module({
  imports: [
    UsersModule,
    SessionsModule,
    JwtModule.registerAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        secret: config.jwtSecret,
        signOptions: { expiresIn: config.jwtExpiresIn },
      }),
    }),
  ],
  controllers: [PasskeyController],
  providers: [PasskeyService, ...passkeyProviders],
  exports: [PasskeyService],
})
export class PasskeyModule {}
