import { Module } from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { AccountingController } from './accounting.controller';
import { accountingProviders } from './accounting.provider';

@Module({
  controllers: [AccountingController],
  providers: [AccountingService, ...accountingProviders],
  exports: [AccountingService],
})
export class AccountingModule {}
