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
import { User } from '../../users/entities/user.entity';

@Table({ tableName: 'password_histories', timestamps: true, underscored: true, updatedAt: false })
export class PasswordHistory extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  user_id: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  password_hash: string;

  @CreatedAt
  created_at: Date;

  @BelongsTo(() => User)
  user: User;
}
