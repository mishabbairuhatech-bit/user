import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyMfaDto {
  @ApiProperty({ description: 'Temporary MFA token received after initial login' })
  @IsString()
  @IsNotEmpty({ message: 'MFA token is required.' })
  mfa_token: string;

  @ApiProperty({ example: '123456', description: 'MFA verification code (TOTP, email OTP, or recovery code)' })
  @IsString()
  @IsNotEmpty({ message: 'Verification code is required.' })
  code: string;

  @ApiPropertyOptional({ example: 'Chrome on MacOS', description: 'Name of the device' })
  @IsOptional()
  @IsString()
  device_name?: string;

  @ApiPropertyOptional({ example: 'desktop', description: 'Type of device (desktop, mobile, tablet)' })
  @IsOptional()
  @IsString()
  device_type?: string;
}
