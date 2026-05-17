import { Injectable } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { DatabaseService } from '@common/database/database.service';
import { releases } from '@common/database/schema';

type Platform = (typeof releases.$inferSelect)['platform'];

@Injectable()
export class ReleasesRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(input: typeof releases.$inferInsert) {
    const [release] = await this.databaseService.db
      .insert(releases)
      .values(input)
      .returning();

    return release;
  }

  async findLatest(appId: string, platform: Platform) {
    const [release] = await this.databaseService.db
      .select()
      .from(releases)
      .where(and(eq(releases.appId, appId), eq(releases.platform, platform)))
      .orderBy(desc(releases.createdAt))
      .limit(1);

    return release ?? null;
  }

  async list(appId?: string, platform?: Platform) {
    const conditions = [];

    if (appId) {
      // @ts-ignore
      conditions.push(eq(releases.appId, appId));
    }
    if (platform) {
      // @ts-ignore
      conditions.push(eq(releases.platform, platform));
    }

    return this.databaseService.db
      .select()
      .from(releases)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(releases.createdAt));
  }

  async findById(id: string) {
    const [release] = await this.databaseService.db
      .select()
      .from(releases)
      .where(eq(releases.id, id))
      .limit(1);

    return release ?? null;
  }

  async deleteById(id: string) {
    const [deleted] = await this.databaseService.db
      .delete(releases)
      .where(eq(releases.id, id))
      .returning();

    return deleted ?? null;
  }
}
