import { IsString, IsDateString, IsBoolean, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFinancialYearDto {
  @ApiProperty({ example: '2025-26', maxLength: 10 })
  @IsString()
  @MaxLength(10)
  name: string;

  @ApiProperty({ example: '2025-04-01' })
  @IsDateString()
  start_date: string;

  @ApiProperty({ example: '2026-03-31' })
  @IsDateString()
  end_date: string;

  @ApiPropertyOptional({ example: true, description: 'Set as active financial year' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
