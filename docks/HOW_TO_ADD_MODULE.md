# How to Add a New Module

Step-by-step reference for creating a feature module from scratch.
Use `health` module as the reference implementation.

---

## 1. Create folder structure

```
src/modules/<feature>/
├── <feature>.module.ts
├── <feature>.controller.ts
├── <feature>.service.ts
├── <feature>.controller.spec.ts
├── <feature>.service.spec.ts
└── dto/
    └── index.ts
```

---

## 2. Add endpoint constants

In `src/common/constants/endpoints.constants.ts`:

```typescript
export const ENDPOINTS = {
  HEALTH: { ... },           // existing

  USERS: {                   // add new
    BASE: 'users',
    CREATE: {
      ENDPOINT: '',
      DOCKS: { summary: 'Create user', description: 'Register a new user' },
    },
    FIND_ONE: {
      ENDPOINT: ':id',
      DOCKS: { summary: 'Get user by id' },
    },
  },
} as const;
```

---

## 3. Create DTOs

`src/modules/<feature>/dto/create-<entity>.dto.ts`:

```typescript
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
```

`src/modules/<feature>/dto/index.ts`:

```typescript
export { CreateUserDto } from './create-user.dto';
```

---

## 4. Create the service

`src/modules/<feature>/<feature>.service.ts`:

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { ERROR_MESSAGES } from '@common/constants';
import { CreateUserDto } from '@modules/users/dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectPinoLogger(UsersService.name)
    private readonly logger: PinoLogger,
  ) {}

  async create(dto: CreateUserDto) {
    this.logger.info({ email: dto.email }, 'Creating user');
    // ... DB logic
    return { id: '1', ...dto };
  }

  async findById(id: string) {
    // ... DB lookup
    if (!user) throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    return user;
  }
}
```

---

## 5. Create the controller

`src/modules/<feature>/<feature>.controller.ts`:

```typescript
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ENDPOINTS } from '@common/constants';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto';

@Controller(ENDPOINTS.USERS.BASE)
@ApiTags(ENDPOINTS.USERS.BASE)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post(ENDPOINTS.USERS.CREATE.ENDPOINT)
  @ApiOperation(ENDPOINTS.USERS.CREATE.DOCKS)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get(ENDPOINTS.USERS.FIND_ONE.ENDPOINT)
  @ApiOperation(ENDPOINTS.USERS.FIND_ONE.DOCKS)
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
```

---

## 6. Create the module

`src/modules/<feature>/<feature>.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  // exports: [UsersService],  ← add if other modules need UsersService
})
export class UsersModule {}
```

---

## 7. Register in AppModule

`src/app.module.ts`:

```typescript
import { UsersModule } from '@modules/users/users.module';

@Module({
  imports: [
    LoggerModule.forRootAsync({ ... }),
    HealthModule,
    UsersModule,   // ← add here
  ],
})
export class AppModule {}
```

---

## 8. Write tests

`<feature>.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { createBaseTestSuits } from '@common/test/utils';

createBaseTestSuits();

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const result = await service.create({ email: 'a@b.com', name: 'Alice' });
    expect(result.email).toBe('a@b.com');
  });
});
```

---

## Checklist

- [ ] Folder created under `src/modules/<feature>/`
- [ ] `ENDPOINTS.<FEATURE>` added to `endpoints.constants.ts`
- [ ] DTOs created with Zod + `createZodDto`
- [ ] `dto/index.ts` exports all DTOs
- [ ] Service has only business logic (no HTTP concerns)
- [ ] Controller uses `ENDPOINTS` constants (no inline strings)
- [ ] Module file registers controller + providers
- [ ] Module imported in `app.module.ts`
- [ ] Unit tests for service and controller
- [ ] No types/utils duplicated from `common/`
- [ ] Error messages added to `ERROR_MESSAGES` constant
