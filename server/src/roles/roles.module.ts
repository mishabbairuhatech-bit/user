import { Global, Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { rolesProviders } from './roles.provider';

@Global()
@Module({
  controllers: [RolesController],
  providers: [RolesService, ...rolesProviders],
  exports: [RolesService],
})
export class RolesModule {}
