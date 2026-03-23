import { IsString, IsOptional, IsUUID, IsNumber, IsDateString, IsArray, ValidateNested, ArrayMinSize, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PurchaseBillItemDto {
  @ApiProperty({ description: 'Product UUID' })
  @IsUUID()
  product_id: string;

  @ApiProperty({ example: 10 })
  @IsNumber({ maxDecimalPlaces: 3 })
  quantity: number;

  @ApiProperty({ example: 250.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  unit_price: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  discount_percent?: number;

  @ApiPropertyOptional({ description: 'Tax rate UUID (auto-detected from product if not set)' })
  @IsOptional()
  @IsUUID()
  tax_rate_id?: string;

  @ApiPropertyOptional({ description: 'Unit UUID' })
  @IsOptional()
  @IsUUID()
  unit_id?: string;
}

export class CreatePurchaseBillDto {
  @ApiProperty({ example: '2026-03-21' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: '2026-04-20' })
  @IsOptional()
  @IsDateString()
  due_date?: string;

  @ApiPropertyOptional({ example: 'VB-123', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  vendor_bill_number?: string;

  @ApiProperty({ description: 'Vendor party UUID' })
  @IsUUID()
  party_id: string;

  @ApiPropertyOptional({ example: '27', description: 'Place of supply state code' })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  place_of_supply?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  round_off?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [PurchaseBillItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PurchaseBillItemDto)
  items: PurchaseBillItemDto[];
}
