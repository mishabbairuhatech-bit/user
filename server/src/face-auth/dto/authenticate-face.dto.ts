import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, IsNumber, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthenticateFaceDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email address of the account' })
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Face descriptor array (128-dimensional)', type: [Number] })
  @IsArray()
  @ArrayMinSize(128)
  @IsNotEmpty()
  descriptor: number[];

  @ApiPropertyOptional({ example: 'Web Browser', description: 'Name of the device' })
  @IsOptional()
  @IsString()
  device_name?: string;

  @ApiPropertyOptional({ example: 'web', description: 'Type of device' })
  @IsOptional()
  @IsString()
  device_type?: string;

  @ApiPropertyOptional({ example: 40.7128, description: 'Latitude from browser geolocation' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: -74.006, description: 'Longitude from browser geolocation' })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}
