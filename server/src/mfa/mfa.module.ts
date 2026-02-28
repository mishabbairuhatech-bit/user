import { Module } from '@nestjs/common';
import { MfaService } from './mfa.service';
import { MfaController } from './mfa.controller';
import { UsersModule } from '../users/users.module';
import { EmailService } from '../common/services/email.service';

@Module({
  imports: [UsersModule],
  controllers: [MfaController],
  providers: [MfaService, EmailService],
  exports: [MfaService],
})
export class MfaModule {}
