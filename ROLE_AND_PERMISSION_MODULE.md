# Role and Permission Module — Design & Implementation Guide

## Table of Contents

1. [Overview](#1-overview)
2. [Database Design](#2-database-design)
3. [Backend Implementation (NestJS + Sequelize)](#3-backend-implementation-nestjs--sequelize)
4. [Frontend Implementation (React + Vite)](#4-frontend-implementation-react--vite)
5. [Integration Flow](#5-integration-flow)
6. [API Reference](#6-api-reference)
7. [Seeding Default Roles & Permissions](#7-seeding-default-roles--permissions)
8. [Security Considerations](#8-security-considerations)

---

## 1. Overview

### Current State

The system already has a robust authentication layer (JWT, Google OAuth, Passkeys, MFA) but **no authorization layer** — every authenticated user has equal access to all routes and features. The `User` entity has no `role` field, and there are no permission guards.

### Goal

Implement a flexible **Role-Based Access Control (RBAC)** system with **granular permissions** so that:

- Each user is assigned **one role** (e.g., Super Admin, Admin, Manager, Staff).
- Each role has a **set of permissions** (e.g., `users:create`, `users:read`, `pos:manage`).
- Routes and UI elements are **protected by permissions**, not just authentication.
- An admin UI exists to **create/edit roles** and **assign permissions** to them.
- Roles and permissions can be changed at runtime without code deployment.

### Design Principles

| Principle | Explanation |
|---|---|
| **Least Privilege** | Users get only the permissions their role requires. |
| **Separation of Concerns** | Roles define *who you are*; permissions define *what you can do*. |
| **Single Role per User** | Keeps the model simple. A user's capabilities = their role's permissions. |
| **Additive Permissions** | Roles only *grant* permissions. There are no "deny" rules. |
| **Backend is the Authority** | The frontend hides UI elements for convenience, but the **backend enforces** all access control. |

---

## 2. Database Design

### 2.1 Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────────┐
│    roles     │       │ role_permissions  │       │    permissions       │
├──────────────┤       ├──────────────────┤       ├──────────────────────┤
│ id (UUID PK) │──┐    │ id (UUID PK)     │    ┌──│ id (UUID PK)         │
│ name         │  │    │ role_id (FK)     │────┘  │ module               │
│ slug         │  └───>│ permission_id(FK)│       │ action               │
│ description  │       │ created_at       │       │ slug                 │
│ is_system    │       └──────────────────┘       │ description          │
│ is_active    │                                  │ created_at           │
│ created_at   │                                  │ updated_at           │
│ updated_at   │                                  └──────────────────────┘
└──────────────┘
        │
        │  1:M
        ▼
┌───────────────┐
│    users      │
├───────────────┤
│ id (UUID PK)  │
│ role_id (FK)  │  ◄── NEW COLUMN
│ email         │
│ ...           │
└───────────────┘
```

### 2.2 Table Definitions

#### `roles` Table

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, default `gen_random_uuid()` | Unique role identifier |
| `name` | VARCHAR(100) | NOT NULL | Display name (e.g., "Super Admin") |
| `slug` | VARCHAR(100) | NOT NULL, UNIQUE | Machine name (e.g., `super_admin`) |
| `description` | TEXT | NULLABLE | What this role is for |
| `is_system` | BOOLEAN | DEFAULT `false` | `true` = cannot be deleted (e.g., super_admin) |
| `is_active` | BOOLEAN | DEFAULT `true` | Soft-disable a role |
| `created_at` | TIMESTAMP | DEFAULT `NOW()` | |
| `updated_at` | TIMESTAMP | DEFAULT `NOW()` | |

#### `permissions` Table

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK, default `gen_random_uuid()` | Unique permission identifier |
| `module` | VARCHAR(100) | NOT NULL | Feature area (e.g., `users`, `pos`, `reports`) |
| `action` | VARCHAR(100) | NOT NULL | Operation (e.g., `create`, `read`, `update`, `delete`) |
| `slug` | VARCHAR(200) | NOT NULL, UNIQUE | `module:action` format (e.g., `users:create`) |
| `description` | TEXT | NULLABLE | Human-readable explanation |
| `created_at` | TIMESTAMP | DEFAULT `NOW()` | |
| `updated_at` | TIMESTAMP | DEFAULT `NOW()` | |

#### `role_permissions` Junction Table

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Row identifier |
| `role_id` | UUID | FK → `roles.id`, ON DELETE CASCADE | |
| `permission_id` | UUID | FK → `permissions.id`, ON DELETE CASCADE | |
| `created_at` | TIMESTAMP | DEFAULT `NOW()` | |

**Unique constraint:** `(role_id, permission_id)` — no duplicate assignments.

#### `users` Table — Modification

Add one column:

| Column | Type | Constraints | Description |
|---|---|---|---|
| `role_id` | UUID | FK → `roles.id`, NULLABLE | The user's assigned role |

---

### 2.3 Default Permissions (Seed Data)

Permissions follow the `module:action` naming convention. Define them per feature area:

| Module | Permissions |
|---|---|
| `users` | `users:create`, `users:read`, `users:update`, `users:delete` |
| `roles` | `roles:create`, `roles:read`, `roles:update`, `roles:delete`, `roles:assign` |
| `pos` | `pos:access`, `pos:manage`, `pos:refund`, `pos:hold_bills`, `pos:returns` |
| `reports` | `reports:view`, `reports:export` |
| `settings` | `settings:read`, `settings:update` |
| `mail` | `mail:access`, `mail:send`, `mail:manage` |
| `dashboard` | `dashboard:view` |

### 2.4 Default Roles (Seed Data)

| Role | Slug | Permissions | is_system |
|---|---|---|---|
| Super Admin | `super_admin` | **All permissions** (bypasses checks) | `true` |
| Admin | `admin` | All except `roles:delete`, `roles:assign` | `false` |
| Manager | `manager` | `users:read`, `pos:*`, `reports:*`, `dashboard:view` | `false` |
| Staff | `staff` | `pos:access`, `dashboard:view` | `false` |

---

## 3. Backend Implementation (NestJS + Sequelize)

### 3.1 Module Structure

Create these files under `server/src/`:

```
server/src/
├── roles/
│   ├── roles.module.ts
│   ├── roles.controller.ts
│   ├── roles.service.ts
│   ├── entities/
│   │   ├── role.entity.ts
│   │   ├── permission.entity.ts
│   │   └── role-permission.entity.ts
│   └── dto/
│       ├── create-role.dto.ts
│       ├── update-role.dto.ts
│       └── assign-role.dto.ts
├── common/
│   ├── guards/
│   │   └── permissions.guard.ts        ◄── NEW
│   └── decorators/
│       └── require-permissions.decorator.ts  ◄── NEW
```

### 3.2 Entity Definitions

#### `role.entity.ts`

```typescript
import {
  Table, Column, Model, DataType, HasMany, BelongsToMany, CreatedAt, UpdatedAt,
} from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';
import { Permission } from './permission.entity';
import { RolePermission } from './role-permission.entity';

@Table({ tableName: 'roles', underscored: true })
export class Role extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  name: string;

  @Column({ type: DataType.STRING(100), allowNull: false, unique: true })
  slug: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  is_system: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  is_active: boolean;

  @HasMany(() => User)
  users: User[];

  @BelongsToMany(() => Permission, () => RolePermission)
  permissions: Permission[];

  @CreatedAt created_at: Date;
  @UpdatedAt updated_at: Date;
}
```

#### `permission.entity.ts`

```typescript
import {
  Table, Column, Model, DataType, BelongsToMany, CreatedAt, UpdatedAt,
} from 'sequelize-typescript';
import { Role } from './role.entity';
import { RolePermission } from './role-permission.entity';

@Table({ tableName: 'permissions', underscored: true })
export class Permission extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  module: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  action: string;

  @Column({ type: DataType.STRING(200), allowNull: false, unique: true })
  slug: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string;

  @BelongsToMany(() => Role, () => RolePermission)
  roles: Role[];

  @CreatedAt created_at: Date;
  @UpdatedAt updated_at: Date;
}
```

#### `role-permission.entity.ts`

```typescript
import {
  Table, Column, Model, DataType, ForeignKey, CreatedAt,
} from 'sequelize-typescript';
import { Role } from './role.entity';
import { Permission } from './permission.entity';

@Table({ tableName: 'role_permissions', underscored: true })
export class RolePermission extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => Role)
  @Column({ type: DataType.UUID, allowNull: false })
  role_id: string;

  @ForeignKey(() => Permission)
  @Column({ type: DataType.UUID, allowNull: false })
  permission_id: string;

  @CreatedAt created_at: Date;
}
```

#### `user.entity.ts` — Add Role Association

Add these to the existing User entity:

```typescript
import { Role } from '../../roles/entities/role.entity';

// Inside the User class:

@ForeignKey(() => Role)
@Column({ type: DataType.UUID, allowNull: true })
role_id: string;

@BelongsTo(() => Role)
role: Role;
```

### 3.3 DTOs

#### `create-role.dto.ts`

```typescript
import { IsString, IsOptional, IsArray, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'Manager' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'manager' })
  @IsString()
  @MaxLength(100)
  slug: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [String], description: 'Array of permission UUIDs' })
  @IsArray()
  @IsUUID('4', { each: true })
  permission_ids: string[];
}
```

#### `update-role.dto.ts`

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateRoleDto } from './create-role.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
```

