import { IsString, IsOptional, IsUUID, IsNumber, IsArray, ValidateNested, ArrayMinSize, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PosBillItemDto {
  @ApiProperty()
  @IsUUID()
  product_id: string;

  @ApiProperty({ example: 2 })
  @IsNumber({ maxDecimalPlaces: 3 })
  quantity: number;

  @ApiProperty({ example: 499.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  unit_price: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  discount_percent?: number;
}

export class PaymentSplitDto {
  @ApiProperty({ enum: ['cash', 'card', 'upi'] })
  @IsEnum(['cash', 'card', 'upi'])
  mode: string;

  @ApiProperty({ example: 500 })
  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;
}

export class FinalizeBillDto {
  @ApiProperty({ description: 'Active POS session UUID' })
  @IsUUID()
  session_id: string;

  @ApiProperty({ type: [PosBillItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PosBillItemDto)
  items: PosBillItemDto[];

  @ApiProperty({ type: [PaymentSplitDto], description: 'Payment splits (cash, card, upi)' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PaymentSplitDto)
  payments: PaymentSplitDto[];

  @ApiPropertyOptional({ description: 'Customer party UUID (optional for walk-in)' })
  @IsOptional()
  @IsUUID()
  party_id?: string;

  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  customer_name?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  discount_amount?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  round_off?: number;
}
