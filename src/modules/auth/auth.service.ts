import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { ERROR_MESSAGES } from '@common/constants';
import { AuthenticatedSession, AuthenticatedUser } from '@common/types';
import { LoginDto, RegisterDto } from './dto';
import { UsersRepository } from './repositories';
import { AuthSessionsService } from './services/auth-sessions.service';
import { buildSessionRequestContext, hashPassword, verifyPassword } from './utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly authSessionsService: AuthSessionsService,
  ) {}

  async register(dto: RegisterDto, request: FastifyRequest) {
    const existingUser = await this.usersRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException(ERROR_MESSAGES.USER.EMAIL_ALREADY_EXISTS);
    }

    const user = await this.usersRepository.create({
      email: dto.email,
      name: dto.name,
      passwordHash: hashPassword(dto.password),
    });

    const { session, tokens } = await this.authSessionsService.createOrReuse(
      user.id,
      buildSessionRequestContext(request, dto),
    );

    return this.buildAuthResponse(user, session, tokens);
  }

  async login(dto: LoginDto, request: FastifyRequest) {
    const user = await this.usersRepository.findByEmail(dto.email);
    if (!user || !verifyPassword(dto.password, user.passwordHash)) {
      throw new UnauthorizedException(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    const { session, tokens } = await this.authSessionsService.createOrReuse(
      user.id,
      buildSessionRequestContext(request, dto),
    );

    return this.buildAuthResponse(user, session, tokens);
  }

  async refresh(user: AuthenticatedUser, session: AuthenticatedSession, request: FastifyRequest) {
    const { session: rotatedSession, tokens } = await this.authSessionsService.rotate(session, {
      userAgent: request.headers['user-agent']?.trim() || null,
      ipAddress: request.ip || null,
    });

    return this.buildAuthResponse(user, rotatedSession, tokens);
  }

  me(user: AuthenticatedUser, session: AuthenticatedSession) {
    return {
      user: this.toPublicUser(user),
      session: this.toPublicSession(session, true),
    };
  }

  async logout(user: AuthenticatedUser, session: AuthenticatedSession) {
    await this.authSessionsService.revokeOne(user.id, session.applicationId, session.id);
    return { loggedOut: true };
  }

  private buildAuthResponse(
    user: AuthenticatedUser,
    session: AuthenticatedSession,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    return {
      user: this.toPublicUser(user),
      session: this.toPublicSession(session, true),
      tokens,
    };
  }

  private toPublicUser(user: AuthenticatedUser) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private toPublicSession(session: AuthenticatedSession, current: boolean) {
    return {
      id: session.id,
      applicationId: session.applicationId,
      platform: session.platform,
      deviceId: session.deviceId,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      createdAt: session.createdAt,
      lastUsedAt: session.lastUsedAt,
      expiresAt: session.expiresAt,
      current,
    };
  }
}
