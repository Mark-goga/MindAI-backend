import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ENDPOINTS } from '@common/constants';
import { CurrentSession, CurrentUser } from '@common/decorators';
import { AccessTokenGuard, RefreshTokenGuard } from '@common/guards';
import { SetRefreshTokenInterceptor } from '@common/interceptors';
import type {
  AuthenticatedRequest,
  AuthenticatedSession,
  AuthenticatedUser,
} from '@common/types';
import { LoginDto, RefreshDto, RegisterDto } from './dto';
import { AuthService } from './auth.service';

@Controller(ENDPOINTS.AUTH.BASE)
@ApiTags(ENDPOINTS.AUTH.BASE)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(ENDPOINTS.AUTH.REGISTER.ENDPOINT)
  @ApiOperation(ENDPOINTS.AUTH.REGISTER.DOCKS)
  @UseInterceptors(new SetRefreshTokenInterceptor())
  register(@Body() dto: RegisterDto, @Req() request: FastifyRequest) {
    return this.authService.register(dto, request);
  }

  @Post(ENDPOINTS.AUTH.LOGIN.ENDPOINT)
  @HttpCode(200)
  @ApiOperation(ENDPOINTS.AUTH.LOGIN.DOCKS)
  @UseInterceptors(new SetRefreshTokenInterceptor())
  login(@Body() dto: LoginDto, @Req() request: FastifyRequest) {
    return this.authService.login(dto, request);
  }

  @Post(ENDPOINTS.AUTH.REFRESH.ENDPOINT)
  @HttpCode(200)
  @ApiOperation(ENDPOINTS.AUTH.REFRESH.DOCKS)
  @UseGuards(RefreshTokenGuard)
  @UseInterceptors(new SetRefreshTokenInterceptor())
  refresh(
    @Body() _dto: RefreshDto,
    @CurrentUser() user: AuthenticatedUser,
    @CurrentSession() session: AuthenticatedSession,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.authService.refresh(user, session, request);
  }

  @Get(ENDPOINTS.AUTH.ME.ENDPOINT)
  @ApiBearerAuth()
  @ApiOperation(ENDPOINTS.AUTH.ME.DOCKS)
  @UseGuards(AccessTokenGuard)
  me(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentSession() session: AuthenticatedSession,
  ) {
    return this.authService.me(user, session);
  }

  @Post(ENDPOINTS.AUTH.LOGOUT.ENDPOINT)
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation(ENDPOINTS.AUTH.LOGOUT.DOCKS)
  @UseGuards(AccessTokenGuard)
  logout(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentSession() session: AuthenticatedSession,
  ) {
    return this.authService.logout(user, session);
  }
}
