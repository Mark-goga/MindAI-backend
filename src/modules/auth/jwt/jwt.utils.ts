import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { CONFIG, ERROR_MESSAGES } from '@common/constants';
import { JwtTokenPayload, TokenType } from '@common/types';

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

  createToken(payload: Omit<JwtTokenPayload, 'type'>, tokenType: TokenType): string {
    const { secret, expiresIn } = this.config[tokenType];
    return jwt.sign({ ...payload, type: tokenType }, secret, {
      expiresIn,
    });
  }

  createTokens(payload: Omit<JwtTokenPayload, 'type'>) {
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
        throw new UnauthorizedException(ERROR_MESSAGES.AUTH.INVALID_OR_EXPIRED_TOKEN);
      }

      return payload as JwtTokenPayload;
    } catch (error: any) {
      throw new UnauthorizedException(
        error?.message || ERROR_MESSAGES.AUTH.INVALID_OR_EXPIRED_TOKEN,
      );
    }
  }

  getRefreshTokenExpiresAt() {
    return new Date(Date.now() + CONFIG.JWT_REFRESH_TTL_SECONDS * 1000);
  }
}
