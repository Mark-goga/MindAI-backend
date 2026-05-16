import type { FastifyRequest } from 'fastify';

type SessionContextInput = {
  applicationId: string;
  platform?: string;
  deviceId?: string;
};

export type SessionRequestContext = {
  applicationId: string;
  platform: string | null;
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
    platform: input.platform?.trim() || null,
    deviceId: input.deviceId?.trim() || null,
    userAgent: request.headers['user-agent']?.trim() || null,
    ipAddress: request.ip || null,
  };
}
