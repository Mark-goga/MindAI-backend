import { Module } from '@nestjs/common';
import { AccessTokenGuard, RefreshTokenGuard } from '@common/guards';
import { JwtModule } from './jwt/jwt.module';
import { SessionsRepository, UsersRepository } from './repositories';
import { AuthService } from './auth.service';
import { AuthSessionsService } from './services/auth-sessions.service';

@Module({
  imports: [JwtModule],
  providers: [
    UsersRepository,
    SessionsRepository,
    AuthSessionsService,
    AuthService,
    AccessTokenGuard,
    RefreshTokenGuard,
  ],
  exports: [
    JwtModule,
    UsersRepository,
    SessionsRepository,
    AuthSessionsService,
    AuthService,
    AccessTokenGuard,
    RefreshTokenGuard,
  ],
})
export class AuthCoreModule {}
