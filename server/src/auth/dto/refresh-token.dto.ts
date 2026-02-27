import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token received during login' })
  @IsString()
  @IsNotEmpty({ message: 'Refresh token is required.' })
  refresh_token: string;
}
