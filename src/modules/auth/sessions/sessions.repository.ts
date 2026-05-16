import { Injectable } from '@nestjs/common';
import { and, desc, eq, gt, isNull, ne } from 'drizzle-orm';
import { DatabaseService } from '@common/database/database.service';
import { sessions } from '@common/database/schema';

@Injectable()
export class SessionsRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(input: typeof sessions.$inferInsert) {
    const [session] = await this.databaseService.db
      .insert(sessions)
      .values(input)
      .returning();

    return session;
  }

  async updateById(id: string, input: Partial<typeof sessions.$inferInsert>) {
    const [session] = await this.databaseService.db
      .update(sessions)
      .set(input)
      .where(eq(sessions.id, id))
      .returning();

    return session ?? null;
  }

  async findActiveById(id: string) {
    const [session] = await this.databaseService.db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.id, id),
          isNull(sessions.revokedAt),
          gt(sessions.expiresAt, new Date()),
        ),
      )
      .limit(1);

    return session ?? null;
  }

  async findReusableActiveSession(
    userId: string,
    applicationId: string,
    deviceId: string,
  ) {
    const [session] = await this.databaseService.db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, userId),
          eq(sessions.applicationId, applicationId),
          eq(sessions.deviceId, deviceId),
          isNull(sessions.revokedAt),
          gt(sessions.expiresAt, new Date()),
        ),
      )
      .orderBy(desc(sessions.lastUsedAt))
      .limit(1);

    return session ?? null;
  }

  async listActiveByUserAndApplication(userId: string, applicationId: string) {
    return this.databaseService.db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, userId),
          eq(sessions.applicationId, applicationId),
          isNull(sessions.revokedAt),
          gt(sessions.expiresAt, new Date()),
        ),
      )
      .orderBy(desc(sessions.lastUsedAt), desc(sessions.createdAt));
  }

  async revokeById(userId: string, applicationId: string, sessionId: string) {
    const revokedAt = new Date();
    const result = await this.databaseService.db
      .update(sessions)
      .set({ revokedAt })
      .where(
        and(
          eq(sessions.id, sessionId),
          eq(sessions.userId, userId),
          eq(sessions.applicationId, applicationId),
          isNull(sessions.revokedAt),
        ),
      )
      .returning({ id: sessions.id });

    return result.length > 0;
  }

  async revokeOthers(
    userId: string,
    applicationId: string,
    currentSessionId: string,
  ) {
    const revokedAt = new Date();
    const result = await this.databaseService.db
      .update(sessions)
      .set({ revokedAt })
      .where(
        and(
          eq(sessions.userId, userId),
          eq(sessions.applicationId, applicationId),
          ne(sessions.id, currentSessionId),
          isNull(sessions.revokedAt),
        ),
      )
      .returning({ id: sessions.id });

    return result.length;
  }
}
