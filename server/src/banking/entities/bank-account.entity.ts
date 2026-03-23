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

@Table({ tableName: 'bank_accounts', timestamps: true, underscored: true })
export class BankAccount extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column({ type: DataType.STRING(150), allowNull: false })
  account_name: string;

  @Column({ type: DataType.STRING(30), allowNull: true })
  account_number: string;

  @Column({ type: DataType.STRING(100), allowNull: true })
  bank_name: string;

  @Column({ type: DataType.STRING(100), allowNull: true })
  branch: string;

  @Column({ type: DataType.STRING(11), allowNull: true })
  ifsc_code: string;

  @Column({
    type: DataType.ENUM('current', 'savings', 'cash', 'wallet'),
    allowNull: false,
    defaultValue: 'current',
  })
  account_type: string;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  opening_balance: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  current_balance: number;

  @ForeignKey(() => LedgerAccount)
  @Column({ type: DataType.UUID, allowNull: true })
  ledger_account_id: string;

  @BelongsTo(() => LedgerAccount)
  ledgerAccount: LedgerAccount;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_default: boolean;

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
