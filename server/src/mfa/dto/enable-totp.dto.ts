import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyTotpSetupDto {
  @ApiProperty({ example: '123456', description: 'TOTP code from authenticator app to confirm setup' })
  @IsString()
  @IsNotEmpty({ message: 'TOTP code is required.' })
  code: string;
}