#### `assign-role.dto.ts`

```typescript
import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRoleDto {
  @ApiProperty({ description: 'Role UUID to assign to the user' })
  @IsUUID('4')
  role_id: string;
}
```

### 3.4 Roles Service

```typescript
// server/src/roles/roles.service.ts

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role) private roleModel: typeof Role,
    @InjectModel(Permission) private permissionModel: typeof Permission,
    @InjectModel(RolePermission) private rolePermissionModel: typeof RolePermission,
  ) {}

  // ─── Roles CRUD ───────────────────────────────────────────

  async createRole(dto: CreateRoleDto): Promise<Role> {
    const existing = await this.roleModel.findOne({ where: { slug: dto.slug } });
    if (existing) {
      throw new BadRequestException('A role with this slug already exists');
    }

    const role = await this.roleModel.create({
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
    });

    if (dto.permission_ids?.length) {
      await this.syncPermissions(role.id, dto.permission_ids);
    }

    return this.findRoleById(role.id);
  }

  async findAllRoles(): Promise<Role[]> {
    return this.roleModel.findAll({
      include: [{ model: Permission, through: { attributes: [] } }],
      order: [['created_at', 'ASC']],
    });
  }

  async findRoleById(id: string): Promise<Role> {
    const role = await this.roleModel.findByPk(id, {
      include: [{ model: Permission, through: { attributes: [] } }],
    });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async updateRole(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findRoleById(id);

    if (role.is_system && dto.slug && dto.slug !== role.slug) {
      throw new BadRequestException('Cannot change the slug of a system role');
    }

    await role.update({
      ...(dto.name && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.slug && { slug: dto.slug }),
    });

    if (dto.permission_ids) {
      await this.syncPermissions(role.id, dto.permission_ids);
    }

    return this.findRoleById(id);
  }

  async deleteRole(id: string): Promise<void> {
    const role = await this.findRoleById(id);
    if (role.is_system) {
      throw new BadRequestException('Cannot delete a system role');
    }
    await role.destroy();
  }

  // ─── Permissions ──────────────────────────────────────────

  async findAllPermissions(): Promise<Permission[]> {
    return this.permissionModel.findAll({
      order: [['module', 'ASC'], ['action', 'ASC']],
    });
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
    await this.rolePermissionModel.destroy({ where: { role_id: roleId } });

    // Validate all permission IDs exist
    const permissions = await this.permissionModel.findAll({
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
    await this.rolePermissionModel.bulkCreate(records);
  }

  // ─── Permission Check (used by Guard) ────────────────────

  async getUserPermissions(userId: string): Promise<string[]> {
    const { User } = await import('../users/entities/user.entity');
    const user = await User.findByPk(userId, {
      include: [{
        model: Role,
        include: [{ model: Permission, through: { attributes: [] } }],
      }],
    });

    if (!user || !user.role) return [];

    // Super admin bypasses all checks
    if (user.role.slug === 'super_admin') return ['*'];

    return user.role.permissions.map((p) => p.slug);
  }
}
```

