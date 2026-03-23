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
import { Product } from './product.entity';
import { User } from '../../users/entities/user.entity';

@Table({ tableName: 'stock_movements', timestamps: true, underscored: true, updatedAt: false })
export class StockMovement extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => Product)
  @Column({ type: DataType.UUID, allowNull: false })
  product_id: string;

  @BelongsTo(() => Product)
  product: Product;

  @Column({
    type: DataType.ENUM('purchase', 'sale', 'return_in', 'return_out', 'adjustment_in', 'adjustment_out', 'opening'),
    allowNull: false,
  })
  movement_type: string;

  @Column({ type: DataType.DECIMAL(15, 3), allowNull: false })
  quantity: number;

  @Column({
    type: DataType.ENUM('sales_invoice_item', 'purchase_bill_item', 'credit_note_item', 'debit_note_item', 'stock_adjustment', 'opening'),
    allowNull: false,
  })
  reference_type: string;

  @Column({ type: DataType.UUID, allowNull: true })
  reference_id: string;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  unit_cost: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 3), allowNull: false })
  stock_before: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 3), allowNull: false })
  stock_after: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  notes: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: true })
  created_by: string;

  @BelongsTo(() => User)
  creator: User;

  @CreatedAt
  created_at: Date;
}
