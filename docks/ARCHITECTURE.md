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
│   ├── database/
│   │   ├── database.module.ts      # Global DatabaseModule (imported once in AppModule)
│   │   ├── database.service.ts     # Exposes db: AppDatabase (Drizzle instance)
│   │   ├── schema/
│   │   │   ├── enums.schema.ts     # All pgEnums + as-const arrays + TS types (single source of truth)
│   │   │   ├── users.schema.ts     # users table definition
│   │   │   ├── sessions.schema.ts  # sessions table definition
│   │   │   ├── releases.schema.ts  # releases table definition
│   │   │   └── index.ts            # Re-exports everything from schema files
│   │   └── seed-data/
│   │       ├── seed-shared.ts      # SeedContext, SeedDb types, createSeedContext()
│   │       ├── seed-constants.ts   # Shared seed constants (apps, quantities, etc.)
│   │       ├── seed-users.ts       # Seed script for users table
│   │       ├── seed-sessions.ts    # Seed script for sessions table
│   │       ├── seed-releases.ts    # Seed script for releases table
│   │       ├── seed-runner.ts      # CLI entry: yarn db:seed <target>
│   │       └── seed.ts             # Programmatic entry: runs all seeders in order
│   ├── decorators/                 # Custom NestJS decorators (@CurrentUser, @CurrentSession, etc.)
│   ├── dto/                        # DTOs shared by 2+ modules (e.g. PaginationDto)
│   ├── entity/                     # Base entities / shared entities
│   ├── guards/
│   │   ├── access-token.guard.ts   # Validates JWT access token, sets request.user + request.session
│   │   ├── refresh-token.guard.ts  # Validates JWT refresh token from cookie
│   │   ├── admin.guard.ts          # Checks request.user.role === 'admin' (use after AccessTokenGuard)
│   │   └── index.ts
│   ├── interceptors/               # Global interceptors (GlobalInterceptor, FileResponse, SetRefreshToken)
│   ├── types/                      # Global TypeScript types/interfaces (no class, pure types)
│   ├── utils/                      # Pure utility functions (no NestJS DI, no side effects)
│   └── test/
│       ├── utils/                  # Test helper functions
│       └── mocks/
│           ├── constants/          # Constant mocks for tests
│           └── services-and-libs/  # Service/library mocks
│
└── modules/                        # Feature modules — each module is self-contained
    ├── health/                     # Minimal reference implementation (no DB, no auth)
    │   ├── health.module.ts
    │   ├── health.controller.ts
    │   ├── health.service.ts
    │   ├── health.controller.spec.ts
    │   ├── health.service.spec.ts
    │   └── dto/
    ├── auth/                       # Auth + stateful sessions
    │   ├── auth.module.ts
    │   ├── auth.controller.ts
    │   ├── auth.service.ts
    │   ├── dto/
    │   │   ├── login.dto.ts
    │   │   ├── register.dto.ts
    │   │   ├── refresh.dto.ts
    │   │   ├── session-context.schema.ts
    │   │   └── index.ts
    │   ├── sessions/               # Sub-module: session management
    │   │   ├── sessions.module.ts
    │   │   ├── sessions.controller.ts
    │   │   ├── sessions.service.ts
    │   │   └── sessions.repository.ts
    │   ├── utils/
    │   │   ├── password.util.ts
    │   │   ├── token-hash.util.ts
    │   │   ├── request-session-context.util.ts
    │   │   └── index.ts
    │   └── test/
    ├── releases/                   # App version management
    │   ├── releases.module.ts
    │   ├── releases.controller.ts
    │   ├── releases.service.ts
    │   ├── releases.repository.ts
    │   └── dto/
    │       ├── create-release.dto.ts
    │       ├── check-version.dto.ts
    │       ├── list-releases.dto.ts
    │       └── index.ts
    └── users/                      # User lookups (internal, no controller)
        ├── users.module.ts
        ├── users.service.ts
        └── users.repository.ts
```

---

## Module Structure

Every feature module with DB access follows this pattern:

```
modules/<feature>/
├── <feature>.module.ts         # Imports, providers, exports, controllers
├── <feature>.controller.ts     # HTTP layer only: routes, decorators, calls service
├── <feature>.service.ts        # Business logic
├── <feature>.repository.ts     # DB access only (Drizzle queries)
├── <feature>.controller.spec.ts
├── <feature>.service.spec.ts
└── dto/
    ├── <action>-<entity>.dto.ts
    └── index.ts
```

### Sub-modules

If a module becomes large, extract sub-modules:

```
modules/<feature>/
├── <feature>.module.ts
└── <sub-feature>/
    ├── <sub-feature>.module.ts
    ├── <sub-feature>.controller.ts
    ├── <sub-feature>.service.ts
    ├── <sub-feature>.repository.ts
    └── dto/
