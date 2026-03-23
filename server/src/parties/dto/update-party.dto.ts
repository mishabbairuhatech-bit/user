import { IsString, IsOptional, IsEnum, IsNumber, IsObject, IsEmail, IsBoolean, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePartyDto {
  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ enum: ['customer', 'vendor', 'both'] })
  @IsOptional()
  @IsEnum(['customer', 'vendor', 'both'])
  type?: string;

  @ApiPropertyOptional({ maxLength: 15 })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  gstin?: string;

  @ApiPropertyOptional({ maxLength: 10 })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  pan?: string;

  @ApiPropertyOptional({ maxLength: 15 })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  billing_address?: { line1?: string; line2?: string; city?: string; state?: string; state_code?: string; pincode?: string };

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  shipping_address?: { line1?: string; line2?: string; city?: string; state?: string; state_code?: string; pincode?: string };

  @ApiPropertyOptional({ maxLength: 2 })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  state_code?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  credit_limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  credit_period_days?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
