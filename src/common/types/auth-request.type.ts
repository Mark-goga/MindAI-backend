import type { FastifyRequest } from 'fastify';
import type {
  JwtSessionPayload,
  JwtTokenPayload,
  JwtUserPayload,
} from './jwt-payload.type';

export type AuthenticatedUser = JwtUserPayload;
export type AuthenticatedSession = JwtSessionPayload;

export type AuthenticatedRequest = FastifyRequest & {
  auth: JwtTokenPayload;
  user: AuthenticatedUser;
  session: AuthenticatedSession;
  refreshToken?: string;
  cookies: Record<string, string>;
};
