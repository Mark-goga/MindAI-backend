# Architecture

## Folder Structure

```
src/
├── main.ts                         # Bootstrap: Fastify, plugins, global pipes/interceptors, Swagger
├── app.module.ts                   # Root module: imports all feature modules + LoggerModule
│
├── common/                         # Shared across ALL modules — NO business logic here
│   ├── constants/
│   │   ├── config.constant.ts      # Zod-validated env config → export CONFIG, NODE_ENV
│   │   ├── endpoints.constants.ts  # All route strings & Swagger metadata → export ENDPOINTS
│   │   ├── error-messages.constants.ts  # All error message strings → export ERROR_MESSAGES
│   │   └── index.ts
│   ├── database/                   # DB connection setup (TypeORM/Prisma config)
│   ├── decorators/                 # Custom NestJS decorators (@CurrentUser, @IsPublic, etc.)
│   ├── dto/                        # DTOs shared by 2+ modules (e.g. PaginationDto)
│   ├── entity/                     # Base entities / shared entities
│   ├── guards/                     # Auth guards used globally or by many modules
│   ├── interceptors/               # Global interceptors (already: Global, FileResponse, SetRefreshToken)
│   ├── types/                      # Global TypeScript types/interfaces (no class, pure types)
│   ├── utils/                      # Pure utility functions (no NestJS DI, no side effects)
│   └── test/
│       ├── utils/                  # Test helper functions
│       └── mocks/
│           ├── constants/          # Constant mocks for tests
│           └── services-and-libs/  # Service/library mocks
│
└── modules/                        # Feature modules — each module is self-contained
    └── health/                     # Reference implementation
        ├── health.module.ts
        ├── health.controller.ts
        ├── health.service.ts
        ├── health.controller.spec.ts
        ├── health.service.spec.ts
        └── dto/
            ├── health-status.dto.ts
            └── index.ts
```

---

## Module Structure

Every feature module follows this pattern:

```
modules/<feature>/
├── <feature>.module.ts         # Imports, providers, exports, controllers
├── <feature>.controller.ts     # HTTP layer only: routes, decorators, calls service
├── <feature>.service.ts        # Business logic
├── <feature>.controller.spec.ts
├── <feature>.service.spec.ts
├── dto/                        # DTOs specific to this module
│   ├── <action>-<entity>.dto.ts
│   └── index.ts
├── entity/                     # Entities specific to this module (if needed)
│   └── index.ts
└── types/                      # Types specific to this module (if needed)
    └── index.ts
```

### Sub-modules

If a module becomes large, extract sub-modules:

```
modules/<feature>/
├── <feature>.module.ts
└── sub-modules/
    └── <sub-feature>/
        ├── <sub-feature>.module.ts
        ├── <sub-feature>.controller.ts
        ├── <sub-feature>.service.ts
        └── dto/
```

---

## Where Does Code Belong?

### → `common/`

Put here if:
- Used by **2 or more** modules
- Pure infrastructure (guards, interceptors, decorators)
- Global constants and configuration

Examples: `PaginationDto`, `AuthGuard`, `@CurrentUser()` decorator, `formatDate()` util

### → `modules/<feature>/`

Put here if:
- Used only by **this one module**
- Contains business logic for this feature

Examples: `CreateUserDto`, `UserEntity`, `UsersService`

### → `modules/<feature>/sub-modules/<sub>/`

Put here if:
- The parent module has grown large (3+ controllers or 5+ services)
- The sub-feature has its own DTOs, entities, and logic
- The sub-feature can be tested independently

### Decision tree

```
Is this used by more than one module?
├── YES → common/
└── NO → Is the parent module getting large?
          ├── YES → sub-module
          └── NO  → module-level file
```

---

## Path Aliases

Always use path aliases — never relative `../../`:

| Alias | Resolves to |
|-------|-------------|
| `@app/*` | `src/*` |
| `@common/*` | `src/common/*` |
| `@modules/*` | `src/modules/*` |

```typescript
// Correct
import { CONFIG } from '@common/constants';
import { HealthService } from '@modules/health/health.service';

// Wrong
import { CONFIG } from '../../common/constants';
```

---

## Response Format

All API responses are wrapped automatically by `GlobalInterceptor`:

```json
{
  "success": true,
  "data": {
    ...
  }
}
```

Services return plain data — **never wrap manually**. The interceptor handles it.

Exception: `StreamableFile` (file downloads) bypasses the wrapper.
