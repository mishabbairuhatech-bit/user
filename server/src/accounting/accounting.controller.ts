import { Controller, Get, Post, Put, Param, Body, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AccountingService } from './accounting.service';
import { CreateAccountGroupDto } from './dto/create-account-group.dto';
import { UpdateAccountGroupDto } from './dto/update-account-group.dto';
import { CreateLedgerAccountDto } from './dto/create-ledger-account.dto';
import { UpdateLedgerAccountDto } from './dto/update-ledger-account.dto';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { CreateFinancialYearDto } from './dto/create-financial-year.dto';
import { LedgerQueryDto, LedgerStatementQueryDto, ReportDateQueryDto } from './dto/ledger-query.dto';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { UserById } from '../common/decorators/user-by-id.decorator';
import { PaginationQueryDto } from '../common/dto';

@ApiTags('Accounting')
@ApiBearerAuth('access-token')
@Controller('accounting')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  // ─── Account Groups ──────────────────────────────

  @Post('account-groups')
  @RequirePermissions('accounting:create')
  @ApiOperation({ summary: 'Create an account group' })
  async createAccountGroup(@Body() dto: CreateAccountGroupDto) {
    return this.accountingService.createAccountGroup(dto);
  }

  @Get('account-groups')
  @RequirePermissions('accounting:read')
  @ApiOperation({ summary: 'Get account group tree' })
  async getAccountGroupTree() {
    return this.accountingService.getAccountGroupTree();
  }

  @Put('account-groups/:id')
  @RequirePermissions('accounting:update')
  @ApiOperation({ summary: 'Update an account group' })
  async updateAccountGroup(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAccountGroupDto,
  ) {
    return this.accountingService.updateAccountGroup(id, dto);
  }

  // ─── Ledger Accounts ──────────────────────────────

  @Post('ledger-accounts')
  @RequirePermissions('accounting:create')
  @ApiOperation({ summary: 'Create a ledger account' })
  async createLedgerAccount(
    @Body() dto: CreateLedgerAccountDto,
    @UserById() userId: string,
  ) {
    return this.accountingService.createLedgerAccount(dto, userId);
  }

  @Get('ledger-accounts')
  @RequirePermissions('accounting:read')
  @ApiOperation({ summary: 'List ledger accounts with pagination' })
  async getLedgerAccounts(@Query() query: LedgerQueryDto) {
    return this.accountingService.getLedgerAccounts(query);
  }

  @Get('ledger-accounts/:id')
  @RequirePermissions('accounting:read')
  @ApiOperation({ summary: 'Get ledger account detail' })
  async getLedgerAccount(@Param('id', ParseUUIDPipe) id: string) {
    return this.accountingService.getLedgerAccount(id);
  }

  @Put('ledger-accounts/:id')
  @RequirePermissions('accounting:update')
  @ApiOperation({ summary: 'Update a ledger account' })
  async updateLedgerAccount(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLedgerAccountDto,
  ) {
    return this.accountingService.updateLedgerAccount(id, dto);
  }

  @Get('ledger-accounts/:id/statement')
  @RequirePermissions('accounting:read')
  @ApiOperation({ summary: 'Get ledger account statement' })
  async getLedgerStatement(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: LedgerStatementQueryDto,
  ) {
    return this.accountingService.getLedgerStatement(id, query);
  }

  @Get('ledger-accounts/:id/balance')
  @RequirePermissions('accounting:read')
  @ApiOperation({ summary: 'Get ledger account balance' })
  async getLedgerBalance(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('as_of_date') asOfDate?: string,
  ) {
    return this.accountingService.getLedgerBalance(id, asOfDate);
  }

  // ─── Journal Entries ──────────────────────────────

  @Post('journal-entries')
  @RequirePermissions('accounting:create')
  @ApiOperation({ summary: 'Create a manual journal entry' })
  async createJournalEntry(
    @Body() dto: CreateJournalEntryDto,
    @UserById() userId: string,
  ) {
    return this.accountingService.createJournalEntry(dto, userId);
  }

  @Get('journal-entries')
  @RequirePermissions('accounting:read')
  @ApiOperation({ summary: 'List journal entries with pagination' })
  async getJournalEntries(@Query() query: PaginationQueryDto) {
    return this.accountingService.getJournalEntries(query);
  }

  @Get('journal-entries/:id')
  @RequirePermissions('accounting:read')
  @ApiOperation({ summary: 'Get journal entry detail' })
  async getJournalEntry(@Param('id', ParseUUIDPipe) id: string) {
    return this.accountingService.getJournalEntry(id);
  }

  @Post('journal-entries/:id/cancel')
  @RequirePermissions('accounting:update')
  @ApiOperation({ summary: 'Cancel a journal entry (creates reversal)' })
  async cancelJournalEntry(
    @Param('id', ParseUUIDPipe) id: string,
    @UserById() userId: string,
  ) {
    return this.accountingService.cancelJournalEntry(id, userId);
  }

  // ─── Financial Reports ──────────────────────────────

  @Get('reports/trial-balance')
  @RequirePermissions('accounting:read')
  @ApiOperation({ summary: 'Get trial balance' })
  async getTrialBalance(@Query() query: ReportDateQueryDto) {
    return this.accountingService.getTrialBalance(query);
  }

  @Get('reports/profit-and-loss')
  @RequirePermissions('accounting:read')
  @ApiOperation({ summary: 'Get profit and loss statement' })
  async getProfitAndLoss(@Query() query: ReportDateQueryDto) {
    return this.accountingService.getProfitAndLoss(query);
  }

  @Get('reports/balance-sheet')
  @RequirePermissions('accounting:read')
  @ApiOperation({ summary: 'Get balance sheet' })
  async getBalanceSheet(@Query() query: ReportDateQueryDto) {
    return this.accountingService.getBalanceSheet(query);
  }

  // ─── Financial Years ──────────────────────────────

  @Get('financial-years')
  @RequirePermissions('accounting:read')
  @ApiOperation({ summary: 'List financial years' })
  async getFinancialYears() {
    return this.accountingService.getFinancialYears();
  }

  @Post('financial-years')
  @RequirePermissions('accounting:create')
  @ApiOperation({ summary: 'Create a financial year' })
  async createFinancialYear(@Body() dto: CreateFinancialYearDto) {
    return this.accountingService.createFinancialYear(dto);
  }

  @Post('financial-years/:id/close')
  @RequirePermissions('accounting:update')
  @ApiOperation({ summary: 'Close a financial year' })
  async closeFinancialYear(@Param('id', ParseUUIDPipe) id: string) {
    return this.accountingService.closeFinancialYear(id);
  }
}
