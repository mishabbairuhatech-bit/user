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
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
} from '@simplewebauthn/server/script/deps';
import { REPOSITORY } from '../common/constants/app.constants';
import { ERROR_MESSAGES } from '../common/constants/error-messages';
import { AppConfigService } from '../config/config.service';
import { UsersService } from '../users/users.service';
import { SessionsService } from '../sessions/sessions.service';
import { Passkey } from './entities/passkey.entity';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';

interface StoredChallenge {
  challenge: string;
  userId: string;
  expiresAt: number;
}

@Injectable()
export class PasskeyService {
  private readonly logger = new Logger(PasskeyService.name);
  private readonly challenges = new Map<string, StoredChallenge>();

  constructor(
    @Inject(REPOSITORY.PASSKEYS)
    private readonly passkeyRepository: typeof Passkey,
    private readonly configService: AppConfigService,
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
    private readonly jwtService: JwtService,
  ) {
    // Clean expired challenges every 5 minutes
    setInterval(() => this.cleanExpiredChallenges(), 5 * 60 * 1000);
  }

  async generateRegistrationOpts(userId: string) {
    try {
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      const existingPasskeys = await this.passkeyRepository.findAll({
        where: { user_id: userId },
      });

      const options = await generateRegistrationOptions({
        rpName: this.configService.webauthnRpName,
        rpID: this.configService.webauthnRpId,
        userID: new TextEncoder().encode(userId),
        userName: user.email,
        userDisplayName: `${user.first_name} ${user.last_name}`,
        attestationType: 'none',
        excludeCredentials: existingPasskeys.map((pk) => ({
          id: pk.credential_id,
          transports: pk.transports as AuthenticatorTransportFuture[],
        })),
        authenticatorSelection: {
          residentKey: 'preferred',
          userVerification: 'required',
        },
      });

      // Store challenge
      const challengeId = this.storeChallengeForUser(options.challenge, userId);

      return { options, challenge_id: challengeId };
    } catch (error) {
      console.error('PasskeyService.generateRegistrationOpts error:', error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to generate registration options.');
    }
  }

  async verifyRegistration(userId: string, body: any, deviceName?: string) {
    try {
      const challenge = this.findChallengeForUser(userId);
      if (!challenge) {
        throw new BadRequestException(ERROR_MESSAGES.PASSKEY_CHALLENGE_EXPIRED);
      }

      const verification = await verifyRegistrationResponse({
        response: body as RegistrationResponseJSON,
        expectedChallenge: challenge.challenge,
        expectedOrigin: this.configService.webauthnOrigin,
        expectedRPID: this.configService.webauthnRpId,
        requireUserVerification: true,
      });

      if (!verification.verified || !verification.registrationInfo) {
        throw new BadRequestException(ERROR_MESSAGES.PASSKEY_VERIFY_FAILED);
      }

      const regInfo = verification.registrationInfo;

      await this.passkeyRepository.create({
        user_id: userId,
        credential_id: regInfo.credentialID,
        public_key: Buffer.from(regInfo.credentialPublicKey).toString('base64url'),
        counter: regInfo.counter,
        device_name: deviceName || 'Passkey',
        transports: body.response?.transports || [],
        backed_up: regInfo.credentialBackedUp,
      });

      this.removeChallengeForUser(userId);

      return { message: 'Passkey registered successfully.' };
    } catch (error) {
      console.error('PasskeyService.verifyRegistration error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(ERROR_MESSAGES.PASSKEY_VERIFY_FAILED);
    }
  }

  async generateAuthenticationOpts(email: string) {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new NotFoundException(ERROR_MESSAGES.PASSKEY_NOT_FOUND);
      }

      const passkeys = await this.passkeyRepository.findAll({
        where: { user_id: user.id },
      });

      if (passkeys.length === 0) {
        throw new NotFoundException(ERROR_MESSAGES.PASSKEY_NOT_FOUND);
      }

      const options = await generateAuthenticationOptions({
        rpID: this.configService.webauthnRpId,
        allowCredentials: passkeys.map((pk) => ({
          id: pk.credential_id,
          transports: pk.transports as AuthenticatorTransportFuture[],
        })),
        userVerification: 'required',
      });

      const challengeId = this.storeChallengeForUser(options.challenge, user.id);

      return { options, challenge_id: challengeId };
    } catch (error) {
      console.error('PasskeyService.generateAuthenticationOpts error:', error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to generate authentication options.');
    }
  }

  async verifyAuthentication(
    challengeId: string,
    body: any,
    ip: string,
    userAgent: string,
    deviceName?: string,
    deviceType?: string,
  ) {
    try {
      const stored = this.challenges.get(challengeId);
      if (!stored || stored.expiresAt < Date.now()) {
        this.challenges.delete(challengeId);
        throw new BadRequestException(ERROR_MESSAGES.PASSKEY_CHALLENGE_EXPIRED);
      }

      const userId = stored.userId;

      // Find the credential
      const credentialId = body.id;
      const passkey = await this.passkeyRepository.findOne({
        where: { credential_id: credentialId, user_id: userId },
      });

      if (!passkey) {
        throw new UnauthorizedException(ERROR_MESSAGES.PASSKEY_VERIFY_FAILED);
      }

      const verification = await verifyAuthenticationResponse({
        response: body as AuthenticationResponseJSON,
        expectedChallenge: stored.challenge,
        expectedOrigin: this.configService.webauthnOrigin,
        expectedRPID: this.configService.webauthnRpId,
        authenticator: {
          credentialID: passkey.credential_id,
          credentialPublicKey: Buffer.from(passkey.public_key, 'base64url'),
          counter: Number(passkey.counter),
          transports: passkey.transports as AuthenticatorTransportFuture[],
        },
        requireUserVerification: true,
      });

      if (!verification.verified) {
        throw new UnauthorizedException(ERROR_MESSAGES.PASSKEY_VERIFY_FAILED);
      }

      // Check counter to detect cloning
      const { authenticationInfo } = verification;
      if (authenticationInfo.newCounter <= Number(passkey.counter) && Number(passkey.counter) > 0) {
        this.logger.warn(`Possible cloned passkey detected for user ${userId}`);
        throw new UnauthorizedException(ERROR_MESSAGES.PASSKEY_CLONE_DETECTED);
      }

      // Update counter and last used
      await passkey.update({
        counter: authenticationInfo.newCounter,
        last_used_at: new Date(),
      });

      this.challenges.delete(challengeId);

      // Complete login
      const user = await this.usersService.findByIdWithPassword(userId);
      if (!user || !user.is_active) {
        throw new UnauthorizedException(ERROR_MESSAGES.ACCOUNT_DEACTIVATED);
      }

      const { session, refreshToken } = await this.sessionsService.createSession({
        userId: user.id,
        ip,
        userAgent,
        deviceName: deviceName || 'Passkey',
        deviceType: deviceType || 'web',
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

      const userData = user.toJSON();
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
      console.error('PasskeyService.verifyAuthentication error:', error);
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) throw error;
      throw new UnauthorizedException(ERROR_MESSAGES.PASSKEY_VERIFY_FAILED);
    }
  }

  async listPasskeys(userId: string) {
    try {
      return await this.passkeyRepository.findAll({
        where: { user_id: userId },
        attributes: ['id', 'device_name', 'backed_up', 'last_used_at', 'created_at'],
        order: [['created_at', 'DESC']],
      });
    } catch (error) {
      console.error('PasskeyService.listPasskeys error:', error);
      throw new InternalServerErrorException('Failed to list passkeys.');
    }
  }

  async deletePasskey(passkeyId: string, userId: string) {
    try {
      const passkey = await this.passkeyRepository.findOne({
        where: { id: passkeyId, user_id: userId },
      });

      if (!passkey) {
        throw new NotFoundException(ERROR_MESSAGES.PASSKEY_NOT_FOUND);
      }

      await passkey.destroy();
      return { message: 'Passkey removed successfully.' };
    } catch (error) {
      console.error('PasskeyService.deletePasskey error:', error);
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete passkey.');
    }
  }

  // ── Challenge management ──

  private storeChallengeForUser(challenge: string, userId: string): string {
    try {
      const challengeId = `${userId}_${Date.now()}`;
      this.challenges.set(challengeId, {
        challenge,
        userId,
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      });
      return challengeId;
    } catch (error) {
      console.error('PasskeyService.storeChallengeForUser error:', error);
      throw new InternalServerErrorException('Failed to store challenge.');
    }
  }

  private findChallengeForUser(userId: string): StoredChallenge | undefined {
    try {
      for (const [_key, value] of this.challenges.entries()) {
        if (value.userId === userId && value.expiresAt > Date.now()) {
          return value;
        }
      }
      return undefined;
    } catch (error) {
      console.error('PasskeyService.findChallengeForUser error:', error);
      return undefined;
    }
  }

  private removeChallengeForUser(userId: string): void {
    try {
      for (const [key, value] of this.challenges.entries()) {
        if (value.userId === userId) {
          this.challenges.delete(key);
        }
      }
    } catch (error) {
      console.error('PasskeyService.removeChallengeForUser error:', error);
    }
  }

  private cleanExpiredChallenges(): void {
    try {
      const now = Date.now();
      for (const [key, value] of this.challenges.entries()) {
        if (value.expiresAt < now) {
          this.challenges.delete(key);
        }
      }
    } catch (error) {
      console.error('PasskeyService.cleanExpiredChallenges error:', error);
    }
  }
}
