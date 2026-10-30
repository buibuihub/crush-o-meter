import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(serverDir, '..');

dotenv.config({ path: path.join(rootDir, '.env') });

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production.');
}

export const config = {
  isProduction,
  port: Number(process.env.PORT) || 5000,
  appUrl: process.env.APP_URL || 'http://localhost:5000',
  jwtSecret:
    process.env.JWT_SECRET ||
    'crush-o-meter-development-secret-change-before-deploying',
  openRouterKey: process.env.OPENROUTER_API_KEY?.trim() || '',
  openRouterModel: process.env.OPENROUTER_MODEL?.trim() || 'openrouter/free',
  serperKey: process.env.SERPER_API_KEY?.trim() || '',
  dbPath: path.resolve(
    rootDir,
    process.env.DB_PATH?.trim() || 'server/data/crush-o-meter.db',
  ),
  distPath: path.join(rootDir, 'dist'),
};
