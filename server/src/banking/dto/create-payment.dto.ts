import { IsString, IsOptional, IsUUID, IsEnum, IsNumber, IsDateString, IsArray, ValidateNested, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentAllocationDto {
  @ApiProperty({ enum: ['sales_invoice', 'purchase_bill', 'credit_note', 'debit_note'] })
  @IsEnum(['sales_invoice', 'purchase_bill', 'credit_note', 'debit_note'])
  document_type: string;

  @ApiProperty({ description: 'Document UUID' })
  @IsUUID()
  document_id: string;

  @ApiProperty({ example: 5000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;
}

export class CreatePaymentDto {
  @ApiProperty({ example: '2026-03-21' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Vendor party UUID' })
  @IsUUID()
  party_id: string;

  @ApiProperty({ description: 'Bank account UUID' })
  @IsUUID()
  bank_account_id: string;

  @ApiProperty({ example: 10000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;

  @ApiProperty({ example: 'bank_transfer', enum: ['cash', 'bank_transfer', 'cheque', 'upi', 'card', 'other'] })
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

  @ApiPropertyOptional({ example: 'UTR123456789', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  transaction_ref?: string;

  @ApiPropertyOptional({ example: 'Payment for PB-2526-0001' })
  @IsOptional()
  @IsString()
  narration?: string;

  @ApiPropertyOptional({ type: [PaymentAllocationDto], description: 'Allocate to specific bills' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentAllocationDto)
  allocations?: PaymentAllocationDto[];
}
