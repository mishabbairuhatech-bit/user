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
} from 'sequelize-typescript';
import { LedgerAccount } from '../../accounting/entities/ledger-account.entity';
import { User } from '../../users/entities/user.entity';

@Table({ tableName: 'parties', timestamps: true, underscored: true })
export class Party extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column({ type: DataType.STRING(200), allowNull: false })
  name: string;

  @Column({
    type: DataType.ENUM('customer', 'vendor', 'both'),
    allowNull: false,
  })
  type: string;

  @Column({ type: DataType.STRING(15), allowNull: true })
  gstin: string;

  @Column({ type: DataType.STRING(10), allowNull: true })
  pan: string;

  @Column({ type: DataType.STRING(15), allowNull: true })
  phone: string;

  @Column({ type: DataType.STRING(100), allowNull: true })
  email: string;

  @Column({ type: DataType.JSONB, allowNull: true })
  billing_address: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    state_code?: string;
    pincode?: string;
  };

  @Column({ type: DataType.JSONB, allowNull: true })
  shipping_address: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    state_code?: string;
    pincode?: string;
  };

  @Column({ type: DataType.STRING(2), allowNull: true })
  state_code: string;

  @Column({ type: DataType.DECIMAL(15, 2), allowNull: true })
  credit_limit: number;

  @Default(0)
  @Column({ type: DataType.INTEGER, allowNull: false })
  credit_period_days: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  opening_balance: number;

  @Default('debit')
  @Column({
    type: DataType.ENUM('debit', 'credit'),
    allowNull: false,
  })
  opening_balance_type: string;

  @ForeignKey(() => LedgerAccount)
  @Column({ type: DataType.UUID, allowNull: true })
  ledger_account_id: string;

  @BelongsTo(() => LedgerAccount)
  ledgerAccount: LedgerAccount;

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
