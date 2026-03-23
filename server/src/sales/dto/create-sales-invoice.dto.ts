import { IsString, IsOptional, IsUUID, IsNumber, IsDateString, IsArray, ValidateNested, ArrayMinSize, IsEnum, IsObject, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SalesInvoiceItemDto {
  @ApiProperty({ description: 'Product UUID' })
  @IsUUID()
  product_id: string;

  @ApiProperty({ example: 5 })
  @IsNumber({ maxDecimalPlaces: 3 })
  quantity: number;

  @ApiProperty({ example: 499.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  unit_price: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  discount_percent?: number;

  @ApiPropertyOptional({ description: 'Override tax rate UUID' })
  @IsOptional()
  @IsUUID()
  tax_rate_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  unit_id?: string;

  @ApiPropertyOptional({ example: 'Custom description' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateSalesInvoiceDto {
  @ApiProperty({ example: '2026-03-21' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: '2026-04-20' })
  @IsOptional()
  @IsDateString()
  due_date?: string;

  @ApiPropertyOptional({ description: 'Customer party UUID (nullable for walk-in)' })
  @IsOptional()
  @IsUUID()
  party_id?: string;

  @ApiPropertyOptional({ example: '27', maxLength: 2 })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  place_of_supply?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  billing_address?: object;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  shipping_address?: object;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  discount_amount?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  round_off?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  terms?: string;

  @ApiPropertyOptional({ enum: ['sales', 'pos'], default: 'sales' })
  @IsOptional()
  @IsEnum(['sales', 'pos'])
  source?: string;

  @ApiProperty({ type: [SalesInvoiceItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SalesInvoiceItemDto)
  items: SalesInvoiceItemDto[];
}
