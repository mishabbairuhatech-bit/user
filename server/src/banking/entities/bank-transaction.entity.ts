import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { BankAccount } from './bank-account.entity';

@Table({ tableName: 'bank_transactions', timestamps: true, underscored: true, updatedAt: false })
export class BankTransaction extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => BankAccount)
  @Column({ type: DataType.UUID, allowNull: false })
  bank_account_id: string;

  @BelongsTo(() => BankAccount)
  bankAccount: BankAccount;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  date: string;

  @Column({
    type: DataType.ENUM('credit', 'debit'),
    allowNull: false,
  })
  type: string;

  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  amount: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  balance_after: number;

  @Column({
    type: DataType.ENUM('payment_receipt', 'pos_bill', 'manual', 'transfer', 'opening'),
    allowNull: false,
  })
  reference_type: string;

  @Column({ type: DataType.UUID, allowNull: true })
  reference_id: string;

  @Column({ type: DataType.STRING(255), allowNull: true })
  description: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_reconciled: boolean;

  @Column({ type: DataType.DATEONLY, allowNull: true })
  reconciled_date: string;

  @CreatedAt
  created_at: Date;
}