### 3.5 Roles Controller

```typescript
// server/src/roles/roles.controller.ts

import {
  Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // ─── Roles ────────────────────────────────────────────────

  @Post()
  @RequirePermissions('roles:create')
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.createRole(dto);
  }

  @Get()
  @RequirePermissions('roles:read')
  findAll() {
    return this.rolesService.findAllRoles();
  }

  @Get(':id')
  @RequirePermissions('roles:read')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.findRoleById(id);
  }

  @Patch(':id')
  @RequirePermissions('roles:update')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.updateRole(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('roles:delete')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.deleteRole(id);
  }

  // ─── Permissions ──────────────────────────────────────────

  @Get('permissions/all')
  @RequirePermissions('roles:read')
  findAllPermissions() {
    return this.rolesService.findAllPermissions();
  }

  @Get('permissions/grouped')
  @RequirePermissions('roles:read')
  getPermissionsGrouped() {
    return this.rolesService.getPermissionsGroupedByModule();
  }
}
```

### 3.6 Roles Module

```typescript
// server/src/roles/roles.module.ts

import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';

@Module({
  imports: [SequelizeModule.forFeature([Role, Permission, RolePermission])],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
```

### 3.7 Permission Guard & Decorator

#### `require-permissions.decorator.ts`

```typescript
// server/src/common/decorators/require-permissions.decorator.ts

import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'required_permissions';

export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
```

#### `permissions.guard.ts`

