import { IsString, IsOptional, IsUUID, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BankTransferDto {
  @ApiProperty({ description: 'Source bank account UUID' })
  @IsUUID()
  from_account_id: string;

  @ApiProperty({ description: 'Target bank account UUID' })
  @IsUUID()
  to_account_id: string;

  @ApiProperty({ example: 25000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;

  @ApiProperty({ example: '2026-03-21' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 'Transfer to savings' })
  @IsOptional()
  @IsString()
  narration?: string;
}
