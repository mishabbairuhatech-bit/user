import { Controller, Get, Post, Put, Param, Body, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BankingService } from './banking.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { BankTransferDto } from './dto/bank-transfer.dto';
import { ReconcileDto } from './dto/reconcile.dto';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { UserById } from '../common/decorators/user-by-id.decorator';
import { PaginationQueryDto } from '../common/dto';

@ApiTags('Banking')
@ApiBearerAuth('access-token')
@Controller('banking')
export class BankingController {
  constructor(private readonly bankingService: BankingService) {}

  // ─── Bank Accounts ──────────────────────────

  @Post('accounts')
  @RequirePermissions('banking:create')
  @ApiOperation({ summary: 'Create a bank/cash account' })
  async createBankAccount(@Body() dto: CreateBankAccountDto, @UserById() userId: string) {
    return this.bankingService.createBankAccount(dto, userId);
  }

  @Get('accounts')
  @RequirePermissions('banking:read')
  @ApiOperation({ summary: 'List bank accounts' })
  async getBankAccounts() {
    return this.bankingService.getBankAccounts();
  }

  @Get('accounts/:id')
  @RequirePermissions('banking:read')
  @ApiOperation({ summary: 'Get bank account detail' })
  async getBankAccount(@Param('id', ParseUUIDPipe) id: string) {
    return this.bankingService.getBankAccount(id);
  }

  @Get('accounts/:id/statement')
  @RequirePermissions('banking:read')
  @ApiOperation({ summary: 'Get bank account statement' })
  async getBankAccountStatement(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('from_date') fromDate?: string,
    @Query('to_date') toDate?: string,
  ) {
    return this.bankingService.getBankAccountStatement(id, fromDate, toDate);
  }

  // ─── Payments & Receipts ──────────────────────

  @Post('payments')
  @RequirePermissions('banking:create')
  @ApiOperation({ summary: 'Create a payment (to vendor)' })
  async createPayment(@Body() dto: CreatePaymentDto, @UserById() userId: string) {
    return this.bankingService.createPayment(dto, userId);
  }

  @Post('receipts')
  @RequirePermissions('banking:create')
  @ApiOperation({ summary: 'Create a receipt (from customer)' })
  async createReceipt(@Body() dto: CreateReceiptDto, @UserById() userId: string) {
    return this.bankingService.createReceipt(dto, userId);
  }

  @Get('payment-receipts')
  @RequirePermissions('banking:read')
  @ApiOperation({ summary: 'List payments and receipts' })
  async getPaymentReceipts(@Query() query: PaginationQueryDto) {
    return this.bankingService.getPaymentReceipts(query);
  }

  @Get('payment-receipts/:id')
  @RequirePermissions('banking:read')
  @ApiOperation({ summary: 'Get payment/receipt detail' })
  async getPaymentReceipt(@Param('id', ParseUUIDPipe) id: string) {
    return this.bankingService.getPaymentReceipt(id);
  }

  // ─── Transfer ──────────────────────────

  @Post('transfer')
  @RequirePermissions('banking:create')
  @ApiOperation({ summary: 'Transfer between bank accounts' })
  async transferBetweenAccounts(@Body() dto: BankTransferDto, @UserById() userId: string) {
    await this.bankingService.transferBetweenAccounts(dto, userId);
    return { message: 'Transfer completed successfully.' };
  }

  // ─── Reconciliation ──────────────────────────

  @Get('reconciliation/:accountId')
  @RequirePermissions('banking:reconcile')
  @ApiOperation({ summary: 'Get unreconciled transactions' })
  async getUnreconciledTransactions(@Param('accountId', ParseUUIDPipe) accountId: string) {
    return this.bankingService.getUnreconciledTransactions(accountId);
  }

  @Post('reconciliation/reconcile')
  @RequirePermissions('banking:reconcile')
  @ApiOperation({ summary: 'Mark transactions as reconciled' })
  async reconcileTransactions(@Body() dto: ReconcileDto) {
    return this.bankingService.reconcileTransactions(dto);
  }
}
