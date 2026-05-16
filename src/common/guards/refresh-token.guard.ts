import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ERROR_MESSAGES } from '@common/constants';
import { getAuthRequest } from '@common/utils';
import { JwtUtils } from '@modules/auth/jwt/jwt.utils';
import { TokenType } from '@common/types';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private readonly jwtUtils: JwtUtils) {}

  async canActivate(context: ExecutionContext) {
    const request = getAuthRequest(context);
    const requestBody = request.body as { refreshToken?: unknown } | undefined;
    const refreshToken = requestBody?.refreshToken;

    if (typeof refreshToken !== 'string' || !refreshToken) {
      throw new UnauthorizedException(
        ERROR_MESSAGES.AUTH.REFRESH_TOKEN_REQUIRED,
      );
    }

    const payload = this.jwtUtils.verifyToken(refreshToken, TokenType.REFRESH);
    request.auth = payload;
    request.user = payload.user;
    request.session = payload.session;
    request.refreshToken = refreshToken;
    return true;
  }
}
