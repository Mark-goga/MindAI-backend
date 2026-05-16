import { ConflictException, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '@common/database/database.service';
import { users } from '@common/database/schema';
import { ERROR_MESSAGES } from '@common/constants';

@Injectable()
export class UsersRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(input: typeof users.$inferInsert) {
    try {
      const [user] = await this.databaseService.db.insert(users).values(input).returning();

      return user;
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new ConflictException(ERROR_MESSAGES.USER.EMAIL_ALREADY_EXISTS);
      }
      throw error;
    }
  }

  async findByEmail(email: string) {
    const [user] = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user ?? null;
  }

  async findById(id: string) {
    const [user] = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user ?? null;
  }
}
