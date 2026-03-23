import { IsString, IsOptional, IsUUID, IsEnum, IsNumber, IsDateString, IsArray, ValidateNested, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentAllocationDto } from './create-payment.dto';

export class CreateReceiptDto {
  @ApiProperty({ example: '2026-03-21' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Customer party UUID' })
  @IsUUID()
  party_id: string;

  @ApiProperty({ description: 'Bank account UUID' })
  @IsUUID()
  bank_account_id: string;

  @ApiProperty({ example: 15000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;

  @ApiProperty({ example: 'upi', enum: ['cash', 'bank_transfer', 'cheque', 'upi', 'card', 'other'] })
  @IsEnum(['cash', 'bank_transfer', 'cheque', 'upi', 'card', 'other'])
  payment_mode: string;

  @ApiPropertyOptional({ maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  cheque_number?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  cheque_date?: string;

  @ApiPropertyOptional({ maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  transaction_ref?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  narration?: string;

  @ApiPropertyOptional({ type: [PaymentAllocationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentAllocationDto)
  allocations?: PaymentAllocationDto[];
}
