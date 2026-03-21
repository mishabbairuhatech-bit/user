import { Module, /* OnModuleInit, */ Logger } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
// import { Sequelize } from 'sequelize-typescript';
// import { QueryTypes } from 'sequelize';
import { AppConfigService } from '../config/config.service';
import { User } from '../users/entities/user.entity';
import { LoginSession } from '../sessions/entities/login-session.entity';
import { PasswordHistory } from '../password-history/entities/password-history.entity';
import { Passkey } from '../passkey/entities/passkey.entity';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../roles/entities/permission.entity';
import { RolePermission } from '../roles/entities/role-permission.entity';
// import { seedRolesAndPermissions } from './seeds/role-permission.seed';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        dialect: 'postgres',
        host: config.dbHost,
        port: config.dbPort,
        username: config.dbUsername,
        password: config.dbPassword,
        database: config.dbName,
        models: [User, LoginSession, PasswordHistory, Passkey, Role, Permission, RolePermission],
        autoLoadModels: false,
        synchronize: false,
        logging: config.appEnv === 'development' ? false : false,
        define: {
          timestamps: true,
          underscored: true,
        },
        ...(config.dbSsl
          ? { dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } }
          : {}),
      }),
    }),
  ],
})
export class DatabaseModule /* implements OnModuleInit */ {
  // private readonly logger = new Logger(DatabaseModule.name);

  // constructor(private readonly sequelize: Sequelize) { }

  // async onModuleInit() {
  //   try {
  //     // Sync new role/permission tables (safe for first run)
  //     const models = [Role, Permission, RolePermission];
  //     const results = await this.sequelize.query<{ tablename: string }>(
  //       `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`,
  //       { type: QueryTypes.SELECT },
  //     );
  //     const existingTables = new Set(results.map((r) => r.tablename));

  //     for (const model of models) {
  //       const tableName = model.getTableName() as string;
  //       if (!existingTables.has(tableName)) {
  //         this.logger.warn(`Table "${tableName}" missing — creating...`);
  //         await model.sync();
  //         this.logger.log(`Table "${tableName}" created.`);
  //       } else {
  //         try {
  //           await model.sync({ alter: true });
  //           this.logger.log(`Table "${tableName}" synced.`);
  //         } catch (error: any) {
  //           if (error?.parent?.code === '42701') {
  //             this.logger.log(`Table "${tableName}" synced (columns already exist).`);
  //           } else {
  //             throw error;
  //           }
  //         }
  //       }
  //     }

  //     // Also sync role_id column on users table
  //     try {
  //       await User.sync({ alter: true });
  //       this.logger.log('Table "users" synced (role_id column).');
  //     } catch (error: any) {
  //       if (error?.parent?.code === '42701') {
  //         this.logger.log('Table "users" synced (role_id column already exists).');
  //       } else {
  //         throw error;
  //       }
  //     }

  //     // Seed default roles and permissions
  //     await seedRolesAndPermissions();
  //   } catch (error) {
  //     this.logger.error('Failed to sync role/permission tables:', error);
  //     throw error;
  //   }
  // }
}
