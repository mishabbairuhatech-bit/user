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
import { AccountGroup } from './account-group.entity';
import { User } from '../../users/entities/user.entity';

@Table({ tableName: 'ledger_accounts', timestamps: true, underscored: true })
export class LedgerAccount extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column({ type: DataType.STRING(150), allowNull: false })
  name: string;

  @Unique
  @Column({ type: DataType.STRING(20), allowNull: true })
  code: string;

  @ForeignKey(() => AccountGroup)
  @Column({ type: DataType.UUID, allowNull: false })
  group_id: string;

  @BelongsTo(() => AccountGroup)
  group: AccountGroup;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  opening_balance: number;

  @Default('debit')
  @Column({
    type: DataType.ENUM('debit', 'credit'),
    allowNull: false,
  })
  opening_balance_type: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_system: boolean;

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
