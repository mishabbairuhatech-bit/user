import { IsUUID, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OpenSessionDto {
  @ApiProperty({ description: 'Terminal UUID' })
  @IsUUID()
  terminal_id: string;

  @ApiPropertyOptional({ example: 5000, description: 'Opening cash in drawer' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  opening_cash?: number;
}
