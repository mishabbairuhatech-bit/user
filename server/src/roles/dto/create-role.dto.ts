import { IsString, IsOptional, IsArray, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'Manager' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'manager' })
  @IsString()
  @MaxLength(100)
  slug: string;

  @ApiProperty({ required: false, example: 'Operational management role' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [String], description: 'Array of permission UUIDs' })
  @IsArray()
  @IsUUID('4', { each: true })
  permission_ids: string[];
}
