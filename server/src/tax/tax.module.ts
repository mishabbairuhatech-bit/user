import { Module } from '@nestjs/common';
import { TaxService } from './tax.service';
import { TaxController } from './tax.controller';
import { taxProviders } from './tax.provider';

@Module({
  controllers: [TaxController],
  providers: [TaxService, ...taxProviders],
  exports: [TaxService],
})
export class TaxModule {}
