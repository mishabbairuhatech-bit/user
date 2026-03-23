import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { REPOSITORY } from '../common/constants/app.constants';
import { TaxRate } from './entities/tax-rate.entity';
import { BusinessSettings } from './entities/business-settings.entity';
import { CreateTaxRateDto } from './dto/create-tax-rate.dto';
import { UpdateTaxRateDto } from './dto/update-tax-rate.dto';
import { UpdateBusinessSettingsDto } from './dto/update-business-settings.dto';

@Injectable()
export class TaxService {
  constructor(
    @Inject(REPOSITORY.TAX_RATES)
    private readonly taxRateRepo: typeof TaxRate,
    @Inject(REPOSITORY.BUSINESS_SETTINGS)
    private readonly businessSettingsRepo: typeof BusinessSettings,
  ) {}

  // ─── Tax Rates ──────────────────────────────────────

  async createTaxRate(dto: CreateTaxRateDto): Promise<TaxRate> {
    const halfRate = parseFloat((dto.rate / 2).toFixed(2));

    return this.taxRateRepo.create({
      name: dto.name,
      rate: dto.rate,
      cgst_rate: halfRate,
      sgst_rate: halfRate,
      igst_rate: dto.rate,
      cess_rate: dto.cess_rate || 0,
    } as any);
  }

  async getTaxRates(): Promise<TaxRate[]> {
    return this.taxRateRepo.findAll({
      order: [['rate', 'ASC']],
    });
  }

  async getTaxRate(id: string): Promise<TaxRate> {
    const rate = await this.taxRateRepo.findByPk(id);
    if (!rate) throw new NotFoundException('Tax rate not found.');
    return rate;
  }

  async updateTaxRate(id: string, dto: UpdateTaxRateDto): Promise<TaxRate> {
    const rate = await this.getTaxRate(id);

    const updateData: any = { ...dto };
    if (dto.rate !== undefined) {
      const halfRate = parseFloat((dto.rate / 2).toFixed(2));
      updateData.cgst_rate = halfRate;
      updateData.sgst_rate = halfRate;
      updateData.igst_rate = dto.rate;
    }

    await rate.update(updateData);
    return rate;
  }

  // ─── Tax Calculation ──────────────────────────────────

  /**
   * Core tax calculation utility — used by sales, purchases, POS modules.
   * Determines IGST vs CGST+SGST based on place of supply vs business state.
   */
  async calculateTax(params: {
    taxableAmount: number;
    taxRateId: string;
    placeOfSupply: string;
    businessStateCode?: string;
  }): Promise<{
    cgst_rate: number;
    cgst_amount: number;
    sgst_rate: number;
    sgst_amount: number;
    igst_rate: number;
    igst_amount: number;
    cess_rate: number;
    cess_amount: number;
    total_tax: number;
  }> {
    const taxRate = await this.getTaxRate(params.taxRateId);

    let businessStateCode = params.businessStateCode;
    if (!businessStateCode) {
      const settings = await this.getBusinessSettings();
      businessStateCode = settings?.state_code || '';
    }

    const isInterState = businessStateCode !== params.placeOfSupply;
    const taxableAmount = params.taxableAmount;

    const cessAmount = parseFloat(((taxableAmount * taxRate.cess_rate) / 100).toFixed(2));

    if (isInterState) {
      // Inter-state: IGST
      const igstAmount = parseFloat(((taxableAmount * taxRate.igst_rate) / 100).toFixed(2));
      return {
        cgst_rate: 0,
        cgst_amount: 0,
        sgst_rate: 0,
        sgst_amount: 0,
        igst_rate: taxRate.igst_rate,
        igst_amount: igstAmount,
        cess_rate: taxRate.cess_rate,
        cess_amount: cessAmount,
        total_tax: igstAmount + cessAmount,
      };
    } else {
      // Intra-state: CGST + SGST
      const cgstAmount = parseFloat(((taxableAmount * taxRate.cgst_rate) / 100).toFixed(2));
      const sgstAmount = parseFloat(((taxableAmount * taxRate.sgst_rate) / 100).toFixed(2));
      return {
        cgst_rate: taxRate.cgst_rate,
        cgst_amount: cgstAmount,
        sgst_rate: taxRate.sgst_rate,
        sgst_amount: sgstAmount,
        igst_rate: 0,
        igst_amount: 0,
        cess_rate: taxRate.cess_rate,
        cess_amount: cessAmount,
        total_tax: cgstAmount + sgstAmount + cessAmount,
      };
    }
  }

  // ─── Business Settings ──────────────────────────────

  async getBusinessSettings(): Promise<BusinessSettings> {
    let settings = await this.businessSettingsRepo.findOne();
    if (!settings) {
      // Auto-create default settings
      settings = await this.businessSettingsRepo.create({
        business_name: 'My Business',
        invoice_prefix: 'INV',
        financial_year_start_month: 4,
        currency_code: 'INR',
        decimal_places: 2,
      } as any);
    }
    return settings;
  }

  async updateBusinessSettings(dto: UpdateBusinessSettingsDto): Promise<BusinessSettings> {
    let settings = await this.businessSettingsRepo.findOne();
    if (!settings) {
      settings = await this.businessSettingsRepo.create({
        ...dto,
        business_name: dto.business_name || 'My Business',
      } as any);
    } else {
      await settings.update(dto);
    }
    return settings;
  }
}
