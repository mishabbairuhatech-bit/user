import { Controller, Get, Post, Param, Body, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseBillDto } from './dto/create-purchase-bill.dto';
import { CreateDebitNoteDto } from './dto/create-debit-note.dto';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { PurchaseBillQueryDto } from './dto/purchase-query.dto';
import { PaginationQueryDto } from '../common/dto';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { UserById } from '../common/decorators/user-by-id.decorator';

@ApiTags('Purchases')
@ApiBearerAuth('access-token')
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  // ─── Purchase Bills ──────────────────────────

  @Post('bills')
  @RequirePermissions('purchases:create')
  @ApiOperation({ summary: 'Create a purchase bill' })
  async createPurchaseBill(@Body() dto: CreatePurchaseBillDto, @UserById() userId: string) {
    return this.purchasesService.createPurchaseBill(dto, userId);
  }

  @Get('bills')
  @RequirePermissions('purchases:read')
  @ApiOperation({ summary: 'List purchase bills' })
  async getPurchaseBills(@Query() query: PurchaseBillQueryDto) {
    return this.purchasesService.getPurchaseBills(query);
  }

  @Get('bills/:id')
  @RequirePermissions('purchases:read')
  @ApiOperation({ summary: 'Get purchase bill detail' })
  async getPurchaseBill(@Param('id', ParseUUIDPipe) id: string) {
    return this.purchasesService.getPurchaseBill(id);
  }

  @Post('bills/:id/cancel')
  @RequirePermissions('purchases:cancel')
  @ApiOperation({ summary: 'Cancel a purchase bill' })
  async cancelPurchaseBill(@Param('id', ParseUUIDPipe) id: string, @UserById() userId: string) {
    return this.purchasesService.cancelPurchaseBill(id, userId);
  }

  // ─── Debit Notes ──────────────────────────

  @Post('debit-notes')
  @RequirePermissions('purchases:create')
  @ApiOperation({ summary: 'Create a debit note (purchase return)' })
  async createDebitNote(@Body() dto: CreateDebitNoteDto, @UserById() userId: string) {
    return this.purchasesService.createDebitNote(dto, userId);
  }

  @Get('debit-notes')
  @RequirePermissions('purchases:read')
  @ApiOperation({ summary: 'List debit notes' })
  async getDebitNotes(@Query() query: PaginationQueryDto) {
    return this.purchasesService.getDebitNotes(query);
  }

  // ─── Purchase Orders ──────────────────────────

  @Post('orders')
  @RequirePermissions('purchases:create')
  @ApiOperation({ summary: 'Create a purchase order' })
  async createPurchaseOrder(@Body() dto: CreatePurchaseOrderDto, @UserById() userId: string) {
    return this.purchasesService.createPurchaseOrder(dto, userId);
  }

  @Get('orders')
  @RequirePermissions('purchases:read')
  @ApiOperation({ summary: 'List purchase orders' })
  async getPurchaseOrders(@Query() query: PaginationQueryDto) {
    return this.purchasesService.getPurchaseOrders(query);
  }

  @Get('orders/:id')
  @RequirePermissions('purchases:read')
  @ApiOperation({ summary: 'Get purchase order detail' })
  async getPurchaseOrder(@Param('id', ParseUUIDPipe) id: string) {
    return this.purchasesService.getPurchaseOrder(id);
  }

  @Post('orders/:id/convert')
  @RequirePermissions('purchases:create')
  @ApiOperation({ summary: 'Convert purchase order to purchase bill' })
  async convertToBill(@Param('id', ParseUUIDPipe) id: string, @UserById() userId: string) {
    return this.purchasesService.convertToBill(id, userId);
  }
}
