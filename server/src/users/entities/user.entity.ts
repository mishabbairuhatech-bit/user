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
  Unique,
} from 'sequelize-typescript';
import { LoginSession } from '../../sessions/entities/login-session.entity';
import { PasswordHistory } from '../../password-history/entities/password-history.entity';
import { Passkey } from '../../passkey/entities/passkey.entity';

@Table({ tableName: 'users', timestamps: true, underscored: true })
export class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Unique
  @Column({ type: DataType.STRING(255), allowNull: false })
  email: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  password_hash: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  first_name: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  last_name: string;

  @Column({ type: DataType.STRING(20), allowNull: true })
  phone: string;

  @Column({ type: DataType.STRING(500), allowNull: true })
  avatar_url: string;

  @Default('UTC')
  @Column({ type: DataType.STRING(50), allowNull: false })
  timezone: string;

  @Default('en')
  @Column({ type: DataType.STRING(10), allowNull: false })
  language: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  email_verified: boolean;

  @Default(true)
  @Column(DataType.BOOLEAN)
  is_active: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_deleted: boolean;

  @Column({ type: DataType.DATE, allowNull: true })
  last_login_at: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  password_changed_at: Date;

  @Default(0)
  @Column({ type: DataType.INTEGER, allowNull: false })
  failed_login_attempts: number;

  @Column({ type: DataType.DATE, allowNull: true })
  locked_until: Date;

  @Column({ type: DataType.STRING(255), allowNull: true })
  password_reset_token: string;

  @Column({ type: DataType.DATE, allowNull: true })
  password_reset_expires: Date;

  // MFA fields
  @Default(false)
  @Column(DataType.BOOLEAN)
  mfa_enabled: boolean;

  @Column({ type: DataType.STRING(10), allowNull: true })
  mfa_method: string;

  @Column({ type: DataType.STRING(6), allowNull: true })
  mfa_code: string;

  @Column({ type: DataType.DATE, allowNull: true })
  mfa_code_expires: Date;

  @Column({ type: DataType.STRING(255), allowNull: true })
  totp_secret: string;

  @Column({ type: DataType.JSONB, allowNull: true, defaultValue: null })
  recovery_codes: Array<{ code: string; used: boolean }> | null;

  // Google OAuth
  @Unique
  @Column({ type: DataType.STRING(255), allowNull: true })
  google_id: string;

  @Default('local')
  @Column({ type: DataType.STRING(20), allowNull: false })
  auth_provider: string;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  // Associations
  @HasMany(() => LoginSession)
  loginSessions: LoginSession[];

  @HasMany(() => PasswordHistory)
  passwordHistories: PasswordHistory[];

  @HasMany(() => Passkey)
  passkeys: Passkey[];

  get fullName(): string {
    return `${this.first_name} ${this.last_name}`;
  }
}
