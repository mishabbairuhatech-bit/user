import { Module } from '@nestjs/common';
import { PosService } from './pos.service';
import { PosController } from './pos.controller';
import { posProviders } from './pos.provider';
import { SalesModule } from '../sales/sales.module';
import { AccountingModule } from '../accounting/accounting.module';
import { BankingModule } from '../banking/banking.module';

@Module({
  imports: [SalesModule, AccountingModule, BankingModule],
  controllers: [PosController],
  providers: [PosService, ...posProviders],
  exports: [PosService],
})
export class PosModule {}
