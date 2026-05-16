import { and, eq, inArray, isNull } from 'drizzle-orm';
import { sessions } from '@common/database/schema';
import type { JwtSessionPayload } from '@common/types';
import { createTokens, getRefreshTokenExpiresAt } from '@common/utils';
import { hashToken } from '@modules/auth/utils';
import type { SeedContext, SeedUser } from './seed-shared';

const APPLICATION_IDS = ['seed.web', 'seed.mobile'] as const;

function buildSessionPayload(
  session: typeof sessions.$inferSelect,
): JwtSessionPayload {
  return {
    id: session.id,
    userId: session.userId,
    applicationId: session.applicationId,
    platform: session.platform,
    deviceId: session.deviceId,
    userAgent: session.userAgent,
    ipAddress: session.ipAddress,
    createdAt: session.createdAt,
    lastUsedAt: session.lastUsedAt,
    expiresAt: session.expiresAt,
  };
}

export async function seedSessions(
  context: SeedContext,
  seededUsers: SeedUser[],
): Promise<number> {
  if (seededUsers.length === 0) {
    return 0;
  }

  console.log(`Seeding sessions for ${seededUsers.length} users...`);

  await context.db.delete(sessions).where(
    and(
      inArray(
        sessions.userId,
        seededUsers.map(user => user.id),
      ),
      inArray(sessions.applicationId, [...APPLICATION_IDS]),
    ),
  );

  let insertedSessionsCount = 0;

  for (const [userIndex, user] of seededUsers.entries()) {
    for (const [appIndex, applicationId] of APPLICATION_IDS.entries()) {
      const now = new Date();
      const createdSession = await context.db
        .insert(sessions)
        .values({
          userId: user.id,
          applicationId,
          platform: applicationId === 'seed.mobile' ? 'ios' : 'web',
          tokenHash: '__pending__',
          deviceId: `${applicationId}-device-${
            userIndex * APPLICATION_IDS.length + appIndex + 1
          }`,
          userAgent:
            applicationId === 'seed.mobile'
              ? 'MindAI Seed iOS App'
              : 'MindAI Seed Browser',
          ipAddress: `127.0.0.${Math.min(
            userIndex * APPLICATION_IDS.length + appIndex + 11,
            250,
          )}`,
          createdAt: now,
          lastUsedAt: now,
          expiresAt: getRefreshTokenExpiresAt(),
          revokedAt: null,
        })
        .returning()
        .then(result => result[0] ?? null);

      if (!createdSession) {
        throw new Error('Session was not created during seeding.');
      }

      const sessionPayload = buildSessionPayload(createdSession);
      const tokens = createTokens({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        session: sessionPayload,
      });

      await context.db
        .update(sessions)
        .set({
          tokenHash: hashToken(tokens.refreshToken),
        })
        .where(eq(sessions.id, createdSession.id));

      insertedSessionsCount += 1;
    }
  }

  const insertedSessions = await context.db
    .select({ id: sessions.id })
    .from(sessions)
    .where(
      and(
        inArray(
          sessions.userId,
          seededUsers.map(user => user.id),
        ),
        inArray(sessions.applicationId, [...APPLICATION_IDS]),
        isNull(sessions.revokedAt),
      ),
    );

  return Math.max(insertedSessions.length, insertedSessionsCount);
}