```typescript
// server/src/common/guards/permissions.guard.ts

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { RolesService } from '../../roles/roles.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rolesService: RolesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No permissions required — allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const userPermissions = await this.rolesService.getUserPermissions(user.id);

    // Super admin wildcard
    if (userPermissions.includes('*')) {
      return true;
    }

    const hasAllPermissions = requiredPermissions.every((perm) =>
      userPermissions.includes(perm),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('You do not have permission to perform this action');
    }

    return true;
  }
}
```

### 3.8 Register Globally

#### Update `app.module.ts`

```typescript
import { APP_GUARD } from '@nestjs/core';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [
    // ... existing imports
    RolesModule,
  ],
  providers: [
    // ... existing providers
    // Register PermissionsGuard globally (runs AFTER JwtAuthGuard)
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
```

> **Note:** Since `JwtAuthGuard` is already registered as a global guard, it runs first. `PermissionsGuard` runs second. Routes marked with `@Public()` skip `JwtAuthGuard`, and routes without `@RequirePermissions()` skip `PermissionsGuard`.

### 3.9 Include Permissions in Auth Response

Update the `/auth/me` endpoint and the login response to include the user's role and permissions. This is what the frontend uses to render the UI.

#### Update `auth.service.ts` — Login/Me Response

```typescript
// In the method that builds the login or /me response, add:

async getAuthProfile(userId: string) {
  const user = await this.userModel.findByPk(userId, {
    attributes: { exclude: ['password_hash', 'totp_secret', 'mfa_code'] },
    include: [{
      model: Role,
      include: [{
        model: Permission,
        through: { attributes: [] },  // exclude junction table fields
      }],
    }],
  });

  return {
    ...user.toJSON(),
    permissions: user.role
      ? user.role.slug === 'super_admin'
        ? ['*']
        : user.role.permissions.map((p) => p.slug)
      : [],
  };
}
```

The response shape the frontend receives:

```json
{
  "data": {
    "id": "uuid",
    "email": "admin@example.com",
    "first_name": "John",
    "role": {
      "id": "uuid",
      "name": "Admin",
      "slug": "admin"
    },
    "permissions": ["users:read", "users:create", "pos:access", "..."]
  }
}
```

### 3.10 Assign Role to a User

Add an endpoint in `UsersController`:

```typescript
// server/src/users/users.controller.ts

@Patch(':id/role')
@RequirePermissions('roles:assign')
async assignRole(
  @Param('id', ParseUUIDPipe) id: string,
  @Body() dto: AssignRoleDto,
) {
  return this.usersService.assignRole(id, dto.role_id);
}
```

```typescript
// server/src/users/users.service.ts

async assignRole(userId: string, roleId: string): Promise<User> {
  const user = await this.userModel.findByPk(userId);
  if (!user) throw new NotFoundException('User not found');

  const role = await Role.findByPk(roleId);
  if (!role) throw new NotFoundException('Role not found');
  if (!role.is_active) throw new BadRequestException('Cannot assign an inactive role');

  await user.update({ role_id: roleId });

  return this.userModel.findByPk(userId, {
    include: [{ model: Role }],
    attributes: { exclude: ['password_hash'] },
  });
}
```

---

## 4. Frontend Implementation (React + Vite)

### 4.1 New Files Structure

```
admin/src/
├── context/
│   └── AuthContext.jsx          ◄── MODIFY (add permissions)
├── hooks/
│   └── usePermission.js         ◄── NEW
├── components/
│   └── PermissionGate.jsx       ◄── NEW
├── pages/
│   └── admin/
│       └── roles/
│           ├── RolesPage.jsx        ◄── NEW (list roles)
│           ├── RoleFormPage.jsx     ◄── NEW (create/edit role)
│           └── AssignRolePage.jsx   ◄── NEW (assign role to user)
├── services/
│   └── endpoints.js             ◄── MODIFY (add role endpoints)
```

### 4.2 API Endpoints

Add to `admin/src/services/endpoints.js`:

```javascript
// ─── Roles & Permissions ────────────────────────────────────
export const ROLES = {
  LIST:              '/roles',
  CREATE:            '/roles',
  GET:    (id) =>    `/roles/${id}`,
  UPDATE: (id) =>    `/roles/${id}`,
  DELETE: (id) =>    `/roles/${id}`,
  PERMISSIONS_ALL:   '/roles/permissions/all',
  PERMISSIONS_GROUPED: '/roles/permissions/grouped',
};

export const USERS_ROLE = {
  ASSIGN: (id) =>    `/users/${id}/role`,
};
```

### 4.3 AuthContext — Expose Permissions

Update the existing `AuthContext.jsx` to store and expose permissions after login or on `/auth/me`:

