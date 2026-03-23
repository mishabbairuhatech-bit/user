import { IsString, IsOptional, IsUUID, IsEnum, IsInt, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAccountGroupDto {
  @ApiProperty({ example: 'Current Assets', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Parent group UUID for sub-groups' })
  @IsOptional()
  @IsUUID()
  parent_id?: string;

  @ApiProperty({ example: 'assets', enum: ['assets', 'liabilities', 'income', 'expense', 'equity'] })
  @IsEnum(['assets', 'liabilities', 'income', 'expense', 'equity'])
  nature: string;

  @ApiPropertyOptional({ example: 0, description: 'Display order' })
  @IsOptional()
  @IsInt()
  sequence?: number;
}
