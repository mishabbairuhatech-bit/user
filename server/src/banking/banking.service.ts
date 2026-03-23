import { Injectable, Inject, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Op } from 'sequelize';
import { REPOSITORY } from '../common/constants/app.constants';
import { BankAccount } from './entities/bank-account.entity';
import { BankTransaction } from './entities/bank-transaction.entity';
import { PaymentReceipt } from './entities/payment-receipt.entity';
import { PaymentAllocation } from './entities/payment-allocation.entity';
import { AccountingService } from '../accounting/accounting.service';
import { AccountGroup } from '../accounting/entities/account-group.entity';
import { Party } from '../parties/entities/party.entity';
import { LedgerAccount } from '../accounting/entities/ledger-account.entity';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { BankTransferDto } from './dto/bank-transfer.dto';
import { ReconcileDto } from './dto/reconcile.dto';
import { PaginationQueryDto, PaginatedResponseDto } from '../common/dto';

@Injectable()
export class BankingService {
  constructor(
    @Inject(REPOSITORY.BANK_ACCOUNTS) private readonly bankAccountRepo: typeof BankAccount,
    @Inject(REPOSITORY.BANK_TRANSACTIONS) private readonly bankTransactionRepo: typeof BankTransaction,
    @Inject(REPOSITORY.PAYMENT_RECEIPTS) private readonly paymentReceiptRepo: typeof PaymentReceipt,
    @Inject(REPOSITORY.PAYMENT_ALLOCATIONS) private readonly paymentAllocationRepo: typeof PaymentAllocation,
    private readonly accountingService: AccountingService,
  ) {}

  // ─── Bank Accounts ──────────────────────────────

  async createBankAccount(dto: CreateBankAccountDto, userId?: string): Promise<BankAccount> {
    const group = await AccountGroup.findOne({ where: { name: 'Cash & Bank' } });
    let ledgerAccountId: string | undefined;

    if (group) {
      const ledger = await this.accountingService.createLedgerAccount({
        name: dto.account_name,
        group_id: group.id,
        opening_balance: dto.opening_balance || 0,
        opening_balance_type: 'debit',
        description: `${dto.account_type}: ${dto.account_name}`,
      }, userId);
      ledgerAccountId = ledger.id;
    }

    if (dto.is_default) {
      await this.bankAccountRepo.update({ is_default: false }, { where: {} });
    }

    return this.bankAccountRepo.create({
      ...dto,
      current_balance: dto.opening_balance || 0,
      ledger_account_id: ledgerAccountId,
      created_by: userId,
    } as any);
  }

  async getBankAccounts(): Promise<BankAccount[]> {
    return this.bankAccountRepo.findAll({
      where: { is_active: true },
      include: [{ model: LedgerAccount, attributes: ['id', 'name'] }],
      order: [['is_default', 'DESC'], ['account_name', 'ASC']],
    });
  }

  async getBankAccount(id: string): Promise<BankAccount> {
    const account = await this.bankAccountRepo.findByPk(id, {
      include: [{ model: LedgerAccount, attributes: ['id', 'name'] }],
    });
    if (!account) throw new NotFoundException('Bank account not found.');
    return account;
  }

  async getBankAccountStatement(id: string, fromDate?: string, toDate?: string): Promise<BankTransaction[]> {
    const where: any = { bank_account_id: id };
    if (fromDate) where.date = { ...where.date, [Op.gte]: fromDate };
    if (toDate) where.date = { ...where.date, [Op.lte]: toDate };

    return this.bankTransactionRepo.findAll({
      where,
      order: [['date', 'ASC'], ['created_at', 'ASC']],
    });
  }

  // ─── Payments (to vendors) ──────────────────────────

