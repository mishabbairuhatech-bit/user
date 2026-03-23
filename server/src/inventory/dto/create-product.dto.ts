import { IsString, IsOptional, IsUUID, IsNumber, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Wireless Mouse', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'WM-001', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  sku: string;

  @ApiPropertyOptional({ example: '8901234567890', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  barcode?: string;

  @ApiPropertyOptional({ description: 'Category UUID' })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiPropertyOptional({ description: 'Unit UUID' })
  @IsOptional()
  @IsUUID()
  unit_id?: string;

  @ApiPropertyOptional({ description: 'HSN Code UUID' })
  @IsOptional()
  @IsUUID()
  hsn_code_id?: string;

  @ApiPropertyOptional({ description: 'Tax Rate UUID (overrides HSN default)' })
  @IsOptional()
  @IsUUID()
  tax_rate_id?: string;

  @ApiProperty({ example: 250.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  purchase_price: number;

  @ApiProperty({ example: 499.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  selling_price: number;

  @ApiPropertyOptional({ example: 399.00 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  wholesale_price?: number;

  @ApiPropertyOptional({ example: 10, description: 'Low stock alert threshold' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  minimum_stock?: number;

  @ApiPropertyOptional({ example: 100, description: 'Initial stock quantity' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  opening_stock?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  image_url?: string;
}
