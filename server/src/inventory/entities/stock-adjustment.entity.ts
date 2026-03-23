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
  HasMany,
} from 'sequelize-typescript';
import { JournalEntry } from '../../accounting/entities/journal-entry.entity';
import { User } from '../../users/entities/user.entity';
import { StockAdjustmentItem } from './stock-adjustment-item.entity';

@Table({ tableName: 'stock_adjustments', timestamps: true, underscored: true })
export class StockAdjustment extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column({ type: DataType.STRING(30), allowNull: false })
  adjustment_number: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  date: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  reason: string;

  @ForeignKey(() => JournalEntry)
  @Column({ type: DataType.UUID, allowNull: true })
  journal_entry_id: string;

  @BelongsTo(() => JournalEntry)
  journalEntry: JournalEntry;

  @HasMany(() => StockAdjustmentItem)
  items: StockAdjustmentItem[];

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
