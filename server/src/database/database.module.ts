import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';
import { AppConfigService } from '../config/config.service';
import { User } from '../users/entities/user.entity';
import { LoginSession } from '../sessions/entities/login-session.entity';
import { PasswordHistory } from '../password-history/entities/password-history.entity';
import { Passkey } from '../passkey/entities/passkey.entity';

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
        models: [User, LoginSession, PasswordHistory, Passkey],
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
export class DatabaseModule implements OnModuleInit {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(private readonly sequelize: Sequelize) { }

  async onModuleInit() {
    // try {
    //   // Get existing tables from the database
    //   const results = await this.sequelize.query<{ tablename: string }>(
    //     `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`,
    //     { type: QueryTypes.SELECT },
    //   );
    //   const existingTables = new Set(results.map((r) => r.tablename));

    //   // Models in dependency order (parent tables first)
    //   const models = [User, LoginSession, PasswordHistory, Passkey];

    //   for (const model of models) {
    //     const tableName = model.getTableName() as string;

    //     if (!existingTables.has(tableName)) {
    //       this.logger.warn(`Table "${tableName}" missing — creating...`);
    //       await model.sync();
    //       this.logger.log(`Table "${tableName}" created.`);
    //     } else {
    //       // Table exists, sync with alter to add any missing columns
    //       try {
    //         await model.sync({ alter: true });
    //         this.logger.log(`Table "${tableName}" synced.`);
    //       } catch (error: any) {
    //         // Ignore "column already exists" errors (PostgreSQL code 42701)
    //         if (error?.parent?.code === '42701') {
    //           this.logger.log(`Table "${tableName}" synced (columns already exist).`);
    //         } else {
    //           throw error;
    //         }
    //       }
    //     }
    //   }

    //   this.logger.log('Database tables synced successfully.');
    // } catch (error) {
    //   this.logger.error('Failed to sync database tables:', error);
    //   throw error;
    // }
  }
}
