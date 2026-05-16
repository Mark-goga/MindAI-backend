import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthCoreModule } from './auth-core.module';
import { SessionsModule } from './sub-modules/sessions/sessions.module';

@Module({
  imports: [AuthCoreModule, SessionsModule],
  controllers: [AuthController],
})
export class AuthModule {}
