import { IsUUID, IsNumber, IsArray, ValidateNested, ArrayMinSize, IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PosReturnItemDto {
  @ApiProperty()
  @IsUUID()
  product_id: string;

  @ApiProperty({ example: 1 })
  @IsNumber({ maxDecimalPlaces: 3 })
  quantity: number;

  @ApiProperty({ example: 499.00 })
  @IsNumber({ maxDecimalPlaces: 2 })
  unit_price: number;
}

export class ProcessReturnDto {
  @ApiProperty({ description: 'Original sales invoice UUID' })
  @IsUUID()
  original_invoice_id: string;

  @ApiProperty({ type: [PosReturnItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PosReturnItemDto)
  items: PosReturnItemDto[];

  @ApiPropertyOptional({ enum: ['cash', 'card', 'upi'], description: 'Refund mode' })
  @IsOptional()
  @IsEnum(['cash', 'card', 'upi'])
  refund_mode?: string;
}
