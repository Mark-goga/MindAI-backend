import type { FastifyRequest } from 'fastify';
import type { sessions, users } from '@common/database/schema';
import type { JwtTokenPayload } from './jwt-payload.type';

export type AuthenticatedUser = typeof users.$inferSelect;
export type AuthenticatedSession = typeof sessions.$inferSelect;

export type AuthenticatedRequest = FastifyRequest & {
  auth: JwtTokenPayload;
  user: AuthenticatedUser;
  session: AuthenticatedSession;
  refreshToken?: string;
};
