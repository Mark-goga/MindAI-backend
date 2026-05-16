import { seedSessions } from './seed-sessions';
import { createSeedContext } from './seed-shared';
import { seedUsers } from './seed-users';

async function main() {
  const context = createSeedContext();

  try {
    console.log('Seeding started...');

    const users = await seedUsers(context);
    await seedSessions(context, users);

    console.log('Seeding finished.');
  } finally {
    await context.close();
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
