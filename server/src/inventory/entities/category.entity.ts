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

@Table({ tableName: 'categories', timestamps: true, underscored: true })
export class Category extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  name: string;

  @ForeignKey(() => Category)
  @Column({ type: DataType.UUID, allowNull: true })
  parent_id: string;

  @BelongsTo(() => Category, 'parent_id')
  parent: Category;

  @HasMany(() => Category, 'parent_id')
  children: Category[];

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string;

  @Column({ type: DataType.STRING(500), allowNull: true })
  image_url: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  is_active: boolean;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;
}
