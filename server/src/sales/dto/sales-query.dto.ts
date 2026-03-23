import { IsOptional, IsUUID, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto';

export class SalesInvoiceQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  party_id?: string;

  @ApiPropertyOptional({ enum: ['unpaid', 'partial', 'paid'] })
  @IsOptional()
  @IsEnum(['unpaid', 'partial', 'paid'])
  payment_status?: string;

  @ApiPropertyOptional({ enum: ['sales', 'pos'] })
  @IsOptional()
  @IsEnum(['sales', 'pos'])
  source?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to_date?: string;
}
