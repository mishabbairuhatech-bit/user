import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  // Application
  APP_PORT: Joi.number().default(3000),
  APP_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  APP_URL: Joi.string().default('http://localhost:3000'),
  FRONTEND_URL: Joi.string().default('http://localhost:5173'),

  // Database
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_SSL: Joi.boolean().default(false),

  // JWT
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('1m'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  // Google OAuth
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_CALLBACK_URL: Joi.string().default('http://localhost:3000/api/auth/google/callback'),

  // WebAuthn
  WEBAUTHN_RP_NAME: Joi.string().default('MyApp'),
  WEBAUTHN_RP_ID: Joi.string().default('localhost'),
  WEBAUTHN_ORIGIN: Joi.string().default('http://localhost:5173'),

  // Security
  MAX_FAILED_LOGIN_ATTEMPTS: Joi.number().default(5),
  ACCOUNT_LOCK_DURATION_MINUTES: Joi.number().default(10),
  PASSWORD_RESET_TOKEN_EXPIRES_MINUTES: Joi.number().default(60),
  PASSWORD_HISTORY_COUNT: Joi.number().default(3),
  BCRYPT_SALT_ROUNDS: Joi.number().default(12),

  // Rate Limiting
  THROTTLE_TTL: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(100),

  // SMTP
  SMTP_HOST: Joi.string().default('smtp.gmail.com'),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().default(''),
  SMTP_PASS: Joi.string().default(''),
  SMTP_FROM: Joi.string().default('noreply@yourapp.com'),

  // Google Maps
  GOOGLE_MAPS_API_KEY: Joi.string().allow('').default(''),
});
