import { Module } from '@nestjs/common';
import { PartiesService } from './parties.service';
import { PartiesController } from './parties.controller';
import { partiesProviders } from './parties.provider';
import { AccountingModule } from '../accounting/accounting.module';

@Module({
  imports: [AccountingModule],
  controllers: [PartiesController],
  providers: [PartiesService, ...partiesProviders],
  exports: [PartiesService],
})
export class PartiesModule {}
