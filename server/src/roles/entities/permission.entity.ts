import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  UpdatedAt,
  BelongsToMany,
} from 'sequelize-typescript';
import { Role } from './role.entity';
import { RolePermission } from './role-permission.entity';

@Table({ tableName: 'permissions', timestamps: true, underscored: true })
export class Permission extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  module: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  action: string;

  @Column({ type: DataType.STRING(200), allowNull: false, unique: true })
  slug: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string;

  @BelongsToMany(() => Role, () => RolePermission)
  roles: Role[];

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;
}
