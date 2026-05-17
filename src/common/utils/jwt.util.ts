import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { z } from 'zod';
import { CONFIG, ERROR_MESSAGES } from '@common/constants';
import { PLATFORM_VALUES, USER_ROLE_VALUES } from '@common/database/schema';
import {
  JwtSessionPayload,
  JwtTokenPayload,
  JwtUserPayload,
  TokenType,
} from '@common/types';

const dateSchema = z.coerce.date();

const jwtUserPayloadSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string().min(1),
  role: z.enum(USER_ROLE_VALUES),
  createdAt: dateSchema,
  updatedAt: dateSchema,
}) satisfies z.ZodType<JwtUserPayload>;

const jwtSessionPayloadSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  applicationId: z.string().min(1),
  platform: z.enum(PLATFORM_VALUES).nullable(),
  deviceId: z.string().nullable(),
  userAgent: z.string().nullable(),
  ipAddress: z.string().nullable(),
  createdAt: dateSchema,
  lastUsedAt: dateSchema,
  expiresAt: dateSchema,
}) satisfies z.ZodType<JwtSessionPayload>;

const jwtTokenPayloadSchema = z
  .object({
    sub: z.uuid(),
    user: jwtUserPayloadSchema,
    session: jwtSessionPayloadSchema,
    type: z.nativeEnum(TokenType),
    iat: z.number().optional(),
    exp: z.number().optional(),
  })
  .superRefine((payload, context) => {
    if (payload.sub !== payload.user.id) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Token subject must match user id.',
        path: ['sub'],
      });
    }

    if (payload.session.userId !== payload.user.id) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Session user id must match user id.',
        path: ['session', 'userId'],
      });
    }
  }) satisfies z.ZodType<JwtTokenPayload>;

const jwtConfig = {
  access: {
    secret: CONFIG.JWT_ACCESS_SECRET,
    expiresIn: CONFIG.JWT_ACCESS_TTL_SECONDS,
  },
  refresh: {
    secret: CONFIG.JWT_REFRESH_SECRET,
    expiresIn: CONFIG.JWT_REFRESH_TTL_SECONDS,
  },
} as const;

export function createToken(
  payload: Omit<JwtTokenPayload, 'type' | 'iat' | 'exp'>,
  tokenType: TokenType,
): string {
  const { secret, expiresIn } = jwtConfig[tokenType];
  return jwt.sign({ ...payload, type: tokenType }, secret, {
    expiresIn,
  });
}

export function createTokens(input: {
  user: JwtUserPayload;
  session: JwtSessionPayload;
}) {
  const payload = {
    sub: input.user.id,
    user: input.user,
    session: input.session,
  } as const;

  return {
    accessToken: createToken(payload, TokenType.ACCESS),
    refreshToken: createToken(payload, TokenType.REFRESH),
  };
}

export function verifyToken(
  token: string,
  tokenType: TokenType,
): JwtTokenPayload {
  try {
    const { secret } = jwtConfig[tokenType];
    const payload = jwt.verify(token, secret);

    if (typeof payload === 'string') {
      throw new UnauthorizedException(
        ERROR_MESSAGES.AUTH.INVALID_OR_EXPIRED_TOKEN,
      );
    }

    const parsedPayload = jwtTokenPayloadSchema.safeParse(payload);

    if (!parsedPayload.success || parsedPayload.data.type !== tokenType) {
      throw new UnauthorizedException(
        ERROR_MESSAGES.AUTH.INVALID_OR_EXPIRED_TOKEN,
      );
    }

    return parsedPayload.data;
  } catch (error: any) {
    throw new UnauthorizedException(
      error?.message || ERROR_MESSAGES.AUTH.INVALID_OR_EXPIRED_TOKEN,
    );
  }
}

export function getRefreshTokenExpiresAt() {
  return new Date(Date.now() + CONFIG.JWT_REFRESH_TTL_SECONDS * 1000);
}
