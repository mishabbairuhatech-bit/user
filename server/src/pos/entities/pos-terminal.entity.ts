import {
  Table, Column, Model, DataType, PrimaryKey, Default,
  CreatedAt, UpdatedAt,
} from 'sequelize-typescript';

@Table({ tableName: 'pos_terminals', timestamps: true, underscored: true })
export class PosTerminal extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column({ type: DataType.STRING(50), allowNull: false })
  name: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  is_active: boolean;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;
}
