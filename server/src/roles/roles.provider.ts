import { REPOSITORY } from '../common/constants/app.constants';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';

export const rolesProviders = [
  {
    provide: REPOSITORY.ROLES,
    useValue: Role,
  },
  {
    provide: REPOSITORY.PERMISSIONS,
    useValue: Permission,
  },
  {
    provide: REPOSITORY.ROLE_PERMISSIONS,
    useValue: RolePermission,
  },
];
