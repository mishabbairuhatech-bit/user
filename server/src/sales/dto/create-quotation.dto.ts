import { IsString, IsOptional, IsUUID, IsNumber, IsDateString, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QuotationItemDto {
  @ApiProperty()
  @IsUUID()
  product_id: string;

  @ApiProperty({ example: 10 })
  @IsNumber({ maxDecimalPlaces: 3 })
  quantity: number;

  @ApiProperty({ example: 499.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  unit_price: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  discount_percent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  unit_id?: string;
}

export class CreateQuotationDto {
  @ApiProperty({ example: '2026-03-21' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: '2026-04-05' })
  @IsOptional()
  @IsDateString()
  valid_until?: string;

  @ApiProperty()
  @IsUUID()
  party_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  terms?: string;

  @ApiProperty({ type: [QuotationItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuotationItemDto)
  items: QuotationItemDto[];
}
