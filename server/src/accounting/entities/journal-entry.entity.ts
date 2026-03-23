import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  UpdatedAt,
  HasMany,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { JournalEntryLine } from './journal-entry-line.entity';
import { User } from '../../users/entities/user.entity';

@Table({ tableName: 'journal_entries', timestamps: true, underscored: true })
export class JournalEntry extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column({ type: DataType.STRING(30), allowNull: false })
  entry_number: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  date: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  narration: string;

  @Column({
    type: DataType.ENUM(
      'sales_invoice',
      'purchase_bill',
      'payment',
      'receipt',
      'pos_bill',
      'credit_note',
      'debit_note',
      'manual',
      'stock_adjustment',
    ),
    allowNull: false,
    defaultValue: 'manual',
  })
  reference_type: string;

  @Column({ type: DataType.UUID, allowNull: true })
  reference_id: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_auto_generated: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_cancelled: boolean;

  @Column({ type: DataType.STRING(10), allowNull: false })
  financial_year: string;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  total_amount: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: true })
  created_by: string;

  @BelongsTo(() => User)
  creator: User;

  @HasMany(() => JournalEntryLine)
  lines: JournalEntryLine[];

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;
}
