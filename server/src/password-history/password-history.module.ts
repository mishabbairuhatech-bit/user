import { Module } from '@nestjs/common';
import { PasswordHistoryService } from './password-history.service';
import { passwordHistoryProviders } from './password-history.provider';

@Module({
  providers: [PasswordHistoryService, ...passwordHistoryProviders],
  exports: [PasswordHistoryService],
})
export class PasswordHistoryModule {}
