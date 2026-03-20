import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { FaceAuthService } from './face-auth.service';
import { RegisterFaceDto } from './dto/register-face.dto';
import { AuthenticateFaceDto } from './dto/authenticate-face.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/interfaces/jwt-payload.interface';
import { setAuthCookies } from '../common/utils/cookie.util';

@ApiTags('Face Auth')
@Controller('face-auth')
export class FaceAuthController {
  constructor(private readonly faceAuthService: FaceAuthService) {}

  // ── Registration (requires auth) ──

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Register face data for Face ID login' })
  @ApiResponse({ status: 200, description: 'Face registered successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid face descriptor.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async registerFace(
    @CurrentUser() user: RequestUser,
    @Body() dto: RegisterFaceDto,
  ) {
    return await this.faceAuthService.registerFace(user.id, dto);
  }

  // ── Authentication (public) ──

  @Public()
  @Post('authenticate')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Authenticate using Face ID' })
  @ApiResponse({ status: 200, description: 'Face authentication successful.' })
  @ApiResponse({ status: 400, description: 'No face data registered or invalid descriptor.' })
  @ApiResponse({ status: 401, description: 'Face does not match.' })
  @ApiResponse({ status: 429, description: 'Too many requests.' })
  async authenticate(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: AuthenticateFaceDto,
  ) {
    const ip = req.ip || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    const result = await this.faceAuthService.authenticate(dto, ip, userAgent);

    setAuthCookies(res, result.access_token, result.refresh_token);
    const { access_token, refresh_token, ...data } = result;
    return data;
  }

  // ── Management (requires auth) ──

  @Get('list')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List all registered face data for current user' })
  @ApiResponse({ status: 200, description: 'List of registered face data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async listFaces(@CurrentUser() user: RequestUser) {
    return await this.faceAuthService.listFaces(user.id);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Check if Face ID is registered for current user' })
  @ApiResponse({ status: 200, description: 'Face ID registration status.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getStatus(@CurrentUser() user: RequestUser) {
    return await this.faceAuthService.getStatus(user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete registered face data' })
  @ApiParam({ name: 'id', description: 'Face data ID to delete' })
  @ApiResponse({ status: 200, description: 'Face data deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Face data not found.' })
  async deleteFace(
    @CurrentUser() user: RequestUser,
    @Param('id') faceId: string,
  ) {
    return await this.faceAuthService.deleteFace(faceId, user.id);
  }
}
