import { PrismaClient, Role, Status } from '@prisma/client';
import { Crypto } from '../../../modules/auth/utils';

const prisma = new PrismaClient();
export const seedAdmin = async () => {
  console.log('Seeding admin...');
  const admin = {
    firstName: 'Admin',
    lastName: 'Admin',
    email: 'admin@admin.com',
    password: Crypto.encrypt('password123'),
    role: Role.ADMIN,
    status: Status.APPROVED,
  };
  await prisma.user.upsert({
    where: {
      email: admin.email,
    },
    update: admin,
    create: admin,
  });
};
