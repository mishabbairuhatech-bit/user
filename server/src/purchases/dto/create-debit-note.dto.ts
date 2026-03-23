import { IsString, IsOptional, IsUUID, IsNumber, IsDateString, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DebitNoteItemDto {
  @ApiProperty({ description: 'Product UUID' })
  @IsUUID()
  product_id: string;

  @ApiProperty({ example: 2, description: 'Return quantity' })
  @IsNumber({ maxDecimalPlaces: 3 })
  quantity: number;

  @ApiProperty({ example: 250.00, description: 'Same as original bill line unit price' })
  @IsNumber({ maxDecimalPlaces: 2 })
  unit_price: number;
}

export class CreateDebitNoteDto {
  @ApiProperty({ example: '2026-03-21' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Original purchase bill UUID' })
  @IsUUID()
  original_bill_id: string;

  @ApiPropertyOptional({ example: 'Defective goods' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ type: [DebitNoteItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DebitNoteItemDto)
  items: DebitNoteItemDto[];
}
