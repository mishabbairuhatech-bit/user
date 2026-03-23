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

  // Inventory
  { module: 'inventory', action: 'read', slug: 'inventory:read', description: 'View products, categories, stock' },
  { module: 'inventory', action: 'create', slug: 'inventory:create', description: 'Add products, categories, stock adjustments' },
  { module: 'inventory', action: 'update', slug: 'inventory:update', description: 'Edit products, categories' },
  { module: 'inventory', action: 'delete', slug: 'inventory:delete', description: 'Delete categories' },

  // Sales
  { module: 'sales', action: 'read', slug: 'sales:read', description: 'View invoices, customers, credit notes' },
  { module: 'sales', action: 'create', slug: 'sales:create', description: 'Create invoices, credit notes, quotations' },
  { module: 'sales', action: 'update', slug: 'sales:update', description: 'Edit invoices, quotations' },
  { module: 'sales', action: 'cancel', slug: 'sales:cancel', description: 'Cancel sales invoices' },

  // Purchases
  { module: 'purchases', action: 'read', slug: 'purchases:read', description: 'View purchase bills, vendors, debit notes' },
  { module: 'purchases', action: 'create', slug: 'purchases:create', description: 'Create purchase bills, debit notes, POs' },
  { module: 'purchases', action: 'update', slug: 'purchases:update', description: 'Edit purchase bills' },
  { module: 'purchases', action: 'cancel', slug: 'purchases:cancel', description: 'Cancel purchase bills' },

  // Accounting
  { module: 'accounting', action: 'read', slug: 'accounting:read', description: 'View chart of accounts, journal entries, reports' },
  { module: 'accounting', action: 'create', slug: 'accounting:create', description: 'Create ledger accounts, journal entries, financial years' },
  { module: 'accounting', action: 'update', slug: 'accounting:update', description: 'Edit accounts, cancel journal entries' },

  // Banking
  { module: 'banking', action: 'read', slug: 'banking:read', description: 'View bank accounts, transactions' },
  { module: 'banking', action: 'create', slug: 'banking:create', description: 'Create payments, receipts, bank accounts' },
  { module: 'banking', action: 'reconcile', slug: 'banking:reconcile', description: 'Reconcile bank transactions' },

  // Tax
  { module: 'tax', action: 'read', slug: 'tax:read', description: 'View tax rates, GST reports, business settings' },
  { module: 'tax', action: 'update', slug: 'tax:update', description: 'Manage tax rates and business settings' },

  // POS
  { module: 'pos', action: 'access', slug: 'pos:access', description: 'Access the POS terminal' },
  { module: 'pos', action: 'manage_terminals', slug: 'pos:manage_terminals', description: 'Manage POS terminals' },
  { module: 'pos', action: 'view_reports', slug: 'pos:view_reports', description: 'View POS daily sales reports' },
  { module: 'pos', action: 'manage', slug: 'pos:manage', description: 'Manage POS configuration' },
  { module: 'pos', action: 'refund', slug: 'pos:refund', description: 'Process refunds' },
  { module: 'pos', action: 'hold_bills', slug: 'pos:hold_bills', description: 'Hold and resume bills' },
  { module: 'pos', action: 'returns', slug: 'pos:returns', description: 'Process product returns' },

  // Reports
  { module: 'reports', action: 'view', slug: 'reports:view', description: 'View reports' },
  { module: 'reports', action: 'export', slug: 'reports:export', description: 'Export reports to file' },

  // Business Settings
  { module: 'business_settings', action: 'read', slug: 'business_settings:read', description: 'View business settings' },
  { module: 'business_settings', action: 'update', slug: 'business_settings:update', description: 'Update business settings' },

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
      'inventory:read', 'inventory:create', 'inventory:update', 'inventory:delete',
      'sales:read', 'sales:create', 'sales:update', 'sales:cancel',
      'purchases:read', 'purchases:create', 'purchases:update', 'purchases:cancel',
      'accounting:read', 'accounting:create', 'accounting:update',
      'banking:read', 'banking:create', 'banking:reconcile',
      'tax:read', 'tax:update',
      'pos:access', 'pos:manage', 'pos:manage_terminals', 'pos:view_reports', 'pos:refund', 'pos:hold_bills', 'pos:returns',
      'reports:view', 'reports:export',
      'business_settings:read', 'business_settings:update',
      'settings:read', 'settings:update', 'settings:notifications', 'settings:security', 'settings:account',
      'mail:access', 'mail:send', 'mail:manage',
      'notifications:read', 'notifications:update',
      'dashboard:view',
    ],
  },
  {
    name: 'Accountant',
    slug: 'accountant',
    description: 'Full access to accounting, tax, banking, sales, and purchases',
    is_system: false,
    permissionSlugs: [
      'inventory:read',
      'sales:read', 'sales:create', 'sales:update', 'sales:cancel',
      'purchases:read', 'purchases:create', 'purchases:update', 'purchases:cancel',
      'accounting:read', 'accounting:create', 'accounting:update',
      'banking:read', 'banking:create', 'banking:reconcile',
      'tax:read', 'tax:update',
      'reports:view', 'reports:export',
      'business_settings:read',
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
      'inventory:read', 'inventory:create', 'inventory:update',
      'sales:read', 'sales:create',
      'purchases:read', 'purchases:create',
      'accounting:read',
      'banking:read', 'banking:create',
      'tax:read',
      'pos:access', 'pos:manage', 'pos:view_reports', 'pos:refund', 'pos:hold_bills', 'pos:returns',
      'reports:view', 'reports:export',
      'notifications:read',
      'dashboard:view',
    ],
  },
  {
    name: 'Salesperson',
    slug: 'salesperson',
    description: 'Sales invoices, customers, and POS access',
    is_system: false,
    permissionSlugs: [
      'inventory:read',
      'sales:read', 'sales:create',
      'pos:access', 'pos:hold_bills',
      'banking:read',
      'dashboard:view',
    ],
  },
  {
    name: 'Staff',
    slug: 'staff',
    description: 'Basic POS access for frontline staff',
    is_system: false,
    permissionSlugs: [
      'inventory:read',
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