  async createPayment(dto: CreatePaymentDto, userId: string): Promise<PaymentReceipt> {
    const party = await Party.findByPk(dto.party_id);
    if (!party) throw new NotFoundException('Party not found.');

    const bankAccount = await this.getBankAccount(dto.bank_account_id);
    if (!bankAccount.ledger_account_id || !party.ledger_account_id) {
      throw new BadRequestException('Party or bank account has no linked ledger.');
    }

    const fy = await this.accountingService.getActiveFinancialYear();
    const voucherNumber = await this.accountingService.getNextNumber('payment', fy.name);

    // Create journal entry: Dr Vendor (AP), Cr Bank
    const je = await this.accountingService.createAutoJournalEntry({
      date: dto.date,
      narration: dto.narration || `Payment to ${party.name}`,
      referenceType: 'payment',
      referenceId: '', // will update after
      lines: [
        { ledgerAccountId: party.ledger_account_id, debit: dto.amount, credit: 0, description: `Payment to ${party.name}` },
        { ledgerAccountId: bankAccount.ledger_account_id, debit: 0, credit: dto.amount, description: `Payment to ${party.name}` },
      ],
      userId,
    });

    const payment = await this.paymentReceiptRepo.create({
      voucher_number: voucherNumber,
      type: 'payment',
      date: dto.date,
      party_id: dto.party_id,
      bank_account_id: dto.bank_account_id,
      amount: dto.amount,
      payment_mode: dto.payment_mode,
      cheque_number: dto.cheque_number,
      cheque_date: dto.cheque_date,
      transaction_ref: dto.transaction_ref,
      narration: dto.narration,
      journal_entry_id: je.id,
      financial_year: fy.name,
      created_by: userId,
    } as any);

    // Update journal entry reference
    await je.update({ reference_id: payment.id });

    // Create bank transaction
    const newBalance = parseFloat(String(bankAccount.current_balance)) - dto.amount;
    await this.bankTransactionRepo.create({
      bank_account_id: dto.bank_account_id,
      date: dto.date,
      type: 'debit',
      amount: dto.amount,
      balance_after: newBalance,
      reference_type: 'payment_receipt',
      reference_id: payment.id,
      description: `Payment to ${party.name} - ${voucherNumber}`,
    } as any);
    await bankAccount.update({ current_balance: newBalance });

    // Create allocations
    if (dto.allocations?.length) {
      for (const alloc of dto.allocations) {
        await this.paymentAllocationRepo.create({
          payment_receipt_id: payment.id,
          document_type: alloc.document_type,
          document_id: alloc.document_id,
          amount: alloc.amount,
        } as any);
      }
    }

    return this.getPaymentReceipt(payment.id);
  }

  // ─── Receipts (from customers) ──────────────────────

  async createReceipt(dto: CreateReceiptDto, userId: string): Promise<PaymentReceipt> {
    const party = await Party.findByPk(dto.party_id);
    if (!party) throw new NotFoundException('Party not found.');

    const bankAccount = await this.getBankAccount(dto.bank_account_id);
    if (!bankAccount.ledger_account_id || !party.ledger_account_id) {
      throw new BadRequestException('Party or bank account has no linked ledger.');
    }

    const fy = await this.accountingService.getActiveFinancialYear();
    const voucherNumber = await this.accountingService.getNextNumber('receipt', fy.name);

    // Create journal entry: Dr Bank, Cr Customer (AR)
    const je = await this.accountingService.createAutoJournalEntry({
      date: dto.date,
      narration: dto.narration || `Receipt from ${party.name}`,
      referenceType: 'receipt',
      referenceId: '',
      lines: [
        { ledgerAccountId: bankAccount.ledger_account_id, debit: dto.amount, credit: 0, description: `Receipt from ${party.name}` },
        { ledgerAccountId: party.ledger_account_id, debit: 0, credit: dto.amount, description: `Receipt from ${party.name}` },
      ],
      userId,
    });

    const receipt = await this.paymentReceiptRepo.create({
      voucher_number: voucherNumber,
      type: 'receipt',
      date: dto.date,
      party_id: dto.party_id,
      bank_account_id: dto.bank_account_id,
      amount: dto.amount,
      payment_mode: dto.payment_mode,
      cheque_number: dto.cheque_number,
      cheque_date: dto.cheque_date,
      transaction_ref: dto.transaction_ref,
      narration: dto.narration,
      journal_entry_id: je.id,
      financial_year: fy.name,
      created_by: userId,
    } as any);

    await je.update({ reference_id: receipt.id });

    // Create bank transaction
    const newBalance = parseFloat(String(bankAccount.current_balance)) + dto.amount;
    await this.bankTransactionRepo.create({
      bank_account_id: dto.bank_account_id,
      date: dto.date,
      type: 'credit',
      amount: dto.amount,
      balance_after: newBalance,
      reference_type: 'payment_receipt',
      reference_id: receipt.id,
      description: `Receipt from ${party.name} - ${voucherNumber}`,
    } as any);
    await bankAccount.update({ current_balance: newBalance });

    // Create allocations
    if (dto.allocations?.length) {
      for (const alloc of dto.allocations) {
        await this.paymentAllocationRepo.create({
          payment_receipt_id: receipt.id,
          document_type: alloc.document_type,
          document_id: alloc.document_id,
          amount: alloc.amount,
        } as any);
      }
    }

    return this.getPaymentReceipt(receipt.id);
  }

