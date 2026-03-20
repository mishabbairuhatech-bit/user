import { IsArray, IsNotEmpty, IsOptional, IsString, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterFaceDto {
  @ApiProperty({ description: 'Face descriptor array (128-dimensional)', type: [Number] })
  @IsArray()
  @ArrayMinSize(128)
  @IsNotEmpty()
  descriptor: number[];

  @ApiPropertyOptional({ example: 'My Face', description: 'Optional label for this face data' })
  @IsOptional()
  @IsString()
  label?: string;
}
