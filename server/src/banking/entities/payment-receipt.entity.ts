import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { Party } from '../../parties/entities/party.entity';
import { BankAccount } from './bank-account.entity';
import { JournalEntry } from '../../accounting/entities/journal-entry.entity';
import { User } from '../../users/entities/user.entity';
import { PaymentAllocation } from './payment-allocation.entity';

@Table({ tableName: 'payment_receipts', timestamps: true, underscored: true })
export class PaymentReceipt extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column({ type: DataType.STRING(30), allowNull: false })
  voucher_number: string;

  @Column({
    type: DataType.ENUM('payment', 'receipt'),
    allowNull: false,
  })
  type: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  date: string;

  @ForeignKey(() => Party)
  @Column({ type: DataType.UUID, allowNull: false })
  party_id: string;

  @BelongsTo(() => Party)
  party: Party;

  @ForeignKey(() => BankAccount)
  @Column({ type: DataType.UUID, allowNull: false })
  bank_account_id: string;

  @BelongsTo(() => BankAccount)
  bankAccount: BankAccount;

  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  amount: number;

  @Column({
    type: DataType.ENUM('cash', 'bank_transfer', 'cheque', 'upi', 'card', 'other'),
    allowNull: false,
    defaultValue: 'cash',
  })
  payment_mode: string;

  @Column({ type: DataType.STRING(20), allowNull: true })
  cheque_number: string;

  @Column({ type: DataType.DATEONLY, allowNull: true })
  cheque_date: string;

  @Column({ type: DataType.STRING(50), allowNull: true })
  transaction_ref: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  narration: string;

  @ForeignKey(() => JournalEntry)
  @Column({ type: DataType.UUID, allowNull: true })
  journal_entry_id: string;

  @BelongsTo(() => JournalEntry)
  journalEntry: JournalEntry;

  @Column({ type: DataType.STRING(10), allowNull: true })
  financial_year: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_cancelled: boolean;

  @HasMany(() => PaymentAllocation)
  allocations: PaymentAllocation[];

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: true })
  created_by: string;

  @BelongsTo(() => User)
  creator: User;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;
}
