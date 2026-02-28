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

@Table({ tableName: 'login_sessions', timestamps: true, underscored: true, updatedAt: false })
export class LoginSession extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  user_id: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  refresh_token_hash: string;

  @Column({ type: DataType.STRING(255), allowNull: true })
  device_name: string;

  @Default('web')
  @Column({ type: DataType.STRING(50), allowNull: false })
  device_type: string;

  @Column({ type: DataType.STRING(45), allowNull: true })
  ip_address: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  user_agent: string;

  @Column({ type: DataType.STRING(50), allowNull: true })
  os: string;

  @Column({ type: DataType.STRING(50), allowNull: true })
  browser: string;

  @Column({ type: DataType.STRING(100), allowNull: true })
  city: string;

  @Column({ type: DataType.STRING(100), allowNull: true })
  region: string;

  @Column({ type: DataType.STRING(100), allowNull: true })
  country: string;

  @Column({ type: DataType.STRING(10), allowNull: true })
  country_code: string;

  @Column({ type: DataType.FLOAT, allowNull: true })
  latitude: number;

  @Column({ type: DataType.FLOAT, allowNull: true })
  longitude: number;

  @Column({ type: DataType.STRING(50), allowNull: true })
  timezone: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  is_active: boolean;

  @Column({ type: DataType.DATE, allowNull: true })
  login_at: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  last_activity_at: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  expires_at: Date;

  @CreatedAt
  created_at: Date;

  @BelongsTo(() => User)
  user: User;
}
