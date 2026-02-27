import { Sequelize } from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { User } from '../../users/entities/user.entity';
import { LoginSession } from '../../sessions/entities/login-session.entity';
import { PasswordHistory } from '../../password-history/entities/password-history.entity';
import { Passkey } from '../../passkey/entities/passkey.entity';
import { SEED_USERS } from './seed-data';

dotenv.config();

const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);

async function seed() {
  const dbSsl = process.env.DB_SSL === 'true';

  const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    models: [User, LoginSession, PasswordHistory, Passkey],
    logging: false,
    ...(dbSsl
      ? { dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } }
      : {}),
  });

  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    await sequelize.sync({ alter: true });
    console.log('Tables synced.');

    // Check command-line flag
    const shouldReset = process.argv.includes('--fresh');

    if (shouldReset) {
      console.log('--fresh flag detected. Clearing all tables...');
      await Passkey.destroy({ where: {}, truncate: true, cascade: true });
      await PasswordHistory.destroy({ where: {}, truncate: true, cascade: true });
      await LoginSession.destroy({ where: {}, truncate: true, cascade: true });
      await User.destroy({ where: {}, truncate: true, cascade: true });
      console.log('All tables cleared.');
    }

    // Seed users
    let created = 0;
    let skipped = 0;

    for (const userData of SEED_USERS) {
      const existing = await User.findOne({ where: { email: userData.email } });

      if (existing) {
        console.log(`  SKIP  ${userData.email} (already exists)`);
        skipped++;
        continue;
      }

      const passwordHash = await bcrypt.hash(userData.password, BCRYPT_SALT_ROUNDS);

      const user = await User.create({
        email: userData.email,
        password_hash: passwordHash,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone || null,
        timezone: userData.timezone || 'UTC',
        language: userData.language || 'en',
        email_verified: userData.email_verified ?? false,
        auth_provider: 'local',
      });

      // Store initial password in history
      await PasswordHistory.create({
        user_id: user.id,
        password_hash: passwordHash,
      });

      console.log(`  CREATED  ${userData.email} (${user.id})`);
      created++;
    }

    console.log(`\nSeeding complete: ${created} created, ${skipped} skipped.`);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('Database connection closed.');
  }
}

seed();
