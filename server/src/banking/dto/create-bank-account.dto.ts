import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBankAccountDto {
  @ApiProperty({ example: 'SBI Current Account', maxLength: 150 })
  @IsString()
  @MaxLength(150)
  account_name: string;

  @ApiPropertyOptional({ example: '1234567890', maxLength: 30 })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  account_number?: string;

  @ApiPropertyOptional({ example: 'State Bank of India', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bank_name?: string;

  @ApiPropertyOptional({ example: 'Andheri West', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  branch?: string;

  @ApiPropertyOptional({ example: 'SBIN0001234', maxLength: 11 })
  @IsOptional()
  @IsString()
  @MaxLength(11)
  ifsc_code?: string;

  @ApiProperty({ example: 'current', enum: ['current', 'savings', 'cash', 'wallet'] })
  @IsEnum(['current', 'savings', 'cash', 'wallet'])
  account_type: string;

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  opening_balance?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}
