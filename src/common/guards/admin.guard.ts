import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ERROR_MESSAGES } from '@common/constants';
import { getAuthRequest } from '@common/utils';

export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = getAuthRequest(context);

    if (request.user?.role !== 'admin') {
      throw new ForbiddenException(ERROR_MESSAGES.RELEASES.FORBIDDEN);
    }

    return true;
  }
}
