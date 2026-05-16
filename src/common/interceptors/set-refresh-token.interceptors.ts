import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CONFIG, NODE_ENV } from '@common/constants';

@Injectable()
export class SetRefreshTokenInterceptor implements NestInterceptor {
  constructor(private readonly cookieOptions: Record<string, unknown> = {}) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      tap((data: any) => {
        const refreshToken = data?.refreshToken ?? data?.tokens?.refreshToken;
        if (!refreshToken) {
          return;
        }

        const response = context.switchToHttp().getResponse();
        const defaultOptions = {
          httpOnly: true,
          secure: CONFIG.NODE_ENV === NODE_ENV.PROD,
          sameSite: 'lax' as const,
          maxAge: CONFIG.JWT_REFRESH_TTL_SECONDS * 1000,
          path: '/',
        };

        if (typeof response.cookie === 'function') {
          response.cookie('refreshToken', refreshToken, {
            ...defaultOptions,
            ...this.cookieOptions,
          });
          return;
        }

        if (typeof response.setCookie === 'function') {
          response.setCookie('refreshToken', refreshToken, {
            ...defaultOptions,
            ...this.cookieOptions,
          });
        }
      }),
    );
  }
}
