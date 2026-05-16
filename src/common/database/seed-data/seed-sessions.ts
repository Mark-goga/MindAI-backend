import { faker } from '@faker-js/faker';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { sessions } from '@common/database/schema';
import type { JwtSessionPayload } from '@common/types';
import { createTokens, getRefreshTokenExpiresAt } from '@common/utils';
import { hashToken } from '@modules/auth/utils';
import {
  MAX_SESSIONS_PER_USER,
  MIN_SESSIONS_PER_USER,
  SESSION_APPLICATIONS,
} from './seed-constants';
import type { SeedContext, SeedUser } from './seed-shared';

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

function buildSessionInsert(user: SeedUser): typeof sessions.$inferInsert {
  const application = faker.helpers.arrayElement(SESSION_APPLICATIONS);
  const createdAt = faker.date.past({ years: 1 });
  const lastUsedAt = faker.date.between({
    from: createdAt,
    to: new Date(),
  });

  return {
    userId: user.id,
    applicationId: application.applicationId,
    platform: faker.helpers.maybe(() => application.platform, {
      probability: 0.85,
    }),
    tokenHash: '__pending__',
    deviceId: faker.helpers.maybe(
      () => faker.string.alphanumeric({ length: 24 }),
      {
        probability: 0.9,
      },
    ),
    userAgent: faker.helpers.maybe(() => faker.internet.userAgent(), {
      probability: 0.95,
    }),
    ipAddress: faker.helpers.maybe(() => faker.internet.ip(), {
      probability: 0.85,
    }),
    createdAt,
    lastUsedAt,
    expiresAt: getRefreshTokenExpiresAt(),
    revokedAt: null,
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

  const seedApplicationIds = SESSION_APPLICATIONS.map(
    item => item.applicationId,
  );

  await context.db.delete(sessions).where(
    and(
      inArray(
        sessions.userId,
        seededUsers.map(user => user.id),
      ),
      inArray(sessions.applicationId, seedApplicationIds),
    ),
  );

  const rowsToInsert: typeof sessions.$inferInsert[] = [];

  for (const user of seededUsers) {
    const sessionsCount = faker.number.int({
      min: MIN_SESSIONS_PER_USER,
      max: MAX_SESSIONS_PER_USER,
    });

    for (let index = 0; index < sessionsCount; index += 1) {
      rowsToInsert.push(buildSessionInsert(user));
    }
  }

  if (rowsToInsert.length === 0) {
    return 0;
  }

  const usersById = new Map(seededUsers.map(user => [user.id, user] as const));

  const createdSessions = await context.db
    .insert(sessions)
    .values(rowsToInsert)
    .returning();

  await Promise.all(
    createdSessions.map(async createdSession => {
      const user = usersById.get(createdSession.userId);

      if (!user) {
        throw new Error(
          `User '${createdSession.userId}' was not found for session seeding.`,
        );
      }

      const tokens = createTokens({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        session: buildSessionPayload(createdSession),
      });

      await context.db
        .update(sessions)
        .set({
          tokenHash: hashToken(tokens.refreshToken),
        })
        .where(eq(sessions.id, createdSession.id));
    }),
  );

  const insertedSessions = await context.db
    .select({ id: sessions.id })
    .from(sessions)
    .where(
      and(
        inArray(
          sessions.userId,
          seededUsers.map(user => user.id),
        ),
        inArray(sessions.applicationId, seedApplicationIds),
        isNull(sessions.revokedAt),
      ),
    );

  return insertedSessions.length;
}
