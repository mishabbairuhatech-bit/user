import { Controller, Get, Delete, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/interfaces/jwt-payload.interface';

@ApiTags('Sessions')
@ApiBearerAuth('access-token')
@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  @ApiOperation({ summary: 'List all active sessions for current user' })
  @ApiResponse({ status: 200, description: 'List of active sessions.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getActiveSessions(@CurrentUser() user: RequestUser) {
    return await this.sessionsService.getActiveSessions(user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Terminate a specific session' })
  @ApiParam({ name: 'id', description: 'Session ID to terminate' })
  @ApiResponse({ status: 200, description: 'Session terminated successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Session not found.' })
  async terminateSession(@CurrentUser() user: RequestUser, @Param('id') sessionId: string) {
    await this.sessionsService.terminateSession(sessionId, user.id);
    return { message: 'Session terminated successfully.' };
  }
}
