import { IsOptional, IsUUID, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto';

export class ProductQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by category UUID' })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiPropertyOptional({ enum: ['all', 'low_stock', 'out_of_stock'], description: 'Stock status filter' })
  @IsOptional()
  @IsEnum(['all', 'low_stock', 'out_of_stock'])
  stock_status?: string;

  @ApiPropertyOptional({ enum: ['true', 'false'], description: 'Filter active/inactive' })
  @IsOptional()
  is_active?: string;
}
