import { faker } from '@faker-js/faker';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { CONFIG } from '@common/constants';
import * as schema from '@common/database/schema';

export type SeedDb = ReturnType<typeof drizzle<typeof schema>>;
export type SeedUser = typeof schema.users.$inferSelect;

export type SeedContext = {
  db: SeedDb;
  close: () => Promise<void>;
};

export const SEED_RECORD_QUANTITY = 100;

export const SQRT_SEED_RECORD_QUANTITY = Math.sqrt(SEED_RECORD_QUANTITY);

export function createSeedContext(): SeedContext {
  faker.seed(42);

  const pool = new Pool({
    connectionString: CONFIG.DATABASE_URL,
  });

  return {
    db: drizzle(pool, { schema }),
    close: () => pool.end(),
  };
}
