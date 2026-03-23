import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({ tableName: 'tax_rates', timestamps: true, underscored: true })
export class TaxRate extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column({ type: DataType.STRING(50), allowNull: false })
  name: string;

  @Default(0)
  @Column({ type: DataType.DECIMAL(5, 2), allowNull: false })
  rate: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(5, 2), allowNull: false })
  cgst_rate: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(5, 2), allowNull: false })
  sgst_rate: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(5, 2), allowNull: false })
  igst_rate: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(5, 2), allowNull: false })
  cess_rate: number;

  @Default(true)
  @Column(DataType.BOOLEAN)
  is_active: boolean;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;
}
