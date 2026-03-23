import { Controller, Get, Query, Res, Header } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { ExportService } from './export.service';
import { GSTReportPeriodDto, DateRangeDto, DashboardQueryDto } from './dto/report-query.dto';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { SalesInvoice } from '../sales/entities/sales-invoice.entity';
import { PurchaseBill } from '../purchases/entities/purchase-bill.entity';
import { Product } from '../inventory/entities/product.entity';
import { Party } from '../parties/entities/party.entity';
import { Op } from 'sequelize';

@ApiTags('Reports')
@ApiBearerAuth('access-token')
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly exportService: ExportService,
  ) {}

  @Get('gst-summary')
  @RequirePermissions('tax:read')
  @ApiOperation({ summary: 'Get GST credit summary (input vs output)' })
  async getGSTSummary(@Query() query: DateRangeDto) {
    return this.reportsService.getGSTSummary(query);
  }

  @Get('gstr1')
  @RequirePermissions('tax:read')
  @ApiOperation({ summary: 'Get GSTR-1 report data (outward supplies)' })
  async getGSTR1Data(@Query() query: GSTReportPeriodDto) {
    return this.reportsService.getGSTR1Data(query);
  }

  @Get('gstr3b')
  @RequirePermissions('tax:read')
  @ApiOperation({ summary: 'Get GSTR-3B report data (summary return)' })
  async getGSTR3BData(@Query() query: GSTReportPeriodDto) {
    return this.reportsService.getGSTR3BData(query);
  }

  @Get('dashboard')
  @RequirePermissions('dashboard:view')
  @ApiOperation({ summary: 'Get dashboard summary metrics' })
  async getDashboardSummary(@Query() query: DashboardQueryDto) {
    return this.reportsService.getDashboardSummary(query);
  }

  // ─── CSV Export Endpoints ──────────────────────────

  @Get('export/sales-invoices')
  @RequirePermissions('reports:export')
  @ApiOperation({ summary: 'Export sales invoices to CSV' })
  async exportSalesInvoices(@Query() query: DateRangeDto, @Res() res: Response) {
    const where: any = { is_cancelled: false };
    if (query.from_date) where.date = { ...where.date, [Op.gte]: query.from_date };
    if (query.to_date) where.date = { ...where.date, [Op.lte]: query.to_date };

    const invoices = await SalesInvoice.findAll({
      where,
      include: [{ model: Party, attributes: ['name', 'gstin'] }],
      order: [['date', 'ASC']],
      raw: true, nest: true,
    });

    const flat = this.exportService.flatten(invoices as any[], { party: ['name', 'gstin'] });
    const csv = this.exportService.toCSV(flat, [
      { key: 'invoice_number', header: 'Invoice #' },
      { key: 'date', header: 'Date' },
      { key: 'party_name', header: 'Customer' },
      { key: 'party_gstin', header: 'GSTIN' },
      { key: 'taxable_amount', header: 'Taxable Amount' },
      { key: 'cgst_amount', header: 'CGST' },
      { key: 'sgst_amount', header: 'SGST' },
      { key: 'igst_amount', header: 'IGST' },
      { key: 'total_tax', header: 'Total Tax' },
      { key: 'grand_total', header: 'Grand Total' },
      { key: 'amount_paid', header: 'Amount Paid' },
      { key: 'balance_due', header: 'Balance Due' },
      { key: 'payment_status', header: 'Status' },
      { key: 'source', header: 'Source' },
    ]);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sales-invoices.csv');
    res.send(csv);
  }

  @Get('export/purchase-bills')
  @RequirePermissions('reports:export')
  @ApiOperation({ summary: 'Export purchase bills to CSV' })
  async exportPurchaseBills(@Query() query: DateRangeDto, @Res() res: Response) {
    const where: any = { is_cancelled: false };
    if (query.from_date) where.date = { ...where.date, [Op.gte]: query.from_date };
    if (query.to_date) where.date = { ...where.date, [Op.lte]: query.to_date };

    const bills = await PurchaseBill.findAll({
      where,
      include: [{ model: Party, attributes: ['name', 'gstin'] }],
      order: [['date', 'ASC']],
      raw: true, nest: true,
    });

    const flat = this.exportService.flatten(bills as any[], { party: ['name', 'gstin'] });
    const csv = this.exportService.toCSV(flat, [
      { key: 'bill_number', header: 'Bill #' },
      { key: 'vendor_bill_number', header: 'Vendor Bill #' },
      { key: 'date', header: 'Date' },
      { key: 'party_name', header: 'Vendor' },
      { key: 'party_gstin', header: 'GSTIN' },
      { key: 'taxable_amount', header: 'Taxable Amount' },
      { key: 'cgst_amount', header: 'CGST' },
      { key: 'sgst_amount', header: 'SGST' },
      { key: 'igst_amount', header: 'IGST' },
      { key: 'total_tax', header: 'Total Tax' },
      { key: 'grand_total', header: 'Grand Total' },
      { key: 'amount_paid', header: 'Amount Paid' },
      { key: 'balance_due', header: 'Balance Due' },
      { key: 'payment_status', header: 'Status' },
    ]);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=purchase-bills.csv');
    res.send(csv);
  }

  @Get('export/products')
  @RequirePermissions('reports:export')
  @ApiOperation({ summary: 'Export products to CSV' })
  async exportProducts(@Res() res: Response) {
    const products = await Product.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']],
      raw: true,
    });

    const csv = this.exportService.toCSV(products as any[], [
      { key: 'name', header: 'Product Name' },
      { key: 'sku', header: 'SKU' },
      { key: 'barcode', header: 'Barcode' },
      { key: 'purchase_price', header: 'Purchase Price' },
      { key: 'selling_price', header: 'Selling Price' },
      { key: 'current_stock', header: 'Current Stock' },
      { key: 'minimum_stock', header: 'Min Stock' },
    ]);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
    res.send(csv);
  }

  @Get('export/parties')
  @RequirePermissions('reports:export')
  @ApiOperation({ summary: 'Export customers/vendors to CSV' })
  async exportParties(@Query('type') type: string, @Res() res: Response) {
    const where: any = { is_active: true };
    if (type) where[Op.or] = [{ type }, { type: 'both' }];

    const parties = await Party.findAll({ where, order: [['name', 'ASC']], raw: true });

    const csv = this.exportService.toCSV(parties as any[], [
      { key: 'name', header: 'Name' },
      { key: 'type', header: 'Type' },
      { key: 'gstin', header: 'GSTIN' },
      { key: 'pan', header: 'PAN' },
      { key: 'phone', header: 'Phone' },
      { key: 'email', header: 'Email' },
      { key: 'state_code', header: 'State Code' },
      { key: 'opening_balance', header: 'Opening Balance' },
    ]);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${type || 'parties'}.csv`);
    res.send(csv);
  }
}
