import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ERROR_MESSAGES } from '@common/constants';
import { getAuthRequest, verifyToken } from '@common/utils';
import { TokenType } from '@common/types';

export class RefreshTokenGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = getAuthRequest(context);
    const requestBody = request.body as { refreshToken?: unknown } | undefined;
    const refreshToken = requestBody?.refreshToken;

    if (typeof refreshToken !== 'string' || !refreshToken) {
      throw new UnauthorizedException(
        ERROR_MESSAGES.AUTH.REFRESH_TOKEN_REQUIRED,
      );
    }

    const payload = verifyToken(refreshToken, TokenType.REFRESH);
    request.auth = payload;
    request.user = payload.user;
    request.session = payload.session;
    request.refreshToken = refreshToken;
    return true;
  }
}
