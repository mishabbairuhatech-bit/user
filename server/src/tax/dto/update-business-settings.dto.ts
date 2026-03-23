import { IsString, IsOptional, IsInt, IsObject, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBusinessSettingsDto {
  @ApiPropertyOptional({ example: 'Acme Pvt Ltd', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  business_name?: string;

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

  @ApiPropertyOptional({ example: '27', description: '2-digit state code', maxLength: 2 })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  state_code?: string;

  @ApiPropertyOptional({ example: { line1: '123 Main St', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' } })
  @IsOptional()
  @IsObject()
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };

  @ApiPropertyOptional({ example: '+919876543210', maxLength: 15 })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  phone?: string;

  @ApiPropertyOptional({ example: 'info@acme.com', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logo_url?: string;

  @ApiPropertyOptional({ example: 'INV', maxLength: 10 })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  invoice_prefix?: string;

  @ApiPropertyOptional({ example: 4, description: 'Month number (1-12) when financial year starts' })
  @IsOptional()
  @IsInt()
  financial_year_start_month?: number;
}
