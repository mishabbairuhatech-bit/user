import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CloseSessionDto {
  @ApiProperty({ example: 15000, description: 'Actual cash counted in drawer at close' })
  @IsNumber({ maxDecimalPlaces: 2 })
  closing_cash: number;
}
