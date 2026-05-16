import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ERROR_MESSAGES } from '@common/constants';
import { getAuthRequest, verifyToken } from '@common/utils';
import { TokenType } from '@common/types';

export class AccessTokenGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = getAuthRequest(context);
    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException(
        ERROR_MESSAGES.AUTH.AUTHORIZATION_NOT_FOUND,
      );
    }

    const [scheme, token] = authorization.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException(
        ERROR_MESSAGES.AUTH.AUTHORIZATION_INVALID,
      );
    }

    const payload = verifyToken(token, TokenType.ACCESS);

    request.auth = payload;
    request.user = payload.user;
    request.session = payload.session;
    return true;
  }
}
