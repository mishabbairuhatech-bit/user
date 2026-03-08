import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GoogleOneTapDto {
  @ApiProperty({ description: 'Google ID token (credential) from One Tap' })
  @IsString()
  @IsNotEmpty({ message: 'Credential is required.' })
  credential: string;

  @ApiPropertyOptional({ example: 'Chrome on Windows', description: 'Name of the device' })
  @IsOptional()
  @IsString()
  device_name?: string;

  @ApiPropertyOptional({ example: 'desktop', description: 'Type of device (desktop, mobile, tablet)' })
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
