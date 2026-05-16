import { defineConfig } from 'drizzle-kit';
import { CONFIG } from './src/common/constants';

export default defineConfig({
  schema: './src/common/database/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: CONFIG.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
