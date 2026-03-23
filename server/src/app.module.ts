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
import { RolesModule } from './roles/roles.module';
import { AccountingModule } from './accounting/accounting.module';
import { TaxModule } from './tax/tax.module';
import { InventoryModule } from './inventory/inventory.module';
import { PartiesModule } from './parties/parties.module';
import { BankingModule } from './banking/banking.module';
import { PurchasesModule } from './purchases/purchases.module';
import { SalesModule } from './sales/sales.module';
import { PosModule } from './pos/pos.module';
import { ReportsModule } from './reports/reports.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';

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
    RolesModule,
    AccountingModule,
    TaxModule,
    InventoryModule,
    PartiesModule,
    BankingModule,
    PurchasesModule,
    SalesModule,
    PosModule,
    ReportsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
