import { faker } from '@faker-js/faker';
import { eq } from 'drizzle-orm';
import { users } from '@common/database/schema';
import { hashPassword } from '@modules/auth/utils';
import { SEED_RECORD_QUANTITY, SeedContext, SeedUser } from './seed-shared';

export async function seedUsers(context: SeedContext): Promise<SeedUser[]> {
  console.log(`Seeding ${SEED_RECORD_QUANTITY} demo users...`);

  const seededUsers: SeedUser[] = [];

  for (let index = 1; index <= SEED_RECORD_QUANTITY; index += 1) {
    const now = new Date();
    const passwordHash = hashPassword('password123');
    const name = faker.person.fullName();
    const firstName = name.split(' ')[0];
    const lastName = name.split(' ').slice(1).join(' ');
    const email = faker.internet.email({ firstName, lastName });

    const [user] = await context.db
      .insert(users)
      .values({
        email,
        name,
        passwordHash,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          name,
          passwordHash,
          updatedAt: now,
        },
      })
      .returning();

    const [freshUser] = await context.db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!freshUser) {
      throw new Error(`User '${email}' was not found after seeding.`);
    }

    seededUsers.push(freshUser);
  }

  return seededUsers;
}