```jsx
// Inside AuthContext, after fetching user data:

const [permissions, setPermissions] = useState([]);

// When user data is received (login, /auth/me):
const handleUserData = (userData) => {
  setUser(userData);
  setPermissions(userData.permissions || []);
};

// Expose a permission checker
const hasPermission = useCallback((permission) => {
  if (permissions.includes('*')) return true;  // super admin
  return permissions.includes(permission);
}, [permissions]);

const hasAnyPermission = useCallback((...perms) => {
  if (permissions.includes('*')) return true;
  return perms.some((p) => permissions.includes(p));
}, [permissions]);

// Add to context value:
// { user, permissions, hasPermission, hasAnyPermission, ... }
```

### 4.4 `usePermission` Hook

```jsx
// admin/src/hooks/usePermission.js

import { useAuth } from '../context/AuthContext';

export function usePermission() {
  const { permissions, hasPermission, hasAnyPermission } = useAuth();

  return {
    permissions,
    hasPermission,       // hasPermission('users:create')
    hasAnyPermission,    // hasAnyPermission('users:create', 'users:update')
    isSuperAdmin: permissions.includes('*'),
  };
}
```

### 4.5 `PermissionGate` Component

A wrapper that conditionally renders children based on permissions:

```jsx
// admin/src/components/PermissionGate.jsx

import { usePermission } from '../hooks/usePermission';

export function PermissionGate({ permission, permissions, requireAll = true, fallback = null, children }) {
  const { hasPermission, hasAnyPermission } = usePermission();

  // Single permission check
  if (permission) {
    return hasPermission(permission) ? children : fallback;
  }

  // Multiple permissions check
  if (permissions) {
    const hasAccess = requireAll
      ? permissions.every((p) => hasPermission(p))
      : hasAnyPermission(...permissions);
    return hasAccess ? children : fallback;
  }

  return children;
}
```

**Usage in components:**

```jsx
import { PermissionGate } from '../../components/PermissionGate';

// Hide a button if the user lacks permission
<PermissionGate permission="users:create">
  <button onClick={openCreateUserModal}>Add User</button>
</PermissionGate>

// Show a read-only message instead
<PermissionGate permission="settings:update" fallback={<p>Read-only access</p>}>
  <SettingsForm />
</PermissionGate>

// Require any of multiple permissions
<PermissionGate permissions={['reports:view', 'reports:export']} requireAll={false}>
  <ReportsSection />
</PermissionGate>
```

### 4.6 Protected Routes

Update `admin/src/routes/routes.jsx` to guard routes by permission:

```jsx
import { PermissionGate } from '../components/PermissionGate';

// Wrap route elements that require specific permissions:
{
  path: 'roles',
  element: (
    <PermissionGate permission="roles:read" fallback={<AccessDeniedPage />}>
      <RolesPage />
    </PermissionGate>
  ),
},
{
  path: 'roles/create',
  element: (
    <PermissionGate permission="roles:create" fallback={<AccessDeniedPage />}>
      <RoleFormPage />
    </PermissionGate>
  ),
},
```

### 4.7 Sidebar Navigation — Conditional Items

Update the sidebar to show/hide menu items based on permissions:

```jsx
import { usePermission } from '../hooks/usePermission';

function Sidebar() {
  const { hasPermission, hasAnyPermission } = usePermission();

  const menuItems = [
    {
      label: 'Dashboard',
      path: '/admin/dashboard',
      visible: hasPermission('dashboard:view'),
    },
    {
      label: 'Users',
      path: '/admin/users',
      visible: hasPermission('users:read'),
    },
    {
      label: 'Roles & Permissions',
      path: '/admin/roles',
      visible: hasPermission('roles:read'),
    },
    {
      label: 'POS',
      path: '/pos',
      visible: hasAnyPermission('pos:access', 'pos:manage'),
    },
    {
      label: 'Reports',
      path: '/admin/reports',
      visible: hasAnyPermission('reports:view', 'reports:export'),
    },
    {
      label: 'Settings',
      path: '/admin/settings',
      visible: hasPermission('settings:read'),
    },
  ].filter((item) => item.visible);

  return (
    <nav>
      {menuItems.map((item) => (
        <NavLink key={item.path} to={item.path}>{item.label}</NavLink>
      ))}
    </nav>
  );
}
```

### 4.8 Roles Management Page

Key UI components for the Roles admin page:

#### Roles List Page (`RolesPage.jsx`)

- Table showing all roles with columns: Name, Description, Permissions count, System role badge, Actions
- "Create Role" button (visible to `roles:create`)
- Edit button per row (visible to `roles:update`)
- Delete button per row (visible to `roles:delete`, disabled for system roles)
- Use React Query for data fetching:

```jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { ROLES } from '../../services/endpoints';

function RolesPage() {
  const queryClient = useQueryClient();

  const { data: roles, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => api.get(ROLES.LIST).then((res) => res.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(ROLES.DELETE(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  });

  // ... render table
}
```

#### Role Form Page (`RoleFormPage.jsx`)

- Form with: Name, Slug (auto-generated from name), Description
- Permission picker: permissions grouped by module, rendered as checkboxes
- "Select All" toggle per module group
- Submit creates or updates the role with selected permission IDs:

```jsx
function RoleFormPage() {
  const { id } = useParams(); // null for create, UUID for edit

  const { data: permissionsGrouped } = useQuery({
    queryKey: ['permissions-grouped'],
    queryFn: () => api.get(ROLES.PERMISSIONS_GROUPED).then((res) => res.data.data),
  });

  const { data: role } = useQuery({
    queryKey: ['role', id],
    queryFn: () => api.get(ROLES.GET(id)).then((res) => res.data.data),
    enabled: !!id,
  });

  // Render form with module-grouped permission checkboxes
  // On submit: POST /roles (create) or PATCH /roles/:id (update)
}
```

The permission picker UI:

```
┌─────────────────────────────────────────────────────┐
│ Permissions                                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ▼ Users                              [Select All ☐] │
│   ☑ users:create    Create users                    │
│   ☑ users:read      View users                      │
│   ☑ users:update    Edit users                      │
│   ☐ users:delete    Delete users                    │
│                                                     │
│ ▼ POS                                [Select All ☐] │
│   ☑ pos:access      Access POS terminal             │
│   ☐ pos:manage      Manage POS settings             │
│   ☐ pos:refund      Process refunds                 │
│   ☑ pos:hold_bills  Hold bills                      │
│   ☐ pos:returns     Process returns                 │
│                                                     │
│ ▼ Reports                            [Select All ☐] │
│   ☑ reports:view    View reports                    │
│   ☐ reports:export  Export reports                   │
│                                                     │
│ ► Roles  ► Settings  ► Mail  ► Dashboard            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 4.9 Assign Role to User

On the Users list/edit page, add a role selector dropdown:

```jsx
import { useQuery, useMutation } from '@tanstack/react-query';

function UserRoleSelector({ userId, currentRoleId }) {
  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: () => api.get(ROLES.LIST).then((res) => res.data.data),
  });

  const assignMutation = useMutation({
    mutationFn: (roleId) => api.patch(USERS_ROLE.ASSIGN(userId), { role_id: roleId }),
  });

  return (
    <select
      value={currentRoleId || ''}
      onChange={(e) => assignMutation.mutate(e.target.value)}
    >
      <option value="">No Role</option>
      {roles?.map((role) => (
        <option key={role.id} value={role.id}>{role.name}</option>
      ))}
    </select>
  );
}
```

---

## 5. Integration Flow

### 5.1 Complete Request Lifecycle

```
User clicks "Create User" button
        │
        ▼
[Frontend] PermissionGate checks hasPermission('users:create')
        │
        ├── No  → Button is hidden (never rendered)
        │
        └── Yes → Button visible, user clicks it
                        │
                        ▼
              [Frontend] POST /api/users  (Axios with httpOnly JWT cookie)
                        │
                        ▼
              [Backend]  JwtAuthGuard extracts user from cookie
                        │
                        ▼
              [Backend]  PermissionsGuard reads @RequirePermissions('users:create')
                        │
                        ▼
              [Backend]  RolesService.getUserPermissions(userId)
                        │
                        ├── Fetches User → Role → Permissions from DB
                        │
                        ├── Returns ['users:create', 'users:read', ...]
                        │
                        ▼
              [Backend]  Guard checks: requiredPermissions ⊆ userPermissions?
                        │
                        ├── No  → 403 Forbidden
                        │
                        └── Yes → Controller handler executes
                                        │
                                        ▼
                                  [Backend] UsersService.create()
                                        │
                                        ▼
                                  Response: 201 Created
```

### 5.2 Login Flow with Permissions

```
User submits login form
        │
        ▼
POST /api/auth/login  →  validates credentials  →  returns JWT cookies
        │
        ▼
GET /api/auth/me  →  returns user profile + role + permissions[]
        │
        ▼
AuthContext stores:
  - user object (with role)
  - permissions array (e.g., ['users:read', 'pos:access', 'dashboard:view'])
        │
        ▼
App re-renders:
  - Sidebar shows only permitted menu items
  - PermissionGate components show/hide UI elements
  - Routes redirect to AccessDenied if permission missing
```

### 5.3 Role Update Propagation

When an admin changes a role's permissions:

```
Admin updates role permissions via PATCH /api/roles/:id
        │
        ▼
