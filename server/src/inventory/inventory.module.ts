import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { inventoryProviders } from './inventory.provider';
import { AccountingModule } from '../accounting/accounting.module';

@Module({
  imports: [AccountingModule],
  controllers: [InventoryController],
  providers: [InventoryService, ...inventoryProviders],
  exports: [InventoryService],
})
export class InventoryModule {}
