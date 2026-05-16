import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ERROR_MESSAGES } from '@common/constants';
import { AuthenticatedSession } from '@common/types';
import { JwtUtils } from '@modules/auth/jwt/jwt.utils';
import { SessionsRepository } from '@modules/auth/repositories';
import { hashToken, SessionRequestContext } from '@modules/auth/utils';

@Injectable()
export class AuthSessionsService {
  constructor(
    private readonly sessionsRepository: SessionsRepository,
    private readonly jwtUtils: JwtUtils,
  ) {}

  async createOrReuse(userId: string, context: SessionRequestContext) {
    const reusableSession =
      context.deviceId == null
        ? null
        : await this.sessionsRepository.findReusableActiveSession(
            userId,
            context.applicationId,
            context.deviceId,
          );

    const sessionId = reusableSession?.id ?? randomUUID();
    const tokens = this.jwtUtils.createTokens({
      sub: userId,
      sessionId,
      applicationId: context.applicationId,
    });
    const now = new Date();
    const expiresAt = this.jwtUtils.getRefreshTokenExpiresAt();
    const sharedData = {
      userId,
      applicationId: context.applicationId,
      platform: context.platform,
      tokenHash: hashToken(tokens.refreshToken),
      deviceId: context.deviceId,
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
      lastUsedAt: now,
      expiresAt,
      revokedAt: null,
    } as const;

    const session = reusableSession
      ? await this.sessionsRepository.updateById(sessionId, sharedData)
      : await this.sessionsRepository.create({
          id: sessionId,
          ...sharedData,
        });

    if (!session) {
      throw new NotFoundException(ERROR_MESSAGES.AUTH.SESSION_NOT_FOUND);
    }

    return { session, tokens };
  }

  async rotate(
    session: AuthenticatedSession,
    context: Pick<SessionRequestContext, 'userAgent' | 'ipAddress'>,
  ) {
    const tokens = this.jwtUtils.createTokens({
      sub: session.userId,
      sessionId: session.id,
      applicationId: session.applicationId,
    });

    const updatedSession = await this.sessionsRepository.updateById(session.id, {
      tokenHash: hashToken(tokens.refreshToken),
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
      lastUsedAt: new Date(),
      expiresAt: this.jwtUtils.getRefreshTokenExpiresAt(),
      revokedAt: null,
    });

    if (!updatedSession) {
      throw new NotFoundException(ERROR_MESSAGES.AUTH.SESSION_NOT_FOUND);
    }

    return { session: updatedSession, tokens };
  }

  async listForApplication(userId: string, applicationId: string, currentSessionId: string) {
    const sessions = await this.sessionsRepository.listActiveByUserAndApplication(
      userId,
      applicationId,
    );

    return sessions.map(session => ({
      ...session,
      current: session.id === currentSessionId,
    }));
  }

  async revokeOne(userId: string, applicationId: string, sessionId: string) {
    const isRevoked = await this.sessionsRepository.revokeById(userId, applicationId, sessionId);

    if (!isRevoked) {
      throw new NotFoundException(ERROR_MESSAGES.AUTH.SESSION_NOT_FOUND);
    }
  }

  async revokeOthers(userId: string, applicationId: string, currentSessionId: string) {
    return this.sessionsRepository.revokeOthers(userId, applicationId, currentSessionId);
  }
}
