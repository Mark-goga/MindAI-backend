import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '@modules/auth/auth.controller';
import { AuthService } from '@modules/auth/auth.service';
import { SessionsService } from '@modules/auth/sessions/sessions.service';
import { UsersService } from '@modules/users/users.service';

const mockUsersService = {
  findUserByEmail: vi.fn(),
  createUser: vi.fn(),
  findUserById: vi.fn(),
};

const mockSessionsService = {
  createOrReuse: vi.fn(),
  rotate: vi.fn(),
  revokeOne: vi.fn(),
};

export const mockAuthModule = async () => {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [AuthController],
    providers: [
      AuthService,
      {
        provide: UsersService,
        useValue: mockUsersService,
      },
      {
        provide: SessionsService,
        useValue: mockSessionsService,
      },
    ],
  }).compile();

  return {
    module,
    mockAuthService: module.get<AuthService>(AuthService),
    mockAuthController: module.get<AuthController>(AuthController),
    mockUsersService,
    mockSessionsService,
  };
};
