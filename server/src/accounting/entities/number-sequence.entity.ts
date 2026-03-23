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

@Table({ tableName: 'number_sequences', timestamps: true, underscored: true })
export class NumberSequence extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column({
    type: DataType.ENUM(
      'sales_invoice',
      'purchase_bill',
      'credit_note',
      'debit_note',
      'payment',
      'receipt',
      'journal_entry',
      'quotation',
      'purchase_order',
      'stock_adjustment',
    ),
    allowNull: false,
  })
  document_type: string;

  @Column({ type: DataType.STRING(10), allowNull: false })
  prefix: string;

  @Column({ type: DataType.STRING(10), allowNull: false })
  financial_year: string;

  @Default(0)
  @Column({ type: DataType.INTEGER, allowNull: false })
  last_number: number;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;
}
