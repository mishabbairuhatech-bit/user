import { IsOptional, IsDateString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto';

export class LedgerQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by account group UUID' })
  @IsOptional()
  @IsUUID()
  group_id?: string;
}

export class LedgerStatementQueryDto {
  @ApiPropertyOptional({ example: '2025-04-01', description: 'Start date' })
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @ApiPropertyOptional({ example: '2026-03-31', description: 'End date' })
  @IsOptional()
  @IsDateString()
  to_date?: string;
}

export class ReportDateQueryDto {
  @ApiPropertyOptional({ example: '2026-03-31', description: 'As-of date for balance reports' })
  @IsOptional()
  @IsDateString()
  as_of_date?: string;

  @ApiPropertyOptional({ example: '2025-04-01' })
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @ApiPropertyOptional({ example: '2026-03-31' })
  @IsOptional()
  @IsDateString()
  to_date?: string;
}
