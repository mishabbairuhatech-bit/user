import { IsEmail, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthenticatePasskeyOptionsDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email address of the account' })
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @IsNotEmpty()
  email: string;
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
}
