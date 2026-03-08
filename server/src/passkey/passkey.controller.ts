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
import { PasskeyService } from './passkey.service';
import { RegisterPasskeyVerifyDto } from './dto/register-passkey.dto';
import {
  AuthenticatePasskeyOptionsDto,
  AuthenticatePasskeyVerifyDto,
} from './dto/authenticate-passkey.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/interfaces/jwt-payload.interface';
import { setAuthCookies } from '../common/utils/cookie.util';

@ApiTags('Passkeys')
@Controller('passkey')
export class PasskeyController {
  constructor(private readonly passkeyService: PasskeyService) {}

  // ── Registration (requires auth) ──

  @Post('register/options')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get WebAuthn registration options' })
  @ApiResponse({ status: 200, description: 'Registration options for WebAuthn credential creation.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getRegistrationOptions(@CurrentUser() user: RequestUser) {
    return await this.passkeyService.generateRegistrationOpts(user.id);
  }

  @Post('register/verify')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Verify WebAuthn registration and store passkey' })
  @ApiResponse({ status: 200, description: 'Passkey registered successfully.' })
  @ApiResponse({ status: 400, description: 'Verification failed.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async verifyRegistration(
    @CurrentUser() user: RequestUser,
    @Body() dto: RegisterPasskeyVerifyDto,
  ) {
    return await this.passkeyService.verifyRegistration(user.id, dto.response, dto.device_name);
  }

  // ── Authentication (public) ──

  @Public()
  @Post('auth/options')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Get WebAuthn authentication options for a user' })
  @ApiResponse({ status: 200, description: 'Authentication challenge and allowed credentials.' })
  @ApiResponse({ status: 404, description: 'User not found or no passkeys registered.' })
  @ApiResponse({ status: 429, description: 'Too many requests.' })
  async getAuthenticationOptions(@Body() dto: AuthenticatePasskeyOptionsDto) {
    return await this.passkeyService.generateAuthenticationOpts(dto.email);
  }

  @Public()
  @Post('auth/verify')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Verify WebAuthn authentication and issue tokens' })
  @ApiResponse({ status: 200, description: 'Authentication successful. Returns access and refresh tokens.' })
  @ApiResponse({ status: 400, description: 'Verification failed.' })
  @ApiResponse({ status: 401, description: 'Authentication failed.' })
  @ApiResponse({ status: 429, description: 'Too many requests.' })
  async verifyAuthentication(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() dto: AuthenticatePasskeyVerifyDto,
  ) {
    const ip = req.ip || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    const result = await this.passkeyService.verifyAuthentication(
      dto.challenge_id,
      dto.response,
      ip,
      userAgent,
      dto.device_name,
      dto.device_type,
      dto.latitude,
      dto.longitude,
    );

    setAuthCookies(res, result.access_token, result.refresh_token);
    const { access_token, refresh_token, ...data } = result;
    return data;
  }

  // ── Management (requires auth) ──

  @Get('list')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List all registered passkeys for current user' })
  @ApiResponse({ status: 200, description: 'List of registered passkeys.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async listPasskeys(@CurrentUser() user: RequestUser) {
    return await this.passkeyService.listPasskeys(user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a registered passkey' })
  @ApiParam({ name: 'id', description: 'Passkey ID to delete' })
  @ApiResponse({ status: 200, description: 'Passkey deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Passkey not found.' })
  async deletePasskey(@CurrentUser() user: RequestUser, @Param('id') passkeyId: string) {
    return await this.passkeyService.deletePasskey(passkeyId, user.id);
  }
}
