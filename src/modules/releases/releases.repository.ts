import { Injectable } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { DatabaseService } from '@common/database/database.service';
import { releases } from '@common/database/schema';
import type { Platform } from '@common/database/schema';

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
      .where(
        and(
          eq(releases.appId, appId),
          eq(releases.platform, platform),
          eq(releases.isReleased, true),
        ),
      )
      .orderBy(desc(releases.createdAt))
      .limit(1);

    return release ?? null;
  }

  async list(appId?: string, platform?: Platform) {
    return this.databaseService.db
      .select()
      .from(releases)
      .where(
        and(
          appId ? eq(releases.appId, appId) : undefined,
          platform ? eq(releases.platform, platform) : undefined,
        ),
      )
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
