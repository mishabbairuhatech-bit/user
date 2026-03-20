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

@Table({ tableName: 'face_data', timestamps: true, underscored: true, updatedAt: false })
export class FaceData extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  user_id: string;

  @Column({ type: DataType.JSONB, allowNull: false })
  descriptor: number[];

  @Column({ type: DataType.STRING(100), allowNull: true })
  label: string;

  @CreatedAt
  created_at: Date;

  @BelongsTo(() => User)
  user: User;
}
