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

@Table({ tableName: 'account_groups', timestamps: true, underscored: true })
export class AccountGroup extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  name: string;

  @ForeignKey(() => AccountGroup)
  @Column({ type: DataType.UUID, allowNull: true })
  parent_id: string;

  @BelongsTo(() => AccountGroup, 'parent_id')
  parent: AccountGroup;

  @HasMany(() => AccountGroup, 'parent_id')
  children: AccountGroup[];

  @Column({
    type: DataType.ENUM('assets', 'liabilities', 'income', 'expense', 'equity'),
    allowNull: false,
  })
  nature: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_system: boolean;

  @Default(0)
  @Column(DataType.INTEGER)
  sequence: number;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;
}
