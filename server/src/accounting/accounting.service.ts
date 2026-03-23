import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { Op, WhereOptions, literal, fn, col } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { REPOSITORY } from '../common/constants/app.constants';
import { AccountGroup } from './entities/account-group.entity';
import { LedgerAccount } from './entities/ledger-account.entity';
import { JournalEntry } from './entities/journal-entry.entity';
import { JournalEntryLine } from './entities/journal-entry-line.entity';
import { FinancialYear } from './entities/financial-year.entity';
import { NumberSequence } from './entities/number-sequence.entity';
import { CreateAccountGroupDto } from './dto/create-account-group.dto';
import { UpdateAccountGroupDto } from './dto/update-account-group.dto';
import { CreateLedgerAccountDto } from './dto/create-ledger-account.dto';
import { UpdateLedgerAccountDto } from './dto/update-ledger-account.dto';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { CreateFinancialYearDto } from './dto/create-financial-year.dto';
import { LedgerQueryDto, LedgerStatementQueryDto, ReportDateQueryDto } from './dto/ledger-query.dto';
import { PaginationQueryDto, PaginatedResponseDto } from '../common/dto';

@Injectable()
export class AccountingService {
  constructor(
    @Inject(REPOSITORY.ACCOUNT_GROUPS)
    private readonly accountGroupRepo: typeof AccountGroup,
    @Inject(REPOSITORY.LEDGER_ACCOUNTS)
    private readonly ledgerAccountRepo: typeof LedgerAccount,
    @Inject(REPOSITORY.JOURNAL_ENTRIES)
    private readonly journalEntryRepo: typeof JournalEntry,
    @Inject(REPOSITORY.JOURNAL_ENTRY_LINES)
    private readonly journalEntryLineRepo: typeof JournalEntryLine,
    @Inject(REPOSITORY.FINANCIAL_YEARS)
    private readonly financialYearRepo: typeof FinancialYear,
    @Inject(REPOSITORY.NUMBER_SEQUENCES)
    private readonly numberSequenceRepo: typeof NumberSequence,
    private readonly sequelize: Sequelize,
  ) {}

  // ─── Account Groups ──────────────────────────────────────

  async createAccountGroup(dto: CreateAccountGroupDto): Promise<AccountGroup> {
    if (dto.parent_id) {
      const parent = await this.accountGroupRepo.findByPk(dto.parent_id);
      if (!parent) throw new NotFoundException('Parent account group not found.');
    }
    return this.accountGroupRepo.create({ ...dto } as any);
  }

  async getAccountGroupTree(): Promise<AccountGroup[]> {
    const groups = await this.accountGroupRepo.findAll({
      order: [['sequence', 'ASC'], ['name', 'ASC']],
      include: [{ model: AccountGroup, as: 'children' }],
    });
    // Return only root-level groups (parent_id is null) — children are nested
    return groups.filter((g) => !g.parent_id);
  }

  async updateAccountGroup(id: string, dto: UpdateAccountGroupDto): Promise<AccountGroup> {
    const group = await this.accountGroupRepo.findByPk(id);
    if (!group) throw new NotFoundException('Account group not found.');
    if (group.is_system) throw new BadRequestException('System account groups cannot be modified.');
    await group.update(dto);
    return group;
  }

  // ─── Ledger Accounts ──────────────────────────────────────

  async createLedgerAccount(dto: CreateLedgerAccountDto, userId?: string): Promise<LedgerAccount> {
    const group = await this.accountGroupRepo.findByPk(dto.group_id);
    if (!group) throw new NotFoundException('Account group not found.');

    if (dto.code) {
      const existing = await this.ledgerAccountRepo.findOne({ where: { code: dto.code } });
      if (existing) throw new ConflictException(`Account code "${dto.code}" already exists.`);
    }

    return this.ledgerAccountRepo.create({
      ...dto,
      created_by: userId,
    } as any);
  }

