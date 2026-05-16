import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ENDPOINTS } from '@common/constants';
import { CurrentSession, CurrentUser } from '@common/decorators';
import { AccessTokenGuard } from '@common/guards';
import type { AuthenticatedSession, AuthenticatedUser } from '@common/types';
import { SessionsService } from '@modules/auth/sessions/sessions.service';

@Controller(`${ENDPOINTS.AUTH.BASE}/${ENDPOINTS.AUTH.SESSIONS.BASE}`)
@ApiTags(`${ENDPOINTS.AUTH.BASE}/${ENDPOINTS.AUTH.SESSIONS.BASE}`)
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
export class SessionsController {
  constructor(private readonly authSessionsService: SessionsService) {}

  @Get(ENDPOINTS.AUTH.SESSIONS.LIST.ENDPOINT)
  @ApiOperation(ENDPOINTS.AUTH.SESSIONS.LIST.DOCKS)
  list(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentSession() session: AuthenticatedSession,
  ) {
    return this.authSessionsService.listForApplication(
      user.id,
      session.applicationId,
      session.id,
    );
  }

  @Delete(ENDPOINTS.AUTH.SESSIONS.REVOKE_OTHERS.ENDPOINT)
  @HttpCode(200)
  @ApiOperation(ENDPOINTS.AUTH.SESSIONS.REVOKE_OTHERS.DOCKS)
  async revokeOthers(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentSession() session: AuthenticatedSession,
  ) {
    const revokedCount = await this.authSessionsService.revokeOthers(
      user.id,
      session.applicationId,
      session.id,
    );

    return { revokedCount };
  }

  @Delete(ENDPOINTS.AUTH.SESSIONS.REVOKE_ONE.ENDPOINT)
  @HttpCode(200)
  @ApiOperation(ENDPOINTS.AUTH.SESSIONS.REVOKE_ONE.DOCKS)
  async revokeOne(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentSession() session: AuthenticatedSession,
  ) {
    await this.authSessionsService.revokeOne(
      user.id,
      session.applicationId,
      sessionId,
    );
    return { revoked: true };
  }
}
