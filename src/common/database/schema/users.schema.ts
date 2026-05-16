import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  text,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { createUuid } from '@common/utils/uuid.util';

export const users = pgTable(
  'users',
  {
    id: uuid('id').$defaultFn(createUuid).primaryKey(),
    email: varchar('email', { length: 320 }).notNull(),
    name: varchar('name', { length: 120 }).notNull(),
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  table => [uniqueIndex('users_email_unique').on(table.email)],
);