  async getLedgerAccounts(query: LedgerQueryDto): Promise<PaginatedResponseDto<LedgerAccount>> {
    const where: WhereOptions = {};

    if (query.group_id) {
      (where as any).group_id = query.group_id;
    }

    if (query.search) {
      const search = `%${query.search}%`;
      (where as any)[Op.or] = [
        { name: { [Op.iLike]: search } },
        { code: { [Op.iLike]: search } },
      ];
    }

    const { rows, count } = await this.ledgerAccountRepo.findAndCountAll({
      where,
      include: [{ model: AccountGroup, attributes: ['id', 'name', 'nature'] }],
      order: [[query.sort_by, query.sort_order]],
      limit: query.limit,
      offset: query.offset,
    });

    const totalPages = Math.ceil(count / query.limit);
    return {
      items: rows,
      meta: {
        total: count,
        page: query.page,
        limit: query.limit,
        total_pages: totalPages,
        has_next: query.page < totalPages,
        has_prev: query.page > 1,
      },
    };
  }

  async getLedgerAccount(id: string): Promise<LedgerAccount> {
    const account = await this.ledgerAccountRepo.findByPk(id, {
      include: [{ model: AccountGroup, attributes: ['id', 'name', 'nature'] }],
    });
    if (!account) throw new NotFoundException('Ledger account not found.');
    return account;
  }

  async updateLedgerAccount(id: string, dto: UpdateLedgerAccountDto): Promise<LedgerAccount> {
    const account = await this.ledgerAccountRepo.findByPk(id);
    if (!account) throw new NotFoundException('Ledger account not found.');
    if (account.is_system && (dto.name || dto.code)) {
      throw new BadRequestException('System ledger accounts cannot be renamed.');
    }
    await account.update(dto);
    return this.getLedgerAccount(id);
  }

  async findLedgerByName(name: string): Promise<LedgerAccount | null> {
    return this.ledgerAccountRepo.findOne({ where: { name, is_system: true } });
  }

  // ─── Ledger Balance & Statement ──────────────────────────

  async getLedgerBalance(id: string, asOfDate?: string): Promise<{ debit: number; credit: number; balance: number; balance_type: string }> {
    const account = await this.getLedgerAccount(id);
    const where: any = { ledger_account_id: id };

    if (asOfDate) {
      where['$journalEntry.date$'] = { [Op.lte]: asOfDate };
      where['$journalEntry.is_cancelled$'] = false;
    }

    const result = await this.journalEntryLineRepo.findAll({
      where: { ledger_account_id: id },
      attributes: [
        [fn('COALESCE', fn('SUM', col('debit')), 0), 'total_debit'],
        [fn('COALESCE', fn('SUM', col('credit')), 0), 'total_credit'],
      ],
      include: [{
        model: JournalEntry,
        attributes: [],
        where: {
          is_cancelled: false,
          ...(asOfDate ? { date: { [Op.lte]: asOfDate } } : {}),
        },
      }],
      raw: true,
    });

    const row = result[0] as any;
    const totalDebit = parseFloat(row?.total_debit || '0') + parseFloat(String(account.opening_balance_type === 'debit' ? account.opening_balance : 0));
    const totalCredit = parseFloat(row?.total_credit || '0') + parseFloat(String(account.opening_balance_type === 'credit' ? account.opening_balance : 0));
    const balance = Math.abs(totalDebit - totalCredit);
    const balance_type = totalDebit >= totalCredit ? 'debit' : 'credit';

    return { debit: totalDebit, credit: totalCredit, balance, balance_type };
  }

