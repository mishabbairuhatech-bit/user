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
import { StockAdjustment } from './stock-adjustment.entity';
import { Product } from './product.entity';

@Table({ tableName: 'stock_adjustment_items', timestamps: true, underscored: true, updatedAt: false })
export class StockAdjustmentItem extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => StockAdjustment)
  @Column({ type: DataType.UUID, allowNull: false })
  stock_adjustment_id: string;

  @BelongsTo(() => StockAdjustment)
  stockAdjustment: StockAdjustment;

  @ForeignKey(() => Product)
  @Column({ type: DataType.UUID, allowNull: false })
  product_id: string;

  @BelongsTo(() => Product)
  product: Product;

  @Column({
    type: DataType.ENUM('increase', 'decrease'),
    allowNull: false,
  })
  adjustment_type: string;

  @Column({ type: DataType.DECIMAL(15, 3), allowNull: false })
  quantity: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  unit_cost: number;

  @CreatedAt
  created_at: Date;
}
