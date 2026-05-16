import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { SessionsService } from '@modules/auth/sessions/sessions.service';
import { SessionsRepository } from '@modules/auth/sessions/sessions.repository';
import { AuthContextModule } from '@modules/auth/auth-context.module';

@Module({
  imports: [AuthContextModule],
  controllers: [SessionsController],
  providers: [SessionsService, SessionsRepository],
  exports: [SessionsService],
})
export class SessionsModule {}