  async getLedgerStatement(id: string, query: LedgerStatementQueryDto) {
    const account = await this.getLedgerAccount(id);

    const entryWhere: any = { is_cancelled: false };
    if (query.from_date) entryWhere.date = { ...entryWhere.date, [Op.gte]: query.from_date };
    if (query.to_date) entryWhere.date = { ...entryWhere.date, [Op.lte]: query.to_date };

    const lines = await this.journalEntryLineRepo.findAll({
      where: { ledger_account_id: id },
      include: [{
        model: JournalEntry,
        where: entryWhere,
        attributes: ['id', 'entry_number', 'date', 'narration', 'reference_type', 'reference_id'],
      }],
      order: [[{ model: JournalEntry, as: 'journalEntry' }, 'date', 'ASC']],
    });

    // Build running balance
    let runningBalance = parseFloat(String(account.opening_balance)) * (account.opening_balance_type === 'debit' ? 1 : -1);

    const statement = lines.map((line) => {
      const debit = parseFloat(String(line.debit));
      const credit = parseFloat(String(line.credit));
      runningBalance += debit - credit;

      return {
        date: line.journalEntry.date,
        entry_number: line.journalEntry.entry_number,
        narration: line.journalEntry.narration,
        reference_type: line.journalEntry.reference_type,
        reference_id: line.journalEntry.reference_id,
        debit,
        credit,
        balance: Math.abs(runningBalance),
        balance_type: runningBalance >= 0 ? 'Dr' : 'Cr',
      };
    });

    return {
      account: { id: account.id, name: account.name, code: account.code },
      opening_balance: parseFloat(String(account.opening_balance)),
      opening_balance_type: account.opening_balance_type,
      statement,
      closing_balance: statement.length > 0 ? statement[statement.length - 1].balance : parseFloat(String(account.opening_balance)),
      closing_balance_type: statement.length > 0 ? statement[statement.length - 1].balance_type : (account.opening_balance_type === 'debit' ? 'Dr' : 'Cr'),
    };
  }

  // ─── Journal Entries ──────────────────────────────────────

  async createJournalEntry(dto: CreateJournalEntryDto, userId: string): Promise<JournalEntry> {
    // Validate debit = credit
    const totalDebit = dto.lines.reduce((sum, l) => sum + l.debit, 0);
    const totalCredit = dto.lines.reduce((sum, l) => sum + l.credit, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new BadRequestException(
        `Total debits (${totalDebit.toFixed(2)}) must equal total credits (${totalCredit.toFixed(2)}).`,
      );
    }

    // Validate each line has either debit or credit, not both
    for (const line of dto.lines) {
      if (line.debit > 0 && line.credit > 0) {
        throw new BadRequestException('A journal line cannot have both debit and credit amounts.');
      }
      if (line.debit === 0 && line.credit === 0) {
        throw new BadRequestException('A journal line must have either a debit or credit amount.');
      }
      const account = await this.ledgerAccountRepo.findByPk(line.ledger_account_id);
      if (!account) throw new NotFoundException(`Ledger account ${line.ledger_account_id} not found.`);
      if (!account.is_active) throw new BadRequestException(`Ledger account "${account.name}" is inactive.`);
    }

    const fy = await this.getActiveFinancialYear();
    const entryNumber = await this.getNextNumber('journal_entry', fy.name);

    const transaction = await this.sequelize.transaction();
    try {
      const entry = await this.journalEntryRepo.create(
        {
          entry_number: entryNumber,
          date: dto.date,
          narration: dto.narration,
          reference_type: 'manual',
          is_auto_generated: false,
          financial_year: fy.name,
          total_amount: totalDebit,
          created_by: userId,
        } as any,
        { transaction },
      );

      const lineRecords = dto.lines.map((l) => ({
        journal_entry_id: entry.id,
        ledger_account_id: l.ledger_account_id,
        debit: l.debit,
        credit: l.credit,
        description: l.description || null,
      }));

      await this.journalEntryLineRepo.bulkCreate(lineRecords as any[], { transaction });
      await transaction.commit();

      return this.getJournalEntry(entry.id);
    } catch (error) {
      await transaction.rollback();
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      console.error('AccountingService.createJournalEntry error:', error);
      throw new InternalServerErrorException('Failed to create journal entry.');
    }
  }

