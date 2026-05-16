import { seedSessions } from './seed-sessions';
import { createSeedContext } from './seed-shared';
import { seedUsers } from './seed-users';

const seeders = {
  users: async () => {
    const context = createSeedContext();
    try {
      await seedUsers(context);
    } finally {
      await context.close();
    }
  },
  sessions: async () => {
    const context = createSeedContext();
    try {
      const users = await seedUsers(context);
      await seedSessions(context, users);
    } finally {
      await context.close();
    }
  },
  all: async () => {
    const context = createSeedContext();
    try {
      const users = await seedUsers(context);
      await seedSessions(context, users);
    } finally {
      await context.close();
    }
  },
} as const;

async function main() {
  const target = process.argv[2]?.trim().toLowerCase() ?? 'all';
  const seeder = seeders[target as keyof typeof seeders];

  if (!seeder) {
    console.error(`Unknown seed target: '${target}'.`);
    console.error(
      `Available targets: ${Object.keys(seeders).sort().join(', ')}`,
    );
    process.exit(1);
  }

  console.log(`Running seed target '${target}'...`);
  await seeder();
  console.log(`Seed target '${target}' completed.`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
