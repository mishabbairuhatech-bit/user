import {
  Table, Column, Model, DataType, PrimaryKey, Default,
  CreatedAt, UpdatedAt, ForeignKey, BelongsTo,
} from 'sequelize-typescript';
import { PosSession } from './pos-session.entity';

@Table({ tableName: 'held_bills', timestamps: true, underscored: true })
export class HeldBill extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => PosSession)
  @Column({ type: DataType.UUID, allowNull: false })
  pos_session_id: string;

  @BelongsTo(() => PosSession)
  posSession: PosSession;

  @Column({ type: DataType.STRING(200), allowNull: true })
  customer_name: string;

  @Column({ type: DataType.JSONB, allowNull: false })
  items: Array<{
    product_id: string;
    name: string;
    sku: string;
    qty: number;
    price: number;
    discount: number;
    tax_rate_id?: string;
  }>;

  @Column({ type: DataType.TEXT, allowNull: true })
  notes: string;

  @Column({ type: DataType.DATE, allowNull: false, defaultValue: DataType.NOW })
  held_at: Date;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;
}
