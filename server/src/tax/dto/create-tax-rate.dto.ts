import { IsString, IsNumber, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaxRateDto {
  @ApiProperty({ example: 'GST 18%', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 18.0, description: 'Total GST rate percentage' })
  @IsNumber({ maxDecimalPlaces: 2 })
  rate: number;

  @ApiPropertyOptional({ example: 0, description: 'Additional cess rate' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  cess_rate?: number;
}
