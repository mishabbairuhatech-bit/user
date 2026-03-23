import {
  Table, Column, Model, DataType, PrimaryKey, Default,
  CreatedAt, ForeignKey, BelongsTo,
} from 'sequelize-typescript';
import { PurchaseOrder } from './purchase-order.entity';
import { Product } from '../../inventory/entities/product.entity';
import { Unit } from '../../inventory/entities/unit.entity';

@Table({ tableName: 'purchase_order_items', timestamps: true, underscored: true, updatedAt: false })
export class PurchaseOrderItem extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => PurchaseOrder)
  @Column({ type: DataType.UUID, allowNull: false })
  purchase_order_id: string;

  @BelongsTo(() => PurchaseOrder)
  purchaseOrder: PurchaseOrder;

  @ForeignKey(() => Product)
  @Column({ type: DataType.UUID, allowNull: false })
  product_id: string;

  @BelongsTo(() => Product)
  product: Product;

  @Column({ type: DataType.DECIMAL(15, 3), allowNull: false })
  quantity: number;

  @ForeignKey(() => Unit)
  @Column({ type: DataType.UUID, allowNull: true })
  unit_id: string;

  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  unit_price: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  taxable_amount: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(5, 2), allowNull: false })
  tax_rate: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  tax_amount: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  total: number;

  @CreatedAt
  created_at: Date;
}
