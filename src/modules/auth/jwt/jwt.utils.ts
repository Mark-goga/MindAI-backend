import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { CONFIG, ERROR_MESSAGES } from '@common/constants';
import {
  JwtSessionPayload,
  JwtTokenPayload,
  JwtUserPayload,
  TokenType,
} from '@common/types';

@Injectable()
export class JwtUtils {
  private readonly config = {
    [TokenType.ACCESS]: {
      secret: CONFIG.JWT_ACCESS_SECRET,
      expiresIn: CONFIG.JWT_ACCESS_TTL_SECONDS,
    },
    [TokenType.REFRESH]: {
      secret: CONFIG.JWT_REFRESH_SECRET,
      expiresIn: CONFIG.JWT_REFRESH_TTL_SECONDS,
    },
  } as const;

  createToken(
    payload: Omit<JwtTokenPayload, 'type' | 'iat' | 'exp'>,
    tokenType: TokenType,
  ): string {
    const { secret, expiresIn } = this.config[tokenType];
    return jwt.sign({ ...payload, type: tokenType }, secret, {
      expiresIn,
    });
  }

  createTokens(input: { user: JwtUserPayload; session: JwtSessionPayload }) {
    const payload = {
      sub: input.user.id,
      user: input.user,
      session: input.session,
    } as const;

    return {
      accessToken: this.createToken(payload, TokenType.ACCESS),
      refreshToken: this.createToken(payload, TokenType.REFRESH),
    };
  }

  verifyToken(token: string, tokenType: TokenType): JwtTokenPayload {
    try {
      const { secret } = this.config[tokenType];
      const payload = jwt.verify(token, secret);

      if (typeof payload === 'string' || payload.type !== tokenType) {
        throw new UnauthorizedException(
          ERROR_MESSAGES.AUTH.INVALID_OR_EXPIRED_TOKEN,
        );
      }

      return this.normalizePayload(payload as Record<string, unknown>);
    } catch (error: any) {
      throw new UnauthorizedException(
        error?.message || ERROR_MESSAGES.AUTH.INVALID_OR_EXPIRED_TOKEN,
      );
    }
  }

  getRefreshTokenExpiresAt() {
    return new Date(Date.now() + CONFIG.JWT_REFRESH_TTL_SECONDS * 1000);
  }

  private normalizePayload(
    rawPayload: Record<string, unknown>,
  ): JwtTokenPayload {
    const user = rawPayload.user;
    const session = rawPayload.session;

    if (
      typeof rawPayload.sub !== 'string' ||
      !user ||
      typeof user !== 'object' ||
      !session ||
      typeof session !== 'object'
    ) {
      throw new UnauthorizedException(
        ERROR_MESSAGES.AUTH.INVALID_OR_EXPIRED_TOKEN,
      );
    }

    const normalizedUser = this.normalizeUser(user as Record<string, unknown>);
    const normalizedSession = this.normalizeSession(
      session as Record<string, unknown>,
    );

    if (normalizedSession.userId !== normalizedUser.id) {
      throw new UnauthorizedException(ERROR_MESSAGES.AUTH.SESSION_REVOKED);
    }

    return {
      sub: rawPayload.sub,
      user: normalizedUser,
      session: normalizedSession,
      type: rawPayload.type as TokenType,
      iat: typeof rawPayload.iat === 'number' ? rawPayload.iat : undefined,
      exp: typeof rawPayload.exp === 'number' ? rawPayload.exp : undefined,
    };
  }

  private normalizeUser(rawUser: Record<string, unknown>): JwtUserPayload {
    if (
      typeof rawUser.id !== 'string' ||
      typeof rawUser.email !== 'string' ||
      typeof rawUser.name !== 'string'
    ) {
      throw new UnauthorizedException(
        ERROR_MESSAGES.AUTH.INVALID_OR_EXPIRED_TOKEN,
      );
    }

    return {
      id: rawUser.id,
      email: rawUser.email,
      name: rawUser.name,
      createdAt: this.asDate(rawUser.createdAt),
      updatedAt: this.asDate(rawUser.updatedAt),
    };
  }

  private normalizeSession(
    rawSession: Record<string, unknown>,
  ): JwtSessionPayload {
    if (
      typeof rawSession.id !== 'string' ||
      typeof rawSession.applicationId !== 'string' ||
      typeof rawSession.userId !== 'string'
    ) {
      throw new UnauthorizedException(
        ERROR_MESSAGES.AUTH.INVALID_OR_EXPIRED_TOKEN,
      );
    }

    return {
      id: rawSession.id,
      applicationId: rawSession.applicationId,
      platform:
        typeof rawSession.platform === 'string' ? rawSession.platform : null,
      deviceId:
        typeof rawSession.deviceId === 'string' ? rawSession.deviceId : null,
      userAgent:
        typeof rawSession.userAgent === 'string' ? rawSession.userAgent : null,
      ipAddress:
        typeof rawSession.ipAddress === 'string' ? rawSession.ipAddress : null,
      userId: rawSession.userId,
      createdAt: this.asDate(rawSession.createdAt),
      lastUsedAt: this.asDate(rawSession.lastUsedAt),
      expiresAt: this.asDate(rawSession.expiresAt),
    };
  }

  private asDate(value: unknown): Date {
    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'string' || typeof value === 'number') {
      const parsedDate = new Date(value);

      if (!Number.isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }

    throw new UnauthorizedException(
      ERROR_MESSAGES.AUTH.INVALID_OR_EXPIRED_TOKEN,
    );
  }
}
