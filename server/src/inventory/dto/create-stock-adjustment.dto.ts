import { IsString, IsOptional, IsArray, ValidateNested, IsNumber, IsDateString, IsUUID, IsEnum, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StockAdjustmentItemDto {
  @ApiProperty({ description: 'Product UUID' })
  @IsUUID()
  product_id: string;

  @ApiProperty({ enum: ['increase', 'decrease'] })
  @IsEnum(['increase', 'decrease'])
  adjustment_type: string;

  @ApiProperty({ example: 10 })
  @IsNumber({ maxDecimalPlaces: 3 })
  quantity: number;

  @ApiProperty({ example: 100.00, description: 'Cost per unit for accounting entry' })
  @IsNumber({ maxDecimalPlaces: 2 })
  unit_cost: number;
}

export class CreateStockAdjustmentDto {
  @ApiProperty({ example: '2026-03-21' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 'Physical stock count correction' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ type: [StockAdjustmentItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => StockAdjustmentItemDto)
  items: StockAdjustmentItemDto[];
}
