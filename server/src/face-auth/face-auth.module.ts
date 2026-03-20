import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FaceAuthService } from './face-auth.service';
import { FaceAuthController } from './face-auth.controller';
import { faceAuthProviders } from './face-auth.provider';
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
  controllers: [FaceAuthController],
  providers: [FaceAuthService, ...faceAuthProviders],
  exports: [FaceAuthService],
})
export class FaceAuthModule {}
