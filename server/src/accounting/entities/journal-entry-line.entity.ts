import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { JournalEntry } from './journal-entry.entity';
import { LedgerAccount } from './ledger-account.entity';

@Table({ tableName: 'journal_entry_lines', timestamps: true, underscored: true, updatedAt: false })
export class JournalEntryLine extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => JournalEntry)
  @Column({ type: DataType.UUID, allowNull: false })
  journal_entry_id: string;

  @BelongsTo(() => JournalEntry)
  journalEntry: JournalEntry;

  @ForeignKey(() => LedgerAccount)
  @Column({ type: DataType.UUID, allowNull: false })
  ledger_account_id: string;

  @BelongsTo(() => LedgerAccount)
  ledgerAccount: LedgerAccount;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  debit: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  credit: number;

  @Column({ type: DataType.STRING(255), allowNull: true })
  description: string;

  @CreatedAt
  created_at: Date;
}
