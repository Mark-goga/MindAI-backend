import { ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from '@common/types';

export function getAuthRequest(
  context: ExecutionContext,
): AuthenticatedRequest {
  return context.switchToHttp().getRequest<AuthenticatedRequest>();
}
