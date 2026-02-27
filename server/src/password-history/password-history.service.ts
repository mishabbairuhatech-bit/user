import { Injectable, Inject, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { REPOSITORY } from '../common/constants/app.constants';
import { AppConfigService } from '../config/config.service';
import { PasswordHistory } from './entities/password-history.entity';

@Injectable()
export class PasswordHistoryService {
  constructor(
    @Inject(REPOSITORY.PASSWORD_HISTORIES)
    private readonly passwordHistoryRepository: typeof PasswordHistory,
    private readonly configService: AppConfigService,
  ) {}

  async addEntry(userId: string, passwordHash: string): Promise<void> {
    try {
      await this.passwordHistoryRepository.create({
        user_id: userId,
        password_hash: passwordHash,
      });

      await this.pruneOldEntries(userId);
    } catch (error) {
      console.error('PasswordHistoryService.addEntry error:', error);
      throw new InternalServerErrorException('Failed to add password history entry.');
    }
  }

  async isPasswordReused(userId: string, plainPassword: string): Promise<boolean> {
    try {
      const historyCount = this.configService.passwordHistoryCount;

      const entries = await this.passwordHistoryRepository.findAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
        limit: historyCount,
      });

      for (const entry of entries) {
        const isMatch = await bcrypt.compare(plainPassword, entry.password_hash);
        if (isMatch) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('PasswordHistoryService.isPasswordReused error:', error);
      throw new InternalServerErrorException('Failed to check password history.');
    }
  }

  private async pruneOldEntries(userId: string): Promise<void> {
    try {
      const historyCount = this.configService.passwordHistoryCount;

      const entries = await this.passwordHistoryRepository.findAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
        attributes: ['id'],
      });

      if (entries.length > historyCount) {
        const idsToDelete = entries.slice(historyCount).map((e) => e.id);
        await this.passwordHistoryRepository.destroy({
          where: { id: idsToDelete },
        });
      }
    } catch (error) {
      console.error('PasswordHistoryService.pruneOldEntries error:', error);
      throw new InternalServerErrorException('Failed to prune old password entries.');
    }
  }
}
