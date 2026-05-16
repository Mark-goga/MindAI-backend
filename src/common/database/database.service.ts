import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { CONFIG } from '@common/constants';
import * as schema from './schema';

export type AppDatabase = NodePgDatabase<typeof schema>;

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool = new Pool({
    connectionString: CONFIG.DATABASE_URL,
  });

  readonly db: AppDatabase = drizzle(this.pool, { schema });

  async onModuleDestroy() {
    await this.pool.end();
  }
}
