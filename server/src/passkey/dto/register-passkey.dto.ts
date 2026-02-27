import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterPasskeyVerifyDto {
  @ApiProperty({ description: 'WebAuthn registration response object from the browser' })
  @IsObject()
  @IsNotEmpty()
  response: any;

  @ApiPropertyOptional({ example: 'MacBook Pro Touch ID', description: 'Friendly name for the passkey' })
  @IsOptional()
  @IsString()
  device_name?: string;
}
