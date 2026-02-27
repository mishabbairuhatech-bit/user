import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DisableMfaDto {
  @ApiProperty({ example: 'P@ssw0rd!', description: 'Account password to confirm MFA disable' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required to disable MFA.' })
  password: string;
}
