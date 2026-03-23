import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
  Unique,
} from 'sequelize-typescript';
import { Category } from './category.entity';
import { Unit } from './unit.entity';
import { HsnCode } from './hsn-code.entity';
import { TaxRate } from '../../tax/entities/tax-rate.entity';
import { User } from '../../users/entities/user.entity';

@Table({ tableName: 'products', timestamps: true, underscored: true })
export class Product extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column({ type: DataType.STRING(200), allowNull: false })
  name: string;

  @Unique
  @Column({ type: DataType.STRING(50), allowNull: false })
  sku: string;

  @Unique
  @Column({ type: DataType.STRING(50), allowNull: true })
  barcode: string;

  @ForeignKey(() => Category)
  @Column({ type: DataType.UUID, allowNull: true })
  category_id: string;

  @BelongsTo(() => Category)
  category: Category;

  @ForeignKey(() => Unit)
  @Column({ type: DataType.UUID, allowNull: true })
  unit_id: string;

  @BelongsTo(() => Unit)
  unit: Unit;

  @ForeignKey(() => HsnCode)
  @Column({ type: DataType.UUID, allowNull: true })
  hsn_code_id: string;

  @BelongsTo(() => HsnCode)
  hsnCode: HsnCode;

  @ForeignKey(() => TaxRate)
  @Column({ type: DataType.UUID, allowNull: true })
  tax_rate_id: string;

  @BelongsTo(() => TaxRate)
  taxRate: TaxRate;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  purchase_price: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  selling_price: number;

  @Column({ type: DataType.DECIMAL(15, 2), allowNull: true })
  wholesale_price: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 3), allowNull: false })
  minimum_stock: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 3), allowNull: false })
  opening_stock: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 3), allowNull: false })
  current_stock: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string;

  @Column({ type: DataType.STRING(500), allowNull: true })
  image_url: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  is_active: boolean;

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
