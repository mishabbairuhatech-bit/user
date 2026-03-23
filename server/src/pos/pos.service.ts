import {
  Injectable, Inject, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { Op, fn, col, literal } from 'sequelize';
import { REPOSITORY } from '../common/constants/app.constants';
import { PosTerminal } from './entities/pos-terminal.entity';
import { PosSession } from './entities/pos-session.entity';
import { HeldBill } from './entities/held-bill.entity';
import { SalesService } from '../sales/sales.service';
import { AccountingService } from '../accounting/accounting.service';
import { BankingService } from '../banking/banking.service';
import { SalesInvoice } from '../sales/entities/sales-invoice.entity';
import { SalesInvoiceItem } from '../sales/entities/sales-invoice-item.entity';
import { Party } from '../parties/entities/party.entity';
import { Product } from '../inventory/entities/product.entity';
import { BankAccount } from '../banking/entities/bank-account.entity';
import { OpenSessionDto } from './dto/open-session.dto';
import { CloseSessionDto } from './dto/close-session.dto';
import { FinalizeBillDto } from './dto/finalize-bill.dto';
import { HoldBillDto } from './dto/hold-bill.dto';
import { ProcessReturnDto } from './dto/process-return.dto';

@Injectable()
export class PosService {
  constructor(
    @Inject(REPOSITORY.POS_TERMINALS) private readonly terminalRepo: typeof PosTerminal,
    @Inject(REPOSITORY.POS_SESSIONS) private readonly sessionRepo: typeof PosSession,
    @Inject(REPOSITORY.HELD_BILLS) private readonly heldBillRepo: typeof HeldBill,
    private readonly salesService: SalesService,
    private readonly accountingService: AccountingService,
    private readonly bankingService: BankingService,
  ) {}

  // ─── Terminals ──────────────────────────────

  async createTerminal(name: string): Promise<PosTerminal> {
    return this.terminalRepo.create({ name } as any);
  }

  async getTerminals(): Promise<PosTerminal[]> {
    return this.terminalRepo.findAll({ where: { is_active: true }, order: [['name', 'ASC']] });
  }

  // ─── Sessions ──────────────────────────────

  async openSession(dto: OpenSessionDto, userId: string): Promise<PosSession> {
    // Check for existing open session
    const existing = await this.sessionRepo.findOne({
      where: { user_id: userId, status: 'open' },
    });
    if (existing) throw new BadRequestException('You already have an open POS session. Close it first.');

    const terminal = await this.terminalRepo.findByPk(dto.terminal_id);
    if (!terminal) throw new NotFoundException('Terminal not found.');
    if (!terminal.is_active) throw new BadRequestException('Terminal is inactive.');

    return this.sessionRepo.create({
      terminal_id: dto.terminal_id,
      user_id: userId,
      opening_cash: dto.opening_cash || 0,
      status: 'open',
      opened_at: new Date(),
    } as any);
  }

  async closeSession(sessionId: string, dto: CloseSessionDto, userId: string): Promise<PosSession> {
    const session = await this.sessionRepo.findByPk(sessionId);
    if (!session) throw new NotFoundException('Session not found.');
    if (session.user_id !== userId) throw new BadRequestException('This session belongs to another user.');
    if (session.status === 'closed') throw new BadRequestException('Session is already closed.');

    // Calculate expected cash: opening + cash sales - cash refunds
    const cashSales = await this.getCashSalesTotal(sessionId);
    const expectedCash = parseFloat(String(session.opening_cash)) + cashSales;
    const cashDifference = dto.closing_cash - expectedCash;

    await session.update({
      closing_cash: dto.closing_cash,
      expected_cash: expectedCash,
      cash_difference: cashDifference,
      status: 'closed',
      closed_at: new Date(),
    });

    return session;
  }

  async getActiveSession(userId: string): Promise<PosSession | null> {
    return this.sessionRepo.findOne({
      where: { user_id: userId, status: 'open' },
      include: [{ model: PosTerminal, attributes: ['id', 'name'] }],
    });
  }

  async getSessionSummary(sessionId: string) {
    const session = await this.sessionRepo.findByPk(sessionId, {
      include: [{ model: PosTerminal, attributes: ['id', 'name'] }],
    });
    if (!session) throw new NotFoundException('Session not found.');

    // Get all invoices for this session
    const invoices = await SalesInvoice.findAll({
      where: { source: 'pos', created_by: session.user_id, is_cancelled: false },
      attributes: ['id', 'grand_total', 'created_at'],
    });

    // Filter by session time range
    const sessionInvoices = invoices.filter((inv) => {
      const created = new Date(inv.created_at).getTime();
      const opened = new Date(session.opened_at).getTime();
      const closed = session.closed_at ? new Date(session.closed_at).getTime() : Date.now();
      return created >= opened && created <= closed;
    });

    const totalSales = sessionInvoices.reduce((sum, inv) => sum + parseFloat(String(inv.grand_total)), 0);
    const transactionCount = sessionInvoices.length;
    const heldBillCount = await this.heldBillRepo.count({ where: { pos_session_id: sessionId } });

    return {
      session,
      total_sales: totalSales,
      transaction_count: transactionCount,
      held_bills_count: heldBillCount,
      opening_cash: parseFloat(String(session.opening_cash)),
      closing_cash: session.closing_cash ? parseFloat(String(session.closing_cash)) : null,
      expected_cash: session.expected_cash ? parseFloat(String(session.expected_cash)) : null,
      cash_difference: session.cash_difference ? parseFloat(String(session.cash_difference)) : null,
    };
  }

  private async getCashSalesTotal(sessionId: string): Promise<number> {
    // For now return 0; in a full implementation this would track payment modes per POS invoice
    // The payment mode tracking would require a pos_payments junction table
    return 0;
  }

  // ─── Bill Finalization ──────────────────────────────

  async finalizeBill(dto: FinalizeBillDto, userId: string) {
    const session = await this.sessionRepo.findByPk(dto.session_id);
    if (!session) throw new NotFoundException('POS session not found.');
    if (session.status !== 'open') throw new BadRequestException('POS session is closed.');
    if (session.user_id !== userId) throw new BadRequestException('Session belongs to another user.');

    // Create sales invoice with source='pos'
    const invoice = await this.salesService.createSalesInvoice({
      date: new Date().toISOString().split('T')[0],
      party_id: dto.party_id,
      source: 'pos',
      discount_amount: dto.discount_amount || 0,
      round_off: dto.round_off || 0,
      items: dto.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent || 0,
      })),
    }, userId);

    // Process payments — record bank transactions for card/upi
    const totalPaid = dto.payments.reduce((sum, p) => sum + p.amount, 0);

    for (const payment of dto.payments) {
      if (payment.mode === 'card' || payment.mode === 'upi') {
        // Find a bank account for card/UPI (use default or first available)
        const bankAccount = await BankAccount.findOne({
          where: { is_active: true, account_type: { [Op.ne]: 'cash' } },
          order: [['is_default', 'DESC']],
        });

        if (bankAccount) {
          const newBalance = parseFloat(String(bankAccount.current_balance)) + payment.amount;
          const { BankTransaction } = await import('../banking/entities/bank-transaction.entity');
          await BankTransaction.create({
            bank_account_id: bankAccount.id,
            date: new Date().toISOString().split('T')[0],
            type: 'credit',
            amount: payment.amount,
            balance_after: newBalance,
            reference_type: 'pos_bill',
            reference_id: invoice.id,
            description: `POS ${payment.mode.toUpperCase()} - ${invoice.invoice_number}`,
          } as any);
          await bankAccount.update({ current_balance: newBalance });
        }
      }
      // Cash payments are tracked via the session's expected_cash calculation
    }

    // Mark invoice as paid
    await SalesInvoice.update(
      { amount_paid: totalPaid, balance_due: 0, payment_status: 'paid' },
      { where: { id: invoice.id } },
    );

    return {
      invoice,
      payments: dto.payments,
      total_paid: totalPaid,
    };
  }

  // ─── Held Bills ──────────────────────────────

  async holdBill(dto: HoldBillDto): Promise<HeldBill> {
    return this.heldBillRepo.create({
      pos_session_id: dto.session_id,
      customer_name: dto.customer_name,
      items: dto.items,
      notes: dto.notes,
      held_at: new Date(),
    } as any);
  }

  async getHeldBills(sessionId: string): Promise<HeldBill[]> {
    return this.heldBillRepo.findAll({
      where: { pos_session_id: sessionId },
      order: [['held_at', 'DESC']],
    });
  }

  async recallHeldBill(id: string) {
    const bill = await this.heldBillRepo.findByPk(id);
    if (!bill) throw new NotFoundException('Held bill not found.');
    const data = bill.toJSON();
    await bill.destroy();
    return data;
  }

  async deleteHeldBill(id: string): Promise<void> {
    const bill = await this.heldBillRepo.findByPk(id);
    if (!bill) throw new NotFoundException('Held bill not found.');
    await bill.destroy();
  }

  // ─── Returns ──────────────────────────────

  async processReturn(dto: ProcessReturnDto, userId: string) {
    return this.salesService.createCreditNote({
      date: new Date().toISOString().split('T')[0],
      original_invoice_id: dto.original_invoice_id,
      reason: 'POS Return',
      items: dto.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
    }, userId);
  }

  // ─── Reports ──────────────────────────────

  async getDailySales(date: string, terminalId?: string) {
    const where: any = {
      source: 'pos',
      is_cancelled: false,
      date,
    };

    const invoices = await SalesInvoice.findAll({
      where,
      include: [
        { model: SalesInvoiceItem, include: [{ model: Product, attributes: ['id', 'name', 'sku'] }] },
        { model: Party, attributes: ['id', 'name'] },
      ],
      order: [['created_at', 'ASC']],
    });

    const totalSales = invoices.reduce((sum, inv) => sum + parseFloat(String(inv.grand_total)), 0);
    const totalTax = invoices.reduce((sum, inv) => sum + parseFloat(String(inv.total_tax)), 0);
    const totalItems = invoices.reduce((sum, inv) =>
      sum + inv.items.reduce((iSum, item) => iSum + parseFloat(String(item.quantity)), 0), 0);

    return {
      date,
      total_sales: totalSales,
      total_tax: totalTax,
      transaction_count: invoices.length,
      total_items_sold: totalItems,
      average_bill: invoices.length > 0 ? totalSales / invoices.length : 0,
      invoices: invoices.map((inv) => ({
        id: inv.id,
        invoice_number: inv.invoice_number,
        customer: inv.party?.name || 'Walk-in',
        grand_total: parseFloat(String(inv.grand_total)),
        items_count: inv.items.length,
        time: inv.created_at,
      })),
    };
  }
}
