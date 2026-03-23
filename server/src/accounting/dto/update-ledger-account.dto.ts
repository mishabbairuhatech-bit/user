import { IsString, IsOptional, IsNumber, IsEnum, IsBoolean, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLedgerAccountDto {
  @ApiPropertyOptional({ example: 'SBI Savings Account', maxLength: 150 })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({ example: 'ACC-002', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  code?: string;

  @ApiPropertyOptional({ example: 10000 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  opening_balance?: number;

  @ApiPropertyOptional({ example: 'debit', enum: ['debit', 'credit'] })
  @IsOptional()
  @IsEnum(['debit', 'credit'])
  opening_balance_type?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
