import { Controller, Get, Patch, Body, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/interfaces/jwt-payload.interface';
import { PaginationQueryDto } from '../common/dto';
import { ERROR_MESSAGES } from '../common/constants/error-messages';

@ApiTags('Users')
// @ApiBearerAuth('access-token')
@Controller('users')
// @UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @ApiOperation({ summary: 'List all users with pagination and search' })
  @ApiResponse({ status: 200, description: 'Paginated list of users.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async findAll(@Query() query: PaginationQueryDto) {
    return await this.usersService.findAll(query);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getMe(@CurrentUser() user: RequestUser) {
    const found = await this.usersService.findById(user.id);
    if (!found) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    return found;
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async updateMe(@CurrentUser() user: RequestUser, @Body() dto: UpdateUserDto) {
    return await this.usersService.updateProfile(user.id, dto);
  }
}
