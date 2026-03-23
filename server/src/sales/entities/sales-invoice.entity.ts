import {
  Table, Column, Model, DataType, PrimaryKey, Default,
  CreatedAt, UpdatedAt, ForeignKey, BelongsTo, HasMany,
} from 'sequelize-typescript';
import { Party } from '../../parties/entities/party.entity';
import { JournalEntry } from '../../accounting/entities/journal-entry.entity';
import { User } from '../../users/entities/user.entity';
import { SalesInvoiceItem } from './sales-invoice-item.entity';

@Table({ tableName: 'sales_invoices', timestamps: true, underscored: true })
export class SalesInvoice extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column({ type: DataType.STRING(30), allowNull: false })
  invoice_number: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  date: string;

  @Column({ type: DataType.DATEONLY, allowNull: true })
  due_date: string;

  @ForeignKey(() => Party)
  @Column({ type: DataType.UUID, allowNull: true })
  party_id: string;

  @BelongsTo(() => Party)
  party: Party;

  @Column({ type: DataType.JSONB, allowNull: true })
  billing_address: object;

  @Column({ type: DataType.JSONB, allowNull: true })
  shipping_address: object;

  @Column({ type: DataType.STRING(2), allowNull: true })
  place_of_supply: string;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  subtotal: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  discount_amount: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  taxable_amount: number;

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
  cess_amount: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  total_tax: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  round_off: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  grand_total: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  amount_paid: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  balance_due: number;

  @Default('unpaid')
  @Column({ type: DataType.ENUM('unpaid', 'partial', 'paid'), allowNull: false })
  payment_status: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  notes: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  terms: string;

  @Default('sales')
  @Column({ type: DataType.ENUM('sales', 'pos'), allowNull: false })
  source: string;

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

  @HasMany(() => SalesInvoiceItem)
  items: SalesInvoiceItem[];

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
