import type { FastifyRequest } from 'fastify';
import type { Platform } from '@common/database/schema';

type SessionContextInput = {
  applicationId: string;
  platform?: Platform;
  deviceId?: string;
};

export type SessionRequestContext = {
  applicationId: string;
  platform: Platform | null;
  deviceId: string | null;
  userAgent: string | null;
  ipAddress: string | null;
};

export function buildSessionRequestContext(
  request: FastifyRequest,
  input: SessionContextInput,
): SessionRequestContext {
  return {
    applicationId: input.applicationId,
    platform: input.platform ?? null,
    deviceId: input.deviceId?.trim() || null,
    userAgent: request.headers['user-agent']?.trim() || null,
    ipAddress: request.ip || null,
  };
}
