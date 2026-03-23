import { REPOSITORY } from '../common/constants/app.constants';
import { AccountGroup } from './entities/account-group.entity';
import { LedgerAccount } from './entities/ledger-account.entity';
import { JournalEntry } from './entities/journal-entry.entity';
import { JournalEntryLine } from './entities/journal-entry-line.entity';
import { FinancialYear } from './entities/financial-year.entity';
import { NumberSequence } from './entities/number-sequence.entity';

export const accountingProviders = [
  { provide: REPOSITORY.ACCOUNT_GROUPS, useValue: AccountGroup },
  { provide: REPOSITORY.LEDGER_ACCOUNTS, useValue: LedgerAccount },
  { provide: REPOSITORY.JOURNAL_ENTRIES, useValue: JournalEntry },
  { provide: REPOSITORY.JOURNAL_ENTRY_LINES, useValue: JournalEntryLine },
  { provide: REPOSITORY.FINANCIAL_YEARS, useValue: FinancialYear },
  { provide: REPOSITORY.NUMBER_SEQUENCES, useValue: NumberSequence },
];
