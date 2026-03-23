import {
  Table, Column, Model, DataType, PrimaryKey, Default,
  CreatedAt, UpdatedAt, ForeignKey, BelongsTo,
} from 'sequelize-typescript';
import { PosTerminal } from './pos-terminal.entity';
import { User } from '../../users/entities/user.entity';

@Table({ tableName: 'pos_sessions', timestamps: true, underscored: true })
export class PosSession extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => PosTerminal)
  @Column({ type: DataType.UUID, allowNull: false })
  terminal_id: string;

  @BelongsTo(() => PosTerminal)
  terminal: PosTerminal;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  user_id: string;

  @BelongsTo(() => User)
  user: User;

  @Default(0)
  @Column({ type: DataType.DECIMAL(15, 2), allowNull: false })
  opening_cash: number;

  @Column({ type: DataType.DECIMAL(15, 2), allowNull: true })
  closing_cash: number;

  @Column({ type: DataType.DECIMAL(15, 2), allowNull: true })
  expected_cash: number;

  @Column({ type: DataType.DECIMAL(15, 2), allowNull: true })
  cash_difference: number;

  @Default('open')
  @Column({ type: DataType.ENUM('open', 'closed'), allowNull: false })
  status: string;

  @Column({ type: DataType.DATE, allowNull: true })
  opened_at: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  closed_at: Date;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;
}
