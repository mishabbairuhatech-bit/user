import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ERROR_MESSAGES } from '../../common/constants/error-messages';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Password reset token received via email' })
  @IsString()
  @IsNotEmpty({ message: 'Reset token is required.' })
  token: string;

  @ApiProperty({
    example: 'N3wP@ssw0rd!',
    description: 'New password (min 8 chars, must include uppercase, lowercase, digit, and special character)',
  })
  @IsString()
  @IsNotEmpty({ message: 'New password is required.' })
  @MinLength(8, { message: ERROR_MESSAGES.PASSWORD_TOO_WEAK })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`])/, {
    message: ERROR_MESSAGES.PASSWORD_TOO_WEAK,
  })
  new_password: string;
}
