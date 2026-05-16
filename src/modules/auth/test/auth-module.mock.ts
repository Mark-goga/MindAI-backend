import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '@modules/auth/auth.service';
import { UserService } from '@modules/user/user.service';
import { mockUserService, mongooseTestModule } from '@common/test';
import { RolesModule } from '@modules/user/roles/roles.module';
import { AuthController } from '@modules/auth/auth.controller';
import { mockJwtUtils } from '@common/test/mocks/services-and-libs/jwt-utils.mock';
import { JwtUtils } from '@modules/auth/jwt/jwt.utils';

export const mockAuthModule = async () => {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [AuthController],
    providers: [
      AuthService,
      {
        provide: UserService,
        useValue: mockUserService,
      },
      {
        provide: JwtUtils,
        useValue: mockJwtUtils,
      },
    ],
    imports: [mongooseTestModule(), RolesModule],
  }).compile();

  return {
    module,
    mockAuthService: module.get<AuthService>(AuthService),
    mockAuthController: module.get<AuthController>(AuthController),
  };
};
