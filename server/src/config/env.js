import 'dotenv/config';

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 8080),
  clientOrigin: (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-only-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  databaseUrl: process.env.DATABASE_URL ?? '',
};

if (!process.env.JWT_SECRET && env.nodeEnv === 'production') {
  throw new Error('JWT_SECRET must be set in production');
}