  /**
   * Internal method — called by sales, purchase, banking modules to auto-create journal entries.
   */
  async createAutoJournalEntry(data: {
    date: string;
    narration: string;
    referenceType: string;
    referenceId: string;
    lines: { ledgerAccountId: string; debit: number; credit: number; description?: string }[];
    userId?: string;
  }): Promise<JournalEntry> {
    const totalDebit = data.lines.reduce((sum, l) => sum + l.debit, 0);
    const totalCredit = data.lines.reduce((sum, l) => sum + l.credit, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new BadRequestException(
        `Auto journal entry imbalanced: debits=${totalDebit.toFixed(2)}, credits=${totalCredit.toFixed(2)}.`,
      );
    }

    const fy = await this.getActiveFinancialYear();
    const entryNumber = await this.getNextNumber('journal_entry', fy.name);

    const transaction = await this.sequelize.transaction();
    try {
      const entry = await this.journalEntryRepo.create(
        {
          entry_number: entryNumber,
          date: data.date,
          narration: data.narration,
          reference_type: data.referenceType,
          reference_id: data.referenceId,
          is_auto_generated: true,
          financial_year: fy.name,
          total_amount: totalDebit,
          created_by: data.userId,
        } as any,
        { transaction },
      );

      const lineRecords = data.lines.map((l) => ({
        journal_entry_id: entry.id,
        ledger_account_id: l.ledgerAccountId,
        debit: l.debit,
        credit: l.credit,
        description: l.description || null,
      }));

      await this.journalEntryLineRepo.bulkCreate(lineRecords as any[], { transaction });
      await transaction.commit();

      return entry;
    } catch (error) {
      await transaction.rollback();
      console.error('AccountingService.createAutoJournalEntry error:', error);
      throw new InternalServerErrorException('Failed to create auto journal entry.');
    }
  }

  async cancelJournalEntry(id: string, userId: string): Promise<JournalEntry> {
    const entry = await this.journalEntryRepo.findByPk(id, {
      include: [{ model: JournalEntryLine }],
    });
    if (!entry) throw new NotFoundException('Journal entry not found.');
    if (entry.is_cancelled) throw new BadRequestException('Journal entry is already cancelled.');

    const transaction = await this.sequelize.transaction();
    try {
      // Mark original as cancelled
      await entry.update({ is_cancelled: true }, { transaction });

      // Create reversal entry
      const fy = await this.getActiveFinancialYear();
      const reversalNumber = await this.getNextNumber('journal_entry', fy.name);

      const reversal = await this.journalEntryRepo.create(
        {
          entry_number: reversalNumber,
          date: new Date().toISOString().split('T')[0],
          narration: `Reversal of ${entry.entry_number}: ${entry.narration}`,
          reference_type: entry.reference_type,
          reference_id: entry.reference_id,
          is_auto_generated: true,
          financial_year: fy.name,
          total_amount: entry.total_amount,
          created_by: userId,
        } as any,
        { transaction },
      );

      // Swap debit/credit in reversal lines
      const reversalLines = entry.lines.map((l) => ({
        journal_entry_id: reversal.id,
        ledger_account_id: l.ledger_account_id,
        debit: l.credit,
        credit: l.debit,
        description: `Reversal: ${l.description || ''}`.trim(),
      }));

      await this.journalEntryLineRepo.bulkCreate(reversalLines as any[], { transaction });
      await transaction.commit();

      return reversal;
    } catch (error) {
      await transaction.rollback();
      console.error('AccountingService.cancelJournalEntry error:', error);
      throw new InternalServerErrorException('Failed to cancel journal entry.');
    }
  }

  async getJournalEntries(query: PaginationQueryDto & { reference_type?: string; from_date?: string; to_date?: string }): Promise<PaginatedResponseDto<JournalEntry>> {
    const where: any = {};

    if (query.reference_type) where.reference_type = query.reference_type;
    if (query.from_date) where.date = { ...where.date, [Op.gte]: query.from_date };
    if (query.to_date) where.date = { ...where.date, [Op.lte]: query.to_date };
    if (query.search) {
      where[Op.or] = [
        { entry_number: { [Op.iLike]: `%${query.search}%` } },
        { narration: { [Op.iLike]: `%${query.search}%` } },
      ];
    }

    const { rows, count } = await this.journalEntryRepo.findAndCountAll({
      where,
      include: [{
        model: JournalEntryLine,
        include: [{ model: LedgerAccount, attributes: ['id', 'name', 'code'] }],
      }],
      order: [[query.sort_by, query.sort_order]],
      limit: query.limit,
      offset: query.offset,
    });

    const totalPages = Math.ceil(count / query.limit);
    return {
      items: rows,
      meta: {
        total: count,
        page: query.page,
        limit: query.limit,
        total_pages: totalPages,
        has_next: query.page < totalPages,
        has_prev: query.page > 1,
      },
    };
  }

