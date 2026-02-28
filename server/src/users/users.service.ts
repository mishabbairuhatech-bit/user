import { Injectable, Inject, NotFoundException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { Op, WhereOptions, literal } from 'sequelize';
import * as bcrypt from 'bcrypt';
import { REPOSITORY } from '../common/constants/app.constants';
import { ERROR_MESSAGES } from '../common/constants/error-messages';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto, PaginatedResponseDto } from '../common/dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(REPOSITORY.USERS)
    private readonly userRepository: typeof User,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    try {
      const existing = await this.userRepository.findOne({
        where: { email: dto.email.toLowerCase(), is_deleted: false },
      });
      if (existing) {
        throw new ConflictException('A user with this email already exists.');
      }

      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
      const passwordHash = await bcrypt.hash(dto.password, saltRounds);

      const user = await this.userRepository.create({
        email: dto.email.toLowerCase(),
        password_hash: passwordHash,
        first_name: dto.first_name,
        last_name: dto.last_name,
        phone: dto.phone || null,
        timezone: dto.timezone || 'UTC',
        language: dto.language || 'en',
      } as any);

      return this.findByIdOrFail(user.id);
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      console.error('UsersService.create error:', error);
      throw new InternalServerErrorException('Failed to create user.');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: { email: email.toLowerCase(), is_deleted: false },
      });
    } catch (error) {
      console.error('UsersService.findByEmail error:', error);
      throw new InternalServerErrorException('Failed to find user by email.');
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: { id, is_deleted: false },
        attributes: { exclude: ['password_hash', 'totp_secret', 'mfa_code', 'recovery_codes', 'password_reset_token', 'password_reset_expires'] },
      });
    } catch (error) {
      console.error('UsersService.findById error:', error);
      throw new InternalServerErrorException('Failed to find user by ID.');
    }
  }

  async findByIdOrFail(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { id, is_deleted: false },
        attributes: {
          exclude: [
            'password_hash',
            'totp_secret',
            'mfa_code',
            'mfa_code_expires',
            'recovery_codes',
            'password_reset_token',
            'password_reset_expires',
            'failed_login_attempts',
            'locked_until',
            'is_deleted',
            'google_id',
          ],
        },
      });
      if (!user) {
        throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('UsersService.findByIdOrFail error:', error);
      throw new InternalServerErrorException('Failed to find user.');
    }
  }

  async findByIdWithPassword(id: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: { id, is_deleted: false },
      });
    } catch (error) {
      console.error('UsersService.findByIdWithPassword error:', error);
      throw new InternalServerErrorException('Failed to find user.');
    }
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: { google_id: googleId, is_deleted: false },
      });
    } catch (error) {
      console.error('UsersService.findByGoogleId error:', error);
      throw new InternalServerErrorException('Failed to find user by Google ID.');
    }
  }

  async incrementFailedAttempts(userId: string): Promise<void> {
    try {
      await this.userRepository.increment('failed_login_attempts', {
        where: { id: userId },
      });
    } catch (error) {
      console.error('UsersService.incrementFailedAttempts error:', error);
      throw new InternalServerErrorException('Failed to increment failed attempts.');
    }
  }

  async resetFailedAttempts(userId: string): Promise<void> {
    try {
      await this.userRepository.update(
        { failed_login_attempts: 0, locked_until: null },
        { where: { id: userId } },
      );
    } catch (error) {
      console.error('UsersService.resetFailedAttempts error:', error);
      throw new InternalServerErrorException('Failed to reset failed attempts.');
    }
  }

  async lockAccount(userId: string, durationMinutes: number): Promise<void> {
    try {
      const lockedUntil = new Date();
      lockedUntil.setMinutes(lockedUntil.getMinutes() + durationMinutes);

      await this.userRepository.update(
        { locked_until: lockedUntil },
        { where: { id: userId } },
      );
    } catch (error) {
      console.error('UsersService.lockAccount error:', error);
      throw new InternalServerErrorException('Failed to lock account.');
    }
  }

  async updateLastLogin(userId: string): Promise<void> {
    try {
      await this.userRepository.update(
        { last_login_at: new Date() },
        { where: { id: userId } },
      );
    } catch (error) {
      console.error('UsersService.updateLastLogin error:', error);
      throw new InternalServerErrorException('Failed to update last login.');
    }
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    try {
      await this.userRepository.update(
        {
          password_hash: passwordHash,
          password_changed_at: new Date(),
          password_reset_token: null,
          password_reset_expires: null,
        },
        { where: { id: userId } },
      );
    } catch (error) {
      console.error('UsersService.updatePassword error:', error);
      throw new InternalServerErrorException('Failed to update password.');
    }
  }

  async setPasswordResetToken(userId: string, hashedToken: string, expires: Date): Promise<void> {
    try {
      await this.userRepository.update(
        {
          password_reset_token: hashedToken,
          password_reset_expires: expires,
        },
        { where: { id: userId } },
      );
    } catch (error) {
      console.error('UsersService.setPasswordResetToken error:', error);
      throw new InternalServerErrorException('Failed to set password reset token.');
    }
  }

  async updateProfile(userId: string, dto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.findById(userId);
      if (!user) {
        throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      await this.userRepository.update(dto as any, { where: { id: userId } });
      return this.findById(userId) as Promise<User>;
    } catch (error) {
      console.error('UsersService.updateProfile error:', error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update profile.');
    }
  }

  async updateMfaSettings(
    userId: string,
    data: Partial<Pick<User, 'mfa_enabled' | 'email_mfa_enabled' | 'totp_mfa_enabled' | 'mfa_method' | 'mfa_code' | 'mfa_code_expires' | 'totp_secret' | 'recovery_codes'>>,
  ): Promise<void> {
    try {
      await this.userRepository.update(data as any, { where: { id: userId } });
    } catch (error) {
      console.error('UsersService.updateMfaSettings error:', error);
      throw new InternalServerErrorException('Failed to update MFA settings.');
    }
  }

  async linkGoogleAccount(userId: string, googleId: string): Promise<void> {
    try {
      await this.userRepository.update(
        { google_id: googleId, auth_provider: 'google' },
        { where: { id: userId } },
      );
    } catch (error) {
      console.error('UsersService.linkGoogleAccount error:', error);
      throw new InternalServerErrorException('Failed to link Google account.');
    }
  }

  async findAllWithResetToken(): Promise<User[]> {
    try {
      return await this.userRepository.findAll({
        where: {
          password_reset_token: { [Op.ne]: null },
          is_deleted: false,
        },
      });
    } catch (error) {
      console.error('UsersService.findAllWithResetToken error:', error);
      throw new InternalServerErrorException('Failed to find users with reset tokens.');
    }
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResponseDto<User>> {
    try {
      const where: WhereOptions = { is_deleted: false };

      if (query.search) {
        const search = `%${query.search}%`;
        (where as any)[Op.or] = [
          { first_name: { [Op.iLike]: search } },
          { last_name: { [Op.iLike]: search } },
          { email: { [Op.iLike]: search } },
        ];
      }

      const { rows, count } = await this.userRepository.findAndCountAll({
        where,
        attributes: [
          'id', 'email', 'first_name', 'last_name',
          [literal("first_name || ' ' || last_name"), 'name'],
          'phone', 'avatar_url', 'is_active', 'created_at',
        ],
        order: [[query.sort_by, query.sort_order]],
        limit: query.limit,
        offset: query.offset,
      });

      const totalPages = Math.ceil(count / query.limit);

      return {
        items: rows,
        meta: {
          total: count,
          page: query.page,
          limit: query.limit,
          total_pages: totalPages,
          has_next: query.page < totalPages,
          has_prev: query.page > 1,
        },
      };
    } catch (error) {
      console.error('UsersService.findAll error:', error);
      throw new InternalServerErrorException('Failed to fetch users.');
    }
  }
}
