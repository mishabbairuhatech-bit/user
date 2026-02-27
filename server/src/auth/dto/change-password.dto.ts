import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ERROR_MESSAGES } from '../../common/constants/error-messages';

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldP@ssw0rd!', description: 'Current account password' })
  @IsString()
  @IsNotEmpty({ message: 'Current password is required.' })
  old_password: string;

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