Backend updates role_permissions table
        │
        ▼
All users with that role get new permissions on their NEXT request
(PermissionsGuard always fetches fresh permissions from DB)
        │
        ▼
Frontend: User's permissions refresh on next /auth/me call
(e.g., on page reload or periodic refetch via React Query)
```

**Recommendation:** Configure React Query to refetch `/auth/me` periodically (e.g., every 5 minutes) so permission changes propagate without requiring a logout:

```jsx
useQuery({
  queryKey: ['auth-me'],
  queryFn: () => api.get('/auth/me'),
  refetchInterval: 5 * 60 * 1000, // 5 minutes
});
```

---

## 6. API Reference

### 6.1 Roles

| Method | Endpoint | Permission Required | Description |
|---|---|---|---|
| `GET` | `/api/roles` | `roles:read` | List all roles with their permissions |
| `POST` | `/api/roles` | `roles:create` | Create a new role |
| `GET` | `/api/roles/:id` | `roles:read` | Get a single role by ID |
| `PATCH` | `/api/roles/:id` | `roles:update` | Update role name, description, or permissions |
| `DELETE` | `/api/roles/:id` | `roles:delete` | Delete a non-system role |

### 6.2 Permissions

| Method | Endpoint | Permission Required | Description |
|---|---|---|---|
| `GET` | `/api/roles/permissions/all` | `roles:read` | List all permissions (flat) |
| `GET` | `/api/roles/permissions/grouped` | `roles:read` | List permissions grouped by module |

### 6.3 User Role Assignment

| Method | Endpoint | Permission Required | Description |
|---|---|---|---|
| `PATCH` | `/api/users/:id/role` | `roles:assign` | Assign a role to a user |

### 6.4 Request/Response Examples

**Create Role:**

```http
POST /api/roles
Content-Type: application/json

{
  "name": "Warehouse Staff",
  "slug": "warehouse_staff",
  "description": "Staff managing warehouse inventory",
  "permission_ids": [
    "uuid-of-pos-access",
    "uuid-of-dashboard-view"
  ]
}
```

**Response:**

```json
{
  "statusCode": 201,
  "message": "Role created successfully",
  "data": {
    "id": "generated-uuid",
    "name": "Warehouse Staff",
    "slug": "warehouse_staff",
    "description": "Staff managing warehouse inventory",
    "is_system": false,
    "is_active": true,
    "permissions": [
      { "id": "...", "module": "pos", "action": "access", "slug": "pos:access" },
      { "id": "...", "module": "dashboard", "action": "view", "slug": "dashboard:view" }
    ]
  }
}
```

**Assign Role:**

```http
PATCH /api/users/user-uuid/role
Content-Type: application/json

{
  "role_id": "role-uuid"
}
```

---

## 7. Seeding Default Roles & Permissions

Create a seeder to populate the database with initial roles and permissions.

### `server/src/database/seeds/role-permission.seed.ts`

```typescript
import { Permission } from '../../roles/entities/permission.entity';
import { Role } from '../../roles/entities/role.entity';
import { RolePermission } from '../../roles/entities/role-permission.entity';

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

  // Mail
  { module: 'mail', action: 'access', slug: 'mail:access', description: 'Access the mail portal' },
  { module: 'mail', action: 'send', slug: 'mail:send', description: 'Send emails' },
  { module: 'mail', action: 'manage', slug: 'mail:manage', description: 'Manage mail templates and settings' },

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
      'settings:read', 'settings:update',
      'mail:access', 'mail:send', 'mail:manage',
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

export async function seedRolesAndPermissions() {
  // 1. Upsert all permissions
  for (const perm of PERMISSIONS_SEED) {
    await Permission.findOrCreate({
      where: { slug: perm.slug },
      defaults: perm,
    });
  }

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
          .filter(Boolean);

    // Clear and reassign
    await RolePermission.destroy({ where: { role_id: role.id } });
    await RolePermission.bulkCreate(
      permissionIds.map((pid) => ({ role_id: role.id, permission_id: pid })),
    );
  }

  console.log('Roles and permissions seeded successfully.');
}
```

Call this seeder from `database.module.ts` or a dedicated seed script:

```typescript
// In database module's onModuleInit or a CLI seed command:
import { seedRolesAndPermissions } from './seeds/role-permission.seed';

