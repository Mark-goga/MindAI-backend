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

| Module | Routes                                                                                                                                                                                         | Status      |
|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|
| health | `POST /health/status`                                                                                                                                                                          | Implemented |
| auth   | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me`, `POST /auth/logout`, `GET /auth/sessions`, `DELETE /auth/sessions/:sessionId`, `DELETE /auth/sessions/others` | Implemented |

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
4. **All env vars validated** — `CONFIG` from `common/constants/config.constant.ts`
5. **Path aliases** — always `@common/`, `@modules/`, `@app/` instead of relative paths
6. **Refresh token goes in request body** — refresh flow is body-based for cross-platform clients; cookie is optional
   convenience for web

## Documentation files

| File                   | Contents                                             |
|------------------------|------------------------------------------------------|
| `OVERVIEW.md`          | This file — stack, commands, key patterns            |
| `ARCHITECTURE.md`      | Folder structure, where code belongs, path aliases   |
| `HOW_TO_ADD_MODULE.md` | Step-by-step guide for creating a new feature module |
