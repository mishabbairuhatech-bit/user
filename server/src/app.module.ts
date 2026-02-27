import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppConfigModule } from './config/config.module';
import { AppConfigService } from './config/config.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SessionsModule } from './sessions/sessions.module';
import { PasswordHistoryModule } from './password-history/password-history.module';
import { MfaModule } from './mfa/mfa.module';
import { PasskeyModule } from './passkey/passkey.module';

@Module({
  imports: [
    // Core
    AppConfigModule,
    DatabaseModule,

    // Rate limiting
    ThrottlerModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        throttlers: [
          {
            ttl: config.throttleTtl * 1000,
            limit: config.throttleLimit,
          },
        ],
      }),
    }),

    // Feature modules
    UsersModule,
    AuthModule,
    SessionsModule,
    PasswordHistoryModule,
    MfaModule,
    PasskeyModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
