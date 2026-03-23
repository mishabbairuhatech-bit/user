import { IsString, IsOptional, IsUUID, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HoldBillDto {
  @ApiProperty({ description: 'Active POS session UUID' })
  @IsUUID()
  session_id: string;

  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  customer_name?: string;

  @ApiProperty({ description: 'Cart items as JSON array' })
  @IsArray()
  items: Array<{
    product_id: string;
    name: string;
    sku: string;
    qty: number;
    price: number;
    discount: number;
    tax_rate_id?: string;
  }>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
