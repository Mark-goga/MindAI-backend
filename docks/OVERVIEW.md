# Project Overview

## Stack

| Layer           | Technology                               |
|-----------------|------------------------------------------|
| Framework       | NestJS 11                                |
| HTTP Server     | Fastify 5                                |
| Language        | TypeScript 6                             |
| Validation      | Zod 4 + nestjs-zod                       |
| Logging         | nestjs-pino + pino-pretty                |
| API Docs        | @nestjs/swagger (Swagger UI at `/api`)   |
| File handling   | exceljs + file-type + @fastify/multipart |
| Database        | PostgreSQL + Drizzle ORM + drizzle-kit   |
| Auth            | jsonwebtoken + stateful refresh sessions |
| Testing         | Vitest + @nestjs/testing + supertest     |
| Package manager | Yarn                                     |

## Running the project

```bash
yarn dev          # development with watch
yarn start:prod   # production
yarn build        # compile TypeScript
yarn db:generate  # generate SQL migrations from Drizzle schema
yarn db:migrate   # apply SQL migrations to PostgreSQL
yarn db:seed      # seed all tables (users, sessions, releases)
```

### Seed targets

The seed runner supports individual targets:

```bash
yarn db:seed users     # seed only users
yarn db:seed sessions  # seed users + sessions
yarn db:seed releases  # seed only releases
yarn db:seed all       # seed everything (default)
```

## Environment

Minimum required `.env` (see `.env.example`):

```
PORT=3000
NODE_ENV=dev
DATABASE_URL=postgres://postgres:postgres@localhost:5432/mindai_backend
JWT_ACCESS_SECRET=dev-access-secret-dev-access-secret
JWT_REFRESH_SECRET=dev-refresh-secret-dev-refresh-secret
```

All env vars are validated at startup via Zod. If a required var is missing, the process exits immediately.

## Current modules

| Module   | Routes                                                                                                                                                                                          | Status      |
|----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|
| health   | `GET /health/status`                                                                                                                                                                            | Implemented |
| auth     | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me`, `POST /auth/logout`, `GET /auth/sessions`, `DELETE /auth/sessions/:sessionId`, `DELETE /auth/sessions/others` | Implemented |
| releases | `GET /releases/check`, `POST /releases`, `GET /releases`, `DELETE /releases/:id`                                                                                                                | Implemented |

## Testing

```bash
yarn test         # unit tests
yarn test:e2e     # end-to-end tests
yarn test:cov     # coverage report
yarn test:watch   # watch mode
```

## Key patterns to know before developing

1. **All responses are wrapped** — `GlobalInterceptor` adds `{ success: true, data: ... }` automatically
2. **All DTOs use Zod** — via `createZodDto`, validated globally by `ZodValidationPipe`
3. **All routes defined in constants** — `ENDPOINTS` in `common/constants/endpoints.constants.ts`
4. **All error messages defined in constants** — `ERROR_MESSAGES` in `common/constants/error-messages.constants.ts`
5. **All env vars validated** — `CONFIG` from `common/constants/config.constant.ts`
6. **Path aliases** — always `@common/`, `@modules/`, `@app/` instead of relative paths
7. **Enums live in one place** — `common/database/schema/enums.schema.ts` exports both the Drizzle `pgEnum` and a `as const` array (e.g. `PLATFORM_VALUES`) for reuse in Zod schemas and TypeScript types
8. **Every table has a seed script** — `common/database/seed-data/seed-<table>.ts`, registered in both `seed.ts` and `seed-runner.ts`
9. **Repository pattern** — DB access lives in `<feature>.repository.ts`, never directly in services
10. **Refresh token in cookie** — set via `SetRefreshTokenInterceptor`, read from `request.cookies.refreshToken` on refresh

## Documentation files

| File                   | Contents                                             |
|------------------------|------------------------------------------------------|
| `OVERVIEW.md`          | This file — stack, commands, key patterns            |
| `ARCHITECTURE.md`      | Folder structure, where code belongs, path aliases   |
| `HOW_TO_ADD_MODULE.md` | Step-by-step guide for creating a new feature module |
