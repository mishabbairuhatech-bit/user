import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  UpdatedAt,
  HasMany,
  BelongsToMany,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { Permission } from './permission.entity';
import { RolePermission } from './role-permission.entity';

@Table({ tableName: 'roles', timestamps: true, underscored: true })
export class Role extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  name: string;

  @Column({ type: DataType.STRING(100), allowNull: false, unique: true })
  slug: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_system: boolean;

  @Default(true)
  @Column(DataType.BOOLEAN)
  is_active: boolean;

  @HasMany(() => User)
  users: User[];

  @BelongsToMany(() => Permission, () => RolePermission)
  permissions: Permission[];

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;
}
