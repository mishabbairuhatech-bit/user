import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  UpdatedAt,
  Unique,
} from 'sequelize-typescript';

@Table({ tableName: 'financial_years', timestamps: true, underscored: true })
export class FinancialYear extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Unique
  @Column({ type: DataType.STRING(10), allowNull: false })
  name: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  start_date: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  end_date: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_active: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_closed: boolean;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;
}
