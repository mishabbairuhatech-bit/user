import { IsString, IsOptional, IsUUID, IsEnum, IsNumber, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLedgerAccountDto {
  @ApiProperty({ example: 'SBI Current Account', maxLength: 150 })
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({ example: 'ACC-001', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  code?: string;

  @ApiProperty({ description: 'Account group UUID' })
  @IsUUID()
  group_id: string;

  @ApiPropertyOptional({ example: 0, description: 'Opening balance amount' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  opening_balance?: number;

  @ApiPropertyOptional({ example: 'debit', enum: ['debit', 'credit'] })
  @IsOptional()
  @IsEnum(['debit', 'credit'])
  opening_balance_type?: string;

  @ApiPropertyOptional({ example: 'Main business bank account' })
  @IsOptional()
  @IsString()
  description?: string;
}
