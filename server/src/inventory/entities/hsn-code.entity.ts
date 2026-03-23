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
import { TaxRate } from '../../tax/entities/tax-rate.entity';

@Table({ tableName: 'hsn_codes', timestamps: true, underscored: true })
export class HsnCode extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Unique
  @Column({ type: DataType.STRING(10), allowNull: false })
  code: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string;

  @ForeignKey(() => TaxRate)
  @Column({ type: DataType.UUID, allowNull: true })
  tax_rate_id: string;

  @BelongsTo(() => TaxRate)
  taxRate: TaxRate;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;
}
