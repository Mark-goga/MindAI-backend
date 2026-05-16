import { Module } from '@nestjs/common';
import { AccessTokenGuard, RefreshTokenGuard } from '@common/guards';
import { JwtModule } from './jwt/jwt.module';

@Module({
  imports: [JwtModule],
  providers: [AccessTokenGuard, RefreshTokenGuard],
  exports: [JwtModule, AccessTokenGuard, RefreshTokenGuard],
})
export class AuthContextModule {}
