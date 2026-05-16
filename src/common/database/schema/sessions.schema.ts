import {
  index,
  inet,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { createUuid } from '@common/utils/uuid.util';

export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').$defaultFn(createUuid).primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    applicationId: varchar('application_id', { length: 50 }).notNull(),
    platform: varchar('platform', { length: 20 }),
    tokenHash: text('token_hash').notNull(),
    deviceId: text('device_id'),
    userAgent: text('user_agent'),
    ipAddress: inet('ip_address'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
  },
  table => [
    index('sessions_user_application_idx').on(
      table.userId,
      table.applicationId,
    ),
    index('sessions_user_application_device_idx').on(
      table.userId,
      table.applicationId,
      table.deviceId,
    ),
  ],
);
