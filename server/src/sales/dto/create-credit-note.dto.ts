import { IsString, IsOptional, IsUUID, IsNumber, IsDateString, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreditNoteItemDto {
  @ApiProperty({ description: 'Product UUID' })
  @IsUUID()
  product_id: string;

  @ApiProperty({ example: 2 })
  @IsNumber({ maxDecimalPlaces: 3 })
  quantity: number;

  @ApiProperty({ example: 499.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  unit_price: number;
}

export class CreateCreditNoteDto {
  @ApiProperty({ example: '2026-03-21' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Original sales invoice UUID' })
  @IsUUID()
  original_invoice_id: string;

  @ApiPropertyOptional({ example: 'Customer returned defective items' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ type: [CreditNoteItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreditNoteItemDto)
  items: CreditNoteItemDto[];
}
