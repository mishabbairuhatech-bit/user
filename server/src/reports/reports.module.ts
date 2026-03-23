import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ExportService } from './export.service';
import { ReportsController } from './reports.controller';
import { AccountingModule } from '../accounting/accounting.module';

@Module({
  imports: [AccountingModule],
  controllers: [ReportsController],
  providers: [ReportsService, ExportService],
  exports: [ReportsService, ExportService],
})
export class ReportsModule {}
