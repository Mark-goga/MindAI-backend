import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ERROR_MESSAGES } from '@common/constants';
import { getAuthRequest } from '@common/utils';
import { JwtUtils } from '@modules/auth/jwt/jwt.utils';
import { SessionsRepository, UsersRepository } from '@modules/auth/repositories';
import { TokenType } from '@common/types';
import { verifyTokenHash } from '@modules/auth/utils';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly jwtUtils: JwtUtils,
    private readonly usersRepository: UsersRepository,
    private readonly sessionsRepository: SessionsRepository,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = getAuthRequest(context);
    const requestBody = request.body as { refreshToken?: unknown } | undefined;
    const refreshToken = requestBody?.refreshToken;

    if (typeof refreshToken !== 'string' || !refreshToken) {
      throw new UnauthorizedException(ERROR_MESSAGES.AUTH.REFRESH_TOKEN_REQUIRED);
    }

    const payload = this.jwtUtils.verifyToken(refreshToken, TokenType.REFRESH);
    const [user, session] = await Promise.all([
      this.usersRepository.findById(payload.sub),
      this.sessionsRepository.findActiveById(payload.sessionId),
    ]);

    if (!user) {
      throw new UnauthorizedException(ERROR_MESSAGES.USER.USER_NOT_FOUND);
    }

    if (
      !session ||
      session.userId !== user.id ||
      session.applicationId !== payload.applicationId ||
      !verifyTokenHash(refreshToken, session.tokenHash)
    ) {
      throw new UnauthorizedException(ERROR_MESSAGES.AUTH.SESSION_REVOKED);
    }

    request.auth = payload;
    request.user = user;
    request.session = session;
    request.refreshToken = refreshToken;
    return true;
  }
}
