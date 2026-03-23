import {
  Table, Column, Model, DataType, PrimaryKey, Default,
  CreatedAt, UpdatedAt, ForeignKey, BelongsTo, HasMany,
} from 'sequelize-typescript';
import { Party } from '../../parties/entities/party.entity';
import { User } from '../../users/entities/user.entity';
import { PurchaseOrderItem } from './purchase-order-item.entity';

@Table({ tableName: 'purchase_orders', timestamps: true, underscored: true })
export class PurchaseOrder extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column({ type: DataType.STRING(30), allowNull: false })
  po_number: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  date: string;

  @Column({ type: DataType.DATEONLY, allowNull: true })
  expected_date: string;

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
  @Column({ type: DataType.ENUM('draft', 'sent', 'partial', 'received', 'cancelled'), allowNull: false })
  status: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  notes: string;

  @Column({ type: DataType.STRING(10), allowNull: true })
  financial_year: string;

  @HasMany(() => PurchaseOrderItem)
  items: PurchaseOrderItem[];

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
