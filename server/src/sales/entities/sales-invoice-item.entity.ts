import {
  Table, Column, Model, DataType, PrimaryKey, Default,
  CreatedAt, ForeignKey, BelongsTo,
} from 'sequelize-typescript';
import { SalesInvoice } from './sales-invoice.entity';
import { Product } from '../../inventory/entities/product.entity';
import { Unit } from '../../inventory/entities/unit.entity';

@Table({ tableName: 'sales_invoice_items', timestamps: true, underscored: true, updatedAt: false })
export class SalesInvoiceItem extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => SalesInvoice)
  @Column({ type: DataType.UUID, allowNull: false })
  sales_invoice_id: string;

  @BelongsTo(() => SalesInvoice)
  salesInvoice: SalesInvoice;

  @ForeignKey(() => Product)
  @Column({ type: DataType.UUID, allowNull: false })
  product_id: string;

  @BelongsTo(() => Product)
  product: Product;

  @Column({ type: DataType.STRING(255), allowNull: true })
  description: string;

  @Column({ type: DataType.STRING(10), allowNull: true })
  hsn_code: string;

  @Column({ type: DataType.DECIMAL(15, 3), allowNull: false })
  quantity: number;

  @ForeignKey(() => Unit)
  @Column({ type: DataType.UUID, allowNull: true })
  unit_id: string;

  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  unit_price: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(5, 2), allowNull: false })
  discount_percent: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  discount_amount: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  taxable_amount: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(5, 2), allowNull: false })
  tax_rate: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(5, 2), allowNull: false })
  cgst_rate: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  cgst_amount: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(5, 2), allowNull: false })
  sgst_rate: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  sgst_amount: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(5, 2), allowNull: false })
  igst_rate: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  igst_amount: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  total: number;

  @CreatedAt
  created_at: Date;
}
