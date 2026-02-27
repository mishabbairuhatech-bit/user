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
  Unique,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';

@Table({ tableName: 'passkeys', timestamps: true, underscored: true, updatedAt: false })
export class Passkey extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  user_id: string;

  @Unique
  @Column({ type: DataType.TEXT, allowNull: false })
  credential_id: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  public_key: string;

  @Default(0)
  @Column({ type: DataType.BIGINT, allowNull: false })
  counter: number;

  @Column({ type: DataType.STRING(255), allowNull: true })
  device_name: string;

  @Column({ type: DataType.JSONB, allowNull: true })
  transports: string[];

  @Default(false)
  @Column(DataType.BOOLEAN)
  backed_up: boolean;

  @Column({ type: DataType.DATE, allowNull: true })
  last_used_at: Date;

  @CreatedAt
  created_at: Date;

  @BelongsTo(() => User)
  user: User;
}
