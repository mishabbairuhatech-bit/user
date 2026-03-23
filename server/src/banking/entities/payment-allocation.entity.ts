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
import { PaymentReceipt } from './payment-receipt.entity';

@Table({ tableName: 'payment_allocations', timestamps: true, underscored: true, updatedAt: false })
export class PaymentAllocation extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => PaymentReceipt)
  @Column({ type: DataType.UUID, allowNull: false })
  payment_receipt_id: string;

  @BelongsTo(() => PaymentReceipt)
  paymentReceipt: PaymentReceipt;

  @Column({
    type: DataType.ENUM('sales_invoice', 'purchase_bill', 'credit_note', 'debit_note'),
    allowNull: false,
  })
  document_type: string;

  @Column({ type: DataType.UUID, allowNull: false })
  document_id: string;

  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  amount: number;

  @CreatedAt
  created_at: Date;
}