  async getJournalEntry(id: string): Promise<JournalEntry> {
    const entry = await this.journalEntryRepo.findByPk(id, {
      include: [{
        model: JournalEntryLine,
        include: [{ model: LedgerAccount, attributes: ['id', 'name', 'code'] }],
      }],
    });
    if (!entry) throw new NotFoundException('Journal entry not found.');
    return entry;
  }

  // ─── Financial Reports ──────────────────────────────────

  async getTrialBalance(query: ReportDateQueryDto) {
    const accounts = await this.ledgerAccountRepo.findAll({
      where: { is_active: true },
      include: [{ model: AccountGroup, attributes: ['id', 'name', 'nature'] }],
      order: [['name', 'ASC']],
    });

    const balances = await Promise.all(
      accounts.map(async (account) => {
        const bal = await this.getLedgerBalance(account.id, query.as_of_date);
        return {
          account_id: account.id,
          account_name: account.name,
          account_code: account.code,
          group_name: account.group?.name,
          group_nature: account.group?.nature,
          debit_balance: bal.balance_type === 'debit' ? bal.balance : 0,
          credit_balance: bal.balance_type === 'credit' ? bal.balance : 0,
        };
      }),
    );

    // Filter out zero-balance accounts
    const nonZero = balances.filter((b) => b.debit_balance > 0 || b.credit_balance > 0);
    const totalDebit = nonZero.reduce((sum, b) => sum + b.debit_balance, 0);
    const totalCredit = nonZero.reduce((sum, b) => sum + b.credit_balance, 0);

    return {
      as_of_date: query.as_of_date || new Date().toISOString().split('T')[0],
      accounts: nonZero,
      total_debit: totalDebit,
      total_credit: totalCredit,
      is_balanced: Math.abs(totalDebit - totalCredit) < 0.01,
    };
  }