async onModuleInit() {
  await seedRolesAndPermissions();
}
```

---

## 8. Security Considerations

### 8.1 Critical Rules

| Rule | Why |
|---|---|
| **Backend is the single source of truth** | Frontend hides UI for UX, but the backend **enforces** permissions. Never trust the client. |
| **Always check permissions on the server** | Even if the UI hides a button, a direct API call can still reach the endpoint. |
| **Super Admin bypass is role-based, not user-based** | The `super_admin` *role* gets wildcard access, not a specific user ID. |
| **System roles cannot be deleted** | `is_system: true` prevents accidental removal of critical roles. |
| **No self-demotion for the last Super Admin** | Add a check: if the user is the only super_admin, prevent them from changing their own role. |
| **Validate permission IDs on role creation** | Don't allow arbitrary strings — verify they exist in the `permissions` table. |

### 8.2 Prevent Last Super Admin Lock-out

Add this check in `UsersService.assignRole`:

```typescript
async assignRole(userId: string, roleId: string): Promise<User> {
  const user = await this.userModel.findByPk(userId, { include: [Role] });
  if (!user) throw new NotFoundException('User not found');

  // Prevent removing the last super admin
  if (user.role?.slug === 'super_admin') {
    const superAdminRole = await Role.findOne({ where: { slug: 'super_admin' } });
    const superAdminCount = await this.userModel.count({
      where: { role_id: superAdminRole.id },
    });
    if (superAdminCount <= 1 && roleId !== superAdminRole.id) {
      throw new BadRequestException(
        'Cannot change role: this is the last Super Admin account'
      );
    }
  }

  // ... rest of assignment logic
}
```

### 8.3 Performance — Caching Permissions

The `PermissionsGuard` queries the database on every request. For better performance, add caching:

**Option A — In-memory cache with TTL (simple):**

```typescript
// In RolesService:
private permissionCache = new Map<string, { permissions: string[]; expiresAt: number }>();
private CACHE_TTL = 60_000; // 1 minute

async getUserPermissions(userId: string): Promise<string[]> {
  const cached = this.permissionCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.permissions;
  }

  const permissions = await this.fetchPermissionsFromDB(userId);

  this.permissionCache.set(userId, {
    permissions,
    expiresAt: Date.now() + this.CACHE_TTL,
  });

  return permissions;
}

// Call this when a role's permissions are updated:
clearPermissionCache() {
  this.permissionCache.clear();
}
```

**Option B — Redis cache (for multi-instance deployments):** Use `@nestjs/cache-manager` with a Redis store. Same logic but shared across server instances.

### 8.4 Audit Logging

For compliance and debugging, log role and permission changes:

```typescript
// Log whenever:
// - A role is created, updated, or deleted
// - Permissions are assigned to or removed from a role
// - A user's role is changed

console.log(JSON.stringify({
  event: 'role_assigned',
  actor_id: currentUser.id,
  target_user_id: userId,
  old_role_id: user.role_id,
  new_role_id: roleId,
  timestamp: new Date().toISOString(),
}));
```

Consider writing these to a dedicated `audit_logs` table for production use.

---

## Implementation Checklist

### Backend

- [ ] Create `Role`, `Permission`, `RolePermission` entities
- [ ] Add `role_id` foreign key to `User` entity
- [ ] Create `RolesModule` with service and controller
- [ ] Create DTOs with validation (`CreateRoleDto`, `UpdateRoleDto`, `AssignRoleDto`)
- [ ] Implement `RequirePermissions` decorator
- [ ] Implement `PermissionsGuard` and register globally
- [ ] Add `PATCH /users/:id/role` endpoint
- [ ] Update `/auth/me` and login response to include permissions
- [ ] Create seed script for default roles and permissions
- [ ] Add last-super-admin protection
- [ ] Register new entities in `DatabaseModule`
- [ ] Register `RolesModule` in `AppModule`
- [ ] Add Swagger documentation for new endpoints

### Frontend

- [ ] Add role/permission endpoints to `endpoints.js`
- [ ] Update `AuthContext` to store and expose permissions
- [ ] Create `usePermission` hook
- [ ] Create `PermissionGate` component
- [ ] Build `RolesPage` (list roles)
- [ ] Build `RoleFormPage` (create/edit with permission picker)
- [ ] Add role assignment UI on user management page
- [ ] Update sidebar to show/hide items based on permissions
- [ ] Wrap protected routes with `PermissionGate`
- [ ] Add "Access Denied" page for unauthorized route access
- [ ] Configure React Query refetch interval for `/auth/me`

### Testing

- [ ] Unit test `PermissionsGuard` with various permission combinations
- [ ] Unit test `RolesService` CRUD operations
- [ ] Test super admin wildcard bypass
- [ ] Test system role deletion prevention
- [ ] Test last-super-admin lock-out prevention
- [ ] Integration test: user with role X can/cannot access endpoint Y
- [ ] Frontend: test `PermissionGate` renders/hides correctly
- [ ] Frontend: test sidebar shows correct items per role
