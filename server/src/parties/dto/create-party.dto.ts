import { IsString, IsOptional, IsEnum, IsNumber, IsObject, IsEmail, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePartyDto {
  @ApiProperty({ example: 'Acme Supplies Pvt Ltd', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'vendor', enum: ['customer', 'vendor', 'both'] })
  @IsEnum(['customer', 'vendor', 'both'])
  type: string;

  @ApiPropertyOptional({ example: '27AABCU9603R1ZM', maxLength: 15 })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  gstin?: string;

  @ApiPropertyOptional({ example: 'AABCU9603R', maxLength: 10 })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  pan?: string;

  @ApiPropertyOptional({ example: '+919876543210', maxLength: 15 })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  phone?: string;

  @ApiPropertyOptional({ example: 'contact@acme.com' })
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

  @ApiPropertyOptional({ example: '27', description: '2-digit state code for GST', maxLength: 2 })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  state_code?: string;

  @ApiPropertyOptional({ example: 50000 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  credit_limit?: number;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  credit_period_days?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  opening_balance?: number;

  @ApiPropertyOptional({ example: 'debit', enum: ['debit', 'credit'] })
  @IsOptional()
  @IsEnum(['debit', 'credit'])
  opening_balance_type?: string;
}
