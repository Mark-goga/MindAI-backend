import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ERROR_MESSAGES } from '@common/constants';
import type {
  AuthenticatedSession,
  AuthenticatedUser,
  JwtSessionPayload,
} from '@common/types';
import { JwtUtils } from '@modules/auth/jwt/jwt.utils';
import {
  hashToken,
  SessionRequestContext,
  verifyTokenHash,
} from '@modules/auth/utils';
import { SessionsRepository } from '@modules/auth/sessions/sessions.repository';

@Injectable()
export class SessionsService {
  constructor(
    private readonly sessionsRepository: SessionsRepository,
    private readonly jwtUtils: JwtUtils,
  ) {}

  async createOrReuse(user: AuthenticatedUser, context: SessionRequestContext) {
    const reusableSession =
      context.deviceId == null
        ? null
        : await this.sessionsRepository.findReusableActiveSession(
            user.id,
            context.applicationId,
            context.deviceId,
          );

    const sessionId = reusableSession?.id ?? randomUUID();
    const now = new Date();
    const expiresAt = this.jwtUtils.getRefreshTokenExpiresAt();
    const sessionPayload = this.buildSessionPayload({
      id: sessionId,
      userId: user.id,
      ...context,
      createdAt: reusableSession?.createdAt ?? now,
      lastUsedAt: now,
      expiresAt,
    });
    const tokens = this.jwtUtils.createTokens({
      user,
      session: sessionPayload,
    });
    const sharedData = {
      userId: user.id,
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
          createdAt: now,
          ...sharedData,
        });

    if (!session) {
      throw new NotFoundException(ERROR_MESSAGES.AUTH.SESSION_NOT_FOUND);
    }

    return { session, tokens };
  }

  async rotate(
    user: AuthenticatedUser,
    session: AuthenticatedSession,
    refreshToken: string,
    context: Pick<SessionRequestContext, 'userAgent' | 'ipAddress'>,
  ) {
    const storedSession = await this.sessionsRepository.findActiveById(
      session.id,
    );

    if (
      !storedSession ||
      storedSession.userId !== user.id ||
      storedSession.applicationId !== session.applicationId ||
      !verifyTokenHash(refreshToken, storedSession.tokenHash)
    ) {
      throw new UnauthorizedException(ERROR_MESSAGES.AUTH.SESSION_REVOKED);
    }

    const lastUsedAt = new Date();
    const expiresAt = this.jwtUtils.getRefreshTokenExpiresAt();
    const nextSessionPayload = this.buildSessionPayload({
      ...storedSession,
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
      lastUsedAt,
      expiresAt,
    });
    const tokens = this.jwtUtils.createTokens({
      user,
      session: nextSessionPayload,
    });
    const updatedSession = await this.sessionsRepository.updateById(
      session.id,
      {
        tokenHash: hashToken(tokens.refreshToken),
        userAgent: context.userAgent,
        ipAddress: context.ipAddress,
        lastUsedAt,
        expiresAt,
        revokedAt: null,
      },
    );

    if (!updatedSession) {
      throw new NotFoundException(ERROR_MESSAGES.AUTH.SESSION_NOT_FOUND);
    }

    return { session: updatedSession, tokens };
  }

  async listForApplication(
    userId: string,
    applicationId: string,
    currentSessionId: string,
  ) {
    const sessions =
      await this.sessionsRepository.listActiveByUserAndApplication(
        userId,
        applicationId,
      );

    return sessions.map(session => ({
      ...session,
      current: session.id === currentSessionId,
    }));
  }

  async revokeOne(userId: string, applicationId: string, sessionId: string) {
    const isRevoked = await this.sessionsRepository.revokeById(
      userId,
      applicationId,
      sessionId,
    );

    if (!isRevoked) {
      throw new NotFoundException(ERROR_MESSAGES.AUTH.SESSION_NOT_FOUND);
    }
  }

  async revokeOthers(
    userId: string,
    applicationId: string,
    currentSessionId: string,
  ) {
    return this.sessionsRepository.revokeOthers(
      userId,
      applicationId,
      currentSessionId,
    );
  }

  private buildSessionPayload(
    session: Pick<
      JwtSessionPayload,
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
    >,
  ): JwtSessionPayload {
    return {
      id: session.id,
      userId: session.userId,
      applicationId: session.applicationId,
      platform: session.platform,
      deviceId: session.deviceId,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt,
      lastUsedAt: session.lastUsedAt,
      expiresAt: session.expiresAt,
    };
  }
}