  // ─── Bank Transfer ──────────────────────────────

  async transferBetweenAccounts(dto: BankTransferDto, userId: string): Promise<void> {
    if (dto.from_account_id === dto.to_account_id) {
      throw new BadRequestException('Source and target accounts must be different.');
    }

    const fromAccount = await this.getBankAccount(dto.from_account_id);
    const toAccount = await this.getBankAccount(dto.to_account_id);

    if (!fromAccount.ledger_account_id || !toAccount.ledger_account_id) {
      throw new BadRequestException('Both accounts must have linked ledgers.');
    }

    // Journal entry: Dr To-Account, Cr From-Account
    await this.accountingService.createAutoJournalEntry({
      date: dto.date,
      narration: dto.narration || `Transfer: ${fromAccount.account_name} → ${toAccount.account_name}`,
      referenceType: 'payment',
      referenceId: fromAccount.id,
      lines: [
        { ledgerAccountId: toAccount.ledger_account_id, debit: dto.amount, credit: 0 },
        { ledgerAccountId: fromAccount.ledger_account_id, debit: 0, credit: dto.amount },
      ],
      userId,
    });

    // Debit from source
    const fromNewBalance = parseFloat(String(fromAccount.current_balance)) - dto.amount;
    await this.bankTransactionRepo.create({
      bank_account_id: dto.from_account_id, date: dto.date, type: 'debit', amount: dto.amount,
      balance_after: fromNewBalance, reference_type: 'transfer', description: `Transfer to ${toAccount.account_name}`,
    } as any);
    await fromAccount.update({ current_balance: fromNewBalance });

    // Credit to target
    const toNewBalance = parseFloat(String(toAccount.current_balance)) + dto.amount;
    await this.bankTransactionRepo.create({
      bank_account_id: dto.to_account_id, date: dto.date, type: 'credit', amount: dto.amount,
      balance_after: toNewBalance, reference_type: 'transfer', description: `Transfer from ${fromAccount.account_name}`,
    } as any);
    await toAccount.update({ current_balance: toNewBalance });
  }

  // ─── Payment/Receipt list & detail ──────────────────

  async getPaymentReceipts(query: PaginationQueryDto & { type?: string }): Promise<PaginatedResponseDto<PaymentReceipt>> {
    const where: any = {};
    if (query.type) where.type = query.type;
    if (query.search) {
      where[Op.or] = [
        { voucher_number: { [Op.iLike]: `%${query.search}%` } },
        { narration: { [Op.iLike]: `%${query.search}%` } },
      ];
    }

    const { rows, count } = await this.paymentReceiptRepo.findAndCountAll({
      where,
      include: [
        { model: Party, attributes: ['id', 'name', 'type'] },
        { model: BankAccount, attributes: ['id', 'account_name'] },
        { model: PaymentAllocation },
      ],
      order: [[query.sort_by, query.sort_order]],
      limit: query.limit,
      offset: query.offset,
    });

    const totalPages = Math.ceil(count / query.limit);
    return {
      items: rows,
      meta: { total: count, page: query.page, limit: query.limit, total_pages: totalPages, has_next: query.page < totalPages, has_prev: query.page > 1 },
    };
  }

  async getPaymentReceipt(id: string): Promise<PaymentReceipt> {
    const pr = await this.paymentReceiptRepo.findByPk(id, {
      include: [
        { model: Party, attributes: ['id', 'name', 'type', 'gstin'] },
        { model: BankAccount, attributes: ['id', 'account_name', 'bank_name'] },
        { model: PaymentAllocation },
      ],
    });
    if (!pr) throw new NotFoundException('Payment/Receipt not found.');
    return pr;
  }

  // ─── Reconciliation ──────────────────────────────

  async getUnreconciledTransactions(accountId: string): Promise<BankTransaction[]> {
    return this.bankTransactionRepo.findAll({
      where: { bank_account_id: accountId, is_reconciled: false },
      order: [['date', 'ASC']],
    });
  }

  async reconcileTransactions(dto: ReconcileDto): Promise<{ count: number }> {
    const [count] = await this.bankTransactionRepo.update(
      { is_reconciled: true, reconciled_date: dto.reconciled_date },
      { where: { id: { [Op.in]: dto.transaction_ids } } },
    );
    return { count };
  }
}
