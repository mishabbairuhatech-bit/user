import { Module } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { PurchasesController } from './purchases.controller';
import { purchasesProviders } from './purchases.provider';
import { AccountingModule } from '../accounting/accounting.module';
import { InventoryModule } from '../inventory/inventory.module';
import { TaxModule } from '../tax/tax.module';

@Module({
  imports: [AccountingModule, InventoryModule, TaxModule],
  controllers: [PurchasesController],
  providers: [PurchasesService, ...purchasesProviders],
  exports: [PurchasesService],
})
export class PurchasesModule {}
