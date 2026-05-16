import { Module } from '@nestjs/common';
import { AuthCoreModule } from '@modules/auth/auth-core.module';
import { SessionsController } from './sessions.controller';

@Module({
  imports: [AuthCoreModule],
  controllers: [SessionsController],
})
export class SessionsModule {}
