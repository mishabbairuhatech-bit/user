import { IsOptional, IsInt, Min, Max, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number (starts from 1)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Number of items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @ApiPropertyOptional({ example: 'created_at', description: 'Field to sort by' })
  @IsOptional()
  @IsString()
  sort_by: string = 'created_at';

  @ApiPropertyOptional({ example: 'DESC', description: 'Sort order', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sort_order: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({ example: 'john', description: 'Search keyword' })
  @IsOptional()
  @IsString()
  search?: string;

  get offset(): number {
    return (this.page - 1) * this.limit;
  }
}

export class PaginationMetaDto {
  @ApiPropertyOptional({ example: 50 })
  total: number;

  @ApiPropertyOptional({ example: 1 })
  page: number;

  @ApiPropertyOptional({ example: 10 })
  limit: number;

  @ApiPropertyOptional({ example: 5 })
  total_pages: number;

  @ApiPropertyOptional({ example: true })
  has_next: boolean;

  @ApiPropertyOptional({ example: false })
  has_prev: boolean;
}

export class PaginatedResponseDto<T = any> {
  items: T[];
  meta: PaginationMetaDto;
}
