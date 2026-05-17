import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  boolean,
  jsonb,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { createUuid } from '@common/utils/uuid.util';

export const platformEnum = pgEnum('platform', [
  'ios',
  'android',
  'desktop_win',
  'desktop_mac',
  'web',
]);

export const releases = pgTable(
  'releases',
  {
    id: uuid('id').$defaultFn(createUuid).primaryKey(),
    appId: varchar('app_id', { length: 50 }).notNull(),
    platform: platformEnum('platform').notNull(),
    version: varchar('version', { length: 30 }).notNull(),
    minVersion: varchar('min_version', { length: 30 }).notNull(),
    isMandatory: boolean('is_mandatory').default(false).notNull(),
    downloadUrl: text('download_url'),
    storeUrl: text('store_url'),
    releaseNotes: jsonb('release_notes').$type<Record<string, string>>(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  table => [
    index('releases_app_platform_idx').on(table.appId, table.platform),
    uniqueIndex('releases_app_platform_version_unique').on(
      table.appId,
      table.platform,
      table.version,
    ),
  ],
);
