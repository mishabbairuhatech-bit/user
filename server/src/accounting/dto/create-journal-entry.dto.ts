import { IsString, IsOptional, IsUUID, IsArray, ValidateNested, IsNumber, IsDateString, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class JournalEntryLineDto {
  @ApiProperty({ description: 'Ledger account UUID' })
  @IsUUID()
  ledger_account_id: string;

  @ApiProperty({ example: 1000, description: 'Debit amount (0 if credit line)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  debit: number;

  @ApiProperty({ example: 0, description: 'Credit amount (0 if debit line)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  credit: number;

  @ApiPropertyOptional({ example: 'Payment for goods' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateJournalEntryDto {
  @ApiProperty({ example: '2026-03-21', description: 'Transaction date' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Office rent payment for March 2026' })
  @IsString()
  narration: string;

  @ApiProperty({ type: [JournalEntryLineDto], description: 'Debit and credit lines (min 2)' })
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => JournalEntryLineDto)
  lines: JournalEntryLineDto[];
}
