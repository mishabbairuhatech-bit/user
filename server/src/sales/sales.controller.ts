import { Controller, Get, Post, Param, Body, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSalesInvoiceDto } from './dto/create-sales-invoice.dto';
import { CreateCreditNoteDto } from './dto/create-credit-note.dto';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { SalesInvoiceQueryDto } from './dto/sales-query.dto';
import { PaginationQueryDto } from '../common/dto';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { UserById } from '../common/decorators/user-by-id.decorator';

@ApiTags('Sales')
@ApiBearerAuth('access-token')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  // ─── Invoices ──────────────────────────

  @Post('invoices')
  @RequirePermissions('sales:create')
  @ApiOperation({ summary: 'Create a sales invoice' })
  async createSalesInvoice(@Body() dto: CreateSalesInvoiceDto, @UserById() userId: string) {
    return this.salesService.createSalesInvoice(dto, userId);
  }

  @Get('invoices')
  @RequirePermissions('sales:read')
  @ApiOperation({ summary: 'List sales invoices' })
  async getSalesInvoices(@Query() query: SalesInvoiceQueryDto) {
    return this.salesService.getSalesInvoices(query);
  }

  @Get('invoices/:id')
  @RequirePermissions('sales:read')
  @ApiOperation({ summary: 'Get sales invoice detail' })
  async getSalesInvoice(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.getSalesInvoice(id);
  }

  @Post('invoices/:id/cancel')
  @RequirePermissions('sales:cancel')
  @ApiOperation({ summary: 'Cancel a sales invoice' })
  async cancelSalesInvoice(@Param('id', ParseUUIDPipe) id: string, @UserById() userId: string) {
    return this.salesService.cancelSalesInvoice(id, userId);
  }

  // ─── Credit Notes ──────────────────────────

  @Post('credit-notes')
  @RequirePermissions('sales:create')
  @ApiOperation({ summary: 'Create a credit note (sales return)' })
  async createCreditNote(@Body() dto: CreateCreditNoteDto, @UserById() userId: string) {
    return this.salesService.createCreditNote(dto, userId);
  }

  @Get('credit-notes')
  @RequirePermissions('sales:read')
  @ApiOperation({ summary: 'List credit notes' })
  async getCreditNotes(@Query() query: PaginationQueryDto) {
    return this.salesService.getCreditNotes(query);
  }

  // ─── Quotations ──────────────────────────

  @Post('quotations')
  @RequirePermissions('sales:create')
  @ApiOperation({ summary: 'Create a quotation' })
  async createQuotation(@Body() dto: CreateQuotationDto, @UserById() userId: string) {
    return this.salesService.createQuotation(dto, userId);
  }

  @Get('quotations')
  @RequirePermissions('sales:read')
  @ApiOperation({ summary: 'List quotations' })
  async getQuotations(@Query() query: PaginationQueryDto) {
    return this.salesService.getQuotations(query);
  }

  @Get('quotations/:id')
  @RequirePermissions('sales:read')
  @ApiOperation({ summary: 'Get quotation detail' })
  async getQuotation(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.getQuotation(id);
  }

  @Post('quotations/:id/convert')
  @RequirePermissions('sales:create')
  @ApiOperation({ summary: 'Convert quotation to sales invoice' })
  async convertToInvoice(@Param('id', ParseUUIDPipe) id: string, @UserById() userId: string) {
    return this.salesService.convertToInvoice(id, userId);
  }
}
