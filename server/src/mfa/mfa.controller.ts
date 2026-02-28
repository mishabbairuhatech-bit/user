import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MfaService } from './mfa.service';
import { VerifyTotpSetupDto } from './dto/enable-totp.dto';
import { DisableMfaDto } from './dto/disable-mfa.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/interfaces/jwt-payload.interface';

@ApiTags('MFA')
@ApiBearerAuth('access-token')
@Controller('mfa')
@UseGuards(JwtAuthGuard)
export class MfaController {
  constructor(private readonly mfaService: MfaService) {}

  @Post('email/setup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Setup email-based MFA (sends verification code)' })
  @ApiResponse({ status: 200, description: 'Verification code sent to email.' })
  @ApiResponse({ status: 400, description: 'MFA already enabled.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async setupEmailMfa(@CurrentUser() user: RequestUser) {
    return await this.mfaService.setupEmailMfa(user.id);
  }

  @Post('email/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email code to activate email-based MFA' })
  @ApiResponse({ status: 200, description: 'Email MFA activated. Returns recovery codes.' })
  @ApiResponse({ status: 400, description: 'Invalid code or no pending setup.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async verifyEmailMfa(@CurrentUser() user: RequestUser, @Body() dto: VerifyTotpSetupDto) {
    return await this.mfaService.verifyAndActivateEmailMfa(user.id, dto.code);
  }

  @Post('totp/setup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate TOTP secret and QR code for setup' })
  @ApiResponse({ status: 200, description: 'Returns TOTP secret and QR code data URL.' })
  @ApiResponse({ status: 400, description: 'TOTP already enabled.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async setupTotp(@CurrentUser() user: RequestUser) {
    return await this.mfaService.setupTotp(user.id);
  }

  @Post('totp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify TOTP code to activate authenticator app MFA' })
  @ApiResponse({ status: 200, description: 'TOTP MFA activated. Returns recovery codes.' })
  @ApiResponse({ status: 400, description: 'Invalid TOTP code or no pending setup.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async verifyTotp(@CurrentUser() user: RequestUser, @Body() dto: VerifyTotpSetupDto) {
    return await this.mfaService.verifyAndActivateTotp(user.id, dto.code);
  }

  @Post('email/disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disable email MFA (requires password confirmation)' })
  @ApiResponse({ status: 200, description: 'Email MFA disabled successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid password or email MFA not enabled.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async disableEmailMfa(@CurrentUser() user: RequestUser, @Body() dto: DisableMfaDto) {
    return await this.mfaService.disableEmailMfa(user.id, dto.password);
  }

  @Post('totp/disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disable TOTP MFA (requires password confirmation)' })
  @ApiResponse({ status: 200, description: 'TOTP MFA disabled successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid password or TOTP MFA not enabled.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async disableTotpMfa(@CurrentUser() user: RequestUser, @Body() dto: DisableMfaDto) {
    return await this.mfaService.disableTotpMfa(user.id, dto.password);
  }

  @Post('disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disable all MFA methods (requires password confirmation)' })
  @ApiResponse({ status: 200, description: 'All MFA disabled successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid password or MFA not enabled.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async disableMfa(@CurrentUser() user: RequestUser, @Body() dto: DisableMfaDto) {
    return await this.mfaService.disableMfa(user.id, dto.password);
  }

  @Post('recovery-codes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Regenerate MFA recovery codes' })
  @ApiResponse({ status: 200, description: 'New recovery codes generated.' })
  @ApiResponse({ status: 400, description: 'MFA not enabled.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async regenerateRecoveryCodes(@CurrentUser() user: RequestUser) {
    return await this.mfaService.regenerateRecoveryCodes(user.id);
  }
}
