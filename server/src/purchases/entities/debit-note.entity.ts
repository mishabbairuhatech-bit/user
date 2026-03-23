import {
  Table, Column, Model, DataType, PrimaryKey, Default,
  CreatedAt, UpdatedAt, ForeignKey, BelongsTo, HasMany,
} from 'sequelize-typescript';
import { PurchaseBill } from './purchase-bill.entity';
import { Party } from '../../parties/entities/party.entity';
import { JournalEntry } from '../../accounting/entities/journal-entry.entity';
import { User } from '../../users/entities/user.entity';
import { DebitNoteItem } from './debit-note-item.entity';

@Table({ tableName: 'debit_notes', timestamps: true, underscored: true })
export class DebitNote extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column({ type: DataType.STRING(30), allowNull: false })
  debit_note_number: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  date: string;

  @ForeignKey(() => PurchaseBill)
  @Column({ type: DataType.UUID, allowNull: false })
  original_bill_id: string;

  @BelongsTo(() => PurchaseBill)
  originalBill: PurchaseBill;

  @ForeignKey(() => Party)
  @Column({ type: DataType.UUID, allowNull: false })
  party_id: string;

  @BelongsTo(() => Party)
  party: Party;

  @Column({ type: DataType.TEXT, allowNull: true })
  reason: string;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  subtotal: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  cgst_amount: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  sgst_amount: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  igst_amount: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  total_tax: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  grand_total: number;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_cancelled: boolean;

  @ForeignKey(() => JournalEntry)
  @Column({ type: DataType.UUID, allowNull: true })
  journal_entry_id: string;

  @BelongsTo(() => JournalEntry)
  journalEntry: JournalEntry;

  @Column({ type: DataType.STRING(10), allowNull: true })
  financial_year: string;

  @HasMany(() => DebitNoteItem)
  items: DebitNoteItem[];

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
