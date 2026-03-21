import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { REPOSITORY } from '../common/constants/app.constants';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { User } from '../users/entities/user.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  // In-memory permission cache with TTL
  private permissionCache = new Map<string, { permissions: string[]; expiresAt: number }>();
  private readonly CACHE_TTL = 60_000; // 1 minute

  constructor(
    @Inject(REPOSITORY.ROLES)
    private readonly roleRepository: typeof Role,
    @Inject(REPOSITORY.PERMISSIONS)
    private readonly permissionRepository: typeof Permission,
    @Inject(REPOSITORY.ROLE_PERMISSIONS)
    private readonly rolePermissionRepository: typeof RolePermission,
  ) {}

  // ─── Roles CRUD ───────────────────────────────────────────

  async createRole(dto: CreateRoleDto): Promise<Role> {
    try {
      const existing = await this.roleRepository.findOne({ where: { slug: dto.slug } });
      if (existing) {
        throw new BadRequestException('A role with this slug already exists');
      }

      const role = await this.roleRepository.create({
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
      });

      if (dto.permission_ids?.length) {
        await this.syncPermissions(role.id, dto.permission_ids);
      }

      this.clearPermissionCache();
      return this.findRoleById(role.id);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error('RolesService.createRole error:', error);
      throw new InternalServerErrorException('Failed to create role.');
    }
  }

  async findAllRoles(): Promise<Role[]> {
    try {
      return await this.roleRepository.findAll({
        include: [{ model: Permission, through: { attributes: [] } }],
        order: [['created_at', 'ASC']],
      });
    } catch (error) {
      this.logger.error('RolesService.findAllRoles error:', error);
      throw new InternalServerErrorException('Failed to fetch roles.');
    }
  }

  async findRoleById(id: string): Promise<Role> {
    try {
      const role = await this.roleRepository.findByPk(id, {
        include: [{ model: Permission, through: { attributes: [] } }],
      });
      if (!role) throw new NotFoundException('Role not found');
      return role;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('RolesService.findRoleById error:', error);
      throw new InternalServerErrorException('Failed to fetch role.');
    }
  }

  async updateRole(id: string, dto: UpdateRoleDto): Promise<Role> {
    try {
      const role = await this.findRoleById(id);

      if (role.is_system && dto.slug && dto.slug !== role.slug) {
        throw new BadRequestException('Cannot change the slug of a system role');
      }

      await role.update({
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.slug && !role.is_system && { slug: dto.slug }),
      });

      if (dto.permission_ids) {
        await this.syncPermissions(role.id, dto.permission_ids);
      }

      this.clearPermissionCache();
      return this.findRoleById(id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      this.logger.error('RolesService.updateRole error:', error);
      throw new InternalServerErrorException('Failed to update role.');
    }
  }

  async deleteRole(id: string): Promise<void> {
    try {
      const role = await this.findRoleById(id);
      if (role.is_system) {
        throw new BadRequestException('Cannot delete a system role');
      }

      // Check if any users are assigned to this role
      const usersCount = await User.count({ where: { role_id: id } });
      if (usersCount > 0) {
        throw new BadRequestException(
          `Cannot delete this role because ${usersCount} user(s) are currently assigned to it. Reassign them first.`,
        );
      }

      await this.rolePermissionRepository.destroy({ where: { role_id: id } });
      await role.destroy();
      this.clearPermissionCache();
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      this.logger.error('RolesService.deleteRole error:', error);
      throw new InternalServerErrorException('Failed to delete role.');
    }
  }

  // ─── Permissions ──────────────────────────────────────────

  async findAllPermissions(): Promise<Permission[]> {
    try {
      return await this.permissionRepository.findAll({
        order: [['module', 'ASC'], ['action', 'ASC']],
      });
    } catch (error) {
      this.logger.error('RolesService.findAllPermissions error:', error);
      throw new InternalServerErrorException('Failed to fetch permissions.');
    }
  }

  async getPermissionsGroupedByModule(): Promise<Record<string, Permission[]>> {
    const permissions = await this.findAllPermissions();
    return permissions.reduce((grouped, perm) => {
      if (!grouped[perm.module]) grouped[perm.module] = [];
      grouped[perm.module].push(perm);
      return grouped;
    }, {} as Record<string, Permission[]>);
  }

  // ─── Permission Sync (for a Role) ────────────────────────

  private async syncPermissions(roleId: string, permissionIds: string[]): Promise<void> {
    // Remove all existing
    await this.rolePermissionRepository.destroy({ where: { role_id: roleId } });

    if (permissionIds.length === 0) return;

    // Validate all permission IDs exist
    const permissions = await this.permissionRepository.findAll({
      where: { id: permissionIds },
    });

    if (permissions.length !== permissionIds.length) {
      throw new BadRequestException('One or more permission IDs are invalid');
    }

    // Bulk insert
    const records = permissionIds.map((pid) => ({
      role_id: roleId,
      permission_id: pid,
    }));
    await this.rolePermissionRepository.bulkCreate(records);
  }

  // ─── Permission Check (used by Guard) ────────────────────

  async getUserPermissions(userId: string): Promise<string[]> {
    // Check cache first
    const cached = this.permissionCache.get(userId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.permissions;
    }

    try {
      const user = await User.findByPk(userId, {
        include: [{
          model: Role,
          include: [{ model: Permission, through: { attributes: [] } }],
        }],
      });

      if (!user || !user.role) return [];

      // Super admin bypasses all checks
      if (user.role.slug === 'super_admin') {
        const permissions = ['*'];
        this.permissionCache.set(userId, { permissions, expiresAt: Date.now() + this.CACHE_TTL });
        return permissions;
      }

      if (!user.role.is_active) return [];

      const permissions = user.role.permissions.map((p) => p.slug);
      this.permissionCache.set(userId, { permissions, expiresAt: Date.now() + this.CACHE_TTL });
      return permissions;
    } catch (error) {
      this.logger.error('RolesService.getUserPermissions error:', error);
      return [];
    }
  }

  // Clear cache when roles/permissions are modified
  clearPermissionCache(): void {
    this.permissionCache.clear();
  }
}
