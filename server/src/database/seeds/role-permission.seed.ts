import { Logger } from '@nestjs/common';
import { Permission } from '../../roles/entities/permission.entity';
import { Role } from '../../roles/entities/role.entity';
import { RolePermission } from '../../roles/entities/role-permission.entity';

const logger = new Logger('RolePermissionSeed');

const PERMISSIONS_SEED = [
  // Users
  { module: 'users', action: 'create', slug: 'users:create', description: 'Create new users' },
  { module: 'users', action: 'read', slug: 'users:read', description: 'View user details' },
  { module: 'users', action: 'update', slug: 'users:update', description: 'Edit user profiles' },
  { module: 'users', action: 'delete', slug: 'users:delete', description: 'Delete users' },

  // Roles
  { module: 'roles', action: 'create', slug: 'roles:create', description: 'Create new roles' },
  { module: 'roles', action: 'read', slug: 'roles:read', description: 'View roles and permissions' },
  { module: 'roles', action: 'update', slug: 'roles:update', description: 'Edit roles and their permissions' },
  { module: 'roles', action: 'delete', slug: 'roles:delete', description: 'Delete roles' },
  { module: 'roles', action: 'assign', slug: 'roles:assign', description: 'Assign roles to users' },

  // POS
  { module: 'pos', action: 'access', slug: 'pos:access', description: 'Access the POS terminal' },
  { module: 'pos', action: 'manage', slug: 'pos:manage', description: 'Manage POS configuration' },
  { module: 'pos', action: 'refund', slug: 'pos:refund', description: 'Process refunds' },
  { module: 'pos', action: 'hold_bills', slug: 'pos:hold_bills', description: 'Hold and resume bills' },
  { module: 'pos', action: 'returns', slug: 'pos:returns', description: 'Process product returns' },

  // Reports
  { module: 'reports', action: 'view', slug: 'reports:view', description: 'View reports' },
  { module: 'reports', action: 'export', slug: 'reports:export', description: 'Export reports to file' },

  // Settings
  { module: 'settings', action: 'read', slug: 'settings:read', description: 'View system settings' },
  { module: 'settings', action: 'update', slug: 'settings:update', description: 'Modify system settings' },
  { module: 'settings', action: 'notifications', slug: 'settings:notifications', description: 'Manage notification preferences' },
  { module: 'settings', action: 'security', slug: 'settings:security', description: 'Manage security settings' },
  { module: 'settings', action: 'account', slug: 'settings:account', description: 'Manage account settings' },

  // Mail
  { module: 'mail', action: 'access', slug: 'mail:access', description: 'Access the mail portal' },
  { module: 'mail', action: 'send', slug: 'mail:send', description: 'Send emails' },
  { module: 'mail', action: 'manage', slug: 'mail:manage', description: 'Manage mail templates and settings' },

  // Notifications
  { module: 'notifications', action: 'read', slug: 'notifications:read', description: 'View notifications' },
  { module: 'notifications', action: 'update', slug: 'notifications:update', description: 'Manage notifications' },

  // Dashboard
  { module: 'dashboard', action: 'view', slug: 'dashboard:view', description: 'View the dashboard' },
];

const ROLES_SEED = [
  {
    name: 'Super Admin',
    slug: 'super_admin',
    description: 'Full system access. Cannot be deleted.',
    is_system: true,
    permissionSlugs: ['*'], // all permissions
  },
  {
    name: 'Admin',
    slug: 'admin',
    description: 'Administrative access without role management',
    is_system: false,
    permissionSlugs: [
      'users:create', 'users:read', 'users:update', 'users:delete',
      'roles:read',
      'pos:access', 'pos:manage', 'pos:refund', 'pos:hold_bills', 'pos:returns',
      'reports:view', 'reports:export',
      'settings:read', 'settings:update', 'settings:notifications', 'settings:security', 'settings:account',
      'mail:access', 'mail:send', 'mail:manage',
      'notifications:read', 'notifications:update',
      'dashboard:view',
    ],
  },
  {
    name: 'Manager',
    slug: 'manager',
    description: 'Operational management with reporting',
    is_system: false,
    permissionSlugs: [
      'users:read',
      'pos:access', 'pos:manage', 'pos:refund', 'pos:hold_bills', 'pos:returns',
      'reports:view', 'reports:export',
      'notifications:read',
      'dashboard:view',
    ],
  },
  {
    name: 'Staff',
    slug: 'staff',
    description: 'Basic POS access for frontline staff',
    is_system: false,
    permissionSlugs: [
      'pos:access', 'pos:hold_bills',
      'dashboard:view',
    ],
  },
];

export async function seedRolesAndPermissions(): Promise<void> {
  try {
    // 1. Upsert all permissions
    for (const perm of PERMISSIONS_SEED) {
      await Permission.findOrCreate({
        where: { slug: perm.slug },
        defaults: perm,
      });
    }
    logger.log(`Seeded ${PERMISSIONS_SEED.length} permissions.`);

    const allPermissions = await Permission.findAll();
    const permBySlug = new Map(allPermissions.map((p) => [p.slug, p]));

    // 2. Upsert all roles and assign permissions
    for (const roleSeed of ROLES_SEED) {
      const [role] = await Role.findOrCreate({
        where: { slug: roleSeed.slug },
        defaults: {
          name: roleSeed.name,
          slug: roleSeed.slug,
          description: roleSeed.description,
          is_system: roleSeed.is_system,
        },
      });

      // Determine which permissions to assign
      const permissionIds = roleSeed.permissionSlugs.includes('*')
        ? allPermissions.map((p) => p.id)
        : roleSeed.permissionSlugs
            .map((slug) => permBySlug.get(slug)?.id)
            .filter(Boolean) as string[];

      // Clear and reassign
      await RolePermission.destroy({ where: { role_id: role.id } });
      if (permissionIds.length > 0) {
        await RolePermission.bulkCreate(
          permissionIds.map((pid) => ({ role_id: role.id, permission_id: pid })),
        );
      }

      logger.log(`Role "${role.name}" seeded with ${permissionIds.length} permissions.`);
    }

    logger.log('Roles and permissions seeded successfully.');
  } catch (error) {
    logger.error('Failed to seed roles and permissions:', error);
    throw error;
  }
}
