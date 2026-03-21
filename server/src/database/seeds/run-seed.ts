import { Sequelize } from 'sequelize-typescript';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env
dotenv.config({ path: resolve(__dirname, '../../..', '.env') });

import { User } from '../../users/entities/user.entity';
import { LoginSession } from '../../sessions/entities/login-session.entity';
import { PasswordHistory } from '../../password-history/entities/password-history.entity';
import { Passkey } from '../../passkey/entities/passkey.entity';
import { Role } from '../../roles/entities/role.entity';
import { Permission } from '../../roles/entities/permission.entity';
import { RolePermission } from '../../roles/entities/role-permission.entity';
import { seedRolesAndPermissions } from './role-permission.seed';

async function run() {
  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    models: [User, LoginSession, PasswordHistory, Passkey, Role, Permission, RolePermission],
    logging: false,
    define: { timestamps: true, underscored: true },
    ...(process.env.DB_SSL === 'true'
      ? { dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } }
      : {}),
  });

  try {
    await sequelize.authenticate();
    console.log('DB connected.');

    // Sync tables
    await Role.sync({ alter: true });
    console.log('Table "roles" synced.');
    await Permission.sync({ alter: true });
    console.log('Table "permissions" synced.');
    await RolePermission.sync({ alter: true });
    console.log('Table "role_permissions" synced.');
    await User.sync({ alter: true });
    console.log('Table "users" synced (role_id column).');

    // Seed
    await seedRolesAndPermissions();

    console.log('\nDone! All roles and permissions seeded.');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

run();
