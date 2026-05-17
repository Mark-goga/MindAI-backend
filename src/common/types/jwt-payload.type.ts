import type { sessions, users } from '@common/database/schema';

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

export type JwtUserPayload = Pick<
  typeof users.$inferSelect,
  'id' | 'email' | 'name' | 'role' | 'createdAt' | 'updatedAt'
>;

export type JwtSessionPayload = Pick<
  typeof sessions.$inferSelect,
  | 'id'
  | 'userId'
  | 'applicationId'
  | 'platform'
  | 'deviceId'
  | 'userAgent'
  | 'ipAddress'
  | 'createdAt'
  | 'lastUsedAt'
  | 'expiresAt'
>;

export type JwtTokenPayload = {
  sub: string;
  user: JwtUserPayload;
  session: JwtSessionPayload;
  type: TokenType;
  iat?: number;
  exp?: number;
};
