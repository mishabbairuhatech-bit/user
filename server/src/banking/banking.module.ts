import { Module } from '@nestjs/common';
import { BankingService } from './banking.service';
import { BankingController } from './banking.controller';
import { bankingProviders } from './banking.provider';
import { AccountingModule } from '../accounting/accounting.module';

@Module({
  imports: [AccountingModule],
  controllers: [BankingController],
  providers: [BankingService, ...bankingProviders],
  exports: [BankingService],
})
export class BankingModule {}
