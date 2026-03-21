import { IsEmail, IsNotEmpty, IsObject, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthenticatePasskeyOptionsDto {
  @ApiPropertyOptional({ example: 'user@example.com', description: 'Email address (optional — omit for discoverable credential flow)' })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email?: string;
}

export class AuthenticatePasskeyVerifyDto {
  @ApiProperty({ description: 'Challenge ID returned from authentication options' })
  @IsString()
  @IsNotEmpty()
  challenge_id: string;

  @ApiProperty({ description: 'WebAuthn authentication response object from the browser' })
  @IsObject()
  @IsNotEmpty()
  response: any;

  @ApiPropertyOptional({ example: 'Chrome on MacOS', description: 'Name of the device' })
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
