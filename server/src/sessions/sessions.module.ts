import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { sessionsProviders } from './sessions.provider';
import { GeolocationService } from '../common/services/geolocation.service';

@Module({
  controllers: [SessionsController],
  providers: [SessionsService, GeolocationService, ...sessionsProviders],
  exports: [SessionsService],
})
export class SessionsModule {}