```

---

## Database Schema

### Schema files

All table definitions live in `src/common/database/schema/`. Each table gets its own file.

### Enums — single source of truth

All Drizzle `pgEnum`s are defined in `enums.schema.ts` with a companion `as const` array and a TypeScript type:

```typescript
// enums.schema.ts
export const PLATFORM_VALUES = ['ios', 'android', 'desktop_win', 'desktop_mac', 'web'] as const;
export type Platform = (typeof PLATFORM_VALUES)[number];
export const platformEnum = pgEnum('platform', PLATFORM_VALUES);

export const USER_ROLE_VALUES = ['admin', 'customer'] as const;
export type UserRole = (typeof USER_ROLE_VALUES)[number];
export const userRoleEnum = pgEnum('user_role', USER_ROLE_VALUES);
```

Use `PLATFORM_VALUES` in Zod schemas (`z.enum(PLATFORM_VALUES)`), the `Platform` type in TypeScript code, and
`platformEnum` in Drizzle table definitions. Never hardcode the values anywhere else.

### Adding a new table

1. If the table needs enum columns → add the enum to `enums.schema.ts` first
2. Create `src/common/database/schema/<table>.schema.ts`
3. Export from `src/common/database/schema/index.ts`
4. Run `yarn db:generate` to produce a migration
5. **Create a seed script** — see [Seed Scripts](#seed-scripts) below

### Migrations

Generated SQL lives in `drizzle/`. Always produce one migration per logical change:

```bash
yarn db:generate   # reads schema/, compares to last snapshot, writes SQL
yarn db:migrate    # applies pending migrations to the database
```

---

## Seed Scripts

**Every table that has a schema file must have a seed script.**

### File location

```
src/common/database/seed-data/
├── seed-shared.ts       # SeedContext + createSeedContext()
├── seed-<table>.ts      # One file per table
├── seed-runner.ts       # CLI: yarn db:seed <target>
└── seed.ts              # Programmatic: runs all seeders in order
```

### Anatomy of a seed file

```typescript
// seed-<table>.ts
import { myTable } from '@common/database/schema';
import type { SeedContext } from './seed-shared';

export async function seedMyTable(context: SeedContext): Promise<number> {
  console.log('Seeding my_table...');
  await context.db.insert(myTable).values([...]).onConflictDoNothing();
  return count;
}
```

### Registering a new seeder

After creating `seed-<table>.ts`, add it to **both** entry points:

**`seed.ts`** (programmatic, runs everything):

```typescript
const users = await seedUsers(context);
await seedSessions(context, users);
await seedMyTable(context);   // ← add here
```

**`seed-runner.ts`** (CLI, supports individual targets):

```typescript
const seeders = {
  ..., myTable: async () => {
    const context = createSeedContext();
    try {
      await seedMyTable(context);
    } finally {
      await context.close();
    }
  }, all: async () => {
    // add seedMyTable(context) here too
  },
};
```

---

## Where Does Code Belong?

### → `common/`

Put here if:

- Used by **2 or more** modules
- Pure infrastructure (guards, interceptors, decorators)
- Global constants and configuration
- Database schema and seed scripts

Examples: `PaginationDto`, `AdminGuard`, `@CurrentUser()` decorator, `formatDate()` util, `platformEnum`

### → `modules/<feature>/`

Put here if:

- Used only by **this one module**
- Contains business logic for this feature

Examples: `CreateReleaseDto`, `ReleasesService`, `ReleasesRepository`

### → `modules/<feature>/<sub-feature>/`

Put here if:

- The parent module has grown large (3+ controllers or 5+ services)
- The sub-feature has its own DTOs, repository, and logic
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

## Guards

| Guard               | Location        | Usage                                                                    |
|---------------------|-----------------|--------------------------------------------------------------------------|
| `AccessTokenGuard`  | `common/guards` | Validates Bearer token, sets `request.user/session`                      |
| `RefreshTokenGuard` | `common/guards` | Validates refresh token from cookie                                      |
| `AdminGuard`        | `common/guards` | Checks `request.user.role === 'admin'`, use **after** `AccessTokenGuard` |

```typescript
// Admin-only endpoint
@UseGuards(AccessTokenGuard, AdminGuard)
```

---

## Path Aliases

Always use path aliases — never relative `../../`:

| Alias        | Resolves to     |
|--------------|-----------------|
| `@app/*`     | `src/*`         |
| `@common/*`  | `src/common/*`  |
| `@modules/*` | `src/modules/*` |

```typescript
// Correct
import { CONFIG } from '@common/constants';
import { ReleasesService } from '@modules/releases/releases.service';

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
