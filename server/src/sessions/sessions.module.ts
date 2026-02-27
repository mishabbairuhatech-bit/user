import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { sessionsProviders } from './sessions.provider';

@Module({
  controllers: [SessionsController],
  providers: [SessionsService, ...sessionsProviders],
  exports: [SessionsService],
})
export class SessionsModule {}
