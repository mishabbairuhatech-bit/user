import {
  Table, Column, Model, DataType, PrimaryKey, Default,
  CreatedAt, UpdatedAt, ForeignKey, BelongsTo, HasMany,
} from 'sequelize-typescript';
import { Party } from '../../parties/entities/party.entity';
import { SalesInvoice } from './sales-invoice.entity';
import { User } from '../../users/entities/user.entity';
import { QuotationItem } from './quotation-item.entity';

@Table({ tableName: 'quotations', timestamps: true, underscored: true })
export class Quotation extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column({ type: DataType.STRING(30), allowNull: false })
  quotation_number: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  date: string;

  @Column({ type: DataType.DATEONLY, allowNull: true })
  valid_until: string;

  @ForeignKey(() => Party)
  @Column({ type: DataType.UUID, allowNull: false })
  party_id: string;

  @BelongsTo(() => Party)
  party: Party;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  subtotal: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  total_tax: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  grand_total: number;

  @Default('draft')
  @Column({ type: DataType.ENUM('draft', 'sent', 'accepted', 'rejected', 'expired', 'converted'), allowNull: false })
  status: string;

  @ForeignKey(() => SalesInvoice)
  @Column({ type: DataType.UUID, allowNull: true })
  converted_to_invoice_id: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  notes: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  terms: string;

  @Column({ type: DataType.STRING(10), allowNull: true })
  financial_year: string;

  @HasMany(() => QuotationItem)
  items: QuotationItem[];

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
