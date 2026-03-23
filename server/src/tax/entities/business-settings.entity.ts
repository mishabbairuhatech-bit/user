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

@Table({ tableName: 'business_settings', timestamps: true, underscored: true })
export class BusinessSettings extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column({ type: DataType.STRING(200), allowNull: false })
  business_name: string;

  @Column({ type: DataType.STRING(15), allowNull: true })
  gstin: string;

  @Column({ type: DataType.STRING(10), allowNull: true })
  pan: string;

  @Column({ type: DataType.STRING(2), allowNull: true })
  state_code: string;

  @Column({ type: DataType.JSONB, allowNull: true })
  address: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };

  @Column({ type: DataType.STRING(15), allowNull: true })
  phone: string;

  @Column({ type: DataType.STRING(100), allowNull: true })
  email: string;

  @Column({ type: DataType.STRING(500), allowNull: true })
  logo_url: string;

  @Default('INV')
  @Column({ type: DataType.STRING(10), allowNull: false })
  invoice_prefix: string;

  @Default(4)
  @Column({ type: DataType.INTEGER, allowNull: false })
  financial_year_start_month: number;

  @Default('INR')
  @Column({ type: DataType.STRING(3), allowNull: false })
  currency_code: string;

  @Default(2)
  @Column({ type: DataType.INTEGER, allowNull: false })
  decimal_places: number;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;
}
