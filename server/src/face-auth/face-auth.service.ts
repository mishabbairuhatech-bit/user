import {
  Injectable,
  Inject,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { REPOSITORY } from '../common/constants/app.constants';
import { ERROR_MESSAGES } from '../common/constants/error-messages';
import { AppConfigService } from '../config/config.service';
import { UsersService } from '../users/users.service';
import { SessionsService } from '../sessions/sessions.service';
import { FaceData } from './entities/face-data.entity';
import { RegisterFaceDto } from './dto/register-face.dto';
import { AuthenticateFaceDto } from './dto/authenticate-face.dto';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@Injectable()
export class FaceAuthService {
  private readonly logger = new Logger(FaceAuthService.name);
  private readonly MATCH_THRESHOLD = 0.6;

  constructor(
    @Inject(REPOSITORY.FACE_DATA)
    private readonly faceDataRepository: typeof FaceData,
    private readonly configService: AppConfigService,
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
    private readonly jwtService: JwtService,
  ) {}

  async registerFace(userId: string, dto: RegisterFaceDto) {
    try {
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      if (!this.isValidDescriptor(dto.descriptor)) {
        throw new BadRequestException(ERROR_MESSAGES.FACE_INVALID_DESCRIPTOR);
      }

      await this.faceDataRepository.create({
        user_id: userId,
        descriptor: dto.descriptor,
        label: dto.label || 'Face ID',
      });

      return { message: 'Face registered successfully.' };
    } catch (error) {
      this.logger.error('registerFace error:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to register face.');
    }
  }

  async authenticate(
    dto: AuthenticateFaceDto,
    ip: string,
    userAgent: string,
  ) {
    try {
      const user = await this.usersService.findByEmail(dto.email);
      if (!user) {
        throw new UnauthorizedException(ERROR_MESSAGES.INVALID_EMAIL);
      }

      if (!user.is_active) {
        throw new UnauthorizedException(ERROR_MESSAGES.ACCOUNT_DEACTIVATED);
      }

      if (user.is_deleted) {
        throw new UnauthorizedException(ERROR_MESSAGES.ACCOUNT_NOT_FOUND);
      }

      if (!this.isValidDescriptor(dto.descriptor)) {
        throw new BadRequestException(ERROR_MESSAGES.FACE_INVALID_DESCRIPTOR);
      }

      // Get all stored face descriptors for the user
      const storedFaces = await this.faceDataRepository.findAll({
        where: { user_id: user.id },
      });

      if (storedFaces.length === 0) {
        throw new BadRequestException(ERROR_MESSAGES.FACE_NOT_REGISTERED);
      }

      // Compare with each stored descriptor
      let matched = false;
      let bestDistance = Infinity;

      for (const face of storedFaces) {
        const distance = this.euclideanDistance(dto.descriptor, face.descriptor);
        if (distance < bestDistance) {
          bestDistance = distance;
        }
        if (distance < this.MATCH_THRESHOLD) {
          matched = true;
          break;
        }
      }

      if (!matched) {
        this.logger.warn(
          `Face auth failed for user ${user.id}. Best distance: ${bestDistance.toFixed(4)}`,
        );
        throw new UnauthorizedException(ERROR_MESSAGES.FACE_NO_MATCH);
      }

      this.logger.log(
        `Face auth succeeded for user ${user.id}. Distance: ${bestDistance.toFixed(4)}`,
      );

      // Complete login
      const fullUser = await this.usersService.findByIdWithPassword(user.id);
      if (!fullUser) {
        throw new UnauthorizedException(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      const { session, refreshToken } = await this.sessionsService.createSession({
        userId: user.id,
        ip,
        userAgent,
        deviceName: dto.device_name || 'Face ID',
        deviceType: dto.device_type || 'web',
        latitude: dto.latitude,
        longitude: dto.longitude,
      });

      await this.usersService.updateLastLogin(user.id);

      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        session_id: session.id,
      };

      const accessToken = this.jwtService.sign(payload);
      const refreshJwt = this.jwtService.sign(
        { sub: user.id, session_id: session.id, refresh_token: refreshToken },
        {
          secret: this.configService.jwtRefreshSecret,
          expiresIn: this.configService.jwtRefreshExpiresIn,
        },
      );

      const userData = fullUser.toJSON();
      const {
        password_hash,
        password_reset_token,
        password_reset_expires,
        totp_secret,
        mfa_code,
        mfa_code_expires,
        recovery_codes,
        ...safeUser
      } = userData;

      return {
        access_token: accessToken,
        refresh_token: refreshJwt,
        user: safeUser,
      };
    } catch (error) {
      this.logger.error('authenticate error:', error);
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new InternalServerErrorException('Failed to authenticate with face.');
    }
  }

  async listFaces(userId: string) {
    try {
      return await this.faceDataRepository.findAll({
        where: { user_id: userId },
        attributes: ['id', 'label', 'created_at'],
        order: [['created_at', 'DESC']],
      });
    } catch (error) {
      this.logger.error('listFaces error:', error);
      throw new InternalServerErrorException('Failed to list face data.');
    }
  }

  async deleteFace(faceId: string, userId: string) {
    try {
      const face = await this.faceDataRepository.findOne({
        where: { id: faceId, user_id: userId },
      });

      if (!face) {
        throw new NotFoundException(ERROR_MESSAGES.FACE_NOT_FOUND);
      }

      await face.destroy();
      return { message: 'Face data removed successfully.' };
    } catch (error) {
      this.logger.error('deleteFace error:', error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete face data.');
    }
  }

  async getStatus(userId: string) {
    try {
      const count = await this.faceDataRepository.count({
        where: { user_id: userId },
      });
      return { registered: count > 0, count };
    } catch (error) {
      this.logger.error('getStatus error:', error);
      throw new InternalServerErrorException('Failed to get face auth status.');
    }
  }

  // ── Private helpers ──

  private euclideanDistance(a: number[], b: number[]): number {
    if (a.length !== b.length) return Infinity;
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      const diff = a[i] - b[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }

  private isValidDescriptor(descriptor: number[]): boolean {
    if (!Array.isArray(descriptor)) return false;
    if (descriptor.length !== 128) return false;
    return descriptor.every((v) => typeof v === 'number' && isFinite(v));
  }
}
