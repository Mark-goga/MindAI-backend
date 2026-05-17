import { pgEnum } from 'drizzle-orm/pg-core';

export const PLATFORM_VALUES = [
  'ios',
  'android',
  'desktop_win',
  'desktop_mac',
  'web',
] as const;
export type Platform = (typeof PLATFORM_VALUES)[number];
export const platformEnum = pgEnum('platform', PLATFORM_VALUES);

export const USER_ROLE_VALUES = ['admin', 'customer'] as const;
export type UserRole = (typeof USER_ROLE_VALUES)[number];
export const userRoleEnum = pgEnum('user_role', USER_ROLE_VALUES);
