import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { salesProviders } from './sales.provider';
import { AccountingModule } from '../accounting/accounting.module';
import { InventoryModule } from '../inventory/inventory.module';
import { TaxModule } from '../tax/tax.module';

@Module({
  imports: [AccountingModule, InventoryModule, TaxModule],
  controllers: [SalesController],
  providers: [SalesService, ...salesProviders],
  exports: [SalesService],
})
export class SalesModule {}
