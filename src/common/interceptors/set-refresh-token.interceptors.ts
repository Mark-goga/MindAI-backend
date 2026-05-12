import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CONFIG, NODE_ENV } from '@common/constants';

@Injectable()
export class SetRefreshTokenInterceptor implements NestInterceptor {
  constructor(private readonly cookieOptions: any = {}) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(data => {
        if (data && data.refreshToken) {
          const response = context.switchToHttp().getResponse();

          const defaultOptions = {
            httpOnly: true,
            secure: CONFIG.NODE_ENV === NODE_ENV.PROD,
            maxAge: 30 * 24 * 60 * 60 * 7,
            path: '/',
          };

          if (typeof response.cookie === 'function') {
            response.cookie('refreshToken', data.refreshToken, {
              ...defaultOptions,
              ...this.cookieOptions,
            });
          } else if (typeof response.setCookie === 'function') {
            response.setCookie('refreshToken', data.refreshToken, {
              ...defaultOptions,
              ...this.cookieOptions,
            });
          }
        }
      }),
    );
  }
}
