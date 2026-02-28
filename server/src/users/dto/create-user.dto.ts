import { IsEmail, IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'john@example.com', description: 'Email address', maxLength: 255 })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: 'SecurePass1!', description: 'Password (min 8 chars)', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'John', description: 'First name', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  first_name: string;

  @ApiProperty({ example: 'Doe', description: 'Last name', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  last_name: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Phone number', maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'America/New_York', description: 'Timezone', maxLength: 50, default: 'UTC' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  timezone?: string;

  @ApiPropertyOptional({ example: 'en', description: 'Preferred language', maxLength: 10, default: 'en' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  language?: string;
}
