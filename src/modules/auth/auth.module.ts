import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { SessionsModule } from '@modules/auth/sessions/sessions.module';
import { AuthService } from '@modules/auth/auth.service';
import { UsersModule } from '@modules/users/users.module';

@Module({
  imports: [UsersModule, SessionsModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
