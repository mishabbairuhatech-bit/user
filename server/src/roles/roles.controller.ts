import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@ApiTags('Roles')
@ApiBearerAuth('access-token')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) { }

  // ─── Permissions (placed before :id routes to avoid conflict) ──

  @Get('permissions/all')
  @RequirePermissions('roles:read')
  @ApiOperation({ summary: 'List all permissions (flat)' })
  @ApiResponse({ status: 200, description: 'List of all permissions.' })
  findAllPermissions() {
    return this.rolesService.findAllPermissions();
  }

  @Get('permissions/grouped')
  @RequirePermissions('roles:read')
  @ApiOperation({ summary: 'List permissions grouped by module' })
  @ApiResponse({ status: 200, description: 'Permissions grouped by module.' })
  getPermissionsGrouped() {
    return this.rolesService.getPermissionsGroupedByModule();
  }

  // ─── Roles CRUD ───────────────────────────────────────────

  @Post()
  @RequirePermissions('roles:create')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully.' })
  @ApiResponse({ status: 400, description: 'Slug already exists or invalid permission IDs.' })
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.createRole(dto);
  }

  @Get()
  @RequirePermissions('roles:read')
  @ApiOperation({ summary: 'List all roles with their permissions' })
  @ApiResponse({ status: 200, description: 'List of all roles.' })
  findAll() {
    return this.rolesService.findAllRoles();
  }

  @Get(':id')
  @RequirePermissions('roles:read')
  @ApiOperation({ summary: 'Get a single role by ID' })
  @ApiParam({ name: 'id', description: 'Role UUID' })
  @ApiResponse({ status: 200, description: 'Role details returned.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.findRoleById(id);
  }

  @Patch(':id')
  @RequirePermissions('roles:update')
  @ApiOperation({ summary: 'Update a role' })
  @ApiParam({ name: 'id', description: 'Role UUID' })
  @ApiResponse({ status: 200, description: 'Role updated successfully.' })
  @ApiResponse({ status: 400, description: 'Cannot modify system role slug.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.updateRole(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('roles:delete')
  @ApiOperation({ summary: 'Delete a non-system role' })
  @ApiParam({ name: 'id', description: 'Role UUID' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully.' })
  @ApiResponse({ status: 400, description: 'Cannot delete system role or role with assigned users.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.deleteRole(id);
  }
}
