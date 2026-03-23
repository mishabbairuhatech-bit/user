import { IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHsnCodeDto {
  @ApiProperty({ example: '84713010', maxLength: 10 })
  @IsString()
  @MaxLength(10)
  code: string;

  @ApiPropertyOptional({ example: 'Portable digital automatic data processing machines' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Default tax rate UUID' })
  @IsOptional()
  @IsUUID()
  tax_rate_id?: string;
}
