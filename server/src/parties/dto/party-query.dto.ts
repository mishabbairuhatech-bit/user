import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto';

export class PartyQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ['customer', 'vendor', 'both'], description: 'Filter by party type' })
  @IsOptional()
  @IsEnum(['customer', 'vendor', 'both'])
  type?: string;
}
