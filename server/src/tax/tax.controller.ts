import { Controller, Get, Post, Put, Param, Body, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TaxService } from './tax.service';
import { CreateTaxRateDto } from './dto/create-tax-rate.dto';
import { UpdateTaxRateDto } from './dto/update-tax-rate.dto';
import { UpdateBusinessSettingsDto } from './dto/update-business-settings.dto';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';

@ApiTags('Tax')
@ApiBearerAuth('access-token')
@Controller('tax')
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  // ─── Tax Rates ──────────────────────────────────

  @Post('rates')
  @RequirePermissions('tax:update')
  @ApiOperation({ summary: 'Create a tax rate' })
  async createTaxRate(@Body() dto: CreateTaxRateDto) {
    return this.taxService.createTaxRate(dto);
  }

  @Get('rates')
  @RequirePermissions('tax:read')
  @ApiOperation({ summary: 'List all tax rates' })
  async getTaxRates() {
    return this.taxService.getTaxRates();
  }

  @Put('rates/:id')
  @RequirePermissions('tax:update')
  @ApiOperation({ summary: 'Update a tax rate' })
  async updateTaxRate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaxRateDto,
  ) {
    return this.taxService.updateTaxRate(id, dto);
  }

  // ─── Business Settings ──────────────────────────

  @Get('business-settings')
  @RequirePermissions('tax:read')
  @ApiOperation({ summary: 'Get business settings' })
  async getBusinessSettings() {
    return this.taxService.getBusinessSettings();
  }

  @Put('business-settings')
  @RequirePermissions('tax:update')
  @ApiOperation({ summary: 'Update business settings' })
  async updateBusinessSettings(@Body() dto: UpdateBusinessSettingsDto) {
    return this.taxService.updateBusinessSettings(dto);
  }
}