  async getProfitAndLoss(query: ReportDateQueryDto) {
    const accounts = await this.ledgerAccountRepo.findAll({
      where: { is_active: true },
      include: [{ model: AccountGroup, attributes: ['id', 'name', 'nature'] }],
    });

    const incomeAccounts = accounts.filter((a) => a.group?.nature === 'income');
    const expenseAccounts = accounts.filter((a) => a.group?.nature === 'expense');

    const getAmount = async (account: LedgerAccount) => {
      const bal = await this.getLedgerBalance(account.id, query.to_date);
      return { name: account.name, code: account.code, amount: bal.balance, type: bal.balance_type };
    };

    const income = await Promise.all(incomeAccounts.map(getAmount));
    const expenses = await Promise.all(expenseAccounts.map(getAmount));

    const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      from_date: query.from_date,
      to_date: query.to_date,
      income,
      total_income: totalIncome,
      expenses,
      total_expenses: totalExpenses,
      net_profit: totalIncome - totalExpenses,
    };
  }

  async getBalanceSheet(query: ReportDateQueryDto) {
    const accounts = await this.ledgerAccountRepo.findAll({
      where: { is_active: true },
      include: [{ model: AccountGroup, attributes: ['id', 'name', 'nature'] }],
    });

    const getAmount = async (account: LedgerAccount) => {
      const bal = await this.getLedgerBalance(account.id, query.as_of_date);
      return { name: account.name, code: account.code, amount: bal.balance, type: bal.balance_type };
    };

    const assetAccounts = accounts.filter((a) => a.group?.nature === 'assets');
    const liabilityAccounts = accounts.filter((a) => a.group?.nature === 'liabilities');
    const equityAccounts = accounts.filter((a) => a.group?.nature === 'equity');

    const assets = await Promise.all(assetAccounts.map(getAmount));
    const liabilities = await Promise.all(liabilityAccounts.map(getAmount));
    const equity = await Promise.all(equityAccounts.map(getAmount));

    const totalAssets = assets.reduce((sum, a) => sum + a.amount, 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0);
    const totalEquity = equity.reduce((sum, e) => sum + e.amount, 0);

    return {
      as_of_date: query.as_of_date || new Date().toISOString().split('T')[0],
      assets,
      total_assets: totalAssets,
      liabilities,
      total_liabilities: totalLiabilities,
      equity,
      total_equity: totalEquity,
      liabilities_plus_equity: totalLiabilities + totalEquity,
      is_balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
    };
  }

  // ─── Financial Year ──────────────────────────────────────

  async createFinancialYear(dto: CreateFinancialYearDto): Promise<FinancialYear> {
    const existing = await this.financialYearRepo.findOne({ where: { name: dto.name } });
    if (existing) throw new ConflictException(`Financial year "${dto.name}" already exists.`);

    if (dto.is_active) {
      await this.financialYearRepo.update({ is_active: false }, { where: {} });
    }

    const fy = await this.financialYearRepo.create({ ...dto } as any);

    // Create number sequences for the new FY
    const docTypes = [
      { type: 'sales_invoice', prefix: 'INV' },
      { type: 'purchase_bill', prefix: 'PB' },
      { type: 'credit_note', prefix: 'CN' },
      { type: 'debit_note', prefix: 'DN' },
      { type: 'payment', prefix: 'PMT' },
      { type: 'receipt', prefix: 'RCT' },
      { type: 'journal_entry', prefix: 'JE' },
      { type: 'quotation', prefix: 'QT' },
      { type: 'purchase_order', prefix: 'PO' },
      { type: 'stock_adjustment', prefix: 'ADJ' },
    ];

    await this.numberSequenceRepo.bulkCreate(
      docTypes.map((d) => ({
        document_type: d.type,
        prefix: d.prefix,
        financial_year: dto.name,
        last_number: 0,
      })) as any[],
    );

    return fy;
  }

  async getFinancialYears(): Promise<FinancialYear[]> {
    return this.financialYearRepo.findAll({ order: [['start_date', 'DESC']] });
  }

  async getActiveFinancialYear(): Promise<FinancialYear> {
    const fy = await this.financialYearRepo.findOne({ where: { is_active: true } });
    if (!fy) throw new BadRequestException('No active financial year. Please create one first.');
    return fy;
  }

  async closeFinancialYear(id: string): Promise<FinancialYear> {
    const fy = await this.financialYearRepo.findByPk(id);
    if (!fy) throw new NotFoundException('Financial year not found.');
    if (fy.is_closed) throw new BadRequestException('Financial year is already closed.');
    await fy.update({ is_closed: true, is_active: false });
    return fy;
  }

  // ─── Number Sequence ──────────────────────────────────────

  async getNextNumber(documentType: string, financialYear?: string): Promise<string> {
    const fy = financialYear || (await this.getActiveFinancialYear()).name;

    // Use raw query for atomic increment
    const [results] = await this.sequelize.query(
      `UPDATE number_sequences
       SET last_number = last_number + 1, updated_at = NOW()
       WHERE document_type = :documentType AND financial_year = :fy
       RETURNING prefix, last_number`,
      {
        replacements: { documentType, fy },
        type: 'SELECT' as any,
      },
    );

    const row = (results as any)?.[0] || (results as any);
    if (!row?.prefix) {
      throw new BadRequestException(`Number sequence not found for ${documentType} in FY ${fy}.`);
    }

    const fyShort = fy.replace('20', '').replace('-', '');
    const paddedNumber = String(row.last_number).padStart(4, '0');
    return `${row.prefix}-${fyShort}-${paddedNumber}`;
  }
}
