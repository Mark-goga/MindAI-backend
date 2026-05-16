import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getAuthRequest } from '@common/utils';

export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    return getAuthRequest(context).user;
  },
);
