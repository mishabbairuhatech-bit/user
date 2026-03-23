import {
  Table, Column, Model, DataType, PrimaryKey, Default,
  CreatedAt, ForeignKey, BelongsTo,
} from 'sequelize-typescript';
import { DebitNote } from './debit-note.entity';
import { Product } from '../../inventory/entities/product.entity';

@Table({ tableName: 'debit_note_items', timestamps: true, underscored: true, updatedAt: false })
export class DebitNoteItem extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => DebitNote)
  @Column({ type: DataType.UUID, allowNull: false })
  debit_note_id: string;

  @BelongsTo(() => DebitNote)
  debitNote: DebitNote;

  @ForeignKey(() => Product)
  @Column({ type: DataType.UUID, allowNull: false })
  product_id: string;

  @BelongsTo(() => Product)
  product: Product;

  @Column({ type: DataType.DECIMAL(15, 3), allowNull: false })
  quantity: number;

  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  unit_price: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  taxable_amount: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  cgst_amount: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  sgst_amount: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  igst_amount: number;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  total: number;

  @CreatedAt
  created_at: Date;
}
