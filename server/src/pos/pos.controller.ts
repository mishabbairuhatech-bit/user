import { Controller, Get, Post, Delete, Param, Body, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PosService } from './pos.service';
import { OpenSessionDto } from './dto/open-session.dto';
import { CloseSessionDto } from './dto/close-session.dto';
import { FinalizeBillDto } from './dto/finalize-bill.dto';
import { HoldBillDto } from './dto/hold-bill.dto';
import { ProcessReturnDto } from './dto/process-return.dto';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { UserById } from '../common/decorators/user-by-id.decorator';

@ApiTags('POS')
@ApiBearerAuth('access-token')
@Controller('pos')
export class PosController {
  constructor(private readonly posService: PosService) {}

  // ─── Terminals ──────────────────────────

  @Post('terminals')
  @RequirePermissions('pos:manage_terminals')
  @ApiOperation({ summary: 'Create a POS terminal' })
  async createTerminal(@Body('name') name: string) {
    return this.posService.createTerminal(name);
  }

  @Get('terminals')
  @RequirePermissions('pos:access')
  @ApiOperation({ summary: 'List POS terminals' })
  async getTerminals() {
    return this.posService.getTerminals();
  }

  // ─── Sessions ──────────────────────────

  @Post('sessions/open')
  @RequirePermissions('pos:access')
  @ApiOperation({ summary: 'Open a POS session' })
  async openSession(@Body() dto: OpenSessionDto, @UserById() userId: string) {
    return this.posService.openSession(dto, userId);
  }

  @Post('sessions/:id/close')
  @RequirePermissions('pos:access')
  @ApiOperation({ summary: 'Close a POS session' })
  async closeSession(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CloseSessionDto,
    @UserById() userId: string,
  ) {
    return this.posService.closeSession(id, dto, userId);
  }

  @Get('sessions/active')
  @RequirePermissions('pos:access')
  @ApiOperation({ summary: 'Get active POS session for current user' })
  async getActiveSession(@UserById() userId: string) {
    return this.posService.getActiveSession(userId);
  }

  @Get('sessions/:id/summary')
  @RequirePermissions('pos:access')
  @ApiOperation({ summary: 'Get POS session summary' })
  async getSessionSummary(@Param('id', ParseUUIDPipe) id: string) {
    return this.posService.getSessionSummary(id);
  }

  // ─── Bill Operations ──────────────────────────

  @Post('finalize')
  @RequirePermissions('pos:access')
  @ApiOperation({ summary: 'Finalize and save a POS bill' })
  async finalizeBill(@Body() dto: FinalizeBillDto, @UserById() userId: string) {
    return this.posService.finalizeBill(dto, userId);
  }

  @Post('hold')
  @RequirePermissions('pos:access')
  @ApiOperation({ summary: 'Hold current bill' })
  async holdBill(@Body() dto: HoldBillDto) {
    return this.posService.holdBill(dto);
  }

  @Get('held-bills')
  @RequirePermissions('pos:access')
  @ApiOperation({ summary: 'Get held bills for a session' })
  async getHeldBills(@Query('session_id') sessionId: string) {
    return this.posService.getHeldBills(sessionId);
  }

  @Post('held-bills/:id/recall')
  @RequirePermissions('pos:access')
  @ApiOperation({ summary: 'Recall a held bill (returns data and deletes)' })
  async recallHeldBill(@Param('id', ParseUUIDPipe) id: string) {
    return this.posService.recallHeldBill(id);
  }

  @Delete('held-bills/:id')
  @RequirePermissions('pos:access')
  @ApiOperation({ summary: 'Delete a held bill' })
  async deleteHeldBill(@Param('id', ParseUUIDPipe) id: string) {
    await this.posService.deleteHeldBill(id);
    return { message: 'Held bill deleted.' };
  }

  // ─── Returns ──────────────────────────

  @Post('return')
  @RequirePermissions('pos:access')
  @ApiOperation({ summary: 'Process a POS return' })
  async processReturn(@Body() dto: ProcessReturnDto, @UserById() userId: string) {
    return this.posService.processReturn(dto, userId);
  }

  // ─── Reports ──────────────────────────

  @Get('daily-sales')
  @RequirePermissions('pos:view_reports')
  @ApiOperation({ summary: 'Get daily POS sales summary' })
  async getDailySales(
    @Query('date') date: string,
    @Query('terminal_id') terminalId?: string,
  ) {
    return this.posService.getDailySales(date || new Date().toISOString().split('T')[0], terminalId);
  }
}
